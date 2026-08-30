import React, { useState, useEffect } from 'react';
import { Supplier, Invoice, DocumentType } from '../../types';
import { Paperclip, PlusCircle, Search, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  suppliers: Supplier[];
  invoices: Invoice[];
}

export const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  suppliers,
  invoices
}) => {
  const [type, setType] = useState<'QUOTATION' | 'INVOICE'>('QUOTATION');
  const [supplierId, setSupplierId] = useState('');
  const [description, setDescription] = useState('');
  const [invoiceCode, setInvoiceCode] = useState('');
  const [remissionDate, setRemissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [amount, setAmount] = useState('');
  const [relatedQuotationId, setRelatedQuotationId] = useState('');

  // Archivos
  const [quotationFile, setQuotationFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtrar cotizaciones disponibles para relacionar (11. RELACIÓN ENTRE COTIZACIÓN Y FACTURA)
  const availableQuotations = invoices.filter(
    i => i.type === 'QUOTATION' && (!supplierId || i.supplierId === supplierId)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || !invoiceCode || !description || !amount) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    setError(null);

    const selectedSupplier = suppliers.find(s => s.id === supplierId);
    const selectedQuotation = invoices.find(i => i.id === relatedQuotationId);

    try {
      // 1. Crear el registro principal
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          supplierName: selectedSupplier?.name || 'Proveedor General',
          type,
          description,
          invoiceCode,
          remissionDate,
          deliveryDate: deliveryDate || undefined,
          amount: Number(amount),
          relatedQuotationId: relatedQuotationId || undefined,
          relatedQuotationCode: selectedQuotation?.invoiceCode || undefined
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al guardar');
      }

      const createdInvoice = await res.json();

      // 2. Adjuntar Cotización si se seleccionó
      if (quotationFile) {
        const formData = new FormData();
        formData.append('file', quotationFile);
        formData.append('docType', 'QUOTATION');

        await fetch(`/api/invoices/${createdInvoice.id}/documents`, {
          method: 'POST',
          body: formData
        });
      }

      // 3. Adjuntar Factura si se seleccionó
      if (invoiceFile) {
        const formData = new FormData();
        formData.append('file', invoiceFile);
        formData.append('docType', 'INVOICE');

        await fetch(`/api/invoices/${createdInvoice.id}/documents`, {
          method: 'POST',
          body: formData
        });
      }

      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Error al registrar');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <PlusCircle className="w-5 h-5" /> Registrar Nuevo Documento (Cotización / Factura)
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl">✕</button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* 3. TIPOS DE DOCUMENTOS */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">TIPO DE DOCUMENTO *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('QUOTATION')}
                className={`py-2 px-4 rounded-lg font-medium text-sm border flex items-center justify-center gap-2 ${
                  type === 'QUOTATION'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                📝 COTIZACIÓN (Inicial)
              </button>

              <button
                type="button"
                onClick={() => setType('INVOICE')}
                className={`py-2 px-4 rounded-lg font-medium text-sm border flex items-center justify-center gap-2 ${
                  type === 'INVOICE'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-700 ring-2 ring-emerald-600/20'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                🧾 FACTURA (Definitiva)
              </button>
            </div>
          </div>

          {/* Proveedor & Código */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">PROVEEDOR *</label>
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">-- Seleccionar Proveedor --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.nit})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">CÓDIGO / NÚMERO *</label>
              <input
                type="text"
                value={invoiceCode}
                onChange={e => setInvoiceCode(e.target.value)}
                placeholder={type === 'QUOTATION' ? 'ej: COT-2026-0058' : 'ej: FAC-2026-0085'}
                required
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* 11. RELACIÓN ENTRE COTIZACIÓN Y FACTURA */}
          {type === 'INVOICE' && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-indigo-600" /> COTIZACIÓN RELACIONADA (Opcional)
              </label>
              <select
                value={relatedQuotationId}
                onChange={e => setRelatedQuotationId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="">-- Ninguna Cotización Vincular --</option>
                {availableQuotations.map(q => (
                  <option key={q.id} value={q.id}>
                    {q.invoiceCode} — {q.supplierName} (${q.amount.toLocaleString('es-CO')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">DESCRIPCIÓN *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              required
              placeholder="Descripción de los insumos o alimentos adquiridos..."
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Fechas & Valor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">FECHA REMISIÓN *</label>
              <input
                type="date"
                value={remissionDate}
                onChange={e => setRemissionDate(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">FECHA ENTREGA</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">VALOR ($) *</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                placeholder="2500000"
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* 4. ADJUNTAR DOCUMENTOS */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Documentos Físicos Adjuntos</h4>

            {type === 'QUOTATION' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  📎 Adjuntar Cotización (PDF, JPG, PNG)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setQuotationFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            )}

            {type === 'INVOICE' && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  📎 Adjuntar Factura (PDF, JPG, PNG)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setInvoiceFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Guardar y Generar Estructura Local'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
