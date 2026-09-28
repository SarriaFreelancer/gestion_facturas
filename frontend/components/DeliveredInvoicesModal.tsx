'use client';

import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Mail, 
  Calendar, 
  CheckSquare, 
  Square, 
  Send, 
  Copy, 
  X, 
  Settings, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Search,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import { Invoice, EmailSettings } from '../app/types';
import { api } from '../lib/api';
import { notifySuccess, notifyError, notifyInfo } from '../lib/alerts';

interface DeliveredInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  onRefreshData?: () => void;
  onOpenSettings?: () => void;
  emailSettings?: EmailSettings | null;
}

export const DeliveredInvoicesModal: React.FC<DeliveredInvoicesModalProps> = ({
  isOpen,
  onClose,
  invoices,
  onRefreshData,
  onOpenSettings,
  emailSettings
}) => {
  // Filtros
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unsent' | 'sent'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selección múltiple
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCopying, setIsCopying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDirectSending, setIsDirectSending] = useState(false);

  // Envío Directo Automático por Servidor SMTP (Sin abrir ninguna aplicación)
  const handleSendDirectEmail = async () => {
    const targetInvoices = filteredInvoices.filter(inv => selectedIds.includes(inv.id));
    if (targetInvoices.length === 0) {
      notifyInfo('Selección requerida', 'Por favor selecciona las facturas que deseas enviar.');
      return;
    }

    try {
      setIsDirectSending(true);
      const res = await api.sendInvoicesEmailDirect({
        invoiceIds: targetInvoices.map(i => i.id),
        recipientEmail: emailSettings?.recipientEmail,
        subject: emailSettings?.emailSubject,
        introMessage: emailSettings?.emailTemplate
      });

      notifySuccess('¡Correo Enviado!', res.message || `${targetInvoices.length} facturas enviadas directamente por correo.`);
      setSelectedIds([]);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      notifyError('No se pudo enviar el correo', err.message);
    } finally {
      setIsDirectSending(false);
    }
  };

  // Obtener solo las facturas entregadas
  const deliveredInvoices = useMemo(() => {
    return invoices.filter(inv => (inv.delivered || '').toUpperCase() === 'SÍ');
  }, [invoices]);

  // Fechas únicas de entrega disponibles para el filtro rápido
  const availableDeliveryDates = useMemo(() => {
    const dates = new Set<string>();
    deliveredInvoices.forEach(inv => {
      if (inv.deliveryDate) {
        dates.add(inv.deliveryDate.split('T')[0]);
      }
    });
    return Array.from(dates).sort().reverse();
  }, [deliveredInvoices]);

  // Facturas filtradas
  const filteredInvoices = useMemo(() => {
    return deliveredInvoices.filter(inv => {
      // Filtro por fecha específica
      if (selectedDate) {
        const invDate = inv.deliveryDate ? inv.deliveryDate.split('T')[0] : '';
        if (invDate !== selectedDate) return false;
      }

      // Filtro por estado de envío de correo
      const isSent = (inv.emailSent || '').toUpperCase() === 'SÍ';
      if (statusFilter === 'unsent' && isSent) return false;
      if (statusFilter === 'sent' && !isSent) return false;

      // Filtro por búsqueda
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const supMatch = (inv.supplier || '').toLowerCase().includes(term);
        const servMatch = (inv.service || '').toLowerCase().includes(term);
        const numMatch = (inv.invoiceNumber || '').toLowerCase().includes(term);
        if (!supMatch && !servMatch && !numMatch) return false;
      }

      return true;
    });
  }, [deliveredInvoices, selectedDate, statusFilter, searchTerm]);

  // Selección múltiple: toggle individual
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Seleccionar todas las facturas visibles
  const handleSelectAll = () => {
    if (selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInvoices.map(inv => inv.id));
    }
  };

  // Formateador a 2 decimales estricto
  const formatCurrency2Decimals = (val?: number) => {
    const num = Number(val || 0);
    return num.toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calcular total de las seleccionadas
  const selectedTotalAmount = useMemo(() => {
    return filteredInvoices
      .filter(inv => selectedIds.includes(inv.id))
      .reduce((sum, inv) => sum + (Number(inv.value) || 0), 0);
  }, [filteredInvoices, selectedIds]);

  // Generar contenido de la tabla para Copiar (HTML & Texto Tabulado)
  const handleCopyToClipboard = async () => {
    const targetInvoices = filteredInvoices.filter(inv => selectedIds.includes(inv.id));
    if (targetInvoices.length === 0) {
      notifyInfo('Selección vacía', 'Por favor selecciona al menos una factura de la tabla.');
      return;
    }

    try {
      setIsCopying(true);

      // Tabla HTML estilizada para pegar con formato en Outlook / Excel
      let htmlTable = `
        <div style="font-family: Arial, sans-serif; font-size: 12px; color: #333;">
          <p><strong>Alimentos Enriko S.A.S. — Reporte de Facturas Entregadas</strong></p>
          <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; border: 1px solid #d1d5db; width: 100%; font-family: Arial, sans-serif; font-size: 12px;">
            <thead>
              <tr style="background-color: #dc2626; color: #ffffff; text-align: left; font-weight: bold;">
                <th style="padding: 8px; border: 1px solid #b91c1c;">Proveedor</th>
                <th style="padding: 8px; border: 1px solid #b91c1c;">Servicio</th>
                <th style="padding: 8px; border: 1px solid #b91c1c;">N° Documento</th>
                <th style="padding: 8px; border: 1px solid #b91c1c;">Fecha Emisión</th>
                <th style="padding: 8px; border: 1px solid #b91c1c;">Fecha Entrega</th>
                <th style="padding: 8px; border: 1px solid #b91c1c; text-align: right;">Valor ($ COP)</th>
              </tr>
            </thead>
            <tbody>
      `;

      // Texto plano tabulado para Excel / Portapapeles estándar
      let plainText = `PROVEEDOR\tSERVICIO\tN° DOCUMENTO\tFECHA EMISIÓN\tFECHA ENTREGA\tVALOR ($)\n`;

      targetInvoices.forEach(inv => {
        const valFormatted = `$ ${formatCurrency2Decimals(inv.value)}`;
        const emDate = inv.emissionDate ? inv.emissionDate.split('T')[0] : '—';
        const delDate = inv.deliveryDate ? inv.deliveryDate.split('T')[0] : '—';
        const docNum = inv.invoiceNumber || '—';

        htmlTable += `
          <tr>
            <td style="padding: 6px 8px; border: 1px solid #e5e7eb; font-weight: bold;">${inv.supplier}</td>
            <td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${inv.service || '—'}</td>
            <td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${docNum}</td>
            <td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${emDate}</td>
            <td style="padding: 6px 8px; border: 1px solid #e5e7eb;">${delDate}</td>
            <td style="padding: 6px 8px; border: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${valFormatted}</td>
          </tr>
        `;

        plainText += `${inv.supplier}\t${inv.service || '—'}\t${docNum}\t${emDate}\t${delDate}\t${valFormatted}\n`;
      });

      htmlTable += `
            </tbody>
            <tfoot>
              <tr style="background-color: #f3f4f6; font-weight: bold;">
                <td colspan="5" style="padding: 8px; text-align: right; border: 1px solid #d1d5db;">TOTAL (${targetInvoices.length} Facturas):</td>
                <td style="padding: 8px; text-align: right; border: 1px solid #d1d5db; color: #dc2626;">$ ${formatCurrency2Decimals(selectedTotalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;

      plainText += `\nTOTAL (${targetInvoices.length} Facturas):\t$ ${formatCurrency2Decimals(selectedTotalAmount)}`;

      // Copiar con soporte a HTML rico y texto plano
      const blobHtml = new Blob([htmlTable], { type: 'text/html' });
      const blobText = new Blob([plainText], { type: 'text/plain' });
      const data = [new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText })];

      await navigator.clipboard.write(data);
      notifySuccess('Tabla Copiada', 'Formato enriquecido copiado al portapapeles. Ya puedes pegarlo directamente en Outlook o Excel.');
    } catch (err) {
      console.warn('Fallback clipboard:', err);
      // Fallback a texto estándar
      const fallbackText = filteredInvoices
        .filter(inv => selectedIds.includes(inv.id))
        .map(inv => `${inv.supplier} | ${inv.service || '—'} | Emisión: ${inv.emissionDate || '—'} | Entrega: ${inv.deliveryDate || '—'} | Valor: $ ${formatCurrency2Decimals(inv.value)}`)
        .join('\n');
      await navigator.clipboard.writeText(fallbackText);
      notifySuccess('Copiado', 'Datos copiados al portapapeles.');
    } finally {
      setIsCopying(false);
    }
  };

  // Enviar / Abrir en Outlook y Marcar como Enviadas
  const handleSendToOutlook = async () => {
    const targetInvoices = filteredInvoices.filter(inv => selectedIds.includes(inv.id));
    if (targetInvoices.length === 0) {
      notifyInfo('Selección requerida', 'Por favor selecciona las facturas que deseas enviar.');
      return;
    }

    try {
      setIsSending(true);

      const recipient = emailSettings?.recipientEmail || 'contabilidad@alimentosenriko.com';
      const subject = emailSettings?.emailSubject || 'Reporte de Facturas Entregadas — Alimentos Enriko S.A.S.';
      const intro = emailSettings?.emailTemplate || 'Estimado equipo de Contabilidad y Pagos,\n\nAdjunto remitimos el reporte de facturas entregadas formalmente:';

      // Construir tabla de texto plano para el cuerpo del correo
      let bodyText = `${intro}\n\n`;
      bodyText += `========================================================================\n`;
      bodyText += `REPORTE DE FACTURAS ENTREGADAS — ALIMENTOS ENRIKO S.A.S.\n`;
      bodyText += `========================================================================\n\n`;

      targetInvoices.forEach((inv, index) => {
        const valFormatted = `$ ${formatCurrency2Decimals(inv.value)}`;
        const emDate = inv.emissionDate ? inv.emissionDate.split('T')[0] : '—';
        const delDate = inv.deliveryDate ? inv.deliveryDate.split('T')[0] : '—';

        bodyText += `${index + 1}. PROVEEDOR: ${inv.supplier}\n`;
        bodyText += `   Servicio: ${inv.service || '—'}\n`;
        bodyText += `   N° Factura: ${inv.invoiceNumber || '—'}\n`;
        bodyText += `   Fecha Emisión: ${emDate} | Fecha Entrega: ${delDate}\n`;
        bodyText += `   Valor: ${valFormatted}\n`;
        bodyText += `------------------------------------------------------------------------\n`;
      });

      bodyText += `\nTOTAL FACTURAS: ${targetInvoices.length}\n`;
      bodyText += `MONTO TOTAL CONSOLIDADO: $ ${formatCurrency2Decimals(selectedTotalAmount)} COP\n\n`;
      bodyText += `Generado automáticamente desde el Sistema Corporativo de Alimentos Enriko S.A.S.`;

      // 1. Abrir Outlook Web o Cliente Local
      const encodedSubject = encodeURIComponent(subject);
      const encodedBody = encodeURIComponent(bodyText);
      const mailtoUrl = `mailto:${recipient}?subject=${encodedSubject}&body=${encodedBody}`;

      // Abrir Outlook
      window.location.href = mailtoUrl;

      // 2. Marcar en la base de datos como enviadas para no duplicar
      await api.markInvoicesEmailSent(targetInvoices.map(i => i.id));
      notifySuccess('Reporte Preparado en Outlook', `${targetInvoices.length} facturas marcadas como enviadas en el sistema.`);

      // 3. Recargar datos
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      notifyError('Error al procesar envío', err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Marcar o desmarcar estado de envío manualmente
  const handleToggleSentStatus = async (markAsSent: boolean) => {
    if (selectedIds.length === 0) {
      notifyInfo('Selección requerida', 'Selecciona al menos una factura.');
      return;
    }
    try {
      if (markAsSent) {
        await api.markInvoicesEmailSent(selectedIds);
        notifySuccess('Actualizado', `${selectedIds.length} facturas marcadas como enviadas.`);
      } else {
        // Actualizar una a una a 'NO'
        await Promise.all(selectedIds.map(id => api.updateInvoiceField(id, 'emailSent', 'NO')));
        notifySuccess('Actualizado', `${selectedIds.length} facturas marcadas como pendientes de envío.`);
      }
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      notifyError('Error al actualizar', err.message);
    }
  };

  if (!isOpen) return null;

  const allSelected = filteredInvoices.length > 0 && selectedIds.length === filteredInvoices.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* ENCABEZADO */}
        <div className="px-5 py-4 bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white flex-shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5 flex-wrap">
                <span>Facturas Entregadas — Reporte & Envío Outlook</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold">
                  {deliveredInvoices.length} entregadas
                </span>
              </h2>
              <p className="text-[10.5px] text-white/90 truncate">
                Destinatario configurado: <strong className="text-amber-200">{emailSettings?.recipientEmail || 'contabilidad@alimentosenriko.com'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {onOpenSettings && (
              <button 
                onClick={onOpenSettings}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Configurar Correo y Plantilla de Outlook"
              >
                <Settings className="w-4 h-4 text-white" />
                <span className="hidden sm:inline">Configuración Correo</span>
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* BARRA DE FILTROS & BÚSQUEDA */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2.5 text-xs flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* FILTRO FECHA DE ENTREGA */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">Fecha Entrega:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-[11px] font-mono font-bold bg-transparent text-slate-800 dark:text-zinc-100 outline-none cursor-pointer"
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className="text-slate-400 hover:text-red-500 font-bold ml-1 cursor-pointer"
                  title="Ver todas las fechas"
                >
                  ✕
                </button>
              )}
            </div>

            {/* FILTRO ESTADO ENVÍO */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer shadow-2xs"
            >
              <option value="all">Todos los estados de envío</option>
              <option value="unsent">Pendientes de enviar por correo</option>
              <option value="sent">Ya enviadas por correo</option>
            </select>

            {/* BÚSQUEDA RÁPIDA */}
            <div className="relative flex-1 min-w-[150px] max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar proveedor / servicio..."
                className="w-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl pl-8 pr-2.5 py-1.5 text-[11px] text-slate-800 dark:text-zinc-100 outline-none font-medium focus:border-red-500 shadow-2xs"
              />
            </div>
          </div>

          {/* BOTÓN SELECCIÓN RÁPIDA */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-red-400 text-slate-700 dark:text-zinc-200 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            >
              {allSelected ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5 text-red-600" />
                  <span>Deseleccionar Todas</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-400" />
                  <span>Seleccionar Todas ({filteredInvoices.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* TABLA ESTILO EXCEL */}
        <div className="flex-1 overflow-auto p-3 sm:p-4">
          <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 font-black text-[10.5px] uppercase tracking-wider border-b border-slate-200 dark:border-zinc-700">
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-red-600 accent-red-600 cursor-pointer"
                    />
                  </th>
                  <th className="p-3 border-l border-slate-200 dark:border-zinc-700">Proveedor</th>
                  <th className="p-3 border-l border-slate-200 dark:border-zinc-700">Servicio</th>
                  <th className="p-3 border-l border-slate-200 dark:border-zinc-700">N° Factura</th>
                  <th className="p-3 border-l border-slate-200 dark:border-zinc-700">Fecha Emisión</th>
                  <th className="p-3 border-l border-slate-200 dark:border-zinc-700">Fecha Entrega</th>
                  <th className="p-3 border-l border-slate-200 dark:border-zinc-700 text-right">Valor ($ COP)</th>
                  <th className="p-3 border-l border-slate-200 dark:border-zinc-700 text-center">Estado Envío</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileSpreadsheet className="w-8 h-8 text-slate-300 dark:text-zinc-600" />
                        <span className="font-semibold">No se encontraron facturas entregadas con los filtros seleccionados.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isSelected = selectedIds.includes(inv.id);
                    const isSent = (inv.emailSent || '').toUpperCase() === 'SÍ';

                    return (
                      <tr 
                        key={inv.id}
                        onClick={() => toggleSelect(inv.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-red-50/60 dark:bg-red-950/30' 
                            : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        {/* CHECKBOX */}
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(inv.id)}
                            className="w-4 h-4 rounded text-red-600 accent-red-600 cursor-pointer"
                          />
                        </td>

                        {/* PROVEEDOR */}
                        <td className="p-3 border-l border-slate-100 dark:border-zinc-800/80 font-bold text-slate-900 dark:text-white">
                          {inv.supplier}
                        </td>

                        {/* SERVICIO */}
                        <td className="p-3 border-l border-slate-100 dark:border-zinc-800/80 text-slate-600 dark:text-zinc-300">
                          {inv.service || '—'}
                        </td>

                        {/* N° FACTURA */}
                        <td className="p-3 border-l border-slate-100 dark:border-zinc-800/80 font-mono font-bold text-slate-700 dark:text-zinc-300">
                          {inv.invoiceNumber || '—'}
                        </td>

                        {/* FECHA EMISIÓN */}
                        <td className="p-3 border-l border-slate-100 dark:border-zinc-800/80 font-mono text-slate-600 dark:text-zinc-400">
                          {inv.emissionDate ? inv.emissionDate.split('T')[0] : '—'}
                        </td>

                        {/* FECHA ENTREGA */}
                        <td className="p-3 border-l border-slate-100 dark:border-zinc-800/80 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {inv.deliveryDate ? inv.deliveryDate.split('T')[0] : '—'}
                        </td>

                        {/* VALOR CON 2 DECIMALES */}
                        <td className="p-3 border-l border-slate-100 dark:border-zinc-800/80 text-right font-mono font-black text-slate-900 dark:text-white">
                          $ {formatCurrency2Decimals(inv.value)}
                        </td>

                        {/* ESTADO ENVÍO */}
                        <td className="p-3 border-l border-slate-100 dark:border-zinc-800/80 text-center">
                          {isSent ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Enviada</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[10px] font-black">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Pendiente</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PIE DE MODAL & BOTONES DE ACCIÓN */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs flex-shrink-0">
          {/* RESUMEN DE SELECCIÓN */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold">
              <span className="text-slate-400 mr-1">Seleccionadas:</span>
              <span className="text-slate-900 dark:text-white font-extrabold">{selectedIds.length}</span>
              <span className="text-slate-400 ml-1">de {filteredInvoices.length}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 font-bold">
              <span className="text-red-500 mr-1">Monto Total:</span>
              <span className="font-mono font-black text-sm">$ {formatCurrency2Decimals(selectedTotalAmount)}</span>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            {/* BOTÓN COPIAR TABLA HTML */}
            <button
              onClick={handleCopyToClipboard}
              disabled={selectedIds.length === 0 || isCopying}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-40"
              title="Copiar tabla en formato enriquecido para pegar en Outlook o Excel"
            >
              <Copy className="w-4 h-4 text-slate-500" />
              <span>Copiar Tabla</span>
            </button>

            {/* BOTÓN ABRIR EN OUTLOOK MANUAL */}
            <button
              onClick={handleSendToOutlook}
              disabled={selectedIds.length === 0 || isSending}
              className="px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-40"
              title="Abrir la aplicación Outlook en tu equipo"
            >
              <Mail className="w-4 h-4 text-red-600" />
              <span>Abrir en Outlook</span>
            </button>

            {/* BOTÓN PRINCIPAL: ENVIAR DIRECTO POR CORREO (AUTOMÁTICO SIN ABRIR APPS) */}
            <button
              onClick={handleSendDirectEmail}
              disabled={selectedIds.length === 0 || isDirectSending}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs shadow-md shadow-red-600/30 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-40"
              title="Enviar automáticamente por correo electrónico al destinatario configurado"
            >
              <Send className={`w-4 h-4 text-white ${isDirectSending ? 'animate-spin' : ''}`} />
              <span>{isDirectSending ? 'Enviando...' : `Enviar Correo Directo (${selectedIds.length})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
