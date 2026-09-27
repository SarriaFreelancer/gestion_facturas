// public/components/TechInventoryModule.js
// Módulo de Inventario de Equipos y Periféricos Tecnológicos para Alimentos Enriko

function TechInventoryModule({ inventory, areas, onAddOrUpdateItem, onDeliverItem, onDeleteItem }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Todos');
  const [selectedStatus, setSelectedStatus] = React.useState('Todos');

  const categories = [
    'Todos',
    'Periféricos',
    'Monitores',
    'Equipos de Cómputo',
    'Licencias de AI',
    'Redes & Conectividad',
    'Audio & Video',
    'Accesorios TI'
  ];

  // Métricas de inventario
  const metrics = React.useMemo(() => {
    let totalItems = 0;
    let availableCount = 0;
    let outOfStockCount = 0;
    let totalCategories = new Set();

    (inventory || []).forEach(item => {
      const qty = Number(item.quantity) || 0;
      totalItems += qty;
      if (qty > 0) availableCount++;
      else outOfStockCount++;
      if (item.category) totalCategories.add(item.category);
    });

    return {
      totalItems,
      totalTypes: (inventory || []).length,
      availableCount,
      outOfStockCount,
      categoriesCount: totalCategories.size
    };
  }, [inventory]);

  // Filtrado reactivo
  const filteredInventory = React.useMemo(() => {
    return (inventory || []).filter(item => {
      const matchSearch = 
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.brandModel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.serialCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.areaAssigned || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      if (selectedCategory !== 'Todos' && item.category !== selectedCategory) return false;
      if (selectedStatus !== 'Todos') {
        if (selectedStatus === 'Disponible' && (Number(item.quantity) || 0) <= 0) return false;
        if (selectedStatus === 'Agotado' && (Number(item.quantity) || 0) > 0) return false;
      }
      return true;
    });
  }, [inventory, searchTerm, selectedCategory, selectedStatus]);

  // Modal para Agregar o Editar Equipo
  const handleOpenItemModal = (itemToEdit = null) => {
    const isEdit = !!itemToEdit;
    const areasList = (areas || []).map(a => `<option value="${a.name}" ${itemToEdit && itemToEdit.areaAssigned === a.name ? 'selected' : ''}>${a.name}</option>`).join('');

    Swal.fire({
      title: isEdit ? 'Editar Equipo / Periférico TI' : 'Registrar Equipo / Periférico TI',
      html: `
        <div style="display:flex; flex-direction:column; gap:12px; text-align:left; font-size:12px;">
          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Categoría Tecnológica *</label>
            <select id="swInvCat" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;">
              <option value="Periféricos" ${itemToEdit && itemToEdit.category === 'Periféricos' ? 'selected' : ''}>Periféricos (Mouse, Teclados, Diademas)</option>
              <option value="Monitores" ${itemToEdit && itemToEdit.category === 'Monitores' ? 'selected' : ''}>Monitores & Pantallas</option>
              <option value="Equipos de Cómputo" ${itemToEdit && itemToEdit.category === 'Equipos de Cómputo' ? 'selected' : ''}>Equipos de Cómputo (Laptops, PCs)</option>
              <option value="Licencias de AI" ${itemToEdit && itemToEdit.category === 'Licencias de AI' ? 'selected' : ''}>Licencias de AI (ChatGPT, Copilot, APIs)</option>
              <option value="Redes & Conectividad" ${itemToEdit && itemToEdit.category === 'Redes & Conectividad' ? 'selected' : ''}>Redes & Conectividad (Routers, Switches)</option>
              <option value="Audio & Video" ${itemToEdit && itemToEdit.category === 'Audio & Video' ? 'selected' : ''}>Audio & Video</option>
              <option value="Accesorios TI" ${itemToEdit && itemToEdit.category === 'Accesorios TI' ? 'selected' : ''}>Accesorios TI & Cables</option>
            </select>
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Nombre del Equipo / Elemento *</label>
            <input id="swInvName" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;" placeholder="ej: Mouse Ergonómico Inalámbrico" value="${itemToEdit ? itemToEdit.name : ''}">
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Marca y Modelo</label>
              <input id="swInvBrand" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;" placeholder="ej: Logitech MX Master 3S" value="${itemToEdit ? (itemToEdit.brandModel || '') : ''}">
            </div>
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Serial / Código Activo</label>
              <input id="swInvSerial" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;" placeholder="ej: SN-LOG-9921" value="${itemToEdit ? (itemToEdit.serialCode || '') : ''}">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Cantidad Disponible *</label>
              <input id="swInvQty" type="number" min="0" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:800;" placeholder="ej: 9" value="${itemToEdit ? (itemToEdit.quantity ?? 0) : '1'}">
            </div>
            <div>
              <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Unidad de Medida</label>
              <select id="swInvUnit" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;">
                <option value="Unidades" ${itemToEdit && itemToEdit.unit === 'Unidades' ? 'selected' : ''}>Unidades</option>
                <option value="Kits / Paquetes" ${itemToEdit && itemToEdit.unit === 'Kits / Paquetes' ? 'selected' : ''}>Kits / Paquetes</option>
                <option value="Tokens/Slots" ${itemToEdit && itemToEdit.unit === 'Tokens/Slots' ? 'selected' : ''}>Tokens / Slots / Licencias</option>
                <option value="Cajas" ${itemToEdit && itemToEdit.unit === 'Cajas' ? 'selected' : ''}>Cajas</option>
              </select>
            </div>
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Área Asignada / Custodia</label>
            <select id="swInvArea" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;">
              <option value="Tecnología (TI)" ${itemToEdit && itemToEdit.areaAssigned === 'Tecnología (TI)' ? 'selected' : ''}>Tecnología (TI) [Custodia General]</option>
              ${areasList}
            </select>
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Notas / Observaciones</label>
            <textarea id="swInvNotes" class="swal2-textarea" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:12px; height:60px;" placeholder="Detalles de ubicación, garantías o especificaciones...">${itemToEdit ? (itemToEdit.notes || '') : ''}</textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: isEdit ? 'Guardar Cambios' : 'Registrar en Inventario',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48',
      focusConfirm: false
    }).then((res) => {
      if (res.isConfirmed) {
        const category = document.getElementById('swInvCat').value;
        const name = (document.getElementById('swInvName').value || '').trim();
        const brandModel = (document.getElementById('swInvBrand').value || '').trim();
        const serialCode = (document.getElementById('swInvSerial').value || '').trim();
        const quantity = Number(document.getElementById('swInvQty').value);
        const unit = document.getElementById('swInvUnit').value;
        const areaAssigned = document.getElementById('swInvArea').value;
        const notes = (document.getElementById('swInvNotes').value || '').trim();

        if (!name) {
          return Swal.fire('Campo requerido', 'Por favor ingresa el nombre del equipo o periférico.', 'warning');
        }

        const payload = {
          id: itemToEdit ? itemToEdit.id : ('ti-' + Date.now()),
          category,
          name,
          brandModel,
          serialCode,
          quantity: isNaN(quantity) ? 0 : quantity,
          unit,
          areaAssigned,
          status: quantity > 0 ? 'Disponible' : 'Agotado',
          notes
        };

        if (onAddOrUpdateItem) onAddOrUpdateItem(payload);
      }
    });
  };

  // Modal para Acción ENTREGAR EQUIPO (Disminuye cantidad disponible)
  const handleOpenDeliverModal = (item) => {
    const currentQty = Number(item.quantity) || 0;
    if (currentQty <= 0) {
      return Swal.fire('Sin Stock', `No hay unidades disponibles de ${item.name} para entregar.`, 'warning');
    }

    const areasList = (areas || []).map(a => `<option value="${a.name}">${a.name}</option>`).join('');

    Swal.fire({
      title: `Entregar: ${item.name}`,
      html: `
        <div style="display:flex; flex-direction:column; gap:12px; text-align:left; font-size:12px;">
          <div style="background:#fef2f2; border:1px solid #fecdd3; border-radius:10px; padding:12px; color:#9f1239;">
            <div style="font-weight:900; font-size:13px; display:flex; align-items:center; gap:6px;">
              <i class="fa-solid fa-box-open text-rose-600"></i> Stock Disponible Actual: ${currentQty} ${item.unit || 'uds'}
            </div>
            <div style="font-size:11px; margin-top:2px; color:#be123c;">Al confirmar, la cantidad en inventario disminuirá automáticamente.</div>
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">¿Cuántas unidades deseas entregar? *</label>
            <input id="swDelivQty" type="number" min="1" max="${currentQty}" value="1" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:14px; font-weight:800;">
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Área Solicitante / Destino *</label>
            <select id="swDelivArea" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px; font-weight:700;">
              ${areasList}
            </select>
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Persona / Responsable que Recibe</label>
            <input id="swDelivPerson" class="swal2-input" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:13px;" placeholder="ej: Juan Pérez (Diseñador)">
          </div>

          <div>
            <label style="font-weight:700; color:#64748b; text-transform:uppercase; font-size:10px;">Observaciones / Motivo de Entrega</label>
            <textarea id="swDelivNotes" class="swal2-textarea" style="width:100%; margin:4px 0 0; padding:8px 12px; font-size:12px; height:50px;" placeholder="ej: Asignación por nuevo ingreso o reposición..."></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar Entrega',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48',
      focusConfirm: false
    }).then((res) => {
      if (res.isConfirmed) {
        const qtyToDeliver = Number(document.getElementById('swDelivQty').value);
        const area = document.getElementById('swDelivArea').value;
        const person = (document.getElementById('swDelivPerson').value || '').trim();
        const notes = (document.getElementById('swDelivNotes').value || '').trim();

        if (isNaN(qtyToDeliver) || qtyToDeliver < 1) {
          return Swal.fire('Cantidad inválida', 'Debes ingresar al menos 1 unidad para entregar.', 'warning');
        }
        if (qtyToDeliver > currentQty) {
          return Swal.fire('Excede disponible', `Solo tienes ${currentQty} ${item.unit || 'uds'} disponibles.`, 'error');
        }

        if (onDeliverItem) {
          onDeliverItem({
            id: item.id,
            quantityToDeliver: qtyToDeliver,
            deliveredToArea: area,
            recipientName: person,
            notes
          });
        }
      }
    });
  };

  // Exportar Inventario Disponible a Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      if (typeof XLSX === 'undefined') {
        return Swal.fire('Librería no lista', 'Cargando módulo de Excel...', 'info');
      }

      const rowsData = filteredInventory.map((item, idx) => ({
        '#': idx + 1,
        'Categoría': item.category,
        'Equipo / Periférico': item.name,
        'Marca / Modelo': item.brandModel || 'N/A',
        'Serial / Código': item.serialCode || 'N/A',
        'Cantidad Disponible': Number(item.quantity) || 0,
        'Unidad': item.unit || 'Unidades',
        'Área Custodia / Asignada': item.areaAssigned || 'Tecnología (TI)',
        'Estado': Number(item.quantity) > 0 ? 'DISPONIBLE' : 'AGOTADO',
        'Observaciones': item.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(rowsData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario_TI');
      
      const fileName = `Inventario_TI_Enriko_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      Swal.fire('Excel Exportado', `Reporte "${fileName}" generado exitosamente.`, 'success');
    } catch (err) {
      console.error('Error exportando Excel de inventario:', err);
      Swal.fire('Error', 'No se pudo generar el archivo Excel.', 'error');
    }
  };

  return (
    <div className="dashboard-container">
      {/* HEADER DEL MÓDULO */}
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm mb-5">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Icon name="inventory" size={22} className="text-rose-600" />
            Inventario de Equipos & Periféricos TI
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Control de existencias, licencias de AI, periféricos y entregas a personal y áreas de Alimentos Enriko.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-sm"
          >
            <Icon name="excel" size={15} className="text-white" />
            <span>Exportar Excel</span>
          </button>

          <button 
            onClick={() => handleOpenItemModal()}
            className="btn-red-action"
          >
            <Icon name="plus" size={15} className="text-white" />
            <span>Agregar Equipo</span>
          </button>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-rose-600">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center text-xl flex-shrink-0">
            <Icon name="inventory" size={22} className="text-rose-600" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Unidades Físicas</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{metrics.totalItems}</div>
            <span className="text-[11px] font-medium text-slate-500">{metrics.totalTypes} referencias</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center text-xl flex-shrink-0">
            <Icon name="check" size={22} className="text-emerald-600" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Referencias Disponibles</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{metrics.availableCount}</div>
            <span className="text-[11px] font-bold text-emerald-600">Listas para entrega</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center text-xl flex-shrink-0">
            <Icon name="alerts" size={22} className="text-amber-600" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Referencias Agotadas</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{metrics.outOfStockCount}</div>
            <span className="text-[11px] font-bold text-amber-600">Requieren reposición</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 border-l-4 border-l-purple-500">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center text-xl flex-shrink-0">
            <Icon name="sparkles" size={22} className="text-purple-600" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Categorías Activas</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{metrics.categoriesCount}</div>
            <span className="text-[11px] font-medium text-slate-500">AI, Periféricos, Monitores</span>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-3.5 shadow-sm mb-5 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-3 py-1.5 flex-1 min-w-[220px] focus-within:border-rose-500 focus-within:bg-white dark:focus-within:bg-zinc-800 transition-all">
          <Icon name="search" size={15} className="text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por equipo, marca, modelo, serial o área..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none w-full"
          />
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

        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 rounded-xl px-2.5 py-1.5 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Estado:</span>
          <select 
            value={selectedStatus} 
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-transparent font-bold text-slate-700 dark:text-zinc-200 outline-none cursor-pointer"
          >
            <option value="Todos" className="dark:bg-zinc-900 text-slate-900 dark:text-white">Todos</option>
            <option value="Disponible" className="dark:bg-zinc-900 text-slate-900 dark:text-white">Disponibles (&gt; 0)</option>
            <option value="Agotado" className="dark:bg-zinc-900 text-slate-900 dark:text-white">Agotados (0)</option>
          </select>
        </div>

        <button 
          onClick={() => { setSearchTerm(''); setSelectedCategory('Todos'); setSelectedStatus('Todos'); }}
          className="btn-clean"
        >
          <i className="fa-solid fa-rotate-right text-[11px]"></i>
          <span>Limpiar</span>
        </button>
      </div>

      {/* TABLA DE INVENTARIO */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-850 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                <th className="p-3 w-10 text-center">#</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Equipo / Elemento</th>
                <th className="p-3">Marca / Modelo</th>
                <th className="p-3">Serial / Código</th>
                <th className="p-3 text-center">Disponible</th>
                <th className="p-3">Área Asignada</th>
                <th className="p-3 text-center">Estado</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-400 dark:text-zinc-500">
                    <i className="fa-solid fa-boxes-stacked text-3xl mb-2 block text-slate-300 dark:text-zinc-600"></i>
                    No se encontraron equipos o periféricos con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item, idx) => {
                  const qty = Number(item.quantity) || 0;
                  const isAvailable = qty > 0;
                  const isAi = item.category === 'Licencias de AI';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="p-3 text-center font-bold text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                          isAi 
                            ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700'
                        }`}>
                          {isAi && <i className="fa-solid fa-wand-magic-sparkles text-[9px]"></i>}
                          {item.category}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="font-extrabold text-slate-900 dark:text-white text-xs">{item.name}</div>
                        {item.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[260px] mt-0.5" title={item.notes}>
                            {item.notes}
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-slate-600 dark:text-zinc-300">
                        {item.brandModel || '—'}
                      </td>

                      <td className="p-3 font-mono font-bold text-slate-600 dark:text-zinc-400 text-[11px]">
                        {item.serialCode || '—'}
                      </td>

                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-black text-xs min-w-[36px] ${
                          isAvailable 
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}>
                          {qty}
                        </span>
                        <div className="text-[9px] text-slate-400 mt-0.5">{item.unit || 'Unidades'}</div>
                      </td>

                      <td className="p-3 text-slate-600 dark:text-zinc-300">
                        <i className="fa-solid fa-building-user text-slate-400 mr-1.5 text-[11px]"></i>
                        {item.areaAssigned || 'Tecnología (TI)'}
                      </td>

                      <td className="p-3 text-center">
                        <span className={`status-pill ${isAvailable ? 'pill-delivered' : 'pill-delayed'}`}>
                          {isAvailable ? '● DISPONIBLE' : '○ AGOTADO'}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* BOTÓN ENTREGAR */}
                          <button
                            onClick={() => handleOpenDeliverModal(item)}
                            disabled={!isAvailable}
                            className={`px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                              isAvailable 
                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm cursor-pointer active:scale-95' 
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
                            }`}
                            title="Entregar unidades a un área o persona"
                          >
                            <i className="fa-solid fa-hand-holding-hand text-[11px]"></i>
                            <span>Entregar</span>
                          </button>

                          <button 
                            onClick={() => handleOpenItemModal(item)}
                            className="w-7 h-7 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors"
                            title="Editar"
                          >
                            <i className="fa-regular fa-pen-to-square text-xs"></i>
                          </button>

                          <button 
                            onClick={() => {
                              Swal.fire({
                                title: `¿Eliminar ${item.name}?`,
                                text: 'Se eliminará permanentemente de MySQL.',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonText: 'Sí, eliminar',
                                confirmButtonColor: '#e11d48'
                              }).then(res => {
                                if (res.isConfirmed && onDeleteItem) onDeleteItem(item.id);
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

window.TechInventoryModule = TechInventoryModule;
