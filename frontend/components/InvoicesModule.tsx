'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Trash2, 
  Plus, 
  DollarSign, 
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Hash,
  Pencil,
  FileSpreadsheet,
  Mail
} from 'lucide-react';
import { Invoice } from '../app/types';

interface InvoicesModuleProps {
  invoices: Invoice[];
  onUpdateField: (id: string, field: string, value: any) => void;
  onDeleteInvoice: (id: string) => void;
  onEditInvoice?: (invoice: Invoice) => void;
  onAddInvoice: () => void;
  onOpenDeliveredModal?: () => void;
  selectedMonth: string;
  selectedYear: string;
}

const ValueInputCell: React.FC<{
  initialValue: number;
  onSave: (val: number) => void;
}> = ({ initialValue, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [rawText, setRawText] = useState(String(initialValue ?? 0));

  React.useEffect(() => {
    setRawText(String(initialValue ?? 0));
  }, [initialValue]);

  const formatWithTwoDecimals = (val: number) => {
    return Number(val || 0).toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleBlur = () => {
    setIsEditing(false);
    let clean = rawText.replace(/\$/g, '').trim();
    if (clean.includes(',') && clean.includes('.')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes(',')) {
      clean = clean.replace(',', '.');
    }
    const num = parseFloat(clean) || 0;
    onSave(num);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="inline-flex items-center justify-end w-full">
      <span className="text-slate-400 text-[10px] font-mono mr-1">$</span>
      {isEditing ? (
        <input
          type="text"
          autoFocus
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-white dark:bg-zinc-900 border border-red-500 rounded-lg px-2 py-1 text-[11px] font-mono font-bold text-right text-slate-900 dark:text-zinc-100 outline-none w-28 sm:w-32 ring-1 ring-red-500 shadow-2xs"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setRawText(initialValue !== undefined && initialValue !== null ? String(initialValue) : '0');
            setIsEditing(true);
          }}
          className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-red-400 hover:bg-white dark:hover:bg-zinc-900 rounded-lg px-2 py-1 text-[11px] font-mono font-bold text-right text-slate-900 dark:text-zinc-100 outline-none w-28 sm:w-32 transition-all shadow-2xs cursor-text"
          title="Clic para editar valor"
        >
          {formatWithTwoDecimals(initialValue)}
        </button>
      )}
    </div>
  );
};

export const InvoicesModule: React.FC<InvoicesModuleProps> = ({
  invoices,
  onUpdateField,
  onDeleteInvoice,
  onEditInvoice,
  onAddInvoice,
  onOpenDeliveredModal,
  selectedMonth,
  selectedYear
}) => {
  const [currentTab, setCurrentTab] = useState<'Todos' | 'Facturas' | 'Cotizaciones'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const deliveredCount = invoices.filter(i => (i.delivered || '').toUpperCase() === 'SÍ').length;
  const pendingEmailCount = invoices.filter(i => (i.delivered || '').toUpperCase() === 'SÍ' && (i.emailSent || '').toUpperCase() !== 'SÍ').length;

  // Función utilitaria para fecha de hoy en formato YYYY-MM-DD
  const getTodayFormatted = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Manejo especial cuando se conmuta el switch de "Entregado":
  // Si pasa a 'SÍ', se asigna automáticamente la fecha de hoy como deliveryDate si está vacía.
  const handleToggleDelivered = (inv: Invoice) => {
    const isCurrentlyDelivered = (inv.delivered || '').toUpperCase() === 'SÍ';
    if (!isCurrentlyDelivered) {
      // Activar entregado: SÍ y fecha automática de entrega hoy
      const today = getTodayFormatted();
      onUpdateField(inv.id, 'delivered', 'SÍ');
      if (!inv.deliveryDate) {
        onUpdateField(inv.id, 'deliveryDate', today);
      }
    } else {
      // Desactivar entregado: NO
      onUpdateField(inv.id, 'delivered', 'NO');
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    // Filtro de Tab
    const isCot = (inv.invoiceNumber || '').toUpperCase().startsWith('COT') || (inv.service || '').toUpperCase().startsWith('COT');
    if (currentTab === 'Facturas' && isCot) return false;
    if (currentTab === 'Cotizaciones' && !isCot) return false;

    // Filtro de Búsqueda
    const term = searchTerm.toLowerCase();
    return (
      (inv.supplier || '').toLowerCase().includes(term) ||
      (inv.invoiceNumber || '').toLowerCase().includes(term) ||
      (inv.service || '').toLowerCase().includes(term) ||
      (inv.oc || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full">
      {/* HEADER DE MÓDULO CON BOTONES DE ACCIÓN */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-sm mb-6">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-md shadow-red-600/30 flex-shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2 flex-wrap">
              <span>Control de Facturas & Cotizaciones</span>
              {selectedMonth !== 'Todos' && (
                <span className="text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                  {selectedMonth} {selectedYear}
                </span>
              )}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Registro y control mensual de documentos. Al marcar "Entregado: SÍ", la fecha de entrega se monta automáticamente.
            </p>
          </div>
        </div>

        {/* BOTONES: FACTURAS ENTREGADAS (OUTLOOK) & AGREGAR FACTURA */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {onOpenDeliveredModal && (
            <button
              onClick={onOpenDeliveredModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group"
              title="Ver reporte Excel de facturas entregadas y enviar a Outlook"
            >
              <FileSpreadsheet className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
              <span>Facturas Entregadas (Outlook)</span>
              {deliveredCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  pendingEmailCount > 0 
                    ? 'bg-red-600 text-white animate-pulse' 
                    : 'bg-emerald-600 text-white'
                }`}>
                  {pendingEmailCount > 0 ? `${pendingEmailCount} pendientes` : `${deliveredCount} enviadas`}
                </span>
              )}
            </button>
          )}

          <button 
            onClick={onAddInvoice}
            className="w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/30 transition-all cursor-pointer flex-shrink-0"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Agregar Factura / Cotización</span>
          </button>
        </div>
      </div>

      {/* TABS Y BUSCADOR */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 dark:bg-zinc-800 p-1 sm:p-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 overflow-x-auto">
          {(['Todos', 'Facturas', 'Cotizaciones'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setCurrentTab(tab)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-black transition-all cursor-pointer text-center whitespace-nowrap ${
                currentTab === tab 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm shadow-red-600/20' 
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 sm:py-2.5 w-full sm:w-80 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input 
            type="text"
            placeholder="Buscar por proveedor, N° documento, OC..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none w-full placeholder:text-slate-400"
          />
        </div>
      </div>


      {/* TABLA PRINCIPAL DE FACTURAS CON FECHA EMISIÓN EDITABLE Y FECHA ENTREGA AUTOMÁTICA */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                <th className="px-3.5 py-3.5 text-white">Proveedor</th>
                <th className="px-3 py-3.5 text-white">Servicio / Concepto</th>
                <th className="px-3 py-3.5 text-white">N° Documento</th>
                <th className="px-3.5 py-3.5 text-white">Fecha Emisión</th>
                <th className="px-3.5 py-3.5 text-white">Fecha Entrega</th>
                <th className="px-3 py-3.5 text-right text-white">Valor ($)</th>
                <th className="px-3 py-3.5 text-center text-white">Firmado</th>
                <th className="px-3 py-3.5 text-center text-white">Orden Compra</th>
                <th className="px-3 py-3.5 text-center text-white">En Facture</th>
                <th className="px-3 py-3.5 text-center text-white">Entregado</th>
                <th className="px-3 py-3.5 text-center text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-16 text-slate-400 dark:text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
                      <span>No hay documentos registrados para este filtro ({selectedMonth} {selectedYear}).</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isSigned = (inv.signed || '').toUpperCase() === 'SÍ';
                  const isEnFacture = (inv.enFacture || '').toUpperCase() === 'SÍ';
                  const isDelivered = (inv.delivered || '').toUpperCase() === 'SÍ';

                  return (
                    <tr key={inv.id} className="hover:bg-red-50/20 dark:hover:bg-zinc-800/40 transition-colors">
                      {/* PROVEEDOR */}
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                          <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-red-600 to-red-700 text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">
                            {(inv.supplier || 'PR').substring(0, 2).toUpperCase()}
                          </span>
                          <span className="truncate max-w-[140px]" title={inv.supplier}>{inv.supplier}</span>
                        </div>
                      </td>

                      {/* SERVICIO */}
                      <td className="px-3 py-3 text-slate-600 dark:text-zinc-300 max-w-[150px] truncate" title={inv.service || '—'}>
                        {inv.service || '—'}
                      </td>

                      {/* N° FACTURA / COTIZACIÓN */}
                      <td className="px-3 py-3">
                        <input 
                          type="text"
                          value={inv.invoiceNumber || ''}
                          onChange={(e) => onUpdateField(inv.id, 'invoiceNumber', e.target.value)}
                          placeholder="FAC-..."
                          className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-[11px] font-mono font-bold text-slate-800 dark:text-zinc-100 outline-none w-20 focus:border-red-500"
                        />
                      </td>

                      {/* 1. FECHA DE EMISIÓN: EDITABLE MANUALMENTE DIRECTO EN LA TABLA */}
                      <td className="px-3.5 py-3">
                        <input
                          type="date"
                          value={inv.emissionDate ? inv.emissionDate.split('T')[0] : ''}
                          onChange={(e) => onUpdateField(inv.id, 'emissionDate', e.target.value)}
                          className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 focus:border-red-500 focus:bg-white rounded-lg px-2 py-1 text-[11px] font-mono font-bold text-slate-800 dark:text-zinc-100 outline-none transition-all shadow-2xs cursor-pointer w-28"
                          title="Fecha de Emisión del Documento"
                        />
                      </td>

                      {/* 2. FECHA DE ENTREGA: AL LADO, AUTO CUANDO SE MARCA SÍ O EDITABLE */}
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="date"
                            value={inv.deliveryDate ? inv.deliveryDate.split('T')[0] : ''}
                            onChange={(e) => onUpdateField(inv.id, 'deliveryDate', e.target.value)}
                            placeholder="Sin entregar"
                            className={`border rounded-lg px-2 py-1 text-[11px] font-mono font-bold outline-none transition-all shadow-2xs cursor-pointer w-28 ${
                              isDelivered 
                                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200 font-extrabold' 
                                : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-400'
                            }`}
                            title={isDelivered ? "Fecha en que se entregó el documento" : "Fecha de Entrega (se autocompleta al marcar Entregado en SÍ)"}
                          />
                        </div>
                      </td>

                      {/* VALOR (CON 2 DECIMALES Y FORMATO ,00) */}
                      <td className="px-3.5 py-3 text-right">
                        <ValueInputCell 
                          initialValue={inv.value !== undefined && inv.value !== null ? inv.value : 0}
                          onSave={(newVal) => onUpdateField(inv.id, 'value', newVal)}
                        />
                      </td>

                      {/* SWITCH FIRMADO */}
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => onUpdateField(inv.id, 'signed', isSigned ? 'NO' : 'SÍ')}
                          className={`w-11 h-5 rounded-full px-1 inline-flex items-center transition-all cursor-pointer border ${
                            isSigned 
                              ? 'bg-emerald-500 border-emerald-600 justify-end' 
                              : 'bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 justify-start'
                          }`}
                        >
                          <span className={`text-[8px] font-black mr-0.5 ${isSigned ? 'text-white' : 'hidden'}`}>SÍ</span>
                          <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs"></span>
                          <span className={`text-[8px] font-black ml-0.5 ${isSigned ? 'hidden' : 'text-slate-500 dark:text-zinc-300'}`}>NO</span>
                        </button>
                      </td>

                      {/* ORDEN DE COMPRA (OC) */}
                      <td className="px-3 py-3 text-center">
                        <input 
                          type="text"
                          value={inv.oc || ''}
                          onChange={(e) => onUpdateField(inv.id, 'oc', e.target.value)}
                          placeholder="OC-..."
                          className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-1.5 py-1 text-[11px] font-mono font-bold text-slate-800 dark:text-zinc-100 outline-none w-16 focus:border-red-500 text-center"
                        />
                      </td>

                      {/* SWITCH EN FACTURE */}
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => onUpdateField(inv.id, 'enFacture', isEnFacture ? 'AÚN NO' : 'SÍ')}
                          className={`w-11 h-5 rounded-full px-1 inline-flex items-center transition-all cursor-pointer border ${
                            isEnFacture 
                              ? 'bg-emerald-500 border-emerald-600 justify-end' 
                              : 'bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 justify-start'
                          }`}
                        >
                          <span className={`text-[8px] font-black mr-0.5 ${isEnFacture ? 'text-white' : 'hidden'}`}>SÍ</span>
                          <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs"></span>
                          <span className={`text-[8px] font-black ml-0.5 ${isEnFacture ? 'hidden' : 'text-slate-500 dark:text-zinc-300'}`}>NO</span>
                        </button>
                      </td>

                      {/* SWITCH ENTREGADO (AL MARCAR SÍ, MONTA AUTOMÁTICA LA FECHA DE ENTREGA) */}
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => handleToggleDelivered(inv)}
                          className={`w-11 h-5 rounded-full px-1 inline-flex items-center transition-all cursor-pointer border ${
                            isDelivered 
                              ? 'bg-blue-600 border-blue-700 justify-end shadow-xs' 
                              : 'bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 justify-start'
                          }`}
                          title={isDelivered ? "Entregado (clic para desmarcar)" : "Marcar como Entregado (montará la fecha de entrega automáticamente)"}
                        >
                          <span className={`text-[8px] font-black mr-0.5 ${isDelivered ? 'text-white' : 'hidden'}`}>SÍ</span>
                          <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs"></span>
                          <span className={`text-[8px] font-black ml-0.5 ${isDelivered ? 'hidden' : 'text-slate-500 dark:text-zinc-300'}`}>NO</span>
                        </button>
                      </td>

                      {/* ACCIONES */}
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => onEditInvoice && onEditInvoice(inv)}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 inline-flex items-center justify-center transition-colors cursor-pointer"
                            title="Editar factura completa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => onDeleteInvoice(inv.id)}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors cursor-pointer"
                            title="Eliminar factura"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
