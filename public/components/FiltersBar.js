function FiltersBar({ 
  searchTerm, 
  setSearchTerm, 
  selectedSupplier, 
  setSelectedSupplier, 
  selectedFactureFilter, 
  setSelectedFactureFilter, 
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  suppliersList, 
  onClean, 
  onExportExcel, 
  onOpenExcelPreview, 
  selectedCount 
}) {
  const allMonths = [
    'Todos', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const allYears = ['Todos', '2026', '2027', '2028', '2029', '2030'];

  return (
    <div className="filters-row">
      <div className="search-input-wrap">
        <i className="fa-solid fa-magnifying-glass" style={{color: '#94a3b8', fontSize: '12px'}}></i>
        <input
          type="text"
          placeholder="Buscar por N° factura, proveedor o servicio..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* FILTRO DE MESES */}
      <div className="dropdown-filter">
        <span>Mes:</span>
        <select value={selectedMonth || 'Todos'} onChange={e => setSelectedMonth && setSelectedMonth(e.target.value)}>
          {allMonths.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* FILTRO DE AÑOS FUTUROS */}
      <div className="dropdown-filter">
        <span>Año:</span>
        <select value={selectedYear || 'Todos'} onChange={e => setSelectedYear && setSelectedYear(e.target.value)}>
          {allYears.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* FILTRO DE PROVEEDORES */}
      <div className="dropdown-filter">
        <span>Proveedor:</span>
        <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}>
          <option value="Todos">Todos</option>
          {suppliersList.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* FILTRO FACTURE */}
      <div className="dropdown-filter">
        <span>En Facture:</span>
        <select value={selectedFactureFilter} onChange={e => setSelectedFactureFilter(e.target.value)}>
          <option value="Todos">Todos</option>
          <option value="SÍ">SÍ</option>
          <option value="AÚN NO">AÚN NO</option>
        </select>
      </div>

      <button className="btn-clean" onClick={onClean}>
        <i className="fa-solid fa-rotate-right"></i> Limpiar
      </button>

      {/* BOTÓN VISTA PREVIA TIPO EXCEL */}
      <button 
        className="btn-preview-excel" 
        onClick={onOpenExcelPreview}
        title="Abrir vista previa tipo Excel de las facturas seleccionadas / entregadas"
      >
        <i className="fa-solid fa-table-cells"></i>
        <span>Vista Previa Excel {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
      </button>

      <button className="btn-export-excel" onClick={onExportExcel}>
        <i className="fa-regular fa-file-excel"></i> Exportar
      </button>
    </div>
  );
}

window.FiltersBar = FiltersBar;
