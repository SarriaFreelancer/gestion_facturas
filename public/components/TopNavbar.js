function TopNavbar({ selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, alertCount, onOpenAlerts, onOpenUsers, darkMode, onToggleDarkMode }) {
  return (
    <header className="top-navbar">
      <div className="nav-left">
        <div className="app-icon-badge">
          <i className="fa-regular fa-file-lines"></i>
        </div>
        <div className="header-titles">
          <h1>Alimentos Enriko — Control de Facturas & Cotizaciones</h1>
          <p>Sistema de gestión documental</p>
        </div>
      </div>

      <div className="nav-right">
        {/* BOTON MODO OSCURO */}
        <button 
          className="btn-dark-toggle" 
          onClick={onToggleDarkMode} 
          title={darkMode ? "Activar Modo Claro" : "Activar Modo Oscuro"}
        >
          <i className={darkMode ? "fa-solid fa-sun" : "fa-solid fa-moon"} style={{color: darkMode ? '#f59e0b' : '#64748b'}}></i>
        </button>

        <div className="selector-group">
          <span className="selector-label">Mes:</span>
          <select className="nav-select" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
            <option value="Agosto">Agosto</option>
            <option value="Septiembre">Septiembre</option>
            <option value="Octubre">Octubre</option>
          </select>
        </div>

        <div className="selector-group">
          <span className="selector-label">Año:</span>
          <select className="nav-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>

        <div className="bell-btn" onClick={onOpenAlerts}>
          <i className="fa-regular fa-bell"></i>
          {alertCount > 0 && <span className="bell-badge">{alertCount}</span>}
        </div>

        <div className="user-profile-badge" onClick={onOpenUsers}>
          <div className="user-avatar">JR</div>
          <div className="user-info">
            <div className="user-name">Juan Rodríguez</div>
            <div className="user-role">Administrador</div>
          </div>
        </div>
      </div>
    </header>
  );
}

window.TopNavbar = TopNavbar;
