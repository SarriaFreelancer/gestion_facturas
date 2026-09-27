function AlertsModule({ alerts, onGoDashboard }) {
  return (
    <div className="space-y-5 animate-fade-in pb-10">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center text-lg">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">Centro de Alertas Reales del Sistema</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Monitoreo en tiempo real de facturas vencidas, firmas pendientes y entregas</p>
          </div>
        </div>
        
        <div className="mt-5 space-y-3">
          {alerts.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <i className="fa-solid fa-circle-check text-base text-emerald-600"></i>
              <span>¡Todo al día! No hay facturas atrasadas ni pendientes críticas registradas.</span>
            </div>
          ) : (
            alerts.map((alt, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between gap-3 ${
                  alt.type === 'red' 
                    ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-900/50' 
                    : (alt.type === 'amber' 
                        ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-900/50' 
                        : 'bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-900/50')
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${
                    alt.type === 'red' ? 'bg-rose-500 animate-pulse' : (alt.type === 'amber' ? 'bg-amber-500' : 'bg-blue-500')
                  }`}></span>
                  <span><strong className="font-bold">{alt.title}:</strong> {alt.message}</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white/70 dark:bg-zinc-800/80 shadow-xs uppercase tracking-wider">
                  {alt.tag}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <button 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors" 
            onClick={onGoDashboard}
          >
            <i className="fa-solid fa-arrow-left text-xs"></i>
            <span>Volver al Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}

window.AlertsModule = AlertsModule;
