// public/components/AreasModule.js
// Módulo de Áreas Organizacionales (Directores, Jefes/Coordinadores y Control de Recursos)

function AreasModule({ areas, onSaveArea, onDeleteArea }) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredAreas = React.useMemo(() => {
    return (areas || []).filter(a => {
      const term = searchTerm.toLowerCase();
      return (
        (a.name || '').toLowerCase().includes(term) ||
        (a.director || '').toLowerCase().includes(term) ||
        (a.headOrCoord || '').toLowerCase().includes(term) ||
        (a.email || '').toLowerCase().includes(term)
      );
    });
  }, [areas, searchTerm]);

  // Modal para Crear o Editar Área
  const handleOpenAreaModal = (areaToEdit = null) => {
    const isEdit = !!areaToEdit;

    Swal.fire({
      title: `<div class="text-base font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center text-sm">
          <i class="fa-solid fa-sitemap"></i>
        </span>
        ${isEdit ? 'Editar Área Organizacional' : 'Nueva Área Organizacional'}
      </div>`,
      html: `
        <div class="space-y-3.5 text-left text-xs text-slate-600 dark:text-slate-300">
          <div>
            <label class="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Nombre del Área / Departamento *</label>
            <input id="swAreaName" class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" placeholder="ej: Operaciones & Planta" value="${areaToEdit ? areaToEdit.name : ''}">
          </div>

          <div>
            <label class="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">👑 1er Responsable (Director del Área) *</label>
            <input id="swAreaDirector" class="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" placeholder="ej: Ing. Fernando Castro (Director Operaciones)" value="${areaToEdit ? areaToEdit.director : ''}">
          </div>

          <div>
            <label class="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">🛡️ 2do Responsable (Jefe de Área o Coordinador)</label>
            <input id="swAreaHead" class="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" placeholder="ej: Mauricio Pardo (Jefe de Planta)" value="${areaToEdit ? (areaToEdit.headOrCoord || '') : ''}">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Correo Electrónico</label>
              <input id="swAreaEmail" type="email" class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" placeholder="ej: planta@alimentosenriko.com" value="${areaToEdit ? (areaToEdit.email || '') : ''}">
            </div>
            <div>
              <label class="block font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">Límite Presupuestal Anual ($)</label>
              <input id="swAreaBudget" type="number" class="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-mono" placeholder="ej: 35000000" value="${areaToEdit ? (areaToEdit.budgetLimit || '0') : '0'}">
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: isEdit ? '<i class="fa-solid fa-floppy-disk mr-1"></i> Guardar Cambios' : '<i class="fa-solid fa-plus mr-1"></i> Registrar Área',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      customClass: {
        popup: 'rounded-3xl shadow-2xl border border-slate-100 dark:border-zinc-800 dark:bg-zinc-900',
        confirmButton: 'rounded-xl text-xs font-bold py-2.5 px-4',
        cancelButton: 'rounded-xl text-xs font-bold py-2.5 px-4'
      }
    }).then((res) => {
      if (res.isConfirmed) {
        const name = (document.getElementById('swAreaName').value || '').trim();
        const director = (document.getElementById('swAreaDirector').value || '').trim();
        const headOrCoord = (document.getElementById('swAreaHead').value || '').trim();
        const email = (document.getElementById('swAreaEmail').value || '').trim();
        const budgetLimit = Number(document.getElementById('swAreaBudget').value) || 0;

        if (!name || !director) {
          return Swal.fire('Campos requeridos', 'Por favor ingresa el nombre del área y el Director (1er responsable).', 'warning');
        }

        const payload = {
          id: areaToEdit ? areaToEdit.id : ('area-' + Date.now()),
          name,
          director,
          headOrCoord,
          email,
          budgetLimit
        };

        if (onSaveArea) onSaveArea(payload);
      }
    });
  };

  return (
    <div className="space-y-5 animate-fade-in pb-10">
      {/* HEADER DEL MÓDULO */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 text-white flex items-center justify-center text-xl shadow-lg shadow-rose-500/20">
            <i className="fa-solid fa-sitemap"></i>
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Estructura Organizacional & Áreas
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Directores de área (1er responsable), coordinadores (2do responsable) y control de recursos tecnológicos.
            </p>
          </div>
        </div>

        <button 
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer" 
          onClick={() => handleOpenAreaModal()}
        >
          <i className="fa-solid fa-plus text-xs"></i>
          <span>Nueva Área</span>
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
            placeholder="Buscar por área, director o coordinador..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {searchTerm && (
          <button 
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            onClick={() => setSearchTerm('')}
          >
            <i className="fa-solid fa-rotate-right text-xs"></i>
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* CARDS / GRID DE ÁREAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAreas.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-zinc-900 p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 text-slate-400">
            <i className="fa-solid fa-building-circle-xmark text-4xl mb-3 text-slate-300 dark:text-zinc-700 block"></i>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No se encontraron áreas organizacionales registradas</p>
            <p className="text-xs text-slate-400 mt-1">Haz clic en "Nueva Área" para dar de alta una nueva división.</p>
          </div>
        ) : (
          filteredAreas.map((area) => {
            const assignedTech = Number(area.assignedTechItems) || 0;
            const budgetCount = Number(area.budgetItemsCount) || 0;
            const totalBud = Number(area.calculatedBudgetSum) || 0;

            return (
              <div 
                key={area.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500"></div>

                <div>
                  <div className="flex items-start justify-between gap-3 mb-3 pt-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {area.name}
                      </h3>
                      {area.email && (
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                          <i className="fa-regular fa-envelope text-slate-400 text-[10px]"></i>
                          <span>{area.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-90">
                      <button 
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors text-xs"
                        onClick={() => handleOpenAreaModal(area)}
                        title="Editar área"
                      >
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button>

                      <button 
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-xs"
                        onClick={() => {
                          Swal.fire({
                            title: `¿Eliminar ${area.name}?`,
                            text: 'Se removerá de la estructura organizacional.',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'Sí, eliminar',
                            cancelButtonText: 'Cancelar',
                            confirmButtonColor: '#e11d48'
                          }).then(res => {
                            if (res.isConfirmed && onDeleteArea) onDeleteArea(area.id);
                          });
                        }}
                        title="Eliminar área"
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  </div>

                  {/* RESPONSABLES */}
                  <div className="bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-100 dark:border-zinc-800 space-y-2 mb-4">
                    <div>
                      <div className="text-[9px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                        <span>👑 1er Responsable (Director):</span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        {area.director}
                      </div>
                    </div>

                    {area.headOrCoord && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-zinc-700/60">
                        <div className="text-[9px] font-extrabold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1">
                          <span>🛡️ 2do Responsable (Jefe / Coord):</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                          {area.headOrCoord}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CONTADORES EN TIEMPO REAL */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-dashed border-slate-200 dark:border-zinc-800">
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 p-2.5 rounded-xl text-center">
                    <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">Equipos Custodia</div>
                    <div className="text-sm font-black text-emerald-800 dark:text-emerald-300 font-mono mt-0.5">
                      {assignedTech} <span className="text-[10px] font-sans font-medium">uds</span>
                    </div>
                  </div>

                  <div className="bg-fuchsia-50 dark:bg-fuchsia-950/30 border border-fuchsia-200/60 dark:border-fuchsia-900/40 p-2.5 rounded-xl text-center">
                    <div className="text-[10px] font-bold text-fuchsia-700 dark:text-fuchsia-400 uppercase tracking-tight">Presupuesto TI</div>
                    <div className="text-xs font-black text-fuchsia-800 dark:text-fuchsia-300 font-mono mt-0.5">
                      ${totalBud > 0 ? (totalBud / 1000000).toFixed(1) + 'M' : '0'} <span className="text-[10px] font-sans font-normal opacity-80">({budgetCount})</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

window.AreasModule = AreasModule;
