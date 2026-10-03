import pymysql
import bcrypt
from backend.config.settings import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
from backend.utils.security import hash_password

def run_migration_v3():
    conn = pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )
    cur = conn.cursor()

    print("=== INICIANDO MIGRACIÓN V3: SEGURIDAD, ÍNDICES & AUDITORÍA ===")

    # 1. Crear tabla system_audit_logs
    cur.execute("""
    CREATE TABLE IF NOT EXISTS system_audit_logs (
        id VARCHAR(100) NOT NULL PRIMARY KEY,
        userId VARCHAR(100) NULL,
        username VARCHAR(100) NOT NULL DEFAULT 'Sistema',
        action VARCHAR(100) NOT NULL,
        entityType VARCHAR(100) NOT NULL,
        entityId VARCHAR(255) NULL,
        details TEXT NULL,
        ipAddress VARCHAR(50) NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_created (createdAt),
        INDEX idx_audit_action (action),
        INDEX idx_audit_entity (entityType, entityId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """)
    print("[OK] Tabla system_audit_logs verificada/creada.")

    # 2. Agregar columna isSyncing a facture_credentials si no existe
    cur.execute("""
        SELECT COUNT(*) as cnt FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'facture_credentials' AND COLUMN_NAME = 'isSyncing'
    """, (DB_NAME,))
    if cur.fetchone()["cnt"] == 0:
        cur.execute("ALTER TABLE facture_credentials ADD COLUMN isSyncing TINYINT NOT NULL DEFAULT 0")
        print("[OK] Columna isSyncing agregada a facture_credentials.")

    # 3. Hashear contraseñas existentes de usuarios con bcrypt
    cur.execute("SELECT id, username, password FROM users")
    users = cur.fetchall()
    hashed_count = 0
    for u in users:
        pwd = u.get("password") or ""
        if pwd and not (pwd.startswith("$2a$") or pwd.startswith("$2b$") or pwd.startswith("$2y$")):
            hashed = hash_password(pwd)
            cur.execute("UPDATE users SET password = %s WHERE id = %s", (hashed, u["id"]))
            hashed_count += 1
            print(f"  -> Usuario '{u['username']}' actualizado con hash bcrypt seguro.")
    print(f"[OK] Total usuarios asegurados con bcrypt: {hashed_count}")

    # 4. Crear índices de alto rendimiento para búsquedas y filtros
    def add_index_if_not_exists(table, index_name, columns_sql):
        cur.execute("""
            SELECT COUNT(*) as cnt FROM information_schema.STATISTICS 
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s AND INDEX_NAME = %s
        """, (DB_NAME, table, index_name))
        if cur.fetchone()["cnt"] == 0:
            try:
                cur.execute(f"CREATE INDEX {index_name} ON {table} ({columns_sql})")
                print(f"[OK] Indice {index_name} creado en {table}.")
            except Exception as e:
                print(f"  Aviso al crear indice {index_name}: {e}")

    add_index_if_not_exists("invoices", "idx_invoices_supplier", "supplier(191)")
    add_index_if_not_exists("invoices", "idx_invoices_emissionDate", "emissionDate(50)")
    add_index_if_not_exists("invoices", "idx_invoices_deliveryDate", "deliveryDate(50)")
    add_index_if_not_exists("invoices", "idx_invoices_delivered", "delivered")
    add_index_if_not_exists("invoices", "idx_invoices_enFacture", "enFacture")
    add_index_if_not_exists("invoices", "idx_invoices_createdAt", "createdAt")
    
    add_index_if_not_exists("suppliers", "idx_suppliers_nit", "nit")
    add_index_if_not_exists("suppliers", "idx_suppliers_name", "name(191)")
    add_index_if_not_exists("suppliers", "idx_suppliers_area", "area(100)")

    add_index_if_not_exists("facture_inbox_documents", "idx_facture_docNum", "documentNumber(100)")
    add_index_if_not_exists("facture_inbox_documents", "idx_facture_folder", "folderType(50)")
    add_index_if_not_exists("facture_inbox_documents", "idx_facture_issuerNit", "issuerNit(50)")
    add_index_if_not_exists("facture_inbox_documents", "idx_facture_emission", "emissionDate(50)")

    print("=== MIGRACION V3 COMPLETADA CON EXITO ===")
    conn.close()

if __name__ == "__main__":
    run_migration_v3()
