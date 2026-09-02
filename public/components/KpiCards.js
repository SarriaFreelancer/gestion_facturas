function KpiCards({ total, facCount, cotCount, toSignCount, pendingFactureCount, pendingManagementCount, delayedCount }) {
  const toSignPercent = total > 0 ? ((toSignCount / total) * 100).toFixed(1) : '0';
  const facturePercent = total > 0 ? ((pendingFactureCount / total) * 100).toFixed(1) : '0';
  const managementPercent = total > 0 ? ((pendingManagementCount / total) * 100).toFixed(1) : '0';

  return (
    <div className="kpi-row">
      {/* 1. Total documentos con Sparkline */}
      <div className="kpi-card" style={{background: 'linear-gradient(180deg, #ffffff 0%, #fff1f2 100%)'}}>
        <div className="kpi-header">
          <div className="kpi-title-box">
            <div className="kpi-icon-circle" style={{background: '#f1f5f9', color: '#475569'}}><i className="fa-regular fa-file-lines"></i></div>
            <span className="kpi-title">Total documentos</span>
          </div>
          <span className="kpi-trend trend-up">+ 12%</span>
        </div>
        <div className="kpi-body">
          <span className="kpi-value">{total}</span>
          <span className="kpi-sub">{facCount} Facturas &nbsp; {cotCount} Cotizaciones</span>
        </div>
        <svg className="sparkline-preview" viewBox="0 0 100 25" preserveAspectRatio="none">
          <path d="M0,20 Q25,5 50,18 T100,8 L100,25 L0,25 Z" fill="rgba(225,29,72,0.15)"/>
          <path d="M0,20 Q25,5 50,18 T100,8" fill="none" stroke="#e11d48" strokeWidth="2"/>
        </svg>
      </div>

      {/* 2. Cotizaciones */}
      <div className="kpi-card">
        <div className="kpi-header">
          <div className="kpi-title-box">
            <div className="kpi-icon-circle" style={{background: '#f5f3ff', color: '#7c3aed'}}><i className="fa-regular fa-clipboard"></i></div>
            <span className="kpi-title">Cotizaciones</span>
          </div>
        </div>
        <div className="kpi-body">
          <span className="kpi-value">{cotCount}</span>
          <span className="kpi-trend trend-up" style={{fontSize: '9px'}}>▲ 25%</span>
        </div>
        <span className="kpi-sub">Este mes</span>
      </div>

      {/* 3. Facturas */}
      <div className="kpi-card">
        <div className="kpi-header">
          <div className="kpi-title-box">
            <div className="kpi-icon-circle" style={{background: '#eff6ff', color: '#2563eb'}}><i className="fa-solid fa-file-invoice"></i></div>
            <span className="kpi-title">Facturas</span>
          </div>
        </div>
        <div className="kpi-body">
          <span className="kpi-value">{facCount}</span>
          <span className="kpi-trend trend-up" style={{fontSize: '9px'}}>▲ 8%</span>
        </div>
        <span className="kpi-sub">Este mes</span>
      </div>

      {/* 4. Pendientes de firma */}
      <div className="kpi-card">
        <div className="kpi-header">
          <div className="kpi-title-box">
            <div className="kpi-icon-circle" style={{background: '#fffbeb', color: '#d97706'}}><i className="fa-solid fa-pen-nib"></i></div>
            <span className="kpi-title">Pendientes<br/>de firma</span>
          </div>
        </div>
        <div className="kpi-body">
          <span className="kpi-value">{toSignCount}</span>
          <span className="kpi-sub" style={{color: '#d97706', fontWeight: 800}}>{toSignPercent}%</span>
        </div>
        <span className="kpi-sub">Firmas pendientes</span>
      </div>

      {/* 5. Pendientes en Facture */}
      <div className="kpi-card">
        <div className="kpi-header">
          <div className="kpi-title-box">
            <div className="kpi-icon-circle" style={{background: '#fff7ed', color: '#ea580c'}}><i className="fa-solid fa-cubes-stacked"></i></div>
            <span className="kpi-title">Pendientes<br/>en Facture</span>
          </div>
        </div>
        <div className="kpi-body">
          <span className="kpi-value">{pendingFactureCount}</span>
          <span className="kpi-trend trend-warning" style={{fontSize: '9px'}}>▼ {facturePercent}%</span>
        </div>
        <span className="kpi-sub">Aún no llegan</span>
      </div>

      {/* 6. Pendientes de gestión */}
      <div className="kpi-card">
        <div className="kpi-header">
          <div className="kpi-title-box">
            <div className="kpi-icon-circle" style={{background: '#fef2f2', color: '#dc2626'}}><i className="fa-solid fa-gear"></i></div>
            <span className="kpi-title">Pendientes<br/>de gestión</span>
          </div>
        </div>
        <div className="kpi-body">
          <span className="kpi-value">{pendingManagementCount}</span>
          <span className="kpi-trend trend-down" style={{fontSize: '9px'}}>▼ {managementPercent}%</span>
        </div>
        <span className="kpi-sub">Por gestionar</span>
      </div>

      {/* 7. Facturas atrasadas */}
      <div className="kpi-card">
        <div className="kpi-header">
          <div className="kpi-title-box">
            <div className="kpi-icon-circle" style={{background: '#fee2e2', color: '#e11d48'}}><i className="fa-solid fa-triangle-exclamation"></i></div>
            <span className="kpi-title" style={{color: '#e11d48'}}>Facturas<br/>atrasadas</span>
          </div>
        </div>
        <div className="kpi-body">
          <span className="kpi-value">{delayedCount}</span>
          <span className="kpi-trend trend-urgent">▲ Urgente</span>
        </div>
        <span className="kpi-sub">2 o más días</span>
      </div>
    </div>
  );
}

window.KpiCards = KpiCards;
