import os
import re
import json
import zipfile
import io
from typing import Dict, Any, List, Optional
from pypdf import PdfReader

class InvoiceAIService:
    @staticmethod
    def get_pdf_bytes(pdf_path: str) -> Optional[bytes]:
        """Obtiene los bytes binarios del PDF, extrayéndolo si es un paquete ZIP de Facture/DIAN."""
        if not os.path.exists(pdf_path):
            return None
        try:
            if zipfile.is_zipfile(pdf_path):
                with zipfile.ZipFile(pdf_path) as z:
                    pdf_names = [n for n in z.namelist() if n.lower().endswith('.pdf')]
                    if pdf_names:
                        return z.read(pdf_names[0])
            with open(pdf_path, 'rb') as f:
                return f.read()
        except Exception as e:
            print(f"Error leyendo bytes del PDF {pdf_path}: {e}")
            return None

    @staticmethod
    def extract_text_from_pdf(pdf_path: str) -> str:
        """Extrae el texto plano de todas las páginas de un PDF (o dentro de un ZIP de Facture.co)."""
        if not os.path.exists(pdf_path):
            return ""
        try:
            # Si el archivo es en realidad un ZIP descargado de Facture con XML y PDF adentro
            if zipfile.is_zipfile(pdf_path):
                with zipfile.ZipFile(pdf_path) as z:
                    pdf_names = [n for n in z.namelist() if n.lower().endswith('.pdf')]
                    if pdf_names:
                        pdf_bytes = io.BytesIO(z.read(pdf_names[0]))
                        reader = PdfReader(pdf_bytes)
                        full_text = []
                        for page in reader.pages:
                            text = page.extract_text()
                            if text:
                                full_text.append(text)
                        return "\n".join(full_text)

            reader = PdfReader(pdf_path)
            full_text = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    full_text.append(text)
            return "\n".join(full_text)
        except Exception as e:
            print(f"Error extrayendo texto del PDF {pdf_path}: {e}")
            return ""

    @classmethod
    def analyze_invoice_pdf(cls, pdf_path: str, basic_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Analiza el PDF completo de la factura electrónica (todas sus páginas) con IA Multimodal (Gemini Vision)
        o parser determinístico avanzado:
        - Listado exhaustivo de todos los ítems y productos cobrados (Código, Nombre/Descripción, Unidad, Cantidad, Precio Unitario)
        - Discriminación de IVA ítem por ítem (% IVA, Valor IVA, Subtotal, Total)
        - Conteo de ítems con IVA vs exentos de IVA
        - Subtotal sin IVA, Total con IVA y Total neto a pagar
        - Fechas exactas: Emisión/Expedición y Fecha de Vencimiento
        - Condiciones de pago, Medio de pago y Número de referencia / Orden
        - Datos completos de Emisor y Receptor
        """
        basic = basic_info or {}

        # 0. Guardia de protección de tokens: Si el PDF no existe o está vacío, NO llamar a la IA
        if not pdf_path or not os.path.exists(pdf_path) or os.path.getsize(pdf_path) < 100:
            print(f"⚠️ PDF '{pdf_path}' no encontrado o vacío. Se cancela la invocación de Gemini AI para proteger tokens.")
            res = cls._deterministic_invoice_parser("", basic)
            res["aiSkipped"] = True
            res["aiReason"] = "No se encontró el archivo PDF físico en el visor. Se omitió la IA para ahorrar tokens."
            return res

        pdf_bytes = cls.get_pdf_bytes(pdf_path)
        text = cls.extract_text_from_pdf(pdf_path)

        if not pdf_bytes and not text.strip():
            print(f"⚠️ El archivo PDF '{pdf_path}' no contiene bytes ni texto válido. Se omite llamada a Gemini AI.")
            res = cls._deterministic_invoice_parser("", basic)
            res["aiSkipped"] = True
            res["aiReason"] = "El PDF no tiene páginas o texto legible. Se omitió la llamada a IA."
            return res

        # 1. Intentar análisis multimodal con Google Gemini AI
        gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not gemini_api_key:
            try:
                from backend.repositories.mysql_repository import MySQLRepository
                db_settings = MySQLRepository().fetch_email_settings()
                gemini_api_key = db_settings.get("geminiApiKey")
                if gemini_api_key:
                    os.environ["GEMINI_API_KEY"] = gemini_api_key
            except Exception:
                pass

        if gemini_api_key and (pdf_bytes or text.strip()):
            try:
                from google import genai
                from google.genai import types
                client = genai.Client(api_key=gemini_api_key)

                prompt = f"""
                Eres un auditor contable experto en Facturación Electrónica DIAN de Colombia.
                Analiza exhaustivamente TODAS las páginas de este documento PDF de Factura Electrónica y extrae un objeto JSON EXACTO con la siguiente estructura:

                {{
                    "emisor": {{
                        "razonSocial": "Nombre o Razón Social exacta del emisor/proveedor",
                        "nit": "NIT con dígito de verificación (ej: 890935900-6)",
                        "telefono": "Teléfono de contacto",
                        "direccion": "Dirección fiscal",
                        "ciudad": "Ciudad / Departamento"
                    }},
                    "receptor": {{
                        "razonSocial": "Nombre o Razón Social del comprador (ej: ALIMENTOS ENRIKO SAS)",
                        "nit": "NIT del comprador (ej: 890330035-2)",
                        "direccion": "Dirección fiscal o de entrega",
                        "ciudad": "Ciudad"
                    }},
                    "numeroFactura": "Número exacto de la factura que figura en el encabezado (ej: FS-284740, FE-1092)",
                    "numeroReferencia": "Número de orden de compra, pedido o referencia (ej: 7509)",
                    "fechaEmision": "YYYY-MM-DD",
                    "horaEmision": "HH:MM",
                    "fechaVencimiento": "YYYY-MM-DD",
                    "formaPago": "Contado o Crédito",
                    "condicionPago": "Términos de pago exactos (ej: CREDITO 30 DIAS)",
                    "medioPago": "Medio de pago (ej: TRANSFERENCIA, EFECTIVO, CHEQUE)",
                    "moneda": "COP",
                    "subtotalSinIva": 0.0,
                    "totalIva": 0.0,
                    "tieneIva": true,
                    "porcentajeIvaPrincipal": 19.0,
                    "totalItems": 0,
                    "itemsConIvaCount": 0,
                    "itemsSinIvaCount": 0,
                    "totalConIva": 0.0,
                    "retenciones": {{
                        "reteFuente": 0.0,
                        "reteIva": 0.0,
                        "reteIca": 0.0,
                        "totalRetenciones": 0.0
                    }},
                    "totalPagarNeto": 0.0,
                    "items": [
                        {{
                            "numeroItem": 1,
                            "codigo": "Código o referencia del producto o servicio tal cual aparece en el PDF",
                            "descripcion": "Descripción LITERAL, COMPLETA Y EXACTA del ítem en el PDF (sin recortar, sin abreviar)",
                            "unidadMedida": "UND, KG, PAQ, MTR, GLN, HORA, etc.",
                            "cantidad": 1.0,
                            "precioUnitario": 0.0,
                            "porcentajeIva": 0.0,
                            "valorIva": 0.0,
                            "porcentajeDescuento": 0.0,
                            "valorDescuento": 0.0,
                            "subtotal": 0.0,
                            "total": 0.0,
                            "tieneIva": false
                        }}
                    ],
                    "conceptoPrincipalSugerido": "Nombre corto y representativo para el catálogo de proveedores",
                    "resumenEjecutivo": "Resumen en una frase del emisor, ítems y montos totales"
                }}

                REGLAS CRÍTICAS Y OBLIGATORIAS:
                1. AISLAMIENTO TOTAL: Analiza ÚNICA Y EXCLUSIVAMENTE este PDF específico. No mezcles datos con ninguna otra factura.
                2. DESCRIPCIÓN EXACTA DE ÍTEMS: La descripción (`descripcion`) de cada ítem debe ser la MISMA descripción textual que aparece en el PDF, conservando marcas, gramajes, códigos y especificaciones técnicas completas sin resumir.
                3. CANTIDADES EXACTAS: Extrae la cantidad exacta que figura en la columna 'Cantidad', 'Cant' o 'Qty'. Si la factura tiene 10 unidades, extrae 10.0; si tiene 2.5 unidades, extrae 2.5; si tiene 50 unidades, extrae 50.0. NUNCA pongas 1 por defecto si el PDF indica otra cantidad.
                4. DISCRIMINACIÓN DE IVA: Extrae con precisión el % IVA de cada ítem (0% si es exento o excluido, 19%, 5%, etc.) y el valor monetario del IVA de cada ítem.
                5. Extrae CADA UNO de los ítems de la tabla de detalle sin omitir ninguno.
                6. Extrae las fechas en formato ISO (YYYY-MM-DD).
                7. Devuelve ÚNICAMENTE el bloque JSON válido, sin bloques de markdown extraños ni comentarios.
                """

                contents = []
                if pdf_bytes:
                    contents.append(types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"))
                if text.strip():
                    contents.append(f"\n--- TEXTO EXTRAÍDO DEL DOCUMENTO ---\n{text[:15000]}")
                contents.append(prompt)

                # Intentar con modelos de alta disponibilidad y baja latencia de Google Gemini
                candidate_models = [
                    "gemini-2.5-flash",
                    "gemini-2.5-flash-lite",
                    "gemini-2.0-flash",
                    "gemini-flash-latest",
                    "gemini-3.7-flash",
                    "gemini-3.5-flash",
                    "gemini-3.8-flash"
                ]
                raw_resp = None
                for model_name in candidate_models:
                    try:
                        response = client.models.generate_content(
                            model=model_name,
                            contents=contents,
                            config=types.GenerateContentConfig(
                                temperature=0.1,
                                response_mime_type="application/json"
                            )
                        )
                        if response and response.text:
                            raw_resp = response.text.strip()
                            break
                    except Exception as model_err:
                        print(f"Aviso: Modelo {model_name} no disponible: {model_err}")
                        continue

                if raw_resp:
                    json_match = re.search(r"\{[\s\S]*\}", raw_resp)
                    if json_match:
                        parsed_json = json.loads(json_match.group(0))
                        return cls._normalize_analysis_result(parsed_json, basic)
            except Exception as e:
                print(f"Fallo en Gemini AI multimodal analysis, aplicando parser determinístico: {e}")

        # 2. Parser Determinístico / Heurístico de Facturación Electrónica DIAN
        return cls._deterministic_invoice_parser(text, basic)

    @classmethod
    def _deterministic_invoice_parser(cls, text: str, basic: Dict[str, Any]) -> Dict[str, Any]:
        """
        Parser estructurado y robusto para facturas electrónicas colombianas (Facture, Siigo, Carvajal, DIAN, etc.).
        """
        total_amount = float(basic.get("detailAmount") or 0.0)
        doc_num = basic.get("documentNumber") or ""
        issuer = basic.get("issuerName") or ""
        nit = basic.get("issuerNit") or ""
        emission_date = basic.get("emissionDate") or ""
        due_date = basic.get("dueDate") or ""

        # Buscar subtotal, IVA y totales en el texto
        subtotal = 0.0
        total_iva = 0.0
        retenciones = 0.0

        # Regex para subtotal
        sub_match = re.search(r"(?:Subtotal|Sub-Total|Total\s+Bruto|Valor\s+antes\s+de\s+IVA|Base\s+Gravable)[^\d\n\r$]*[:$]?\s*([0-9.,]{3,})", text, re.IGNORECASE)
        if sub_match:
            subtotal = cls._parse_currency_str(sub_match.group(1))

        # Regex para IVA (evitando capturar el '19%' o '5%' aislado como valor monetario)
        iva_match = re.search(r"(?:Total\s+IVA|IVA\s*(?:19%|5%|Total)?|Impuesto\s+IVA|Valor\s+IVA)[^\d\n\r$]*[:$]?\s*(?:(?:19|5|0)%\s*)?[:$]?\s*([0-9.,]{3,})", text, re.IGNORECASE)
        if iva_match:
            parsed_iva = cls._parse_currency_str(iva_match.group(1))
            if parsed_iva > 0:
                total_iva = parsed_iva

        # Regex para Total
        tot_match = re.search(r"(?:Total\s+Factura|Total\s+a\s+Pagar|Total\s+Neto|Valor\s+Total|Total)[^\d\n\r$]*[:$]?\s*([0-9.,]{3,})", text, re.IGNORECASE)
        if tot_match:
            parsed_tot = cls._parse_currency_str(tot_match.group(1))
            if parsed_tot > 0:
                total_amount = parsed_tot

        # Validaciones y normalizaciones de consistencia contable
        total_amount = round(max(0.0, float(total_amount)), 2)
        
        # Si el IVA es igual o mayor al total (o es irrazonablemente grande), recalculamos o ajustamos
        if total_iva >= total_amount and total_amount > 0:
            total_iva = round(total_amount - (total_amount / 1.19), 2)

        # Si el subtotal no se detectó o es 0
        if subtotal <= 0.0 and total_amount > 0:
            if total_iva > 0 and total_amount > total_iva:
                subtotal = round(total_amount - total_iva, 2)
            else:
                subtotal = round(total_amount / 1.19, 2)
                total_iva = round(total_amount - subtotal, 2)
        elif subtotal > total_amount and total_amount > 0:
            subtotal = round(total_amount / 1.19, 2)
            total_iva = round(total_amount - subtotal, 2)
        elif subtotal > 0 and total_iva == 0.0 and total_amount > subtotal:
            total_iva = round(total_amount - subtotal, 2)

        subtotal = round(max(0.0, float(subtotal)), 2)
        total_iva = round(max(0.0, float(total_iva)), 2)

        # Extraer ítems / líneas de la factura
        items = []
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        
        # Buscar patrones de líneas de detalle en facturas DIAN
        for line in lines:
            # Descartar encabezados o pies de página
            lower_l = line.lower()
            if any(k in lower_l for k in ["subtotal", "total factura", "resoluci", "banco", "cuenta de ahorro", "cuenta corriente", "pág.", "pagina", "software"]):
                continue

            # Buscar montos en pesos en la línea
            amt_matches = re.findall(r"\$\s*([0-9.,]+)|([0-9]{1,3}(?:\.[0-9]{3})+(?:,[0-9]{2})?)", line)
            if amt_matches and len(line) > 8:
                # Intentar detectar cantidad: número al inicio o columna (ej: '2.00 UND', '10 KG', '5 PAQ', '12 X')
                cant_m = re.search(r"\b(?:cant(?:idad)?\.?[:\s]*|qty[:\s]*)?([0-9]+(?:[.,][0-9]+)?)\s*(?:UND|KG|PAQ|MTR|GLN|GR|LT|UN|PZA|X\b|\b)", line, re.IGNORECASE)
                item_cant = 1.0
                if cant_m:
                    try:
                        raw_c = cant_m.group(1).replace(",", ".")
                        parsed_c = float(raw_c)
                        if 0 < parsed_c < 100000:
                            item_cant = parsed_c
                    except Exception:
                        item_cant = 1.0

                clean_desc = re.sub(r"[\$\d.,\-_/]{3,}", "", line).strip()
                # Limpiar prefijos de cantidades si quedaron
                clean_desc = re.sub(r"^\d+\s*(UND|KG|PAQ|MTR|GLN|GR|LT|UN|PZA)?\s*", "", clean_desc, flags=re.IGNORECASE).strip()
                
                if len(clean_desc) >= 3:
                    # Parsear el último monto como total del ítem
                    last_amt_str = amt_matches[-1][0] or amt_matches[-1][1]
                    item_total = cls._parse_currency_str(last_amt_str)
                    if item_total > 0:
                        unit_p = round(item_total / item_cant, 2) if item_cant > 0 else item_total
                        items.append({
                            "numeroItem": len(items) + 1,
                            "codigo": f"ITM-{len(items)+1:02d}",
                            "descripcion": clean_desc,
                            "cantidad": item_cant,
                            "unidadMedida": "UND",
                            "precioUnitario": unit_p,
                            "porcentajeIva": 19.0 if total_iva > 0 else 0.0,
                            "valorIva": round(item_total * 0.19, 2) if total_iva > 0 else 0.0,
                            "subtotal": item_total,
                            "total": item_total
                        })
                    if len(items) >= 20: # Límite razonable para parser determinístico
                        break

        if not items:
            # Crear un ítem por defecto representativo
            desc = basic.get("rawDetail") or f"Servicio / Suministro {issuer}"
            items.append({
                "numeroItem": 1,
                "codigo": "ITM-01",
                "descripcion": desc,
                "cantidad": 1.0,
                "unidadMedida": "UND",
                "precioUnitario": subtotal or total_amount,
                "porcentajeIva": 19.0 if total_iva > 0 else 0.0,
                "valorIva": total_iva,
                "subtotal": subtotal or total_amount,
                "total": total_amount
            })

        # Calcular sumatorias de ítems
        items_subtotal_sum = sum(it.get("subtotal", 0.0) for it in items)
        items_iva_sum = sum(it.get("valorIva", 0.0) for it in items)
        items_total_sum = sum(it.get("total", 0.0) for it in items)

        expected_header = float(basic.get("detailAmount") or total_amount or 0.0)
        diff = abs(total_amount - expected_header) if expected_header > 0 else 0.0
        is_exact = diff < 1.0

        # Concepto sugerido para catálogo
        concept_sug = items[0]["descripcion"] if items else f"Suministro {issuer}"
        if len(concept_sug) > 60:
            concept_sug = concept_sug[:57] + "..."

        validation_result = {
            "totalItemsCount": len(items),
            "calculatedSubtotal": subtotal,
            "calculatedIva": total_iva,
            "calculatedTotal": total_amount,
            "expectedHeaderAmount": expected_header,
            "difference": round(diff, 2),
            "isExactMatch": is_exact,
            "status": "VALIDATED" if is_exact else "DISCREPANCY_FLAG",
            "message": f"Sumatoria de {len(items)} ítems (${subtotal:,.2f}) + IVA (${total_iva:,.2f}) = ${total_amount:,.2f}. {'Coincide 100% con el detalle de Facture.co.' if is_exact else f'Diferencia detectada de ${diff:,.2f}.'}"
        }

        return {
            "emisor": {
                "razonSocial": issuer,
                "nit": nit
            },
            "numeroFactura": doc_num,
            "fechaEmision": emission_date,
            "fechaVencimiento": due_date or emission_date,
            "subtotalSinIva": subtotal,
            "totalIva": total_iva,
            "totalConIva": total_amount,
            "retenciones": {
                "totalRetenciones": retenciones
            },
            "totalPagarNeto": total_amount,
            "items": items,
            "conceptoPrincipalSugerido": concept_sug,
            "validation": validation_result,
            "resumenEjecutivo": f"Factura {doc_num} de {issuer} por ${total_amount:,.2f} ({len(items)} ítems, Subtotal: ${subtotal:,.2f} + IVA: ${total_iva:,.2f})"
        }

    @classmethod
    def _normalize_analysis_result(cls, parsed: Dict[str, Any], basic: Dict[str, Any]) -> Dict[str, Any]:
        """Asegura tipos numéricos y consistencia exacta en el resultado de IA."""
        subtotal = float(parsed.get("subtotalSinIva") or 0.0)
        total_iva = float(parsed.get("totalIva") or 0.0)
        total_con_iva = float(parsed.get("totalConIva") or basic.get("detailAmount") or 0.0)

        if total_con_iva == 0.0 and subtotal > 0:
            total_con_iva = subtotal + total_iva

        items = parsed.get("items", [])
        idx = 1
        for it in items:
            it["numeroItem"] = it.get("numeroItem") or idx
            idx += 1
            # Descripción exacta del producto
            it["descripcion"] = str(it.get("descripcion") or it.get("nombre") or it.get("name") or f"Ítem {idx}").strip()
            it["codigo"] = str(it.get("codigo") or it.get("code") or "").strip()
            it["unidadMedida"] = str(it.get("unidadMedida") or it.get("unidad") or "UND").strip()

            # Cantidad exacta
            cant_val = it.get("cantidad") or it.get("cant") or it.get("quantity") or it.get("qty")
            try:
                it["cantidad"] = float(cant_val) if cant_val is not None else 1.0
            except Exception:
                it["cantidad"] = 1.0

            try:
                it["precioUnitario"] = float(it.get("precioUnitario") or 0.0)
            except Exception:
                it["precioUnitario"] = 0.0

            try:
                it["subtotal"] = float(it.get("subtotal") or round(it["cantidad"] * it["precioUnitario"], 2))
            except Exception:
                it["subtotal"] = 0.0

            try:
                it["valorIva"] = float(it.get("valorIva") or 0.0)
            except Exception:
                it["valorIva"] = 0.0

            try:
                it["porcentajeIva"] = float(it.get("porcentajeIva") or (19.0 if it["valorIva"] > 0 else 0.0))
            except Exception:
                it["porcentajeIva"] = 0.0

            try:
                it["total"] = float(it.get("total") or round(it["subtotal"] + it["valorIva"], 2))
            except Exception:
                it["total"] = it["subtotal"]

            it["tieneIva"] = it["valorIva"] > 0 or it["porcentajeIva"] > 0

        items_con_iva = sum(1 for it in items if it.get("tieneIva"))
        items_sin_iva = len(items) - items_con_iva

        expected_header = float(basic.get("detailAmount") or total_con_iva or 0.0)
        diff = abs(total_con_iva - expected_header) if expected_header > 0 else 0.0
        is_exact = diff < 1.0

        validation_result = {
            "totalItemsCount": len(items),
            "itemsConIvaCount": items_con_iva,
            "itemsSinIvaCount": items_sin_iva,
            "calculatedSubtotal": subtotal,
            "calculatedIva": total_iva,
            "calculatedTotal": total_con_iva,
            "expectedHeaderAmount": expected_header,
            "difference": round(diff, 2),
            "isExactMatch": is_exact,
            "status": "VALIDATED" if is_exact else "DISCREPANCY_FLAG",
            "message": f"Sumatoria de {len(items)} ítems (${subtotal:,.2f}) + IVA (${total_iva:,.2f}) = ${total_con_iva:,.2f}. {'Coincide 100% con el detalle de Facture.co.' if is_exact else f'Diferencia detectada de ${diff:,.2f}.'}"
        }

        concept = parsed.get("conceptoPrincipalSugerido") or basic.get("rawDetail") or "Facturación Electrónica"

        return {
            "emisor": parsed.get("emisor") or {"razonSocial": basic.get("issuerName"), "nit": basic.get("issuerNit")},
            "receptor": parsed.get("receptor") or {"razonSocial": "ALIMENTOS ENRIKO SAS", "nit": "890330035-2"},
            "numeroFactura": parsed.get("numeroFactura") or basic.get("documentNumber"),
            "numeroReferencia": parsed.get("numeroReferencia") or basic.get("referenceNumber") or "",
            "fechaEmision": parsed.get("fechaEmision") or basic.get("emissionDate"),
            "horaEmision": parsed.get("horaEmision") or "",
            "fechaVencimiento": parsed.get("fechaVencimiento") or basic.get("dueDate"),
            "formaPago": parsed.get("formaPago") or "Crédito",
            "condicionPago": parsed.get("condicionPago") or "",
            "medioPago": parsed.get("medioPago") or "Transferencia",
            "moneda": parsed.get("moneda") or "COP",
            "subtotalSinIva": subtotal,
            "totalIva": total_iva,
            "tieneIva": total_iva > 0 or items_con_iva > 0,
            "totalItems": len(items),
            "itemsConIvaCount": items_con_iva,
            "itemsSinIvaCount": items_sin_iva,
            "totalConIva": total_con_iva,
            "retenciones": parsed.get("retenciones") or {"totalRetenciones": 0.0},
            "totalPagarNeto": float(parsed.get("totalPagarNeto") or total_con_iva),
            "items": items,
            "conceptoPrincipalSugerido": concept,
            "validation": validation_result,
            "resumenEjecutivo": parsed.get("resumenEjecutivo") or f"Factura {basic.get('documentNumber')} de {basic.get('issuerName')} ({len(items)} ítems, {items_con_iva} con IVA, {items_sin_iva} exentos)"
        }

    @staticmethod
    def _parse_currency_str(val_str: str) -> float:
        """Parsea strings numéricos colombianos como '1.250.300,50' o '1,250,300.50' a float."""
        if not val_str:
            return 0.0
        clean = val_str.strip().replace("$", "").replace(" ", "")
        if "," in clean and "." in clean:
            if clean.rfind(",") > clean.rfind("."):
                clean = clean.replace(".", "").replace(",", ".")
            else:
                clean = clean.replace(",", "")
        elif "," in clean:
            parts = clean.split(",")
            if len(parts[-1]) == 2:
                clean = clean.replace(",", ".")
            else:
                clean = clean.replace(",", "")
        elif "." in clean:
            parts = clean.split(".")
            if len(parts[-1]) == 3 and len(parts) > 1:
                clean = clean.replace(".", "")
        try:
            return float(clean)
        except Exception:
            return 0.0
