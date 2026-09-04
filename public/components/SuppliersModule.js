// SuppliersModule.js - Gestor de proveedores y facturas mensuales

function SuppliersModule({ suppliers, invoices = [], onAddSupplier, onEditSupplier, onDeleteSupplier, onUpdateSupplierServices }) {
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
              <th>Facturas Registradas</th>
              <th>Área Asignada</th>
              <th style={{textAlign: 'right'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(!suppliers || suppliers.length === 0) ? (
              <tr>
                <td colSpan="8" style={{textAlign: 'center', padding: '32px', color: '#64748b'}}>
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                    <i className="fa-solid fa-users" style={{fontSize: '28px', color: '#cbd5e1'}}></i>
                    <span style={{fontWeight: 700}}>No hay proveedores registrados en la Base de Datos.</span>
                    <button className="btn-red-action" style={{marginTop: '6px'}} onClick={onAddSupplier}>
                      <i className="fa-solid fa-plus"></i> Registrar Primer Proveedor
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              suppliers.map(sup => {
              const isExpanded = expandedSupplierId === sup.id;
              const services = sup.services || [];
              const enabledCount = services.filter(s => s.enabled !== false).length;

              // Conteo real de facturas existentes en la base de datos para este proveedor
              const realInvoicesCount = (invoices || []).filter(inv => {
                const sameSupName = (inv.supplier || '').trim().toLowerCase() === (sup.name || '').trim().toLowerCase();
                const isReal = inv.invoiceNumber || inv.value > 0 || inv.pdfPath || (inv.id && !inv.id.startsWith('auto-'));
                return sameSupName && isReal;
              }).length;

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
                      {services.length > 0 && (
                        <span style={{fontSize: '10px', marginLeft: '6px', color: '#64748b', fontWeight: 600}}>
                          ({enabledCount} de {services.length} servicios activos)
                        </span>
                      )}
                    </td>

                    <td>{sup.contact || '—'}</td>
                    <td>{sup.phone || '—'}</td>
                    <td>
                      <span style={{
                        fontWeight: 800, 
                        color: realInvoicesCount > 0 ? '#16a34a' : '#94a3b8',
                        background: realInvoicesCount > 0 ? '#dcfce7' : '#f1f5f9',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: realInvoicesCount > 0 ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
                      }}>
                        <i className={realInvoicesCount > 0 ? "fa-solid fa-file-invoice-dollar" : "fa-regular fa-file"}></i>
                        {realInvoicesCount} {realInvoicesCount === 1 ? 'factura' : 'facturas'}
                      </span>
                    </td>
                    <td>
                      <span style={{background: '#e0e7ff', color: '#3730a3', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800}}>
                        {sup.area || 'General'}
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
                        title={isExpanded ? "Contraer servicios" : "Configurar servicios"}
                      >
                        <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`} style={{fontSize: '12px'}}></i>
                        <span>{isExpanded ? 'Contraer' : 'Servicios'}</span>
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

                  {/* SUBFILA DESPLEGABLE CON LAS FILAS DE SERVICIOS / FACTURAS ESPERADAS */}
                  {isExpanded && (
                    <tr>
                      <td colSpan="8" style={{padding: 0}}>
                        <div className="supplier-subrow-box">
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px'}}>
                            <strong style={{fontSize: '12px', color: '#0f172a'}}>
                              ⚙️ Configuración de Servicios / Conceptos Facturables — {sup.name}:
                            </strong>
                            <span style={{fontSize: '11px', color: '#64748b'}}>
                              Usa el interruptor <strong>ON / OFF</strong> para generar o suspender la fila automática en el módulo de facturación
                            </span>
                          </div>

                          {services.length === 0 ? (
                            <div style={{padding: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', fontStyle: 'italic'}}>
                              Este proveedor no tiene servicios recurrentes configurados aún.
                            </div>
                          ) : (
                            services.map((srv, sIdx) => {
                              const isEnabled = srv.enabled !== false;
                              return (
                                <div key={srv.id || sIdx} className="service-item-row">
                                  <span style={{fontFamily: 'monospace', fontWeight: 800, fontSize: '11px', color: '#e11d48', width: '85px'}}>
                                    Servicio #{sIdx + 1}
                                  </span>
                                  
                                  <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <label style={{fontSize: '11px', fontWeight: 700, color: '#64748b'}}>Concepto:</label>
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
                            })
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            }))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.SuppliersModule = SuppliersModule;