import pymysql
from backend.config.settings import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

def run_migration():
    print("Iniciando migración v6: aiReadingStatus, aiShortSummary, dianEventsStatus, authorizedAreas...")
    conn = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )
    cur = conn.cursor()

    try:
        def add_column_if_not_exists(table, col, col_def):
            cur.execute("SELECT COUNT(*) as cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=%s AND TABLE_NAME=%s AND COLUMN_NAME=%s", (DB_NAME, table, col))
            row = cur.fetchone()
            if row['cnt'] == 0:
                cur.execute(f"ALTER TABLE `{table}` ADD COLUMN `{col}` {col_def}")
                print(f"Columna `{col}` agregada a `{table}`.")
            else:
                print(f"Columna `{col}` ya existe en `{table}`.")

        # 1. Tabla invoices
        add_column_if_not_exists('invoices', 'aiReadingStatus', "VARCHAR(50) DEFAULT 'PENDIENTE'")
        add_column_if_not_exists('invoices', 'aiShortSummary', "TEXT NULL")
        add_column_if_not_exists('invoices', 'dianEventsStatus', "VARCHAR(50) DEFAULT 'PENDIENTE'")
        add_column_if_not_exists('invoices', 'recurrentParentId', "VARCHAR(100) NULL")
        add_column_if_not_exists('invoices', 'recurrentMatchReason', "TEXT NULL")

        # 2. Tabla facture_inbox_documents
        add_column_if_not_exists('facture_inbox_documents', 'aiReadingStatus', "VARCHAR(50) DEFAULT 'PENDIENTE'")
        add_column_if_not_exists('facture_inbox_documents', 'aiShortSummary', "TEXT NULL")
        add_column_if_not_exists('facture_inbox_documents', 'dianEventsStatus', "VARCHAR(50) DEFAULT 'PENDIENTE'")

        # 3. Tabla users
        add_column_if_not_exists('users', 'authorizedAreas', "TEXT NULL")

        print("Migración v6 ejecutada con éxito.")

    except Exception as e:
        print(f"Error durante la migración v6: {e}")
        raise e
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    run_migration()
