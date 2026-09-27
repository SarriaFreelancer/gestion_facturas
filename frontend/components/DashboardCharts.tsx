'use client';

import React from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Calendar, 
  Layers, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { MonthlyStat, WeeklyReceivedDelivered, RecurrenceStudyItem } from '../app/types';

interface DashboardChartsProps {
  monthlyStats?: MonthlyStat[];
  weeklyData?: WeeklyReceivedDelivered[];
  recurrenceStudy?: RecurrenceStudyItem[];
  selectedYear: string;
  selectedMonth: string;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  monthlyStats = [],
  weeklyData = [],
  recurrenceStudy = [],
  selectedYear,
  selectedMonth
}) => {
  // Encontrar el valor máximo mensual para escalar las barras proporcionalmente
  const maxMonthlyAmount = Math.max(...monthlyStats.map(m => m.totalAmount), 1);
  const maxWeeklyCount = Math.max(
    ...weeklyData.map(w => Math.max(w.received, w.delivered)),
    1
  );

  return (
    <div className="space-y-6 mb-8">
      {/* SECCIÓN 1: GRÁFICO MES A MES + FACTURAS SEMANALES RECIBIDAS VS ENTREGADAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRÁFICO 1: EVOLUCIÓN MES A MES */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  Evolución Mes a Mes — {selectedYear}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Volumen facturado y conteo de documentos emitidos en el año
                </p>
              </div>
            </div>

            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              Año {selectedYear}
            </span>
          </div>

          {/* BARRAS DE MES A MES */}
          <div className="grid grid-cols-12 gap-2 items-end h-48 pt-6 pb-2 border-b border-slate-100 dark:border-zinc-800">
            {monthlyStats.map((item, idx) => {
              const heightPercent = Math.round((item.totalAmount / maxMonthlyAmount) * 100);
              const isSelected = selectedMonth !== 'Todos' && item.month.toLowerCase() === selectedMonth.toLowerCase();

              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group relative">
                  {/* Tooltip flotante */}
                  <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] rounded-lg px-2 py-1 shadow-lg pointer-events-none whitespace-nowrap">
                    <span className="font-bold">{item.month}: $ {item.totalAmount.toLocaleString('es-CO')}</span>
                    <span className="text-[9px] text-slate-400">{item.count} documentos</span>
                  </div>

                  {/* Barra visual */}
                  <div className="w-full max-w-[28px] bg-slate-100 dark:bg-zinc-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isSelected 
                          ? 'bg-gradient-to-t from-red-600 to-red-500 shadow-md ring-2 ring-red-400' 
                          : item.totalAmount > 0
                            ? 'bg-gradient-to-t from-red-600/80 to-rose-500/80 group-hover:from-red-600 group-hover:to-red-500'
                            : 'bg-transparent'
                      }`}
                      style={{ height: `${Math.max(heightPercent, item.count > 0 ? 8 : 0)}%` }}
                    />
                  </div>

                  {/* Label mes */}
                  <span className={`text-[10px] font-extrabold mt-2 ${
                    isSelected ? 'text-red-600 dark:text-red-400 font-black' : 'text-slate-500 dark:text-zinc-400'
                  }`}>
                    {item.short}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 text-[11px] text-slate-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-red-600"></span>
              <span className="font-bold">Monto Facturado ($)</span>
            </div>
            <span>Base de datos en tiempo real</span>
          </div>
        </div>

        {/* GRÁFICO 2: RECIBIDAS VS ENTREGADAS EN LA SEMANA */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  Flujo Semanal
                </h3>
                <p className="text-[11px] text-slate-400">Recibidas vs Entregadas</p>
              </div>
            </div>
          </div>

          {/* COMPARATIVA SEMANAL POR DÍA */}
          <div className="space-y-3 my-2">
            {weeklyData.map((d, i) => {
              const recPct = Math.round((d.received / maxWeeklyCount) * 100);
              const delPct = Math.round((d.delivered / maxWeeklyCount) * 100);

              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-700 dark:text-zinc-300">{d.day}</span>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="text-emerald-600 font-extrabold">{d.received} rec.</span>
                      <span className="text-blue-600 font-extrabold">{d.delivered} ent.</span>
                    </div>
                  </div>

                  {/* Barras dobles */}
                  <div className="grid grid-cols-2 gap-1.5 h-2">
                    <div className="bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(recPct, d.received > 0 ? 15 : 0)}%` }}
                      />
                    </div>
                    <div className="bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(delPct, d.delivered > 0 ? 15 : 0)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-5 pt-3 border-t border-slate-100 dark:border-zinc-800 text-[10px] font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600 dark:text-zinc-400">Recibidas (Facture)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span className="text-slate-600 dark:text-zinc-400">Entregadas a Pagos</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: ESTUDIO DE FACTURAS RECURRENTES */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                Estudio de Facturas & Conceptos Recurrentes
              </h3>
              <p className="text-[11px] text-slate-400">
                Auditoría mensual de cumplimiento de servicios fijos por proveedor en <strong>{selectedMonth} {selectedYear}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold text-slate-600 dark:text-zinc-300">
              Total Proveedores Auditados: {recurrenceStudy.length}
            </span>
          </div>
        </div>

        {/* TABLA DE AUDITORÍA DE RECURRENCIA */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-wider">
                <th className="px-4 py-3">Proveedor / NIT</th>
                <th className="px-4 py-3">Área</th>
                <th className="px-4 py-3 text-center">Conceptos Mapeados</th>
                <th className="px-4 py-3 text-center">Facturas Registradas</th>
                <th className="px-4 py-3 text-right">Monto Consolidado</th>
                <th className="px-4 py-3 text-center">Cumplimiento</th>
                <th className="px-4 py-3 text-center">Estado Auditoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-semibold">
              {recurrenceStudy.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No hay proveedores registrados para auditar recurrencia.
                  </td>
                </tr>
              ) : (
                recurrenceStudy.map((item, idx) => {
                  const isFull = item.registeredInvoices >= item.totalConcepts && item.totalConcepts > 0;
                  const isPending = item.registeredInvoices === 0 && item.totalConcepts > 0;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {item.supplierName}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{item.nit}</span>
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">
                        {item.area}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                          {item.totalConcepts} ({item.facConcepts} FAC / {item.cotConcepts} COT)
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center font-mono font-bold">
                        {item.registeredInvoices} / {item.totalConcepts}
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-black text-slate-800 dark:text-zinc-100">
                        $ {item.totalSpent.toLocaleString('es-CO')}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                item.compliance >= 100 
                                  ? 'bg-emerald-500' 
                                  : item.compliance > 0 
                                    ? 'bg-amber-500' 
                                    : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(item.compliance, 100)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-extrabold">{item.compliance}%</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {isFull ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Completo</span>
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>Pendiente</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>En Proceso</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
