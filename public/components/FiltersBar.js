// public/components/FiltersBar.js
// Barra de Filtros Segmentada y Estilizada con Diseño 2D Ultra-Limpio

function FiltersBar({ 
  searchTerm, 
  setSearchTerm, 
  selectedSupplier, 
  setSelectedSupplier, 
  selectedFactureFilter, 
  setSelectedFactureFilter,
  selectedSignedFilter,
  setSelectedSignedFilter,
  selectedOrderStdFilter,
  setSelectedOrderStdFilter,
  selectedOcFilter,
  setSelectedOcFilter,
  selectedDeliveredFilter,
  setSelectedDeliveredFilter,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  suppliersList, 
  onClean, 
  onExportExcel, 
  onOpenExcelPreview, 
  selectedCount,
  currentTab
}) {
  const allMonths = [
    'Todos', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const allYears = ['Todos', '2026', '2027', '2028', '2029', '2030'];

  const isDeliveredSelected = selectedDeliveredFilter === 'SÍ' || currentTab === 'Entregadas' || selectedCount > 0;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-sm mb-6 flex flex-col gap-3.5 transition-all">
      {/* FILA SUPERIOR: BÚSQUEDA Y ACCIONES PRINCIPALES */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* BUSCADOR EXPANDIBLE */}
        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3.5 py-2 flex-1 min-w-[280px] focus-within:border-rose-600 focus-within:ring-2 focus-within:ring-rose-500/20 focus-within:bg-white dark:focus-within:bg-zinc-900 transition-all shadow-inner">
          <Icon name="search" size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por # radicado, factura, cotización, proveedor o servicio..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none w-full placeholder:text-slate-400"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')} 
              className="text-slate-400 hover:text-rose-600 text-xs font-bold"
              title="Limpiar búsqueda"
            >
              <Icon name="close" size={14} />
            </button>
          )}
        </div>

        {/* GRUPO DE BOTONES DE ACCIÓN */}
        <div className="flex items-center gap-2">
          {/* BOTÓN RESTABLECER */}
          <button 
            onClick={onClean}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-200 dark:border-zinc-700 shadow-2xs"
            title="Restablecer todos los filtros"
          >
            <Icon name="history" size={14} className="text-slate-500" />
            <span>Limpiar</span>
          </button>

          {/* VISTA PREVIA EXCEL (CONDICIONAL) */}
          {isDeliveredSelected && (
            <button 
              onClick={onOpenExcelPreview}
              className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              title="Abrir Vista Previa tipo Hoja de Cálculo Excel"
            >
              <Icon name="invoices" size={15} className="text-blue-600" />
              <span>Vista Previa {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
            </button>
          )}

          {/* BOTÓN EXPORTAR EXCEL (ROJO SEGÚN MOCKUP) */}
          <button 
            onClick={onExportExcel}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-black flex items-center gap-2 transition-all shadow-sm shadow-red-600/25 active:scale-[0.98] border border-red-500/30"
            title="Exportar registros filtrados a Excel"
          >
            <Icon name="excel" size={15} className="text-white" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* FILA INFERIOR: CHIPS DE FILTROS SEGREGADOS */}
      <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-slate-700 dark:text-zinc-300 mr-1">
          <Icon name="filter" size={14} className="text-slate-500" />
          <span>FILTROS:</span>
        </div>

        {/* MES */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-xs shadow-2xs hover:border-slate-300 transition-all">
          <Icon name="calendar" size={13} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase">MES:</span>
          <select 
            value={selectedMonth || 'Todos'} 
            onChange={e => setSelectedMonth && setSelectedMonth(e.target.value)}
            className="bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer pr-1"
          >
            {allMonths.map(m => (
              <option key={m} value={m} className="dark:bg-zinc-900 text-slate-900 dark:text-white">{m}</option>
            ))}
          </select>
        </div>

        {/* AÑO */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-xs shadow-2xs hover:border-slate-300 transition-all">
          <Icon name="calendar" size={13} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase">AÑO:</span>
          <select 
            value={selectedYear || 'Todos'} 
            onChange={e => setSelectedYear && setSelectedYear(e.target.value)}
            className="bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer pr-1"
          >
            {allYears.map(y => (
              <option key={y} value={y} className="dark:bg-zinc-900 text-slate-900 dark:text-white">{y}</option>
            ))}
          </select>
        </div>

        {/* PROVEEDOR */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-xs shadow-2xs hover:border-slate-300 transition-all">
          <Icon name="users" size={13} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase">PROVEEDOR:</span>
          <select 
            value={selectedSupplier} 
            onChange={e => setSelectedSupplier(e.target.value)}
            className="bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer max-w-[140px] truncate pr-1"
          >
            <option value="Todos" className="dark:bg-zinc-900 text-slate-900 dark:text-white">Todos</option>
            {suppliersList.map(s => (
              <option key={s} value={s} className="dark:bg-zinc-900 text-slate-900 dark:text-white">{s}</option>
            ))}
          </select>
        </div>

        {/* FIRMADA */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-xs shadow-2xs hover:border-slate-300 transition-all">
          <Icon name="signature" size={13} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase">FIRMADA:</span>
          <select 
            value={selectedSignedFilter || 'Todos'} 
            onChange={e => setSelectedSignedFilter && setSelectedSignedFilter(e.target.value)}
            className="bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer pr-1"
          >
            <option value="Todos" className="dark:bg-zinc-900 text-slate-900 dark:text-white">Todos</option>
            <option value="SÍ" className="dark:bg-zinc-900 text-slate-900 dark:text-white">SÍ</option>
            <option value="NO" className="dark:bg-zinc-900 text-slate-900 dark:text-white">NO</option>
          </select>
        </div>

        {/* ORDEN STD */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-xs shadow-2xs hover:border-slate-300 transition-all">
          <Icon name="history" size={13} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase">ORDEN STD:</span>
          <select 
            value={selectedOrderStdFilter || 'Todos'} 
            onChange={e => setSelectedOrderStdFilter && setSelectedOrderStdFilter(e.target.value)}
            className="bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer pr-1"
          >
            <option value="Todos" className="dark:bg-zinc-900 text-slate-900 dark:text-white">Todos</option>
            <option value="SÍ" className="dark:bg-zinc-900 text-slate-900 dark:text-white">SÍ</option>
            <option value="NO" className="dark:bg-zinc-900 text-slate-900 dark:text-white">NO</option>
          </select>
        </div>

        {/* OC / CC */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-xs shadow-2xs hover:border-slate-300 transition-all">
          <Icon name="file-text" size={13} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase">OC:</span>
          <select 
            value={selectedOcFilter || 'Todos'} 
            onChange={e => setSelectedOcFilter && setSelectedOcFilter(e.target.value)}
            className="bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer pr-1"
          >
            <option value="Todos" className="dark:bg-zinc-900 text-slate-900 dark:text-white">Todos</option>
            <option value="CON_OC" className="dark:bg-zinc-900 text-slate-900 dark:text-white">Con OC</option>
            <option value="SIN_OC" className="dark:bg-zinc-900 text-slate-900 dark:text-white">Sin OC</option>
          </select>
        </div>

        {/* FACTURE */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-xs shadow-2xs hover:border-slate-300 transition-all">
          <Icon name="clock" size={13} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase">FACTURE:</span>
          <select 
            value={selectedFactureFilter} 
            onChange={e => setSelectedFactureFilter(e.target.value)}
            className="bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer pr-1"
          >
            <option value="Todos" className="dark:bg-zinc-900 text-slate-900 dark:text-white">Todos</option>
            <option value="SÍ" className="dark:bg-zinc-900 text-slate-900 dark:text-white">SÍ</option>
            <option value="NO" className="dark:bg-zinc-900 text-slate-900 dark:text-white">NO</option>
          </select>
        </div>

        {/* ENTREGADA */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700 rounded-full px-3 py-1.5 text-xs shadow-2xs hover:border-slate-300 transition-all">
          <Icon name="deliver" size={13} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase">ENTREGADA:</span>
          <select 
            value={selectedDeliveredFilter || 'Todos'} 
            onChange={e => setSelectedDeliveredFilter && setSelectedDeliveredFilter(e.target.value)}
            className="bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer pr-1"
          >
            <option value="Todos" className="dark:bg-zinc-900 text-slate-900 dark:text-white">Todos</option>
            <option value="SÍ" className="dark:bg-zinc-900 text-slate-900 dark:text-white">SÍ</option>
            <option value="NO" className="dark:bg-zinc-900 text-slate-900 dark:text-white">NO</option>
          </select>
        </div>
      </div>
    </div>
  );
}

window.FiltersBar = FiltersBar;
