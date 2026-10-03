'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Shield, Clock, RefreshCw, LogOut, Lock, CheckCircle2 } from 'lucide-react';
import { User } from '../app/types';

interface SessionTimerBadgeProps {
  remainingSeconds: number;
  totalTimeoutSeconds: number;
  onExtend: () => void;
  onLogout: () => void;
  currentUser?: User | null;
}

export const SessionTimerBadge: React.FC<SessionTimerBadgeProps> = ({
  remainingSeconds,
  totalTimeoutSeconds,
  onExtend,
  onLogout,
  currentUser
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [justRenewed, setJustRenewed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLow = remainingSeconds <= 180; // 3 minutos
  const isCritical = remainingSeconds <= 60; // 1 minuto

  // Cerrar popover al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRenewClick = () => {
    onExtend();
    setJustRenewed(true);
    setTimeout(() => setJustRenewed(false), 2000);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BOTÓN BADGE PRINCIPAL */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`h-9 sm:h-10 px-2.5 sm:px-3 rounded-xl border transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-2xs group flex-shrink-0 ${
          isCritical
            ? 'bg-red-50 dark:bg-red-950/50 border-red-400 text-red-600 animate-pulse'
            : isLow
            ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 text-amber-600'
            : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:border-red-400 hover:text-red-600'
        }`}
        title={`Tiempo de sesión activa: ${formattedTime}. Clic para gestionar o renovar.`}
      >
        <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isCritical ? 'text-red-600 animate-spin' : isLow ? 'text-amber-500' : 'text-slate-400 group-hover:text-red-500'} transition-colors`} />
        
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-mono font-black tracking-tight leading-none">
            {formattedTime}
          </span>
          <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-zinc-500 hidden sm:inline leading-none mt-0.5">
            Sesión
          </span>
        </div>
      </button>

      {/* POPOVER DE CONTROL DE SESIÓN */}
      {isOpen && (
        <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-12 z-50 w-72 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-4 animate-in fade-in zoom-in-95 duration-150 text-xs">
          {/* ENCABEZADO */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Seguridad de Acceso
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                  Control de Tiempos
                </span>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>

          {/* DETALLES DE SESIÓN */}
          <div className="space-y-2 mb-4 bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 dark:text-zinc-400">Usuario activo:</span>
              <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[130px]">
                {currentUser?.name || 'Superadmin'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 dark:text-zinc-400">Inactividad restante:</span>
              <span className={`font-mono font-black ${isCritical ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                {formattedTime}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 dark:text-zinc-400">Límite por sesión:</span>
              <span className="font-medium text-slate-700 dark:text-zinc-300">
                {Math.round(totalTimeoutSeconds / 60)} minutos
              </span>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleRenewClick}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {justRenewed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>¡Sesión Renovada!</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Renovar Tiempo (+{Math.round(totalTimeoutSeconds / 60)}m)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-red-500" />
              <span>Cerrar Sesión Ahora</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
