'use client';

import React from 'react';
import { 
  FileText, 
  Receipt, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { DashboardMetrics } from '../app/types';

interface DashboardKpisProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({ metrics, loading }) => {
  const cards = [
    {
      title: 'Total Documentos',
      value: metrics?.total ?? 0,
      sub: 'En el mes actual',
      icon: FileText,
      color: 'from-blue-600 to-indigo-600',
      bgLight: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50'
    },
    {
      title: 'Facturas vs Cotizaciones',
      value: `${metrics?.facCount ?? 0} / ${metrics?.cotCount ?? 0}`,
      sub: 'FAC registradas / COT activas',
      icon: Receipt,
      color: 'from-purple-600 to-pink-600',
      bgLight: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/50'
    },
    {
      title: 'Pendientes de Firma',
      value: metrics?.toSignCount ?? 0,
      sub: 'Requieren validación o firma',
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
    },
    {
      title: 'Facturas Radicadas',
      value: metrics?.factureCount ?? 0,
      sub: `${metrics?.pendingFactureCount ?? 0} pendientes de radicar`,
      icon: FileCheck,
      color: 'from-emerald-600 to-teal-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
    },
    {
      title: 'Total Entregadas',
      value: metrics?.deliveredCount ?? 0,
      sub: `${metrics?.pendingDeliveryCount ?? 0} pendientes de entrega`,
      icon: CheckCircle2,
      color: 'from-cyan-600 to-blue-600',
      bgLight: 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-900/50'
    },
    {
      title: 'Monto Total Facturado',
      value: `$ ${(metrics?.totalAmount ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: 'Valor consolidado mensual',
      icon: DollarSign,
      color: 'from-red-600 to-rose-700',
      bgLight: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50'
    }
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* ALERTA EN EL DASHBOARD: FACTURAS RECURRENTES PENDIENTES EN FACTURE.CO */}
      {metrics?.pendingFactureAlerts && metrics.pendingFactureAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs shadow-xs space-y-2.5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span className="font-black text-sm text-slate-900 dark:text-white">
                Alerta de Cumplimiento: {metrics.pendingFactureAlerts.length} {metrics.pendingFactureAlerts.length === 1 ? 'Factura Habitual Pendiente' : 'Facturas Habituales Pendientes'} en Facture.co
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200/90 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
              Fecha Habitual Vencida
            </span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-zinc-400">
            Los siguientes contratos y facturas vinculadas debían haber llegado a Facture.co según su fecha esperada mensual y aún no se han recibido:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {metrics.pendingFactureAlerts.map((al, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/40 shadow-xs flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-extrabold text-slate-900 dark:text-white truncate" title={al.supplier}>
                    {al.supplier}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex-shrink-0">
                    Día habitual: ~{al.expectedDay}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-zinc-300 mt-1 truncate">
                  Concepto: <strong>{al.service}</strong>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800 pt-1.5">
                  <span className="font-semibold">Área: {al.area}</span>
                  <span className="text-red-600 dark:text-red-400 font-extrabold text-[10px]">Pendiente en Facture</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TARJETAS KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c, i) => {
        const IconComponent = c.icon;
        return (
          <div 
            key={i}
            className={`p-4 rounded-2xl border ${c.bgLight} bg-white dark:bg-zinc-900 shadow-sm transition-all hover:shadow-md flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                {c.title}
              </span>
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${c.color} text-white flex items-center justify-center shadow-xs`}>
                <IconComponent className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {loading ? '...' : c.value}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold mt-0.5 truncate">
                {c.sub}
              </p>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};
