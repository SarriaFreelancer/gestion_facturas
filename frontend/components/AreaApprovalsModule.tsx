'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckSquare, 
  Search, 
  RefreshCw, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  Hash, 
  FileSpreadsheet, 
  Eye, 
  Download, 
  Layers, 
  DollarSign, 
  Calendar, 
  User as UserIcon, 
  ChevronRight, 
  Send,
  AlertCircle,
  FileCheck2,
  Check,
  X,
  ExternalLink,
  Save,
  Plus,
  Trash2
} from 'lucide-react';
import { api, API_BASE_URL } from '../lib/api';
import { notifySuccess, notifyError, notifyWarning, notifyInfo } from '../lib/alerts';
import { User, CompanyArea } from '../app/types';

export const SAP_ARTICLES = [
  { code: 'ISVVR00001', description: 'Accesorios Varios (51)', warehouse: 'Servic01', itemType: 'Servicios' },
  { code: 'ISVVR00002', description: 'Equipos de Cómputo y Tecnología', warehouse: 'Servic01', itemType: 'Servicios' },
  { code: 'MAT00001', description: 'Materiales y Suministros Generales', warehouse: 'Almac01', itemType: 'Materiales' },
  { code: 'LIC00001', description: 'Licenciamiento y Software Cloud', warehouse: 'Servic01', itemType: 'Servicios' },
  { code: 'MAN00001', description: 'Mantenimiento Preventivo / Correctivo', warehouse: 'Servic01', itemType: 'Servicios' },
  { code: 'PAP00001', description: 'Papelería y Útiles de Oficina', warehouse: 'Almac01', itemType: 'Materiales' },
  { code: 'DOT00001', description: 'Dotación y Elementos de Protección', warehouse: 'Almac01', itemType: 'Materiales' },
  { code: 'SEG00001', description: 'Seguridad y Vigilancia', warehouse: 'Servic01', itemType: 'Servicios' },
  { code: 'ASE00001', description: 'Aseo y Limpieza', warehouse: 'Almac01', itemType: 'Materiales' },
];

export const SAP_DOC_TYPES = ['PEDIDO', 'SERVICIO'] as const;
export const SAP_ITEM_TYPES = ['Servicios', 'Materiales'] as const;

export const SAP_WAREHOUSES = [
  { code: 'Servic01', name: 'Servicios TI / Operativos' },
  { code: 'Almac01', name: 'Almacén Central' },
  { code: 'Princ01', name: 'Planta Principal' },
  { code: 'Prod01', name: 'Producción' },
  { code: 'Bodeg01', name: 'Bodega Acopi' },
];

export const SAP_TAX_INDICATORS = [
  { code: 'IVAD33', percentage: 19.0, label: 'IVAD33 (IVA 19% Descontable)' },
  { code: 'IVAD00', percentage: 0.0, label: 'IVAD00 (IVA 0% Exento / Excluido)' },
  { code: 'IVAD05', percentage: 5.0, label: 'IVAD05 (IVA 5% Reducido)' },
  { code: 'IVAE19', percentage: 19.0, label: 'IVAE19 (IVA 19% al Costo/Gasto)' },
];

export const DEFAULT_SAP_COST_CENTERS = [
  { code: 'AA0122', name: 'Administración General' },
  { code: 'BC0140', name: 'Tecnología e Informática' },
  { code: 'PD0110', name: 'Producción' },
  { code: 'MK0130', name: 'Mercadeo y Ventas' },
  { code: 'LG0150', name: 'Logística y Transporte' },
  { code: 'GH0160', name: 'Gestión Humana' },
  { code: 'FI0170', name: 'Financiera y Contable' },
];

export interface AreaApprovalsModuleProps {
  currentUser: User | null;
  companyAreas?: any[];
  onInvoicesUpdated?: () => void;
}

export const AreaApprovalsModule: React.FC<AreaApprovalsModuleProps> = ({
  currentUser,
  companyAreas = [],
  onInvoicesUpdated
}) => {
  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin';
  const isAreaApprover = currentUser?.role === 'aprobador_area';
  const userArea = currentUser?.area || 'General';
  const authorizedAreas = useMemo(() => {
    if (currentUser?.authorizedAreas && currentUser.authorizedAreas.length > 0) {
      return currentUser.authorizedAreas;
    }
    return currentUser?.area && currentUser.area !== 'General' ? [currentUser.area] : [];
  }, [currentUser]);

  // Lista consolidada de Centros de Costos (Áreas configuradas + Catálogo base SAP)
  const costCentersList = useMemo(() => {
    const list = [...DEFAULT_SAP_COST_CENTERS];
    (companyAreas || []).forEach((ca: any) => {
      const ccCode = ca.costCenterCode || ca.code;
      if (ccCode && !list.some(item => item.code === ccCode)) {
        list.push({ code: ccCode, name: `${ca.name || ''} (${ccCode})` });
      }
    });
    return list;
  }, [companyAreas]);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string>(isSuperAdmin ? 'Todos' : (isAreaApprover && authorizedAreas.length > 1 ? 'Todos' : userArea));
  const [statusTab, setStatusTab] = useState<'Pendiente' | 'Aprobado' | 'Rechazado' | 'Todos'>('Pendiente');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selección Múltiple / Masiva
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [processingBulk, setProcessingBulk] = useState(false);

  // Modal de Detalle / Inspección de Ítems & PDF
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<any | null>(null);

  // Modal Plantilla SAP (Presolicitud de Compra Oficial - 29 Campos)
  const [sapModalOpen, setSapModalOpen] = useState(false);
  const [sapData, setSapData] = useState<any | null>(null);
  const [loadingSap, setLoadingSap] = useState(false);
  const [savingSap, setSavingSap] = useState(false);

  // Totales consolidados de la Presolicitud SAP: Total antes de IVA, Total IVA y Total Final ML con IVA
  const { sapSubtotalSum, sapTaxSum, sapTotalMlSum } = useMemo(() => {
    let subtotal = 0;
    let totalMl = 0;

    (sapData?.rows || []).forEach((r: any) => {
      const q = parseFloat(r.requiredQuantity) || 1.0;
      const p = parseFloat(r.infoPrice) || 0.0;
      const d = parseFloat(r.discountPercentage) || 0.0;
      const t = parseFloat(r.taxPercentage) || 0.0;
      const lineMl = parseFloat(r.totalMl) || 0.0;

      let lineSubtotal = 0;
      if (p > 0) {
        lineSubtotal = q * p * (1 - d / 100);
      } else if (lineMl > 0) {
        lineSubtotal = t > 0 ? (lineMl / (1 + t / 100)) : lineMl;
      }

      subtotal += lineSubtotal;
      totalMl += lineMl > 0 ? lineMl : (lineSubtotal * (1 + t / 100));
    });

    const tax = Math.max(0, totalMl - subtotal);
    return {
      sapSubtotalSum: Math.round(subtotal * 100) / 100,
      sapTaxSum: Math.round(tax * 100) / 100,
      sapTotalMlSum: Math.round(totalMl * 100) / 100
    };
  }, [sapData?.rows]);

  // Modal Rechazo con Motivo
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetIds, setRejectTargetIds] = useState<string[]>([]);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadInvoices();
  }, [selectedArea, statusTab]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await api.getAreaApprovalInvoices(
        selectedArea, 
        statusTab,
        currentUser?.role,
        isAreaApprover ? authorizedAreas : undefined
      );
      setInvoices(data || []);
      setSelectedIds([]);
    } catch (err: any) {
      notifyError('Error cargando aprobaciones', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado por buscador
  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;
    const q = searchQuery.toLowerCase().trim();
    return invoices.filter(inv => 
      (inv.invoiceNumber && inv.invoiceNumber.toLowerCase().includes(q)) ||
      (inv.supplier && inv.supplier.toLowerCase().includes(q)) ||
      (inv.contractNumber && inv.contractNumber.toLowerCase().includes(q)) ||
      (inv.service && inv.service.toLowerCase().includes(q)) ||
      (inv.area && inv.area.toLowerCase().includes(q))
    );
  }, [invoices, searchQuery]);

  // Selección individual
  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Selección total
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredInvoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredInvoices.map(i => i.id));
    }
  };

  // Aprobar en bloque o individual
  const handleApprove = async (ids: string[]) => {
    if (!ids.length) return;
    try {
      setProcessingBulk(true);
      // Validar si las facturas a aprobar tienen eventos DIAN completados
      const pendingDianInvs = invoices.filter(i => ids.includes(i.id) && i.dianEventsStatus !== 'COMPLETADO');
      if (pendingDianInvs.length > 0) {
        const docNames = pendingDianInvs.map(i => i.invoiceNumber || i.supplier).slice(0, 2).join(', ');
        notifyWarning('Aseguramiento DIAN', `Aviso: Las facturas (${docNames}) aún no tienen registrados los eventos DIAN (Acuse, Recibido, Aceptado). Asegúrate de tramitarlos.`);
      }

      const res = await api.approveInvoicesByArea(ids, currentUser?.name || 'Jefe de Área');
      notifySuccess('Facturas Aprobadas', res.message || `${ids.length} facturas aprobadas y firmadas.`);
      await loadInvoices();
      if (onInvoicesUpdated) onInvoicesUpdated();
    } catch (err: any) {
      notifyError('Error al aprobar', err.message);
    } finally {
      setProcessingBulk(false);
    }
  };

  // Abrir modal de rechazo
  const openRejectModal = (ids: string[]) => {
    setRejectTargetIds(ids);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  // Confirmar rechazo
  const handleConfirmReject = async () => {
    if (!rejectTargetIds.length) return;
    try {
      setProcessingBulk(true);
      await api.rejectInvoicesByArea(rejectTargetIds, currentUser?.name || 'Jefe de Área', rejectReason);
      notifyWarning('Facturas Rechazadas', `${rejectTargetIds.length} facturas han sido rechazadas.`);
      setRejectModalOpen(false);
      await loadInvoices();
      if (onInvoicesUpdated) onInvoicesUpdated();
    } catch (err: any) {
      notifyError('Error al rechazar', err.message);
    } finally {
      setProcessingBulk(false);
    }
  };

  // Abrir modal de plantilla SAP
  const handleOpenSapPreview = async (inv: any) => {
    try {
      setLoadingSap(true);
      setSapModalOpen(true);
      setSapData(null);
      const data = await api.getSapPreview(inv.id, currentUser?.name || 'Usuario');
      if (data && Array.isArray(data.rows)) {
        data.rows = data.rows.map((r: any) => {
          const qty = parseFloat(r.requiredQuantity) || 1.0;
          const prc = parseFloat(r.infoPrice) || 0.0;
          const tax = parseFloat(r.taxPercentage) || 0.0;
          const disc = parseFloat(r.discountPercentage) || 0.0;
          const base = qty * prc * (1 - disc / 100);
          const taxAmt = tax > 0 ? (base * (tax / 100)) : 0.0;
          const calculatedTotalMl = Math.round((base + taxAmt) * 100) / 100;
          const rawTotal = parseFloat(r.totalMl) || 0.0;
          const finalTotalMl = rawTotal > 0 ? rawTotal : calculatedTotalMl;

          return {
            ...r,
            requiredQuantity: qty,
            infoPrice: prc,
            taxPercentage: tax,
            discountPercentage: disc,
            totalMl: finalTotalMl
          };
        });
      }
      setSapData(data);
    } catch (err: any) {
      notifyError('Error cargando plantilla SAP', err.message);
      setSapModalOpen(false);
    } finally {
      setLoadingSap(false);
    }
  };

  const handleSapRowChange = (idx: number, field: string, value: any) => {
    setSapData((prev: any) => {
      if (!prev || !prev.rows) return prev;
      const newRows = [...prev.rows];
      const updatedRow = { ...newRows[idx], [field]: value };

      // Si cambia el Número de artículo, cargar Descripción, Almacén y Tipo_Item sugeridos de SAP
      if (field === 'itemCode') {
        const foundArticle = SAP_ARTICLES.find(a => a.code === value);
        if (foundArticle) {
          updatedRow.itemDescription = foundArticle.description;
          updatedRow.warehouse = foundArticle.warehouse;
          updatedRow.itemType = foundArticle.itemType;
        }
      }

      // Si cambia el Indicador de Impuestos, actualizar automáticamente el porcentaje de IVA
      if (field === 'taxIndicator') {
        const foundTax = SAP_TAX_INDICATORS.find(t => t.code === value);
        if (foundTax) {
          updatedRow.taxPercentage = foundTax.percentage;
        }
      }

      // Total ML automático: PRECIO INFO + IVA (si IVA es 0, solo PRECIO INFO)
      const qty = parseFloat(updatedRow.requiredQuantity) || 1.0;
      const prc = parseFloat(updatedRow.infoPrice) || 0.0;
      const tax = parseFloat(updatedRow.taxPercentage) || 0.0;
      const disc = parseFloat(updatedRow.discountPercentage) || 0.0;
      const base = qty * prc * (1 - disc / 100);
      const taxAmount = tax > 0 ? (base * (tax / 100)) : 0.0;
      updatedRow.totalMl = Math.round((base + taxAmount) * 100) / 100;

      newRows[idx] = updatedRow;
      return { ...prev, rows: newRows };
    });
  };

  const handleAddSapRow = () => {
    if (!sapData) return;
    const newRow = {
      itemCode: 'ISVVR00001',
      docType: 'PEDIDO',
      itemType: 'Servicios',
      itemDescription: 'Accesorios Varios (51)',
      additionalDescription: 'Nuevo Ítem / Servicio Adicional',
      requiredQuantity: 1,
      unit: 'Und',
      infoPrice: 0.0,
      taxIndicator: 'IVAD33',
      taxPercentage: 19,
      discountPercentage: 0,
      warehouse: 'Servic01',
      suggestedSupplier: sapData.supplierSapCode || '',
      requiredDate: new Date().toLocaleDateString('es-CO'),
      costCenter: sapData.costCenter || 'AA0122',
      totalMl: 0.0,
      requestedBy: currentUser?.name || 'Usuario',
      observation: '',
      motive: '',
      urgency: '',
      originCountry: 'CO',
      foreignUnitPrice: 0.0,
      transportRequestDate: '',
      billingManagement: '',
      donationNovelty: '',
      freeText: '',
      currency: 'COP',
      donationNovelty2: '',
      giftNovelty: ''
    };
    setSapData((prev: any) => ({
      ...prev,
      rows: [...(prev.rows || []), newRow],
      totalItems: (prev.rows || []).length + 1
    }));
  };

  const handleDeleteSapRow = (idx: number) => {
    setSapData((prev: any) => {
      if (!prev || !prev.rows) return prev;
      const newRows = prev.rows.filter((_: any, i: number) => i !== idx);
      return {
        ...prev,
        rows: newRows,
        totalItems: newRows.length
      };
    });
  };

  const handleSaveSapPresolicitud = async () => {
    if (!sapData?.invoiceId || !sapData?.rows) return;
    try {
      setSavingSap(true);
      await api.saveSapPresolicitud(sapData.invoiceId, sapData.rows, currentUser?.name || 'Usuario');
      notifySuccess('Presolicitud SAP Guardada', 'Las líneas y los 29 campos de la presolicitud han sido actualizados en la base de datos.');
    } catch (err: any) {
      notifyError('Error al guardar presolicitud', err.message);
    } finally {
      setSavingSap(false);
    }
  };

  const formatCurrency = (val: number | string | undefined | null) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  };

  // Totales de la selección
  const selectedTotalSum = useMemo(() => {
    return filteredInvoices
      .filter(i => selectedIds.includes(i.id))
      .reduce((sum, i) => sum + (Number(i.value) || 0), 0);
  }, [filteredInvoices, selectedIds]);

  return (
    <div className="space-y-6">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-red-600" />
              <span>Aprobación de Facturas por Jefes de Área</span>
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60">
              Área: {selectedArea}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Valida los contratos habituales, revisa los ítems leídos por IA y aprueba masivamente o una por una para firmar y generar la Solicitud de Compra SAP.
          </p>
        </div>

        {/* SELECTOR DE ÁREA PARA SUPERADMIN O APROBADOR MULTI-ÁREA */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {(isSuperAdmin || (isAreaApprover && authorizedAreas.length > 1)) && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filtrar Área:</span>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
              >
                <option value="Todos">Todas las Áreas {isAreaApprover ? 'Autorizadas' : ''}</option>
                {(isAreaApprover ? companyAreas.filter((a: any) => authorizedAreas.includes(a.name)) : companyAreas).map((a: any) => (
                  <option key={a.id} value={a.name}>
                    {a.name} {a.costCenterCode ? `(${a.costCenterCode})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={loadInvoices}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
            title="Recargar facturas"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* PESTAÑAS DE ESTADO & BUSCADOR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* TABS */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/60 dark:bg-zinc-800/60 w-full sm:w-auto overflow-x-auto">
          {(['Pendiente', 'Aprobado', 'Rechazado', 'Todos'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusTab === tab
                  ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              {tab === 'Pendiente' && <Clock className="w-3.5 h-3.5 text-amber-500" />}
              {tab === 'Aprobado' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              {tab === 'Rechazado' && <XCircle className="w-3.5 h-3.5 text-red-500" />}
              <span>{tab === 'Aprobado' ? 'Aprobadas / Firmadas' : tab === 'Pendiente' ? 'Pendientes de Aprobación' : tab}</span>
            </button>
          ))}
        </div>

        {/* BUSCADOR */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar factura, contrato, proveedor..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white outline-none"
          />
        </div>
      </div>

      {/* BARRA FLOTANTE DE ACCIÓN MASIVA (SI HAY SELECCIONADAS) */}
      {selectedIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">
              {selectedIds.length}
            </div>
            <div>
              <span className="text-xs font-black block">Facturas Seleccionadas para Aprobación Masiva</span>
              <span className="text-[11px] opacity-90 block font-mono">
                Monto acumulado: ${formatCurrency(selectedTotalSum)} COP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleApprove(selectedIds)}
              disabled={processingBulk}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
            >
              <Check className="w-4 h-4" />
              <span>Aprobar Masivamente ({selectedIds.length})</span>
            </button>

            <button
              onClick={() => openRejectModal(selectedIds)}
              disabled={processingBulk}
              className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer flex-1 sm:flex-initial"
            >
              <X className="w-4 h-4" />
              <span>Rechazar</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              title="Deseleccionar todas"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TABLA PRINCIPAL DE FACTURAS */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold">Consultando facturas del área...</span>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">
              No hay facturas con estado '{statusTab}' en este momento
            </h3>
            <p className="text-xs text-slate-400">
              Cuando las facturas con contrato sean radicadas o leídas con IA, aparecerán aquí para revisión del jefe de área.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3 text-center w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Estado / Firma</th>
                  <th className="p-3">Factura & Contrato</th>
                  <th className="p-3">Proveedor / NIT</th>
                  <th className="p-3">Área & C. Costo</th>
                  <th className="p-3">Servicio / Concepto</th>
                  <th className="p-3 text-center">Ítems IA</th>
                  <th className="p-3 text-right">Valor Total</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                {filteredInvoices.map((inv) => {
                  const isChecked = selectedIds.includes(inv.id);
                  const isSigned = inv.signed === 'SÍ';
                  const isPending = inv.approvalStatus === 'Pendiente';
                  const isApproved = inv.approvalStatus === 'Aprobado';
                  const isRejected = inv.approvalStatus === 'Rechazado';
                  const itemsList = Array.isArray(inv.itemsJson) ? inv.itemsJson : [];

                  return (
                    <tr 
                      key={inv.id} 
                      className={`hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors ${
                        isChecked ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                      }`}
                    >
                      {/* CHECKBOX */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(inv.id)}
                          className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                      </td>

                      {/* ESTADO DE FIRMA */}
                      <td className="p-3 whitespace-nowrap">
                        {isApproved || isSigned ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1 w-max">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Firmado: SÍ</span>
                            </span>
                            {inv.approvedBy && (
                              <span className="text-[9.5px] text-slate-400">
                                Por: {inv.approvedBy}
                              </span>
                            )}
                          </div>
                        ) : isRejected ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 inline-flex items-center gap-1 w-max">
                            <XCircle className="w-3 h-3" />
                            <span>Rechazado</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 inline-flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pendiente Firma</span>
                          </span>
                        )}
                      </td>

                      {/* NÚMERO DE FACTURA & CONTRATO */}
                      <td className="p-3">
                        <div className="font-mono font-black text-slate-900 dark:text-white">
                          {inv.invoiceNumber || 'S/N'}
                        </div>
                        {inv.contractNumber ? (
                          <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-extrabold border border-emerald-200 dark:border-emerald-800">
                            <span>Contrato:</span>
                            <span>{inv.contractNumber}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Sin contrato asignado</span>
                        )}
                      </td>

                      {/* PROVEEDOR */}
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-zinc-200 max-w-xs truncate" title={inv.supplier}>
                          {inv.supplier}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          NIT: {inv.supplierNit || '-'} {inv.supplierSapCode ? `• SAP: ${inv.supplierSapCode}` : ''}
                        </div>
                      </td>

                      {/* ÁREA & CENTRO DE COSTOS */}
                      <td className="p-3">
                        <div className="font-bold text-slate-700 dark:text-zinc-300">
                          {inv.area || 'General'}
                        </div>
                        {inv.areaCostCenterCode && (
                          <span className="text-[9.5px] font-mono text-slate-400 block">
                            CC: {inv.areaCostCenterCode}
                          </span>
                        )}
                      </td>

                      {/* SERVICIO / CONCEPTO (RESUMEN CORTO AI) */}
                      <td className="p-3 max-w-xs" title={inv.aiShortSummary || inv.service}>
                        <div className="flex items-center gap-1.5 truncate">
                          {inv.aiShortSummary && (
                            <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          )}
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">
                            {inv.aiShortSummary || (inv.service && !inv.service.toUpperCase().includes('SE RECIBE DOCUMENTO') ? inv.service : 'Servicio Facturación')}
                          </span>
                        </div>
                        {inv.dianEventsStatus === 'COMPLETADO' ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800 mt-0.5" title="Acuse, Recibido y Aceptado certificados ante la DIAN">
                            ✓ Eventos DIAN OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800 mt-0.5" title="Eventos DIAN pendientes de certificación">
                            ⚠️ Eventos DIAN Pendientes
                          </span>
                        )}
                      </td>

                      {/* ÍTEMS LEÍDOS POR IA */}
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-mono font-bold text-[10.5px] border border-blue-200 dark:border-blue-800/40">
                          {itemsList.length > 0 ? `${itemsList.length} ítems` : '1 global'}
                        </span>
                      </td>

                      {/* VALOR TOTAL */}
                      <td className="p-3 text-right font-mono font-black text-slate-900 dark:text-white">
                        ${formatCurrency(inv.value)}
                      </td>

                      {/* ACCIONES */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* VER DETALLE & PDF */}
                          <button
                            onClick={() => {
                              setSelectedInvoiceForDetail(inv);
                              setDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer"
                            title="Ver Ítems & PDF"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* BOTÓN PREVISUALIZAR PLANTILLA SAP */}
                          <button
                            onClick={() => handleOpenSapPreview(inv)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 font-bold text-[10.5px] flex items-center gap-1 cursor-pointer transition-all"
                            title="Ver Plantilla de Solicitud de Compra SAP"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Plantilla SAP</span>
                          </button>

                          {/* APROBAR INDIVIDUAL */}
                          {isPending && (
                            <button
                              onClick={() => handleApprove([inv.id])}
                              className="px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10.5px] flex items-center gap-1 cursor-pointer shadow-sm transition-all"
                              title="Aprobar y Firmar Factura"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Aprobar</span>
                            </button>
                          )}

                          {/* RECHAZAR INDIVIDUAL */}
                          {isPending && (
                            <button
                              onClick={() => openRejectModal([inv.id])}
                              className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
                              title="Rechazar con motivo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETALLE DE ÍTEMS Y VISOR DE PDF */}
      {detailModalOpen && selectedInvoiceForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Detalle de Factura: {selectedInvoiceForDetail.invoiceNumber}
                </h3>
              </div>
              <button onClick={() => setDetailModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-slate-200 dark:border-zinc-700 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Proveedor</span>
                  <span className="font-black text-slate-900 dark:text-white block mt-0.5">{selectedInvoiceForDetail.supplier}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Área</span>
                  <span className="font-black text-slate-900 dark:text-white block mt-0.5">{selectedInvoiceForDetail.area}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Contrato Asignado</span>
                  <span className="font-mono font-black text-emerald-600 block mt-0.5">{selectedInvoiceForDetail.contractNumber || 'Habitual / Directo'}</span>
                </div>
                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block font-bold uppercase">Total ML (con IVA)</span>
                  <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 block mt-0.5 text-sm sm:text-base">${formatCurrency(selectedInvoiceForDetail.value)}</span>
                </div>
              </div>

              {/* TABLA DE ÍTEMS LEÍDOS POR IA */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  <span>Ítems y Productos Extraídos de la Factura (Detalle Exacto PDF)</span>
                </h4>

                <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-zinc-800 text-slate-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5 text-center w-8">#</th>
                        <th className="p-2.5">Código</th>
                        <th className="p-2.5">Descripción Literal del PDF</th>
                        <th className="p-2.5 text-center">Cant / UM</th>
                        <th className="p-2.5 text-right">Precio Unitario</th>
                        <th className="p-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                      {(Array.isArray(selectedInvoiceForDetail.itemsJson) && selectedInvoiceForDetail.itemsJson.length > 0 
                        ? selectedInvoiceForDetail.itemsJson 
                        : [{
                            codigo: 'SERV-001',
                            descripcion: selectedInvoiceForDetail.service,
                            cantidad: 1,
                            unidadMedida: 'UND',
                            precioUnitario: selectedInvoiceForDetail.value,
                            total: selectedInvoiceForDetail.value
                          }]
                      ).map((it: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="p-2.5 text-center text-slate-400 font-mono text-[10px]">{i + 1}</td>
                          <td className="p-2.5 font-mono text-slate-500">{it.codigo || it.code || '-'}</td>
                          <td className="p-2.5 font-bold text-slate-900 dark:text-white">{it.descripcion || it.description}</td>
                          <td className="p-2.5 text-center font-mono">{it.cantidad} {it.unidadMedida || 'UND'}</td>
                          <td className="p-2.5 text-right font-mono">${formatCurrency(it.precioUnitario)}</td>
                          <td className="p-2.5 text-right font-mono font-black">${formatCurrency(it.total || it.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 flex flex-wrap justify-between items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const inv = selectedInvoiceForDetail;
                  setDetailModalOpen(false);
                  handleOpenSapPreview(inv);
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>Abrir Plantilla SAP (Total ML: ${formatCurrency(selectedInvoiceForDetail.value)})</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold"
                >
                  Cerrar
                </button>
                {selectedInvoiceForDetail.approvalStatus === 'Pendiente' && (
                  <button
                    onClick={() => {
                      handleApprove([selectedInvoiceForDetail.id]);
                      setDetailModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aprobar y Firmar Factura</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREVISUALIZACIÓN PLANTILLA SAP / PRESOLICITUD DE COMPRA (29 CAMPOS OFICIALES) */}
      {sapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-[97vw] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            
            {/* ENCABEZADO SAP */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-100 dark:border-zinc-800 bg-slate-900 text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30 flex-shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black flex items-center gap-2 flex-wrap">
                    <span>Presolicitud de Compra SAP — Plantilla Oficial (29 Campos)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-800 text-indigo-200 font-bold">
                      SAP B1 / S4HANA Ready
                    </span>
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-300">
                    Estructura homologada con ítems leídos de factura, centro de costos, almacén e impuestos. Permite edición inline y CRUD para conexión vía API.
                  </p>
                </div>
              </div>

              <button onClick={() => setSapModalOpen(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CONTENIDO DE LA PLANTILLA SAP */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {loadingSap || !sapData ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold">Generando y estructurando los 29 campos de la Presolicitud SAP...</span>
                </div>
              ) : (
                <>
                  {/* METADATOS DE CABECERA SAP & TOTALES RESUMEN ARRIBA DE LA PLANTILLA */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-zinc-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700 text-xs">
                      <div>
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase">Proveedor Sugerido (SAP)</span>
                        <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 block mt-0.5 truncate">
                          {sapData.supplierSapCode || sapData.supplier || 'PN1144180553'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase">Centro de Costos</span>
                        <span className="font-mono font-black text-slate-900 dark:text-white block mt-0.5">
                          {sapData.costCenter || 'AA0122'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase">Solicitado Por</span>
                        <span className="font-black text-slate-800 dark:text-zinc-200 block mt-0.5 truncate">
                          {sapData.generatedBy || currentUser?.name || 'Usuario'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase">Contrato Asignado</span>
                        <span className="font-mono font-black text-emerald-600 block mt-0.5 truncate">
                          {sapData.contractNumber || 'Habitual Directo'}
                        </span>
                      </div>
                    </div>

                    {/* TARJETAS RESUMEN ARRIBA DE LA PLANTILLA: ANTES DE IVA, TOTAL IVA, TOTAL FINAL ML */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-50 dark:bg-zinc-800/80 p-3 rounded-2xl border border-slate-200 dark:border-zinc-700 flex justify-between items-center shadow-2xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase block">Total antes de IVA</span>
                          <span className="text-[11px] text-slate-400 font-medium">Subtotal presolicitud</span>
                        </div>
                        <span className="font-mono font-black text-slate-800 dark:text-zinc-100 text-sm sm:text-base">
                          ${formatCurrency(sapSubtotalSum)} COP
                        </span>
                      </div>

                      <div className="bg-blue-50/60 dark:bg-blue-950/30 p-3 rounded-2xl border border-blue-200 dark:border-blue-900/40 flex justify-between items-center shadow-2xs">
                        <div>
                          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase block">Total IVA</span>
                          <span className="text-[11px] text-blue-500/80 font-medium">Impuesto liquidado</span>
                        </div>
                        <span className="font-mono font-black text-blue-700 dark:text-blue-300 text-sm sm:text-base">
                          ${formatCurrency(sapTaxSum)} COP
                        </span>
                      </div>

                      <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border-2 border-emerald-500 dark:border-emerald-600 flex justify-between items-center shadow-2xs">
                        <div>
                          <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase block">Total Final ML con IVA</span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Suma de Total ML</span>
                        </div>
                        <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 text-sm sm:text-base">
                          ${formatCurrency(sapTotalMlSum)} COP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* TABLA DE 29 COLUMNAS CON EDICIÓN INLINE */}
                  <div className="border border-slate-200 dark:border-zinc-700 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-100 dark:bg-zinc-800 px-4 py-2.5 text-xs font-black text-slate-700 dark:text-zinc-200 border-b border-slate-200 dark:border-zinc-700 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span>LÍNEAS DE PRESOLICITUD ({sapData.rows?.length || 0} ítems)</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          29 Campos SAP
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSapRow}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar Fila</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto max-h-[50vh]">
                      <table className="w-full text-left text-[11px] border-collapse whitespace-nowrap">
                        <thead className="sticky top-0 z-10 shadow-xs">
                          <tr className="bg-slate-900 text-white text-[10px] uppercase font-bold tracking-wider">
                            <th className="p-2 text-center w-8 bg-slate-950">#</th>
                            {/* COLUMNA 1: DISTINTIVO VERDE DE PLANTILLA OFICIAL */}
                            <th className="p-2.5 bg-[#92D050] text-slate-900 font-black">Número de artículo</th>
                            <th className="p-2.5">Tipo Solicitud Compra</th>
                            <th className="p-2.5">Tipo_Item</th>
                            <th className="p-2.5">Descripción del artículo</th>
                            <th className="p-2.5 bg-purple-100/80 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-black border border-purple-200 dark:border-purple-800" title="Descripción exacta y técnica de cada ítem leído por AI del PDF">
                              Descripcion_Adic (Ítem Exacto PDF)
                            </th>
                            <th className="p-2.5 text-center">Cantidad Requerida</th>
                            <th className="p-2.5 text-center">Nombre UM</th>
                            <th className="p-2.5 text-right">Precio info</th>
                            <th className="p-2.5 text-center">Indicador Impuestos</th>
                            <th className="p-2.5 text-center">Impuesto %</th>
                            <th className="p-2.5 text-center">% Descuento</th>
                            <th className="p-2.5 text-center">Almacén</th>
                            <th className="p-2.5">Proveedor Sugerido</th>
                            <th className="p-2.5 text-center">Fecha Requerida</th>
                            <th className="p-2.5 text-center">Centro Costos</th>
                            <th className="p-2.5 text-right">Total (ML)</th>
                            <th className="p-2.5">Solicitado por</th>
                            <th className="p-2.5">Observación</th>
                            <th className="p-2.5">Motivo</th>
                            <th className="p-2.5">Urgencia</th>
                            <th className="p-2.5 text-center">País Origen</th>
                            <th className="p-2.5 text-right">Vlr_Unit_Extranj</th>
                            <th className="p-2.5">Fecha_Solicitud_Serv_Transp</th>
                            <th className="p-2.5">Gestion_Facturacion</th>
                            <th className="p-2.5">Novedad_Donacion</th>
                            <th className="p-2.5">Texto libre</th>
                            <th className="p-2.5 text-center">Moneda</th>
                            <th className="p-2.5">Novedad_Donaciones</th>
                            <th className="p-2.5">Novedad_Obsequios</th>
                            <th className="p-2.5 text-center bg-slate-950">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 font-medium bg-white dark:bg-zinc-900">
                          {(sapData.rows || []).map((r: any, idx: number) => (
                            <tr key={idx} className="hover:bg-indigo-50/20 dark:hover:bg-zinc-800/40">
                              <td className="p-2 text-center font-mono text-slate-400 text-[10px] bg-slate-50 dark:bg-zinc-900">
                                {idx + 1}
                              </td>

                              {/* 1. Número de artículo */}
                              <td className="p-1.5 font-mono font-bold bg-emerald-50/40 dark:bg-emerald-950/20">
                                <select
                                  value={r.itemCode || 'ISVVR00001'}
                                  onChange={e => handleSapRowChange(idx, 'itemCode', e.target.value)}
                                  className="w-36 px-2 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                                  title="Seleccione artículo del maestro de SAP (carga descripción, almacén y tipo)"
                                >
                                  {SAP_ARTICLES.map(art => (
                                    <option key={art.code} value={art.code}>
                                      {art.code} ({art.description.slice(0, 18)}...)
                                    </option>
                                  ))}
                                  {!SAP_ARTICLES.some(art => art.code === r.itemCode) && r.itemCode && (
                                    <option value={r.itemCode}>{r.itemCode} (Manual)</option>
                                  )}
                                </select>
                              </td>

                              {/* 2. Tipo Solicitud Compra */}
                              <td className="p-1.5">
                                <select
                                  value={r.docType || 'PEDIDO'}
                                  onChange={e => handleSapRowChange(idx, 'docType', e.target.value)}
                                  className="w-28 px-2 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold outline-none cursor-pointer"
                                >
                                  {SAP_DOC_TYPES.map(dt => (
                                    <option key={dt} value={dt}>{dt}</option>
                                  ))}
                                </select>
                              </td>

                              {/* 3. Tipo_Item */}
                              <td className="p-1.5">
                                <select
                                  value={r.itemType || 'Servicios'}
                                  onChange={e => handleSapRowChange(idx, 'itemType', e.target.value)}
                                  className="w-28 px-2 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium outline-none cursor-pointer"
                                >
                                  {SAP_ITEM_TYPES.map(it => (
                                    <option key={it} value={it}>{it}</option>
                                  ))}
                                </select>
                              </td>

                              {/* 4. Descripción del artículo */}
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={r.itemDescription || ''}
                                  onChange={e => handleSapRowChange(idx, 'itemDescription', e.target.value)}
                                  className="w-48 px-2 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold outline-none"
                                />
                              </td>

                              {/* 5. Descripcion_Adic (Descripción Exacta del Ítem del PDF) */}
                              <td className="p-1.5 bg-purple-50/30 dark:bg-purple-950/20">
                                <input
                                  type="text"
                                  value={r.additionalDescription || ''}
                                  onChange={e => handleSapRowChange(idx, 'additionalDescription', e.target.value)}
                                  placeholder="Descripción técnica del ítem en PDF"
                                  className="w-56 px-2 py-1 rounded border border-purple-300 dark:border-purple-800 bg-white dark:bg-zinc-800 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-purple-500"
                                  title="Descripción exacta de cada ítem del PDF"
                                />
                              </td>

                              {/* 6. Cantidad Requerida */}
                              <td className="p-1.5 text-center">
                                <input
                                  type="number"
                                  value={r.requiredQuantity ?? 1}
                                  onChange={e => handleSapRowChange(idx, 'requiredQuantity', parseFloat(e.target.value) || 0)}
                                  className="w-16 px-1.5 py-1 text-center font-mono rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold outline-none"
                                />
                              </td>

                              {/* 7. Nombre de unidad de medida */}
                              <td className="p-1.5 text-center">
                                <input
                                  type="text"
                                  value={r.unit || 'Und'}
                                  onChange={e => handleSapRowChange(idx, 'unit', e.target.value)}
                                  className="w-16 px-1.5 py-1 text-center font-mono rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* 8. Precio info */}
                              <td className="p-1.5 text-right font-mono">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={r.infoPrice ?? 0}
                                  onChange={e => handleSapRowChange(idx, 'infoPrice', parseFloat(e.target.value) || 0)}
                                  className="w-28 px-2 py-1 text-right font-mono rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold outline-none"
                                />
                              </td>

                              {/* 9. Indicador de impuestos */}
                              <td className="p-1.5 text-center">
                                <select
                                  value={r.taxIndicator || 'IVAD33'}
                                  onChange={e => handleSapRowChange(idx, 'taxIndicator', e.target.value)}
                                  className="w-28 px-1.5 py-1 text-center font-mono rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold outline-none cursor-pointer"
                                  title="Indicador de impuestos SAP (recalcula automáticamente el % de IVA y Total ML)"
                                >
                                  {SAP_TAX_INDICATORS.map(tax => (
                                    <option key={tax.code} value={tax.code}>
                                      {tax.code} ({tax.percentage}%)
                                    </option>
                                  ))}
                                  {!SAP_TAX_INDICATORS.some(t => t.code === r.taxIndicator) && r.taxIndicator && (
                                    <option value={r.taxIndicator}>{r.taxIndicator}</option>
                                  )}
                                </select>
                              </td>

                              {/* 10. Impuesto % */}
                              <td className="p-1.5 text-center font-mono">
                                <input
                                  type="number"
                                  value={r.taxPercentage ?? 19}
                                  onChange={e => handleSapRowChange(idx, 'taxPercentage', parseFloat(e.target.value) || 0)}
                                  className="w-14 px-1 py-1 text-center font-mono rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* 11. % de descuento */}
                              <td className="p-1.5 text-center font-mono">
                                <input
                                  type="number"
                                  value={r.discountPercentage ?? 0}
                                  onChange={e => handleSapRowChange(idx, 'discountPercentage', parseFloat(e.target.value) || 0)}
                                  className="w-14 px-1 py-1 text-center font-mono rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* 12. Almacén */}
                              <td className="p-1.5 text-center">
                                <select
                                  value={r.warehouse || 'Servic01'}
                                  onChange={e => handleSapRowChange(idx, 'warehouse', e.target.value)}
                                  className="w-28 px-1.5 py-1 text-center font-mono rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium outline-none cursor-pointer"
                                >
                                  {SAP_WAREHOUSES.map(wh => (
                                    <option key={wh.code} value={wh.code}>
                                      {wh.code} - {wh.name}
                                    </option>
                                  ))}
                                  {!SAP_WAREHOUSES.some(w => w.code === r.warehouse) && r.warehouse && (
                                    <option value={r.warehouse}>{r.warehouse}</option>
                                  )}
                                </select>
                              </td>

                              {/* 13. Proveedor Sugerido */}
                              <td className="p-1.5 font-mono">
                                <input
                                  type="text"
                                  value={r.suggestedSupplier || ''}
                                  onChange={e => handleSapRowChange(idx, 'suggestedSupplier', e.target.value)}
                                  className="w-28 px-2 py-1 font-mono rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* 14. Fecha Requerida */}
                              <td className="p-1.5 text-center font-mono">
                                <input
                                  type="text"
                                  value={r.requiredDate || ''}
                                  onChange={e => handleSapRowChange(idx, 'requiredDate', e.target.value)}
                                  className="w-24 px-1.5 py-1 text-center font-mono rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* 15. Centro Costos */}
                              <td className="p-1.5 text-center font-mono font-bold">
                                <select
                                  value={r.costCenter || 'AA0122'}
                                  onChange={e => handleSapRowChange(idx, 'costCenter', e.target.value)}
                                  className="w-32 px-1.5 py-1 text-center font-mono font-bold rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none cursor-pointer"
                                  title="Centro de costos asignado al ítem"
                                >
                                  {costCentersList.map(cc => (
                                    <option key={cc.code} value={cc.code}>
                                      {cc.code} ({cc.name.slice(0, 15)}...)
                                    </option>
                                  ))}
                                  {!costCentersList.some(c => c.code === r.costCenter) && r.costCenter && (
                                    <option value={r.costCenter}>{r.costCenter}</option>
                                  )}
                                </select>
                              </td>

                              {/* 16. Total (ML) - Automático: PRECIO INFO + IVA */}
                              <td className="p-1.5 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20">
                                {(() => {
                                  const raw = parseFloat(r.totalMl) || 0.0;
                                  const q = parseFloat(r.requiredQuantity) || 1.0;
                                  const p = parseFloat(r.infoPrice) || 0.0;
                                  const t = parseFloat(r.taxPercentage) || 0.0;
                                  const d = parseFloat(r.discountPercentage) || 0.0;
                                  const base = q * p * (1 - d / 100);
                                  const taxAmt = t > 0 ? (base * (t / 100)) : 0.0;
                                  const autoTotal = Math.round((base + taxAmt) * 100) / 100;
                                  const finalVal = raw > 0 ? raw : autoTotal;

                                  return (
                                    <span
                                      className="px-2.5 py-1 block text-right font-mono font-black text-emerald-700 dark:text-emerald-300 text-xs"
                                      title="Total ML automático: Precio Info + IVA (o solo Precio Info si IVA es 0)"
                                    >
                                      ${formatCurrency(finalVal)}
                                    </span>
                                  );
                                })()}
                              </td>

                              {/* 17. Solicitado por */}
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={r.requestedBy || ''}
                                  onChange={e => handleSapRowChange(idx, 'requestedBy', e.target.value)}
                                  className="w-32 px-2 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* 18. Observación */}
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={r.observation || ''}
                                  onChange={e => handleSapRowChange(idx, 'observation', e.target.value)}
                                  className="w-36 px-2 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* 19. Motivo */}
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={r.motive || ''}
                                  onChange={e => handleSapRowChange(idx, 'motive', e.target.value)}
                                  className="w-28 px-2 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* 20. Urgencia */}
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={r.urgency || ''}
                                  onChange={e => handleSapRowChange(idx, 'urgency', e.target.value)}
                                  className="w-20 px-1.5 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* 21. País/región de origen */}
                              <td className="p-1.5 text-center">
                                <input
                                  type="text"
                                  value={r.originCountry || 'CO'}
                                  onChange={e => handleSapRowChange(idx, 'originCountry', e.target.value)}
                                  className="w-14 px-1 py-1 text-center font-mono rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* 22. Vlr_Unit_Extranj */}
                              <td className="p-1.5 text-right font-mono">
                                <input
                                  type="number"
                                  value={r.foreignUnitPrice ?? 0}
                                  onChange={e => handleSapRowChange(idx, 'foreignUnitPrice', parseFloat(e.target.value) || 0)}
                                  className="w-20 px-1.5 py-1 text-right font-mono rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* 23. Fecha_Solicitud_Serv_Transp */}
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={r.transportRequestDate || ''}
                                  onChange={e => handleSapRowChange(idx, 'transportRequestDate', e.target.value)}
                                  className="w-28 px-1.5 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* 24. Gestion_Facturacion */}
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={r.billingManagement || ''}
                                  onChange={e => handleSapRowChange(idx, 'billingManagement', e.target.value)}
                                  className="w-28 px-1.5 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* 25. Novedad_Donacion */}
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={r.donationNovelty || ''}
                                  onChange={e => handleSapRowChange(idx, 'donationNovelty', e.target.value)}
                                  className="w-24 px-1.5 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* 26. Texto libre */}
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={r.freeText || ''}
                                  onChange={e => handleSapRowChange(idx, 'freeText', e.target.value)}
                                  className="w-32 px-1.5 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* 27. Moneda */}
                              <td className="p-1.5 text-center">
                                <input
                                  type="text"
                                  value={r.currency || 'COP'}
                                  onChange={e => handleSapRowChange(idx, 'currency', e.target.value)}
                                  className="w-16 px-1 py-1 text-center font-mono rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* 28. Novedad_Donaciones */}
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={r.donationNovelty2 || ''}
                                  onChange={e => handleSapRowChange(idx, 'donationNovelty2', e.target.value)}
                                  className="w-24 px-1.5 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* 29. Novedad_Obsequios */}
                              <td className="p-1.5">
                                <input
                                  type="text"
                                  value={r.giftNovelty || ''}
                                  onChange={e => handleSapRowChange(idx, 'giftNovelty', e.target.value)}
                                  className="w-24 px-1.5 py-1 rounded border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs outline-none"
                                />
                              </td>

                              {/* Eliminar Fila */}
                              <td className="p-1.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSapRow(idx)}
                                  disabled={(sapData.rows || []).length <= 1}
                                  className="p-1 rounded text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                                  title="Eliminar fila"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-100 dark:bg-zinc-800 font-bold border-t border-slate-200 dark:border-zinc-700">
                          <tr>
                            <td colSpan={16} className="p-2.5 text-right font-black uppercase text-slate-700 dark:text-zinc-200 text-xs">
                              Suma Total Final ML (con IVA):
                            </td>
                            <td className="p-2 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs bg-emerald-100/60 dark:bg-emerald-950/60 border-x border-emerald-300 dark:border-emerald-700">
                              ${formatCurrency(sapTotalMlSum)}
                            </td>
                            <td colSpan={14} className="p-2"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* RESUMEN FINANCIERO TOTALES ABAJO DE LA PLANTILLA */}
                  <div className="bg-slate-900 dark:bg-zinc-950 text-white p-4 rounded-2xl shadow-sm border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xs sm:text-sm flex-shrink-0">
                        SAP
                      </div>
                      <div>
                        <div className="font-black text-xs sm:text-sm text-white flex items-center gap-2">
                          <span>Liquidación Presolicitud de Compra</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {sapData.rows?.length || 0} ítems
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-400">
                          Valores calculados por ítem con y sin IVA de acuerdo con la lectura AI y parámetros de la plantilla.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-6 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Total antes de IVA</span>
                        <span className="font-mono font-bold text-slate-200 text-xs sm:text-sm">
                          ${formatCurrency(sapSubtotalSum)} COP
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-blue-400 uppercase block">Total IVA</span>
                        <span className="font-mono font-bold text-blue-400 text-xs sm:text-sm">
                          ${formatCurrency(sapTaxSum)} COP
                        </span>
                      </div>

                      <div className="text-right bg-emerald-950/70 border border-emerald-500/40 px-3.5 py-1.5 rounded-xl">
                        <span className="text-[10px] font-black text-emerald-400 uppercase block">Total Final ML con IVA</span>
                        <span className="font-mono font-black text-emerald-300 text-sm sm:text-base">
                          ${formatCurrency(sapTotalMlSum)} COP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ALERTA INFORMATIVA APIS DE SAP */}
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Los 29 campos visualizados coinciden exactamente con la plantilla de <strong>Presolicitud de Compra de SAP</strong>. Puedes modificar cualquiera de los valores directamente en la tabla, guardarlos en la base de datos o descargar el archivo Excel (.xlsx) listo para carga masiva y consumo por API.
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* BOTONES DE ACCIÓN SAP */}
            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Alimentos Enriko S.A.S. • Presolicitudes de Compra SAP B1 / S4HANA
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSapModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cerrar
                </button>

                {sapData && (
                  <button
                    type="button"
                    onClick={handleSaveSapPresolicitud}
                    disabled={savingSap}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Save className={`w-4 h-4 ${savingSap ? 'animate-spin' : ''}`} />
                    <span>{savingSap ? 'Guardando en BD...' : 'Guardar Presolicitud'}</span>
                  </button>
                )}

                {sapData && (
                  <a
                    href={api.getSapExcelDownloadUrl(sapData.invoiceId, currentUser?.name || 'Usuario')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Excel SAP (.xlsx)</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => {
                    notifySuccess('Validación Exitosa', 'Estructura verificada correctamente. Lista para sincronización directa con los endpoints de SAP.');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar a API SAP</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL RECHAZO CON MOTIVO */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-red-600">
              <XCircle className="w-6 h-6" />
              <h3 className="text-base font-black text-slate-900 dark:text-white">Rechazar Facturas ({rejectTargetIds.length})</h3>
            </div>
            <p className="text-xs text-slate-500">
              Por favor indica el motivo del rechazo para notificación al proveedor y control contable:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motivo (ej: Contrato no corresponde a este servicio, cantidades no recibidas...)"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-xs outline-none h-24 resize-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setRejectModalOpen(false)} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-zinc-700">
                Cancelar
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-500 cursor-pointer shadow-md"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
