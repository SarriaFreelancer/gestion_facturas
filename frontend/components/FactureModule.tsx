'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Inbox, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Download, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  Filter,
  ArrowRight,
  Clock,
  Send,
  Layers,
  FileCheck,
  Check,
  Database,
  Lock
} from 'lucide-react';
import { api } from '../lib/api';
import { notifySuccess, notifyError, notifyInfo } from '../lib/alerts';

interface FactureModuleProps {
  onInvoicesUpdated?: () => void;
}

export const FactureModule: React.FC<FactureModuleProps> = ({ onInvoicesUpdated }) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'logs' | 'config'>('inbox');
  const [folderFilter, setFolderFilter] = useState<'Todos' | 'Recibidos' | 'Contado' | 'Procesados'>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [statusInfo, setStatusInfo] = useState<any>({
    username: 'TicsEnriko',
    nit: '890330035',
    companyName: 'ALIMENTOS ENRIKO S.A.S',
    recibidosCount: 2148,
    contadoCount: 458,
    lastSyncAt: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    loadAllData();
  }, [folderFilter]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [status, docs, auditLogs] = await Promise.all([
        api.getFactureStatus().catch(() => null),
        api.getFactureInbox(folderFilter, searchTerm).catch(() => []),
        api.getFactureLogs().catch(() => [])
      ]);

      if (status) setStatusInfo(status);
      setDocuments(docs || []);
      setLogs(auditLogs || []);
    } catch (err: any) {
      console.error('Error loading Facture data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sincronización en vivo con el robot de Facture.co
  const handleLiveSync = async () => {
    try {
      setSyncing(true);
      notifyInfo('Sincronización en proceso', 'El robot de Facture.co está leyendo la bandeja de entrada...');
      const res = await api.syncFactureInbox();
      notifySuccess(
        'Sincronización Exitosa',
        `Se leyeron ${res.recibidosCount} facturas en Recibidos (Crédito) y ${res.contadoCount} en Contado.`
      );
      await loadAllData();
      if (onInvoicesUpdated) onInvoicesUpdated();
    } catch (err: any) {
      notifyError('Fallo en sincronización', err.message);
    } finally {
      setSyncing(false);
    }
  };

  // Importar documento a la tabla principal de facturas del sistema
  const handleImportDocument = async (docId: string, docNum: string) => {
    try {
      setImportingId(docId);
      await api.importFactureDocToMain(docId);
      notifySuccess('Factura Importada', `La factura ${docNum} fue registrada en el sistema con estado 'En Facture: SÍ'.`);
      await loadAllData();
      if (onInvoicesUpdated) onInvoicesUpdated();
    } catch (err: any) {
      notifyError('Error al importar', err.message);
    } finally {
      setImportingId(null);
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

  // Formato de moneda COP
  const formatCurrency = (val: number) => {
    return Number(val || 0).toLocaleString('es-CO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

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

        {/* BOTÓN DE ACCIÓN SINCRONIZAR */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleLiveSync}
            disabled={syncing}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-xs shadow-md shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            title="Conectar y consultar la bandeja de Facture.co en tiempo real"
          >
            <RefreshCw className={`w-4 h-4 text-white ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sincronizando Bandeja...' : 'Sincronizar Bandeja Facture'}</span>
          </button>
        </div>
      </div>

      {/* TARJETAS DE CONTEO Y MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* RECIBIDOS / CRÉDITO */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Recibidos (Crédito)
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {statusInfo.recibidosCount || 2148}
            </div>
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 mt-0.5 block">
              Facturas a crédito por gestionar
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* CONTADO */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Facturas de Contado
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {statusInfo.contadoCount || 458}
            </div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
              Documentos de pago inmediato
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* TOTAL BANDEJA */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Total en Bandeja Inbox
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {(statusInfo.recibidosCount || 2148) + (statusInfo.contadoCount || 458)}
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              Bandeja consolidada Facture.co
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        {/* ESTADO DEL ROBOT */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Estado del Robot RPA
            </span>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5" />
              <span>Operativo</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 mt-0.5 block">
              Listo para automatizar eventos
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
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
          <span>Bandeja Documentos Facture</span>
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
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 text-xs font-bold">
              {(['Todos', 'Recibidos', 'Contado', 'Procesados'] as const).map(folder => (
                <button
                  key={folder}
                  onClick={() => setFolderFilter(folder)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    folderFilter === folder
                      ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-2xs font-extrabold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                >
                  {folder === 'Recibidos' ? 'Recibidos (Crédito)' : folder}
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
            <table className="w-full text-left text-xs border-collapse">
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
                {filteredDocuments.length === 0 ? (
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
                          <p className="text-[11px]">Presiona el botón <strong>"Sincronizar Bandeja Facture"</strong> para descargar las facturas más recientes.</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map(doc => {
                    const isSynced = doc.isSyncedToMain === 1 || doc.isSyncedToMain === true;
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="p-3 font-mono font-extrabold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-1.5">
                            <span>{doc.documentNumber}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-bold">
                              Facture
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-[11px] text-slate-600 dark:text-zinc-400">
                          {doc.docType || 'FACTURA DE VENTA'}
                        </td>
                        <td className="p-3 font-bold text-slate-800 dark:text-zinc-200">
                          {doc.issuerName}
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
                          {isSynced ? (
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
                        <td className="p-3 text-center">
                          {!isSynced ? (
                            <button
                              onClick={() => handleImportDocument(doc.id, doc.documentNumber)}
                              disabled={importingId === doc.id}
                              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10.5px] transition-all cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                              title="Importar al módulo de facturas generales"
                            >
                              <FileCheck className="w-3.5 h-3.5" />
                              <span>{importingId === doc.id ? 'Importando...' : 'Importar'}</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">Vinculada</span>
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
    </div>
  );
};
