"""
Script manual para descarga masiva de facturas PDF desde Facture.co usando Playwright.
Uso:
    python download_all_facture_pdfs.py
    python download_all_facture_pdfs.py --max 100
    python download_all_facture_pdfs.py --folder "Recibidos"
    python download_all_facture_pdfs.py --folder "Contado"
"""
import sys
import io
import asyncio
import argparse

if sys.platform == 'win32':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except Exception:
        pass
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    except Exception:
        pass

from backend.services.facture_service import FactureService

async def main():
    parser = argparse.ArgumentParser(description="Descargador de PDFs de Facture.co")
    parser.add_argument("--max", type=int, default=50, help="Cantidad máxima de documentos a descargar (default: 50)")
    parser.add_argument("--folder", type=str, default="Recibidos", help="Carpeta a procesar: Recibidos, Contado, Procesados (default: Recibidos)")
    parser.add_argument("--sync-local", action="store_true", help="Sincronizar archivos locales ya descargados en la base de datos")
    args = parser.parse_args()

    service = FactureService()

    print("=" * 60)
    print("🚀 DESCARGADOR AUTOMÁTICO DE FACTURAS PDF (PLAYWRIGHT)")
    print(f"Carpeta: {args.folder} | Máximo documentos: {args.max}")
    print("=" * 60)

    # 1. Sincronizar PDFs ya existentes en disco primero
    print("\n[1/2] Sincronizando PDFs existentes en disco...")
    local_res = service.sync_local_pdfs_with_db()
    print(f"      -> {local_res.get('synced', 0)} facturas vinculadas desde archivos locales.")

    if args.sync_local:
        print("\nFinalizado por opción --sync-local.")
        return

    # 2. Descarga masiva en Facture.co
    print(f"\n[2/2] Iniciando navegador Playwright y descargando facturas de '{args.folder}'...")
    res = await service.batch_download_inbox_pdfs(max_docs=args.max, folder=args.folder)

    print("\n" + "=" * 60)
    print(f"✅ RESULTADO:")
    print(f"   - Descargadas nuevas: {res.get('downloaded', 0)}")
    print(f"   - Ya existían:        {res.get('skipped', 0)}")
    if res.get("errors"):
        print(f"   - Avisos/Errores:     {len(res['errors'])}")
        for err in res["errors"]:
            print(f"     * {err}")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
