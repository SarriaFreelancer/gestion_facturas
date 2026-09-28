'use client';

import React from 'react';
import { 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';

interface MonthRolloverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (keepUndelivered: boolean) => Promise<void>;
  targetMonth: string;
  targetYear: string;
  previousMonth: string;
  undeliveredCount: number;
  quotationsToRollCount: number;
}

export const MonthRolloverModal: React.FC<MonthRolloverModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  targetMonth,
  targetYear,
  previousMonth,
  undeliveredCount,
  quotationsToRollCount
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ENCABEZADO MODAL */}
        <div className="px-6 py-5 bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white flex items-center gap-3.5 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white flex-shrink-0">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Inicio de Mes: {targetMonth} {targetYear}</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </h2>
            <p className="text-[11px] text-white/90 font-medium">
              Preparación de plantilla recurrente y control de pendientes
            </p>
          </div>
        </div>

        {/* CONTENIDO EXPLICATIVO */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-black text-xs text-amber-900 dark:text-amber-100">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>¿Deseas mantener facturas no entregadas de {previousMonth}?</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Las facturas que no fueron entregadas se reciben y gestionan hasta el día primero del nuevo mes. Además, las cotizaciones no entregadas pueden pasar automáticamente al nuevo periodo.
            </p>
          </div>

          {/* DETALLE DE LO QUE SE GENERARÁ */}
          <div className="space-y-2.5 pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Acciones al inicializar el nuevo mes:
            </span>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-[11px] leading-snug">
                <span className="font-extrabold text-slate-800 dark:text-zinc-100">Plantilla de Conceptos Recurrentes en Blanco</span>
                <p className="text-slate-500 dark:text-zinc-400 text-[10px] mt-0.5">
                  Se listarán los conceptos de cada proveedor esperando recibir, con números y fechas vacías y todos los interruptores en <strong>NO</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700">
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-[11px] leading-snug">
                <span className="font-extrabold text-slate-800 dark:text-zinc-100">
                  {undeliveredCount} Facturas y Cotizaciones pendientes de entrega
                </span>
                <p className="text-slate-500 dark:text-zinc-400 text-[10px] mt-0.5">
                  Podrás mantenerlas en el listado de {targetMonth} hasta que se complete su entrega efectiva.
                </p>
              </div>
            </div>
          </div>

          {/* BOTONES DE DECISIÓN CLARA */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-end gap-2.5">
            <button
              onClick={() => onConfirm(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold transition-all cursor-pointer text-center text-xs"
            >
              Solo Plantilla en Blanco (No arrastrar)
            </button>

            <button
              onClick={() => onConfirm(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold shadow-md shadow-red-600/30 transition-all cursor-pointer text-center text-xs flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Sí, Mantener No Entregadas y Comenzar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
