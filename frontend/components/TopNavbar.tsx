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
  Check,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Layers,
  Inbox,
  PenTool,
  FileSpreadsheet
} from 'lucide-react';
import { MonthCalendarPicker } from './MonthCalendarPicker';
import { SessionTimerBadge } from './SessionTimerBadge';
import { User, DashboardMetrics } from '../app/types';
import { api } from '../lib/api';
import { notifySuccess, notifyError } from '../lib/alerts';

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
  onToggleCollapse?: () => void;
  isCollapsed?: boolean;
  currentUser?: User;
  users?: User[];
  onSwitchUser?: (user: User) => void;
  onLogout?: () => void;
  sessionRemainingSeconds?: number;
  sessionTotalSeconds?: number;
  onExtendSession?: () => void;
  metrics?: DashboardMetrics | null;
  onNavigateView?: (view: string) => void;
  onRefreshMetrics?: () => void;
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
  onToggleCollapse,
  isCollapsed,
  currentUser,
  users = [],
  onSwitchUser,
  onLogout,
  sessionRemainingSeconds,
  sessionTotalSeconds,
  onExtendSession,
  metrics,
  onNavigateView,
  onRefreshMetrics
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAlertsMenuOpen, setIsAlertsMenuOpen] = useState(false);
  const [isScanningFacture, setIsScanningFacture] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const alertsMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar selector de usuario o alertas al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (alertsMenuRef.current && !alertsMenuRef.current.contains(event.target as Node)) {
        setIsAlertsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTriggerFactureSync = async () => {
    try {
      setIsScanningFacture(true);
      const res = await api.autoMatchRecurrentInvoices();
      notifySuccess('Escaneo Facture Exitoso', `Vinculadas: ${res.linkedCount || 0} facturas recurrentes y plantillas SAP preparadas.`);
      if (onRefreshMetrics) onRefreshMetrics();
    } catch (err: any) {
      notifyError('Error en escaneo Facture', err.message);
    } finally {
      setIsScanningFacture(false);
    }
  };

  const factureReady = metrics?.factureReadyAlerts || [];
  const pendingFacture = metrics?.pendingFactureAlerts || [];
  const computedAlertCount = alertCount > 0 ? alertCount : (metrics?.totalAlertsCount || factureReady.length + pendingFacture.length);

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

  const handleToggleMenu = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      if (onToggleCollapse) {
        onToggleCollapse();
      } else {
        onToggleSidebar();
      }
    } else {
      onToggleSidebar();
    }
  };

  return (
    <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 px-3 sm:px-7 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-30">
      {/* SECCIÓN IZQUIERDA: IDENTIDAD & TOGGLE MENÚ */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button 
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all border border-slate-200 dark:border-zinc-700 shadow-2xs flex-shrink-0"
          onClick={handleToggleMenu} 
          title={isCollapsed ? "Expandir Menú Lateral" : "Contraer Menú Lateral"}
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2.5 leading-none">
            <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">Alimentos Enriko</span>
            <span className="text-slate-300 dark:text-zinc-600 hidden sm:inline">|</span>
            <span className="text-sm font-bold text-slate-700 dark:text-zinc-200 hidden md:inline">Control de Facturas & Cotizaciones</span>
          </div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-zinc-500 mt-0.5 sm:mt-1 truncate hidden xs:block">
            Alimentos Enriko S.A.S. — Sistema Corporativo
          </p>
        </div>
      </div>

      {/* SECCIÓN DERECHA: SELECTOR CALENDARIO, TEMA, ALERTAS, PERFIL Y CERRAR SESIÓN */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
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
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 flex items-center justify-center hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30 transition-all shadow-2xs cursor-pointer group flex-shrink-0"
          title={darkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-zinc-300 group-hover:text-red-600 group-hover:scale-110 transition-all" />
          )}
        </button>

        {/* BOTÓN ALERTAS CON MENÚ DROPDOWN */}
        <div className="relative" ref={alertsMenuRef}>
          <button 
            onClick={() => setIsAlertsMenuOpen(prev => !prev)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-all shadow-2xs relative cursor-pointer group flex-shrink-0 ${
              isAlertsMenuOpen
                ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-600'
                : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30'
            }`}
            title="Centro de Alertas del Sistema"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            {computedAlertCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 px-1 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full text-[9px] sm:text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-zinc-900 shadow-sm animate-pulse">
                {computedAlertCount}
              </span>
            )}
          </button>

          {/* PANEL FLOTANTE DE ALERTAS */}
          {isAlertsMenuOpen && (
            <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-12 z-50 w-[calc(100vw-1rem)] sm:w-[460px] max-w-[95vw] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-4 animate-in fade-in zoom-in-95 duration-150 text-xs">
              
              {/* ENCABEZADO */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center font-bold">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Centro de Alertas & Notificaciones
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {selectedMonth} {selectedYear} • {computedAlertCount} pendientes
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerFactureSync}
                  disabled={isScanningFacture}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  title="Escanear facturas recibidas en Facture y vincularlas automáticamente"
                >
                  <RefreshCw className={`w-3 h-3 ${isScanningFacture ? 'animate-spin text-red-600' : ''}`} />
                  <span>{isScanningFacture ? 'Escaneando...' : 'Escanear Facture'}</span>
                </button>
              </div>

              {/* LISTA DE ALERTAS CON SCROLL */}
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                
                {/* SECCIÓN 1: FACTURAS QUE YA LLEGARON A FACTURE (PRIORIDAD ALTA) */}
                {factureReady.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5 px-1">
                      <span className="text-[10.5px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Listas en Facture & SAP ({factureReady.length})</span>
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                        Requieren Acuse, Aceptación, Firma y SAP
                      </span>
                    </div>

                    <div className="space-y-2">
                      {factureReady.map((alert: any) => (
                        <div 
                          key={alert.id || alert.invoiceNumber}
                          className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-blue-50/40 dark:from-emerald-950/30 dark:to-zinc-800/80 border border-emerald-200/80 dark:border-emerald-800/50 shadow-2xs space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono font-black text-slate-900 dark:text-white text-xs">
                                  {alert.invoiceNumber}
                                </span>
                                <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-[9px]">
                                  ✓ En Facture
                                </span>
                                {alert.area && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 font-bold text-[9px]">
                                    {alert.area}
                                  </span>
                                )}
                              </div>
                              <span className="block font-bold text-slate-800 dark:text-zinc-200 text-xs truncate mt-0.5">
                                {alert.supplierName}
                              </span>
                            </div>

                            {alert.amount > 0 && (
                              <span className="font-mono font-black text-slate-900 dark:text-white text-xs whitespace-nowrap">
                                ${new Intl.NumberFormat('es-CO').format(alert.amount)}
                              </span>
                            )}
                          </div>

                          {/* MENSAJE DE ESTADOS Y TAREAS PENDIENTES */}
                          <div className="p-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-slate-200/60 dark:border-zinc-700/60 text-[10.5px] text-slate-700 dark:text-zinc-300 leading-snug space-y-1">
                            <p className="font-semibold text-emerald-900 dark:text-emerald-300">
                              ✓ Factura vinculada automáticamente desde Facture.
                            </p>
                            <p className="text-slate-600 dark:text-zinc-400">
                              Lista para proceder con: <strong className="text-slate-900 dark:text-white">Acuse DIAN, Aceptación y Recibido, Firma</strong> y <strong className="text-purple-600 dark:text-purple-400">revisión de plantilla SAP pre-llenada</strong>.
                            </p>
                          </div>

                          {/* ACCIONES DIRECTAS */}
                          <div className="flex items-center justify-end gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setIsAlertsMenuOpen(false);
                                if (onNavigateView) onNavigateView('facture');
                              }}
                              className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 font-black text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Inbox className="w-3 h-3" />
                              <span>Ir a Facture</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setIsAlertsMenuOpen(false);
                                if (onNavigateView) onNavigateView('sap_presolicitudes');
                              }}
                              className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <FileSpreadsheet className="w-3 h-3" />
                              <span>Revisar Plantilla SAP</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setIsAlertsMenuOpen(false);
                                if (onNavigateView) onNavigateView('invoices');
                              }}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Facturas</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECCIÓN 2: FACTURAS RECURRENTES PENDIENTES POR LLEGAR A FACTURE */}
                {pendingFacture.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5 px-1 pt-1">
                      <span className="text-[10.5px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Pendientes en Facture ({pendingFacture.length})</span>
                      </span>
                      <span className="text-[9px] font-bold text-slate-400">
                        Esperadas según historial
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {pendingFacture.map((alert: any) => (
                        <div 
                          key={alert.id || alert.supplierName}
                          className="p-2.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="font-extrabold text-slate-900 dark:text-white block text-xs truncate">
                              {alert.supplierName}
                            </span>
                            <span className="text-[10px] text-amber-800 dark:text-amber-300 block truncate">
                              {alert.service || 'Factura mensual esperada'} • {alert.area || 'Tecnología'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {alert.amount > 0 && (
                              <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                                ~${new Intl.NumberFormat('es-CO').format(alert.amount)}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setIsAlertsMenuOpen(false);
                                if (onNavigateView) onNavigateView('facture');
                              }}
                              className="px-2 py-1 rounded-lg bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold text-[9.5px] hover:bg-amber-300 transition-all cursor-pointer"
                            >
                              Buscar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* VACÍO: NO HAY ALERTAS */}
                {factureReady.length === 0 && pendingFacture.length === 0 && (
                  <div className="p-8 text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white">
                      ¡Todo al día en {selectedMonth} {selectedYear}!
                    </h4>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      No hay facturas pendientes de acuse o pendientes de recepción para este período.
                    </p>
                  </div>
                )}

              </div>

              {/* FOOTER */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAlertsMenuOpen(false);
                    if (onNavigateView) onNavigateView('facture');
                  }}
                  className="font-extrabold text-red-600 hover:underline cursor-pointer"
                >
                  Abrir Módulo Facture.co →
                </button>
                <button
                  type="button"
                  onClick={() => setIsAlertsMenuOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer font-bold"
                >
                  Cerrar
                </button>
              </div>

            </div>
          )}
        </div>

        {/* CHIP CRONOMETRO DE SEGURIDAD / CONTROL DE SESIÓN */}
        {sessionRemainingSeconds !== undefined && onExtendSession && onLogout && (
          <SessionTimerBadge 
            remainingSeconds={sessionRemainingSeconds}
            totalTimeoutSeconds={sessionTotalSeconds || 1200}
            onExtend={onExtendSession}
            onLogout={onLogout}
            currentUser={currentUser}
          />
        )}

        {/* SELECTOR / CHIP DE USUARIO ACTIVO (CON CONMUTADOR DE ROL) */}
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setIsUserMenuOpen(prev => !prev)}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 cursor-pointer hover:border-red-400 hover:shadow-sm transition-all"
            title="Cambiar de usuario o ver perfil"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-red-600 to-red-700 text-white font-black text-[11px] sm:text-xs flex items-center justify-center shadow-xs ring-1 ring-red-200 dark:ring-red-900 flex-shrink-0">
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
            <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-12 z-50 w-[calc(100vw-1rem)] sm:w-72 max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-3 animate-in fade-in duration-150 text-xs">
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

              <div className="space-y-1 max-h-60 overflow-y-auto">
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

        {/* BOTÓN CERRAR SESIÓN */}
        {onLogout && (
          <button 
            onClick={onLogout}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-red-50 to-red-100/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 flex items-center justify-center hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 hover:text-white hover:border-red-600 transition-all shadow-2xs cursor-pointer group flex-shrink-0"
            title="Cerrar Sesión"
          >
            <LogOut className="w-4 h-4 text-red-600 group-hover:text-white transition-colors group-hover:scale-110" />
          </button>
        )}
      </div>
    </header>
  );
};

