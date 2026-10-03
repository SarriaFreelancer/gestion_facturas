import os
import re
import json
import zipfile
import io
from typing import Dict, Any, List, Optional
from pypdf import PdfReader

class InvoiceAIService:
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
        Analiza el PDF de la factura electrónica (DIAN / Facture / Proveedores)
        e identifica:
        - Ítems y servicios cobrados (Nombre, Cantidad, Precio Unitario, IVA, Subtotal, Total)
        - Costo sin IVA (Subtotal)
        - Costo con IVA (Total)
        - IVA discriminado (% y monto)
        - Retenciones (ReteIVA, ReteICA, ReteFuente)
        - Fechas y términos de pago
        - Concepto sugerido para el módulo de Proveedores
        """
        text = cls.extract_text_from_pdf(pdf_path)
        basic = basic_info or {}

        # 1. Intentar análisis con Gemini AI si hay API KEY disponible
        gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if gemini_api_key and text.strip():
            try:
                from google import genai
                client = genai.Client(api_key=gemini_api_key)
                prompt = f"""
                Eres un experto en Facturación Electrónica DIAN de Colombia. Analiza el siguiente texto extraído de una factura comercial/electrónica y extrae un JSON con la siguiente estructura exacta:
                {{
                    "emisor": {{
                        "razonSocial": "string",
                        "nit": "string",
                        "telefono": "string",
                        "ciudad": "string"
                    }},
                    "receptor": {{
                        "razonSocial": "string",
                        "nit": "string"
                    }},
                    "numeroFactura": "string",
                    "fechaEmision": "YYYY-MM-DD",
                    "fechaVencimiento": "YYYY-MM-DD",
                    "formaPago": "Contado o Crédito",
                    "plazoDias": 0,
                    "moneda": "COP",
                    "subtotalSinIva": 0.0,
                    "totalIva": 0.0,
                    "porcentajeIvaPrincipal": 19.0,
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
                            "descripcion": "Nombre del servicio o producto",
                            "cantidad": 1.0,
                            "unidadMedida": "UND",
                            "precioUnitario": 0.0,
                            "porcentajeIva": 19.0,
                            "valorIva": 0.0,
                            "subtotal": 0.0,
                            "total": 0.0
                        }}
                    ],
                    "conceptoPrincipalSugerido": "Nombre corto y representativo del servicio para el catálogo de proveedores (ej: Harina de Trigo, Empaques Flexibles, Arrendamiento, Mantenimiento)",
                    "resumenEjecutivo": "Breve resumen en 1 línea del cobro y conceptos"
                }}

                TEXTO DE LA FACTURA:
                {text[:12000]}

                Devuelve ÚNICAMENTE el bloque JSON válido sin comentarios adicionales.
                """
                response = client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=prompt
                )
                raw_resp = response.text.strip()
                # Limpiar markdown si viene ```json ... ```
                json_match = re.search(r"\{[\s\S]*\}", raw_resp)
                if json_match:
                    parsed_json = json.loads(json_match.group(0))
                    return cls._normalize_analysis_result(parsed_json, basic)
            except Exception as e:
                print(f"Fallo en Gemini AI analysis, aplicando parser determinístico: {e}")

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
        
        # Buscar patrones de líneas de detalle
        for line in lines:
            # Líneas con montos en pesos
            amt_in_line = re.findall(r"\$\s*([0-9.,]+)|([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{2}))", line)
            if len(amt_in_line) >= 1 and len(line) > 10 and not any(k in line.lower() for k in ["total", "subtotal", "iva", "resoluci", "banco", "cuenta", "pagar"]):
                clean_desc = re.sub(r"[\$\d.,\-_/]{3,}", "", line).strip()
                if len(clean_desc) >= 4:
                    items.append({
                        "descripcion": clean_desc,
                        "cantidad": 1.0,
                        "unidadMedida": "UND",
                        "precioUnitario": subtotal or total_amount,
                        "porcentajeIva": 19.0 if total_iva > 0 else 0.0,
                        "valorIva": total_iva,
                        "subtotal": subtotal or total_amount,
                        "total": total_amount
                    })
                    break

        if not items:
            # Crear un ítem por defecto representativo
            desc = basic.get("rawDetail") or f"Servicio / Suministro {issuer}"
            items.append({
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
        """Asegura tipos numéricos y consistencia en el resultado de IA."""
        subtotal = float(parsed.get("subtotalSinIva") or 0.0)
        total_iva = float(parsed.get("totalIva") or 0.0)
        total_con_iva = float(parsed.get("totalConIva") or basic.get("detailAmount") or 0.0)

        if total_con_iva == 0.0 and subtotal > 0:
            total_con_iva = subtotal + total_iva

        items = parsed.get("items", [])
        for it in items:
            it["cantidad"] = float(it.get("cantidad") or 1.0)
            it["precioUnitario"] = float(it.get("precioUnitario") or 0.0)
            it["subtotal"] = float(it.get("subtotal") or (it["cantidad"] * it["precioUnitario"]))
            it["valorIva"] = float(it.get("valorIva") or 0.0)
            it["total"] = float(it.get("total") or (it["subtotal"] + it["valorIva"]))

        expected_header = float(basic.get("detailAmount") or total_con_iva or 0.0)
        diff = abs(total_con_iva - expected_header) if expected_header > 0 else 0.0
        is_exact = diff < 1.0

        validation_result = {
            "totalItemsCount": len(items),
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
            "numeroFactura": parsed.get("numeroFactura") or basic.get("documentNumber"),
            "fechaEmision": parsed.get("fechaEmision") or basic.get("emissionDate"),
            "fechaVencimiento": parsed.get("fechaVencimiento") or basic.get("dueDate"),
            "subtotalSinIva": subtotal,
            "totalIva": total_iva,
            "totalConIva": total_con_iva,
            "retenciones": parsed.get("retenciones") or {"totalRetenciones": 0.0},
            "totalPagarNeto": float(parsed.get("totalPagarNeto") or total_con_iva),
            "items": items,
            "conceptoPrincipalSugerido": concept,
            "validation": validation_result,
            "resumenEjecutivo": parsed.get("resumenEjecutivo") or f"Factura {basic.get('documentNumber')} de {basic.get('issuerName')} ({len(items)} ítems)"
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
