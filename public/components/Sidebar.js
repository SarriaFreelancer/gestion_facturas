// public/components/Sidebar.js
// Navegación Lateral Alimentos Enriko - Fiel a la maqueta de referencia con borde rojo 3px y banner inferior

function Sidebar({ currentView, setCurrentView, alertCount, isOpen, onClose, isCollapsed, onToggleCollapse, currentUser, onLogout }) {
  const isSuper = currentUser?.role === 'superadmin';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      {/* BRAND LOGO OFICIAL ENRIKO */}
      <div 
        className="sidebar-logo" 
        style={{ 
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          color: '#ffffff',
          padding: isCollapsed ? '16px 8px' : '20px 16px 18px',
          borderBottom: 'none',
          boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)'
        }}
      >
        <div className="flex flex-col items-center justify-center text-center w-full overflow-hidden cursor-pointer" onClick={() => setCurrentView('dashboard')}>
          {!isCollapsed ? (
            <div className="flex flex-col items-center leading-none">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <Icon name="cloud" size={20} className="text-white" />
                </span>
                <span className="text-sm font-black text-white tracking-wide uppercase">Alimentos</span>
              </div>
              <span className="text-2xl font-black text-white tracking-tight drop-shadow-sm">ENRIKO</span>
              <span className="text-[8.5px] font-black text-white/90 tracking-widest uppercase italic mt-1 bg-black/15 px-2.5 py-0.5 rounded-full">
                Calidad que alimenta
              </span>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Icon name="cloud" size={20} className="text-white" />
            </div>
          )}
        </div>

        {/* BOTÓN COLAPSAR ESCRITORIO / CERRAR MÓVIL */}
        <div className="absolute right-2 top-3 flex items-center gap-1">
          <button 
            className="sidebar-collapse-toggle hidden lg:flex w-6 h-6 rounded text-white/80 hover:text-white items-center justify-center transition-all bg-white/10 hover:bg-white/20"
            onClick={onToggleCollapse} 
            title={isCollapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
          >
            <Icon name="menu" size={12} />
          </button>
          <button 
            className="sidebar-close-btn lg:hidden w-6 h-6 rounded text-white/80 hover:text-white flex items-center justify-center bg-white/10" 
            onClick={onClose} 
            title="Cerrar menú"
          >
            <Icon name="close" size={12} />
          </button>
        </div>
      </div>

      {/* MENÚ DE OPCIONES ESTILO REFERENCIA */}
      <div className="sidebar-menu">
        <div 
          className={`menu-item ${currentView === 'dashboard' ? 'active' : ''}`} 
          onClick={() => { setCurrentView('dashboard'); if(onClose) onClose(); }}
          title={isCollapsed ? "Dashboard" : undefined}
        >
          <Icon name="dashboard" size={18} />
          {!isCollapsed && <span>Dashboard</span>}
        </div>
        <div 
          className={`menu-item ${currentView === 'invoices' ? 'active' : ''}`} 
          onClick={() => { setCurrentView('invoices'); if(onClose) onClose(); }}
          title={isCollapsed ? "Facturas / Cotizaciones" : undefined}
        >
          <Icon name="invoices" size={18} />
          {!isCollapsed && <span>Facturas / Cotizaciones</span>}
        </div>
        <div 
          className={`menu-item ${currentView === 'suppliers' ? 'active' : ''}`} 
          onClick={() => { setCurrentView('suppliers'); if(onClose) onClose(); }}
          title={isCollapsed ? "Proveedores" : undefined}
        >
          <Icon name="suppliers" size={18} />
          {!isCollapsed && <span>Proveedores</span>}
        </div>
        <div 
          className={`menu-item ${currentView === 'reports' ? 'active' : ''}`} 
          onClick={() => { setCurrentView('reports'); if(onClose) onClose(); }}
          title={isCollapsed ? "Reportes" : undefined}
        >
          <Icon name="reports" size={18} />
          {!isCollapsed && <span>Reportes</span>}
        </div>
        <div 
          className={`menu-item ${currentView === 'alerts' ? 'active' : ''}`} 
          onClick={() => { setCurrentView('alerts'); if(onClose) onClose(); }}
          title={isCollapsed ? `Alertas (${alertCount})` : undefined}
        >
          <Icon name="alerts" size={18} />
          {!isCollapsed && <span>Alertas</span>}
          {alertCount > 0 && <span className="badge-count bg-red-600 text-white font-bold px-1.5 py-0.5 rounded-full text-[10px] ml-auto">{alertCount}</span>}
        </div>
        <div 
          className={`menu-item ${currentView === 'users' ? 'active' : ''}`} 
          onClick={() => { setCurrentView('users'); if(onClose) onClose(); }}
          title={isCollapsed ? "Usuarios" : undefined}
        >
          <Icon name="users" size={18} />
          {!isCollapsed && <span>Usuarios</span>}
        </div>
        <div 
          className={`menu-item ${currentView === 'settings' ? 'active' : ''}`} 
          onClick={() => { setCurrentView('settings'); if(onClose) onClose(); }}
          title={isCollapsed ? "Configuración" : undefined}
        >
          <Icon name="settings" size={18} />
          {!isCollapsed && <span>Configuración</span>}
        </div>

        {!isCollapsed && <div className="menu-header text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mt-4 px-3">GESTIÓN & TI</div>}
        <div 
          className={`menu-item ${currentView === 'inventory' ? 'active' : ''}`} 
          onClick={() => { setCurrentView('inventory'); if(onClose) onClose(); }}
          title={isCollapsed ? "Inventario TI" : undefined}
        >
          <Icon name="inventory" size={18} />
          {!isCollapsed && <span>Inventario TI</span>}
        </div>
        <div 
          className={`menu-item ${currentView === 'budgets' ? 'active' : ''}`} 
          onClick={() => { setCurrentView('budgets'); if(onClose) onClose(); }}
          title={isCollapsed ? "Presupuestos TI" : undefined}
        >
          <Icon name="budgets" size={18} />
          {!isCollapsed && <span>Presupuestos TI</span>}
        </div>
        <div 
          className={`menu-item ${currentView === 'areas' ? 'active' : ''}`} 
          onClick={() => { setCurrentView('areas'); if(onClose) onClose(); }}
          title={isCollapsed ? "Áreas & Directores" : undefined}
        >
          <Icon name="areas" size={18} />
          {!isCollapsed && <span>Áreas & Directores</span>}
        </div>
        <div 
          className={`menu-item ${currentView === 'crm' ? 'active' : ''}`} 
          onClick={() => { setCurrentView('crm'); if(onClose) onClose(); }}
          title={isCollapsed ? "CRM Cotizaciones" : undefined}
        >
          <Icon name="crm" size={18} />
          {!isCollapsed && <span>CRM Cotizaciones</span>}
        </div>
        <div 
          className={`menu-item ${currentView === 'folders' ? 'active' : ''}`} 
          onClick={() => { setCurrentView('folders'); if(onClose) onClose(); }}
          title={isCollapsed ? "Carpetas de documentos" : undefined}
        >
          <Icon name="folders" size={18} />
          {!isCollapsed && <span>Carpetas de documentos</span>}
        </div>
        <div 
          className={`menu-item ${currentView === 'history' ? 'active' : ''}`} 
          onClick={() => { setCurrentView('history'); if(onClose) onClose(); }}
          title={isCollapsed ? "Historial" : undefined}
        >
          <Icon name="history" size={18} />
          {!isCollapsed && <span>Historial</span>}
        </div>

        {/* CERRAR SESIÓN */}
        <div 
          className="menu-item text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800"
          onClick={onLogout} 
          title="Cerrar sesión"
        >
          <Icon name="logout" size={18} className="text-red-600" />
          {!isCollapsed && <span className="font-extrabold text-red-600">Cerrar Sesión</span>}
        </div>
      </div>

      {/* BANNER INFERIOR CON NUBE Y LEMAS ENRIKO */}
      {!isCollapsed && (
        <div className="px-3 pb-3 pt-1">
          <div 
            className="rounded-2xl p-3 text-center border relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #fff1f2 100%)',
              borderColor: '#fecdd3',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.06)'
            }}
          >
            {/* LOGO NUBE CENTRADA */}
            <div className="flex items-center justify-center py-1">
              <span className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shadow-xs border border-red-100">
                <Icon name="cloud" size={18} className="text-red-600" />
              </span>
            </div>

            <div className="relative z-10 mt-1">
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-snug">
                Control, orden y eficiencia para una mejor gestión
              </p>
            </div>
          </div>
          <div className="text-[9px] font-mono text-center text-slate-400 mt-1.5">v1.0.0</div>
        </div>
      )}
    </aside>
  );
}

window.Sidebar = Sidebar;