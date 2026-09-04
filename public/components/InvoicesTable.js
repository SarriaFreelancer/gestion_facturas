function InvoicesTable({ 
  rows, 
  currentTab, 
  setCurrentTab, 
  tabCounts, 
  selectedIds, 
  onToggleSelectRow, 
  onToggleSelectAll, 
  onToggleSigned, 
  onToggleFacture, 
  onToggleDelivered, 
  onToggleOrderStd, 
  onViewDetail, 
  onDeleteInvoice, 
  onUploadPdf 
}) {
  const isAllSelected = rows.length > 0 && rows.every(r => selectedIds.includes(r.id));
  const isSomeSelected = rows.some(r => selectedIds.includes(r.id));

  return (
    <div>
      {/* TABS DE ESTADO */}
      <div className="status-tabs-row" style={{marginBottom: '12px'}}>
        {[
          { id: 'Todos', label: `Todos (${tabCounts.total})` },
          { id: 'Facturas', label: `Facturas (${tabCounts.fac})` },
          { id: 'Cotizaciones', label: `Cotizaciones (${tabCounts.cot})` },
          { id: 'Pendientes', label: `Pendientes (${tabCounts.pending})` },
          { id: 'Atrasadas', label: `Atrasadas (${tabCounts.delayed})` },
          { id: 'En Facture', label: `En Facture (${tabCounts.facture})` }
        ].map(tab => (
          <button
            key={tab.id}
            className={`status-tab-btn ${currentTab === tab.id ? 'active' : ''}`}
            onClick={() => setCurrentTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TABLA PRINCIPAL CON CHECKBOXES FUNCIONALES, FECHAS LIMPIAS, ORDEN STD SI/NO Y ADJUNTOS PDF */}
      <div className="table-card">
        <table className="main-table">
          <thead>
            <tr>
              <th style={{width: '36px', textAlign: 'center'}}>
                <input 
                  type="checkbox" 
                  checked={isAllSelected}
                  onChange={(e) => onToggleSelectAll(e.target.checked)}
                  title="Seleccionar todas las facturas visibles para vista previa Excel"
                  style={{cursor: 'pointer'}}
                />
              </th>
              <th>Proveedor</th>
              <th>SERVICIO ↕</th>
              <th>N DE FACTURA ↕</th>
              <th>FECHA DE EMISION ↕</th>
              <th>FECHA DE ENTREGA ↕</th>
              <th>VALOR ↕</th>
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
            {rows.length === 0 ? (
              <tr>
                <td colSpan="14" style={{textAlign: 'center', padding: '24px', color: '#64748b'}}>
                  No hay documentos que coincidan con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              rows.map(row => {
                const isChecked = selectedIds.includes(row.id);
                return (
                  <tr key={row.id} className={isChecked ? 'row-delivered-highlight' : ''}>
                    {/* CHECKBOX INDIVIDUAL FUNCIONAL */}
                    <td style={{textAlign: 'center'}}>
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => onToggleSelectRow(row.id)}
                        style={{cursor: 'pointer'}}
                        title="Seleccionar para Vista Previa Excel"
                      />
                    </td>

                    <td style={{fontWeight: 700}}>
                      {row.logoText && <span className="sup-logo-badge">{row.logoText}</span>}
                      {row.logoIcon && <span className="sup-logo-badge"><i className={`fa-solid ${row.logoIcon}`}></i></span>}
                      {row.supplier}
                    </td>

                    <td style={{color: '#475569'}}>{row.service}</td>
                    <td style={{fontFamily: 'monospace', fontWeight: 800, color: '#e11d48'}}>{row.invoiceNumber}</td>
                    <td>{row.emissionDate}</td>
                    <td style={{color: '#047857', fontWeight: 600}}>{row.deliveryDate}</td>
                    <td style={{fontWeight: 800}}>${Number(row.value || 0).toLocaleString('es-CO')}</td>
                    
                    {/* FIRMADA (SÍ / NO) */}
                    <td style={{textAlign: 'center'}}>
                      <span 
                        className={`state-pill ${row.signed === 'SÍ' ? 'state-yes' : 'state-no'}`} 
                        onClick={() => onToggleSigned(row.id)}
                        title="Clic para conmutar estado de firma"
                      >
                        {row.signed}
                      </span>
                    </td>

                    {/* ORDEN STD (SÍ / NO) */}
                    <td style={{textAlign: 'center'}}>
                      <span 
                        className={`state-pill ${row.orderStd === 'SÍ' ? 'state-yes' : 'state-no'}`}
                        onClick={() => onToggleOrderStd(row.id)}
                        title="Clic para conmutar Orden STD"
                      >
                        {row.orderStd}
                      </span>
                    </td>

                    {/* OC */}
                    <td style={{fontFamily: 'monospace', fontWeight: 700, color: '#7c3aed'}}>{row.oc}</td>

                    {/* EN FACTURE (SÍ / AÚN NO) */}
                    <td style={{textAlign: 'center'}}>
                      <span 
                        className={`state-pill ${row.enFacture === 'SÍ' ? 'state-yes' : 'state-pending'}`} 
                        onClick={() => onToggleFacture(row.id)}
                        title="Clic para conmutar estado Facture"
                      >
                        {row.enFacture}
                      </span>
                    </td>

                    {/* ENTREGADA (SÍ / NO) */}
                    <td style={{textAlign: 'center'}}>
                      <span 
                        className={`state-pill ${row.delivered === 'SÍ' ? 'state-yes' : 'state-no'}`} 
                        onClick={() => onToggleDelivered(row.id)}
                        title="Clic para conmutar estado Entregada"
                      >
                        {row.delivered}
                      </span>
                    </td>

                    {/* BOTÓN / ENLACE PDF FÍSICO */}
                    <td style={{textAlign: 'center'}}>
                      {row.pdfPath ? (
                        <a 
                          href={row.pdfPath} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{color: '#e11d48', fontSize: '13px'}} 
                          title={`Ver PDF: ${row.pdfOriginalName || 'Archivo adjunto'}`}
                        >
                          <i className="fa-solid fa-file-pdf"></i>
                        </a>
                      ) : (
                        <i 
                          className="fa-solid fa-arrow-up-from-bracket" 
                          style={{color: '#94a3b8', cursor: 'pointer', fontSize: '12px'}} 
                          onClick={() => onUploadPdf(row.id)}
                          title="Subir PDF físico local a esta factura"
                        ></i>
                      )}
                    </td>

                    {/* ACCIONES */}
                    <td style={{textAlign: 'right'}}>
                      <div className="action-icons-wrap" style={{justifyContent: 'flex-end'}}>
                        <i className="fa-solid fa-pen-to-square" style={{color: '#2563eb', cursor: 'pointer'}} title="Editar Factura" onClick={() => onViewDetail(row)}></i>
                        <i className="fa-solid fa-paperclip" title="Adjuntar PDF local" onClick={() => onUploadPdf(row.id)}></i>
                        <i className="fa-solid fa-trash" style={{color: '#e11d48'}} title="Eliminar de BD" onClick={() => onDeleteInvoice(row.id)}></i>
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
  );
}

window.InvoicesTable = InvoicesTable;
