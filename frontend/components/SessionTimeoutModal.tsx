'use client';

import React from 'react';
import { AlertTriangle, Clock, ShieldAlert, LogOut, CheckCircle2 } from 'lucide-react';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  onExtend: () => void;
  onLogout: () => void;
  userName?: string;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  remainingSeconds,
  onExtend,
  onLogout,
  userName = 'Usuario'
}) => {
  if (!isOpen) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = remainingSeconds <= 30;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-amber-300 dark:border-amber-700/50 p-6 sm:p-7 relative overflow-hidden animate-in zoom-in-95">
        
        {/* Luces de alerta de fondo */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 text-center">
          {/* ICONO PULSANTE */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-inner">
            <ShieldAlert className={`w-8 h-8 ${isUrgent ? 'animate-bounce text-red-600' : 'animate-pulse'}`} />
          </div>

          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900/60">
            Control de Seguridad Corporativa
          </span>

          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-3 mb-1.5">
            ¿Sigues ahí, {userName}?
          </h3>

          <p className="text-xs text-slate-600 dark:text-zinc-300 mb-5 leading-relaxed">
            Tu sesión se cerrará automáticamente por inactividad para resguardar la confidencialidad de la información.
          </p>

          {/* CRONÓMETRO REGRESIVO */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 mb-6 flex items-center justify-center gap-3">
            <Clock className={`w-5 h-5 ${isUrgent ? 'text-red-600 animate-spin' : 'text-amber-600'}`} />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Tiempo Restante
              </span>
              <span className={`text-2xl font-black font-mono tracking-wider ${isUrgent ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
                {formattedTime}
              </span>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              onClick={onExtend}
              type="button"
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 hover:shadow-red-600/40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mantener Sesión Activa</span>
            </button>

            <button
              onClick={onLogout}
              type="button"
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
