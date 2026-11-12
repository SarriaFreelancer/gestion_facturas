'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Inbox, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  FileText, 
  Download, 
  Building2, 
  ShieldCheck, 
  Zap, 
  ExternalLink,
  Filter,
  ArrowRight,
  Clock,
  Send,
  Layers,
  FileCheck,
  Check,
  Database,
  Lock,
  Play,
  ArrowLeft,
  X,
  FileDown,
  Printer,
  Eye,
  ZoomIn,
  ZoomOut,
  Trash2
} from 'lucide-react';
import { User, CompanyArea } from '../app/types';
import { api, API_BASE_URL } from '../lib/api';
import { notifySuccess, notifyError, notifyWarning, notifyInfo } from '../lib/alerts';

interface FactureModuleProps {
  onInvoicesUpdated?: () => void;
  currentUser?: User | null;
  companyAreas?: CompanyArea[];
}

export const FactureModule: React.FC<FactureModuleProps> = ({ 
  onInvoicesUpdated,
  currentUser,
  companyAreas = []
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'logs' | 'config'>('inbox');
  const [folderFilter, setFolderFilter] = useState<'Todos' | 'Recibidos' | 'Recibidos (contado)' | 'Procesados (contado)' | 'Procesados'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [statusInfo, setStatusInfo] = useState<any>({
    username: 'TicsEnriko',
    nit: '890330035',
    companyName: 'ALIMENTOS ENRIKO S.A.S',
    recibidosCount: 2150,
    contadoCount: 458,
    recibidosCreditoCount: 2150,
    procesadosCreditoCount: 0,
    recibidosContadoCount: 458,
    procesadosContadoCount: 0,
    lastSyncAt: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);

  // Paginación en el Sistema
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Estados de Inspección Inteligente & Lectura de Facturas (IA)
  const [inspectingLoading, setInspectingLoading] = useState(false);
  const [inspectionData, setInspectionData] = useState<any | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState<'pdf' | 'analysis' | 'events'>('pdf');

  // Estados del Asistente de Fases de Automatización
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [targetDocNumber, setTargetDocNumber] = useState('');
  const [selectedDocObj, setSelectedDocObj] = useState<any | null>(null);
  const [executeEventsOption, setExecuteEventsOption] = useState(false);
  const [downloadPdfOption, setDownloadPdfOption] = useState(true);
  const [runningWorkflow, setRunningWorkflow] = useState(false);
  const [workflowResult, setWorkflowResult] = useState<any | null>(null);
  const [batchDownloadingPdfs, setBatchDownloadingPdfs] = useState(false);
  const [downloaderStatus, setDownloaderStatus] = useState<any | null>(null);

  // Cargar inspección inteligente de la factura al abrir el modal
  const loadInvoiceInspection = async (docNum: string, forceDownload: boolean = false, forceReanalysis: boolean = false) => {
    try {
      setInspectingLoading(true);
      if (!forceReanalysis) {
        setInspectionData(null);
      }
      const res = await api.inspectAndReadFactureDoc(docNum, forceDownload, forceReanalysis);
      setInspectionData(res);
    } catch (err: any) {
      console.error('Error inspeccionando factura:', err);
      notifyError('Aviso al cargar factura', err.message || 'No se pudo conectar con el servidor.');
    } finally {
      setInspectingLoading(false);
    }
  };

  // Descarga masiva de PDFs en segundo plano con Playwright
  const handleBatchDownloadPdfs = async () => {
    try {
      setBatchDownloadingPdfs(true);
      notifyInfo('Descarga Masiva de PDFs', 'Playwright está navegando en Facture.co para descargar los PDFs pendientes...');
      const res = await api.batchDownloadFacturePdfs(50, folderFilter);
      if (res.success) {
        notifySuccess('Descarga Masiva Exitosa', `Se descargaron ${res.downloaded} PDFs correctamente (${res.skipped} ya estaban en el servidor).`);
      } else {
        notifyError('Aviso en Descarga Masiva', res.error || 'Ocurrió un error en la descarga.');
      }
      await loadAllData();
      if (onInvoicesUpdated) onInvoicesUpdated();
    } catch (err: any) {
      notifyError('Error en Descarga Masiva', err.message);
    } finally {
      setBatchDownloadingPdfs(false);
    }
  };

  // Aprobar la lectura de AI y persistir el estado APROBADA
  const handleApproveAiReading = async (docNum: string) => {
    try {
      setInspectingLoading(true);
      const res = await api.approveAiReading(docNum);
      notifySuccess('Lectura Aprobada', res.message || 'La lectura de la IA ha sido aprobada.');
      await loadInvoiceInspection(docNum, false, false);
      await loadAllData();
      if (onInvoicesUpdated) onInvoicesUpdated();
    } catch (err: any) {
      notifyError('Error al aprobar lectura', err.message);
    } finally {
      setInspectingLoading(false);
    }
  };

  const openWorkflowForDoc = (doc: any, defaultTab: 'pdf' | 'analysis' | 'events' = 'pdf') => {
    const docNum = typeof doc === 'string' ? doc : doc.documentNumber;
    const docObj = typeof doc === 'object' ? doc : documents.find(d => d.documentNumber === docNum) || null;
    setSelectedDocObj(docObj);
    setTargetDocNumber(docNum);
    setWorkflowResult(null);
    setInspectionData(null);
    setModalActiveTab(defaultTab);
    setWorkflowModalOpen(true);
    // Si se quiere ver el PDF y aún no está marcado como descargado, forzar descarga con Playwright en vivo
    const needsDownload = defaultTab === 'pdf' && (!docObj || !docObj.pdfDownloaded);
    loadInvoiceInspection(docNum, needsDownload);
  };

  // Importar documento a la tabla principal de facturas del sistema
  const handleImportDocument = async (docId: string, docNum: string) => {
    try {
      setImportingId(docId);
      const userArea = currentUser?.area || 'General';

      if (inspectionData?.linkedInvoice) {
        const linked = inspectionData.linkedInvoice;
        if (linked.area && linked.area !== 'General' && userArea !== 'General' && linked.area.toLowerCase() !== userArea.toLowerCase()) {
          notifyError('No Permitido', `La factura ya fue vinculada previamente por el área '${linked.area}' al proveedor '${linked.supplier}'.`);
          return;
        }
      }

      await api.importFactureDocToMain(docId, userArea);
      notifySuccess('Factura Importada', `La factura ${docNum} fue registrada en el sistema con estado 'En Facture: SÍ'.`);
      await loadAllData();
      if (onInvoicesUpdated) onInvoicesUpdated();
    } catch (err: any) {
      notifyError('Error al importar', err.message);
    } finally {
      setImportingId(null);
    }
  };

  // Desvincular documento y dejarlo libre para volver a vincular
  const handleUnlinkDocument = async (docNum: string) => {
    if (!confirm(`¿Estás seguro de desvincular la factura ${docNum}? Se retirará de la lista de facturas para que pueda ser vinculada nuevamente.`)) {
      return;
    }
    try {
      setImportingId(docNum);
      await api.unlinkFactureDocument(docNum);
      notifySuccess('Factura Desvinculada', `La factura ${docNum} quedó libre para volver a ser vinculada.`);
      await loadAllData();
      if (onInvoicesUpdated) onInvoicesUpdated();
    } catch (err: any) {
      notifyError('Error al desvincular', err.message);
    } finally {
      setImportingId(null);
    }
  };

  const [savingContract, setSavingContract] = useState(false);

  // Guardar factura como habitual con su número de contrato y enviarla al módulo de Jefes
  const handleSaveAsHabitualContractAndRoute = async () => {
    if (!inspectionData?.analysis) return;
    try {
      setSavingContract(true);
      const a = inspectionData.analysis;
      const sup = inspectionData.supplierMatch;
      const userArea = currentUser?.area || 'General';

      // 0. Validación de vinculación por otra área o vinculación previa
      if (inspectionData?.linkedInvoice) {
        const linked = inspectionData.linkedInvoice;
        if (linked.area && linked.area !== 'General' && userArea !== 'General' && linked.area.toLowerCase() !== userArea.toLowerCase()) {
          notifyError('No Permitido', `Esta factura ya fue vinculada por el área '${linked.area}' al proveedor '${linked.supplier}'. No es posible vincularla por tu área (${userArea}).`);
          return;
        }
        if (linked.contractNumber && linked.enFacture === 'SÍ') {
          notifyWarning('Factura ya Vinculada', `Esta factura ya se encuentra vinculada al contrato '${linked.contractNumber}'. Solo debe vincularse una única vez.`);
          return;
        }
      }

      // 1. Verificación proactiva de duplicidad
      try {
        const dupCheck = await api.checkInvoiceDuplicate(a.numeroFactura, sup?.supplierName || a.nombreEmisor);
        if (dupCheck && dupCheck.isDuplicate) {
          notifyWarning('Factura ya Existente', `La factura ${a.numeroFactura} ya existe en el sistema. Se actualizará con el contrato.`);
        }
      } catch (e) {
        console.warn('Verificación de duplicado omitida:', e);
      }

      // 2. Validar y asegurar Eventos DIAN (Acuse 030, Recibo 032, Aceptación 033) antes de enviar a aprobación por el jefe
      const eventsAlreadyDone = 
        inspectionData.dianEventsStatus === 'COMPLETADO' ||
        inspectionData.dianStatus === 'ACEPTADO' ||
        inspectionData.linkedInvoice?.dianEventsStatus === 'COMPLETADO' ||
        selectedDocObj?.dianStatus === 'ACEPTADO';

      let finalDianEventsStatus = eventsAlreadyDone ? 'COMPLETADO' : 'PENDIENTE';

      if (!eventsAlreadyDone) {
        notifyInfo('Asegurando Eventos DIAN', `Ejecutando acuse, recibido y aceptación en Facture.co para ${a.numeroFactura} antes de enviar a aprobación por el jefe...`);
        try {
          const wfRes = await api.processFactureWorkflow({
            documentNumber: a.numeroFactura,
            executeEvents: true,
            downloadPdf: !inspectionData.pdfPath
          });
          if (wfRes.success) {
            finalDianEventsStatus = 'COMPLETADO';
            notifySuccess('Eventos DIAN Asegurados', 'Acuse, recibido y aceptado ejecutados con éxito ante la DIAN.');
          } else {
            notifyWarning('Aviso en Eventos DIAN', wfRes.error || 'No se pudieron completar automáticamente los 3 eventos en Facture.co.');
          }
        } catch (eventErr: any) {
          console.warn('Error al asegurar eventos automáticamente:', eventErr);
          notifyWarning('Eventos DIAN Pendientes', 'No fue posible completar la automatización en Facture.co. Por favor verifica tus credenciales o el estado en el portal.');
        }
      }

      // 3. Guardar contrato habitual e ingresar a facturas con approvalStatus = 'Pendiente'
      const cleanAiSummary = (
        inspectionData.aiShortSummary ||
        a.resumenCorto ||
        (a.items && a.items.length > 0
          ? a.items.map((i: any) => i.descripcion).filter(Boolean).slice(0, 3).join(', ')
          : (sup?.matchedConcept && !sup.matchedConcept.toUpperCase().includes('SE RECIBE DOCUMENTO')
              ? sup.matchedConcept
              : `Servicio ${sup?.supplierName || a.nombreEmisor}`))
      );

      const res = await api.saveHabitualContract({
        documentNumber: a.numeroFactura,
        invoiceNumber: a.numeroFactura,
        supplier: sup?.supplierName || a.nombreEmisor || 'Proveedor',
        issuerName: sup?.supplierName || a.nombreEmisor || 'Proveedor',
        supplierNit: sup?.supplierNit || a.nitEmisor || '',
        issuerNit: sup?.supplierNit || a.nitEmisor || '',
        contractNumber: a.numeroContrato || '',
        service: cleanAiSummary,
        aiShortSummary: cleanAiSummary,
        area: userArea,
        emissionDate: a.fechaEmision,
        dueDate: a.fechaVencimiento,
        totalAmount: a.totalConIva || 0,
        subtotal: a.subtotalSinIva || 0,
        tax: a.totalIva || 0,
        itemsJson: a.items || [],
        pdfPath: inspectionData.pdfPath,
        pdfOriginalName: `${a.numeroFactura}.pdf`,
        referenceNumber: a.numeroReferencia || '',
        dianEventsStatus: finalDianEventsStatus
      });

      notifySuccess('¡Contrato Habitual Guardado!', res.message || 'La factura fue enviada al módulo de Aprobaciones de Jefes por Área.');
      await loadAllData();
      if (onInvoicesUpdated) onInvoicesUpdated();
    } catch (err: any) {
      notifyError('Error al guardar contrato habitual', err.message);
    } finally {
      setSavingContract(false);
    }
  };

  // Cargar todos los datos de Facture (estado, inbox, logs)
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [status, docs, auditLogs, dlStatus] = await Promise.all([
        api.getFactureStatus().catch(() => null),
        api.getFactureInbox(folderFilter, searchTerm).catch(() => []),
        api.getFactureLogs().catch(() => []),
        api.getDownloaderStatus().catch(() => null)
      ]);
      if (status) setStatusInfo(status);
      if (docs) setDocuments(docs);
      if (auditLogs) setLogs(auditLogs);
      if (dlStatus) setDownloaderStatus(dlStatus);
    } catch (err: any) {
      console.error('Error cargando datos de Facture:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    const timer = setInterval(() => {
      api.getDownloaderStatus().then(st => {
        if (st) setDownloaderStatus(st);
      }).catch(() => {});
    }, 15000);
    return () => clearInterval(timer);
  }, [folderFilter]);

  // Sincronización en vivo con Facture.co
  const handleLiveSync = async () => {
    try {
      setSyncing(true);
      notifyInfo('Sincronizando Facture.co', 'Conectando con la plataforma y extrayendo documentos...');
      const res = await api.syncFactureInbox();
      
      // Auto-vincular recurrentes de los últimos 2 meses
      const matchRes = await api.autoMatchRecurrentInvoices().catch(() => null);
      if (matchRes && matchRes.linkedCount > 0) {
        notifySuccess('Sincronización Exitosa', `Sincronizados ${res.syncedDocsCount || 0} docs y vinculadas automáticamente ${matchRes.linkedCount} facturas recurrentes.`);
      } else {
        notifySuccess('Sincronización Exitosa', `Se sincronizaron ${res.syncedDocsCount || 0} documentos correctamente.`);
      }
      await loadAllData();
      if (onInvoicesUpdated) onInvoicesUpdated();
    } catch (err: any) {
      notifyError('Error en Sincronización', err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleAutoMatchRecurrent = async () => {
    try {
      setSyncing(true);
      notifyInfo('Escaneo de Recurrentes', 'Analizando facturas de Facture contra conceptos de los últimos 2 meses...');
      const res = await api.autoMatchRecurrentInvoices();
      if (res.linkedCount > 0) {
        notifySuccess('Vinculación Automática', `Se vincularon ${res.linkedCount} facturas a proveedores y se generaron sus plantillas SAP.`);
      } else {
        notifyInfo('Sin Nuevas Coincidencias', 'Todas las facturas recurrentes ya están vinculadas.');
      }
      await loadAllData();
      if (onInvoicesUpdated) onInvoicesUpdated();
    } catch (err: any) {
      notifyError('Error al vincular recurrentes', err.message);
    } finally {
      setSyncing(false);
    }
  };

  // Ejecución del asistente automatizado por fases
  const handleRunWorkflow = async () => {
    if (!targetDocNumber.trim()) return;
    try {
      setRunningWorkflow(true);
      setWorkflowResult(null);
      notifyInfo('Iniciando Automatización', `Ejecutando flujo por fases para ${targetDocNumber}...`);
      const res = await api.processFactureWorkflow({
        documentNumber: targetDocNumber.trim(),
        executeEvents: executeEventsOption,
        downloadPdf: downloadPdfOption
      });
      setWorkflowResult(res);
      if (res.success) {
        notifySuccess('Automatización Completada', `Procesamiento exitoso para la factura ${targetDocNumber}.`);
      } else {
        notifyError('Aviso en Automatización', res.error || 'Ocurrió un inconveniente durante el procesamiento.');
      }
      await loadAllData();
      if (onInvoicesUpdated) onInvoicesUpdated();
    } catch (err: any) {
      notifyError('Error en Automatización', err.message);
      setWorkflowResult({ success: false, error: err.message });
    } finally {
      setRunningWorkflow(false);
    }
  };

  // Ejecución directa de evento DIAN desde la barra del visor
  const handleDirectExecuteEvent = async (docNum: string, eventName: string) => {
    if (!docNum.trim()) return;
    try {
      setRunningWorkflow(true);
      setExecuteEventsOption(true);
      setModalActiveTab('events');
      notifyInfo(`Ejecutando ${eventName}`, `Iniciando robot en Facture.co para el documento ${docNum}...`);
      const res = await api.processFactureWorkflow({
        documentNumber: docNum.trim(),
        executeEvents: true,
        downloadPdf: false
      });
      setWorkflowResult(res);
      if (res.success) {
        notifySuccess(`${eventName} Exitoso`, `Se ejecutó ${eventName} correctamente en Facture.co.`);
      } else {
        notifyError(`Aviso en ${eventName}`, res.error || 'No se pudo completar la ejecución del evento.');
      }
      await loadAllData();
      if (onInvoicesUpdated) onInvoicesUpdated();
    } catch (err: any) {
      notifyError(`Error ejecutando ${eventName}`, err.message);
      setWorkflowResult({ success: false, error: err.message });
    } finally {
      setRunningWorkflow(false);
    }
  };

  // Filtrado reactivo en memoria
  const filteredDocuments = useMemo(() => {
    if (!searchTerm.trim()) return documents;
    const term = searchTerm.toLowerCase();
    return documents.filter(doc => 
      (doc.documentNumber || '').toLowerCase().includes(term) ||
      (doc.issuerName || '').toLowerCase().includes(term) ||
      (doc.issuerNit || '').toLowerCase().includes(term) ||
      (doc.rawDetail || '').toLowerCase().includes(term)
    );
  }, [documents, searchTerm]);

  // Cálculos de Paginación en el Sistema
  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / itemsPerPage));
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDocuments, currentPage, itemsPerPage]);

  // Formato de moneda COP
  const formatCurrency = (val: number) => {
    return Number(val || 0).toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const recibidosCreditoCount = statusInfo.recibidosCreditoCount ?? statusInfo.recibidosCount ?? 0;
  const recibidosContadoCount = statusInfo.recibidosContadoCount ?? statusInfo.contadoCount ?? 0;
  const procesadosContadoCount = statusInfo.procesadosContadoCount ?? 0;
  const totalBandejaCount = recibidosCreditoCount + recibidosContadoCount + procesadosContadoCount;

  return (
    <div className="w-full space-y-6">
      {/* HEADER DEL MÓDULO */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-md shadow-red-600/30 flex-shrink-0">
            <Inbox className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                Bandeja de Facturas & Trazabilidad Facture.co
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/50 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Conectado: NIT {statusInfo.nit || '890330035'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>{statusInfo.companyName || 'ALIMENTOS ENRIKO S.A.S'}</span>
              <span>•</span>
              <span>Última lectura: {statusInfo.lastSyncAt ? new Date(statusInfo.lastSyncAt).toLocaleString('es-CO') : 'Reciente'}</span>
            </p>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => {
              setTargetDocNumber('');
              setWorkflowResult(null);
              setWorkflowModalOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white dark:text-zinc-900 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            title="Abrir el asistente automatizado de procesamiento por fases"
          >
            <Play className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600 fill-amber-400 dark:fill-amber-600" />
            <span>Asistente de Fases</span>
          </button>

          <button
            onClick={handleLiveSync}
            disabled={syncing || batchDownloadingPdfs}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Conectar y sincronizar todas las páginas de Facture.co en tiempo real"
          >
            <RefreshCw className={`w-4 h-4 text-white ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sincronizando Páginas Facture...' : 'Sincronizar Bandeja Facture'}</span>
          </button>

          <button
            onClick={handleAutoMatchRecurrent}
            disabled={syncing || batchDownloadingPdfs}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Escanear facturas de Facture y vincularlas automáticamente con proveedores recurrentes de los últimos 2 meses"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Vincular Recurrentes & SAP</span>
          </button>

          <button
            onClick={handleBatchDownloadPdfs}
            disabled={batchDownloadingPdfs || syncing}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Descargar manualmente un lote adicional de facturas pendientes usando Playwright"
          >
            <Download className={`w-4 h-4 text-white ${batchDownloadingPdfs ? 'animate-bounce' : ''}`} />
            <span>{batchDownloadingPdfs ? 'Descargando PDFs con Playwright...' : 'Descargar Lote Ahora'}</span>
          </button>

          {downloaderStatus && (
            <div 
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center gap-2 shadow-2xs select-none"
              title={downloaderStatus.lastStatus || 'Descarga automática en segundo plano'}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${downloaderStatus.isRunning ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${downloaderStatus.isRunning ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  {downloaderStatus.isRunning ? 'Auto-Descarga Activa' : 'Descargador Pausado'}
                </span>
                <span className="text-[11px] font-extrabold text-slate-800 dark:text-zinc-200">
                  <span className="text-emerald-600 dark:text-emerald-400">{downloaderStatus.downloadedCount}</span> / {downloaderStatus.totalCount} PDFs ({downloaderStatus.pendingCount} pendientes)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TARJETAS DE CONTEO Y MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* RECIBIDOS / CRÉDITO */}
        <div 
          onClick={() => setFolderFilter('Recibidos')}
          className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all cursor-pointer shadow-sm flex items-center justify-between ${
            folderFilter === 'Recibidos' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Recibidos (Crédito)
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {recibidosCreditoCount}
            </div>
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 mt-0.5 block">
              Facturas a crédito por gestionar
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* RECIBIDOS (CONTADO) */}
        <div 
          onClick={() => setFolderFilter('Recibidos (contado)')}
          className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all cursor-pointer shadow-sm flex items-center justify-between ${
            folderFilter === 'Recibidos (contado)' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Recibidos (contado)
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {recibidosContadoCount}
            </div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
              Documentos de contado pendientes
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* PROCESADOS (CONTADO) */}
        <div 
          onClick={() => setFolderFilter('Procesados (contado)')}
          className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all cursor-pointer shadow-sm flex items-center justify-between ${
            folderFilter === 'Procesados (contado)' ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Procesados (contado)
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {procesadosContadoCount}
            </div>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mt-0.5 block">
              Facturas de contado procesadas
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        {/* TOTAL BANDEJA */}
        <div 
          onClick={() => setFolderFilter('Todos')}
          className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all cursor-pointer shadow-sm flex items-center justify-between ${
            folderFilter === 'Todos' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
          }`}
        >
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Total en Bandeja Inbox
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalBandejaCount}
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              Documentos sincronizados
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Inbox className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'inbox'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Bandeja Documentos Facture ({filteredDocuments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Trazabilidad & Auditoría ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'config'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Credenciales & Acceso</span>
        </button>
      </div>

      {/* CONTENIDO PESTAÑA 1: BANDEJA INBOX */}
      {activeTab === 'inbox' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          {/* BARRA DE FILTROS Y BÚSQUEDA */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            {/* PILLS DE CARPETA */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-bold">
              {[
                { key: 'Todos', label: 'Todos' },
                { key: 'Recibidos', label: 'Recibidos (Crédito)' },
                { key: 'Recibidos (contado)', label: 'Recibidos (contado)' },
                { key: 'Procesados (contado)', label: 'Procesados (contado)' },
                { key: 'Procesados', label: 'Procesados (Crédito)' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFolderFilter(f.key as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    folderFilter === f.key
                      ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-2xs font-extrabold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* BUSCADOR */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por documento, proveedor, NIT..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-red-500 font-medium"
              />
            </div>
          </div>

          {/* TABLA DE DOCUMENTOS FACTURE */}
          <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl">
            <table className="w-full min-w-[850px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 font-extrabold border-b border-slate-200 dark:border-zinc-700">
                  <th className="p-3">Documento</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Emisor / Proveedor</th>
                  <th className="p-3">NIT Emisor</th>
                  <th className="p-3">Fecha Emisión</th>
                  <th className="p-3">Fecha Recepción</th>
                  <th className="p-3 text-right">Valor ($ COP)</th>
                  <th className="p-3 text-center">Estado Sistema</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {paginatedDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
                          <span>Cargando documentos de Facture.co...</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="font-bold">No hay documentos en esta vista.</p>
                          <p className="text-[11px]">Presiona el botón <strong>"Sincronizar Bandeja Facture"</strong> para descargar las facturas más recientes de todas las carpetas.</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedDocuments.map(doc => {
                    const isSynced = Boolean(doc.linkedInvoiceId) && (doc.isSyncedToMain === 1 || doc.isSyncedToMain === true);
                    return (
                      <tr 
                        key={doc.id} 
                        onClick={() => openWorkflowForDoc(doc, 'pdf')}
                        className="hover:bg-red-50/50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer group"
                        title="Clic para abrir el visor de PDF y lectura inteligente"
                      >
                        <td className="p-3 font-mono font-extrabold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <FileText className="w-3.5 h-3.5 text-red-600 opacity-70 group-hover:opacity-100 flex-shrink-0" />
                            <span>{doc.documentNumber}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-bold">
                              {doc.folderType || 'Facture'}
                            </span>
                            {doc.consensusConfirmed && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-extrabold border border-blue-200 dark:border-blue-800" title={`Lectura confirmada por consenso (${doc.verificationPasses || 2} lecturas)`}>
                                ✓ Consenso ({doc.verificationPasses || 2}L)
                              </span>
                            )}
                            {doc.aiReadingStatus === 'APROBADA' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-extrabold border border-emerald-200 dark:border-emerald-800" title="Lectura AI Aprobada">
                                ✓ IA Aprobada
                              </span>
                            )}
                            {doc.aiReadingStatus === 'LECTURA REALIZADA' && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 font-extrabold border border-purple-200 dark:border-purple-800" title="Lectura AI Realizada - Pendiente de Aprobación">
                                ★ IA Leída
                              </span>
                            )}
                          </div>
                          {doc.aiShortSummary && (
                            <div className="text-[10px] font-sans font-bold text-purple-700 dark:text-purple-300 truncate max-w-[240px] mt-0.5 flex items-center gap-1" title={doc.aiShortSummary}>
                              <Zap className="w-2.5 h-2.5 text-purple-500 flex-shrink-0" />
                              <span>{doc.aiShortSummary}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-[11px] text-slate-600 dark:text-zinc-400">
                          {doc.docType || 'FACTURA DE VENTA'}
                        </td>
                        <td className="p-3 font-bold text-slate-800 dark:text-zinc-200">
                          <div>{doc.issuerName}</div>
                          {doc.aiShortSummary ? (
                            <div className="text-[10.5px] text-purple-600 dark:text-purple-400 font-bold truncate max-w-[260px] flex items-center gap-1 mt-0.5" title={doc.aiShortSummary}>
                              <Zap className="w-3 h-3 text-purple-500 flex-shrink-0" />
                              <span className="truncate">{doc.aiShortSummary}</span>
                            </div>
                          ) : (
                            doc.rawDetail && !doc.rawDetail.toUpperCase().includes('SE RECIBE DOCUMENTO') ? (
                              <div className="text-[10px] text-slate-400 font-normal truncate max-w-[220px]" title={doc.rawDetail}>
                                {doc.rawDetail}
                              </div>
                            ) : null
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                          {doc.issuerNit}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                          {doc.emissionDate || '—'}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold">
                          {doc.receptionDate || '—'}
                        </td>
                        <td className="p-3 text-right font-mono font-black text-slate-900 dark:text-white">
                          ${formatCurrency(doc.detailAmount)}
                        </td>
                        <td className="p-3 text-center">
                          {doc.linkedInvoiceId && doc.linkedArea ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Vinculada
                              </span>
                              <span className={`text-[9.5px] font-extrabold px-1.5 py-0.2 rounded-md ${
                                currentUser?.area && doc.linkedArea.toLowerCase() === currentUser.area.toLowerCase()
                                  ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900'
                                  : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                              }`}>
                                {doc.linkedArea}
                              </span>
                            </div>
                          ) : isSynced ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              En Facturas
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                              Pendiente Vincular
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openWorkflowForDoc(doc, 'pdf')}
                              className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              title="Ver y descargar PDF"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Ver PDF</span>
                            </button>

                            <button
                              onClick={() => openWorkflowForDoc(doc, 'analysis')}
                              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-white font-bold text-[10px] transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              title="Lectura inteligente de precios e IVA"
                            >
                              <FileText className="w-2.5 h-2.5 text-amber-400" />
                              <span>Leer</span>
                            </button>

                            {!isSynced ? (
                              <button
                                onClick={() => handleImportDocument(doc.id, doc.documentNumber)}
                                disabled={importingId === doc.id}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs disabled:opacity-50"
                                title="Importar al módulo de facturas generales y vincular a proveedor"
                              >
                                <FileCheck className="w-3 h-3" />
                                <span>{importingId === doc.id ? '...' : 'Vincular'}</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg px-1.5 py-0.5">
                                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-extrabold">✓ Vinculada</span>
                                <button
                                  onClick={() => handleUnlinkDocument(doc.documentNumber)}
                                  disabled={importingId === doc.documentNumber}
                                  className="w-5 h-5 rounded hover:bg-red-100 dark:hover:bg-red-950/80 text-slate-400 hover:text-red-600 inline-flex items-center justify-center transition-colors cursor-pointer"
                                  title="Desvincular factura para volver a vincular"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* CONTROLES DE PAGINACIÓN EN EL SISTEMA */}
          {filteredDocuments.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <span>Mostrar</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-bold text-xs outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>por página</span>
                <span className="text-slate-400">|</span>
                <span className="font-medium text-slate-700 dark:text-zinc-300">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredDocuments.length)} de {filteredDocuments.length} documentos
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed font-extrabold transition-all"
                  title="Primera página"
                >
                  «
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed font-extrabold transition-all"
                  title="Página anterior"
                >
                  ‹ Anterior
                </button>

                <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 font-extrabold text-slate-900 dark:text-white">
                  Página {currentPage} de {totalPages}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed font-extrabold transition-all"
                  title="Página siguiente"
                >
                  Siguiente ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed font-extrabold transition-all"
                  title="Última página"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENIDO PESTAÑA 2: TRAZABILIDAD & AUDITORÍA */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Registro Cronológico de Acciones Automatizadas
              </h3>
              <p className="text-[11px] text-slate-400">
                Auditoría completa de conexiones, lecturas, descargas y eventos en Facture.co
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {logs.length} eventos registrados
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 font-extrabold border-b border-slate-200 dark:border-zinc-700">
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Tipo de Acción</th>
                  <th className="p-3">Documento / Emisor</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3">Detalle / Mensaje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                      No hay registros de auditoría aún.
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="p-3 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('es-CO') : '—'}
                      </td>
                      <td className="p-3 font-bold text-slate-800 dark:text-zinc-200">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-[10px] font-mono">
                          {log.actionType}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-700 dark:text-zinc-300">
                        {log.documentNumber ? (
                          <span className="font-mono font-bold">{log.documentNumber}</span>
                        ) : log.issuerName ? (
                          <span>{log.issuerName}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-600 dark:text-zinc-300">
                        {log.message}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENIDO PESTAÑA 3: CONFIGURACIÓN DE ACCESO */}
      {activeTab === 'config' && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm max-w-2xl space-y-4">
          <div className="border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-600" />
              <span>Credenciales de Autenticación Facture.co</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Parámetros de acceso seguro para el robot de lectura y sincronización
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Usuario de Plataforma
              </label>
              <input
                type="text"
                defaultValue={statusInfo.username || 'TicsEnriko'}
                readOnly
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                NIT de la Empresa / Contrato
              </label>
              <input
                type="text"
                defaultValue={statusInfo.nit || '890330035'}
                readOnly
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Razón Social Vinculada
              </label>
              <input
                type="text"
                defaultValue={statusInfo.companyName || 'ALIMENTOS ENRIKO S.A.S'}
                readOnly
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[11px] text-slate-500 dark:text-zinc-400 space-y-1">
              <span className="font-bold text-slate-700 dark:text-zinc-200 block">🔒 Seguridad Garantizada:</span>
              <p>Las contraseñas se almacenan de forma segura y cifrada en el servidor local de base de datos MySQL.</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE INSPECCIÓN INTELIGENTE, VISOR PDF Y FASES DE AUTOMATIZACIÓN */}
      {workflowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col">
            {/* MODAL HEADER */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-900/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-md shadow-red-600/30 flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Visor de Documentos & Lectura</span>
                    </h2>
                    {targetDocNumber && (
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-extrabold border border-red-200 dark:border-red-900/50">
                        {targetDocNumber}
                      </span>
                    )}
                    {selectedDocObj?.issuerName && (
                      <span className="text-xs text-slate-500 font-bold hidden sm:inline">
                        • {selectedDocObj.issuerName}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Visualiza el PDF original, analiza precios e IVA con IA, o ejecuta eventos DIAN / RADIAN
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`${API_BASE_URL}/facture/pdf/${encodeURIComponent(targetDocNumber)}`}
                  download={`Factura_${targetDocNumber}.pdf`}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-[11px] hidden sm:flex items-center gap-1.5 shadow-sm transition-all"
                  title="Descargar archivo PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </a>
                <button
                  type="button"
                  onClick={() => setWorkflowModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* MODAL BODY */}
            <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
              {/* PESTAÑAS DENTRO DEL MODAL */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setModalActiveTab('pdf')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    modalActiveTab === 'pdf'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visor de Documentos (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalActiveTab('analysis')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    modalActiveTab === 'analysis'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lectura Inteligente (Precios, IVA & Servicios)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalActiveTab('events')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    modalActiveTab === 'events'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Automatización DIAN / RADIAN</span>
                </button>
              </div>

              {/* PESTAÑA 1: VISOR DE DOCUMENTOS (PDF FACTURE.CO) */}
              {modalActiveTab === 'pdf' && (
                <div className="space-y-3.5">
                  {/* TOOLBAR SUPERIOR DEL VISOR ESTILO FACTURE.CO */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                    {/* ACCIONES DE EVENTOS FACTURE */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
                        Acciones DIAN:
                      </span>

                      <button
                        type="button"
                        disabled={runningWorkflow}
                        onClick={() => handleDirectExecuteEvent(targetDocNumber, '030 Acuse de Recibo')}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:border-blue-400 text-slate-700 dark:text-zinc-300 font-bold text-[11px] flex items-center gap-1.5 shadow-2xs hover:bg-blue-50/50 transition-all cursor-pointer disabled:opacity-50"
                        title="Ejecutar Acuse de Recibo (030) directamente en Facture.co"
                      >
                        <Send className={`w-3.5 h-3.5 text-blue-600 ${runningWorkflow ? 'animate-spin' : ''}`} />
                        <span>030 Acuse</span>
                      </button>

                      <button
                        type="button"
                        disabled={runningWorkflow}
                        onClick={() => handleDirectExecuteEvent(targetDocNumber, '032 Recibo del Bien o Servicio')}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:border-amber-400 text-slate-700 dark:text-zinc-300 font-bold text-[11px] flex items-center gap-1.5 shadow-2xs hover:bg-amber-50/50 transition-all cursor-pointer disabled:opacity-50"
                        title="Ejecutar Recibo del Bien o Servicio (032) en Facture.co"
                      >
                        <Layers className={`w-3.5 h-3.5 text-amber-600 ${runningWorkflow ? 'animate-spin' : ''}`} />
                        <span>032 Recibo Bien</span>
                      </button>

                      <button
                        type="button"
                        disabled={runningWorkflow}
                        onClick={() => handleDirectExecuteEvent(targetDocNumber, '033 Aceptación Expresa')}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:border-emerald-400 text-slate-700 dark:text-zinc-300 font-bold text-[11px] flex items-center gap-1.5 shadow-2xs hover:bg-emerald-50/50 transition-all cursor-pointer disabled:opacity-50"
                        title="Ejecutar Aceptación Expresa (033) en Facture.co"
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 text-emerald-600 ${runningWorkflow ? 'animate-spin' : ''}`} />
                        <span>033 Aceptación</span>
                      </button>
                    </div>

                    {/* BOTONES DE VISOR: DESCARGAR, IMPRIMIR, PANTALLA COMPLETA */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => loadInvoiceInspection(targetDocNumber, true)}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Forzar re-descarga del PDF desde Facture.co"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${inspectingLoading ? 'animate-spin text-red-600' : ''}`} />
                        <span className="hidden sm:inline">Actualizar</span>
                      </button>

                      <a
                        href={`${API_BASE_URL}/facture/pdf/${encodeURIComponent(targetDocNumber)}`}
                        download={`Factura_${targetDocNumber}.pdf`}
                        className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-[11px] flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer"
                        title="Descargar PDF de la factura"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar PDF</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          const printWin = window.open(`${API_BASE_URL}/facture/pdf/${encodeURIComponent(targetDocNumber)}`, '_blank');
                          if (printWin) {
                            printWin.focus();
                            printWin.print();
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Imprimir documento"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400" />
                        <span className="hidden sm:inline">Imprimir</span>
                      </button>

                      <a
                        href={`${API_BASE_URL}/facture/pdf/${encodeURIComponent(targetDocNumber)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-all cursor-pointer"
                        title="Abrir en pestaña nueva"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* VISOR DE PDF EMBEBIDO O DESCARGA EN VIVO CON PLAYWRIGHT */}
                  {inspectingLoading ? (
                    <div className="w-full h-[380px] sm:h-[500px] lg:h-[580px] rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 p-6 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-800 dark:text-zinc-200">
                          Localizando y preparando el PDF de la factura...
                        </p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm">
                          Playwright está conectándose a Facture.co para descargar el PDF original con seguridad.
                        </p>
                      </div>
                    </div>
                  ) : inspectionData && inspectionData.pdfAvailable === false ? (
                    <div className="w-full h-[380px] sm:h-[500px] lg:h-[580px] rounded-2xl border-2 border-dashed border-red-300 dark:border-red-700/60 bg-red-50/40 dark:bg-red-950/20 p-6 flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-md animate-pulse">
                        <Download className="w-7 h-7" />
                      </div>
                      <div className="max-w-md space-y-2">
                        <h4 className="text-base font-black text-slate-900 dark:text-white">
                          Descarga en Vivo con Playwright
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                          El PDF se descargará automáticamente de Facture.co para que puedas visualizarlo de inmediato.
                        </p>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-300 dark:border-emerald-800">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Lectura IA protegida (0 consumo de tokens)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => loadInvoiceInspection(targetDocNumber, true)}
                          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-red-600/30 transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>Descargar PDF ahora con Playwright</span>
                        </button>
                        <a
                          href={`${API_BASE_URL}/facture/pdf/${encodeURIComponent(targetDocNumber)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir visor directo</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-[380px] sm:h-[500px] lg:h-[580px] rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden bg-slate-900 shadow-inner relative flex flex-col items-center justify-center">
                      <iframe
                        src={`${API_BASE_URL}/facture/pdf/${encodeURIComponent(targetDocNumber)}#toolbar=1&navpanes=0`}
                        className="w-full h-full rounded-2xl border-0"
                        title={`Visor PDF Factura ${targetDocNumber}`}
                      />
                    </div>
                  )}

                  {/* PIE DE PÁGINA CON RESUMEN FINANCIERO RÁPIDO */}
                  {inspectionData?.analysis && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Subtotal Sin IVA</span>
                          <span className="font-mono font-black text-slate-900 dark:text-white text-xs">
                            ${formatCurrency(inspectionData.analysis.subtotalSinIva)}
                          </span>
                        </div>
                        <span className="text-slate-300 dark:text-zinc-700">|</span>
                        <div>
                          <span className="text-blue-500 text-[10px] uppercase font-bold block">IVA</span>
                          <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-xs">
                            ${formatCurrency(inspectionData.analysis.totalIva)}
                          </span>
                        </div>
                        <span className="text-slate-300 dark:text-zinc-700">|</span>
                        <div>
                          <span className="text-emerald-500 text-[10px] uppercase font-bold block">Total Con IVA</span>
                          <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
                            ${formatCurrency(inspectionData.analysis.totalConIva)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setModalActiveTab('analysis')}
                        className="text-red-600 dark:text-red-400 font-extrabold flex items-center gap-1.5 hover:underline cursor-pointer text-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        <span>Ver desglose de ítems, servicios y proveedor</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PESTAÑA A: ANÁLISIS INTELIGENTE (ITEMS, PRECIOS, IVA & PROVEEDOR) */}
              {modalActiveTab === 'analysis' && (
                <div className="space-y-4">
                  {/* ESTADO DE CARGA DE INSPECCIÓN */}
                  {inspectingLoading ? (
                    <div className="p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/50 text-center space-y-3">
                      <RefreshCw className="w-8 h-8 animate-spin text-red-600 mx-auto" />
                      <p className="font-extrabold text-xs text-slate-800 dark:text-zinc-200">
                        Extrayendo y analizando la factura con IA...
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                        Leyendo ítems, costos sin IVA, impuestos discriminados y cruzando con el catálogo de proveedores.
                      </p>
                    </div>
                  ) : inspectionData?.analysis ? (
                    <>
                      {/* AVISO DE PROTECCIÓN DE TOKENS SI SE OMITIÓ LA IA */}
                      {(inspectionData?.aiSkipped || inspectionData?.pdfAvailable === false) && (
                        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
                          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="font-black text-amber-900 dark:text-amber-200">Lectura con IA omitida — Protección de Tokens Activa</p>
                            <p className="text-[11px] opacity-90 leading-relaxed">
                              El visor no encontró el archivo PDF físico de este documento. Para no desperdiciar tokens de Google Gemini AI leyendo un archivo inexistente, se muestran únicamente los datos base del encabezado.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* BARRA DE ESTADO DE LECTURA IA & ACCIONES: APROBAR LECTURA / VOLVER A LEER CON IA */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            inspectionData.aiReadingStatus === 'APROBADA'
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : inspectionData.aiReadingStatus === 'LECTURA REALIZADA'
                              ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
                              : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                          }`}>
                            {inspectionData.aiReadingStatus === 'APROBADA' ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <FileText className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                Estado Lectura IA:
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                                inspectionData.aiReadingStatus === 'APROBADA'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                  : inspectionData.aiReadingStatus === 'LECTURA REALIZADA'
                                  ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'
                                  : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                              }`}>
                                {inspectionData.aiReadingStatus || 'PENDIENTE'}
                              </span>
                              {inspectionData.aiReused && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200">
                                  ⚡ 0 Tokens (BD Reutilizada)
                                </span>
                              )}
                              {(inspectionData.analysis?.consensusConfirmed || selectedDocObj?.consensusConfirmed) && (
                                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1 shadow-2xs">
                                  ✓ Consenso Multi-Lectura Confirmado ({inspectionData.analysis?.verificationPasses || selectedDocObj?.verificationPasses || 2} Pasadas)
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {inspectionData.aiReadingStatus === 'APROBADA'
                                ? 'La lectura está formalmente aprobada y almacenada en BD. No consumirá más tokens al consultarla.'
                                : 'Verifica los ítems y montos extraídos. Puedes aprobar la lectura o volver a leer con IA.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                          <button
                            type="button"
                            onClick={() => loadInvoiceInspection(targetDocNumber, false, true)}
                            disabled={inspectingLoading}
                            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                            title="Forzar nueva lectura con Gemini AI consumiendo tokens"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${inspectingLoading ? 'animate-spin' : ''}`} />
                            <span>Volver a leer con AI</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApproveAiReading(targetDocNumber)}
                            disabled={inspectingLoading || inspectionData.aiReadingStatus === 'APROBADA'}
                            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50 ${
                              inspectionData.aiReadingStatus === 'APROBADA'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                            }`}
                            title="Aprobar el resultado obtenido por la AI y almacenarlo formalmente"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{inspectionData.aiReadingStatus === 'APROBADA' ? 'Lectura Aprobada' : 'Aprobar lectura'}</span>
                          </button>
                        </div>
                      </div>

                      {/* RESUMEN CORTO GENERADO POR IA */}
                      {(inspectionData.aiShortSummary || inspectionData.analysis?.resumenCorto) && (
                        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200 dark:border-purple-800/60 flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-purple-600 text-white flex-shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                              Resumen Corto Generado por AI (Servicio / Concepto)
                            </span>
                            <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                              "{inspectionData.aiShortSummary || inspectionData.analysis?.resumenCorto}"
                            </p>
                            <p className="text-[10.5px] text-slate-500 dark:text-zinc-400">
                              Este resumen corto reemplaza la descripción genérica del documento y se usa en Proveedores, Facturas y Aprobaciones de Jefes.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* COINCIDENCIA AUTOMÁTICA RECURRENTE */}
                      {inspectionData.recurrentMatch && (
                        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-blue-600 mt-0.5" />
                          <div className="space-y-0.5">
                            <p className="font-black text-blue-950 dark:text-blue-100">
                              Reconocimiento Recurrente Automático — Factura Padre {inspectionData.recurrentMatch.parentInvoiceNumber}
                            </p>
                            <p className="text-[11px] opacity-90 leading-relaxed">
                              {inspectionData.recurrentMatch.matchReason || 'Mismo proveedor, NIT y conceptos dentro de la tolerancia de valor. Se reutilizó la lectura AI previa sin consumir nuevos tokens.'}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* INFORMACIÓN DE ENCABEZADO: FECHAS, REFERENCIA Y EMISOR */}
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div>
                          <span className="text-[9.5px] font-bold text-slate-400 block uppercase">Factura & Referencia</span>
                          <span className="font-extrabold text-slate-900 dark:text-white block mt-0.5 font-mono">
                            {inspectionData.analysis.numeroFactura || 'N/A'}
                          </span>
                          {inspectionData.analysis.numeroReferencia && (
                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 block font-mono">
                              Ref/OC: {inspectionData.analysis.numeroReferencia}
                            </span>
                          )}
                          {inspectionData.analysis.numeroContrato && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block font-mono">
                              Contrato N°: {inspectionData.analysis.numeroContrato}
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[9.5px] font-bold text-slate-400 block uppercase">Fecha Emisión</span>
                          <span className="font-extrabold text-slate-900 dark:text-white block mt-0.5">
                            {inspectionData.analysis.fechaEmision || 'N/A'}
                          </span>
                          {inspectionData.analysis.horaEmision && (
                            <span className="text-[10px] text-slate-400 block">
                              Hora: {inspectionData.analysis.horaEmision}
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[9.5px] font-bold text-slate-400 block uppercase">Fecha Vencimiento</span>
                          <span className="font-extrabold text-amber-600 dark:text-amber-400 block mt-0.5">
                            {inspectionData.analysis.fechaVencimiento || 'N/A'}
                          </span>
                          {inspectionData.analysis.condicionPago && (
                            <span className="text-[10px] text-slate-500 block truncate" title={inspectionData.analysis.condicionPago}>
                              {inspectionData.analysis.condicionPago}
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[9.5px] font-bold text-slate-400 block uppercase">Desglose de IVA</span>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                              inspectionData.analysis.tieneIva 
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200' 
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                            }`}>
                              {inspectionData.analysis.tieneIva ? 'Tiene IVA' : 'Exenta IVA'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold">
                              ({inspectionData.analysis.itemsConIvaCount || 0} gravados / {inspectionData.analysis.itemsSinIvaCount || 0} exentos)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* TARJETAS FINANCIERAS RESUMEN */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700">
                          <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block">
                            Costo Sin IVA (Subtotal)
                          </span>
                          <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono block mt-0.5">
                            ${formatCurrency(inspectionData.analysis.subtotalSinIva)}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40">
                          <span className="text-[9.5px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 block">
                            IVA / Impuestos
                          </span>
                          <span className="text-sm sm:text-base font-black text-blue-700 dark:text-blue-300 font-mono block mt-0.5">
                            ${formatCurrency(inspectionData.analysis.totalIva)}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                          <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                            Total con IVA
                          </span>
                          <span className="text-sm sm:text-base font-black text-emerald-700 dark:text-emerald-300 font-mono block mt-0.5">
                            ${formatCurrency(inspectionData.analysis.totalConIva)}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                          <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                            Total Neto a Pagar
                          </span>
                          <span className="text-sm sm:text-base font-black text-amber-700 dark:text-amber-300 font-mono block mt-0.5">
                            ${formatCurrency(inspectionData.analysis.totalPagarNeto)}
                          </span>
                        </div>
                      </div>

                      {/* VALIDACIÓN MATEMÁTICA Y CUADRE CON DETALLE FACTURE.CO */}
                      {inspectionData.analysis.validation && (
                        <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                          inspectionData.analysis.validation.isExactMatch
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                            : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                        }`}>
                          <div className="flex items-center gap-2.5">
                            {inspectionData.analysis.validation.isExactMatch ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                            )}
                            <div>
                              <span className="font-black text-xs block">
                                {inspectionData.analysis.validation.isExactMatch 
                                  ? 'Conciliación Matemática Exitosa' 
                                  : 'Aviso de Verificación de Montos'}
                              </span>
                              <span className="text-[11px] opacity-90 block">
                                {inspectionData.analysis.validation.message}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[11px] font-bold">
                            <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
                              {inspectionData.analysis.validation.totalItemsCount || inspectionData.analysis.items?.length || 0} Ítems ({inspectionData.analysis.itemsConIvaCount || 0} con IVA)
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
                              Detalle Facture: ${formatCurrency(inspectionData.analysis.validation.expectedHeaderAmount)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* DETALLE DE ÍTEMS Y SERVICIOS COBRADOS */}
                      <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                        <div className="bg-slate-100 dark:bg-zinc-800/80 px-4 py-2.5 border-b border-slate-200 dark:border-zinc-700 flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-red-600" />
                            <span>Servicios & Productos Cobrados ({inspectionData.analysis.items?.length || 0})</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono font-bold">
                            Moneda: {inspectionData.analysis.moneda || 'COP'}
                          </span>
                        </div>

                        <div className="max-h-60 overflow-y-auto">
                          <table className="w-full text-left text-[11px] border-collapse">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-bold border-b border-slate-200 dark:border-zinc-800">
                                <th className="p-2 text-center w-8">#</th>
                                <th className="p-2 w-24">Código</th>
                                <th className="p-2">Descripción / Concepto</th>
                                <th className="p-2 text-center">Cant / UM</th>
                                <th className="p-2 text-right">Vr. Unitario</th>
                                <th className="p-2 text-right">% IVA</th>
                                <th className="p-2 text-right">Vr. IVA</th>
                                <th className="p-2 text-right">Total Ítem</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                              {(inspectionData.analysis.items || []).map((it: any, idx: number) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                                  <td className="p-2 text-center font-mono text-slate-400 text-[10px]">
                                    {it.numeroItem || idx + 1}
                                  </td>
                                  <td className="p-2 font-mono text-slate-500 text-[10px] truncate max-w-[100px]">
                                    {it.codigo || '-'}
                                  </td>
                                  <td className="p-2 font-bold text-slate-800 dark:text-zinc-200 max-w-xs truncate" title={it.descripcion}>
                                    {it.descripcion}
                                  </td>
                                  <td className="p-2 text-center font-mono text-slate-600 dark:text-zinc-300 text-[10px]">
                                    {it.cantidad} {it.unidadMedida || 'UND'}
                                  </td>
                                  <td className="p-2 text-right font-mono text-slate-700 dark:text-zinc-300">
                                    ${formatCurrency(it.precioUnitario)}
                                  </td>
                                  <td className="p-2 text-right font-mono text-slate-500">
                                    {it.porcentajeIva ? `${it.porcentajeIva}%` : '0%'}
                                  </td>
                                  <td className="p-2 text-right font-mono text-blue-600 dark:text-blue-400">
                                    ${formatCurrency(it.valorIva)}
                                  </td>
                                  <td className="p-2 text-right font-mono font-black text-slate-900 dark:text-white">
                                    ${formatCurrency(it.total || it.subtotal)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* VINCULACIÓN AL MÓDULO DE PROVEEDORES */}
                      {inspectionData.supplierMatch && (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 space-y-2.5">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                              <Building2 className="w-4 h-4 text-red-600" />
                              <span>Mapeo con Módulo de Proveedores</span>
                            </span>

                            {inspectionData.supplierMatch.isNewSupplier ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                                ★ Nuevo Proveedor (Se creará automáticamente)
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                                ✓ Proveedor Existente en Catálogo
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
                              <span className="text-[10px] font-bold text-slate-400 block">Proveedor Identificado</span>
                              <span className="font-extrabold text-slate-900 dark:text-white block mt-0.5">
                                {inspectionData.supplierMatch.supplierName}
                              </span>
                              <span className="text-[10.5px] font-mono text-slate-500 block">
                                NIT: {inspectionData.supplierMatch.supplierNit}
                              </span>
                            </div>

                            <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700">
                              <span className="text-[10px] font-bold text-slate-400 block">Concepto / Resumen AI Asignado</span>
                              <span className="font-extrabold text-red-600 dark:text-red-400 block mt-0.5">
                                {inspectionData.aiShortSummary || inspectionData.analysis?.resumenCorto || (
                                  inspectionData.supplierMatch.matchedConcept && !inspectionData.supplierMatch.matchedConcept.toUpperCase().includes('SE RECIBE DOCUMENTO')
                                    ? inspectionData.supplierMatch.matchedConcept
                                    : `Servicio ${inspectionData.supplierMatch.supplierName}`
                                )}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                Tipo: <strong>FACTURA</strong> (Solo facturas válidas)
                              </span>
                            </div>
                          </div>

                          {/* ESTADO DE VINCULACIÓN EXISTENTE Y REGLAS MULTI-ÁREA */}
                          {inspectionData?.linkedInvoice && (
                            (() => {
                              const linked = inspectionData.linkedInvoice;
                              const userArea = currentUser?.area || 'General';
                              const isOtherArea = linked.area && linked.area !== 'General' && userArea !== 'General' && linked.area.toLowerCase() !== userArea.toLowerCase();
                              const isAlreadyLinked = linked.enFacture === 'SÍ' || linked.contractNumber;

                              if (isOtherArea) {
                                return (
                                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                                    <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="font-black text-amber-950 dark:text-amber-100">
                                        Factura ya vinculada por el Área: <u>{linked.area}</u>
                                      </p>
                                      <p className="text-[11px] opacity-90 mt-0.5">
                                        Esta factura fue reclamada por el departamento <strong>{linked.area}</strong> y vinculada al proveedor <strong>"{linked.supplier}"</strong>. Por política de control, ninguna otra área puede vincular este documento.
                                      </p>
                                    </div>
                                  </div>
                                );
                              }

                              if (isAlreadyLinked) {
                                return (
                                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2.5">
                                    <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <p className="font-black text-blue-950 dark:text-blue-100">
                                        Factura ya vinculada en el sistema {linked.contractNumber ? `(Contrato ${linked.contractNumber})` : ''}
                                      </p>
                                      <p className="text-[11px] opacity-90 mt-0.5">
                                        Área responsable: <strong>{linked.area || 'General'}</strong> • Proveedor: <strong>{linked.supplier}</strong>. La vinculación ya está registrada.
                                      </p>
                                    </div>
                                  </div>
                                );
                              }

                              return null;
                            })()
                          )}

                          {/* BOTONES VINCULAR A FACTURAS O GUARDAR COMO CONTRATO HABITUAL */}
                          {(() => {
                            const linked = inspectionData?.linkedInvoice;
                            const userArea = currentUser?.area || 'General';
                            const isOtherArea = Boolean(linked && linked.area && linked.area !== 'General' && userArea !== 'General' && linked.area.toLowerCase() !== userArea.toLowerCase());
                            const isAlreadyLinked = Boolean(linked && (linked.enFacture === 'SÍ' || linked.contractNumber));
                            const isDisabled = isOtherArea || isAlreadyLinked;
                            const eventsAreDone = Boolean(
                              inspectionData.dianEventsStatus === 'COMPLETADO' || 
                              inspectionData.dianStatus === 'ACEPTADO' || 
                              selectedDocObj?.dianStatus === 'ACEPTADO' ||
                              linked?.dianEventsStatus === 'COMPLETADO'
                            );

                            return (
                              <div className="pt-2 space-y-2">
                                {/* BADGE DE ASEGURAMIENTO DE EVENTOS DIAN */}
                                {eventsAreDone ? (
                                  <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-800 dark:text-emerald-300 font-extrabold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    <span>Eventos DIAN Asegurados: Acuse de Recibo (030), Recibo del Bien/Servicio (032) y Aceptación Expresa (033) certificados ante la DIAN.</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between gap-2 text-[10.5px] text-amber-900 dark:text-amber-200 font-bold bg-amber-50 dark:bg-amber-950/40 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                      <span className="truncate">Eventos DIAN pendientes: Se deben asegurar antes de enviar la factura a aprobación por el jefe.</span>
                                    </div>
                                    <button
                                      type="button"
                                      disabled={runningWorkflow}
                                      onClick={() => handleDirectExecuteEvent(targetDocNumber, 'Eventos DIAN')}
                                      className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 font-black cursor-pointer text-[10px] transition-all whitespace-nowrap flex items-center gap-1 flex-shrink-0"
                                      title="Ejecutar acuse, recibo y aceptación ahora en Facture.co"
                                    >
                                      <Zap className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                                      <span>Asegurar Ahora</span>
                                    </button>
                                  </div>
                                )}

                                <div className="flex flex-wrap items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => {
                                      const docId = selectedDocObj?.id || `facture-${targetDocNumber.replace(' ', '-').replace('/', '-')}`;
                                      handleImportDocument(docId, targetDocNumber);
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    title={isOtherArea ? `Bloqueado: Factura de otra área (${linked?.area})` : isAlreadyLinked ? 'Factura ya vinculada en el sistema' : 'Vincular a tabla de facturas'}
                                  >
                                    {isOtherArea ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <FileCheck className="w-3.5 h-3.5" />}
                                    <span>{isOtherArea ? `Vinculada por ${linked?.area}` : 'Vincular a Facturas'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={handleSaveAsHabitualContractAndRoute}
                                    disabled={savingContract || isDisabled || runningWorkflow}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs shadow-md shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    title={isOtherArea ? `Bloqueado: Factura vinculada por ${linked?.area}` : isAlreadyLinked ? 'Factura ya vinculada' : 'Asegura eventos DIAN, guarda contrato habitual y envía a Aprobación de Jefes por Área'}
                                  >
                                    <CheckCircle2 className={`w-4 h-4 ${savingContract ? 'animate-spin' : ''}`} />
                                    <span>
                                      {savingContract ? 'Asegurando & Guardando...' : isOtherArea ? 'Bloqueado por Otra Área' : (inspectionData.analysis?.numeroContrato ? `Guardar Contrato (${inspectionData.analysis.numeroContrato}) & Enviar a Jefes` : 'Guardar Factura Habitual & Enviar a Jefes')}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No se pudo cargar la inspección. Puedes forzar la descarga del PDF o continuar a las Fases DIAN.
                    </div>
                  )}
                </div>
              )}

              {/* PESTAÑA B: AUTOMATIZACIÓN DIAN & DESCARGA */}
              {modalActiveTab === 'events' && (
                <div className="space-y-4">
                  {/* CAMPO NÚMERO DE FACTURA */}
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                      Número de Factura o Documento a Procesar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={targetDocNumber}
                      onChange={(e) => setTargetDocNumber(e.target.value)}
                      placeholder="Ej: FE-10928, FP-4501, FACT-892"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white font-mono font-bold text-xs outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-[10.5px] text-slate-400 mt-1">
                      Si no está en la primera página de Recibidos, el robot avanzará automáticamente por el paginador hasta encontrarla.
                    </p>
                  </div>

                  {/* OPCIONES DE EJECUCIÓN */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 space-y-3">
                    <span className="text-[11px] font-black text-slate-800 dark:text-zinc-200 uppercase tracking-wider block">
                      Opciones del Flujo
                    </span>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={executeEventsOption}
                        onChange={(e) => setExecuteEventsOption(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Ejecutar Eventos RADIAN / DIAN en Barra Superior
                        </span>
                        <span className="text-[10.5px] text-slate-500 dark:text-zinc-400 block">
                          Acuse (030) ➔ Recibo de Bien/Servicio (032) ➔ Aceptación Expresa (033) con Nombre ({statusInfo.responsibleName || 'DAVID'}), Apellido ({statusInfo.responsibleLastName || 'SARRIA'}) y Cédula ({statusInfo.responsibleIdNumber || '1144078413'}).
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={downloadPdfOption}
                        onChange={(e) => setDownloadPdfOption(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">
                          Descargar Factura en PDF Automáticamente
                        </span>
                        <span className="text-[10.5px] text-slate-500 dark:text-zinc-400 block">
                          Guarda el archivo en el servidor y lo deja listo para consulta inmediata.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* DIAGRAMA VISUAL DE LAS 6 FASES */}
                  <div className="border border-slate-200 dark:border-zinc-800 rounded-xl p-4 bg-white dark:bg-zinc-900 space-y-3">
                    <span className="text-[11px] font-black text-slate-700 dark:text-zinc-300 uppercase tracking-wider block">
                      Secuencia de Fases en Ejecución
                    </span>

                    <div className="space-y-2 text-xs">
                      {[
                        { num: 1, title: 'Fase 1: Login & NIT 890330035', desc: 'Ingreso a Facture.co y selección de contrato ALIMENTOS ENRIKO S.A.S.' },
                        { num: 2, title: 'Fase 2: Navegación Inbox ➔ Recibidos', desc: 'Apertura de bandeja de facturas a crédito pendientes.' },
                        { num: 3, title: 'Fase 3: Búsqueda & Paginación Automática', desc: 'Si no está en la página actual, avanza por las páginas de la tabla.' },
                        { num: 4, title: 'Fase 4: Barra Superior de Eventos', desc: 'Acuse, Recibo y Aceptación con los 3 campos de responsable.' },
                        { num: 5, title: 'Fase 5: Descarga de Factura PDF', desc: 'Clic en botón de descarga y almacenamiento local.' },
                        { num: 6, title: 'Fase 6: Retorno Seguro a Recibidos', desc: 'Clic en flecha atrás para volver a la bandeja y registrar trazabilidad.' },
                      ].map((phase) => {
                        const stepResult = workflowResult?.steps?.find((s: any) => s.phase === phase.num);
                        const isSuccess = stepResult?.status === 'SUCCESS' || stepResult?.status === 'SUCCESS_VIA_HISTORY';
                        const isRunning = stepResult?.status === 'RUNNING';
                        const isSkipped = stepResult?.status === 'SKIPPED_READONLY';
                        const isError = stepResult?.status && !isSuccess && !isRunning && !isSkipped;

                        return (
                          <div
                            key={phase.num}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                              isSuccess
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/50'
                                : isError
                                ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800/50'
                                : isRunning
                                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/50 animate-pulse'
                                : 'bg-slate-50/60 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                                isSuccess
                                  ? 'bg-emerald-600 text-white'
                                  : isError
                                  ? 'bg-red-600 text-white'
                                  : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                              }`}>
                                {phase.num}
                              </span>
                              <div>
                                <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                                  {phase.title}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                                  {phase.desc}
                                </span>
                              </div>
                            </div>

                            <div>
                              {isSuccess && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                                  ✓ Completado
                                </span>
                              )}
                              {isSkipped && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                                  Solo Lectura
                                </span>
                              )}
                              {isError && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
                                  Error
                                </span>
                              )}
                              {!stepResult && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  En espera
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* RESULTADO Y LOG */}
                  {workflowResult && (
                    <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                      workflowResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-900 dark:text-emerald-200'
                        : 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-900 dark:text-red-200'
                    }`}>
                      <div className="flex items-center gap-2 font-black">
                        {workflowResult.success ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                        <span>{workflowResult.success ? 'Flujo ejecutado con éxito' : 'Detalle del inconveniente'}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {workflowResult.error || `Procesamiento finalizado para ${workflowResult.documentNumber} a las ${workflowResult.completedAt}.`}
                      </p>
                      {workflowResult.downloadedPdf && (
                        <div className="pt-2">
                          <span className="font-bold block text-[10.5px]">📄 Archivo PDF descargado:</span>
                          <code className="text-[10px] font-mono break-all opacity-80">{workflowResult.downloadedPdf}</code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="p-5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-zinc-900/50">
              <button
                type="button"
                onClick={() => setWorkflowModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Cerrar
              </button>

              <div className="flex items-center gap-2">
                {modalActiveTab === 'pdf' ? (
                  <button
                    type="button"
                    onClick={() => setModalActiveTab('analysis')}
                    className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-zinc-900 font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                    <span>Ver Lectura Inteligente</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : modalActiveTab === 'analysis' ? (
                  <button
                    type="button"
                    onClick={() => setModalActiveTab('events')}
                    className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-zinc-900 font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Ir a Eventos DIAN</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRunWorkflow}
                    disabled={runningWorkflow || !targetDocNumber.trim()}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs shadow-md shadow-red-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 fill-white ${runningWorkflow ? 'animate-spin' : ''}`} />
                    <span>{runningWorkflow ? 'Ejecutando Fases...' : 'Iniciar Automatización'}</span>
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
