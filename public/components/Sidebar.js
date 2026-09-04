function Sidebar({ currentView, setCurrentView, alertCount, isOpen, onClose, currentUser, onLogout }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <button className="sidebar-close-btn" onClick={onClose} title="Cerrar menú">
          <i className="fa-solid fa-xmark"></i>
        </button>
        <div className="brand-title">
          <i className="fa-solid fa-cloud" style={{fontSize: '20px'}}></i> Alimentos
        </div>
        <div className="brand-title" style={{fontSize: '28px', marginTop: '-4px'}}>
          ENRIKO
        </div>
        <div className="brand-sub">Calidad que alimenta</div>
      </div>

      <div className="sidebar-menu">
        <div className={`menu-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => { setCurrentView('dashboard'); if(onClose) onClose(); }}>
          <i className="fa-solid fa-gauge-high"></i>
          <span>Dashboard</span>
        </div>
        <div className={`menu-item ${currentView === 'invoices' ? 'active' : ''}`} onClick={() => { setCurrentView('invoices'); if(onClose) onClose(); }}>
          <i className="fa-regular fa-file-lines"></i>
          <span>Facturas / Cotizaciones</span>
        </div>
        <div className={`menu-item ${currentView === 'suppliers' ? 'active' : ''}`} onClick={() => { setCurrentView('suppliers'); if(onClose) onClose(); }}>
          <i className="fa-solid fa-user-group"></i>
          <span>Proveedores</span>
        </div>
        <div className={`menu-item ${currentView === 'crm' ? 'active' : ''}`} onClick={() => { setCurrentView('crm'); if(onClose) onClose(); }}>
          <i className="fa-solid fa-handshake"></i>
          <span>CRM Cotizaciones</span>
        </div>
        <div className={`menu-item ${currentView === 'reports' ? 'active' : ''}`} onClick={() => { setCurrentView('reports'); if(onClose) onClose(); }}>
          <i className="fa-solid fa-chart-line"></i>
          <span>Reportes</span>
        </div>
        <div className={`menu-item ${currentView === 'alerts' ? 'active' : ''}`} onClick={() => { setCurrentView('alerts'); if(onClose) onClose(); }}>
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>Alertas</span>
          {alertCount > 0 && <span className="badge-count">{alertCount}</span>}
        </div>
        
        {/* Solo administradores y superadministradores ven gestión de usuarios */}
        <div className={`menu-item ${currentView === 'users' ? 'active' : ''}`} onClick={() => { setCurrentView('users'); if(onClose) onClose(); }}>
          <i className="fa-solid fa-users"></i>
          <span>Usuarios</span>
        </div>
        <div className={`menu-item ${currentView === 'settings' ? 'active' : ''}`} onClick={() => { setCurrentView('settings'); if(onClose) onClose(); }}>
          <i className="fa-solid fa-gear"></i>
          <span>Configuración</span>
        </div>

        <div className="menu-header">GESTIÓN</div>
        <div className={`menu-item ${currentView === 'folders' ? 'active' : ''}`} onClick={() => { setCurrentView('folders'); if(onClose) onClose(); }}>
          <i className="fa-regular fa-folder-open"></i>
          <span>Carpetas de documentos</span>
        </div>
        <div className={`menu-item ${currentView === 'history' ? 'active' : ''}`} onClick={() => { setCurrentView('history'); if(onClose) onClose(); }}>
          <i className="fa-solid fa-clock-rotate-left"></i>
          <span>Historial</span>
        </div>

        {/* Botón de Cerrar Sesión */}
        <div 
          className="menu-item" 
          onClick={onLogout} 
          style={{color: '#f43f5e', marginTop: '12px', borderTop: '1px solid rgba(225, 29, 72, 0.15)', paddingTop: '10px'}}
          title="Cerrar sesión actual"
        >
          <i className="fa-solid fa-right-from-bracket"></i>
          <span style={{fontWeight: 700}}>Cerrar Sesión</span>
        </div>
      </div>

      <div className="sidebar-footer-card">
        <div style={{fontSize: '20px', color: '#e11d48', marginBottom: '4px'}}>
          <i className="fa-solid fa-shield-halved"></i>
        </div>
        <p style={{fontSize: '11px', fontWeight: 700, margin: 0}}>
          {currentUser ? `${currentUser.name}` : 'Sesión Activa'}
        </p>
        <span style={{fontSize: '10px', color: '#e11d48', fontWeight: 800, textTransform: 'uppercase'}}>
          {currentUser ? `Rol: ${currentUser.role}` : ''}
        </span>
      </div>
      <div className="sidebar-ver">v1.0.0</div>
    </aside>
  );
}

window.Sidebar = Sidebar;