const { useState } = React;

function SuppliersModule({ suppliers, onAddSupplier, onEditSupplier, onDeleteSupplier, onUpdateSupplierServices }) {
  const [expandedSupplierId, setExpandedSupplierId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedSupplierId(expandedSupplierId === id ? null : id);
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

  return (
    <div className="dashboard-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0'}}>
        <div>
          <h2 style={{fontSize: '16px', fontWeight: 800}}>👥 Directorio de Proveedores Autorizados</h2>
          <p style={{fontSize: '12px', color: '#64748b'}}>Usa el botón de flecha (⌵ / ⌃) para desplegar y contraer las facturas mensuales de cada proveedor</p>
        </div>
        <button className="btn-red-action" onClick={onAddSupplier}>
          <i className="fa-solid fa-plus"></i> Registrar Proveedor
        </button>
      </div>

      <div className="table-card">
        <table className="main-table">
          <thead>
            <tr>
              <th style={{width: '38px', textAlign: 'center'}}>Ver</th>
              <th>NIT / RUT</th>
              <th>Razón Social</th>
              <th>Asesor Comercial</th>
              <th>Teléfono</th>
              <th>Cuota Mensual</th>
              <th>Área Asignada</th>
              <th style={{textAlign: 'right'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(sup => {
              const isExpanded = expandedSupplierId === sup.id;
              const services = sup.services || [];
              const enabledCount = services.filter(s => s.enabled !== false).length;

              return (
                <React.Fragment key={sup.id}>
                  <tr>
                    {/* BOTÓN ICONO DESPLEGAR / CONTRAER (HACIA ABAJO / HACIA ARRIBA) */}
                    <td style={{textAlign: 'center'}}>
                      <button 
                        style={{
                          background: isExpanded ? '#e11d48' : '#f1f5f9',
                          color: isExpanded ? '#ffffff' : '#475569',
                          border: 'none',
                          width: '28px',
                          height: '28px',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontSize: '13px'
                        }}
                        onClick={() => toggleExpand(sup.id)}
                        title={isExpanded ? "Contraer facturas" : "Desplegar facturas"}
                      >
                        <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                      </button>
                    </td>

                    <td style={{fontFamily: 'monospace', fontWeight: 700}}>{sup.nit}</td>
                    
                    <td style={{fontWeight: 700, color: '#e11d48', cursor: 'pointer'}} onClick={() => toggleExpand(sup.id)}>
                      {sup.name}
                      <span style={{fontSize: '10px', marginLeft: '6px', color: '#64748b', fontWeight: 600}}>
                        ({enabledCount} de {services.length} activas)
                      </span>
                    </td>

                    <td>{sup.contact}</td>
                    <td>{sup.phone}</td>
                    <td style={{fontWeight: 800, color: '#2563eb'}}>
                      📄 {sup.monthlyCount || services.length} facturas/mes
                    </td>
                    <td>
                      <span style={{background: '#e0e7ff', color: '#3730a3', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800}}>
                        {sup.area}
                      </span>
                    </td>
                    <td style={{textAlign: 'right'}}>
                      {/* BOTÓN DESPLEGABLE CON ÍCONO HACIA ABAJO / ARRIBA */}
                      <button 
                        style={{
                          background: isExpanded ? '#fee2e2' : '#eff6ff', 
                          color: isExpanded ? '#e11d48' : '#2563eb', 
                          border: isExpanded ? '1px solid #fca5a5' : '1px solid #bfdbfe', 
                          padding: '5px 12px', 
                          borderRadius: '8px', 
                          fontWeight: 800, 
                          cursor: 'pointer', 
                          marginRight: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '11px',
                          transition: 'all 0.2s'
                        }} 
                        onClick={() => toggleExpand(sup.id)}
                        title={isExpanded ? "Contraer facturas" : "Desplegar facturas"}
                      >
                        <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{fontSize: '12px'}}></i>
                        <span>{isExpanded ? 'Contraer' : 'Facturas'}</span>
                      </button>

                      <button 
                        style={{background: '#eff6ff', color: '#2563eb', border: 'none', padding: '5px 10px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginRight: '6px', fontSize: '11px'}} 
                        onClick={() => onEditSupplier(sup)}
                      >
                        Editar
                      </button>
                      <button 
                        style={{background: '#fee2e2', color: '#e11d48', border: 'none', padding: '5px 10px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '11px'}} 
                        onClick={() => onDeleteSupplier(sup.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>

                  {/* SUBFILA DESPLEGABLE CON LAS N FILAS DE FACTURAS DEL PROVEEDOR */}
                  {isExpanded && (
                    <tr>
                      <td colSpan="8" style={{padding: 0}}>
                        <div className="supplier-subrow-box">
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                            <strong style={{fontSize: '12px', color: '#0f172a'}}>
                              ⚙️ Facturas Mensuales Esperadas ({services.length}) — {sup.name}:
                            </strong>
                            <span style={{fontSize: '11px', color: '#64748b'}}>
                              Usa el interruptor <strong>ON / OFF</strong> para incluir o excluir la factura en el módulo de facturación
                            </span>
                          </div>

                          {services.map((srv, sIdx) => {
                            const isEnabled = srv.enabled !== false;
                            return (
                              <div key={srv.id || sIdx} className="service-item-row">
                                <span style={{fontFamily: 'monospace', fontWeight: 800, fontSize: '11px', color: '#e11d48', width: '85px'}}>
                                  Factura #{sIdx + 1}
                                </span>
                                
                                <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: '8px'}}>
                                  <label style={{fontSize: '11px', fontWeight: 700, color: '#64748b'}}>Servicio:</label>
                                  <input 
                                    type="text" 
                                    className="input-service-name" 
                                    value={srv.serviceName || ''} 
                                    placeholder={`ej: Servicio de ${sIdx === 0 ? 'Mantenimiento' : 'Insumos'}`}
                                    onChange={(e) => handleServiceNameChange(sup, sIdx, e.target.value)}
                                  />
                                </div>

                                {/* INTERRUPTOR SWITCH ON / OFF */}
                                <div 
                                  className="switch-toggle-wrap" 
                                  onClick={() => handleToggleServiceEnable(sup, sIdx)}
                                  title={isEnabled ? "Clic para inhabilitar (OFF)" : "Clic para habilitar (ON)"}
                                >
                                  <div className={`switch-track ${isEnabled ? 'on' : ''}`}>
                                    <div className="switch-thumb"></div>
                                  </div>
                                  <span className={`switch-label-txt ${isEnabled ? 'on' : 'off'}`}>
                                    {isEnabled ? 'ON' : 'OFF'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.SuppliersModule = SuppliersModule;
