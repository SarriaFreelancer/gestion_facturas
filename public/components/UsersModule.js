function UsersModule({ users, onAddUser, currentUser, onDeleteUser }) {
  const isSuperAdmin = currentUser?.role === 'superadmin';

  return (
    <div className="dashboard-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0'}}>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <h2 style={{fontSize: '16px', fontWeight: 800}}>👤 Gestión de Usuarios, Roles & Credenciales</h2>
            {isSuperAdmin && (
              <span style={{background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, border: '1px solid #fde68a'}}>
                👑 Modo Superadmin Habilitado
              </span>
            )}
          </div>
          <p style={{fontSize: '12px', color: '#64748b', marginTop: '2px'}}>Control de cuentas autorizadas con roles superadmin y admin</p>
        </div>
        <button className="btn-red-action" onClick={onAddUser}>
          <i className="fa-solid fa-user-plus"></i> Crear Nuevo Usuario
        </button>
      </div>

      <div className="table-card">
        <table className="main-table">
          <thead>
            <tr>
              <th>Usuario (Login)</th>
              <th>Nombre Completo</th>
              <th>Rol Asignado</th>
              <th>Área Operativa</th>
              <th>Estado</th>
              <th style={{textAlign: 'center'}}>Nivel Acceso</th>
              {isSuperAdmin && <th style={{textAlign: 'right'}}>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const isSuper = u.role === 'superadmin';
              return (
                <tr key={u.id}>
                  <td style={{fontFamily: 'monospace', fontWeight: 700, color: isSuper ? '#e11d48' : '#0f172a'}}>
                    {u.username}
                  </td>
                  <td style={{fontWeight: 700}}>{u.name}</td>
                  <td>
                    <span style={{
                      background: isSuper ? '#ffe4e6' : '#eff6ff', 
                      color: isSuper ? '#be123c' : '#1d4ed8', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      fontSize: '10px', 
                      fontWeight: 800,
                      border: `1px solid ${isSuper ? '#fecdd3' : '#bfdbfe'}`
                    }}>
                      {isSuper ? '👑 SUPERADMIN' : '🛡️ ADMIN'}
                    </span>
                  </td>
                  <td>
                    <span style={{background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700}}>
                      {u.area || 'General'}
                    </span>
                  </td>
                  <td>
                    <span style={{background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800}}>
                      {u.status || 'Activo'}
                    </span>
                  </td>
                  <td style={{textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#64748b'}}>
                    {isSuper ? 'Control Total + BD' : 'Gestión & Facturas'}
                  </td>
                  {isSuperAdmin && (
                    <td style={{textAlign: 'right'}}>
                      {u.id !== currentUser?.id && u.username !== 'superadmin' ? (
                        <button 
                          onClick={() => onDeleteUser && onDeleteUser(u.id)}
                          style={{
                            background: '#fee2e2', 
                            color: '#e11d48', 
                            border: 'none', 
                            padding: '4px 8px', 
                            borderRadius: '6px', 
                            fontSize: '11px', 
                            cursor: 'pointer',
                            fontWeight: 700
                          }}
                          title="Eliminar usuario"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      ) : (
                        <span style={{fontSize: '10px', color: '#94a3b8', fontWeight: 700}}>Principal</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.UsersModule = UsersModule;