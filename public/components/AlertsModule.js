function AlertsModule({ alerts, onGoDashboard }) {
  return (
    <div className="dashboard-container">
      <div style={{background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#e11d48', fontWeight: 800, fontSize: '15px'}}>
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>Centro de Alertas Reales del Sistema</span>
        </div>
        <p style={{fontSize: '12px', color: '#64748b', marginTop: '4px'}}>Calculadas dinámicamente según fechas de entrega, firmas y estado de radicación</p>
        
        <div style={{marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
          {alerts.length === 0 ? (
            <div style={{color: '#166534', background: '#dcfce7', padding: '12px', borderRadius: '8px', fontWeight: 700, fontSize: '12px'}}>
              🟢 ¡Todo al día! No hay facturas atrasadas ni pendientes críticas.
            </div>
          ) : (
            alerts.map((alt, idx) => (
              <div 
                key={idx} 
                style={{
                  padding: '12px 16px', 
                  borderRadius: '10px', 
                  fontSize: '12px', 
                  fontWeight: 600,
                  background: alt.type === 'red' ? '#fee2e2' : (alt.type === 'amber' ? '#fef3c7' : '#eff6ff'),
                  color: alt.type === 'red' ? '#991b1b' : (alt.type === 'amber' ? '#92400e' : '#1e40af'),
                  border: `1px solid ${alt.type === 'red' ? '#fca5a5' : (alt.type === 'amber' ? '#fde68a' : '#bfdbfe')}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <strong>{alt.title}:</strong> {alt.message}
                </div>
                <span style={{fontSize: '11px', fontWeight: 800, opacity: 0.8}}>{alt.tag}</span>
              </div>
            ))
          )}
        </div>

        <button className="btn-red-action" style={{marginTop: '16px'}} onClick={onGoDashboard}>
          Volver al Dashboard
        </button>
      </div>
    </div>
  );
}

window.AlertsModule = AlertsModule;
