import React, { useState, useEffect } from 'react';
import { Invoice, Supplier, DocumentRecord } from '../types';
import { DashboardCards } from './components/DashboardCards';
import { DocumentTimeline } from './components/DocumentTimeline';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { InvoiceFormModal } from './components/InvoiceFormModal';
import { 
  Plus, 
  Search, 
  Eye, 
  RefreshCw, 
  Printer, 
  SlidersHorizontal, 
  CheckSquare, 
  XSquare, 
  FileText, 
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';

export const App: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<any>({
    totalMonth: 0,
    totalQuotations: 0,
    totalInvoices: 0,
    pendingSignatures: 0,
    pendingFacture: 0,
    pendingManagement: 0,
    delayedInvoices: 0,
    pendingDelivery: 0
  });

  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filtros (20. FILTROS NUEVOS)
  const [searchTerm, setSearchTerm] = useState('');
  const [factureFilter, setFactureFilter] = useState<string>('ALL');
  const [signatureFilter, setSignatureFilter] = useState<string>('ALL');
  const [processStateFilter, setProcessStateFilter] = useState<string>('ALL');

  // Visor / Impresión
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | undefined>(undefined);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Reemplazar Archivo State
  const [replaceTargetDoc, setReplaceTargetDoc] = useState<{ docId: string; invoiceId: string } | null>(null);

  // Columnas Visibles (17. TABLA ACTUALIZADA)
  const [visibleColumns, setVisibleColumns] = useState({
    supplier: true,
    description: true,
    type: true,
    code: true,
    remissionDate: true,
    deliveryDate: true,
    amount: true,
    quotationSigned: true,
    invoiceSigned: true,
    factureReceived: true,
    management: true,
    delivered: true,
    alert: true,
    documents: true
  });
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, supRes, statsRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/suppliers'),
        fetch('/api/dashboard/stats')
      ]);

      const invData = await invRes.json();
      const supData = await supRes.json();
      const statsData = await statsRes.json();

      setInvoices(invData);
      setSuppliers(supData);
      setStats(statsData);
    } catch (e) {
      console.error('Error al cargar datos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 9, 13, 29. Cambiar Estados de Firma / Facture / Gestión / Entrega
  const handleStatusChange = async (invoice: any, field: string, value: any) => {
    // 29. Confirmaciones explícitas
    if (field === 'invoiceSigned' && value === true) {
      if (!window.confirm('¿Confirma que esta factura ha sido firmada?')) return;
    }
    if (field === 'quotationSigned' && value === true) {
      if (!window.confirm('¿Confirma que esta cotización ha sido firmada?')) return;
    }

    try {
      const body: any = {};
      body[field] = value;
      body.currentUser = 'Usuario Administrador';

      const res = await fetch(`/api/invoices/${invoice.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error('Error al actualizar estado:', e);
    }
  };

  // Reemplazar Archivo (7. CAMBIAR / REEMPLAZAR DOCUMENTO)
  const handleReplaceFile = async (documentId: string, file: File) => {
    if (!window.confirm('¿Desea reemplazar el documento actual? Se conservará una copia en el histórico.')) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', 'Usuario Administrador');

    try {
      const res = await fetch(`/api/documents/${documentId}/replace`, {
        method: 'PUT',
        body: formData
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error('Error al reemplazar archivo:', e);
    }
  };

  // Filtrar Invoices
  const filteredInvoices = invoices.filter(inv => {
    // Búsqueda libre
    const matchesSearch = 
      inv.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Filtro Facture
    if (factureFilter === 'SI' && inv.factureReceived !== 'SÍ') return false;
    if (factureFilter === 'AUN_NO' && inv.factureReceived !== 'AÚN NO') return false;

    // Filtro Firma
    if (signatureFilter === 'COT_SIGNED' && !inv.quotationSigned) return false;
    if (signatureFilter === 'COT_PENDING' && inv.quotationSigned) return false;
    if (signatureFilter === 'FAC_SIGNED' && !inv.invoiceSigned) return false;
    if (signatureFilter === 'FAC_PENDING' && inv.invoiceSigned) return false;

    // Filtro Estado Proceso
    if (processStateFilter === 'PENDING_FACTURE' && inv.factureReceived !== 'AÚN NO') return false;
    if (processStateFilter === 'IN_FACTURE' && inv.factureReceived !== 'SÍ') return false;
    if (processStateFilter === 'PENDING_MGMT' && inv.management) return false;
    if (processStateFilter === 'MANAGED' && !inv.management) return false;
    if (processStateFilter === 'DELIVERED' && !inv.delivered) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Encabezado Principal */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              🧀 Alimentos Enriko — Gestión de Facturas & Cotizaciones
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Centro de control documental, almacenamiento físico local y seguimiento en Facture.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Registrar Cotización / Factura
            </button>
          </div>
        </div>

        {/* 19. DASHBOARD ACTUALIZADO */}
        <DashboardCards stats={stats} />

        {/* Barra de Búsqueda y Filtros (20. FILTROS NUEVOS) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Buscador */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar código, proveedor..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Filtro Llegó en Facture */}
            <div>
              <select
                value={factureFilter}
                onChange={e => setFactureFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Llegó en Facture: Todos</option>
                <option value="SI">Llegó en Facture: Sí</option>
                <option value="AUN_NO">Llegó en Facture: Aún no</option>
              </select>
            </div>

            {/* Filtro Firma */}
            <div>
              <select
                value={signatureFilter}
                onChange={e => setSignatureFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Firma: Todos</option>
                <option value="COT_SIGNED">Cotización firmada</option>
                <option value="COT_PENDING">Cotización pendiente</option>
                <option value="FAC_SIGNED">Factura firmada</option>
                <option value="FAC_PENDING">Factura pendiente</option>
              </select>
            </div>

            {/* Filtro Estado del proceso */}
            <div>
              <select
                value={processStateFilter}
                onChange={e => setProcessStateFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Estado del proceso: Todos</option>
                <option value="PENDING_FACTURE">Pendiente Facture</option>
                <option value="IN_FACTURE">En Facture</option>
                <option value="PENDING_MGMT">Pendiente gestión</option>
                <option value="MANAGED">Gestionada</option>
                <option value="DELIVERED">Entregada</option>
              </select>
            </div>
          </div>

          {/* Ocultar/Mostrar Columnas */}
          <div className="flex justify-between items-center border-t pt-3">
            <span className="text-xs font-semibold text-slate-500">
              Mostrando {filteredInvoices.length} registro(s)
            </span>

            <div className="relative">
              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Ocultar / Mostrar Columnas
              </button>

              {showColumnSelector && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 p-3 z-30 space-y-1.5 text-xs">
                  {Object.keys(visibleColumns).map(col => (
                    <label key={col} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={(visibleColumns as any)[col]}
                        onChange={e => setVisibleColumns({ ...visibleColumns, [col]: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                      <span className="capitalize">{col}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 17. TABLA ACTUALIZADA */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  {visibleColumns.supplier && <th className="p-3">PROVEEDOR</th>}
                  {visibleColumns.description && <th className="p-3">DESCRIPCIÓN</th>}
                  {visibleColumns.type && <th className="p-3">TIPO</th>}
                  {visibleColumns.code && <th className="p-3">CÓDIGO</th>}
                  {visibleColumns.remissionDate && <th className="p-3">REMISIÓN</th>}
                  {visibleColumns.deliveryDate && <th className="p-3">ENTREGA</th>}
                  {visibleColumns.amount && <th className="p-3">VALOR</th>}
                  {visibleColumns.quotationSigned && <th className="p-3">COT. FIRMADA</th>}
                  {visibleColumns.invoiceSigned && <th className="p-3">FAC. FIRMADA</th>}
                  {visibleColumns.factureReceived && <th className="p-3">LLEGÓ EN FACTURE</th>}
                  {visibleColumns.management && <th className="p-3">GESTIÓN</th>}
                  {visibleColumns.delivered && <th className="p-3">ENTREGADA</th>}
                  {visibleColumns.alert && <th className="p-3">ALERTA</th>}
                  {visibleColumns.documents && <th className="p-3">DOCUMENTOS</th>}
                  <th className="p-3 text-right">ACCIONES</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map(inv => {
                  const hasQuotationDoc = !!inv.quotationDocumentPath;
                  const hasInvoiceDoc = !!inv.invoiceDocumentPath;
                  const mainDoc = inv.documents?.[0];

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                      
                      {visibleColumns.supplier && (
                        <td className="p-3 font-medium text-slate-800">{inv.supplierName}</td>
                      )}

                      {visibleColumns.description && (
                        <td className="p-3 text-slate-600 max-w-xs truncate" title={inv.description}>
                          {inv.description}
                        </td>
                      )}

                      {visibleColumns.type && (
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            inv.type === 'QUOTATION' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {inv.type === 'QUOTATION' ? 'COTIZACIÓN' : 'FACTURA'}
                          </span>
                        </td>
                      )}

                      {visibleColumns.code && (
                        <td className="p-3 font-mono font-semibold text-slate-700">
                          {inv.invoiceCode}
                          {inv.relatedQuotationCode && (
                            <span className="block text-[10px] font-normal text-indigo-600">
                              Cot: {inv.relatedQuotationCode}
                            </span>
                          )}
                        </td>
                      )}

                      {visibleColumns.remissionDate && (
                        <td className="p-3 text-slate-600">
                          {new Date(inv.remissionDate).toLocaleDateString('es-CO')}
                        </td>
                      )}

                      {visibleColumns.deliveryDate && (
                        <td className="p-3 text-slate-600">
                          {inv.deliveryDate ? new Date(inv.deliveryDate).toLocaleDateString('es-CO') : '-'}
                        </td>
                      )}

                      {visibleColumns.amount && (
                        <td className="p-3 font-semibold text-slate-800">
                          ${inv.amount.toLocaleString('es-CO')}
                        </td>
                      )}

                      {/* 9. CONTROL DE FIRMA - COTIZACIÓN */}
                      {visibleColumns.quotationSigned && (
                        <td className="p-3">
                          {inv.type === 'QUOTATION' ? (
                            <button
                              onClick={() => handleStatusChange(inv, 'quotationSigned', !inv.quotationSigned)}
                              className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                                inv.quotationSigned ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'
                              }`}
                            >
                              {inv.quotationSigned ? 'SÍ 🟢' : 'NO 🔴'}
                            </button>
                          ) : '-'}
                        </td>
                      )}

                      {/* 9. CONTROL DE FIRMA - FACTURA */}
                      {visibleColumns.invoiceSigned && (
                        <td className="p-3">
                          {inv.type === 'INVOICE' ? (
                            <button
                              onClick={() => handleStatusChange(inv, 'invoiceSigned', !inv.invoiceSigned)}
                              className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                                inv.invoiceSigned ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-300'
                              }`}
                            >
                              {inv.invoiceSigned ? 'SÍ 🟢' : 'NO 🔴'}
                            </button>
                          ) : '-'}
                        </td>
                      )}

                      {/* 13. LLEGÓ EN FACTURE */}
                      {visibleColumns.factureReceived && (
                        <td className="p-3">
                          {inv.type === 'INVOICE' ? (
                            <button
                              onClick={() => handleStatusChange(inv, 'factureReceived', inv.factureReceived === 'SÍ' ? 'AÚN NO' : 'SÍ')}
                              className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                                inv.factureReceived === 'SÍ'
                                  ? 'bg-teal-50 text-teal-800 border-teal-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              {inv.factureReceived}
                            </button>
                          ) : '-'}
                        </td>
                      )}

                      {/* GESTIÓN */}
                      {visibleColumns.management && (
                        <td className="p-3">
                          <button
                            onClick={() => handleStatusChange(inv, 'management', !inv.management)}
                            className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                              inv.management ? 'bg-green-50 text-green-700 border-green-300' : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                          >
                            {inv.management ? 'SÍ 🟢' : 'NO 🔴'}
                          </button>
                        </td>
                      )}

                      {/* ENTREGADA */}
                      {visibleColumns.delivered && (
                        <td className="p-3">
                          <button
                            onClick={() => handleStatusChange(inv, 'delivered', !inv.delivered)}
                            className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                              inv.delivered ? 'bg-purple-50 text-purple-700 border-purple-300' : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                          >
                            {inv.delivered ? 'SÍ 🟢' : 'NO 🔴'}
                          </button>
                        </td>
                      )}

                      {/* 16. ALERTA COMBINADA */}
                      {visibleColumns.alert && (
                        <td className="p-3">
                          {inv.alertText && (
                            <span className={`px-2 py-1 rounded border text-[11px] font-medium block whitespace-nowrap ${inv.alertBadgeClass}`}>
                              {inv.alertText}
                            </span>
                          )}
                        </td>
                      )}

                      {/* 5, 6, 7. DOCUMENTOS (VISUALIZAR / REEMPLAZAR) */}
                      {visibleColumns.documents && (
                        <td className="p-3">
                          {mainDoc ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setSelectedDoc(mainDoc);
                                  setIsViewerOpen(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded flex items-center gap-1 text-[11px] font-medium"
                              >
                                <Eye className="w-3.5 h-3.5" /> 📄 Ver documento
                              </button>

                              {/* 7. Cambiar/Reemplazar */}
                              <label className="cursor-pointer text-slate-500 hover:text-slate-800 p-1 rounded hover:bg-slate-100" title="🔄 Cambiar documento">
                                <RefreshCw className="w-3.5 h-3.5" />
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={e => {
                                    if (e.target.files?.[0]) {
                                      handleReplaceFile(mainDoc.id, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Sin adjunto</span>
                          )}
                        </td>
                      )}

                      {/* ACCIONES (IMPRIMIR / TIMELINE) */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setSelectedDoc(mainDoc);
                              setIsViewerOpen(true);
                            }}
                            className="p-1 text-slate-600 hover:text-indigo-600 rounded hover:bg-slate-100"
                            title="🖨️ Imprimir"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Timeline interactivo para el registro seleccionado */}
        {selectedInvoice && (
          <DocumentTimeline invoice={selectedInvoice} history={selectedInvoice.history || []} />
        )}

        {/* Modal Registro Nuevo */}
        <InvoiceFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={fetchData}
          suppliers={suppliers}
          invoices={invoices}
        />

        {/* Modal Visor / Impresión */}
        {selectedInvoice && (
          <DocumentViewerModal
            isOpen={isViewerOpen}
            onClose={() => setIsViewerOpen(false)}
            invoice={selectedInvoice}
            document={selectedDoc}
          />
        )}
      </div>
    </div>
  );
};
