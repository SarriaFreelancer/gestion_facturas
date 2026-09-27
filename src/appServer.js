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
      'Icons.js',
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
      'TechInventoryModule.js',
      'TechBudgetModule.js',
      'AreasModule.js',
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

    // 5. Tabla de Áreas Organizacionales (con 1er y 2do Responsable)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_areas (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        director VARCHAR(255) NOT NULL,
        headOrCoord VARCHAR(255) NULL,
        email VARCHAR(255) NULL,
        budgetLimit DECIMAL(15,2) DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 6. Tabla de Inventario de Equipos y Periféricos TI
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tech_inventory (
        id VARCHAR(100) PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        brandModel VARCHAR(255) NULL,
        serialCode VARCHAR(100) NULL,
        quantity INT DEFAULT 0,
        unit VARCHAR(50) DEFAULT 'Unidades',
        areaAssigned VARCHAR(150) NULL,
        status VARCHAR(50) DEFAULT 'Disponible',
        notes TEXT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // 7. Tabla de Presupuestos Tecnológicos Anuales
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tech_budgets (
        id VARCHAR(100) PRIMARY KEY,
        year VARCHAR(10) NOT NULL,
        area VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        itemType VARCHAR(255) NOT NULL,
        quantity INT DEFAULT 1,
        unitCost DECIMAL(15,2) DEFAULT 0,
        totalCost DECIMAL(15,2) DEFAULT 0,
        priority VARCHAR(50) DEFAULT 'Media',
        status VARCHAR(50) DEFAULT 'Planificado',
        notes TEXT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Seed de Áreas si la tabla está vacía
    const [existingAreas] = await pool.query('SELECT COUNT(*) as count FROM company_areas');
    if (existingAreas[0].count === 0) {
      await pool.query(`
        INSERT INTO company_areas (id, name, director, headOrCoord, email, budgetLimit) VALUES
        ('area-1', 'Tecnología (TI)', 'Ing. Carlos Mendoza (Director TI)', 'David Sarria (Líder Sistemas)', 'ti@alimentosenriko.com', 45000000),
        ('area-2', 'Adquisiciones & Compras', 'Dra. Patricia Gómez (Directora Compras)', 'Andrea Valbuena (Coordinadora)', 'compras@alimentosenriko.com', 25000000),
        ('area-3', 'Contabilidad & Finanzas', 'Dr. Roberto Meza (Director Financiero)', 'Juliana Rivas (Jefe Contable)', 'contabilidad@alimentosenriko.com', 18000000),
        ('area-4', 'Operaciones & Planta', 'Ing. Fernando Castro (Director Operaciones)', 'Mauricio Pardo (Jefe Planta)', 'planta@alimentosenriko.com', 35000000),
        ('area-5', 'Dirección General', 'Gerencia General Enriko', 'Asistente de Dirección', 'gerencia@alimentosenriko.com', 60000000);
      `);
    }

    // Seed de Inventario TI si la tabla está vacía
    const [existingInv] = await pool.query('SELECT COUNT(*) as count FROM tech_inventory');
    if (existingInv[0].count === 0) {
      await pool.query(`
        INSERT INTO tech_inventory (id, category, name, brandModel, serialCode, quantity, unit, areaAssigned, status, notes) VALUES
        ('ti-1', 'Periféricos', 'Mouse Ergonómico Inalámbrico', 'Logitech MX Master 3S', 'SN-LOG-9921', 9, 'Unidades', 'Tecnología (TI)', 'Disponible', 'Equipos listos para entrega inmediata a puestos de trabajo.'),
        ('ti-2', 'Periféricos', 'Teclado Mecánico Silencioso', 'Keychron K3 Pro', 'SN-KCH-4412', 6, 'Unidades', 'Tecnología (TI)', 'Disponible', 'Distribución en español para áreas administrativas.'),
        ('ti-3', 'Monitores', 'Monitor 27" 4K IPS UltraWide', 'Dell UltraSharp U2723QE', 'SN-DEL-7701', 4, 'Unidades', 'Tecnología (TI)', 'Disponible', 'Monitores para desarrollo y analítica de datos.'),
        ('ti-4', 'Equipos de Cómputo', 'Laptop ThinkPad T14s Core i7 32GB', 'Lenovo ThinkPad T14s Gen 4', 'SN-LEN-8819', 3, 'Unidades', 'Tecnología (TI)', 'Disponible', 'Portátiles de alto rendimiento corporativo.'),
        ('ti-5', 'Redes & Conectividad', 'Switch Administrable 24 Puertos PoE+', 'Ubiquiti UniFi Pro 24 PoE', 'SN-UBI-1029', 2, 'Unidades', 'Operaciones & Planta', 'Disponible', 'Backbone de red cableada planta principal.'),
        ('ti-6', 'Licencias de AI', 'Tokens Copilot Studio & API Keys', 'Microsoft / OpenAI Dedicated', 'LIC-AI-9021', 9, 'Tokens/Slots', 'Tecnología (TI)', 'Disponible', 'Licencias empresariales para automatización y desarrollo.');
      `);
    }

    // Seed de Presupuestos TI 2026 si está vacío
    const [existingBud] = await pool.query('SELECT COUNT(*) as count FROM tech_budgets');
    if (existingBud[0].count === 0) {
      await pool.query(`
        INSERT INTO tech_budgets (id, year, area, category, itemType, quantity, unitCost, totalCost, priority, status, notes) VALUES
        ('bud-1', '2026', 'Tecnología (TI)', 'Licencias de AI', 'OpenAI API / ChatGPT Enterprise (Slots anuales)', 10, 1200000, 12000000, 'Alta', 'Aprobado', 'Plataformas de IA generativa para el equipo de desarrollo y análisis.'),
        ('bud-2', '2026', 'Tecnología (TI)', 'Licencias de AI', 'GitHub Copilot Business', 8, 950000, 7600000, 'Alta', 'Aprobado', 'Asistente de desarrollo acelerado para ingenieros.'),
        ('bud-3', '2026', 'Adquisiciones & Compras', 'Periféricos', 'Kits Teclado + Mouse Inalámbricos', 12, 180000, 2160000, 'Media', 'Planificado', 'Renovación de periféricos para puestos de compras.'),
        ('bud-4', '2026', 'Contabilidad & Finanzas', 'Monitores', 'Monitores 24" Dell Full HD con Hub', 6, 850000, 5100000, 'Media', 'Planificado', 'Puestos de doble pantalla para cierres contables.'),
        ('bud-5', '2026', 'Operaciones & Planta', 'Equipos de Cómputo', 'Terminales Industriales Ruggedized', 4, 3800000, 15200000, 'Alta', 'En Revisión', 'Equipos para control de despacho en muelles de carga.');
      `);
    }

    isMySqlConnected = true;
    console.log('✅ [MySQL GESTION_FACTURAS] Conectado e inicializado exitosamente con tablas de Facturación, Inventario TI, Presupuestos y Áreas.');
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

// 6. ÁREAS ORGANIZACIONALES (CON 1ER Y 2DO RESPONSABLE)
app.get('/api/areas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM company_areas ORDER BY name ASC');
    // Enriquecer con conteo de equipos asignados y presupuestos
    const [inventoryCounts] = await pool.query(`
      SELECT areaAssigned, SUM(quantity) as totalItems 
      FROM tech_inventory 
      WHERE areaAssigned IS NOT NULL AND areaAssigned != ''
      GROUP BY areaAssigned
    `);
    const [budgetCounts] = await pool.query(`
      SELECT area, COUNT(*) as budgetCount, SUM(totalCost) as totalBudget 
      FROM tech_budgets 
      GROUP BY area
    `);

    const invMap = {};
    inventoryCounts.forEach(r => { if (r.areaAssigned) invMap[r.areaAssigned.trim().toLowerCase()] = Number(r.totalItems) || 0; });
    
    const budMap = {};
    budgetCounts.forEach(r => { if (r.area) budMap[r.area.trim().toLowerCase()] = { count: Number(r.budgetCount) || 0, total: Number(r.totalBudget) || 0 }; });

    const enriched = rows.map(a => {
      const key = (a.name || '').trim().toLowerCase();
      return {
        ...a,
        assignedTechItems: invMap[key] || 0,
        budgetItemsCount: budMap[key] ? budMap[key].count : 0,
        calculatedBudgetSum: budMap[key] ? budMap[key].total : 0
      };
    });

    return res.json(enriched);
  } catch (err) {
    console.error('Error al obtener áreas:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/areas', async (req, res) => {
  const { id, name, director, headOrCoord, email, budgetLimit } = req.body;
  const areaId = id || ('area-' + Date.now());
  try {
    await pool.query(`
      INSERT INTO company_areas (id, name, director, headOrCoord, email, budgetLimit)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name),
        director = VALUES(director),
        headOrCoord = VALUES(headOrCoord),
        email = VALUES(email),
        budgetLimit = VALUES(budgetLimit);
    `, [areaId, name, director, headOrCoord || '', email || '', Number(budgetLimit) || 0]);

    broadcastLiveChange('AREAS_UPDATED', { id: areaId });
    res.status(201).json({ success: true, id: areaId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/areas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM company_areas WHERE id = ?', [req.params.id]);
    broadcastLiveChange('AREAS_UPDATED', { id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. INVENTARIO DE EQUIPOS Y PERIFÉRICOS TI
app.get('/api/inventory', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tech_inventory ORDER BY category ASC, name ASC');
    return res.json(rows);
  } catch (err) {
    console.error('Error al obtener inventario:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  const { id, category, name, brandModel, serialCode, quantity, unit, areaAssigned, status, notes } = req.body;
  const invId = id || ('ti-' + Date.now());
  const qty = Number(quantity);
  const finalQty = isNaN(qty) ? 0 : qty;

  try {
    await pool.query(`
      INSERT INTO tech_inventory (id, category, name, brandModel, serialCode, quantity, unit, areaAssigned, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        category = VALUES(category),
        name = VALUES(name),
        brandModel = VALUES(brandModel),
        serialCode = VALUES(serialCode),
        quantity = VALUES(quantity),
        unit = VALUES(unit),
        areaAssigned = VALUES(areaAssigned),
        status = VALUES(status),
        notes = VALUES(notes);
    `, [invId, category || 'Periféricos', name, brandModel || '', serialCode || '', finalQty, unit || 'Unidades', areaAssigned || 'Tecnología (TI)', status || (finalQty > 0 ? 'Disponible' : 'Agotado'), notes || '']);

    broadcastLiveChange('INVENTORY_UPDATED', { id: invId });
    res.status(201).json({ success: true, id: invId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ACCIÓN ENTREGAR EQUIPO (DESCUENTA DE INVENTARIO DISPONIBLE)
app.post('/api/inventory/deliver', async (req, res) => {
  const { id, quantityToDeliver, deliveredToArea, recipientName, notes } = req.body;
  const toDeliver = Number(quantityToDeliver) || 1;

  try {
    const [rows] = await pool.query('SELECT * FROM tech_inventory WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Artículo de inventario no encontrado' });
    }

    const currentItem = rows[0];
    const currentQty = Number(currentItem.quantity) || 0;

    if (currentQty < toDeliver) {
      return res.status(400).json({ 
        error: `Cantidad insuficiente. Disponible: ${currentQty} ${currentItem.unit || 'uds'}, solicitada: ${toDeliver}` 
      });
    }

    const newQty = currentQty - toDeliver;
    const newStatus = newQty === 0 ? 'Agotado' : 'Disponible';
    const deliveryLog = `\n[ENTREGA ${new Date().toISOString().split('T')[0]}]: ${toDeliver} ${currentItem.unit || 'uds'} entregadas a ${recipientName || 'Personal'} (${deliveredToArea || 'Área'}). ${notes || ''}`;
    const updatedNotes = (currentItem.notes || '') + deliveryLog;

    await pool.query(`
      UPDATE tech_inventory 
      SET quantity = ?, status = ?, notes = ? 
      WHERE id = ?
    `, [newQty, newStatus, updatedNotes, id]);

    broadcastLiveChange('INVENTORY_UPDATED', { id });
    res.json({ 
      success: true, 
      id, 
      previousQuantity: currentQty, 
      deliveredQuantity: toDeliver, 
      remainingQuantity: newQty 
    });
  } catch (err) {
    console.error('Error al entregar artículo de inventario:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tech_inventory WHERE id = ?', [req.params.id]);
    broadcastLiveChange('INVENTORY_UPDATED', { id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. PRESUPUESTOS TECNOLÓGICOS ANUALES
app.get('/api/budgets', async (req, res) => {
  const { year, area } = req.query;
  try {
    let sql = 'SELECT * FROM tech_budgets WHERE 1=1';
    const params = [];
    if (year && year !== 'Todos') {
      sql += ' AND year = ?';
      params.push(year);
    }
    if (area && area !== 'Todos') {
      sql += ' AND area = ?';
      params.push(area);
    }
    sql += ' ORDER BY year DESC, area ASC, category ASC';
    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error('Error al obtener presupuestos:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/budgets', async (req, res) => {
  const { id, year, area, category, itemType, quantity, unitCost, priority, status, notes } = req.body;
  const budId = id || ('bud-' + Date.now());
  const qty = Number(quantity) || 1;
  const unit = Number(unitCost) || 0;
  const total = qty * unit;

  try {
    await pool.query(`
      INSERT INTO tech_budgets (id, year, area, category, itemType, quantity, unitCost, totalCost, priority, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        year = VALUES(year),
        area = VALUES(area),
        category = VALUES(category),
        itemType = VALUES(itemType),
        quantity = VALUES(quantity),
        unitCost = VALUES(unitCost),
        totalCost = VALUES(totalCost),
        priority = VALUES(priority),
        status = VALUES(status),
        notes = VALUES(notes);
    `, [budId, year || '2026', area || 'Tecnología (TI)', category || 'Licencias de AI', itemType, qty, unit, total, priority || 'Media', status || 'Planificado', notes || '']);

    broadcastLiveChange('BUDGETS_UPDATED', { id: budId });
    res.status(201).json({ success: true, id: budId, totalCost: total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/budgets/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tech_budgets WHERE id = ?', [req.params.id]);
    broadcastLiveChange('BUDGETS_UPDATED', { id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. LIMPIEZA DE BASE DE DATOS E INICIALIZACIÓN LIMPIA (MES ACTUAL)
app.post('/api/clean-database', async (req, res) => {
  try {
    await pool.query('DELETE FROM invoices');
    broadcastLiveChange('INVOICES_UPDATED');
    res.json({ success: true, message: 'Base de datos de facturas limpiada exitosamente.' });
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