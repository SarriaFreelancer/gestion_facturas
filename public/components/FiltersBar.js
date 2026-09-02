function FiltersBar({ searchTerm, setSearchTerm, selectedSupplier, setSelectedSupplier, selectedFactureFilter, setSelectedFactureFilter, suppliersList, onClean, onExportExcel, onOpenExcelPreview, selectedCount }) {
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

      <div className="dropdown-filter">
        <span>Proveedor:</span>
        <select value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}>
          <option value="Todos">Todos</option>
          {suppliersList.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="dropdown-filter">
        <span>Llegó en Facture:</span>
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
