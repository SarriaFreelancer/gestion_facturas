function UsersModule({ users, onAddUser }) {
  return (
    <div className="dashboard-container">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0'}}>
        <div>
          <h2 style={{fontSize: '16px', fontWeight: 800}}>👤 Gestión de Usuarios & Roles</h2>
          <p style={{fontSize: '12px', color: '#64748b'}}>Control de accesos y permisos por áreas operativas</p>
        </div>
        <button className="btn-red-action" onClick={onAddUser}>
          <i className="fa-solid fa-plus"></i> Crear Usuario
        </button>
      </div>

      <div className="table-card">
        <table className="main-table">
          <thead>
            <tr>
              <th>Usuario (Login)</th>
              <th>Nombre Completo</th>
              <th>Rol Asignado</th>
              <th>Área de Trabajo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{fontFamily: 'monospace', fontWeight: 700}}>{u.username}</td>
                <td style={{fontWeight: 700}}>{u.name}</td>
                <td><span style={{background: '#fee2e2', color: '#e11d48', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800}}>{u.role}</span></td>
                <td><span style={{background: '#e0e7ff', color: '#3730a3', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800}}>{u.area}</span></td>
                <td><span style={{background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800}}>{u.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

window.UsersModule = UsersModule;
