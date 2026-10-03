'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Calendar, 
  Building2, 
  Hash, 
  DollarSign, 
  Percent, 
  Layers, 
  RefreshCw,
  Clock,
  ShieldCheck,
  CreditCard,
  Receipt
} from 'lucide-react';
import { api } from '../lib/api';
import { notifySuccess, notifyError, notifyWarning } from '../lib/alerts';
import { InternalInvoice, InternalInvoiceItem } from '../app/types';

interface SupplierInvoiceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: () => void;
  defaultClientName?: string;
  defaultClientNit?: string;
}

export const SupplierInvoiceUploadModal: React.FC<SupplierInvoiceUploadModalProps> = ({
  isOpen,
  onClose,
  onInvoiceCreated,
  defaultClientName = 'ALIMENTOS ENRIKO SAS',
  defaultClientNit = '890330035'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [docType, setDocType] = useState<'FACTURA DE VENTA' | 'NOTA CRÉDITO'>('FACTURA DE VENTA');
  const [paymentType, setPaymentType] = useState<'Crédito' | 'Contado'>('Crédito');
  const [documentNumber, setDocumentNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  
  // Proveedor / Emisor
  const [issuerName, setIssuerName] = useState('');
  const [issuerNit, setIssuerNit] = useState('');
  
  // Cliente Receptor
  const [clientName, setClientName] = useState(defaultClientName);
  const [clientNit, setClientNit] = useState(defaultClientNit);

  // Fechas y Condiciones
  const [emissionDate, setEmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentCondition, setPaymentCondition] = useState('CREDITO 30 DIAS');
  const [paymentMethod, setPaymentMethod] = useState('TRANSFERENCIA');

  // Montos
  const [subtotalAmount, setSubtotalAmount] = useState<number>(0);
  const [ivaAmount, setIvaAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [retentionAmount, setRetentionAmount] = useState<number>(0);
  const [rawDetail, setRawDetail] = useState('');

  // Ítems
  const [items, setItems] = useState<InternalInvoiceItem[]>([]);
  const [itemsWithIvaCount, setItemsWithIvaCount] = useState<number>(0);
  const [itemsWithoutIvaCount, setItemsWithoutIvaCount] = useState<number>(0);

  // Archivo PDF / Estado de Subida e IA
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedPdfPath, setUploadedPdfPath] = useState<string | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string | null>(null);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processUploadedFile(file);
  };

  const processUploadedFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && !file.name.toLowerCase().endsWith('.zip')) {
      notifyWarning('Formato no válido', 'Por favor selecciona un archivo PDF o ZIP de factura electrónica.');
      return;
    }

    setSelectedFile(file);
    setOriginalFilename(file.name);

    try {
      setAnalyzingAi(true);
      const res = await api.uploadAndAnalyzeInvoicePdf(file);
      
      setUploadedPdfPath(res.pdfPath);
      
      const a = res.analysis;
      if (a) {
        if (a.numeroFactura) setDocumentNumber(a.numeroFactura);
        if (a.tipoDocumento) {
          const t = a.tipoDocumento.toUpperCase();
          if (t.includes('NOTA')) setDocType('NOTA CRÉDITO');
          else setDocType('FACTURA DE VENTA');
        }
        if (a.tipoPago) {
          const p = a.tipoPago.toLowerCase();
          if (p.includes('contado')) setPaymentType('Contado');
          else setPaymentType('Crédito');
        }
        if (a.ordenCompra || a.numeroReferencia) {
          setReferenceNumber(a.ordenCompra || a.numeroReferencia || '');
        }
        if (a.emisor) {
          if (a.emisor.razonSocial) setIssuerName(a.emisor.razonSocial);
          if (a.emisor.nit) setIssuerNit(a.emisor.nit);
        }
        if (a.receptor) {
          if (a.receptor.razonSocial) setClientName(a.receptor.razonSocial);
          if (a.receptor.nit) setClientNit(a.receptor.nit);
        }
        const emision = a.fechas?.emision || a.fechaEmision;
        if (emision) setEmissionDate(emision);

        const vencimiento = a.fechas?.vencimiento || a.fechaVencimiento;
        if (vencimiento) setDueDate(vencimiento);

        if (a.condicionesPago) {
          if (a.condicionesPago.terminos) setPaymentCondition(a.condicionesPago.terminos);
          if (a.condicionesPago.medioPago) setPaymentMethod(a.condicionesPago.medioPago);
        } else {
          if (a.condicionPago) setPaymentCondition(a.condicionPago);
          if (a.medioPago) setPaymentMethod(a.medioPago);
        }

        const sub = Number(a.totales?.subtotalSinIva || a.subtotalSinIva) || 0;
        const iva = Number(a.totales?.totalIva || a.totalIva) || 0;
        const tot = Number(a.totales?.totalConIva || a.totalConIva || a.totalPagarNeto) || (sub + iva);
        const ret = Number(a.totales?.totalRetenciones || a.retenciones?.totalRetenciones) || 0;

        setSubtotalAmount(sub);
        setIvaAmount(iva);
        setTotalAmount(tot);
        setRetentionAmount(ret);

        if (a.items && Array.isArray(a.items)) {
          setItems(a.items.map((it: any) => ({
            code: it.codigo || it.code || '',
            name: it.descripcion || it.nombre || it.name || '',
            description: it.descripcion || it.nombre || it.name || '',
            unit: it.unidad || it.unidadMedida || 'UND',
            quantity: Number(it.cantidad || it.quantity) || 1,
            unitPrice: Number(it.precioUnitario || it.unitPrice) || 0,
            subtotal: Number(it.subtotal) || 0,
            taxRate: Number(it.porcentajeIva !== undefined ? it.porcentajeIva : it.taxRate) || 0,
            taxAmount: Number(it.valorIva !== undefined ? it.valorIva : it.taxAmount) || 0,
            totalPrice: Number(it.total !== undefined ? it.total : it.totalPrice) || 0
          })));
        }

        const conIva = Number(a.resumenIva?.itemsConIvaCount !== undefined ? a.resumenIva.itemsConIvaCount : a.itemsConIvaCount) || 0;
        const sinIva = Number(a.resumenIva?.itemsSinIvaCount !== undefined ? a.resumenIva.itemsSinIvaCount : a.itemsSinIvaCount) || 0;
        setItemsWithIvaCount(conIva);
        setItemsWithoutIvaCount(sinIva);

        // Generar detalle textual
        const itemsSummary = (a.items || []).map((it: any) => `${it.cantidad || it.quantity || 1}x ${it.descripcion || it.nombre || it.name || ''}`).join(', ');
        setRawDetail(itemsSummary || a.conceptoPrincipalSugerido || a.descripcionGeneral || `Factura ${a.numeroFactura}`);

        notifySuccess('Lectura con IA Completa', `Se extrajeron ${a.items?.length || 0} ítems y todos los valores del documento.`);
      }
    } catch (err: any) {
      notifyError('Error en Lectura con IA', err.message);
    } finally {
      setAnalyzingAi(false);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        code: `ITM-${items.length + 1}`,
        description: 'Nuevo Ítem / Servicio',
        quantity: 1,
        unitPrice: 0,
        unit: 'UND',
        taxRate: 19,
        taxAmount: 0,
        totalPrice: 0
      }
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof InternalInvoiceItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    // Recalcular montos del ítem
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const rate = Number(item.taxRate) || 0;
    const subtotal = qty * price;
    const tax = subtotal * (rate / 100);
    const total = subtotal + tax;

    item.subtotal = subtotal;
    item.taxAmount = tax;
    item.totalPrice = total;
    newItems[index] = item;
    setItems(newItems);

    // Recalcular globales
    recalculateTotals(newItems);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    recalculateTotals(newItems);
  };

  const recalculateTotals = (currentItems: InternalInvoiceItem[]) => {
    let sub = 0;
    let tax = 0;
    let withTax = 0;
    let withoutTax = 0;

    currentItems.forEach((it) => {
      const q = Number(it.quantity) || 0;
      const p = Number(it.unitPrice) || 0;
      const r = Number(it.taxRate) || 0;
      const s = q * p;
      const t = s * (r / 100);
      sub += s;
      tax += t;
      if (r > 0) withTax++;
      else withoutTax++;
    });

    setSubtotalAmount(sub);
    setIvaAmount(tax);
    setTotalAmount(sub + tax - retentionAmount);
    setItemsWithIvaCount(withTax);
    setItemsWithoutIvaCount(withoutTax);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!documentNumber.trim()) {
      notifyError('Campo requerido', 'Por favor ingresa el número de la factura.');
      return;
    }
    if (!issuerName.trim() || !issuerNit.trim()) {
      notifyError('Campo requerido', 'Por favor ingresa el nombre y NIT del emisor/proveedor.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        documentNumber: documentNumber.trim(),
        docType,
        paymentType,
        referenceNumber: referenceNumber.trim(),
        issuerName: issuerName.trim(),
        issuerNit: issuerNit.trim(),
        clientName: clientName.trim() || defaultClientName,
        clientNit: clientNit.trim() || defaultClientNit,
        emissionDate,
        dueDate: dueDate || emissionDate,
        paymentCondition,
        paymentMethod,
        subtotalAmount,
        ivaAmount,
        totalAmount,
        retentionAmount,
        netPayableAmount: totalAmount - retentionAmount,
        hasIva: ivaAmount > 0 ? 1 : 0,
        itemsCount: items.length || 1,
        itemsWithIvaCount,
        itemsWithoutIvaCount,
        rawDetail: rawDetail || (items.length > 0 ? items.map(i => i.description).join(', ') : `Factura ${documentNumber}`),
        itemsJson: items,
        pdfPath: uploadedPdfPath,
        pdfOriginalName: originalFilename,
        status: 'Radicada',
        folderType: 'Recibidos',
        uploadedBy: 'Proveedor'
      };

      await api.saveInternalInvoice(payload);
      notifySuccess('¡Factura Radicada Exitosamente!', `El documento ${documentNumber} quedó guardado en la bandeja interna.`);
      onInvoiceCreated();
      onClose();
    } catch (err: any) {
      notifyError('Error al Facturar', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/90 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>Radicación & Facturación Directa de Proveedores</span>
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Sube tu Factura de Venta o Nota Crédito en PDF con lectura y extracción inteligente por IA.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY FORMULARIO */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* ZONA DE SUBIDA DRAG & DROP Y ANÁLISIS IA */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              selectedFile
                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'border-slate-300 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-zinc-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.zip"
              className="hidden"
              onChange={handleFileChange}
            />

            {analyzingAi ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    Analizando todas las páginas del PDF con IA Multimodal...
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Extrayendo emisor, cliente, ítems, porcentajes de IVA, fechas y sumatorias contables.
                  </p>
                </div>
              </div>
            ) : selectedFile ? (
              <div className="flex items-center justify-center gap-3 py-2">
                <FileText className="w-7 h-7 text-emerald-600" />
                <div className="text-left">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{originalFilename}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Archivo procesado con IA. Haz clic para reemplazarlo si lo requieres.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-3 space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                  Arrastra el archivo PDF de la Factura o haz clic aquí para seleccionarlo
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  La Inteligencia Artificial leerá automáticamente todos los datos del documento
                </p>
              </div>
            )}
          </div>

          {/* DATOS PRINCIPALES DEL DOCUMENTO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* TIPO DE DOCUMENTO */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Tipo de Documento <span className="text-red-500">*</span>
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
              >
                <option value="FACTURA DE VENTA">FACTURA DE VENTA</option>
                <option value="NOTA CRÉDITO">NOTA CRÉDITO</option>
              </select>
            </div>

            {/* MODALIDAD DE PAGO */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Modalidad de Pago <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
              >
                <option value="Crédito">Crédito</option>
                <option value="Contado">Contado</option>
              </select>
            </div>

            {/* NÚMERO DE FACTURA */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                No. Documento / Factura <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="ej: FS-284740"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                required
              />
            </div>

            {/* NÚMERO DE REFERENCIA / OC */}
            <div>
              <label className="block text-[11px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                No. Referencia / Orden Compra
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="ej: 75709"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>
          </div>

          {/* CLIENTE RECEPTOR (PREDETERMINADO ALIMENTOS ENRIKO) & EMISOR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800">
            
            {/* CLIENTE RECEPTOR (POR DEFECTO ALIMENTOS ENRIKO) */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cliente / Receptor (Facturado a):</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-0.5">
                    Razón Social
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-0.5">
                    NIT Cliente
                  </label>
                  <input
                    type="text"
                    value={clientNit}
                    onChange={(e) => setClientNit(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-mono outline-none"
                  />
                </div>
              </div>
            </div>

            {/* EMISOR / PROVEEDOR */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 dark:text-white">
                <Building2 className="w-4 h-4 text-red-600" />
                <span>Proveedor / Emisor del Documento:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-0.5">
                    Razón Social Proveedor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={issuerName}
                    onChange={(e) => setIssuerName(e.target.value)}
                    placeholder="ej: PRODUCTOS ALIMENTICIOS SAS"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-bold outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-0.5">
                    NIT Proveedor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={issuerNit}
                    onChange={(e) => setIssuerNit(e.target.value)}
                    placeholder="ej: 890935900-6"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white text-xs font-mono outline-none"
                    required
                  />
                </div>
              </div>
            </div>

          </div>

          {/* FECHAS Y CONDICIONES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Fecha de Emisión <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={emissionDate}
                onChange={(e) => setEmissionDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Condición de Pago
              </label>
              <input
                type="text"
                value={paymentCondition}
                onChange={(e) => setPaymentCondition(e.target.value)}
                placeholder="CREDITO 30 DIAS"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Medio de Pago
              </label>
              <input
                type="text"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="TRANSFERENCIA"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs outline-none"
              />
            </div>
          </div>

          {/* TABLA DE ÍTEMS DETALLADA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Detalle de Ítems / Productos Cobrados ({items.length})
                </h3>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border border-emerald-200 dark:border-emerald-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Ítem</span>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 text-slate-500 text-xs">
                No hay ítems registrados. Al subir el PDF la IA los detectará automáticamente o puedes agregarlos manualmente.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 font-black border-b border-slate-200 dark:border-zinc-800 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Código</th>
                      <th className="p-3">Descripción / Producto</th>
                      <th className="p-3 w-20 text-center">Cant.</th>
                      <th className="p-3 text-right">Vr. Unitario</th>
                      <th className="p-3 w-24 text-center">% IVA</th>
                      <th className="p-3 text-right">Vr. IVA</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.code || ''}
                            onChange={(e) => handleUpdateItem(idx, 'code', e.target.value)}
                            placeholder="Cód"
                            className="w-full px-2 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.description || ''}
                            onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                            placeholder="Descripción del producto o servicio"
                            className="w-full px-2 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-medium"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                            className="w-full px-2 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-center font-bold"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(idx, 'unitPrice', e.target.value)}
                            className="w-full px-2 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs text-right font-mono"
                          />
                        </td>
                        <td className="p-2">
                          <select
                            value={item.taxRate}
                            onChange={(e) => handleUpdateItem(idx, 'taxRate', Number(e.target.value))}
                            className="w-full px-2 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-center"
                          >
                            <option value={0}>0% (Exento)</option>
                            <option value={5}>5%</option>
                            <option value={19}>19%</option>
                          </select>
                        </td>
                        <td className="p-2 text-right font-mono text-xs font-medium text-slate-600 dark:text-zinc-400">
                          ${(item.taxAmount || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-right font-mono text-xs font-bold text-slate-900 dark:text-white">
                          ${(item.totalPrice || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(idx)}
                            className="p-1 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* TOTALES Y RESUMEN DE IVA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* MÉTRICAS DE IVA */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400 tracking-wider">
                Discriminación de Impuestos
              </span>
              <div className="flex gap-4">
                <div className="px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs flex-1">
                  <span className="text-[10px] block font-bold">Ítems con IVA</span>
                  <span className="text-base font-black">{itemsWithIvaCount}</span>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 text-xs flex-1">
                  <span className="text-[10px] block font-bold">Ítems Exentos / Sin IVA</span>
                  <span className="text-base font-black">{itemsWithoutIvaCount}</span>
                </div>
              </div>
            </div>

            {/* TOTALES CONTABLES */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <span>Subtotal (Base Imponible):</span>
                <span className="font-mono font-bold">${subtotalAmount.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <span>IVA Total:</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">+${ivaAmount.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <span>Retenciones aplicadas:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">-${retentionAmount.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex justify-between text-sm font-black text-slate-900 dark:text-white">
                <span>Total a Pagar:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">${totalAmount.toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

          </div>

          {/* BOTÓN FACTURAR / RADICAR */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs cursor-pointer transition-all"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving || analyzingAi}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all disabled:opacity-50"
            >
              <Receipt className="w-4 h-4" />
              <span>{saving ? 'Radicando Factura...' : 'Facturar / Radicar Documento'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
