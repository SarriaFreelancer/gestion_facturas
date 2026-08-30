const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'GESTION_FACTURAS',
  multipleStatements: true
};

async function getDbConnection() {
  return await mysql.createConnection(dbConfig);
}

// 1. Inicialización SQL
async function runStartupScript() {
  try {
    const conn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true
    });

    const sqlPath = path.join(__dirname, '..', 'GESTION_FACTURAS.sql');
    if (fs.existsSync(sqlPath)) {
      const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
      await conn.query(sqlContent);
    }

    // Asegurar tabla de usuarios
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'Activo',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insertar usuarios de muestra
    await conn.query(`
      INSERT IGNORE INTO users (id, username, name, role, status) VALUES
      ('usr-1', 'JR', 'Juan Rodríguez', 'Administrador General', 'Activo'),
      ('usr-2', 'CP', 'Carlos Pérez', 'Gestor de Compras', 'Activo');
    `);

    await conn.end();
  } catch (e) {
    console.error('Error SQL Startup:', e.message);
  }
}

// -------------------------------------------------------------
// ENDPOINTS DE MÓDULOS FULL
// -------------------------------------------------------------

// Proveedores (Crear / Listar / Eliminar)
app.get('/api/suppliers', async (req, res) => {
  try {
    const conn = await getDbConnection();
    const [rows] = await conn.query('SELECT * FROM suppliers ORDER BY name ASC');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/suppliers', async (req, res) => {
  const { nit, name, contact, phone, email } = req.body;
  const id = 'sup-' + Date.now();
  try {
    const conn = await getDbConnection();
    await conn.query('INSERT INTO suppliers (id, nit, name, contact, phone, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())', 
      [id, nit, name, contact || '', phone || '', email || '']);
    await conn.end();
    res.status(201).json({ id, name, nit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    const conn = await getDbConnection();
    await conn.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Facturas y Cotizaciones
app.get('/api/invoices', async (req, res) => {
  try {
    const conn = await getDbConnection();
    const [rows] = await conn.query('SELECT * FROM invoices ORDER BY createdAt DESC');
    await conn.end();

    const enriched = rows.map(inv => {
      const remissionDate = new Date(inv.remissionDate);
      const daysPending = Math.floor(Math.abs(new Date().getTime() - remissionDate.getTime()) / (1000 * 60 * 60 * 24));

      let alertText = null;
      let alertBadgeClass = null;

      if (inv.type === 'INVOICE') {
        if (inv.factureReceived === 'AÚN NO' && daysPending >= 3) {
          alertText = '🔴 URGENTE — Pendiente de recepción en Facture';
          alertBadgeClass = 'bg-red-100 text-red-800 border-red-400 font-bold';
        } else if (inv.factureReceived === 'AÚN NO' && !inv.management) {
          alertText = '🔴 Pendiente de Facture y gestión';
          alertBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
        } else if (inv.factureReceived === 'SÍ' && !inv.management) {
          alertText = '🟡 Llegó en Facture — Pendiente de gestión';
          alertBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
        } else if (inv.factureReceived === 'SÍ' && inv.management) {
          alertText = '🟢 Gestionada';
          alertBadgeClass = 'bg-green-100 text-green-800 border-green-300';
        }
      }

      return {
        ...inv,
        quotationSigned: Boolean(inv.quotationSigned),
        invoiceSigned: Boolean(inv.invoiceSigned),
        management: Boolean(inv.management),
        delivered: Boolean(inv.delivered),
        alertText,
        alertBadgeClass
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  const { supplierId, supplierName, type, description, invoiceCode, remissionDate, amount } = req.body;
  const id = 'inv-' + Date.now();

  try {
    const conn = await getDbConnection();
    await conn.query(`
      INSERT INTO invoices 
      (id, supplierId, supplierName, type, description, invoiceCode, remissionDate, amount, quotationSigned, invoiceSigned, factureReceived, management, delivered, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'AÚN NO', 0, 0, NOW(), NOW())
    `, [id, supplierId, supplierName, type, description, invoiceCode, new Date(remissionDate), Number(amount)]);

    // Registrar en auditoría
    await conn.query('INSERT INTO audit_logs (id, invoiceId, action, user, details, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
      ['log-' + Date.now(), id, `${type === 'QUOTATION' ? 'Cotización' : 'Factura'} registrada`, 'Juan Rodríguez', `Código: ${invoiceCode}`]);

    await conn.end();
    res.status(201).json({ id, invoiceCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/invoices/:id/status', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const fields = [];
  const values = [];
  let actionLog = 'Actualización de estado';

  if (updates.quotationSigned !== undefined) {
    fields.push('quotationSigned = ?', 'quotationSignedDate = ?');
    values.push(updates.quotationSigned ? 1 : 0, updates.quotationSigned ? new Date() : null);
    actionLog = updates.quotationSigned ? 'Cotización firmada SÍ' : 'Cotización firmada NO';
  }

  if (updates.invoiceSigned !== undefined) {
    fields.push('invoiceSigned = ?', 'invoiceSignedDate = ?');
    values.push(updates.invoiceSigned ? 1 : 0, updates.invoiceSigned ? new Date() : null);
    actionLog = updates.invoiceSigned ? 'Factura firmada SÍ' : 'Factura firmada NO';
  }

  if (updates.factureReceived !== undefined) {
    fields.push('factureReceived = ?', 'factureReceivedDate = ?', 'factureReceivedBy = ?');
    values.push(updates.factureReceived, updates.factureReceived === 'SÍ' ? new Date() : null, updates.currentUser || 'Juan Rodríguez');
    actionLog = `Llegó en Facture: ${updates.factureReceived}`;
  }

  if (updates.management !== undefined) {
    fields.push('management = ?', 'managementDate = ?');
    values.push(updates.management ? 1 : 0, updates.management ? new Date() : null);
    actionLog = updates.management ? 'Gestión realizada SÍ' : 'Gestión revertida NO';
  }

  if (updates.delivered !== undefined) {
    fields.push('delivered = ?', 'deliveredDate = ?');
    values.push(updates.delivered ? 1 : 0, updates.delivered ? new Date() : null);
    actionLog = updates.delivered ? 'Factura entregada SÍ' : 'Entrega revertida NO';
  }

  if (fields.length === 0) return res.json({ message: 'Sin cambios' });

  values.push(id);
  const sql = `UPDATE invoices SET ${fields.join(', ')} WHERE id = ?`;

  try {
    const conn = await getDbConnection();
    await conn.query(sql, values);
    
    // Registrar auditoría
    await conn.query('INSERT INTO audit_logs (id, invoiceId, action, user, details, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
      ['log-' + Date.now(), id, actionLog, updates.currentUser || 'Juan Rodríguez', `Factura ${id}`]);

    await conn.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Usuarios
app.get('/api/users', async (req, res) => {
  try {
    const conn = await getDbConnection();
    const [rows] = await conn.query('SELECT * FROM users ORDER BY name ASC');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { username, name, role } = req.body;
  const id = 'usr-' + Date.now();
  try {
    const conn = await getDbConnection();
    await conn.query('INSERT INTO users (id, username, name, role, status, createdAt) VALUES (?, ?, ?, ?, "Activo", NOW())', [id, username, name, role]);
    await conn.end();
    res.status(201).json({ id, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Historial & Auditoría
app.get('/api/history', async (req, res) => {
  try {
    const conn = await getDbConnection();
    const [rows] = await conn.query('SELECT * FROM audit_logs ORDER BY createdAt DESC LIMIT 50');
    await conn.end();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Métricas Dashboard
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const conn = await getDbConnection();
    const [rows] = await conn.query('SELECT * FROM invoices');
    await conn.end();

    const stats = {
      totalMonth: rows.length,
      totalQuotations: rows.filter(r => r.type === 'QUOTATION').length,
      totalInvoices: rows.filter(r => r.type === 'INVOICE').length,
      pendingSignatures: rows.filter(r => (!r.quotationSigned && r.type === 'QUOTATION') || (!r.invoiceSigned && r.type === 'INVOICE')).length,
      pendingFacture: rows.filter(r => r.factureReceived === 'AÚN NO').length,
      pendingManagement: rows.filter(r => !r.management).length,
      delayedInvoices: rows.filter(r => {
        const days = Math.floor(Math.abs(new Date().getTime() - new Date(r.remissionDate).getTime()) / (1000 * 60 * 60 * 24));
        return days >= 2 && !r.management;
      }).length,
      pendingDelivery: rows.filter(r => !r.delivered).length
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

runStartupScript().then(() => {
  app.listen(PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`🚀 SISTEMA ALIMENTOS ENRIKO MÓDULOS FULL COMPLETOS`);
    console.log(`🌐 Acceso Web: http://localhost:${PORT}`);
    console.log(`🗄️ Base de datos: MySQL GESTION_FACTURAS (localhost:3306)`);
    console.log(`=============================================================\n`);
  });
});
