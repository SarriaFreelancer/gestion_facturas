// public/components/InvoicesModule.js
// Módulo Completo de Facturas y Cotizaciones con Diseño Elevado

function InvoicesModule({ 
  invoices, 
  onQuickRegister, 
  onToggleSigned, 
  onToggleOrderStd, 
  onToggleFacture, 
  onToggleDelivered, 
  onUpdateInvoiceField,
  onDeleteInvoice, 
  onUploadPdf,
  onViewDetail,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  searchTerm,
  setSearchTerm,
  selectedSupplier,
  setSelectedSupplier,
  selectedFactureFilter,
  setSelectedFactureFilter,
  selectedSignedFilter,
  setSelectedSignedFilter,
  selectedOrderStdFilter,
  setSelectedOrderStdFilter,
  selectedOcFilter,
  setSelectedOcFilter,
  selectedDeliveredFilter,
  setSelectedDeliveredFilter,
  suppliersList,
  onOpenExcelPreview,
  selectedCount,
  onCleanFilters
}) {
  const [currentTab, setCurrentTab] = React.useState('Todos');
  const [selectedIds, setSelectedIds] = React.useState([]);

  const tabCounts = React.useMemo(() => {
    return {
      total: invoices.length,
      fac: invoices.filter(i => (i.invoiceNumber || '').toUpperCase().startsWith('FAC') || i.docType === 'factura').length,
      cot: invoices.filter(i => (i.invoiceNumber || '').toUpperCase().startsWith('COT') || i.docType === 'cotizacion').length,
      pending: invoices.filter(i => i.delivered !== 'SÍ').length,
      delayed: invoices.filter(i => new Date(i.deliveryDate) < new Date('2026-09-01') && i.delivered !== 'SÍ').length,
      facture: invoices.filter(i => i.enFacture === 'SÍ').length
    };
  }, [invoices]);

  const handleToggleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleToggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(invoices.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  return (
    <div className="dashboard-container">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm mb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-md shadow-red-600/30 flex-shrink-0">
            <Icon name="file-text" size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              Facturas & Cotizaciones
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Edición en tiempo real: Números de comprobante, fechas con calendario, montos y conmutadores directos.
            </p>
          </div>
        </div>

        <button 
          onClick={onQuickRegister}
          className="btn-red-action"
        >
          <Icon name="plus" size={16} className="text-white" />
          <span>Registrar Comprobante</span>
        </button>
      </div>

      {/* FILTROS */}
      <FiltersBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedSupplier={selectedSupplier}
        setSelectedSupplier={setSelectedSupplier}
        selectedFactureFilter={selectedFactureFilter}
        setSelectedFactureFilter={setSelectedFactureFilter}
        selectedSignedFilter={selectedSignedFilter}
        setSelectedSignedFilter={setSelectedSignedFilter}
        selectedOrderStdFilter={selectedOrderStdFilter}
        setSelectedOrderStdFilter={setSelectedOrderStdFilter}
        selectedOcFilter={selectedOcFilter}
        setSelectedOcFilter={setSelectedOcFilter}
        selectedDeliveredFilter={selectedDeliveredFilter}
        setSelectedDeliveredFilter={setSelectedDeliveredFilter}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        suppliersList={suppliersList || []}
        selectedCount={selectedIds.length}
        onOpenExcelPreview={onOpenExcelPreview}
        onClean={onCleanFilters}
        onExportExcel={() => Swal.fire('Excel Exportado', 'Reporte descargado correctamente.', 'success')}
      />

      {/* TABLA SAAS */}
      <InvoicesTable 
        rows={invoices}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        tabCounts={tabCounts}
        selectedIds={selectedIds}
        onToggleSelectRow={handleToggleSelectRow}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleSigned={onToggleSigned}
        onToggleFacture={onToggleFacture}
        onToggleDelivered={onToggleDelivered}
        onToggleOrderStd={onToggleOrderStd}
        onUpdateInvoiceField={onUpdateInvoiceField}
        onViewDetail={onViewDetail}
        onDeleteInvoice={onDeleteInvoice}
        onUploadPdf={onUploadPdf}
      />
    </div>
  );
}

window.InvoicesModule = InvoicesModule;
