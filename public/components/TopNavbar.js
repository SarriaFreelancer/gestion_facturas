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
          className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-all shadow-2xs cursor-pointer group"
          title={darkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
        >
          {darkMode ? <Icon name="sun" size={20} className="text-amber-400 group-hover:scale-110 transition-transform" /> : <Icon name="moon" size={20} className="text-slate-600 dark:text-zinc-300 group-hover:text-red-600 group-hover:scale-110 transition-all" />}
        </button>

        {/* BOTÓN ALERTAS */}
        <button 
          onClick={onOpenAlerts} 
          className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-all shadow-2xs relative cursor-pointer group"
          title="Alertas de vencimiento"
        >
          <Icon name="bell" size={20} className="group-hover:scale-110 transition-transform" />
          {alertCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-zinc-900 shadow-sm animate-pulse">
              {alertCount}
            </span>
          )}
        </button>

        {/* CHIP DE USUARIO (CIRCULAR ROJO "SA" SEGÚN MOCKUP) */}
        <div 
          onClick={onOpenUsers}
          className="flex items-center gap-2 px-2 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 cursor-pointer hover:border-red-400 hover:shadow-sm transition-all"
          title="Gestión de usuario"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-red-700 text-white font-black text-xs flex items-center justify-center shadow-xs ring-1 ring-red-200 dark:ring-red-900">
            {currentUser?.initials || userInitials || 'SA'}
          </div>
          <div className="hidden lg:flex flex-col text-left mr-1">
            <span className="text-xs font-black text-slate-800 dark:text-zinc-200 leading-tight">
              {currentUser ? currentUser.name : 'Super Admin'}
            </span>
            <span className="text-[9px] font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider">
              {isSuper ? 'SUPERADMIN' : 'ADMINISTRADOR'}
            </span>
          </div>
          <Icon name="arrow-down" size={13} className="text-slate-400 hover:text-red-600 transition-colors" />
        </div>

        {/* CERRAR SESIÓN */}
        <button 
          onClick={onLogout}
          className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-50 to-red-100/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 flex items-center justify-center hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 hover:text-white hover:border-red-600 transition-all shadow-2xs cursor-pointer group"
          title="Cerrar Sesión"
        >
          <Icon name="logout" size={18} className="text-red-600 group-hover:text-white transition-colors group-hover:scale-110" />
        </button>
      </div>
    </header>
  );
}

window.TopNavbar = TopNavbar;