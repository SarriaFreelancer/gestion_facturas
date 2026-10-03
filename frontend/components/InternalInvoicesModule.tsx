'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileCheck2, 
  Search, 
  RefreshCw, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Download, 
  Plus, 
  Trash2, 
  Building2, 
  Calendar, 
  Clock, 
  Hash, 
  DollarSign, 
  Layers, 
  Receipt, 
  ChevronRight, 
  Check, 
  X,
  CreditCard,
  Percent,
  Link as LinkIcon,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../lib/api';
import { notifySuccess, notifyError, notifyWarning } from '../lib/alerts';
import { InternalInvoice, InternalInvoiceItem } from '../app/types';
import { SupplierInvoiceUploadModal } from './SupplierInvoiceUploadModal';

interface InternalInvoicesModuleProps {
  onImportSuccess?: () => void;
}

export const InternalInvoicesModule: React.FC<InternalInvoicesModuleProps> = ({ onImportSuccess }) => {
  const [invoices, setInvoices] = useState<InternalInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal de Radicación
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Modal Visor e Inspección
  const [selectedInvoice, setSelectedInvoice] = useState<InternalInvoice | null>(null);
  const [isViewingDoc, setIsViewingDoc] = useState(false);

  // Acciones en curso
  const [importingId, setImportingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, [activeFolder]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await api.getInternalInvoices(activeFolder, searchQuery);
      setInvoices(data || []);
    } catch (err: any) {
      notifyError('Error cargando facturas internas', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadInvoices();
  };

  // KPIs
  const kpis = useMemo(() => {
    const total = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    const withIva = invoices.filter(inv => Number(inv.hasIva) === 1 || Number(inv.ivaAmount) > 0).length;
    const withoutIva = invoices.filter(inv => Number(inv.hasIva) === 0 && Number(inv.ivaAmount) === 0).length;
    const processed = invoices.filter(inv => inv.importedToMain === 1 || inv.folderType === 'Procesados').length;

    return { total, totalAmount, withIva, withoutIva, processed };
  }, [invoices]);

  // Filtrado de lista
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Filtro de carpeta/pestaña
      if (activeFolder === 'Recibidos Crédito' && (inv.paymentType !== 'Crédito' || inv.docType === 'NOTA CRÉDITO')) return false;
      if (activeFolder === 'Recibidos Contado' && (inv.paymentType !== 'Contado' || inv.docType === 'NOTA CRÉDITO')) return false;
      if (activeFolder === 'Notas Crédito' && inv.docType !== 'NOTA CRÉDITO') return false;
      if (activeFolder === 'Procesados' && inv.importedToMain !== 1 && inv.folderType !== 'Procesados') return false;

      // Filtro de búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const num = (inv.documentNumber || '').toLowerCase();
        const issuer = (inv.issuerName || '').toLowerCase();
        const nit = (inv.issuerNit || '').toLowerCase();
        const ref = (inv.referenceNumber || '').toLowerCase();
        return num.includes(q) || issuer.includes(q) || nit.includes(q) || ref.includes(q);
      }
      return true;
    });
  }, [invoices, activeFolder, searchQuery]);

  const handleRowDoubleClick = (inv: InternalInvoice) => {
    setSelectedInvoice(inv);
    setIsViewingDoc(true);
  };

  const handleImportToMain = async (inv: InternalInvoice, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setImportingId(inv.id);
      await api.importInternalInvoiceToMain(inv.id);
      notifySuccess('¡Factura Vinculada!', `La factura ${inv.documentNumber} de ${inv.issuerName} fue agregada a la lista general de facturas.`);
      await loadInvoices();
      if (onImportSuccess) onImportSuccess();
    } catch (err: any) {
      notifyError('Error al vincular factura', err.message);
    } finally {
      setImportingId(null);
    }
  };

  const handleDelete = async (inv: InternalInvoice, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`¿Estás seguro de eliminar la factura ${inv.documentNumber} de ${inv.issuerName}?`)) {
      return;
    }

    try {
      setDeletingId(inv.id);
      await api.deleteInternalInvoice(inv.id);
      notifySuccess('Factura eliminada', 'El documento fue eliminado de la bandeja.');
      await loadInvoices();
    } catch (err: any) {
      notifyError('Error al eliminar', err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Parsear itemsJson si viene como string
  const selectedItems: InternalInvoiceItem[] = useMemo(() => {
    if (!selectedInvoice || !selectedInvoice.itemsJson) return [];
    if (Array.isArray(selectedInvoice.itemsJson)) return selectedInvoice.itemsJson;
    try {
      return JSON.parse(selectedInvoice.itemsJson);
    } catch {
      return [];
    }
  }, [selectedInvoice]);

  return (
    <div className="w-full space-y-6">
      
      {/* HEADER DE BANDEJA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 flex-shrink-0">
            <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2 flex-wrap">
              <span>Bandeja de Facturación Directa / Proveedores</span>
              <Sparkles className="w-4 h-4 text-emerald-500" />
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Documentos radicados internamente con lectura IA de todas las páginas, desglose de IVA y vinculación directa.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Facturar / Radicar Factura</span>
          </button>

          <button
            onClick={loadInvoices}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* KPIS DE BANDEJA */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400">Total Radicadas</span>
          <div className="text-xl font-black text-slate-900 dark:text-white">{kpis.total}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">Monto Consolidado</span>
          <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            ${kpis.totalAmount.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">Con IVA</span>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400">{kpis.withIva}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-600 dark:text-zinc-300">Exentas / Sin IVA</span>
          <div className="text-xl font-black text-slate-700 dark:text-zinc-200">{kpis.withoutIva}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">Procesadas / Vinculadas</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400">{kpis.processed}</div>
        </div>
      </div>

      {/* PESTAÑAS DE CARPETAS Y BUSCADOR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* CARPETAS */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-2xl">
          {[
            { id: 'Todos', label: 'Todas las Facturas' },
            { id: 'Recibidos Crédito', label: 'Recibidos (Crédito)' },
            { id: 'Recibidos Contado', label: 'Recibidos (Contado)' },
            { id: 'Notas Crédito', label: 'Notas Crédito' },
            { id: 'Procesados', label: 'Procesados' }
          ].map((folder) => (
            <button
              key={folder.id}
              onClick={() => setActiveFolder(folder.id)}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                activeFolder === folder.id
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-zinc-700'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {folder.label}
            </button>
          ))}
        </div>

        {/* BUSCADOR */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por emisor, NIT, No. Factura u OC..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

      </div>

      {/* TABLA PRINCIPAL DE FACTURAS RADICADAS */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 font-black border-b border-slate-200 dark:border-zinc-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Documento</th>
                <th className="p-3.5">Emisor / Proveedor</th>
                <th className="p-3.5">Cliente Receptor</th>
                <th className="p-3.5">Fechas</th>
                <th className="p-3.5 text-center">Ítems & IVA</th>
                <th className="p-3.5 text-right">Valor Total</th>
                <th className="p-3.5 text-center">Estado</th>
                <th className="p-3.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>Cargando facturas radicadas...</span>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-700" />
                    <p className="font-bold text-sm text-slate-700 dark:text-zinc-300">No se encontraron facturas en esta sección</p>
                    <p className="text-xs text-slate-400 mt-1">Usa el botón "Facturar / Radicar Factura" para subir un documento PDF.</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onDoubleClick={() => handleRowDoubleClick(inv)}
                    className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 cursor-pointer transition-colors"
                  >
                    {/* DOCUMENTO & TIPO */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${
                          inv.docType === 'NOTA CRÉDITO' 
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600' 
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                        }`}>
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-black text-slate-900 dark:text-white font-mono text-xs block">
                            {inv.documentNumber}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400">
                              {inv.docType}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-bold">
                              {inv.paymentType}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* EMISOR */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]" title={inv.issuerName}>
                        {inv.issuerName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        NIT: {inv.issuerNit}
                      </div>
                    </td>

                    {/* RECEPTOR */}
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800 dark:text-zinc-200 truncate max-w-[180px]">
                        {inv.clientName || 'ALIMENTOS ENRIKO SAS'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        NIT: {inv.clientNit || '890330035'}
                      </div>
                    </td>

                    {/* FECHAS */}
                    <td className="p-3.5">
                      <div className="text-slate-900 dark:text-white font-medium">
                        Emisión: {inv.emissionDate || 'N/A'}
                      </div>
                      {inv.dueDate && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Vence: {inv.dueDate}
                        </div>
                      )}
                    </td>

                    {/* ÍTEMS & IVA */}
                    <td className="p-3.5 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-[10px]">
                          {inv.itemsCount || 1} {inv.itemsCount === 1 ? 'ítem' : 'ítems'}
                        </span>
                        <span className={`text-[9px] font-extrabold mt-0.5 ${
                          inv.hasIva || (inv.ivaAmount && inv.ivaAmount > 0)
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-slate-500 dark:text-zinc-400'
                        }`}>
                          {inv.hasIva || (inv.ivaAmount && inv.ivaAmount > 0) ? 'Con IVA' : 'Sin IVA'}
                        </span>
                      </div>
                    </td>

                    {/* VALOR TOTAL */}
                    <td className="p-3.5 text-right font-mono font-black text-slate-900 dark:text-white text-xs">
                      ${Number(inv.totalAmount || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                      {inv.ivaAmount && inv.ivaAmount > 0 && (
                        <div className="text-[10px] font-normal text-purple-600 dark:text-purple-400 font-mono">
                          (IVA: ${Number(inv.ivaAmount).toLocaleString('es-CO', { minimumFractionDigits: 0 })})
                        </div>
                      )}
                    </td>

                    {/* ESTADO */}
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black ${
                        inv.importedToMain === 1 || inv.status === 'Vinculada'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {inv.importedToMain === 1 || inv.status === 'Vinculada' ? 'Vinculada' : 'Radicada'}
                      </span>
                    </td>

                    {/* ACCIONES */}
                    <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleRowDoubleClick(inv)}
                          title="Ver PDF e Inspeccionar con IA"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {inv.importedToMain !== 1 && (
                          <button
                            onClick={(e) => handleImportToMain(inv, e)}
                            disabled={importingId === inv.id}
                            title="Vincular a Facturas Principales"
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs disabled:opacity-50"
                          >
                            <LinkIcon className={`w-3 h-3 ${importingId === inv.id ? 'animate-spin' : ''}`} />
                            <span>Vincular</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => handleDelete(inv, e)}
                          disabled={deletingId === inv.id}
                          title="Eliminar factura"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE RADICACIÓN DIRECTA */}
      <SupplierInvoiceUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onInvoiceCreated={loadInvoices}
      />

      {/* MODAL VISOR DE PDF E INSPECCIÓN MULTIMODAL CON IA */}
      {isViewingDoc && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm overflow-hidden">
          <div className="relative w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col h-[94vh]">
            
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/90 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Factura {selectedInvoice.documentNumber}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      {selectedInvoice.docType}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {selectedInvoice.issuerName} • NIT: {selectedInvoice.issuerNit}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedInvoice.pdfPath && (
                  <a
                    href={`/api/internal-invoices/pdf/${encodeURIComponent(selectedInvoice.documentNumber)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 text-slate-700 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar PDF</span>
                  </a>
                )}

                <button
                  onClick={() => setIsViewingDoc(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* MODAL BODY (PDF + DETALLES IA) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
              
              {/* VISOR DE PDF */}
              <div className="lg:col-span-7 bg-slate-100 dark:bg-zinc-950 p-2 sm:p-4 flex flex-col h-full border-r border-slate-200 dark:border-zinc-800">
                <iframe
                  src={`/api/internal-invoices/pdf/${encodeURIComponent(selectedInvoice.documentNumber)}`}
                  className="w-full h-full rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-inner bg-white"
                  title="Visor PDF Factura"
                />
              </div>

              {/* DETALLES EXTRAÍDOS CON IA */}
              <div className="lg:col-span-5 bg-white dark:bg-zinc-900 p-5 overflow-y-auto space-y-5">
                
                {/* TARJETAS DE FECHAS & REFERENCIA */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                    <span className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400 block mb-0.5">
                      Fecha de Emisión
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {selectedInvoice.emissionDate || 'N/A'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
                    <span className="text-[10px] font-black uppercase text-slate-500 dark:text-zinc-400 block mb-0.5">
                      Fecha de Vencimiento
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {selectedInvoice.dueDate || selectedInvoice.emissionDate || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* MÉTRICAS DE ÍTEMS CON/SIN IVA */}
                <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-purple-900 dark:text-purple-300">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Extracción de Ítems e Impuestos</span>
                    </div>
                    <span className="text-xs font-black font-mono text-purple-700 dark:text-purple-300">
                      {selectedItems.length} {selectedItems.length === 1 ? 'producto' : 'productos'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 text-xs font-medium">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Ítems con IVA</span>
                      <span className="font-black text-purple-600">{selectedInvoice.itemsWithIvaCount || 0}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 text-xs font-medium">
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Ítems Sin IVA</span>
                      <span className="font-black text-slate-700 dark:text-zinc-300">{selectedInvoice.itemsWithoutIvaCount || 0}</span>
                    </div>
                  </div>
                </div>

                {/* TABLA DE ÍTEMS EXTRACTOS */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Desglose de Ítems Extraídos
                  </h4>

                  {selectedItems.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-500 text-xs text-center">
                      {selectedInvoice.rawDetail || 'Sin detalle de ítems registrado'}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {selectedItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 text-xs space-y-1.5"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {item.quantity}x {item.description || item.name}
                            </span>
                            <span className="font-mono font-black text-slate-900 dark:text-white">
                              ${(item.totalPrice || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                            <span>Unitario: ${(item.unitPrice || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
                            <span className={`font-bold ${item.taxRate > 0 ? 'text-purple-600' : 'text-slate-400'}`}>
                              IVA: {item.taxRate}% (${(item.taxAmount || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* TOTALES CONTABLES */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400 font-medium">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold">${(selectedInvoice.subtotalAmount || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400 font-medium">
                    <span>IVA Total:</span>
                    <span className="font-mono font-bold text-purple-600">+${(selectedInvoice.ivaAmount || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400 font-medium">
                    <span>Retenciones:</span>
                    <span className="font-mono font-bold text-rose-600">-${(selectedInvoice.retentionAmount || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-zinc-700 flex justify-between text-sm font-black text-slate-900 dark:text-white">
                    <span>Total Neto a Pagar:</span>
                    <span className="font-mono text-emerald-600">${(selectedInvoice.totalAmount || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* BOTÓN VINCULAR */}
                {selectedInvoice.importedToMain !== 1 && (
                  <button
                    onClick={() => handleImportToMain(selectedInvoice)}
                    disabled={importingId === selectedInvoice.id}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <LinkIcon className={`w-4 h-4 ${importingId === selectedInvoice.id ? 'animate-spin' : ''}`} />
                    <span>{importingId === selectedInvoice.id ? 'Vinculando...' : 'Vincular a Facturas Principales'}</span>
                  </button>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
