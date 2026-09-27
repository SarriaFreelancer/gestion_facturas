'use client';

import React from 'react';
import { 
  Menu, 
  Calendar, 
  Sun, 
  Moon, 
  Bell, 
  LogOut, 
  ChevronDown 
} from 'lucide-react';

interface TopNavbarProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  alertCount?: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleSidebar: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  alertCount = 0,
  darkMode,
  onToggleDarkMode,
  onToggleSidebar
}) => {
  const allMonths = [
    'Todos', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const allYears = ['Todos', '2026', '2027', '2028', '2029', '2030'];

  return (
    <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 px-4 sm:px-7 py-3 flex items-center justify-between sticky top-0 z-30">
      {/* SECCIÓN IZQUIERDA: IDENTIDAD & TOGGLE MENÚ */}
      <div className="flex items-center gap-3">
        <button 
          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all border border-slate-200 dark:border-zinc-700 shadow-2xs"
          onClick={onToggleSidebar} 
          title="Contraer / Expandir Menú Lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2.5 leading-none">
            <span className="text-base font-black text-slate-900 dark:text-white">Alimentos Enriko</span>
            <span className="text-slate-300 dark:text-zinc-600">|</span>
            <span className="text-sm font-bold text-slate-700 dark:text-zinc-200">Control de Facturas & Cotizaciones</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 mt-1">
            Plataforma Next.js + FastAPI + MySQL
          </p>
        </div>
      </div>

      {/* SECCIÓN DERECHA: SELECTORES, ALERTAS Y PERFIL */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* SELECTOR DE MES */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100/80 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700/60 text-xs">
          <Calendar className="w-3.5 h-3.5 text-red-500" />
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
          <Calendar className="w-3.5 h-3.5 text-red-500" />
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
          {darkMode ? (
            <Sun className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 dark:text-zinc-300 group-hover:text-red-600 group-hover:scale-110 transition-all" />
          )}
        </button>

        {/* BOTÓN ALERTAS */}
        <button 
          className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-all shadow-2xs relative cursor-pointer group"
          title="Alertas del sistema"
        >
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {alertCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-zinc-900 shadow-sm animate-pulse">
              {alertCount}
            </span>
          )}
        </button>

        {/* CHIP DE USUARIO CIRCULAR ROJO "SA" */}
        <div 
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 cursor-pointer hover:border-red-400 hover:shadow-sm transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-red-700 text-white font-black text-xs flex items-center justify-center shadow-xs ring-1 ring-red-200 dark:ring-red-900">
            SA
          </div>
          <div className="hidden lg:flex flex-col text-left mr-1">
            <span className="text-xs font-black text-slate-800 dark:text-zinc-200 leading-tight">
              David Sarria
            </span>
            <span className="text-[9px] font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider">
              SUPERADMIN
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hover:text-red-600 transition-colors" />
        </div>

        {/* CERRAR SESIÓN */}
        <button 
          className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-50 to-red-100/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 flex items-center justify-center hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 hover:text-white hover:border-red-600 transition-all shadow-2xs cursor-pointer group"
          title="Cerrar Sesión"
        >
          <LogOut className="w-4 h-4 text-red-600 group-hover:text-white transition-colors group-hover:scale-110" />
        </button>
      </div>
    </header>
  );
};
