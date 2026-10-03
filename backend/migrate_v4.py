import pymysql
import os
from backend.config.settings import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

def run_migration():
    print("Iniciando migración v4: Módulo de Facturas Internas y Configuración de Portal de Proveedores...")
    conn = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor
    )

    try:
        with conn.cursor() as cur:
            # 1. Crear tabla internal_uploaded_invoices
            cur.execute("""
            CREATE TABLE IF NOT EXISTS `internal_uploaded_invoices` (
                `id` VARCHAR(100) PRIMARY KEY,
                `documentNumber` VARCHAR(100) NOT NULL,
                `docType` VARCHAR(50) DEFAULT 'FACTURA DE VENTA',
                `paymentType` VARCHAR(50) DEFAULT 'Crédito',
                `referenceNumber` VARCHAR(100) DEFAULT '',
                `issuerName` VARCHAR(255) NOT NULL,
                `issuerNit` VARCHAR(50) NOT NULL,
                `clientName` VARCHAR(255) DEFAULT 'ALIMENTOS ENRIKO SAS',
                `clientNit` VARCHAR(50) DEFAULT '890330035',
                `emissionDate` VARCHAR(50) DEFAULT '',
                `dueDate` VARCHAR(50) DEFAULT '',
                `paymentCondition` VARCHAR(100) DEFAULT 'CREDITO 30 DIAS',
                `paymentMethod` VARCHAR(100) DEFAULT 'TRANSFERENCIA',
                `subtotalAmount` DECIMAL(18,2) DEFAULT 0.00,
                `ivaAmount` DECIMAL(18,2) DEFAULT 0.00,
                `totalAmount` DECIMAL(18,2) DEFAULT 0.00,
                `retentionAmount` DECIMAL(18,2) DEFAULT 0.00,
                `netPayableAmount` DECIMAL(18,2) DEFAULT 0.00,
                `hasIva` TINYINT DEFAULT 0,
                `itemsCount` INT DEFAULT 1,
                `itemsWithIvaCount` INT DEFAULT 0,
                `itemsWithoutIvaCount` INT DEFAULT 1,
                `rawDetail` TEXT,
                `itemsJson` LONGTEXT,
                `pdfPath` VARCHAR(500),
                `pdfOriginalName` VARCHAR(255),
                `status` VARCHAR(50) DEFAULT 'Radicada',
                `folderType` VARCHAR(50) DEFAULT 'Recibidos',
                `importedToMain` TINYINT DEFAULT 0,
                `mainInvoiceId` VARCHAR(100),
                `uploadedBy` VARCHAR(100) DEFAULT 'Proveedor',
                `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX `idx_internal_docnum` (`documentNumber`),
                INDEX `idx_internal_nit` (`issuerNit`),
                INDEX `idx_internal_status` (`status`),
                INDEX `idx_internal_folder` (`folderType`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            print("Tabla `internal_uploaded_invoices` creada o verificada.")

            # 2. Agregar columnas de configuración de portal a email_settings si no existen
            cur.execute("SHOW COLUMNS FROM email_settings")
            cols = [r['Field'] for r in cur.fetchall()]

            if 'portalEnabled' not in cols:
                cur.execute("ALTER TABLE email_settings ADD COLUMN `portalEnabled` TINYINT DEFAULT 1")
                print("Columna `portalEnabled` agregada a email_settings.")

            if 'defaultClientName' not in cols:
                cur.execute("ALTER TABLE email_settings ADD COLUMN `defaultClientName` VARCHAR(255) DEFAULT 'ALIMENTOS ENRIKO SAS'")
                print("Columna `defaultClientName` agregada a email_settings.")

            if 'defaultClientNit' not in cols:
                cur.execute("ALTER TABLE email_settings ADD COLUMN `defaultClientNit` VARCHAR(50) DEFAULT '890330035'")
                print("Columna `defaultClientNit` agregada a email_settings.")

            if 'geminiApiKey' not in cols:
                cur.execute("ALTER TABLE email_settings ADD COLUMN `geminiApiKey` TEXT DEFAULT NULL")
                print("Columna `geminiApiKey` agregada a email_settings.")

            conn.commit()
            print("Migración v4 completada con éxito!")

    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()
