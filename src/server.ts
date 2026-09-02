import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prismaService } from './services/prisma.service';
import { fileStorageService } from './services/fileStorage.service';
import { calculateInvoiceStatus } from './utils/statusCalculator';
import { Invoice, DocumentType } from './types';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));


// Configuración Multer para recibir archivos en memoria y guardarlos mediante fileStorageService
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Asegurar estructura base /storage/facturas/YYYY/MM-Mes/
fileStorageService.ensureBaseDirectories();

// -------------------------------------------------------------
// PROVEEDORES
// -------------------------------------------------------------
app.get('/api/suppliers', async (req: Request, res: Response) => {
  try {
    const suppliers = await prismaService.getSuppliers();
    res.json(suppliers);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/suppliers', async (req: Request, res: Response) => {
  const { nit, name, contact, phone, email } = req.body;
  if (!nit || !name) {
    return res.status(400).json({ error: 'NIT y Nombre de proveedor son obligatorios' });
  }
  try {
    const newSupplier = await prismaService.addSupplier({ nit, name, contact, phone, email });
    res.status(201).json(newSupplier);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/suppliers/:id', async (req: Request, res: Response) => {
  try {
    await prismaService.deleteSupplier(String(req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// FACTURAS / COTIZACIONES
// -------------------------------------------------------------
app.get('/api/invoices', async (req: Request, res: Response) => {
  try {
    const invoices = await prismaService.getInvoices();
    
    // Agregar campos calculados y documentos
    const enrichedInvoices = await Promise.all(invoices.map(async inv => {
      const status = calculateInvoiceStatus(inv);
      const documents = await prismaService.getDocumentsByInvoiceId(inv.id);
      return {
        ...inv,
        calculatedStatusText: status.processStatusText,
        calculatedBadgeClass: status.processStatusBadgeClass,
        alertText: status.alertText,
        alertBadgeClass: status.alertBadgeClass,
        isUrgent: status.isUrgent,
        documents
      };
    }));

    res.json(enrichedInvoices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/invoices/:id', async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    const invoice = await prismaService.getInvoiceById(id);
    if (!invoice) return res.status(404).json({ error: 'Registro no encontrado' });

    const status = calculateInvoiceStatus(invoice);
    const documents = await prismaService.getDocumentsByInvoiceId(invoice.id);
    const history = await prismaService.getAuditLogsByInvoiceId(invoice.id);

    res.json({
      ...invoice,
      calculatedStatusText: status.processStatusText,
      calculatedBadgeClass: status.processStatusBadgeClass,
      alertText: status.alertText,
      alertBadgeClass: status.alertBadgeClass,
      isUrgent: status.isUrgent,
      documents,
      history
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Crear Cotización o Factura
app.post('/api/invoices', async (req: Request, res: Response) => {
  const {
    supplierId,
    supplierName,
    type,
    description,
    invoiceCode,
    remissionDate,
    deliveryDate,
    amount,
    relatedQuotationId,
    relatedQuotationCode
  } = req.body;

  if (!supplierId || !supplierName || !type || !description || !invoiceCode || !remissionDate || amount === undefined) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const newInvoice = await prismaService.addInvoice({
      supplierId,
      supplierName,
      type: type as 'QUOTATION' | 'INVOICE',
      description,
      invoiceCode,
      remissionDate,
      deliveryDate,
      amount: Number(amount),
      quotationSigned: false,
      invoiceSigned: false,
      factureReceived: 'AÚN NO',
      management: false,
      delivered: false,
      relatedQuotationId,
      relatedQuotationCode
    });

    res.status(201).json(newInvoice);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar estados (Firmas, Facture, Gestión, Entrega)
app.patch('/api/invoices/:id/status', async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    const invoice = await prismaService.getInvoiceById(id);
    if (!invoice) return res.status(404).json({ error: 'Registro no encontrado' });

    const {
      quotationSigned,
      invoiceSigned,
      factureReceived,
      management,
      delivered,
      currentUser = 'Usuario Administrador'
    } = req.body;

    const updates: Partial<Invoice> = {};

    // Cotización Firmada
    if (quotationSigned !== undefined && quotationSigned !== invoice.quotationSigned) {
      updates.quotationSigned = quotationSigned;
      if (quotationSigned) {
        updates.quotationSignedDate = new Date().toISOString();
        updates.quotationSignedBy = currentUser;
        await prismaService.addAuditLog(id, 'Cotización marcada como FIRMADA', currentUser);
      } else {
        await prismaService.addAuditLog(id, 'Cotización marcada como PENDIENTE DE FIRMA', currentUser);
      }
    }

    // Factura Firmada
    if (invoiceSigned !== undefined && invoiceSigned !== invoice.invoiceSigned) {
      updates.invoiceSigned = invoiceSigned;
      if (invoiceSigned) {
        updates.invoiceSignedDate = new Date().toISOString();
        updates.invoiceSignedBy = currentUser;
        await prismaService.addAuditLog(id, 'Factura marcada como FIRMADA', currentUser);
      } else {
        await prismaService.addAuditLog(id, 'Factura marcada como PENDIENTE DE FIRMA', currentUser);
      }
    }

    // Llegó en Facture
    if (factureReceived !== undefined && factureReceived !== invoice.factureReceived) {
      updates.factureReceived = factureReceived;
      if (factureReceived === 'SÍ') {
        updates.factureReceivedDate = new Date().toISOString();
        updates.factureReceivedBy = currentUser;
        await prismaService.addAuditLog(id, 'Llegada confirmada en Facture', currentUser, `Registrado por ${currentUser}`);
      } else {
        updates.factureReceivedDate = undefined;
        updates.factureReceivedBy = undefined;
        await prismaService.addAuditLog(id, 'Estado en Facture revertido a AÚN NO', currentUser);
      }
    }

    // Gestión
    if (management !== undefined && management !== invoice.management) {
      updates.management = management;
      if (management) {
        updates.managementDate = new Date().toISOString();
        updates.managedBy = currentUser;
        await prismaService.addAuditLog(id, 'Gestión realizada', currentUser);
      } else {
        await prismaService.addAuditLog(id, 'Gestión revertida', currentUser);
      }
    }

    // Entrega
    if (delivered !== undefined && delivered !== invoice.delivered) {
      updates.delivered = delivered;
      if (delivered) {
        updates.deliveredDate = new Date().toISOString();
        updates.deliveredBy = currentUser;
        await prismaService.addAuditLog(id, 'Factura marcada como ENTREGADA', currentUser);
      } else {
        await prismaService.addAuditLog(id, 'Entrega revertida', currentUser);
      }
    }

    const updatedInvoice = await prismaService.updateInvoice(id, updates, currentUser);
    res.json(updatedInvoice);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ADJUNTAR Y REEMPLAZAR DOCUMENTOS
// -------------------------------------------------------------
app.post('/api/invoices/:id/documents', upload.single('file'), async (req: Request, res: Response) => {
  const id = String(req.params.id);
  try {
    const invoice = await prismaService.getInvoiceById(id);
    if (!invoice) return res.status(404).json({ error: 'Registro no encontrado' });

    if (!req.file) {
      return res.status(400).json({ error: 'Archivo no válido o formato no soportado (Solo PDF, JPG, JPEG, PNG)' });
    }

    const docType = (req.body.docType || (invoice.type === 'QUOTATION' ? 'QUOTATION' : 'INVOICE')) as DocumentType;
    const currentUser = String(req.body.uploadedBy || 'Usuario Administrador');

    // Guardar archivo físicamente en la estructura organizada
    const { relativePath, storedName } = fileStorageService.saveFile(
      req.file.buffer,
      req.file.originalname,
      invoice.supplierName,
      invoice.invoiceCode,
      docType,
      new Date(invoice.remissionDate)
    );

    // Registrar en DB con Prisma
    const documentRecord = await prismaService.addDocument({
      invoiceId: id,
      type: docType,
      originalName: req.file.originalname,
      storedName,
      relativePath,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: currentUser
    });

    // Actualizar ruta en la factura
    const updates: Partial<Invoice> = {};
    if (docType === 'QUOTATION') updates.quotationDocumentPath = relativePath;
    if (docType === 'INVOICE') updates.invoiceDocumentPath = relativePath;
    if (docType === 'SIGNED_QUOTATION') updates.signedQuotationDocumentPath = relativePath;
    if (docType === 'SIGNED_INVOICE') updates.signedInvoiceDocumentPath = relativePath;

    await prismaService.updateInvoice(id, updates, currentUser);
    await prismaService.addAuditLog(id, `Documento adjuntado (${req.file.originalname})`, currentUser, `Ruta: ${relativePath}`);

    res.status(201).json(documentRecord);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reemplazar documento
app.put('/api/documents/:documentId/replace', upload.single('file'), async (req: Request, res: Response) => {
  const documentId = String(req.params.documentId);
  try {
    const existingDoc = await prismaService.getDocumentById(documentId);
    if (!existingDoc) return res.status(404).json({ error: 'Documento no encontrado' });

    const invoice = await prismaService.getInvoiceById(existingDoc.invoiceId);
    if (!invoice) return res.status(404).json({ error: 'Registro asociado no encontrado' });

    if (!req.file) {
      return res.status(400).json({ error: 'Archivo no válido' });
    }

    const currentUser = String(req.body.uploadedBy || 'Usuario Administrador');

    // Archivar versión anterior en histórico
    fileStorageService.archiveOldFile(existingDoc.relativePath);

    // Guardar nuevo archivo
    const { relativePath, storedName } = fileStorageService.saveFile(
      req.file.buffer,
      req.file.originalname,
      invoice.supplierName,
      invoice.invoiceCode,
      existingDoc.type,
      new Date(invoice.remissionDate)
    );

    // Reemplazar documento en DB con Prisma
    const updatedDoc = await prismaService.replaceDocument(documentId, {
      invoiceId: invoice.id,
      type: existingDoc.type,
      originalName: req.file.originalname,
      storedName,
      relativePath,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: currentUser
    }, currentUser);

    const updates: Partial<Invoice> = {};
    if (existingDoc.type === 'QUOTATION') updates.quotationDocumentPath = relativePath;
    if (existingDoc.type === 'INVOICE') updates.invoiceDocumentPath = relativePath;
    if (existingDoc.type === 'SIGNED_QUOTATION') updates.signedQuotationDocumentPath = relativePath;
    if (existingDoc.type === 'SIGNED_INVOICE') updates.signedInvoiceDocumentPath = relativePath;

    await prismaService.updateInvoice(invoice.id, updates, currentUser);
    await prismaService.addAuditLog(invoice.id, `Documento reemplazado por ${req.file.originalname}`, currentUser);

    res.json(updatedDoc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// ENDPOINTS PROTEGIDOS DE VISUALIZACIÓN / DESCARGA
// -------------------------------------------------------------
app.get('/api/documents/:documentId/view', async (req: Request, res: Response) => {
  const documentId = String(req.params.documentId);
  try {
    const doc = await prismaService.getDocumentById(documentId);
    if (!doc) return res.status(404).send('Documento no encontrado');

    const absolutePath = path.join(process.cwd(), doc.relativePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).send('El archivo no existe en el almacenamiento del servidor');
    }

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalName}"`);
    fs.createReadStream(absolutePath).pipe(res);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

app.get('/api/documents/:documentId/download', async (req: Request, res: Response) => {
  const documentId = String(req.params.documentId);
  try {
    const doc = await prismaService.getDocumentById(documentId);
    if (!doc) return res.status(404).send('Documento no encontrado');

    const absolutePath = path.join(process.cwd(), doc.relativePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).send('El archivo no existe en el almacenamiento del servidor');
    }

    res.download(absolutePath, doc.originalName);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// -------------------------------------------------------------
// DASHBOARD METRICAS
// -------------------------------------------------------------
app.get('/api/dashboard/stats', async (req: Request, res: Response) => {
  try {
    const invoices = await prismaService.getInvoices();
    const now = new Date();

    let totalMonth = 0;
    let totalQuotations = 0;
    let totalInvoices = 0;
    let pendingSignatures = 0;
    let pendingFacture = 0;
    let pendingManagement = 0;
    let delayedInvoices = 0;
    let pendingDelivery = 0;

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    invoices.forEach(inv => {
      const invDate = new Date(inv.remissionDate);
      if (invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear) {
        totalMonth++;
      }

      if (inv.type === 'QUOTATION') {
        totalQuotations++;
        if (!inv.quotationSigned) pendingSignatures++;
      } else {
        totalInvoices++;
        if (!inv.invoiceSigned) pendingSignatures++;
        if (inv.factureReceived === 'AÚN NO') pendingFacture++;
        if (!inv.management) pendingManagement++;
        if (!inv.delivered) pendingDelivery++;

        const status = calculateInvoiceStatus(inv, now);
        if (status.daysPending >= 2 && !inv.management) {
          delayedInvoices++;
        }
      }
    });

    res.json({
      totalMonth,
      totalQuotations,
      totalInvoices,
      pendingSignatures,
      pendingFacture,
      pendingManagement,
      delayedInvoices,
      pendingDelivery
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar Invoice / Cotización
app.delete('/api/invoices/:id', async (req: Request, res: Response) => {
  try {
    await prismaService.deleteInvoice(String(req.params.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Convertir Cotización a Factura
app.post('/api/invoices/:id/convert', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { invoiceCode } = req.body;
  try {
    const converted = await prismaService.convertQuotationToInvoice(String(id), invoiceCode || `FAC-${Date.now().toString().slice(-4)}`);
    res.status(201).json(converted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Usuarios
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await prismaService.getUsers();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req: Request, res: Response) => {
  const { username, name, role } = req.body;
  try {
    const newUser = await prismaService.addUser({ username, name, role });
    res.status(201).json(newUser);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Historial & Auditoría
app.get('/api/history', async (req: Request, res: Response) => {
  try {
    const logs = await prismaService.getAllAuditLogs();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, async () => {
  console.log(`\n=============================================================`);
  console.log(`🚀 SISTEMA ALIMENTOS ENRIKO (EXPRESS + PRISMA ORM)`);
  console.log(`🌐 Acceso Web: http://localhost:${PORT}`);
  console.log(`🗄️ Base de datos: MySQL GESTION_FACTURAS (localhost:3306)`);
  console.log(`=============================================================\n`);
});

