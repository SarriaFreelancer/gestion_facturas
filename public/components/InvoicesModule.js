function InvoicesModule({ 
  invoices, 
  onQuickRegister, 
  onToggleSigned, 
  onToggleOrderStd, 
  onToggleFacture, 
  onToggleDelivered, 
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
  suppliersList,
  onOpenExcelPreview,
  selectedCount
}) {
  return (
    <div className="dashboard-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0'}}>
        <div>
          <h2 style={{fontSize: '16px', fontWeight: 800}}>📑 Módulo de Facturas & Cotizaciones</h2>
          <p style={{fontSize: '12px', color: '#64748b'}}>Control de Orden STD (SÍ/NO), OC, Fechas y Radicaciones con Filtros Avanzados</p>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          <button className="btn-preview-excel" onClick={onOpenExcelPreview}>
            <i className="fa-solid fa-table-cells"></i>
            <span>Vista Previa Excel</span>
          </button>
          <button className="btn-red-action" onClick={onQuickRegister}>
            <i className="fa-solid fa-plus"></i> Registrar Factura
          </button>
        </div>
      </div>

      {/* FILTROS INTEGRADOS EN EL MÓDULO DE FACTURAS */}
      <FiltersBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedSupplier={selectedSupplier}
        setSelectedSupplier={setSelectedSupplier}
        selectedFactureFilter={selectedFactureFilter}
        setSelectedFactureFilter={setSelectedFactureFilter}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        suppliersList={suppliersList || []}
        selectedCount={selectedCount || 0}
        onOpenExcelPreview={onOpenExcelPreview}
        onClean={() => { 
          if (setSearchTerm) setSearchTerm(''); 
          if (setSelectedSupplier) setSelectedSupplier('Todos'); 
          if (setSelectedFactureFilter) setSelectedFactureFilter('Todos'); 
          if (setSelectedMonth) setSelectedMonth('Todos');
          if (setSelectedYear) setSelectedYear('Todos');
        }}
        onExportExcel={() => Swal.fire('Excel Exportado', 'Reporte descargado correctamente.', 'success')}
      />

      <div className="table-card">
        <table className="main-table">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>SERVICIO</th>
              <th>N DE FACTURA</th>
              <th>FECHA DE EMISION</th>
              <th>FECHA DE ENTREGA</th>
              <th>VALOR</th>
              <th style={{textAlign: 'center'}}>FIRMADA</th>
              <th style={{textAlign: 'center'}}>ORDEN STD</th>
              <th>OC</th>
              <th style={{textAlign: 'center'}}>EN FACTURE</th>
              <th style={{textAlign: 'center'}}>ENTREGADA</th>
              <th style={{textAlign: 'center'}}>PDF</th>
              <th style={{textAlign: 'right'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="13" style={{textAlign: 'center', padding: '24px', color: '#64748b'}}>
                  No hay comprobantes para el mes y año seleccionados.
                </td>
              </tr>
            ) : (
              invoices.map(inv => (
                <tr key={inv.id}>
                  <td style={{fontWeight: 700}}>{inv.supplier}</td>
                  <td>{inv.service}</td>
                  <td style={{fontFamily: 'monospace', fontWeight: 800, color: '#e11d48'}}>{inv.invoiceNumber}</td>
                  <td>{inv.emissionDate}</td>
                  <td style={{color: '#047857', fontWeight: 600}}>{inv.deliveryDate}</td>
                  <td style={{fontWeight: 800}}>${Number(inv.value || 0).toLocaleString('es-CO')}</td>
                  <td style={{textAlign: 'center'}}>
                    <span className={`state-pill ${inv.signed === 'SÍ' ? 'state-yes' : 'state-no'}`} onClick={() => onToggleSigned(inv.id)}>
                      {inv.signed}
                    </span>
                  </td>
                  <td style={{textAlign: 'center'}}>
                    <span className={`state-pill ${inv.orderStd === 'SÍ' ? 'state-yes' : 'state-no'}`} onClick={() => onToggleOrderStd(inv.id)}>
                      {inv.orderStd}
                    </span>
                  </td>
                  <td style={{fontFamily: 'monospace', fontWeight: 700, color: '#7c3aed'}}>{inv.oc}</td>
                  <td style={{textAlign: 'center'}}>
                    <span className={`state-pill ${inv.enFacture === 'SÍ' ? 'state-yes' : 'state-pending'}`} onClick={() => onToggleFacture(inv.id)}>
                      {inv.enFacture}
                    </span>
                  </td>
                  <td style={{textAlign: 'center'}}>
                    <span className={`state-pill ${inv.delivered === 'SÍ' ? 'state-yes' : 'state-no'}`} onClick={() => onToggleDelivered(inv.id)}>
                      {inv.delivered}
                    </span>
                  </td>
                  <td style={{textAlign: 'center'}}>
                    {inv.pdfPath ? (
                      <a href={inv.pdfPath} target="_blank" rel="noreferrer" style={{color: '#e11d48', fontSize: '13px'}} title={`Ver PDF: ${inv.pdfOriginalName || 'Archivo'}`}>
                        <i className="fa-solid fa-file-pdf"></i>
                      </a>
                    ) : (
                      <i className="fa-solid fa-arrow-up-from-bracket" style={{color: '#94a3b8', cursor: 'pointer', fontSize: '12px'}} onClick={() => onUploadPdf && onUploadPdf(inv.id)} title="Subir PDF"></i>
                    )}
                  </td>
                  <td style={{textAlign: 'right'}}>
                    <button 
                      style={{background: '#eff6ff', color: '#2563eb', border: 'none', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginRight: '6px'}} 
                      onClick={() => onViewDetail && onViewDetail(inv)}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      style={{background: '#fee2e2', color: '#e11d48', border: 'none', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer'}} 
                      onClick={() => onDeleteInvoice(inv.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.InvoicesModule = InvoicesModule;
