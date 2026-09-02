function Sidebar({ currentView, setCurrentView, alertCount }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="brand-title">
          <i className="fa-solid fa-cloud" style={{fontSize: '20px'}}></i> Alimentos
        </div>
        <div className="brand-title" style={{fontSize: '28px', marginTop: '-4px'}}>
          ENRIKO
        </div>
        <div className="brand-sub">Calidad que alimenta</div>
      </div>

      <div className="sidebar-menu">
        <div className={`menu-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
          <i className="fa-solid fa-gauge-high"></i>
          <span>Dashboard</span>
        </div>
        <div className={`menu-item ${currentView === 'invoices' ? 'active' : ''}`} onClick={() => setCurrentView('invoices')}>
          <i className="fa-regular fa-file-lines"></i>
          <span>Facturas / Cotizaciones</span>
        </div>
        <div className={`menu-item ${currentView === 'suppliers' ? 'active' : ''}`} onClick={() => setCurrentView('suppliers')}>
          <i className="fa-solid fa-user-group"></i>
          <span>Proveedores</span>
        </div>
        <div className={`menu-item ${currentView === 'reports' ? 'active' : ''}`} onClick={() => setCurrentView('reports')}>
          <i className="fa-solid fa-chart-line"></i>
          <span>Reportes</span>
        </div>
        <div className={`menu-item ${currentView === 'alerts' ? 'active' : ''}`} onClick={() => setCurrentView('alerts')}>
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>Alertas</span>
          {alertCount > 0 && <span className="badge-count">{alertCount}</span>}
        </div>
        <div className={`menu-item ${currentView === 'users' ? 'active' : ''}`} onClick={() => setCurrentView('users')}>
          <i className="fa-solid fa-users"></i>
          <span>Usuarios</span>
        </div>
        <div className={`menu-item ${currentView === 'settings' ? 'active' : ''}`} onClick={() => setCurrentView('settings')}>
          <i className="fa-solid fa-gear"></i>
          <span>Configuración</span>
        </div>

        <div className="menu-header">GESTIÓN</div>
        <div className={`menu-item ${currentView === 'folders' ? 'active' : ''}`} onClick={() => setCurrentView('folders')}>
          <i className="fa-regular fa-folder-open"></i>
          <span>Carpetas de documentos</span>
        </div>
        <div className={`menu-item ${currentView === 'history' ? 'active' : ''}`} onClick={() => setCurrentView('history')}>
          <i className="fa-solid fa-clock-rotate-left"></i>
          <span>Historial</span>
        </div>
      </div>

      <div className="sidebar-footer-card">
        <div style={{fontSize: '24px', color: '#e11d48', marginBottom: '4px'}}>
          <i className="fa-solid fa-truck-fast"></i>
        </div>
        <p>Control, orden y eficiencia para una mejor gestión</p>
      </div>
      <div className="sidebar-ver">v1.0.0</div>
    </aside>
  );
}

window.Sidebar = Sidebar;
