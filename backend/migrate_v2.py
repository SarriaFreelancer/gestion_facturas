import pymysql

def run_migration():
    conn = pymysql.connect(host='localhost', user='root', password='root', database='GESTION_FACTURAS', autocommit=True)
    cur = conn.cursor()

    # 1. Crear tabla inventory_movements
    cur.execute('''
    CREATE TABLE IF NOT EXISTS inventory_movements (
        id VARCHAR(100) NOT NULL PRIMARY KEY,
        itemId VARCHAR(100) NOT NULL,
        itemName VARCHAR(255) NOT NULL,
        itemCategory VARCHAR(100) NULL,
        quantity INT NOT NULL DEFAULT 1,
        recipient VARCHAR(255) NOT NULL,
        area VARCHAR(100) NOT NULL,
        actionType VARCHAR(50) NOT NULL DEFAULT 'Préstamo',
        status VARCHAR(50) NOT NULL DEFAULT 'Activo',
        notes TEXT NULL,
        movementDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        returnDate DATETIME NULL,
        returnedQuantity INT NOT NULL DEFAULT 0,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ''')

    # 2. Crear tabla inventory_categories
    cur.execute('''
    CREATE TABLE IF NOT EXISTS inventory_categories (
        id VARCHAR(100) NOT NULL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NULL,
        icon VARCHAR(50) NULL DEFAULT 'Layers',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ''')

    # Insertar categorias si está vacía
    cur.execute('SELECT COUNT(*) FROM inventory_categories')
    if cur.fetchone()[0] == 0:
        categories = [
            ('cat-1', 'Equipos de Cómputo', 'Laptops, computadores de escritorio, todo-en-uno y mini PCs', 'Laptop'),
            ('cat-2', 'Periféricos', 'Teclados, mouse, diademas, cámaras web y micrófonos', 'Mouse'),
            ('cat-3', 'Redes & Conectividad', 'Switches, routers, access points, cables de red y patch panels', 'Wifi'),
            ('cat-4', 'Impresión & Escáneres', 'Impresoras térmicas, láser, multifuncionales y lectores de código', 'Printer'),
            ('cat-5', 'Servidores & Almacenamiento', 'Servidores rack/torre, discos NAS, SSDs y racks de comunicaciones', 'Server'),
            ('cat-6', 'Accesorios & Cables', 'Cables HDMI/DisplayPort, adaptadores, cargadores y hubs USB', 'Cable'),
            ('cat-7', 'Telefonía & Comunicación', 'Teléfonos IP, plantas telefónicas y radiotransmisores', 'PhoneCall'),
            ('cat-8', 'Licencias & Software', 'Licencias Office 365, antivirus, Windows Server y software corporativo', 'Key')
        ]
        cur.executemany('INSERT INTO inventory_categories (id, name, description, icon) VALUES (%s, %s, %s, %s)', categories)

    # 3. Crear o actualizar company_areas
    cur.execute('''
    CREATE TABLE IF NOT EXISTS company_areas (
        id VARCHAR(100) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        director VARCHAR(255) NULL,
        headOrCoord VARCHAR(255) NULL,
        email VARCHAR(255) NULL,
        budgetLimit DECIMAL(15,2) NOT NULL DEFAULT 0.00,
        color VARCHAR(50) NULL DEFAULT 'red',
        icon VARCHAR(50) NULL DEFAULT 'Building2',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ''')

    # 4. Helper para añadir columnas seguras
    def add_col(table, col, col_type):
        cur.execute("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA='GESTION_FACTURAS' AND TABLE_NAME=%s AND COLUMN_NAME=%s", (table, col))
        if cur.fetchone()[0] == 0:
            cur.execute(f"ALTER TABLE {table} ADD COLUMN `{col}` {col_type}")
            print(f"Columna agregada: {table}.{col}")

    add_col('users', 'email', 'VARCHAR(255) NULL')
    add_col('users', 'password', 'VARCHAR(255) NOT NULL DEFAULT "123456"')
    add_col('users', 'status', 'VARCHAR(50) NOT NULL DEFAULT "Activo"')
    add_col('company_areas', 'color', 'VARCHAR(50) NULL DEFAULT "red"')
    add_col('company_areas', 'icon', 'VARCHAR(50) NULL DEFAULT "Building2"')

    # Insertar usuarios base
    users = [
        ('usr-superadmin', 'superadmin', 'Super Administrador General', 'superadmin@alimentosenriko.com', 'admin123', 'superadmin', 'Dirección General', 'Activo'),
        ('usr-admin-ti', 'admin.ti', 'Ing. Carlos Mendoza (Admin TI)', 'ti@alimentosenriko.com', '123456', 'admin', 'Tecnología (TI)', 'Activo'),
        ('usr-admin-compras', 'admin.compras', 'Dra. Patricia Gómez (Admin Compras)', 'compras@alimentosenriko.com', '123456', 'admin', 'Adquisiciones & Compras', 'Activo'),
        ('usr-admin-finanzas', 'admin.finanzas', 'Dr. Roberto Meza (Admin Finanzas)', 'contabilidad@alimentosenriko.com', '123456', 'admin', 'Contabilidad & Finanzas', 'Activo'),
        ('usr-admin-planta', 'admin.planta', 'Ing. Fernando Castro (Admin Planta)', 'planta@alimentosenriko.com', '123456', 'admin', 'Operaciones & Planta', 'Activo')
    ]

    for u in users:
        cur.execute('''
            INSERT INTO users (id, username, name, email, password, role, area, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), role=VALUES(role), area=VALUES(area), status=VALUES(status);
        ''', u)

    print("MIGRACION COMPLETADA CON EXITO!")

if __name__ == '__main__':
    run_migration()
