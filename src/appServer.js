require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 4000;

// Compilación automática instantánea de los módulos del frontend a public/bundle.js
function buildFrontendBundle() {
  try {
    const componentsDir = path.join(__dirname, '..', 'public', 'components');
    const appJsPath = path.join(__dirname, '..', 'public', 'App.js');
    const bundlePath = path.join(__dirname, '..', 'public', 'bundle.js');

    const componentFiles = [
      'LoginModal.js',
      'Sidebar.js',
      'TopNavbar.js',
      'KpiCards.js',
      'ChartsSection.js',
      'FiltersBar.js',
      'InvoicesTable.js',
      'InvoicesModule.js',
      'SuppliersModule.js',
      'CrmModule.js',
      'UsersModule.js',
      'AlertsModule.js',
      'ExcelPreviewModal.js'
    ];

    const servicesPath = path.join(__dirname, '..', 'public', 'services', 'apiClient.js');
    let combinedCode = '';

    if (fs.existsSync(servicesPath)) {
      combinedCode += `\n// --- apiClient.js ---\n` + fs.readFileSync(servicesPath, 'utf8') + '\n';
    }

    for (const file of componentFiles) {
      const fullPath = path.join(componentsDir, file);
      if (fs.existsSync(fullPath)) {
        combinedCode += `\n// --- ${file} ---\n` + fs.readFileSync(fullPath, 'utf8') + '\n';
      }
    }

    if (fs.existsSync(appJsPath)) {
      combinedCode += '\n// --- App.js ---\n' + fs.readFileSync(appJsPath, 'utf8') + '\n';
    }

    try {
      const esbuild = require('esbuild');
      const result = esbuild.transformSync(combinedCode, { loader: 'jsx' });
      fs.writeFileSync(bundlePath, result.code, 'utf8');
      console.log('⚡ [Frontend] public/bundle.js compilado exitosamente con esbuild.');
    } catch(e) {
      fs.writeFileSync(bundlePath, combinedCode, 'utf8');
    }
  } catch (err) {
    console.warn('⚠️ [Frontend Build Warning]:', err.message);
  }
}

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
app.use(express.static(path.join(__dirname, '..', 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('bundle.js') || filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Pool de conexiones permanente a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'GESTION_FACTURAS',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

let isMySqlConnected = false;

// Inicialización de la base de datos MySQL con soporte de servicios y documentos
async function runStartupScript() {
  try {
    const rootConn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      multipleStatements: true
    });

    const dbName = process.env.DB_NAME || 'GESTION_FACTURAS';
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConn.end();

    // 1. Tabla de Proveedores (con servicios en JSON)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id VARCHAR(100) PRIMARY KEY,
        nit VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        contact VARCHAR(255) NULL,
        phone VARCHAR(50) NULL,
        monthlyCount INT DEFAULT 1,
        area VARCHAR(100) DEFAULT 'General',
        services JSON NULL,
        email VARCHAR(255) NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 2. Tabla de Facturas y Cotizaciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(100) PRIMARY KEY,
        supplier VARCHAR(255) NOT NULL,
        service VARCHAR(255) NULL,
        invoiceNumber VARCHAR(100) NULL,
        emissionDate VARCHAR(50) NULL,
        deliveryDate VARCHAR(50) NULL,
        value DECIMAL(15, 2) DEFAULT 0,
        signed VARCHAR(10) DEFAULT 'NO',
        orderStd VARCHAR(10) DEFAULT 'NO',
        oc VARCHAR(100) DEFAULT '',
        enFacture VARCHAR(20) DEFAULT 'AÚN NO',
        delivered VARCHAR(10) DEFAULT 'NO',
        pdfPath VARCHAR(500) NULL,
        pdfOriginalName VARCHAR(255) NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 3. Tabla de Solicitudes CRM de Cotizaciones (RFQs / Cotizaciones Multi-Proveedor)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS crm_quotations (
        id VARCHAR(100) PRIMARY KEY,
        code VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) DEFAULT 'General',
        description TEXT NULL,
        urgency VARCHAR(50) DEFAULT 'Media',
        deadline VARCHAR(50) NULL,
        suppliers JSON NULL,
        selectedSupplier VARCHAR(255) NULL,
        finalAmount DECIMAL(15,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'EN_BUSQUEDA',
        notes TEXT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 4. Tabla de Usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL DEFAULT '123456',
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL DEFAULT 'admin',
        area VARCHAR(100) DEFAULT 'General',
        status VARCHAR(50) DEFAULT 'Activo',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    isMySqlConnected = true;
    console.log('✅ [MySQL GESTION_FACTURAS] Conectado e inicializado exitosamente.');
  } catch (err) {
    console.log('⚠️ [MySQL] Error al inicializar tablas:', err.message);
  }
}

// -------------------------------------------------------------
// LIVE REAL-TIME SERVER-SENT EVENTS (SSE) - SIN RECARGAR PÁGINA
// -------------------------------------------------------------
let sseClients = [];

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

function broadcastLiveChange(type, data = {}) {
  const payload = JSON.stringify({ type, data, timestamp: Date.now() });
  sseClients.forEach(client => {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch (e) {}
  });
}

// -------------------------------------------------------------
// AUTH: LOGIN DE USUARIOS (SUPERADMIN Y ADMIN)
// -------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Por favor ingresa usuario y contraseña' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, name, role, area, status, password FROM users WHERE LOWER(username) = LOWER(?)', 
      [username.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = rows[0];
    if (user.status !== 'Activo') {
      return res.status(403).json({ error: 'Tu cuenta se encuentra inactiva. Contacta al Administrador.' });
    }

    if (user.password !== password.trim()) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error('Error en /api/auth/login:', err.message);
    res.status(500).json({ error: 'Error interno en el servidor de autenticación' });
  }
});

// -------------------------------------------------------------
// ENDPOINTS DE API CON PERSISTENCIA EN BD Y SUBIDA DE PDF LOCAL
// -------------------------------------------------------------

// 1. PROVEEDORES
app.get('/api/suppliers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM suppliers ORDER BY name ASC');
    const formatted = rows.map(r => ({
      ...r,
      services: typeof r.services === 'string' ? JSON.parse(r.services) : (r.services || [])
    }));
    return res.json(formatted);
  } catch (err) {
    console.error('Error al obtener proveedores:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/suppliers', async (req, res) => {
  const { id, nit, name, contact, phone, monthlyCount, area, services, email } = req.body;
  const supId = id || ('sup-' + Date.now());
  const servicesJson = JSON.stringify(services || []);

  try {
    await pool.query(`
      INSERT INTO suppliers (id, nit, name, contact, phone, monthlyCount, area, services, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        nit = VALUES(nit), 
        name = VALUES(name), 
        contact = VALUES(contact), 
        phone = VALUES(phone), 
        monthlyCount = VALUES(monthlyCount), 
        area = VALUES(area), 
        services = VALUES(services),
        email = VALUES(email);
    `, [supId, nit, name, contact || '', phone || '', Number(monthlyCount) || 1, area || 'General', servicesJson, email || null]);

    broadcastLiveChange('SUPPLIERS_UPDATED', { id: supId });
    res.status(201).json({ success: true, id: supId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
    broadcastLiveChange('SUPPLIERS_UPDATED', { id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. FACTURAS
app.get('/api/invoices', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM invoices ORDER BY createdAt DESC');
    return res.json(rows);
  } catch (err) {
    console.error('Error al obtener facturas:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  const { id, supplier, service, invoiceNumber, emissionDate, deliveryDate, value, signed, orderStd, oc, enFacture, delivered, pdfPath, pdfOriginalName } = req.body;
  const invId = id || ('inv-' + Date.now());

  try {
    await pool.query(`
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
    `, [invId, supplier, service, invoiceNumber, emissionDate, deliveryDate, Number(value) || 0, signed || 'NO', orderStd || 'NO', oc || '', enFacture || 'AÚN NO', delivered || 'NO', pdfPath || null, pdfOriginalName || null]);

    broadcastLiveChange('INVOICES_UPDATED', { id: invId });
    res.status(201).json({ success: true, id: invId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM invoices WHERE id = ?', [req.params.id]);
    broadcastLiveChange('INVOICES_UPDATED', { id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. MÓDULO CRM DE COTIZACIONES (RFQS Y COTIZACIONES MULTI-PROVEEDOR)
app.get('/api/crm/quotations', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM crm_quotations ORDER BY createdAt DESC');
    const formatted = rows.map(r => ({
      ...r,
      suppliers: typeof r.suppliers === 'string' ? JSON.parse(r.suppliers) : (r.suppliers || [])
    }));
    res.json(formatted);
  } catch (err) {
    console.error('Error en GET /api/crm/quotations:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/crm/quotations', async (req, res) => {
  const { id, code, title, category, description, urgency, deadline, suppliers, selectedSupplier, finalAmount, status, notes } = req.body;
  const crmId = id || ('crm-' + Date.now());
  const crmCode = code || ('COT-REQ-' + Date.now().toString().slice(-4));
  const suppliersJson = JSON.stringify(suppliers || []);

  try {
    await pool.query(`
      INSERT INTO crm_quotations (id, code, title, category, description, urgency, deadline, suppliers, selectedSupplier, finalAmount, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        title = VALUES(title),
        category = VALUES(category),
        description = VALUES(description),
        urgency = VALUES(urgency),
        deadline = VALUES(deadline),
        suppliers = VALUES(suppliers),
        selectedSupplier = VALUES(selectedSupplier),
        finalAmount = VALUES(finalAmount),
        status = VALUES(status),
        notes = VALUES(notes);
    `, [crmId, crmCode, title, category || 'General', description || '', urgency || 'Media', deadline || '', suppliersJson, selectedSupplier || null, Number(finalAmount) || 0, status || 'EN_BUSQUEDA', notes || '']);

    broadcastLiveChange('CRM_UPDATED', { id: crmId });
    res.status(201).json({ success: true, id: crmId, code: crmCode });
  } catch (err) {
    console.error('Error en POST /api/crm/quotations:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/crm/quotations/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM crm_quotations WHERE id = ?', [req.params.id]);
    broadcastLiveChange('CRM_UPDATED', { id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. SUBIDA FÍSICA DE ARCHIVOS PDF A CARPETA LOCAL (uploads/)
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

// 5. USUARIOS
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, name, role, area, status, createdAt FROM users ORDER BY name ASC');
    return res.json(rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { id, username, password, name, role, area, status } = req.body;
  const uId = id || ('usr-' + Date.now());
  const pass = password || '123456';
  try {
    await pool.query(`
      INSERT INTO users (id, username, password, name, role, area, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name), 
        role = VALUES(role), 
        area = VALUES(area),
        status = VALUES(status),
        password = IF(VALUES(password) != '', VALUES(password), password);
    `, [uId, username, pass, name, role || 'admin', area || 'General', status || 'Activo']);
    res.status(201).json({ success: true, id: uId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. ENRUTAMIENTO SPA (SINGLE PAGE APPLICATION) - COMPATIBLE CON EXPRESS v5
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
    return res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  }
  next();
});

// INICIAR SERVIDOR EXPRESS
const server = app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`🚀 SISTEMA ALIMENTOS ENRIKO (EXPRESS + MYSQL + LOCAL STORAGE)`);
  console.log(`🌐 Acceso Web: http://localhost:${PORT}`);
  console.log(`🗄️ Base de datos: MySQL GESTION_FACTURAS (localhost:3306)`);
  console.log(`📁 Carpeta de PDFs locales: ${UPLOADS_DIR}`);
  console.log(`=============================================================\n`);
});

runStartupScript();
buildFrontendBundle();