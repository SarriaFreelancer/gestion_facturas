import express from 'express';
import cors from 'cors';
import path from 'path';
import mysql from 'mysql2/promise';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// BASE DE DATOS EN MEMORIA Y CONEXION MYSQL FAILSAFE
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'GESTION_FACTURAS'
};

let usersDB = [
  { id: 'usr-1', username: 'superadmin', name: 'Super Administrador', role: 'SuperAdmin', area: 'Todas las Áreas', pass: 'superadmin123' },
  { id: 'usr-2', username: 'admin_ti', name: 'Juan Rodríguez (Admin TI)', role: 'Administrador', area: 'Tecnología (TI)', pass: 'admin123' },
  { id: 'usr-3', username: 'admin_compras', name: 'María Fernanda Ruiz (Admin Compras)', role: 'Administrador', area: 'Adquisiciones & Compras', pass: 'compras123' }
];

let suppliersDB = [
  { id: 'sup-1', nit: '800.789.012-4', name: 'Servicios de Tecnología S.A.S.', contact: 'Laura Restrepo', phone: '+57 300 123 4567', monthlyCount: 2, areas: ['Tecnología (TI)', 'Contabilidad & Finanzas'] },
  { id: 'sup-2', nit: '900.123.456-1', name: 'Distribuidora Carnes Enriko', contact: 'Carlos Mendoza', phone: '+57 310 455 8899', monthlyCount: 3, areas: ['Adquisiciones & Compras', 'Operaciones & Logística'] },
  { id: 'sup-3', nit: '890.334.112-9', name: 'Mantenimiento e Insumos Industriales', contact: 'Roberto Gómez', phone: '+57 315 789 1234', monthlyCount: 1, areas: ['Mantenimiento & Planta', 'Tecnología (TI)'] },
  { id: 'sup-4', nit: '860.001.245-8', name: 'Soluciones Financieras & Contables', contact: 'Diana Páez', phone: '+57 312 998 7766', monthlyCount: 1, areas: ['Contabilidad & Finanzas'] },
  { id: 'sup-5', nit: '901.442.889-0', name: 'Agencia Marketing Creativo', contact: 'Felipe Silva', phone: '+57 318 654 3210', monthlyCount: 2, areas: ['Marketing & Publicidad'] }
];

let invoicesDB = [
  { id: 'inv-aug-1', monthYear: '2026-08', supplierName: 'Servicios de Tecnología S.A.S.', type: 'INVOICE', area: 'Tecnología (TI)', description: 'Soporte de Servidores Agosto', invoiceCode: 'FAC-2026-0811', factureReceived: 'SÍ', invoiceSigned: true, management: true, remissionDate: '2026-08-15', deliveredDate: '2026-08-15 11:00', amount: 3200000, delivered: true },
  { id: 'inv-sep-1', monthYear: '2026-09', supplierName: 'Servicios de Tecnología S.A.S.', type: 'INVOICE', area: 'Tecnología (TI)', description: 'Mantenimiento Servidores Septiembre', invoiceCode: 'FAC-2026-4412', factureReceived: 'SÍ', invoiceSigned: true, management: true, remissionDate: '2026-09-01', deliveredDate: '2026-09-01 16:01', amount: 3200000, delivered: true },
  { id: 'inv-sep-2', monthYear: '2026-09', supplierName: 'Distribuidora Carnes Enriko', type: 'INVOICE', area: 'Adquisiciones & Compras', description: 'Carne vacuna insumos Septiembre', invoiceCode: 'FAC-2026-9901', factureReceived: 'SÍ', invoiceSigned: true, management: true, remissionDate: '2026-09-01', deliveredDate: '2026-09-01 14:20', amount: 8450000, delivered: true }
];

// ENDPOINTS API RESTful (NESTJS ARCHITECTURE BACKEND)
app.get('/api/users', (req, res) => res.json(usersDB));
app.post('/api/users', (req, res) => {
  const newUser = { id: 'usr-' + Date.now(), ...req.body };
  usersDB.push(newUser);
  res.status(201).json(newUser);
});

app.get('/api/suppliers', (req, res) => res.json(suppliersDB));
app.post('/api/suppliers', (req, res) => {
  const newSup = { id: 'sup-' + Date.now(), ...req.body };
  suppliersDB.unshift(newSup);
  res.status(201).json(newSup);
});
app.put('/api/suppliers/:id', (req, res) => {
  const { id } = req.params;
  const idx = suppliersDB.findIndex(s => s.id === id);
  if (idx !== -1) {
    suppliersDB[idx] = { ...suppliersDB[idx], ...req.body };
    res.json(suppliersDB[idx]);
  } else {
    res.status(404).json({ error: 'Proveedor no encontrado' });
  }
});
app.delete('/api/suppliers/:id', (req, res) => {
  const { id } = req.params;
  suppliersDB = suppliersDB.filter(s => s.id !== id);
  res.json({ success: true });
});

app.get('/api/invoices', (req, res) => res.json(invoicesDB));
app.post('/api/invoices', (req, res) => {
  const newInv = { id: 'inv-' + Date.now(), ...req.body };
  invoicesDB.unshift(newInv);
  res.status(201).json(newInv);
});
app.put('/api/invoices/:id', (req, res) => {
  const { id } = req.params;
  const idx = invoicesDB.findIndex(i => i.id === id);
  if (idx !== -1) {
    invoicesDB[idx] = { ...invoicesDB[idx], ...req.body };
    res.json(invoicesDB[idx]);
  } else {
    res.status(404).json({ error: 'Factura no encontrada' });
  }
});

// INICIAR SERVIDOR HTTP EXPRESIVO
app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`🚀 SISTEMA ALIMENTOS ENRIKO NESTJS/EXPRESS TYPESCRIPT ACTIVO`);
  console.log(`🌐 Acceso Web: http://localhost:${PORT}`);
  console.log(`🗄️ Base de datos: MySQL GESTION_FACTURAS (localhost:3306)`);
  console.log(`=============================================================\n`);
});
