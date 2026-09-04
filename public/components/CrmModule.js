function CrmModule({ suppliers = [], quotations = [], onSaveQuotation, onDeleteQuotation, onUploadPdf }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('TODOS');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingQuotation, setEditingQuotation] = React.useState(null);

  const STAGES = [
    { key: 'EN_BUSQUEDA', label: 'En Búsqueda', color: '#64748b', bg: '#f1f5f9' },
    { key: 'CONSULTADO', label: 'Consultado', color: '#0284c7', bg: '#e0f2fe' },
    { key: 'COTIZANDO', label: 'En Espera Cotización', color: '#d97706', bg: '#fef3c7' },
    { key: 'COTIZADO', label: 'Cotización Recibida', color: '#16a34a', bg: '#dcfce7' },
    { key: 'SELECCIONADO', label: 'Ganador / Aprobado', color: '#e11d48', bg: '#ffe4e6' },
    { key: 'DESCARTADO', label: 'Descartado', color: '#94a3b8', bg: '#f8fafc' }
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
    <div className="dashboard-container" style={{paddingBottom: '40px'}}>
      {/* HEADER */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff', padding:'20px 24px', borderRadius:'20px', border:'1px solid #e2e8f0', flexWrap:'wrap', gap:'16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
          <div style={{width:'46px', height:'46px', borderRadius:'14px', background:'linear-gradient(135deg, #e11d48, #be123c)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', boxShadow:'0 4px 12px rgba(225,29,72,0.3)'}}>
            <i className="fa-solid fa-handshake"></i>
          </div>
          <div>
            <h1 style={{fontSize:'18px', fontWeight:900, color:'#0f172a', margin:0}}>CRM de Cotizaciones & Proveedores</h1>
            <p style={{fontSize:'12px', color:'#64748b', margin:'2px 0 0', fontWeight:600}}>Pipeline de compras: En Búsqueda ➔ Consultado ➔ En Espera ➔ Cotizado ➔ Adjudicado</p>
          </div>
        </div>
        <button className="btn-red-action" onClick={() => { setEditingQuotation({ id: 'crm-' + Date.now(), code: 'REQ-' + new Date().getFullYear() + '-' + (quotations.length + 1).toString().padStart(3, '0'), title: '', category: 'Insumos / Alimentos', description: '', urgency: 'Media', deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0], status: 'EN_BUSQUEDA', suppliers: [] }); setIsModalOpen(true); }} style={{padding:'12px 20px', fontSize:'13px', display:'flex', alignItems:'center', gap:'8px'}}>
          <i className="fa-solid fa-plus-circle"></i>
          <span>Nueva Solicitud de Cotización</span>
        </button>
      </div>

      {/* KPIS */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'12px'}}>
        <div style={{background:'#fff', padding:'16px', borderRadius:'16px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'12px'}}>
          <div style={{width:'40px', height:'40px', borderRadius:'12px', background:'#eff6ff', color:'#2563eb', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'}}><i className="fa-solid fa-layer-group"></i></div>
          <div><div style={{fontSize:'11px', fontWeight:800, color:'#64748b', textTransform:'uppercase'}}>Total Solicitudes</div><div style={{fontSize:'20px', fontWeight:900, color:'#0f172a'}}>{metrics.total}</div></div>
        </div>
        <div style={{background:'#fff', padding:'16px', borderRadius:'16px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'12px'}}>
          <div style={{width:'40px', height:'40px', borderRadius:'12px', background:'#fef3c7', color:'#d97706', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'}}><i className="fa-solid fa-magnifying-glass"></i></div>
          <div><div style={{fontSize:'11px', fontWeight:800, color:'#64748b', textTransform:'uppercase'}}>En Búsqueda</div><div style={{fontSize:'20px', fontWeight:900, color:'#d97706'}}>{metrics.inSearch}</div></div>
        </div>
        <div style={{background:'#fff', padding:'16px', borderRadius:'16px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'12px'}}>
          <div style={{width:'40px', height:'40px', borderRadius:'12px', background:'#e0f2fe', color:'#0284c7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'}}><i className="fa-solid fa-hourglass-half"></i></div>
          <div><div style={{fontSize:'11px', fontWeight:800, color:'#64748b', textTransform:'uppercase'}}>En Negociación</div><div style={{fontSize:'20px', fontWeight:900, color:'#0284c7'}}>{metrics.inProcess}</div></div>
        </div>
        <div style={{background:'#fff', padding:'16px', borderRadius:'16px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'12px'}}>
          <div style={{width:'40px', height:'40px', borderRadius:'12px', background:'#dcfce7', color:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px'}}><i className="fa-solid fa-circle-check"></i></div>
          <div><div style={{fontSize:'11px', fontWeight:800, color:'#64748b', textTransform:'uppercase'}}>Adjudicadas</div><div style={{fontSize:'20px', fontWeight:900, color:'#16a34a'}}>{metrics.completed}</div></div>
        </div>
      </div>

      {/* BUSQUEDA & FILTROS */}
      <div style={{display:'flex', gap:'12px', background:'#fff', padding:'12px 16px', borderRadius:'16px', border:'1px solid #e2e8f0', alignItems:'center', flexWrap:'wrap'}}>
        <div style={{position:'relative', flex:1, minWidth:'240px'}}>
          <i className="fa-solid fa-search" style={{position:'absolute', left:'12px', top:'11px', color:'#94a3b8', fontSize: '13px'}}></i>
          <input type="text" placeholder="Buscar requerimiento, producto o proveedor..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{width:'100%', padding:'8px 12px 8px 34px', borderRadius:'10px', border:'1px solid #cbd5e1', fontSize:'13px', outline:'none', boxSizing:'border-box'}} />
        </div>
        <div style={{display:'flex', gap:'6px', overflowX:'auto'}}>
          {[{key:'TODOS', label:'Todas'}, {key:'EN_BUSQUEDA', label:'🔍 En Búsqueda'}, {key:'EN_PROCESO', label:'⏳ En Negociación'}, {key:'FINALIZADO', label:'🏆 Adjudicadas'}].map(tab => (
            <button key={tab.key} onClick={() => setStatusFilter(tab.key)} style={{padding:'8px 14px', borderRadius:'10px', border:statusFilter===tab.key?'1px solid #e11d48':'1px solid #e2e8f0', background:statusFilter===tab.key?'#fff1f2':'#f8fafc', color:statusFilter===tab.key?'#e11d48':'#64748b', fontWeight:800, fontSize:'12px', cursor:'pointer', whiteSpace:'nowrap'}}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* LISTADO PIPELINES */}
      <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
        {filtered.length === 0 ? (
          <div style={{background:'#ffffff', padding:'48px 24px', borderRadius:'20px', border:'1px dashed #cbd5e1', textAlign:'center'}}>
            <div style={{fontSize:'40px', color:'#cbd5e1', marginBottom:'12px'}}><i className="fa-solid fa-file-circle-question"></i></div>
            <h3 style={{fontSize:'16px', fontWeight:800, color:'#334155'}}>No hay requerimientos registrados</h3>
            <p style={{fontSize:'12px', color:'#64748b', maxWidth:'400px', margin:'6px auto 16px'}}>Crea tu primera solicitud para gestionar la cotización con varios proveedores.</p>
            <button className="btn-red-action" onClick={() => { setEditingQuotation({ id: 'crm-' + Date.now(), code: 'REQ-' + new Date().getFullYear() + '-' + (quotations.length + 1).toString().padStart(3, '0'), title: '', category: 'Insumos / Alimentos', description: '', urgency: 'Media', deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0], status: 'EN_BUSQUEDA', suppliers: [] }); setIsModalOpen(true); }}><i className="fa-solid fa-plus"></i> Crear Solicitud de Cotización</button>
          </div>
        ) : (
          filtered.map(q => {
            const qSuppliers = q.suppliers || [];
            return (
              <div key={q.id} style={{background:'#ffffff', borderRadius:'20px', border:'1px solid #e2e8f0', boxShadow:'0 2px 8px rgba(0,0,0,0.03)', overflow:'hidden'}}>
                <div style={{padding:'16px 20px', background:'#f8fafc', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap'}}>
                    <span style={{background:'#e11d48', color:'#fff', fontSize:'11px', fontWeight:900, padding:'3px 8px', borderRadius:'6px'}}>{q.code}</span>
                    <h3 style={{fontSize:'15px', fontWeight:900, color:'#0f172a', margin:0}}>{q.title}</h3>
                    <span style={{background:'#f1f5f9', color:'#475569', padding:'3px 8px', borderRadius:'6px', fontSize:'11px', fontWeight:700}}>📂 {q.category}</span>
                    <span style={{background:q.urgency==='Alta'?'#fee2e2':'#fef3c7', color:q.urgency==='Alta'?'#b91c1c':'#92400e', padding:'3px 8px', borderRadius:'6px', fontSize:'11px', fontWeight:800}}>⚡ {q.urgency}</span>
                  </div>
                  <button onClick={() => { Swal.fire({title:'¿Eliminar?', text:'Se borrará ' + q.code, icon:'warning', showCancelButton:true, confirmButtonColor:'#e11d48'}).then(r=>{if(r.isConfirmed) onDeleteQuotation(q.id);}); }} style={{background:'#fff1f2', border:'1px solid #fecdd3', color:'#e11d48', padding:'6px 10px', borderRadius:'8px', fontSize:'12px', fontWeight:700, cursor:'pointer'}}><i className="fa-solid fa-trash"></i></button>
                </div>

                <div style={{padding:'16px 20px'}}>
                  {q.description && <p style={{fontSize:'12px', color:'#475569', marginBottom:'14px', lineHeight:1.4}}><strong>Especificaciones:</strong> {q.description}</p>}

                  {/* SELECTOR INVITAR PROVEEDOR */}
                  <div style={{display:'flex', alignItems:'center', gap:'10px', background:'#f8fafc', padding:'10px 14px', borderRadius:'12px', border:'1px solid #e2e8f0', marginBottom:'16px', flexWrap:'wrap'}}>
                    <span style={{fontSize:'12px', fontWeight:800, color:'#334155'}}>➕ Invitar Proveedor a Cotizar:</span>
                    <select id={'select-sup-' + q.id} style={{padding:'6px 12px', borderRadius:'8px', border:'1px solid #cbd5e1', fontSize:'12px', fontWeight:700, outline:'none', flex:1, minWidth:'200px'}}>
                      <option value="">-- Seleccionar Proveedor del Catálogo --</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.nit}) - {s.area}</option>)}
                    </select>
                    <button onClick={() => { const sel = document.getElementById('select-sup-' + q.id); const supObj = suppliers.find(s => s.id === sel.value); if(supObj) { handleAddSup(q, supObj); sel.value=''; } else { Swal.fire('Selecciona un Proveedor', 'Elige un proveedor del listado.', 'warning'); } }} style={{background:'#0f172a', color:'#ffffff', border:'none', padding:'7px 14px', borderRadius:'8px', fontSize:'12px', fontWeight:800, cursor:'pointer'}}><i className="fa-solid fa-paper-plane"></i> Invitar Proveedor</button>
                  </div>

                  {/* TABLA DE PROVEEDORES */}
                  {qSuppliers.length === 0 ? (
                    <div style={{textAlign:'center', padding:'14px', color:'#94a3b8', fontSize:'12px', fontStyle:'italic'}}>Aún no has agregado proveedores para esta cotización.</div>
                  ) : (
                    <div style={{overflowX:'auto'}}>
                      <table style={{width:'100%', borderCollapse:'collapse', fontSize:'12px'}}>
                        <thead>
                          <tr style={{borderBottom:'2px solid #e2e8f0', textAlign:'left', color:'#64748b', fontSize:'11px', textTransform:'uppercase'}}>
                            <th style={{padding:'8px 10px'}}>Proveedor</th>
                            <th style={{padding:'8px 10px'}}>Estado del Proveedor</th>
                            <th style={{padding:'8px 10px'}}>Monto Cotizado ($ COP)</th>
                            <th style={{padding:'8px 10px'}}>Archivo PDF</th>
                            <th style={{padding:'8px 10px', textAlign:'right'}}>Adjudicar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {qSuppliers.map((sup, idx) => {
                            const meta = getMeta(sup.stage);
                            const isSelected = sup.stage === 'SELECCIONADO';
                            return (
                              <tr key={sup.id || idx} style={{borderBottom:'1px solid #f1f5f9', background:isSelected?'#fff1f2':'transparent'}}>
                                <td style={{padding:'10px'}}>
                                  <div style={{fontWeight:800, color:'#0f172a'}}>{sup.supplierName}</div>
                                  {sup.phone && <div style={{fontSize:'11px', color:'#64748b'}}>📞 {sup.phone}</div>}
                                </td>
                                <td style={{padding:'10px'}}>
                                  <select value={sup.stage || 'CONSULTADO'} onChange={e => handleStageChange(q, idx, e.target.value)} style={{padding:'5px 10px', borderRadius:'8px', border:'1px solid ' + meta.color, background:meta.bg, color:meta.color, fontWeight:800, fontSize:'11px', outline:'none', cursor:'pointer'}}>
                                    {STAGES.map(st => <option key={st.key} value={st.key}>{st.label}</option>)}
                                  </select>
                                </td>
                                <td style={{padding:'10px'}}>
                                  <input type="number" defaultValue={sup.quotedAmount || ''} placeholder="$ 0" onBlur={e => handleAmountChange(q, idx, e.target.value)} style={{width:'120px', padding:'5px 8px', borderRadius:'6px', border:'1px solid #cbd5e1', fontWeight:800, fontSize:'12px'}} />
                                </td>
                                <td style={{padding:'10px'}}>
                                  {sup.pdfPath ? (
                                    <a href={sup.pdfPath} target="_blank" rel="noreferrer" style={{display:'inline-flex', alignItems:'center', gap:'6px', color:'#e11d48', fontWeight:800, textDecoration:'none', background:'#ffe4e6', padding:'4px 8px', borderRadius:'6px'}}><i className="fa-solid fa-file-pdf"></i> Ver PDF</a>
                                  ) : (
                                    <label style={{display:'inline-flex', alignItems:'center', gap:'6px', color:'#0284c7', fontWeight:700, cursor:'pointer', background:'#f0f9ff', padding:'4px 8px', borderRadius:'6px', border:'1px dashed #7dd3fc'}}>
                                      <i className="fa-solid fa-upload"></i> Adjuntar PDF
                                      <input type="file" accept=".pdf,image/*" style={{display:'none'}} onChange={e => handlePdfUpload(q, idx, e.target.files[0])} />
                                    </label>
                                  )}
                                </td>
                                <td style={{padding:'10px', textAlign:'right'}}>
                                  {isSelected ? (
                                    <span style={{background:'#e11d48', color:'#fff', padding:'4px 10px', borderRadius:'8px', fontSize:'11px', fontWeight:900}}>🏆 GANADOR</span>
                                  ) : (
                                    <button onClick={() => handleStageChange(q, idx, 'SELECCIONADO')} style={{background:'#dcfce7', color:'#166534', border:'1px solid #bbf7d0', padding:'4px 10px', borderRadius:'8px', fontSize:'11px', fontWeight:800, cursor:'pointer'}}><i className="fa-solid fa-check"></i> Escoger</button>
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
        <div style={{position:'fixed', inset:0, background:'rgba(15, 23, 42, 0.6)', backdropFilter:'blur(3px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'16px'}}>
          <div style={{background:'#ffffff', borderRadius:'24px', width:'100%', maxWidth:'520px', padding:'24px', boxShadow:'0 20px 40px rgba(0,0,0,0.2)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
              <h2 style={{fontSize:'16px', fontWeight:900, color:'#0f172a', margin:0}}>Nueva Solicitud de Cotización</h2>
              <button onClick={() => setIsModalOpen(false)} style={{background:'none', border:'none', fontSize:'18px', color:'#94a3b8', cursor:'pointer'}}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <div><label style={{fontSize:'11px', fontWeight:800, color:'#64748b'}}>Código *</label><input type="text" value={editingQuotation.code} onChange={e => setEditingQuotation({...editingQuotation, code:e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'8px', border:'1px solid #cbd5e1', fontSize:'13px', fontWeight:700, marginTop:'4px', boxSizing:'border-box'}} /></div>
                <div><label style={{fontSize:'11px', fontWeight:800, color:'#64748b'}}>Categoría</label><select value={editingQuotation.category} onChange={e => setEditingQuotation({...editingQuotation, category:e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'8px', border:'1px solid #cbd5e1', fontSize:'13px', fontWeight:700, marginTop:'4px', boxSizing:'border-box'}}><option value="Insumos / Alimentos">Insumos / Alimentos</option><option value="Empaques y Plásticos">Empaques y Plásticos</option><option value="Mantenimiento Industrial">Mantenimiento Industrial</option><option value="Transporte y Logística">Transporte y Logística</option><option value="Tecnología (TI)">Tecnología (TI)</option><option value="Servicios Generales">Servicios Generales</option></select></div>
              </div>
              <div><label style={{fontSize:'11px', fontWeight:800, color:'#64748b'}}>Título / Requerimiento *</label><input type="text" placeholder="ej: Suministro de Harina de Trigo o Cajas" value={editingQuotation.title} onChange={e => setEditingQuotation({...editingQuotation, title:e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'8px', border:'1px solid #cbd5e1', fontSize:'13px', fontWeight:700, marginTop:'4px', boxSizing:'border-box'}} /></div>
              <div><label style={{fontSize:'11px', fontWeight:800, color:'#64748b'}}>Detalles / Cantidades</label><textarea rows="3" placeholder="Describe cantidades, condiciones de entrega..." value={editingQuotation.description} onChange={e => setEditingQuotation({...editingQuotation, description:e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'8px', border:'1px solid #cbd5e1', fontSize:'12px', marginTop:'4px', boxSizing:'border-box'}} /></div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                <div><label style={{fontSize:'11px', fontWeight:800, color:'#64748b'}}>Urgencia</label><select value={editingQuotation.urgency} onChange={e => setEditingQuotation({...editingQuotation, urgency:e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'8px', border:'1px solid #cbd5e1', fontSize:'13px', marginTop:'4px', boxSizing:'border-box'}}><option value="Baja">Baja</option><option value="Media">Media</option><option value="Alta">Alta</option></select></div>
                <div><label style={{fontSize:'11px', fontWeight:800, color:'#64748b'}}>Fecha Límite</label><input type="date" value={editingQuotation.deadline} onChange={e => setEditingQuotation({...editingQuotation, deadline:e.target.value})} style={{width:'100%', padding:'8px', borderRadius:'8px', border:'1px solid #cbd5e1', fontSize:'13px', marginTop:'4px', boxSizing:'border-box'}} /></div>
              </div>
              <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'16px'}}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{padding:'10px 16px', borderRadius:'10px', border:'1px solid #cbd5e1', background:'#f8fafc', fontWeight:700, cursor:'pointer'}}>Cancelar</button>
                <button type="button" onClick={() => { if(!editingQuotation.title || !editingQuotation.code) { return Swal.fire('Campos requeridos', 'Ingresa código y título.', 'warning'); } onSaveQuotation(editingQuotation); setIsModalOpen(false); Swal.fire('Guardado', 'Solicitud registrada en MySQL.', 'success'); }} className="btn-red-action" style={{padding:'10px 20px', borderRadius:'10px'}}><i className="fa-solid fa-save"></i> Guardar Requerimiento</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.CrmModule = CrmModule;