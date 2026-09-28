'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Calendar, 
  Sun, 
  Moon, 
  Bell, 
  LogOut, 
  ChevronDown,
  Shield,
  UserCheck,
  Building2,
  Check
} from 'lucide-react';
import { MonthCalendarPicker } from './MonthCalendarPicker';
import { User } from '../app/types';

interface TopNavbarProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  onSelectMonthYear?: (month: string, year: string) => void;
  serverDateInfo?: any;
  alertCount?: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleSidebar: () => void;
  currentUser?: User;
  users?: User[];
  onSwitchUser?: (user: User) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  onSelectMonthYear,
  serverDateInfo,
  alertCount = 0,
  darkMode,
  onToggleDarkMode,
  onToggleSidebar,
  currentUser,
  users = [],
  onSwitchUser
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar selector de usuario al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMonthYearChange = (month: string, year: string) => {
    if (onSelectMonthYear) {
      onSelectMonthYear(month, year);
    } else {
      setSelectedMonth(month);
      setSelectedYear(year);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'AE';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

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
            <span className="text-slate-300 dark:text-zinc-600 hidden sm:inline">|</span>
            <span className="text-sm font-bold text-slate-700 dark:text-zinc-200 hidden sm:inline">Control de Facturas & Cotizaciones</span>
          </div>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 mt-1">
            Alimentos Enriko S.A.S. — Sistema Corporativo
          </p>
        </div>
      </div>

      {/* SECCIÓN DERECHA: SELECTOR CALENDARIO, TEMA, ALERTAS Y PERFIL */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* SELECTOR CALENDARIO UNIFICADO (MES Y AÑO) */}
        <MonthCalendarPicker 
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onSelectMonthYear={handleMonthYearChange}
          serverDateInfo={serverDateInfo}
        />

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

        {/* SELECTOR / CHIP DE USUARIO ACTIVO (CON CONMUTADOR DE ROL) */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setIsUserMenuOpen(prev => !prev)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 cursor-pointer hover:border-red-400 hover:shadow-sm transition-all"
            title="Cambiar de usuario o ver perfil"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-red-700 text-white font-black text-xs flex items-center justify-center shadow-xs ring-1 ring-red-200 dark:ring-red-900">
              {getInitials(currentUser?.name)}
            </div>
            <div className="hidden lg:flex flex-col text-left mr-1">
              <span className="text-xs font-black text-slate-800 dark:text-zinc-200 leading-tight">
                {currentUser?.name || 'Super Administrador'}
              </span>
              <span className="text-[9px] font-extrabold text-red-600 dark:text-red-400 uppercase tracking-wider">
                {currentUser?.role === 'superadmin' ? 'SUPERADMIN' : `ADMIN • ${currentUser?.area || 'Área'}`}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hover:text-red-600 transition-colors" />
          </button>

          {/* MENÚ FLOTANTE DE CAMBIO DE USUARIO */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-12 z-50 w-72 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-3 animate-in fade-in duration-150 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Usuario en Sesión (Simulador de Accesos)
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white text-xs block truncate mt-0.5">
                  {currentUser?.name}
                </span>
                <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">
                  {currentUser?.role === 'superadmin' ? 'Acceso Global Total' : `Restringido a: ${currentUser?.area}`}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 px-3 uppercase tracking-wider">
                  Cambiar usuario para probar permisos:
                </span>
                {users.map(u => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        if (onSwitchUser) onSwitchUser(u);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="block font-bold text-xs truncate">{u.name}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {u.role === 'superadmin' ? 'Superadmin' : `Admin ${u.area}`}
                        </span>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 text-red-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
