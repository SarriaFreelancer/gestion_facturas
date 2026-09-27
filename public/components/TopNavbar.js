// public/components/TopNavbar.js
// Barra de Navegación Superior con Diseño Glassmorphic y Tailwind

function TopNavbar({ selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, alertCount, onOpenAlerts, onOpenUsers, darkMode, onToggleDarkMode, onToggleSidebar, currentUser, onLogout }) {
  const allMonths = [
    'Todos', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const allYears = ['Todos', '2026', '2027', '2028', '2029', '2030'];

  const userInitials = currentUser && currentUser.name 
    ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'AE';

  const isSuper = currentUser?.role === 'superadmin';

  return (
    <header className="top-navbar bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 px-4 sm:px-7 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* SECCIÓN IZQUIERDA: IDENTIDAD & TOGGLE MENÚ */}
      <div className="flex items-center gap-3">
        <button 
          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all border border-slate-200 dark:border-zinc-700"
          onClick={onToggleSidebar} 
          title="Contraer / Expandir Menú Lateral"
        >
          <Icon name="menu" size={18} />
        </button>

        <div>
          <div className="flex items-center gap-2.5 leading-none">
            <span className="text-base font-black text-slate-900 dark:text-white">Alimentos Enriko</span>
            <span className="text-slate-300 dark:text-zinc-600">|</span>
            <span className="text-sm font-bold text-slate-700 dark:text-zinc-200">Control de Facturas & Cotizaciones</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 mt-1">Sistema de gestión documental</p>
        </div>
      </div>

      {/* SECCIÓN DERECHA: SELECTORES, ALERTAS Y PERFIL */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* SELECTOR DE MES */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100/80 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700/60 text-xs">
          <Icon name="calendar" size={14} className="text-red-500" />
          <span className="font-bold text-slate-500 dark:text-zinc-400 text-[11px] uppercase">Mes:</span>
          <select 
            className="bg-transparent font-bold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer"
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value)}
          >
            {allMonths.map(m => (
              <option key={m} value={m} className="dark:bg-zinc-900 text-slate-900 dark:text-white">{m}</option>
            ))}
          </select>
        </div>

        {/* SELECTOR DE AÑO */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100/80 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700/60 text-xs">
          <Icon name="calendar" size={14} className="text-red-500" />
          <span className="font-bold text-slate-500 dark:text-zinc-400 text-[11px] uppercase">Año:</span>
          <select 
            className="bg-transparent font-bold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer"
            value={selectedYear} 
            onChange={e => setSelectedYear(e.target.value)}
          >
            {allYears.map(y => (
              <option key={y} value={y} className="dark:bg-zinc-900 text-slate-900 dark:text-white">{y}</option>
            ))}
          </select>
        </div>

        {/* TOGGLE MODO OSCURO */}
        <button 
          onClick={onToggleDarkMode} 
          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 text-slate-600 dark:text-zinc-300 flex items-center justify-center hover:text-red-600 transition-colors"
          title={darkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
        >
          {darkMode ? <Icon name="sun" size={18} className="text-amber-400" /> : <Icon name="moon" size={18} className="text-slate-600" />}
        </button>

        {/* BOTÓN ALERTAS */}
        <button 
          onClick={onOpenAlerts} 
          className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 text-slate-600 dark:text-zinc-300 flex items-center justify-center hover:text-red-600 transition-colors relative"
          title="Alertas de vencimiento"
        >
          <Icon name="bell" size={18} />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
              {alertCount}
            </span>
          )}
        </button>

        {/* CHIP DE USUARIO (CIRCULAR ROJO "SA" SEGÚN MOCKUP) */}
        <div 
          onClick={onOpenUsers}
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-all"
          title="Gestión de usuario"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-red-700 text-white font-black text-xs flex items-center justify-center shadow-sm">
            {currentUser?.initials || userInitials || 'SA'}
          </div>
          <Icon name="arrow-down" size={12} className="text-slate-500 hover:text-slate-700" />
        </div>

        {/* CERRAR SESIÓN */}
        <button 
          onClick={onLogout}
          className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
          title="Cerrar Sesión"
        >
          <Icon name="logout" size={16} className="text-red-600" />
        </button>
      </div>
    </header>
  );
}

window.TopNavbar = TopNavbar;