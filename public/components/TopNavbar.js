function TopNavbar({ selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, alertCount, onOpenAlerts, onOpenUsers, darkMode, onToggleDarkMode, onToggleSidebar, currentUser, onLogout }) {
  const allMonths = [
    'Todos', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const allYears = ['Todos', '2026', '2027', '2028', '2029', '2030'];

  const userInitials = currentUser && currentUser.name 
    ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'JR';

  const isSuper = currentUser?.role === 'superadmin';

  return (
    <header className="top-navbar">
      {/* SECCIÓN IZQUIERDA: MENÚ HAMBURGUESA & IDENTIDAD */}
      <div className="nav-left">
        <button 
          className="btn-hamburger" 
          onClick={onToggleSidebar} 
          title="Abrir menú de navegación"
          aria-label="Menú"
        >
          <i className="fa-solid fa-bars-staggered"></i>
        </button>

        <div className="app-icon-badge">
          <i className="fa-solid fa-file-invoice-dollar"></i>
        </div>

        <div className="header-titles">
          <h1>
            <span>Alimentos</span> <span className="brand-highlight">ENRIKO</span>
          </h1>
          <p>Control Documental & Facturas</p>
        </div>
      </div>

      {/* SECCIÓN DERECHA: FILTROS RÁPIDOS, MODO OSCURO, ALERTAS Y PERFIL */}
      <div className="nav-right">
        {/* SELECTOR DE MESES */}
        <div className="selector-group hide-on-compact" title="Filtrar por Mes">
          <i className="fa-regular fa-calendar-days selector-icon"></i>
          <select className="nav-select" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
            {allMonths.map(m => (
              <option key={m} value={m}>{m === 'Todos' ? 'Mes: Todos' : m}</option>
            ))}
          </select>
        </div>

        {/* SELECTOR DE AÑOS */}
        <div className="selector-group hide-on-compact" title="Filtrar por Año">
          <i className="fa-regular fa-clock selector-icon"></i>
          <select className="nav-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            {allYears.map(y => (
              <option key={y} value={y}>{y === 'Todos' ? 'Año: Todos' : y}</option>
            ))}
          </select>
        </div>

        {/* BOTÓN MODO OSCURO */}
        <button 
          className="btn-header-action" 
          onClick={onToggleDarkMode} 
          title={darkMode ? "Modo Claro" : "Modo Oscuro"}
          aria-label="Cambiar tema"
        >
          <i className={darkMode ? "fa-solid fa-sun icon-sun" : "fa-solid fa-moon icon-moon"}></i>
        </button>

        {/* BOTÓN DE ALERTAS */}
        <button 
          className="btn-header-action bell-action" 
          onClick={onOpenAlerts} 
          title="Ver alertas del sistema"
          aria-label="Alertas"
        >
          <i className="fa-regular fa-bell"></i>
          {alertCount > 0 && <span className="bell-badge">{alertCount}</span>}
        </button>

        {/* PERFIL DEL USUARIO */}
        <div 
          className="user-profile-badge" 
          onClick={onOpenUsers} 
          title={`Conectado como: ${currentUser?.name || 'Administrador'} (${currentUser?.role || 'admin'})`}
        >
          <div className="user-avatar" style={{
            background: isSuper ? 'linear-gradient(135deg, #e11d48, #9f1239)' : 'linear-gradient(135deg, #e11d48, #be123c)'
          }}>
            {userInitials}
          </div>
          <div className="user-info">
            <div className="user-name">{currentUser ? currentUser.name : 'Juan Rodríguez'}</div>
            <div className="user-role">
              {isSuper ? '👑 SUPERADMIN' : '🛡️ ADMIN'}
            </div>
          </div>
        </div>

        {/* BOTÓN CERRAR SESIÓN */}
        <button 
          className="btn-header-action logout-action" 
          onClick={onLogout} 
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
      </div>
    </header>
  );
}

window.TopNavbar = TopNavbar;