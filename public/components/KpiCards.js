// public/components/KpiCards.js — Diseño Premium Enterprise 2026

function KpiCards({ total, facCount, cotCount, toSignCount, pendingFactureCount, pendingManagementCount, delayedCount }) {
  const toSignPercent   = total > 0 ? ((toSignCount / total) * 100).toFixed(0) : 0;
  const facturePercent  = total > 0 ? ((pendingFactureCount / total) * 100).toFixed(0) : 0;
  const managePct       = total > 0 ? ((pendingManagementCount / total) * 100).toFixed(0) : 0;

  const isDark = document.body.classList.contains('dark');

  const cardStyle = (accent, alertMode) => ({
    background: isDark ? '#111115' : '#ffffff',
    borderRadius: '16px',
    border: `1px solid ${isDark ? '#27272a' : '#e2e8f0'}`,
    borderLeft: `5px solid ${accent}`,
    padding: '20px 18px 16px',
    boxShadow: alertMode
      ? `0 0 0 2px ${accent}22, 0 4px 18px rgba(0,0,0,0.07)`
      : '0 2px 14px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    cursor: 'default',
  });

  const iconStyle = (bg) => ({
    width: '42px', height: '42px', borderRadius: '12px',
    background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  });

  const badgeStyle = (color, bg, border) => ({
    fontSize: '9.5px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px',
    background: bg, color: color, border: `1px solid ${border}`,
    padding: '2px 8px', borderRadius: '999px',
  });

  const handleHover = (el, accent) => {
    el.style.transform = 'translateY(-4px)';
    el.style.boxShadow = `0 12px 28px rgba(0,0,0,0.12), 0 0 0 2px ${accent}33`;
  };
  const handleLeave = (el, alertMode, accent) => {
    el.style.transform = 'translateY(0)';
    el.style.boxShadow = alertMode
      ? `0 0 0 2px ${accent}22, 0 4px 18px rgba(0,0,0,0.07)`
      : '0 2px 14px rgba(0,0,0,0.05)';
  };

  const labelStyle = {
    fontSize: '11px', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.4px',
  };
  const valueStyle = (color) => ({
    fontSize: '34px', fontWeight: 900, lineHeight: 1,
    letterSpacing: '-1.5px', color: color,
  });
  const subStyle = (color) => ({
    fontSize: '11px', fontWeight: 600, color: color, marginTop: '2px',
  });

  const cards = [
    {
      accent: '#e11d48', iconBg: '#fef2f2', iconColor: '#e11d48',
      iconName: 'folder', badge: 'TOTAL', badgeColor: '#9f1239', badgeBg: '#fee2e2', badgeBorder: '#fecdd3',
      value: total, valueColor: isDark ? '#fff' : '#0f172a',
      sub: <span style={{fontSize:'11px',fontWeight:600,color:isDark?'#94a3b8':'#64748b'}}>
        <b style={{color:'#e11d48'}}>{facCount} FAC</b>&nbsp;·&nbsp;<b style={{color:'#7c3aed'}}>{cotCount} COT</b>
      </span>,
    },
    {
      accent: '#2563eb', iconBg: '#eff6ff', iconColor: '#2563eb',
      iconName: 'invoices', badge: 'FACTURAS', badgeColor: '#1d4ed8', badgeBg: '#dbeafe', badgeBorder: '#bfdbfe',
      value: facCount, valueColor: isDark ? '#fff' : '#0f172a',
      sub: <span style={subStyle(isDark ? '#94a3b8' : '#64748b')}>Radicadas oficiales</span>,
    },
    {
      accent: '#7c3aed', iconBg: '#f5f3ff', iconColor: '#7c3aed',
      iconName: 'crm', badge: 'COTIZACIONES', badgeColor: '#6d28d9', badgeBg: '#ede9fe', badgeBorder: '#ddd6fe',
      value: cotCount, valueColor: isDark ? '#fff' : '#0f172a',
      sub: <span style={subStyle(isDark ? '#94a3b8' : '#64748b')}>Por convertir a FAC</span>,
    },
    {
      accent: '#d97706', iconBg: '#fffbeb', iconColor: '#d97706',
      iconName: 'signature', badge: 'POR FIRMAR', badgeColor: '#92400e', badgeBg: '#fef3c7', badgeBorder: '#fde68a',
      value: toSignCount, valueColor: toSignCount > 0 ? '#d97706' : (isDark ? '#fff' : '#0f172a'),
      sub: <span style={subStyle(toSignCount > 0 ? '#d97706' : (isDark ? '#94a3b8' : '#64748b'))}>{toSignPercent}% pendiente</span>,
      warn: toSignCount > 0,
    },
    {
      accent: '#0284c7', iconBg: '#f0f9ff', iconColor: '#0284c7',
      iconName: 'clock', badge: 'FACTURE', badgeColor: '#0369a1', badgeBg: '#e0f2fe', badgeBorder: '#bae6fd',
      value: pendingFactureCount, valueColor: isDark ? '#fff' : '#0f172a',
      sub: <span style={subStyle(isDark ? '#94a3b8' : '#64748b')}>{facturePercent}% sin radicar</span>,
    },
    {
      accent: '#059669', iconBg: '#f0fdf4', iconColor: '#059669',
      iconName: 'deliver', badge: 'ENTREGA', badgeColor: '#065f46', badgeBg: '#d1fae5', badgeBorder: '#a7f3d0',
      value: pendingManagementCount, valueColor: isDark ? '#fff' : '#0f172a',
      sub: <span style={subStyle(isDark ? '#94a3b8' : '#64748b')}>{managePct}% por entregar</span>,
    },
    {
      accent: '#dc2626', iconBg: '#fef2f2', iconColor: '#dc2626',
      iconName: 'alerts', badge: 'ATRASADAS', badgeColor: '#991b1b', badgeBg: '#fee2e2', badgeBorder: '#fecaca',
      value: delayedCount, valueColor: delayedCount > 0 ? '#dc2626' : (isDark ? '#fff' : '#0f172a'),
      sub: <span style={subStyle(delayedCount > 0 ? '#dc2626' : (isDark ? '#94a3b8' : '#64748b'))}>
        {delayedCount > 0 ? '▲ Requieren atención' : '✓ Sin atrasos'}
      </span>,
      alert: delayedCount > 0,
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))',
      gap: '16px',
      marginBottom: '28px',
    }}>
      {cards.map((c, i) => (
        <div
          key={i}
          style={cardStyle(c.accent, c.alert)}
          onMouseEnter={e => handleHover(e.currentTarget, c.accent)}
          onMouseLeave={e => handleLeave(e.currentTarget, c.alert, c.accent)}
        >
          {/* Círculo decorativo fondo */}
          <div style={{
            position:'absolute', top:'-14px', right:'-14px',
            width:'72px', height:'72px', borderRadius:'50%',
            background: c.iconBg, opacity: 0.7, pointerEvents:'none',
          }} />

          {/* Header: ícono + badge */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={iconStyle(c.iconBg)}>
              <Icon name={c.iconName} size={20} style={{ color: c.iconColor }} />
            </div>
            <span style={badgeStyle(c.badgeColor, c.badgeBg, c.badgeBorder)}>
              {c.badge}
            </span>
          </div>

          {/* Valor */}
          <div style={valueStyle(c.valueColor)}>{c.value}</div>

          {/* Subtítulo */}
          <div>
            <div style={labelStyle}>{c.badge === 'TOTAL' ? 'Total Documentos' :
              c.badge === 'FACTURAS' ? 'Facturas Oficiales' :
              c.badge === 'COTIZACIONES' ? 'Cotizaciones' :
              c.badge === 'POR FIRMAR' ? 'Por Firmar' :
              c.badge === 'FACTURE' ? 'En Facture' :
              c.badge === 'ENTREGA' ? 'Pendiente Entrega' : 'Atrasadas'
            }</div>
            <div style={{marginTop:'2px'}}>{c.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

window.KpiCards = KpiCards;
