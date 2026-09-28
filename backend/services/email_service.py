import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Dict, Any, Optional

class EmailNotificationService:
    @staticmethod
    def send_html_email(
        smtp_host: str,
        smtp_port: int,
        smtp_user: str,
        smtp_password: str,
        sender_name: str,
        recipient_emails: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
        cc_emails: Optional[str] = None
    ) -> bool:
        if not smtp_host or not smtp_user or not smtp_password:
            raise ValueError(
                "Configuración SMTP incompleta. Ingrese el servidor SMTP, usuario/correo remitente y contraseña en el módulo de Configuración."
            )

        # Limpiar lista de destinatarios principales
        recipients = [e.strip() for e in recipient_emails.replace(";", ",").split(",") if e.strip()]
        if not recipients:
            raise ValueError("Debe especificar al menos un correo destinatario principal.")

        # Limpiar lista de destinatarios en copia (CC)
        cc_list = []
        if cc_emails:
            cc_list = [e.strip() for e in cc_emails.replace(";", ",").split(",") if e.strip()]

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{sender_name} <{smtp_user}>" if sender_name else smtp_user
        msg["To"] = ", ".join(recipients)
        if cc_list:
            msg["Cc"] = ", ".join(cc_list)

        if text_body:
            msg.attach(MIMEText(text_body, "plain", "utf-8"))
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        port = int(smtp_port or 587)
        all_envelope_recipients = list(set(recipients + cc_list))
        
        try:
            if port == 465:
                server = smtplib.SMTP_SSL(smtp_host, port, timeout=25)
            else:
                server = smtplib.SMTP(smtp_host, port, timeout=25)
                server.ehlo()
                server.starttls()
                server.ehlo()

            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, all_envelope_recipients, msg.as_string())
            return True
        except smtplib.SMTPAuthenticationError as auth_err:
            raise ValueError(f"Error de autenticación SMTP: Usuario o contraseña incorrectos en {smtp_host}. Si usas Outlook/Microsoft 365 o Gmail con 2FA, utiliza una 'Contraseña de Aplicación'. Detalle: {auth_err}")
        except Exception as e:
            raise ValueError(f"Fallo al conectar con el servidor SMTP ({smtp_host}:{port}): {str(e)}")
        finally:
            try:
                server.quit()
            except Exception:
                pass

    @classmethod
    def generate_delivered_invoices_html(
        cls,
        invoices: List[Dict[str, Any]],
        intro_text: str = ""
    ) -> str:
        total_val = sum(float(inv.get("value") or 0) for inv in invoices)
        total_formatted = f"${total_val:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        
        rows_html = ""
        for idx, inv in enumerate(invoices, 1):
            val = float(inv.get("value") or 0)
            val_str = f"${val:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
            em_date = (inv.get("emissionDate") or "—").split("T")[0]
            del_date = (inv.get("deliveryDate") or "—").split("T")[0]
            sup = inv.get("supplier") or "—"
            serv = inv.get("service") or "—"
            num = inv.get("invoiceNumber") or "—"

            bg_row = "#f8fafc" if idx % 2 == 0 else "#ffffff"
            rows_html += f"""
                <tr style="background-color: {bg_row};">
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-weight: bold; color: #0f172a;">{sup}</td>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; color: #475569;">{serv}</td>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; color: #1e293b;">{num}</td>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-family: monospace; color: #64748b;">{em_date}</td>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; color: #2563eb;">{del_date}</td>
                    <td style="padding: 10px 12px; border: 1px solid #e2e8f0; font-family: monospace; text-align: right; font-weight: bold; color: #0f172a;">{val_str}</td>
                </tr>
            """

        intro_p = intro_text.replace("\n", "<br>") if intro_text else "Adjunto remitimos el reporte consolidado de las facturas que han sido radicadas y entregadas formalmente para su trámite de pago."

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background-color: #f1f5f9; color: #1e293b;">
            <div style="max-width: 820px; margin: 0 auto; background-color: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
                
                <!-- HEADER BRANDING ENRIKO -->
                <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 24px 30px; color: #ffffff;">
                    <table style="width: 100%; border: none; border-collapse: collapse;">
                        <tr>
                            <td>
                                <span style="font-size: 11px; font-weight: 900; letter-spacing: 2.5px; text-transform: uppercase; color: #fee2e2; display: block;">ALIMENTOS</span>
                                <h1 style="margin: 2px 0 0 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">ENRIKO S.A.S.</h1>
                                <span style="font-size: 10px; font-weight: 800; color: #ffffff; background: rgba(0,0,0,0.2); padding: 3px 9px; border-radius: 20px; display: inline-block; margin-top: 6px;">Reporte Oficial de Facturas Entregadas</span>
                            </td>
                            <td style="text-align: right; vertical-align: middle;">
                                <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); padding: 8px 14px; border-radius: 12px; display: inline-block; font-size: 12px; font-weight: 800; border: 1px solid rgba(255,255,255,0.3);">
                                    {len(invoices)} Facturas Incluidas
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- CUERPO PRINCIPAL -->
                <div style="padding: 26px 30px;">
                    <p style="font-size: 13px; line-height: 1.6; color: #334155; margin-top: 0; margin-bottom: 22px;">
                        {intro_p}
                    </p>

                    <!-- TABLA EXCEL STYLE -->
                    <div style="overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 12px; margin-bottom: 22px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                            <thead>
                                <tr style="background-color: #dc2626; color: #ffffff; text-align: left; font-weight: 800;">
                                    <th style="padding: 11px 12px; border: 1px solid #b91c1c;">Proveedor</th>
                                    <th style="padding: 11px 12px; border: 1px solid #b91c1c;">Servicio</th>
                                    <th style="padding: 11px 12px; border: 1px solid #b91c1c;">N° Documento</th>
                                    <th style="padding: 11px 12px; border: 1px solid #b91c1c;">Emisión</th>
                                    <th style="padding: 11px 12px; border: 1px solid #b91c1c;">Entrega</th>
                                    <th style="padding: 11px 12px; border: 1px solid #b91c1c; text-align: right;">Valor ($ COP)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows_html}
                            </tbody>
                            <tfoot>
                                <tr style="background-color: #f8fafc; font-weight: 900;">
                                    <td colspan="5" style="padding: 12px; text-align: right; border: 1px solid #cbd5e1; color: #334155; font-size: 12px;">TOTAL CONSOLIDADO:</td>
                                    <td style="padding: 12px; text-align: right; border: 1px solid #cbd5e1; color: #dc2626; font-size: 13px; font-family: monospace;">{total_formatted}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 12px 16px; font-size: 11px; color: #166534;">
                        ✓ <strong>Control Documental:</strong> Las facturas listadas han sido registradas y radicadas formalmente en el sistema.
                    </div>
                </div>

                <!-- FOOTER -->
                <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 30px; text-align: center; font-size: 10.5px; color: #94a3b8;">
                    Alimentos Enriko S.A.S. • Sistema Corporativo de Facturación • Conexión Segura TLS
                </div>
            </div>
        </body>
        </html>
        """
        return html
