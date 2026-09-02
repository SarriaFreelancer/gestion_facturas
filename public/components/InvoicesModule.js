function InvoicesModule({ invoices, onQuickRegister, onToggleSigned, onToggleOrderStd, onToggleFacture, onToggleDelivered, onDeleteInvoice }) {
  return (
    <div className="dashboard-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0'}}>
        <div>
          <h2 style={{fontSize: '16px', fontWeight: 800}}>📑 Módulo de Facturas & Cotizaciones</h2>
          <p style={{fontSize: '12px', color: '#64748b'}}>Control de Orden STD (SÍ/NO), OC, Fechas y Radicaciones</p>
        </div>
        <button className="btn-red-action" onClick={onQuickRegister}>
          <i className="fa-solid fa-plus"></i> Registrar Factura
        </button>
      </div>

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
              <th style={{textAlign: 'right'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td style={{fontWeight: 700}}>{inv.supplier}</td>
                <td>{inv.service}</td>
                <td style={{fontFamily: 'monospace', fontWeight: 800, color: '#e11d48'}}>{inv.invoiceNumber}</td>
                <td>{inv.emissionDate}</td>
                <td style={{color: '#047857', fontWeight: 600}}>{inv.deliveryDate}</td>
                <td style={{fontWeight: 800}}>${inv.value.toLocaleString('es-CO')}</td>
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
                <td style={{textAlign: 'right'}}>
                  <button 
                    style={{background: '#fee2e2', color: '#e11d48', border: 'none', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer'}} 
                    onClick={() => onDeleteInvoice(inv.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.InvoicesModule = InvoicesModule;
