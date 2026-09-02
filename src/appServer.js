const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// Carpeta local para almacenar PDFs físicos y documentos del dispositivo
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configuración Multer para subida física de archivos PDF/Imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'DOC-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Configuración de conexión MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'GESTION_FACTURAS',
  multipleStatements: true
};

let isMySqlConnected = false;

async function getDbConnection() {
  return await mysql.createConnection(dbConfig);
}

// Inicialización de la base de datos MySQL con soporte de servicios y documentos
async function runStartupScript() {
  try {
    const conn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true
    });

    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await conn.query(`USE \`${dbConfig.database}\`;`);

    // 1. Tabla Proveedores
    await conn.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id VARCHAR(100) PRIMARY KEY,
        nit VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        contact VARCHAR(255) NULL,
        phone VARCHAR(50) NULL,
        monthlyCount INT DEFAULT 1,
        area VARCHAR(100) DEFAULT 'Adquisiciones & Compras',
        services JSON NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 2. Tabla Facturas y Cotizaciones
    await conn.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(100) PRIMARY KEY,
        supplier VARCHAR(255) NOT NULL,
        service VARCHAR(255) NOT NULL,
        invoiceNumber VARCHAR(100) NOT NULL,
        emissionDate VARCHAR(50) NOT NULL,
        deliveryDate VARCHAR(50) NOT NULL,
        value DOUBLE NOT NULL,
        signed VARCHAR(10) DEFAULT 'NO',
        orderStd VARCHAR(10) DEFAULT 'NO',
        oc VARCHAR(100) DEFAULT 'OC-2026-001',
        enFacture VARCHAR(20) DEFAULT 'AÚN NO',
        delivered VARCHAR(10) DEFAULT 'NO',
        pdfPath VARCHAR(255) NULL,
        pdfOriginalName VARCHAR(255) NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 3. Tabla de Usuarios
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        area VARCHAR(100) DEFAULT 'General',
        status VARCHAR(50) DEFAULT 'Activo',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insertar datos base si están vacías
    const [supRows] = await conn.query('SELECT COUNT(*) as count FROM suppliers');
    if (supRows[0].count === 0) {
      await conn.query(`
        INSERT INTO suppliers (id, nit, name, contact, phone, monthlyCount, area, services) VALUES
        ('s1', '800.789.012-4', 'Distribuidora Lácteos Enriko', 'Laura Restrepo', '+57 300 123 4567', 2, 'Contabilidad & Finanzas', '[{"id":"srv-1-1","serviceName":"Servicios de Hosting","enabled":true},{"id":"srv-1-2","serviceName":"Mantenimiento de Servidores","enabled":true}]'),
        ('s2', '900.123.456-1', 'Frigorífico del Valle', 'Carlos Mendoza', '+57 310 455 8899', 3, 'Adquisiciones & Compras', '[{"id":"srv-2-1","serviceName":"Compra de carnes","enabled":true},{"id":"srv-2-2","serviceName":"Suministro de embutidos","enabled":true},{"id":"srv-2-3","serviceName":"Transporte refrigerado","enabled":false}]'),
        ('s3', '890.334.112-9', 'Insumos Agroalimentarios', 'Roberto Gómez', '+57 315 789 1234', 1, 'Mantenimiento & Planta', '[{"id":"srv-3-1","serviceName":"Insumos varios","enabled":true}]'),
        ('s4', '860.001.245-8', 'Empaques Colombia', 'Diana Páez', '+57 312 998 7766', 2, 'Operaciones & Logística', '[{"id":"srv-4-1","serviceName":"Empaques plásticos","enabled":true},{"id":"srv-4-2","serviceName":"Cajas de cartón corrugado","enabled":false}]'),
        ('s5', '901.442.889-0', 'Frutas del Pacífico', 'Felipe Silva', '+57 318 654 3210', 1, 'Adquisiciones & Compras', '[{"id":"srv-5-1","serviceName":"Frutas y verduras","enabled":true}]');
      `);
    }

    const [invRows] = await conn.query('SELECT COUNT(*) as count FROM invoices');
    if (invRows[0].count === 0) {
      await conn.query(`
        INSERT INTO invoices (id, supplier, service, invoiceNumber, emissionDate, deliveryDate, value, signed, orderStd, oc, enFacture, delivered) VALUES
        ('inv-1', 'Distribuidora Lácteos Enriko', 'Servicios de Hosting', 'FAC2235', '2026-08-28', '2026-08-30', 4500000, 'NO', 'NO', 'OC-2026-091', 'AÚN NO', 'NO'),
        ('inv-2', 'Frigorífico del Valle', 'Compra de carnes', 'COT0487', '2026-08-27', '2026-08-29', 3250000, 'SÍ', 'SÍ', 'OC-2026-084', 'SÍ', 'SÍ'),
        ('inv-3', 'Insumos Agroalimentarios', 'Insumos varios', 'FAC2201', '2026-08-26', '2026-08-28', 1890000, 'SÍ', 'SÍ', 'OC-2026-079', 'SÍ', 'SÍ'),
        ('inv-4', 'Empaques Colombia', 'Empaques plásticos', 'FAC2185', '2026-08-25', '2026-08-27', 2760000, 'NO', 'NO', 'OC-2026-065', 'AÚN NO', 'NO'),
        ('inv-5', 'Frutas del Pacífico', 'Frutas y verduras', 'FAC2199', '2026-08-28', '2026-09-01', 6450000, 'SÍ', 'SÍ', 'OC-2026-088', 'SÍ', 'NO');
      `);
    }

    const [uRows] = await conn.query('SELECT COUNT(*) as count FROM users');
    if (uRows[0].count === 0) {
      await conn.query(`
        INSERT INTO users (id, username, name, role, area, status) VALUES
        ('usr-1', 'JR', 'Juan Rodríguez', 'Administrador General', 'Todas las Áreas', 'Activo'),
        ('usr-2', 'maria_c', 'María Fernanda Ruiz', 'Gestor de Compras', 'Adquisiciones & Compras', 'Activo'),
        ('usr-3', 'carlos_ti', 'Carlos Morales', 'Gestor TI', 'Tecnología (TI)', 'Activo');
      `);
    }

    await conn.end();
    isMySqlConnected = true;
    console.log('✅ [MySQL GESTION_FACTURAS] Conectado e inicializado exitosamente.');
  } catch (err) {
    isMySqlConnected = false;
    console.log('⚠️ [Modo Autónomo] MySQL no disponible, usando almacenamiento persistente local:', err.message);
  }
}

// -------------------------------------------------------------
// ENDPOINTS DE API CON PERSISTENCIA EN BD Y SUBIDA DE PDF LOCAL
// -------------------------------------------------------------

// 1. PROVEEDORES
app.get('/api/suppliers', async (req, res) => {
  try {
    if (isMySqlConnected) {
      const conn = await getDbConnection();
      const [rows] = await conn.query('SELECT * FROM suppliers ORDER BY name ASC');
      await conn.end();
      const formatted = rows.map(r => ({
        ...r,
        services: typeof r.services === 'string' ? JSON.parse(r.services) : (r.services || [])
      }));
      return res.json(formatted);
    }
  } catch (err) {
    console.error(err);
  }
  res.json([]);
});

app.post('/api/suppliers', async (req, res) => {
  const { id, nit, name, contact, phone, monthlyCount, area, services } = req.body;
  const supId = id || ('sup-' + Date.now());
  const servicesJson = JSON.stringify(services || []);

  try {
    if (isMySqlConnected) {
      const conn = await getDbConnection();
      await conn.query(`
        INSERT INTO suppliers (id, nit, name, contact, phone, monthlyCount, area, services)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE nit = VALUES(nit), name = VALUES(name), contact = VALUES(contact), phone = VALUES(phone), monthlyCount = VALUES(monthlyCount), area = VALUES(area), services = VALUES(services);
      `, [supId, nit, name, contact || '', phone || '', Number(monthlyCount) || 1, area || 'General', servicesJson]);
      await conn.end();
    }
    res.status(201).json({ success: true, id: supId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    if (isMySqlConnected) {
      const conn = await getDbConnection();
      await conn.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
      await conn.end();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. FACTURAS
app.get('/api/invoices', async (req, res) => {
  try {
    if (isMySqlConnected) {
      const conn = await getDbConnection();
      const [rows] = await conn.query('SELECT * FROM invoices ORDER BY createdAt DESC');
      await conn.end();
      return res.json(rows);
    }
  } catch (err) {
    console.error(err);
  }
  res.json([]);
});

app.post('/api/invoices', async (req, res) => {
  const { id, supplier, service, invoiceNumber, emissionDate, deliveryDate, value, signed, orderStd, oc, enFacture, delivered, pdfPath, pdfOriginalName } = req.body;
  const invId = id || ('inv-' + Date.now());

  try {
    if (isMySqlConnected) {
      const conn = await getDbConnection();
      await conn.query(`
        INSERT INTO invoices (id, supplier, service, invoiceNumber, emissionDate, deliveryDate, value, signed, orderStd, oc, enFacture, delivered, pdfPath, pdfOriginalName)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
          supplier = VALUES(supplier),
          service = VALUES(service),
          invoiceNumber = VALUES(invoiceNumber),
          emissionDate = VALUES(emissionDate),
          deliveryDate = VALUES(deliveryDate),
          value = VALUES(value),
          signed = VALUES(signed),
          orderStd = VALUES(orderStd),
          oc = VALUES(oc),
          enFacture = VALUES(enFacture),
          delivered = VALUES(delivered),
          pdfPath = VALUES(pdfPath),
          pdfOriginalName = VALUES(pdfOriginalName);
      `, [invId, supplier, service, invoiceNumber, emissionDate, deliveryDate, Number(value) || 0, signed || 'NO', orderStd || 'NO', oc || 'OC-2026-001', enFacture || 'AÚN NO', delivered || 'NO', pdfPath || null, pdfOriginalName || null]);
      await conn.end();
    }
    res.status(201).json({ success: true, id: invId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    if (isMySqlConnected) {
      const conn = await getDbConnection();
      await conn.query('DELETE FROM invoices WHERE id = ?', [req.params.id]);
      await conn.end();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. SUBIDA FÍSICA DE ARCHIVOS PDF A CARPETA LOCAL (uploads/)
app.post('/api/upload-pdf', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }
  const relativePath = '/uploads/' + req.file.filename;
  res.json({
    success: true,
    originalName: req.file.originalname,
    storedName: req.file.filename,
    relativePath: relativePath,
    size: req.file.size
  });
});

// 4. USUARIOS
app.get('/api/users', async (req, res) => {
  try {
    if (isMySqlConnected) {
      const conn = await getDbConnection();
      const [rows] = await conn.query('SELECT * FROM users ORDER BY name ASC');
      await conn.end();
      return res.json(rows);
    }
  } catch (err) {
    console.error(err);
  }
  res.json([]);
});

app.post('/api/users', async (req, res) => {
  const { id, username, name, role, area } = req.body;
  const uId = id || ('usr-' + Date.now());
  try {
    if (isMySqlConnected) {
      const conn = await getDbConnection();
      await conn.query(`
        INSERT INTO users (id, username, name, role, area, status)
        VALUES (?, ?, ?, ?, ?, 'Activo')
        ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), area = VALUES(area);
      `, [uId, username, name, role, area || 'General']);
      await conn.end();
    }
    res.status(201).json({ success: true, id: uId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`🚀 SISTEMA ALIMENTOS ENRIKO (EXPRESS + MYSQL + LOCAL STORAGE)`);
  console.log(`🌐 Acceso Web: http://localhost:${PORT}`);
  console.log(`🗄️ Base de datos: MySQL GESTION_FACTURAS (localhost:3306)`);
  console.log(`📁 Carpeta de PDFs locales: ${UPLOADS_DIR}`);
  console.log(`=============================================================\n`);
});

runStartupScript();
