function CrmModule({ suppliers = [], quotations = [], onSaveQuotation, onDeleteQuotation, onUploadPdf }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('TODOS');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingQuotation, setEditingQuotation] = React.useState(null);

  const STAGES = [
    { key: 'EN_BUSQUEDA', label: 'En Búsqueda', colorClass: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700' },
    { key: 'CONSULTADO', label: 'Consultado', colorClass: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-900/50' },
    { key: 'COTIZANDO', label: 'En Espera', colorClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/50' },
    { key: 'COTIZADO', label: 'Cotización Recibida', colorClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50' },
    { key: 'SELECCIONADO', label: '🏆 Adjudicado', colorClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900/50 font-black' },
    { key: 'DESCARTADO', label: 'Descartado', colorClass: 'bg-slate-100 text-slate-400 dark:bg-zinc-800/40 dark:text-zinc-500 border-slate-200 dark:border-zinc-800' }
  ];

  const getMeta = (k) => STAGES.find(s => s.key === k) || STAGES[0];

  const filtered = React.useMemo(() => {
    return quotations.filter(q => {
      const qText = (q.title || '') + ' ' + (q.code || '') + ' ' + (q.description || '');
      const supText = (q.suppliers || []).map(s => s.supplierName).join(' ');
      const match = (qText + ' ' + supText).toLowerCase().includes(searchTerm.toLowerCase());
      const matchSt = statusFilter === 'TODOS' || q.status === statusFilter;
      return match && matchSt;
    });
  }, [quotations, searchTerm, statusFilter]);

  const metrics = React.useMemo(() => {
    return {
      total: quotations.length,
      inSearch: quotations.filter(q => q.status === 'EN_BUSQUEDA').length,
      inProcess: quotations.filter(q => q.status === 'EN_PROCESO').length,
      completed: quotations.filter(q => q.status === 'FINALIZADO').length
    };
  }, [quotations]);

  const handleAddSup = (quotation, supObj) => {
    const current = quotation.suppliers || [];
    if (current.some(s => s.supplierId === supObj.id || s.supplierName === supObj.name)) {
      return Swal.fire('Ya Agregado', 'Este proveedor ya se encuentra en la solicitud.', 'info');
    }
    const newEntry = {
      id: 'csup-' + Date.now(),
      supplierId: supObj.id,
      supplierName: supObj.name,
      phone: supObj.phone || '',
      stage: 'CONSULTADO',
      quotedAmount: 0,
      pdfPath: null
    };
    const updated = {
      ...quotation,
      suppliers: [...current, newEntry],
      status: quotation.status === 'EN_BUSQUEDA' ? 'EN_PROCESO' : quotation.status
    };
    onSaveQuotation(updated);
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: supObj.name + ' agregado', showConfirmButton: false, timer: 1500 });
  };

  const handleStageChange = (quotation, idx, newStage) => {
    const list = [...(quotation.suppliers || [])];
    list[idx].stage = newStage;
    let selSup = quotation.selectedSupplier;
    let finAmt = quotation.finalAmount;
    if (newStage === 'SELECCIONADO') {
      selSup = list[idx].supplierName;
      finAmt = list[idx].quotedAmount;
    }
    const updated = {
      ...quotation,
      suppliers: list,
      selectedSupplier: selSup,
      finalAmount: finAmt,
      status: newStage === 'SELECCIONADO' ? 'FINALIZADO' : quotation.status
    };
    onSaveQuotation(updated);
  };

  const handleAmountChange = (quotation, idx, val) => {
    const list = [...(quotation.suppliers || [])];
    list[idx].quotedAmount = Number(val) || 0;
    if (list[idx].stage === 'CONSULTADO' || list[idx].stage === 'COTIZANDO') {
      list[idx].stage = 'COTIZADO';
    }
    onSaveQuotation({ ...quotation, suppliers: list });
  };

  const handlePdfUpload = (quotation, idx, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fetch('/api/upload-pdf', { method: 'POST', body: fd })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const list = [...(quotation.suppliers || [])];
          list[idx].pdfPath = data.relativePath;
          list[idx].stage = 'COTIZADO';
          onSaveQuotation({ ...quotation, suppliers: list });
          Swal.fire('PDF Vinculado', 'Cotización física guardada correctamente.', 'success');
        }
      });
  };

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      {/* HEADER */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center text-xl shadow-lg shadow-rose-500/20">
            <i className="fa-solid fa-handshake"></i>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">CRM de Cotizaciones & Solicitudes</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Pipeline de compras: Búsqueda ➔ Consultado ➔ Espera ➔ Cotizado ➔ Adjudicado</p>
          </div>
        </div>

        <button 
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
          onClick={() => { 
            setEditingQuotation({ 
              id: 'crm-' + Date.now(), 
              code: 'REQ-' + new Date().getFullYear() + '-' + (quotations.length + 1).toString().padStart(3, '0'), 
              title: '', 
              category: 'Insumos / Alimentos', 
              description: '', 
              urgency: 'Media', 
              deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0], 
              status: 'EN_BUSQUEDA', 
              suppliers: [] 
            }); 
            setIsModalOpen(true); 
          }}
        >
          <i className="fa-solid fa-plus-circle text-xs"></i>
          <span>Nueva Solicitud de Cotización</span>
        </button>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center text-base">
            <i className="fa-solid fa-layer-group"></i>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Solicitudes</div>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono mt-0.5">{metrics.total}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center text-base">
            <i className="fa-solid fa-magnifying-glass"></i>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">En Búsqueda</div>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">{metrics.inSearch}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center text-base">
            <i className="fa-solid fa-hourglass-half"></i>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">En Negociación</div>
            <div className="text-lg font-black text-sky-600 dark:text-sky-400 font-mono mt-0.5">{metrics.inProcess}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center text-base">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Adjudicadas</div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{metrics.completed}</div>
          </div>
        </div>
      </div>

      {/* BUSQUEDA & FILTROS */}
      <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input 
            type="text" 
            placeholder="Buscar requerimiento, producto o proveedor..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { key: 'TODOS', label: 'Todas' }, 
            { key: 'EN_BUSQUEDA', label: '🔍 En Búsqueda' }, 
            { key: 'EN_PROCESO', label: '⏳ En Negociación' }, 
            { key: 'FINALIZADO', label: '🏆 Adjudicadas' }
          ].map(tab => (
            <button 
              key={tab.key} 
              onClick={() => setStatusFilter(tab.key)} 
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.key 
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 shadow-sm' 
                  : 'bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-zinc-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* LISTADO PIPELINES */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 text-slate-400">
            <i className="fa-solid fa-file-circle-question text-4xl mb-3 text-slate-300 dark:text-zinc-700 block"></i>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No hay requerimientos registrados</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto mb-4">Crea tu primera solicitud para gestionar la cotización con varios proveedores.</p>
            <button 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              onClick={() => { 
                setEditingQuotation({ 
                  id: 'crm-' + Date.now(), 
                  code: 'REQ-' + new Date().getFullYear() + '-' + (quotations.length + 1).toString().padStart(3, '0'), 
                  title: '', 
                  category: 'Insumos / Alimentos', 
                  description: '', 
                  urgency: 'Media', 
                  deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0], 
                  status: 'EN_BUSQUEDA', 
                  suppliers: [] 
                }); 
                setIsModalOpen(true); 
              }}
            >
              <i className="fa-solid fa-plus text-xs"></i>
              <span>Crear Solicitud</span>
            </button>
          </div>
        ) : (
          filtered.map(q => {
            const qSuppliers = q.suppliers || [];
            return (
              <div key={q.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50/70 dark:bg-zinc-800/40 border-b border-slate-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg font-mono">{q.code}</span>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{q.title}</h3>
                    <span className="bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg text-[10px] font-bold">📂 {q.category}</span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${
                      q.urgency === 'Alta' 
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200' 
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200'
                    }`}>
                      ⚡ {q.urgency}
                    </span>
                  </div>

                  <button 
                    onClick={() => { 
                      Swal.fire({
                        title: '¿Eliminar?', 
                        text: 'Se borrará ' + q.code, 
                        icon: 'warning', 
                        showCancelButton: true, 
                        confirmButtonColor: '#e11d48'
                      }).then(r => {
                        if (r.isConfirmed) onDeleteQuotation(q.id);
                      }); 
                    }} 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs"
                    title="Eliminar requerimiento"
                  >
                    <i className="fa-regular fa-trash-can"></i>
                  </button>
                </div>

                <div className="p-4 space-y-3.5">
                  {q.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <strong className="text-slate-800 dark:text-slate-200">Especificaciones:</strong> {q.description}
                    </p>
                  )}

                  {/* SELECTOR INVITAR PROVEEDOR */}
                  <div className="flex flex-wrap items-center gap-2.5 bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-zinc-800">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">➕ Invitar Proveedor:</span>
                    <select 
                      id={'select-sup-' + q.id} 
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-slate-800 dark:text-white flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    >
                      <option value="">-- Seleccionar Proveedor del Catálogo --</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.nit}) - {s.area}</option>)}
                    </select>
                    <button 
                      onClick={() => { 
                        const sel = document.getElementById('select-sup-' + q.id); 
                        const supObj = suppliers.find(s => s.id === sel.value); 
                        if (supObj) { 
                          handleAddSup(q, supObj); 
                          sel.value = ''; 
                        } else { 
                          Swal.fire('Selecciona un Proveedor', 'Elige un proveedor del listado.', 'warning'); 
                        } 
                      }} 
                      className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      <i className="fa-solid fa-paper-plane mr-1"></i> Invitar
                    </button>
                  </div>

                  {/* TABLA DE PROVEEDORES */}
                  {qSuppliers.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-xs italic">
                      Aún no has agregado proveedores para esta cotización.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="py-2.5 px-3">Proveedor</th>
                            <th className="py-2.5 px-3">Estado del Proveedor</th>
                            <th className="py-2.5 px-3">Monto Cotizado ($ COP)</th>
                            <th className="py-2.5 px-3">Archivo PDF</th>
                            <th className="py-2.5 px-3 text-right">Adjudicar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                          {qSuppliers.map((sup, idx) => {
                            const meta = getMeta(sup.stage);
                            const isSelected = sup.stage === 'SELECCIONADO';
                            return (
                              <tr key={sup.id || idx} className={isSelected ? 'bg-rose-50/60 dark:bg-rose-950/20' : 'hover:bg-slate-50/50 dark:hover:bg-zinc-800/30'}>
                                <td className="py-2.5 px-3">
                                  <div className="font-bold text-slate-900 dark:text-white">{sup.supplierName}</div>
                                  {sup.phone && <div className="text-[10px] text-slate-400">📞 {sup.phone}</div>}
                                </td>
                                <td className="py-2.5 px-3">
                                  <select 
                                    value={sup.stage || 'CONSULTADO'} 
                                    onChange={e => handleStageChange(q, idx, e.target.value)} 
                                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold outline-none cursor-pointer ${meta.colorClass}`}
                                  >
                                    {STAGES.map(st => <option key={st.key} value={st.key}>{st.label}</option>)}
                                  </select>
                                </td>
                                <td className="py-2.5 px-3">
                                  <input 
                                    type="number" 
                                    defaultValue={sup.quotedAmount || ''} 
                                    placeholder="$ 0" 
                                    onBlur={e => handleAmountChange(q, idx, e.target.value)} 
                                    className="w-28 px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white focus:ring-1 focus:ring-rose-500" 
                                  />
                                </td>
                                <td className="py-2.5 px-3">
                                  {sup.pdfPath ? (
                                    <a 
                                      href={sup.pdfPath} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 font-bold text-[11px] hover:bg-rose-100"
                                    >
                                      <i className="fa-solid fa-file-pdf"></i> Ver PDF
                                    </a>
                                  ) : (
                                    <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-dashed border-sky-300 dark:border-sky-800 font-semibold text-[11px] cursor-pointer hover:bg-sky-100">
                                      <i className="fa-solid fa-upload"></i> Adjuntar PDF
                                      <input type="file" accept=".pdf,image/*" className="hidden" onChange={e => handlePdfUpload(q, idx, e.target.files[0])} />
                                    </label>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  {isSelected ? (
                                    <span className="bg-rose-600 text-white px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase">
                                      🏆 ADJUDICADO
                                    </span>
                                  ) : (
                                    <button 
                                      onClick={() => handleStageChange(q, idx, 'SELECCIONADO')} 
                                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 text-[11px] font-bold hover:bg-emerald-100"
                                    >
                                      <i className="fa-solid fa-check mr-1"></i> Escoger
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL NUEVA SOLICITUD */}
      {isModalOpen && editingQuotation && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 dark:border-zinc-800 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center text-xs">
                  <i className="fa-solid fa-file-circle-plus"></i>
                </span>
                Nueva Solicitud de Cotización
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <i className="fa-solid fa-xmark text-sm"></i>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Código *</label>
                  <input type="text" value={editingQuotation.code} onChange={e => setEditingQuotation({...editingQuotation, code: e.target.value})} className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Categoría</label>
                  <select value={editingQuotation.category} onChange={e => setEditingQuotation({...editingQuotation, category: e.target.value})} className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white">
                    <option value="Insumos / Alimentos">Insumos / Alimentos</option>
                    <option value="Empaques y Plásticos">Empaques y Plásticos</option>
                    <option value="Mantenimiento Industrial">Mantenimiento Industrial</option>
                    <option value="Transporte y Logística">Transporte y Logística</option>
                    <option value="Tecnología (TI)">Tecnología (TI)</option>
                    <option value="Servicios Generales">Servicios Generales</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Título / Requerimiento *</label>
                <input type="text" placeholder="ej: Suministro de Harina de Trigo o Cajas" value={editingQuotation.title} onChange={e => setEditingQuotation({...editingQuotation, title: e.target.value})} className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white" />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Detalles / Cantidades</label>
                <textarea rows="3" placeholder="Describe cantidades, condiciones de entrega..." value={editingQuotation.description} onChange={e => setEditingQuotation({...editingQuotation, description: e.target.value})} className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Urgencia</label>
                  <select value={editingQuotation.urgency} onChange={e => setEditingQuotation({...editingQuotation, urgency: e.target.value})} className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white">
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Fecha Límite</label>
                  <input type="date" value={editingQuotation.deadline} onChange={e => setEditingQuotation({...editingQuotation, deadline: e.target.value})} className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white" />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50">Cancelar</button>
                <button 
                  type="button" 
                  onClick={() => { 
                    if (!editingQuotation.title || !editingQuotation.code) { 
                      return Swal.fire('Campos requeridos', 'Ingresa código y título.', 'warning'); 
                    } 
                    onSaveQuotation(editingQuotation); 
                    setIsModalOpen(false); 
                    Swal.fire('Guardado', 'Solicitud registrada en MySQL.', 'success'); 
                  }} 
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20"
                >
                  <i className="fa-solid fa-save mr-1"></i> Guardar Requerimiento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.CrmModule = CrmModule;