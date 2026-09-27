// public/components/SuppliersModule.js
// Directorio de Proveedores y Configuración de Conceptos Recurrentes

function SuppliersModule({ suppliers, invoices = [], onAddSupplier, onEditSupplier, onDeleteSupplier, onUpdateSupplierServices }) {
  const [expandedSupplierId, setExpandedSupplierId] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const toggleExpand = (id) => {
    setExpandedSupplierId(expandedSupplierId === id ? null : id);
  };

  const handleServiceTypeChange = (sup, sIdx, newType) => {
    const updatedServices = [...(sup.services || [])];
    updatedServices[sIdx] = { ...updatedServices[sIdx], type: newType };
    onUpdateSupplierServices(sup.id, updatedServices);
  };

  const handleServiceNameChange = (sup, sIdx, newName) => {
    const updatedServices = [...(sup.services || [])];
    updatedServices[sIdx] = { ...updatedServices[sIdx], serviceName: newName };
    onUpdateSupplierServices(sup.id, updatedServices);
  };

  const handleToggleServiceEnable = (sup, sIdx) => {
    const updatedServices = [...(sup.services || [])];
    const currentEnabled = updatedServices[sIdx].enabled !== false;
    updatedServices[sIdx] = { ...updatedServices[sIdx], enabled: !currentEnabled };
    onUpdateSupplierServices(sup.id, updatedServices);
  };

  const handleAddConcept = (sup) => {
    const updatedServices = [...(sup.services || [])];
    updatedServices.push({
      serviceName: `Servicio #${updatedServices.length + 1}`,
      type: 'factura',
      enabled: true
    });
    onUpdateSupplierServices(sup.id, updatedServices);
  };

  const handleRemoveConcept = (sup, sIdx) => {
    const updatedServices = (sup.services || []).filter((_, idx) => idx !== sIdx);
    onUpdateSupplierServices(sup.id, updatedServices);
  };

  const filteredSuppliers = React.useMemo(() => {
    return (suppliers || []).filter(s => {
      const term = searchTerm.toLowerCase();
      return (
        (s.name || '').toLowerCase().includes(term) ||
        (s.nit || '').toLowerCase().includes(term) ||
        (s.contact || '').toLowerCase().includes(term) ||
        (s.area || '').toLowerCase().includes(term)
      );
    });
  }, [suppliers, searchTerm]);

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm mb-5">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <i className="fa-solid fa-user-group text-rose-600"></i>
            Directorio de Proveedores Autorizados
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Configura los servicios mensuales recurrentes indicando si corresponden a Facturas o Cotizaciones.
          </p>
        </div>

        <button 
          onClick={onAddSupplier}
          className="btn-red-action"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Registrar Proveedor</span>
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-sm mb-5 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-3 py-1.5 flex-1 focus-within:border-rose-500 focus-within:bg-white dark:focus-within:bg-zinc-800 transition-all">
          <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Buscar proveedor por razón social, NIT, contacto o área..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none w-full"
          />
        </div>

        <button 
          onClick={() => setSearchTerm('')}
          className="btn-clean"
        >
          <i className="fa-solid fa-rotate-right text-[11px]"></i>
          <span>Limpiar</span>
        </button>
      </div>

      {/* TABLA DE PROVEEDORES */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-850 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                <th className="p-3 w-10 text-center">Ver</th>
                <th className="p-3">NIT / RUT</th>
                <th className="p-3">Razón Social</th>
                <th className="p-3">Asesor Comercial</th>
                <th className="p-3">Teléfono</th>
                <th className="p-3">Conceptos / Mes</th>
                <th className="p-3">Área Asignada</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400 dark:text-zinc-500">
                    <i className="fa-solid fa-users text-3xl mb-2 block text-slate-300 dark:text-zinc-600"></i>
                    No se encontraron proveedores registrados.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((sup) => {
                  const isExpanded = expandedSupplierId === sup.id;
                  const services = sup.services || [];
                  const activeCount = services.filter(s => s.enabled !== false).length;

                  return (
                    <React.Fragment key={sup.id}>
                      <tr className={`hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors ${isExpanded ? 'bg-rose-50/20 dark:bg-rose-950/20' : ''}`}>
                        {/* TOGGLE EXPAND */}
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => toggleExpand(sup.id)}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                              isExpanded 
                                ? 'bg-rose-600 text-white shadow-glow-sm' 
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200'
                            }`}
                            title={isExpanded ? "Ocultar conceptos" : "Desplegar conceptos recurrentes"}
                          >
                            <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-[10px]`}></i>
                          </button>
                        </td>

                        <td className="p-3 font-mono font-bold text-slate-700 dark:text-zinc-300">
                          {sup.nit}
                        </td>

                        <td className="p-3">
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 cursor-pointer" onClick={() => toggleExpand(sup.id)}>
                            <span className="w-6 h-6 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 text-[10px] font-black flex items-center justify-center">
                              {(sup.name || 'PR').substring(0, 2).toUpperCase()}
                            </span>
                            <span>{sup.name}</span>
                          </div>
                        </td>

                        <td className="p-3 text-slate-600 dark:text-zinc-300">
                          {sup.contact || '—'}
                        </td>

                        <td className="p-3 text-slate-600 dark:text-zinc-300 font-mono">
                          {sup.phone || '—'}
                        </td>

                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <i className="fa-solid fa-list-check text-[9px]"></i>
                            {activeCount} {activeCount === 1 ? 'concepto activo' : 'conceptos activos'}
                          </span>
                        </td>

                        <td className="p-3 text-slate-600 dark:text-zinc-300">
                          <i className="fa-solid fa-building-user text-slate-400 mr-1.5 text-[11px]"></i>
                          {sup.area || 'General'}
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => onEditSupplier(sup)}
                              className="w-7 h-7 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors"
                              title="Editar proveedor"
                            >
                              <i className="fa-regular fa-pen-to-square text-xs"></i>
                            </button>

                            <button 
                              onClick={() => onDeleteSupplier(sup.id)}
                              className="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors"
                              title="Eliminar proveedor"
                            >
                              <i className="fa-regular fa-trash-can text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* SUBFILA DESPLEGABLE CON CONCEPTOS RECURRENTES */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="8" className="p-0 bg-slate-50/50 dark:bg-zinc-950/40">
                            <div className="p-5 border-y border-slate-200 dark:border-zinc-800">
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-xs font-black text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                                  <i className="fa-solid fa-layer-group text-rose-600"></i>
                                  Conceptos Recurrentes Mensuales de {sup.name}
                                </div>

                                <button 
                                  onClick={() => handleAddConcept(sup)}
                                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                                >
                                  <i className="fa-solid fa-plus text-[10px]"></i>
                                  <span>Agregar Concepto</span>
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {services.length === 0 ? (
                                  <div className="col-span-full p-4 text-center text-slate-400 text-xs bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                                    No hay conceptos configurados. Haz clic en "Agregar Concepto" para registrar servicios mensuales.
                                  </div>
                                ) : (
                                  services.map((srv, sIdx) => {
                                    const isEnabled = srv.enabled !== false;
                                    const isCot = srv.type === 'cotizacion';

                                    return (
                                      <div 
                                        key={sIdx}
                                        className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                                          isEnabled 
                                            ? 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm' 
                                            : 'bg-slate-100/50 dark:bg-zinc-900/40 border-slate-200/50 dark:border-zinc-800/40 opacity-60'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-2 flex-1">
                                            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] font-black flex items-center justify-center">
                                              #{sIdx + 1}
                                            </span>
                                            <input 
                                              type="text"
                                              value={srv.serviceName || ''}
                                              onChange={(e) => handleServiceNameChange(sup, sIdx, e.target.value)}
                                              placeholder="Nombre del concepto o servicio"
                                              className="bg-transparent text-xs font-bold text-slate-800 dark:text-zinc-100 border-b border-transparent hover:border-slate-300 focus:border-rose-500 outline-none flex-1 pb-0.5"
                                            />
                                          </div>

                                          <button 
                                            onClick={() => handleRemoveConcept(sup, sIdx)}
                                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                            title="Eliminar este concepto"
                                          >
                                            <i className="fa-solid fa-xmark text-xs"></i>
                                          </button>
                                        </div>

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
                                          {/* TIPO: FACTURA O COTIZACION */}
                                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg text-[10px] font-bold">
                                            <button 
                                              onClick={() => handleServiceTypeChange(sup, sIdx, 'factura')}
                                              className={`px-2 py-0.5 rounded-md transition-all ${
                                                !isCot 
                                                  ? 'bg-rose-600 text-white shadow-sm' 
                                                  : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                                              }`}
                                            >
                                              Factura
                                            </button>
                                            <button 
                                              onClick={() => handleServiceTypeChange(sup, sIdx, 'cotizacion')}
                                              className={`px-2 py-0.5 rounded-md transition-all ${
                                                isCot 
                                                  ? 'bg-purple-600 text-white shadow-sm' 
                                                  : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                                              }`}
                                            >
                                              Cotización
                                            </button>
                                          </div>

                                          {/* HABILITADO / DESHABILITADO */}
                                          <button 
                                            onClick={() => handleToggleServiceEnable(sup, sIdx)}
                                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition-all ${
                                              isEnabled 
                                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                                                : 'bg-slate-200 dark:bg-zinc-800 text-slate-500'
                                            }`}
                                          >
                                            {isEnabled ? '● Activo' : '○ Inactivo'}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.SuppliersModule = SuppliersModule;