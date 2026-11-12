import asyncio
import os
import time
import threading
from typing import Dict, Any
from datetime import datetime
from backend.services.facture_service import FactureService, UPLOADS_DIR

class FactureAutoDownloader:
    """
    Servicio de descarga automática en segundo plano para facturas de Facture.co.
    Garantiza que todas las facturas tengan su PDF descargado localmente con Playwright.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FactureAutoDownloader, cls).__new__(cls)
            cls._instance.service = FactureService()
            cls._instance.is_running = False
            cls._instance.is_paused = False
            cls._instance.last_run = None
            cls._instance.last_status = "Inactivo"
            cls._instance.last_downloaded = 0
            cls._instance.total_downloaded_session = 0
            cls._instance.thread = None
            cls._instance.stop_event = threading.Event()
        return cls._instance

    def get_status(self) -> Dict[str, Any]:
        with self.service.repo.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) as total, SUM(pdfDownloaded) as downloaded FROM facture_inbox_documents")
                row = cur.fetchone() or {"total": 0, "downloaded": 0}
                total = int(row.get("total") or 0)
                downloaded = int(row.get("downloaded") or 0)
                pending = max(0, total - downloaded)

        return {
            "isRunning": self.is_running,
            "isPaused": self.is_paused,
            "lastRun": self.last_run,
            "lastStatus": self.last_status,
            "pendingCount": pending,
            "downloadedCount": downloaded,
            "totalCount": total,
            "sessionDownloaded": self.total_downloaded_session
        }

    def start_worker(self):
        if self.is_running:
            return
        self.is_running = True
        self.stop_event.clear()
        self.thread = threading.Thread(target=self._run_loop, daemon=True)
        self.thread.start()
        print("[AutoDownloader] Servicio de descarga automática iniciado en segundo plano.")

    def stop_worker(self):
        self.stop_event.set()
        self.is_running = False
        print("[AutoDownloader] Servicio de descarga automática detenido.")

    def _run_loop(self):
        """Bucle en hilo dedicado con ProactorEventLoop de Windows."""
        import sys
        if sys.platform == 'win32':
            try:
                asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
            except Exception:
                pass

        # Pequeña espera inicial para permitir que FastAPI y la BD inicien completamente
        time.sleep(10)

        # 1. Sincronizar PDFs ya existentes en disco
        try:
            self.service.sync_local_pdfs_with_db()
        except Exception as e:
            print(f"[AutoDownloader] Error en sincronización inicial de PDFs locales: {e}")

        while not self.stop_event.is_set():
            try:
                # Comprobar si hay facturas pendientes de descarga
                with self.service.repo.get_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT COUNT(*) as pending FROM facture_inbox_documents WHERE pdfDownloaded = 0")
                        row = cur.fetchone()
                        pending = int(row["pending"] if row else 0)

                # Comprobar si hay sincronización manual de Facture en curso
                creds = self.service.get_credentials()
                is_syncing = int(creds.get("isSyncing") or 0)

                if pending > 0 and not is_syncing and not self.is_paused:
                    self.last_status = f"Descargando lote de facturas (Pendientes: {pending})..."
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    try:
                        # Descargar un lote de hasta 15 documentos
                        res = loop.run_until_complete(
                            self.service.batch_download_inbox_pdfs(max_docs=15, folder="Recibidos")
                        )
                        dl = res.get("downloaded", 0)
                        self.last_downloaded = dl
                        self.total_downloaded_session += dl
                        self.last_run = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        self.last_status = f"Lote completado: {dl} descargados. Procesando pre-lecturas con consenso..."
                        print(f"[AutoDownloader] Lote procesado: {dl} facturas descargadas.")
                    finally:
                        loop.close()

                # Pre-lectura inteligente y validación de consenso multi-lectura en segundo plano
                with self.service.repo.get_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute("""
                            SELECT documentNumber FROM facture_inbox_documents 
                            WHERE pdfDownloaded = 1 AND (consensusConfirmed = 0 OR consensusConfirmed IS NULL)
                            LIMIT 5
                        """)
                        unparsed_docs = [r["documentNumber"] for r in cur.fetchall()]

                if unparsed_docs and not is_syncing and not self.is_paused:
                    self.last_status = f"Pre-leyendo y validando consenso de {len(unparsed_docs)} facturas..."
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    try:
                        for doc_num in unparsed_docs:
                            if self.stop_event.is_set():
                                break
                            try:
                                loop.run_until_complete(
                                    self.service.inspect_and_analyze_invoice(doc_num, force_download=False, force_reanalysis=False)
                                )
                            except Exception as parse_err:
                                print(f"[AutoDownloader] Error en pre-lectura de {doc_num}: {parse_err}")
                    finally:
                        loop.close()

                if pending > 0:
                    # Esperar 45 segundos entre lotes de descarga para no saturar Facture.co
                    for _ in range(45):
                        if self.stop_event.is_set():
                            break
                        time.sleep(1)
                else:
                    self.last_status = "Al día (todos los PDFs descargados y pre-lecturas con consenso al 100%)."
                    # Esperar 90 segundos antes del siguiente escaneo general
                    for _ in range(90):
                        if self.stop_event.is_set():
                            break
                        time.sleep(1)

            except Exception as loop_err:
                self.last_status = f"Aviso en bucle de descarga: {str(loop_err)}"
                print(f"[AutoDownloader] Excepción: {loop_err}")
                time.sleep(30)

        self.is_running = False

downloader = FactureAutoDownloader()
