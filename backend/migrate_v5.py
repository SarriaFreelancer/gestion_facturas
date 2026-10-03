import pymysql
from backend.config.settings import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
from backend.utils.security import hash_password

def run_migration():
    print("Iniciando migración v5: Maestro de Proveedores, Rol Proveedor, Eventos DIAN y Usuarios de Prueba...")
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

        # 1. Ampliación de tabla `suppliers`
        add_column_if_not_exists('suppliers', 'tradeName', 'VARCHAR(255) NULL')
        add_column_if_not_exists('suppliers', 'address', 'VARCHAR(255) NULL')
        add_column_if_not_exists('suppliers', 'city', 'VARCHAR(100) NULL DEFAULT "Cali"')
        add_column_if_not_exists('suppliers', 'email', 'VARCHAR(255) NULL')
        add_column_if_not_exists('suppliers', 'paymentConditions', 'VARCHAR(100) NULL DEFAULT "Crédito 30 días"')
        add_column_if_not_exists('suppliers', 'bankName', 'VARCHAR(100) NULL')
        add_column_if_not_exists('suppliers', 'bankAccountType', 'VARCHAR(50) NULL DEFAULT "Corriente"')
        add_column_if_not_exists('suppliers', 'bankAccountNumber', 'VARCHAR(100) NULL')
        add_column_if_not_exists('suppliers', 'status', 'VARCHAR(50) NOT NULL DEFAULT "Activo"')

        # 2. Ampliación de tabla `users`
        add_column_if_not_exists('users', 'supplierNit', 'VARCHAR(50) NULL')
        add_column_if_not_exists('users', 'supplierId', 'VARCHAR(100) NULL')
        add_column_if_not_exists('users', 'phone', 'VARCHAR(50) NULL')

        # 3. Ampliación de tabla `internal_uploaded_invoices` para eventos DIAN / RADIAN
        add_column_if_not_exists('internal_uploaded_invoices', 'eventAcuse', 'TINYINT DEFAULT 0')
        add_column_if_not_exists('internal_uploaded_invoices', 'eventAcuseDate', 'VARCHAR(50) NULL')
        add_column_if_not_exists('internal_uploaded_invoices', 'eventRecibo', 'TINYINT DEFAULT 0')
        add_column_if_not_exists('internal_uploaded_invoices', 'eventReciboDate', 'VARCHAR(50) NULL')
        add_column_if_not_exists('internal_uploaded_invoices', 'eventAceptacion', 'TINYINT DEFAULT 0')
        add_column_if_not_exists('internal_uploaded_invoices', 'eventAceptacionDate', 'VARCHAR(50) NULL')
        add_column_if_not_exists('internal_uploaded_invoices', 'eventRechazo', 'TINYINT DEFAULT 0')
        add_column_if_not_exists('internal_uploaded_invoices', 'eventRechazoDate', 'VARCHAR(50) NULL')
        add_column_if_not_exists('internal_uploaded_invoices', 'eventStatus', 'VARCHAR(100) DEFAULT "Radicada (Pendiente Eventos DIAN)"')
        add_column_if_not_exists('internal_uploaded_invoices', 'eventNotification', 'TEXT NULL')

        # 4. Insertar Proveedores de Prueba en Maestro
        test_suppliers = [
            (
                'sup-harinas-valle',
                '900123456-1',
                'HARINAS Y DERIVADOS DEL VALLE S.A.S.',
                'Harinas del Valle',
                'Zona Industrial Acopi, Calle 15 # 28-40',
                'Yumbo / Cali',
                'ventas@harinasdelvalle.com',
                '3157894561',
                'Ing. Mauricio Gómez',
                'Crédito 30 días',
                'Bancolombia',
                'Corriente',
                '048-912345-88',
                'Operaciones & Planta',
                'Activo'
            ),
            (
                'sup-empaques-col',
                '900987654-2',
                'EMPAQUES Y ENVASES DE COLOMBIA S.A.S.',
                'Empaques Col',
                'Carrera 8 # 34-12, Parque Industrial',
                'Cali',
                'facturacion@empaquescol.com',
                '3184561230',
                'Dra. Claudia Morales',
                'Crédito 45 días',
                'Banco de Bogotá',
                'Ahorros',
                '125-678901-44',
                'Adquisiciones & Compras',
                'Activo'
            ),
            (
                'sup-lacteos-ali',
                '890555666-3',
                'DISTRIBUIDORA DE LÁCTEOS Y ALIMENTOS S.A.S.',
                'Lácteos Alianza',
                'Avenida 6N # 22-10',
                'Cali',
                'pedidos@lacteosalimentos.com',
                '3123456789',
                'Sr. Andrés Jaramillo',
                'Contado / Transferencia',
                'Davivienda',
                'Corriente',
                '009-543210-12',
                'Operaciones & Planta',
                'Activo'
            )
        ]

        for s in test_suppliers:
            cur.execute("""
                INSERT INTO suppliers (
                    id, nit, name, tradeName, address, city, email, phone, contact,
                    paymentConditions, bankName, bankAccountType, bankAccountNumber, area, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    tradeName=VALUES(tradeName), address=VALUES(address), city=VALUES(city),
                    email=VALUES(email), phone=VALUES(phone), contact=VALUES(contact),
                    paymentConditions=VALUES(paymentConditions), bankName=VALUES(bankName),
                    bankAccountType=VALUES(bankAccountType), bankAccountNumber=VALUES(bankAccountNumber),
                    area=VALUES(area), status=VALUES(status);
            """, s)
        print("Proveedores de prueba registrados en el maestro.")

        # 5. Insertar Usuarios con Rol Proveedor
        pwd_hash = hash_password("123456")
        test_users = [
            (
                'usr-prov-harinas',
                'proveedor.harinas',
                'Harinas y Derivados del Valle (Portal)',
                'ventas@harinasdelvalle.com',
                pwd_hash,
                'supplier',
                'Proveedor Externo',
                '900123456-1',
                'sup-harinas-valle',
                '3157894561',
                'Activo'
            ),
            (
                'usr-prov-empaques',
                'proveedor.empaques',
                'Empaques y Envases de Colombia (Portal)',
                'facturacion@empaquescol.com',
                pwd_hash,
                'supplier',
                'Proveedor Externo',
                '900987654-2',
                'sup-empaques-col',
                '3184561230',
                'Activo'
            ),
            (
                'usr-prov-lacteos',
                'proveedor.lacteos',
                'Distribuidora de Lácteos (Portal)',
                'pedidos@lacteosalimentos.com',
                pwd_hash,
                'supplier',
                'Proveedor Externo',
                '890555666-3',
                'sup-lacteos-ali',
                '3123456789',
                'Activo'
            )
        ]

        for u in test_users:
            cur.execute("""
                INSERT INTO users (
                    id, username, name, email, password, role, area, supplierNit, supplierId, phone, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    name=VALUES(name), email=VALUES(email), role=VALUES(role),
                    area=VALUES(area), supplierNit=VALUES(supplierNit), supplierId=VALUES(supplierId),
                    phone=VALUES(phone), status=VALUES(status);
            """, u)
        print("Usuarios con Rol Proveedor registrados exitosamente.")

        print("¡Migración v5 completada con éxito!")
    finally:
        conn.close()

if __name__ == "__main__":
    run_migration()
