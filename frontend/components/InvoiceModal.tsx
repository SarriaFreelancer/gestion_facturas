'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Building2, 
  Calendar, 
  DollarSign, 
  Hash, 
  CheckSquare, 
  ShoppingBag, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Invoice, Supplier } from '../app/types';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoiceData: Partial<Invoice>) => Promise<void>;
  suppliers: Supplier[];
  defaultMonth?: string;
  defaultYear?: string;
  initialInvoice?: Invoice | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  suppliers,
  defaultMonth,
  defaultYear,
  initialInvoice
}) => {
  const [docType, setDocType] = useState<'factura' | 'cotizacion'>('factura');
  const [selectedSupplierName, setSelectedSupplierName] = useState('');
  const [service, setService] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [emissionDate, setEmissionDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [value, setValue] = useState<number | string>('');
  const [signed, setSigned] = useState<'SÍ' | 'NO'>('NO');
  const [orderStd, setOrderStd] = useState<'SÍ' | 'NO'>('NO');
  const [oc, setOc] = useState('');
  const [enFacture, setEnFacture] = useState<'SÍ' | 'NO'>('NO');
  const [delivered, setDelivered] = useState<'SÍ' | 'NO'>('NO');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener fecha por defecto basada en el mes seleccionado o fecha de hoy
  const getTodayFormatted = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    if (initialInvoice) {
      const isCot = (initialInvoice.invoiceNumber || '').toUpperCase().startsWith('COT') || (initialInvoice.service || '').toUpperCase().startsWith('COT');
      setDocType(isCot ? 'cotizacion' : 'factura');
      setSelectedSupplierName(initialInvoice.supplier || '');
      setService(initialInvoice.service || '');
      setInvoiceNumber(initialInvoice.invoiceNumber || '');
      setEmissionDate(initialInvoice.emissionDate || getTodayFormatted());
      setDeliveryDate(initialInvoice.deliveryDate || '');
      setValue(initialInvoice.value !== undefined ? initialInvoice.value : '');
      setSigned((initialInvoice.signed || '').toUpperCase() === 'SÍ' ? 'SÍ' : 'NO');
      setOrderStd((initialInvoice.orderStd || '').toUpperCase() === 'SÍ' ? 'SÍ' : 'NO');
      setOc(initialInvoice.oc || '');
      setEnFacture((initialInvoice.enFacture || '').toUpperCase() === 'SÍ' ? 'SÍ' : 'NO');
      setDelivered((initialInvoice.delivered || '').toUpperCase() === 'SÍ' ? 'SÍ' : 'NO');
    } else {
      setDocType('factura');
      setSelectedSupplierName(suppliers.length > 0 ? suppliers[0].name : '');
      setService('');
      setInvoiceNumber('');
      setEmissionDate(getTodayFormatted());
      setDeliveryDate('');
      setValue('');
      setSigned('NO');
      setOrderStd('NO');
      setOc('');
      setEnFacture('NO');
      setDelivered('NO');
    }
    setError(null);
  }, [initialInvoice, isOpen, suppliers]);

  if (!isOpen) return null;

  // Si cambia el proveedor, podemos sugerir o ver sus servicios existentes
  const currentSupplier = suppliers.find(s => s.name === selectedSupplierName);
  const existingServices = currentSupplier?.services || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierName) {
      setError('Debes seleccionar o tener un proveedor registrado.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Auto-generar número de documento si viene vacío
      let finalDocNumber = invoiceNumber.trim();
      if (!finalDocNumber) {
        const prefix = docType === 'cotizacion' ? 'COT' : 'FAC';
        finalDocNumber = `${prefix}-${Date.now().toString().slice(-5)}`;
      }

      await onSave({
        id: initialInvoice?.id,
        supplier: selectedSupplierName,
        service: service.trim() || (docType === 'cotizacion' ? 'Cotización No Recurrente' : 'Factura No Recurrente'),
        invoiceNumber: finalDocNumber,
        emissionDate: emissionDate || getTodayFormatted(),
        deliveryDate: deliveryDate || null,
        value: Number(value) || 0,
        signed: signed,
        orderStd: orderStd,
        oc: oc.trim(),
        enFacture: enFacture,
        delivered: delivered
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el documento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* ENCABEZADO CON GRADIENTE ENRIKO */}
        <div className="px-6 py-5 bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white">
                {initialInvoice ? 'Editar Documento' : 'Nueva Factura / Cotización (No Recurrente)'}
              </h2>
              <p className="text-[11px] text-white/90 font-medium">
                Registra un documento exclusivo para este mes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CUERPO DEL FORMULARIO CON METRICA VISUAL Y PADDINGS AMPLIOS */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 font-bold text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SELECTOR DE TIPO (FACTURA VS COTIZACIÓN) */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setDocType('factura')}
              className={`flex-1 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                docType === 'factura'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Factura
            </button>
            <button
              type="button"
              onClick={() => setDocType('cotizacion')}
              className={`flex-1 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                docType === 'cotizacion'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cotización
            </button>
          </div>

          {/* SELECCIÓN DE PROVEEDOR EXISTENTE (REQUISITO: DEBE EXISTIR PRIMERO) */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-red-600" />
              <span>Proveedor Autorizado *</span>
            </label>
            {suppliers.length === 0 ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-700 dark:text-amber-300 font-bold text-xs">
                No hay proveedores registrados aún. Primero debes registrar el proveedor desde el módulo de Proveedores.
              </div>
            ) : (
              <select
                value={selectedSupplierName}
                onChange={e => setSelectedSupplierName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 dark:text-zinc-100 outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner cursor-pointer"
                required
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.nit}) - {s.area || 'General'}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* SERVICIO / CONCEPTO ESPECÍFICO */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-red-600" />
                <span>Servicio / Concepto *</span>
              </label>
              <input
                type="text"
                value={service}
                onChange={e => setService(e.target.value)}
                placeholder="ej: Mantenimiento Extraordinario"
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 dark:text-zinc-100 outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
                required
              />
              {existingServices.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="text-[10px] text-slate-400 font-semibold mr-1">Sugeridos:</span>
                  {existingServices.slice(0, 3).map((srv, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setService(srv.serviceName)}
                      className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded hover:bg-red-100 transition-colors"
                    >
                      {srv.serviceName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* N° DOCUMENTO (FAC O COT) */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-red-600" />
                <span>N° Documento {docType === 'cotizacion' ? '(COT)' : '(FAC)'}</span>
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={e => setInvoiceNumber(e.target.value)}
                placeholder={docType === 'cotizacion' ? 'ej: COT-4921' : 'ej: FAC-9821'}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold font-mono text-slate-800 dark:text-zinc-100 outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* FECHA EMISIÓN */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-600" />
                <span>Fecha Emisión *</span>
              </label>
              <input
                type="date"
                value={emissionDate}
                onChange={e => setEmissionDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold font-mono text-slate-800 dark:text-zinc-100 outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
                required
              />
            </div>

            {/* MONTO / VALOR */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-red-600" />
                <span>Valor / Monto ($) *</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold font-mono text-right text-slate-800 dark:text-zinc-100 outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ORDEN DE COMPRA (OC) */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-red-600" />
                <span>Orden de Compra (OC)</span>
              </label>
              <input
                type="text"
                value={oc}
                onChange={e => setOc(e.target.value)}
                placeholder="ej: OC-2026-104"
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold font-mono text-slate-800 dark:text-zinc-100 outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
              />
            </div>

            {/* FECHA DE ENTREGA */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Fecha Entrega (Opcional)</span>
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-bold font-mono text-slate-800 dark:text-zinc-100 outline-none focus:border-red-500 focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-red-500/20 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* ESTADOS CON SWITCHES SEMIREDONDOS ELEGANTE */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* FIRMADO */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex flex-col items-center justify-between gap-1.5">
              <span className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-zinc-300">¿Firmado?</span>
              <button
                type="button"
                onClick={() => setSigned(prev => prev === 'SÍ' ? 'NO' : 'SÍ')}
                className={`w-12 h-6 rounded-full px-1 flex items-center transition-all cursor-pointer border ${
                  signed === 'SÍ' 
                    ? 'bg-emerald-500 border-emerald-600 justify-end' 
                    : 'bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 justify-start'
                }`}
              >
                <span className={`text-[8.5px] font-black mr-1 ${signed === 'SÍ' ? 'text-white' : 'hidden'}`}>SÍ</span>
                <span className="w-4 h-4 rounded-full bg-white shadow-xs"></span>
                <span className={`text-[8.5px] font-black ml-1 ${signed === 'SÍ' ? 'hidden' : 'text-slate-500 dark:text-zinc-300'}`}>NO</span>
              </button>
            </div>

            {/* ORDEN ESTÁNDAR */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex flex-col items-center justify-between gap-1.5">
              <span className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-zinc-300">Orden Std</span>
              <button
                type="button"
                onClick={() => setOrderStd(prev => prev === 'SÍ' ? 'NO' : 'SÍ')}
                className={`w-12 h-6 rounded-full px-1 flex items-center transition-all cursor-pointer border ${
                  orderStd === 'SÍ' 
                    ? 'bg-emerald-500 border-emerald-600 justify-end' 
                    : 'bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 justify-start'
                }`}
              >
                <span className={`text-[8.5px] font-black mr-1 ${orderStd === 'SÍ' ? 'text-white' : 'hidden'}`}>SÍ</span>
                <span className="w-4 h-4 rounded-full bg-white shadow-xs"></span>
                <span className={`text-[8.5px] font-black ml-1 ${orderStd === 'SÍ' ? 'hidden' : 'text-slate-500 dark:text-zinc-300'}`}>NO</span>
              </button>
            </div>

            {/* EN FACTURE */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex flex-col items-center justify-between gap-1.5">
              <span className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-zinc-300">En Facture</span>
              <button
                type="button"
                onClick={() => setEnFacture(prev => prev === 'SÍ' ? 'NO' : 'SÍ')}
                className={`w-12 h-6 rounded-full px-1 flex items-center transition-all cursor-pointer border ${
                  enFacture === 'SÍ' 
                    ? 'bg-emerald-500 border-emerald-600 justify-end' 
                    : 'bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 justify-start'
                }`}
              >
                <span className={`text-[8.5px] font-black mr-1 ${enFacture === 'SÍ' ? 'text-white' : 'hidden'}`}>SÍ</span>
                <span className="w-4 h-4 rounded-full bg-white shadow-xs"></span>
                <span className={`text-[8.5px] font-black ml-1 ${enFacture === 'SÍ' ? 'hidden' : 'text-slate-500 dark:text-zinc-300'}`}>NO</span>
              </button>
            </div>

            {/* ENTREGADO (AL MARCAR SÍ, MONTA AUTOMÁTICA LA FECHA DE ENTREGA) */}
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 flex flex-col items-center justify-between gap-1.5">
              <span className="text-[10px] font-extrabold uppercase text-slate-600 dark:text-zinc-300">Entregado</span>
              <button
                type="button"
                onClick={() => {
                  setDelivered(prev => {
                    const nextVal = prev === 'SÍ' ? 'NO' : 'SÍ';
                    if (nextVal === 'SÍ' && !deliveryDate) {
                      setDeliveryDate(getTodayFormatted());
                    }
                    return nextVal;
                  });
                }}
                className={`w-12 h-6 rounded-full px-1 flex items-center transition-all cursor-pointer border ${
                  delivered === 'SÍ' 
                    ? 'bg-blue-600 border-blue-700 justify-end shadow-xs' 
                    : 'bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 justify-start'
                }`}
                title="Al marcar SÍ, la fecha de entrega se monta automáticamente"
              >
                <span className={`text-[8.5px] font-black mr-1 ${delivered === 'SÍ' ? 'text-white' : 'hidden'}`}>SÍ</span>
                <span className="w-4 h-4 rounded-full bg-white shadow-xs"></span>
                <span className={`text-[8.5px] font-black ml-1 ${delivered === 'SÍ' ? 'hidden' : 'text-slate-500 dark:text-zinc-300'}`}>NO</span>
              </button>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || suppliers.length === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold flex items-center gap-2 shadow-md shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{isSubmitting ? 'Guardando...' : (initialInvoice ? 'Actualizar' : 'Registrar en este Mes')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
