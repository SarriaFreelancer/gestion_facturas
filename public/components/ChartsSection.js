function ChartsSection({ managedCount, pendingCount, enFactureCount, otherCount, totalCount, onQuickRegister, onGoInvoices, onGoReports, onGoSuppliers }) {
  const managedPct = totalCount > 0 ? Math.round((managedCount / totalCount) * 100) : 50;
  const pendingPct = totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 29;
  const facturePct = totalCount > 0 ? Math.round((enFactureCount / totalCount) * 100) : 17;

  return (
    <div className="middle-row">
      {/* 1. Donut: Estado general de documentos */}
      <div className="chart-card">
        <div className="chart-card-title">Estado general de documentos</div>
        <div className="donut-chart-container">
          <div className="donut-circle-wrap">
            <svg viewBox="0 0 36 36" style={{width: '100%', height: '100%', transform: 'rotate(-90deg)'}}>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="4.5"></circle>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4.5" strokeDasharray={`${managedPct} 100`} strokeDashoffset="0"></circle>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="4.5" strokeDasharray={`${pendingPct} 100`} strokeDashoffset={`-${managedPct}`}></circle>
              <circle cx="18" cy="18" r="14" fill="none" stroke="#3b82f6" strokeWidth="4.5" strokeDasharray={`${facturePct} 100`} strokeDashoffset={`-${managedPct + pendingPct}`}></circle>
            </svg>
            <div className="donut-inner-txt">
              <span className="donut-inner-val">{totalCount}</span>
              <span className="donut-inner-lbl">Total</span>
            </div>
          </div>

          <div className="donut-legend">
            <div className="legend-row">
              <span className="legend-dot" style={{background: '#10b981'}}></span>
              <span className="legend-name">Gestionadas</span>
              <span className="legend-qty">{managedCount} ({managedPct}%)</span>
            </div>
            <div className="legend-row">
              <span className="legend-dot" style={{background: '#f59e0b'}}></span>
              <span className="legend-name">Pendientes</span>
              <span className="legend-qty">{pendingCount} ({pendingPct}%)</span>
            </div>
            <div className="legend-row">
              <span className="legend-dot" style={{background: '#3b82f6'}}></span>
              <span className="legend-name">En Facture</span>
              <span className="legend-qty">{enFactureCount} ({facturePct}%)</span>
            </div>
            <div className="legend-row">
              <span className="legend-dot" style={{background: '#94a3b8'}}></span>
              <span className="legend-name">Otros</span>
              <span className="legend-qty">{otherCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BARRAS PARADAS VERTICALES: Documentos por mes */}
      <div className="chart-card">
        <div className="chart-card-title">Documentos por mes</div>
        <div className="bar-chart-container">
          <div className="bar-col">
            <span className="bar-val">18</span>
            <div className="bar-pill blue" style={{height: '52px'}}></div>
            <span className="bar-month">Mar</span>
          </div>
          <div className="bar-col">
            <span className="bar-val">22</span>
            <div className="bar-pill blue" style={{height: '68px'}}></div>
            <span className="bar-month">Abr</span>
          </div>
          <div className="bar-col">
            <span className="bar-val">20</span>
            <div className="bar-pill blue" style={{height: '60px'}}></div>
            <span className="bar-month">May</span>
          </div>
          <div className="bar-col">
            <span className="bar-val">26</span>
            <div className="bar-pill blue" style={{height: '84px'}}></div>
            <span className="bar-month">Jun</span>
          </div>
          <div className="bar-col">
            <span className="bar-val">24</span>
            <div className="bar-pill blue" style={{height: '75px'}}></div>
            <span className="bar-month">Jul</span>
          </div>
          <div className="bar-col">
            <span className="bar-val" style={{color: '#e11d48', fontWeight: 900}}>{totalCount}</span>
            <div className="bar-pill red" style={{height: `${Math.min(95, Math.max(30, totalCount * 3.5))}px`}}></div>
            <span className="bar-month" style={{color: '#0f172a', fontWeight: 800}}>Ago</span>
          </div>
        </div>
      </div>

      {/* 3. Acciones Rápidas */}
      <div className="chart-card">
        <div className="chart-card-title">Acciones rápidas</div>
        <div className="actions-grid">
          <button className="btn-action-tile red-primary" onClick={onQuickRegister}>
            <i className="fa-regular fa-file-lines"></i>
            <span>+ Registrar Factura<br/>/ Cotización</span>
          </button>
          <button className="btn-action-tile" onClick={onGoInvoices}>
            <i className="fa-solid fa-gear" style={{color: '#475569'}}></i>
            <span>Gestionar<br/>documentos</span>
          </button>
          <button className="btn-action-tile" onClick={onGoReports}>
            <i className="fa-solid fa-chart-simple" style={{color: '#3b82f6'}}></i>
            <span>Ir a Reportes</span>
          </button>
          <button className="btn-action-tile" onClick={onGoSuppliers}>
            <i className="fa-solid fa-user-group" style={{color: '#64748b'}}></i>
            <span>Administrar<br/>Proveedores</span>
          </button>
        </div>
      </div>
    </div>
  );
}

window.ChartsSection = ChartsSection;
