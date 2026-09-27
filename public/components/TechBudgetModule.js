// public/components/TechBudgetModule.js
// Módulo de Presupuestos Tecnológicos Anuales para Alimentos Enriko

function TechBudgetModule({ budgets, areas, onSaveBudget, onDeleteBudget }) {
  const [selectedYear, setSelectedYear] = React.useState('2026');
  const [selectedArea, setSelectedArea] = React.useState('Todos');
  const [selectedCategory, setSelectedCategory] = React.useState('Todos');
  const [searchTerm, setSearchTerm] = React.useState('');

  const years = ['Todos', '2026', '2027', '2028', '2029', '2030'];

  const categories = [
    'Todos',
    'Licencias de AI',
    'Periféricos',
    'Monitores',
    'Equipos de Cómputo',
    'Software & Cloud',
    'Infraestructura & Redes',
    'Ciberseguridad'
  ];

  // Filtrado de presupuestos
  const filteredBudgets = React.useMemo(() => {
    return (budgets || []).filter(b => {
      if (selectedYear !== 'Todos' && b.year !== selectedYear) return false;
      if (selectedArea !== 'Todos' && b.area !== selectedArea) return false;
      if (selectedCategory !== 'Todos' && b.category !== selectedCategory) return false;

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const match = 
          (b.itemType || '').toLowerCase().includes(term) ||
          (b.area || '').toLowerCase().includes(term) ||
          (b.category || '').toLowerCase().includes(term) ||
          (b.notes || '').toLowerCase().includes(term);
        if (!match) return false;
      }

      return true;
    });
  }, [budgets, selectedYear, selectedArea, selectedCategory, searchTerm]);

  // Cálculos de KPIs Financieros
  const summaryKpis = React.useMemo(() => {
    let totalEstimated = 0;
    let totalApproved = 0;
    let aiLicensesCost = 0;
    let aiLicensesCount = 0;

    filteredBudgets.forEach(b => {
      const total = Number(b.totalCost) || ((Number(b.quantity) || 1) * (Number(b.unitCost) || 0));
      totalEstimated += total;
      if (b.status === 'Aprobado' || b.status === 'Ejecutado') {
        totalApproved += total;
      }
      if (b.category === 'Licencias de AI') {
        aiLicensesCost += total;
        aiLicensesCount += (Number(b.quantity) || 0);
      }
    });

    return {
      totalEstimated,
      totalApproved,
      itemCount: filteredBudgets.length,
      aiLicensesCost,
      aiLicensesCount
    };
  }, [filteredBudgets]);

  // Modal para Crear o Editar Presupuesto
  const handleOpenBudgetModal = (itemToEdit = null) => {
    const isEdit = !!itemToEdit;
    const areasList = (areas || []).map(a => `<option value="${a.name}" ${itemToEdit && itemToEdit.area === a.name ? 'selected' : ''}>${a.name}</option>`).join('');

    Swal.fire({
      title: isEdit ? 'Editar Ítem de Presupuesto TI' : 'Nuevo Ítem de Presupuesto TI',
      html: `
        <div style="display:flex; flex-direction:column; gap:12px; text-align:left; font-size:12px;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Año Presupuestal *</label>
              <select id="swBudYear" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:800;">
                <option value="2026" ${itemToEdit && itemToEdit.year === '2026' ? 'selected' : ''}>2026</option>
                <option value="2027" ${itemToEdit && itemToEdit.year === '2027' ? 'selected' : ''}>2027</option>
                <option value="2028" ${itemToEdit && itemToEdit.year === '2028' ? 'selected' : ''}>2028</option>
                <option value="2029" ${itemToEdit && itemToEdit.year === '2029' ? 'selected' : ''}>2029</option>
                <option value="2030" ${itemToEdit && itemToEdit.year === '2030' ? 'selected' : ''}>2030</option>
              </select>
            </div>

            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Categoría Tecnológica *</label>
              <select id="swBudCat" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;">
                <option value="Licencias de AI" ${itemToEdit && itemToEdit.category === 'Licencias de AI' ? 'selected' : ''}>🤖 Licencias de AI (ChatGPT, Copilot, APIs)</option>
                <option value="Periféricos" ${itemToEdit && itemToEdit.category === 'Periféricos' ? 'selected' : ''}>🖱️ Periféricos (Kits, Teclados, Mouse)</option>
                <option value="Monitores" ${itemToEdit && itemToEdit.category === 'Monitores' ? 'selected' : ''}>🖥️ Monitores & Pantallas</option>
                <option value="Equipos de Cómputo" ${itemToEdit && itemToEdit.category === 'Equipos de Cómputo' ? 'selected' : ''}>💻 Equipos de Cómputo (Laptops, Servidores)</option>
                <option value="Software & Cloud" ${itemToEdit && itemToEdit.category === 'Software & Cloud' ? 'selected' : ''}>☁️ Software & Servicios Cloud</option>
                <option value="Infraestructura & Redes" ${itemToEdit && itemToEdit.category === 'Infraestructura & Redes' ? 'selected' : ''}>🌐 Infraestructura & Redes</option>
                <option value="Ciberseguridad" ${itemToEdit && itemToEdit.category === 'Ciberseguridad' ? 'selected' : ''}>🛡️ Ciberseguridad & Licenciamiento</option>
              </select>
            </div>
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Área Solicitante / Beneficiaria *</label>
            <select id="swBudArea" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;">
              ${areasList || '<option value="Tecnología (TI)">Tecnología (TI)</option>'}
            </select>
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Descripción / Tipo de Licencia o Equipo *</label>
            <input id="swBudItem" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;" placeholder="ej: OpenAI ChatGPT Enterprise (Slots anuales)" value="${itemToEdit ? itemToEdit.itemType : ''}">
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Cantidad Solicitada *</label>
              <input id="swBudQty" type="number" min="1" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:800;" placeholder="ej: 10" value="${itemToEdit ? itemToEdit.quantity : '1'}">
            </div>
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Costo Unitario Estimado ($ COP) *</label>
              <input id="swBudUnitCost" type="number" step="0.01" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:800;" placeholder="ej: 1200000" value="${itemToEdit ? itemToEdit.unitCost : '0'}">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Prioridad</label>
              <select id="swBudPriority" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;">
                <option value="Alta" ${itemToEdit && itemToEdit.priority === 'Alta' ? 'selected' : ''}>🔴 Alta</option>
                <option value="Media" ${!itemToEdit || itemToEdit.priority === 'Media' ? 'selected' : ''}>🟡 Media</option>
                <option value="Baja" ${itemToEdit && itemToEdit.priority === 'Baja' ? 'selected' : ''}>🟢 Baja</option>
              </select>
            </div>
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Estado de Aprobación</label>
              <select id="swBudStatus" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;">
                <option value="Planificado" ${!itemToEdit || itemToEdit.status === 'Planificado' ? 'selected' : ''}>📋 Planificado</option>
                <option value="En Revisión" ${itemToEdit && itemToEdit.status === 'En Revisión' ? 'selected' : ''}>⏳ En Revisión</option>
                <option value="Aprobado" ${itemToEdit && itemToEdit.status === 'Aprobado' ? 'selected' : ''}>✅ Aprobado</option>
                <option value="Ejecutado" ${itemToEdit && itemToEdit.status === 'Ejecutado' ? 'selected' : ''}>🚀 Ejecutado</option>
              </select>
            </div>
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Justificación / Notas</label>
            <textarea id="swBudNotes" class="swal2-textarea" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:12px; height:60px;" placeholder="Justificación técnica o económica del requerimiento...">${itemToEdit ? (itemToEdit.notes || '') : ''}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: isEdit ? 'Guardar Cambios' : 'Registrar en Presupuesto',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48',
      focusConfirm: false
    }).then((res) => {
      if (res.isConfirmed) {
        const year = document.getElementById('swBudYear').value;
        const category = document.getElementById('swBudCat').value;
        const area = document.getElementById('swBudArea').value;
        const itemType = (document.getElementById('swBudItem').value || '').trim();
        const quantity = Number(document.getElementById('swBudQty').value) || 1;
        const unitCost = Number(document.getElementById('swBudUnitCost').value) || 0;
        const priority = document.getElementById('swBudPriority').value;
        const status = document.getElementById('swBudStatus').value;
        const notes = (document.getElementById('swBudNotes').value || '').trim();

        if (!itemType) {
          return Swal.fire('Campo requerido', 'Por favor ingresa la descripción o tipo de ítem/licencia.', 'warning');
        }

        const payload = {
          id: itemToEdit ? itemToEdit.id : ('bud-' + Date.now()),
          year,
          category,
          area,
          itemType,
          quantity,
          unitCost,
          totalCost: quantity * unitCost,
          priority,
          status,
          notes
        };

        if (onSaveBudget) onSaveBudget(payload);
      }
    });
  };

  // Exportar Presupuestos a Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      if (typeof XLSX === 'undefined') {
        return Swal.fire('Librería no lista', 'Cargando módulo de Excel...', 'info');
      }

      const rowsData = filteredBudgets.map((item, idx) => ({
        '#': idx + 1,
        'Año': item.year,
        'Área Solicitante': item.area,
        'Categoría': item.category,
        'Ítem / Licencia': item.itemType,
        'Cantidad': Number(item.quantity) || 1,
        'Costo Unitario ($)': Number(item.unitCost) || 0,
        'Total Presupuestado ($)': Number(item.totalCost) || 0,
        'Prioridad': item.priority || 'Media',
        'Estado': item.status || 'Planificado',
        'Justificación / Notas': item.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(rowsData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `Presupuestos_${selectedYear}`);
      
      const fileName = `Presupuesto_TI_${selectedYear}_Enriko.xlsx`;
      XLSX.writeFile(workbook, fileName);
      Swal.fire('Excel Exportado', `Reporte "${fileName}" generado exitosamente.`, 'success');
    } catch (err) {
      console.error('Error exportando Excel de presupuestos:', err);
      Swal.fire('Error', 'No se pudo generar el archivo Excel.', 'error');
    }
  };

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm mb-5">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <i className="fa-solid fa-calculator text-rose-600"></i>
            Presupuestos Tecnológicos Anuales
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Planificación de gastos en Licencias de AI, Periféricos, Monitores y Equipos por Área Solicitante.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleExportExcel}
            className="btn-export-excel"
          >
            <i className="fa-regular fa-file-excel text-xs"></i>
            <span>Exportar Excel</span>
          </button>

          <button 
            onClick={() => handleOpenBudgetModal()}
            className="btn-red-action"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>Nuevo Ítem</span>
          </button>
        </div>
      </div>

      {/* KPIS FINANCIEROS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-rose-600">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center text-xl flex-shrink-0">
            <i className="fa-solid fa-dollar-sign"></i>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Presupuesto Proyectado ({selectedYear})</span>
            <div className="text-xl font-black text-slate-900 dark:text-white leading-tight font-mono">
              ${summaryKpis.totalEstimated.toLocaleString('es-CO')}
            </div>
            <span className="text-[11px] font-medium text-slate-500">{summaryKpis.itemCount} rubros planificados</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center text-xl flex-shrink-0">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Presupuesto Aprobado</span>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 leading-tight font-mono">
              ${summaryKpis.totalApproved.toLocaleString('es-CO')}
            </div>
            <span className="text-[11px] font-bold text-emerald-600">Listo para ejecución</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center text-xl flex-shrink-0">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Licencias de AI</span>
            <div className="text-xl font-black text-purple-600 dark:text-purple-400 leading-tight font-mono">
              ${summaryKpis.aiLicensesCost.toLocaleString('es-CO')}
            </div>
            <span className="text-[11px] font-bold text-purple-600">{summaryKpis.aiLicensesCount} slots / licencias</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center text-xl flex-shrink-0">
            <i className="fa-solid fa-building-user"></i>
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Áreas Solicitantes</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{(areas || []).length}</div>
            <span className="text-[11px] font-medium text-slate-500">Direcciones y plantas</span>
          </div>
        </div>
      </div>

      {/* FILTROS POR AÑO, ÁREA Y CATEGORÍA */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-sm mb-5 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-2.5 py-1.5 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Año:</span>
          <select 
            value={selectedYear} 
            onChange={e => setSelectedYear(e.target.value)}
            className="bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer"
          >
            {years.map(y => (
              <option key={y} value={y} className="dark:bg-zinc-900 text-slate-900 dark:text-white">{y}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-2.5 py-1.5 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Área:</span>
          <select 
            value={selectedArea} 
            onChange={e => setSelectedArea(e.target.value)}
            className="bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer max-w-[140px] truncate"
          >
            <option value="Todos" className="dark:bg-zinc-900 text-slate-900 dark:text-white">Todas las áreas</option>
            {(areas || []).map(a => (
              <option key={a.id || a.name} value={a.name} className="dark:bg-zinc-900 text-slate-900 dark:text-white">{a.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-2.5 py-1.5 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Categoría:</span>
          <select 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer"
          >
            {categories.map(c => (
              <option key={c} value={c} className="dark:bg-zinc-900 text-slate-900 dark:text-white">{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-3 py-1.5 flex-1 min-w-[200px] focus-within:border-rose-500 focus-within:bg-white dark:focus-within:bg-zinc-800 transition-all">
          <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Buscar rubro, descripción o justificación..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none w-full"
          />
        </div>

        <button 
          onClick={() => { setSelectedYear('2026'); setSelectedArea('Todos'); setSelectedCategory('Todos'); setSearchTerm(''); }}
          className="btn-clean"
        >
          <i className="fa-solid fa-rotate-right text-[11px]"></i>
          <span>Resetear</span>
        </button>
      </div>

      {/* TABLA DE PRESUPUESTOS */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-850 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                <th className="p-3 w-12 text-center">Año</th>
                <th className="p-3">Área Solicitante</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Ítem / Descripción</th>
                <th className="p-3 text-center">Cantidad</th>
                <th className="p-3 text-right">Costo Unitario</th>
                <th className="p-3 text-right">Total Presupuestado</th>
                <th className="p-3 text-center">Prioridad</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
              {filteredBudgets.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center py-12 text-slate-400 dark:text-zinc-500">
                    <i className="fa-solid fa-calculator text-3xl mb-2 block text-slate-300 dark:text-zinc-600"></i>
                    No se encontraron rubros presupuestales para los filtros indicados.
                  </td>
                </tr>
              ) : (
                filteredBudgets.map((b) => {
                  const total = Number(b.totalCost) || ((Number(b.quantity) || 1) * (Number(b.unitCost) || 0));
                  const isAi = b.category === 'Licencias de AI';

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="p-3 text-center font-black text-rose-600 font-mono text-xs">
                        {b.year}
                      </td>

                      <td className="p-3">
                        <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <i className="fa-solid fa-building-user text-slate-400 text-[11px]"></i>
                          <span>{b.area}</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                          isAi 
                            ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                        }`}>
                          {isAi && <i className="fa-solid fa-wand-magic-sparkles text-[9px]"></i>}
                          {b.category}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="font-extrabold text-slate-900 dark:text-white text-xs">{b.itemType}</div>
                        {b.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[280px] mt-0.5" title={b.notes}>
                            {b.notes}
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-center font-black text-slate-800 dark:text-zinc-200">
                        {b.quantity}
                      </td>

                      <td className="p-3 text-right font-mono text-slate-600 dark:text-zinc-400">
                        ${Number(b.unitCost || 0).toLocaleString('es-CO')}
                      </td>

                      <td className="p-3 text-right font-mono font-black text-slate-900 dark:text-white text-xs">
                        ${total.toLocaleString('es-CO')}
                      </td>

                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          b.priority === 'Alta' 
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400' 
                            : (b.priority === 'Media' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400')
                        }`}>
                          {b.priority || 'Media'}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span className={`status-pill ${
                          b.status === 'Aprobado' ? 'pill-delivered' : (b.status === 'Ejecutado' ? 'pill-facture' : 'pill-pending')
                        }`}>
                          {b.status || 'Planificado'}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => handleOpenBudgetModal(b)}
                            className="w-7 h-7 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors"
                            title="Editar"
                          >
                            <i className="fa-regular fa-pen-to-square text-xs"></i>
                          </button>

                          <button 
                            onClick={() => {
                              Swal.fire({
                                title: `¿Eliminar rubro?`,
                                text: `Se removerá "${b.itemType}" del presupuesto.`,
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonText: 'Sí, eliminar',
                                confirmButtonColor: '#e11d48'
                              }).then(res => {
                                if (res.isConfirmed && onDeleteBudget) onDeleteBudget(b.id);
                              });
                            }}
                            className="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors"
                            title="Eliminar"
                          >
                            <i className="fa-regular fa-trash-can text-xs"></i>
                          </button>
                        </div>
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
}

window.TechBudgetModule = TechBudgetModule;
