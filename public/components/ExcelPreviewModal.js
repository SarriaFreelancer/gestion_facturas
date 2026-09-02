function ExcelPreviewModal({ isOpen, onClose, selectedInvoices, onToggleDelivered, onUploadPdf }) {
  if (!isOpen || !selectedInvoices || selectedInvoices.length === 0) return null;

  const totalSelectedAmount = selectedInvoices.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const deliveredCount = selectedInvoices.filter(i => i.delivered === 'SÍ').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ['Proveedor', 'Servicio', 'N DE FACTURA', 'FECHA DE EMISION', 'FECHA DE ENTREGA', 'VALOR', 'FIRMADA', 'ORDEN STD', 'OC', 'EN FACTURE', 'ENTREGADA'];
    const rows = selectedInvoices.map(i => [
      `"${i.supplier}"`,
      `"${i.service}"`,
      `"${i.invoiceNumber}"`,
      `"${i.emissionDate}"`,
      `"${i.deliveryDate}"`,
      i.value,
      `"${i.signed}"`,
      `"${i.orderStd}"`,
      `"${i.oc}"`,
      `"${i.enFacture}"`,
      `"${i.delivered}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vista_Previa_Facturas_Entregadas_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed-modal-overlay">
      <div className="excel-modal-container">
        
        {/* Cabecera Tipo Excel / Hoja de Cálculo */}
        <div className="excel-modal-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <div style={{background: '#107c41', color: '#fff', padding: '6px 10px', borderRadius: '8px', fontWeight: 900, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px'}}>
              <i className="fa-regular fa-file-excel"></i> Excel View
            </div>
            <div>
              <h3 style={{fontSize: '15px', fontWeight: 800, margin: 0}}>
                Vista Previa de Facturas Entregadas y Seleccionadas
              </h3>
              <p style={{fontSize: '11px', color: '#64748b', margin: 0}}>
                {selectedInvoices.length} facturas seleccionadas | {deliveredCount} con estado ENTREGADA | Total: <strong>${totalSelectedAmount.toLocaleString('es-CO')}</strong>
              </p>
            </div>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <button className="btn-excel-tool" onClick={handleExportCsv} title="Descargar archivo Excel / CSV">
              <i className="fa-solid fa-file-arrow-down" style={{color: '#15803d'}}></i>
              <span>Exportar CSV</span>
            </button>
            <button className="btn-excel-tool" onClick={handlePrint} title="Imprimir informe">
              <i className="fa-solid fa-print" style={{color: '#2563eb'}}></i>
              <span>Imprimir</span>
            </button>
            <button className="btn-excel-close" onClick={onClose} title="Cerrar modal">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Barra de herramientas / Fórmula tipo Excel */}
        <div className="excel-formula-bar">
          <div className="excel-cell-name">A1:{String.fromCharCode(65 + 10)}{selectedInvoices.length + 1}</div>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', flex: 1}}>
            <span style={{fontWeight: 800, color: '#94a3b8', fontStyle: 'italic'}}>fx</span>
            <span style={{fontSize: '12px', fontWeight: 600, color: '#475569'}}>
              =SUMA(VALOR) = ${totalSelectedAmount.toLocaleString('es-CO')} COP | Entregadas: {deliveredCount}/{selectedInvoices.length}
            </span>
          </div>
        </div>

        {/* Tabla Estilo Hoja de Cálculo Excel con cuadrícula y columnas A, B, C... */}
        <div className="excel-sheet-viewport">
          <table className="excel-sheet-table">
            <thead>
              {/* Fila de letras de columnas Excel */}
              <tr className="excel-col-letters-row">
                <th style={{width: '40px'}}></th>
                <th>A</th>
                <th>B</th>
                <th>C</th>
                <th>D</th>
                <th>E</th>
                <th>F</th>
                <th>G</th>
                <th>H</th>
                <th>I</th>
                <th>J</th>
                <th>K</th>
                <th>L</th>
              </tr>
              {/* Fila de Títulos Reales */}
              <tr className="excel-header-row">
                <th style={{textAlign: 'center', background: '#e2e8f0', color: '#475569'}}>#</th>
                <th>PROVEEDOR</th>
                <th>SERVICIO</th>
                <th>N DE FACTURA</th>
                <th>FECHA EMISIÓN</th>
                <th>FECHA ENTREGA</th>
                <th style={{textAlign: 'right'}}>VALOR ($)</th>
                <th style={{textAlign: 'center'}}>FIRMADA</th>
                <th style={{textAlign: 'center'}}>ORDEN STD</th>
                <th>OC</th>
                <th style={{textAlign: 'center'}}>EN FACTURE</th>
                <th style={{textAlign: 'center'}}>ENTREGADA</th>
                <th style={{textAlign: 'center'}}>DOCUMENTO PDF</th>
              </tr>
            </thead>
            <tbody>
              {selectedInvoices.map((inv, idx) => (
                <tr key={inv.id || idx} className={inv.delivered === 'SÍ' ? 'row-delivered-highlight' : ''}>
                  {/* Número de fila Excel 1, 2, 3... */}
                  <td className="excel-row-num">{idx + 1}</td>
                  
                  <td style={{fontWeight: 700, color: '#0f172a'}}>{inv.supplier}</td>
                  <td style={{color: '#475569'}}>{inv.service}</td>
                  <td style={{fontFamily: 'monospace', fontWeight: 800, color: '#e11d48'}}>{inv.invoiceNumber}</td>
                  <td>{inv.emissionDate}</td>
                  <td style={{color: '#047857', fontWeight: 700}}>{inv.deliveryDate}</td>
                  <td style={{textAlign: 'right', fontWeight: 800, fontFamily: 'monospace'}}>
                    ${Number(inv.value || 0).toLocaleString('es-CO')}
                  </td>
                  <td style={{textAlign: 'center'}}>
                    <span className={`state-pill ${inv.signed === 'SÍ' ? 'state-yes' : 'state-no'}`}>
                      {inv.signed || 'NO'}
                    </span>
                  </td>
                  <td style={{textAlign: 'center'}}>
                    <span className={`state-pill ${inv.orderStd === 'SÍ' ? 'state-yes' : 'state-no'}`}>
                      {inv.orderStd || 'NO'}
                    </span>
                  </td>
                  <td style={{fontFamily: 'monospace', color: '#7c3aed', fontWeight: 700}}>{inv.oc}</td>
                  <td style={{textAlign: 'center'}}>
                    <span className={`state-pill ${inv.enFacture === 'SÍ' ? 'state-yes' : 'state-pending'}`}>
                      {inv.enFacture || 'AÚN NO'}
                    </span>
                  </td>
                  <td style={{textAlign: 'center'}}>
                    <span 
                      className={`state-pill ${inv.delivered === 'SÍ' ? 'state-yes' : 'state-no'}`}
                      onClick={() => onToggleDelivered && onToggleDelivered(inv.id)}
                      style={{cursor: 'pointer'}}
                      title="Clic para cambiar estado de entrega"
                    >
                      {inv.delivered === 'SÍ' ? 'SÍ ✓' : 'NO ✕'}
                    </span>
                  </td>
                  <td style={{textAlign: 'center'}}>
                    {inv.pdfPath ? (
                      <a 
                        href={inv.pdfPath} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn-pdf-badge"
                        title={`Ver PDF: ${inv.pdfOriginalName || 'Archivo adjunto'}`}
                      >
                        <i className="fa-solid fa-file-pdf"></i> Ver PDF
                      </a>
                    ) : (
                      <button 
                        className="btn-upload-pdf-badge"
                        onClick={() => onUploadPdf && onUploadPdf(inv.id)}
                        title="Adjuntar PDF físico a esta factura"
                      >
                        <i className="fa-solid fa-paperclip"></i> Adjuntar PDF
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="excel-total-row">
                <td colSpan="6" style={{textAlign: 'right', fontWeight: 900, textTransform: 'uppercase', color: '#0f172a'}}>
                  TOTAL GENERAL SELECCIONADO:
                </td>
                <td style={{textAlign: 'right', fontWeight: 900, fontSize: '13px', color: '#15803d', fontFamily: 'monospace'}}>
                  ${totalSelectedAmount.toLocaleString('es-CO')}
                </td>
                <td colSpan="6" style={{textAlign: 'center', fontSize: '11px', color: '#64748b'}}>
                  {deliveredCount} facturas entregadas de {selectedInvoices.length} seleccionadas
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer del Modal */}
        <div className="excel-modal-footer">
          <div style={{fontSize: '11px', color: '#64748b'}}>
            💡 Los archivos PDF se guardan de forma segura en la carpeta local <code>/uploads</code> y la información en <strong>MySQL</strong>.
          </div>
          <button className="btn-red-action" onClick={onClose}>
            Entendido / Cerrar Vista
          </button>
        </div>

      </div>
    </div>
  );
}

window.ExcelPreviewModal = ExcelPreviewModal;
