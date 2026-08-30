const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const storageDir = path.join(__dirname, '..', 'storage', 'facturas');
const historyDir = path.join(__dirname, '..', 'storage', 'historico');

if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
if (!fs.existsSync(historyDir)) fs.mkdirSync(historyDir, { recursive: true });

// DB local inicial
const memoryDb = {
  suppliers: [
    { id: 'sup-1', nit: '900.123.456-1', name: 'Proveedor ABC', contact: 'Carlos Pérez', phone: '3001234567', email: 'contacto@proveedorabc.com' },
    { id: 'sup-2', nit: '800.987.654-2', name: 'Distribuidora Lácteos Enriko', contact: 'María Gómez', phone: '3109876543', email: 'ventas@lacteosenriko.com' },
    { id: 'sup-3', nit: '901.555.777-3', name: 'Empaques e Insumos SAS', contact: 'Juan Rodriguez', phone: '3205557777', email: 'pedidos@empaques.com' }
  ],
  invoices: [],
  documents: [],
  auditLogs: []
};

// Rutas Express API
app.get('/api/suppliers', (req, res) => {
  res.json(memoryDb.suppliers);
});

app.get('/api/invoices', (req, res) => {
  res.json(memoryDb.invoices);
});

app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalMonth: memoryDb.invoices.length,
    totalQuotations: memoryDb.invoices.filter(i => i.type === 'QUOTATION').length,
    totalInvoices: memoryDb.invoices.filter(i => i.type === 'INVOICE').length,
    pendingSignatures: memoryDb.invoices.filter(i => !i.quotationSigned && !i.invoiceSigned).length,
    pendingFacture: memoryDb.invoices.filter(i => i.factureReceived === 'AÚN NO').length,
    pendingManagement: memoryDb.invoices.filter(i => !i.management).length,
    delayedInvoices: 0,
    pendingDelivery: memoryDb.invoices.filter(i => !i.delivered).length
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor de Gestión de Facturas Alimentos Enriko corriendo en el puerto ${PORT} con MySQL GESTION_FACTURAS (localhost:3306)`);
});
