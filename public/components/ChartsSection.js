// public/components/ChartsSection.js — Premium Dashboard Sections 2026

function ChartsSection({ managedCount, pendingCount, enFactureCount, otherCount, totalCount, onQuickRegister, onGoInvoices, onGoReports, onGoSuppliers }) {
  const isDark = document.body.classList.contains('dark');

  const total = totalCount || 1;
  const managedPct  = Math.round((managedCount / total) * 100);
  const pendingPct  = Math.round((pendingCount / total) * 100);
  const facturePct  = Math.round((enFactureCount / total) * 100);
  const otherPct    = Math.max(0, 100 - managedPct - pendingPct - facturePct);

  // Donut segments (SVG circumference for r=15.9 → C=99.9 ≈ 100)
  const R = 15.9, C = 2 * Math.PI * R; // ≈ 99.9
  const seg = (pct) => (pct / 100) * C;

  let offset = 0;
  const segments = [
    { pct: managedPct,  color: '#10b981', label: 'Entregadas',  count: managedCount },
    { pct: pendingPct,  color: '#f59e0b', label: 'Pendientes',  count: pendingCount },
    { pct: facturePct,  color: '#3b82f6', label: 'En Facture',  count: enFactureCount },
    { pct: otherPct,    color: '#e11d48', label: 'Por Firmar',  count: otherCount },
  ].map(s => {
    const dash = seg(s.pct);
    const gap  = C - dash;
    const off  = offset;
    offset    += dash;
    return { ...s, dash, gap, off };
  });

  const cardBg   = isDark ? '#111115' : '#ffffff';
  const cardBdr  = isDark ? '#27272a' : '#e2e8f0';
  const textMain = isDark ? '#f8fafc' : '#0f172a';
  const textSub  = isDark ? '#94a3b8' : '#64748b';
  const barBg    = isDark ? '#1e293b' : '#f1f5f9';

  const card = {
    background: cardBg, borderRadius: '18px', border: `1px solid ${cardBdr}`,
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '24px', display: 'flex', flexDirection: 'column',
  };

  const sectionTitle = (color = textMain) => ({
    fontSize: '14px', fontWeight: 800, color, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
  });

  // Bar chart heights (proportional to totalCount, capped)
  const maxH = 96;
  const bars = [
    { label: 'May', count: 18, color: barBg },
    { label: 'Jun', count: 24, color: barBg },
    { label: 'Jul', count: 22, color: barBg },
    { label: 'Ago', count: 26, color: barBg },
    { label: 'Sep', count: totalCount, color: 'linear-gradient(to top, #be123c, #e11d48, #f43f5e)', isCurrent: true },
  ];
  const maxBar = Math.max(...bars.map(b => b.count), 1);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '28px' }}>

      {/* === 1. DONUT CHART === */}
      <div style={card}>
        <div style={sectionTitle()}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block', flexShrink: 0 }} />
          Estado General de Documentos
          <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', background: isDark ? '#1e293b' : '#f1f5f9', color: textSub, padding: '2px 10px', borderRadius: '999px' }}>DISTRIBUCIÓN</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
          {/* SVG Donut */}
          <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="15.9" fill="none" stroke={isDark ? '#1e293b' : '#f1f5f9'} strokeWidth="3.8" />
              {totalCount === 0 ? (
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={isDark ? '#27272a' : '#e2e8f0'} strokeWidth="3.8" strokeDasharray="100 0" />
              ) : segments.map((s, i) => (
                s.pct > 0 && (
                  <circle key={i} cx="18" cy="18" r="15.9" fill="none"
                    stroke={s.color} strokeWidth="3.8"
                    strokeDasharray={`${s.dash.toFixed(2)} ${s.gap.toFixed(2)}`}
                    strokeDashoffset={-s.off.toFixed(2)}
                    strokeLinecap="round"
                  />
                )
              ))}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '26px', fontWeight: 900, color: textMain, lineHeight: 1 }}>{totalCount}</span>
              <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: textSub, marginTop: '2px' }}>TOTAL</span>
            </div>
          </div>

          {/* Leyenda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {segments.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: textSub }}>{s.label}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: textMain }}>{s.count} <span style={{ fontSize: '10px', color: textSub, fontWeight: 600 }}>({s.pct}%)</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === 2. BARRA MENSUAL === */}
      <div style={card}>
        <div style={sectionTitle()}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#e11d48', display: 'inline-block', flexShrink: 0 }} />
          Volumen Mensual de Facturación
          <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 800, color: '#e11d48', background: '#fef2f2', border: '1px solid #fecdd3', padding: '2px 10px', borderRadius: '999px' }}>2026</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '110px', marginTop: 'auto' }}>
          {bars.map((b, i) => {
            const h = Math.round((b.count / maxBar) * maxH);
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: b.isCurrent ? '#e11d48' : textSub }}>
                  {b.count}
                </span>
                <div style={{
                  width: '100%', borderRadius: '6px 6px 0 0',
                  height: `${Math.max(h, 8)}px`,
                  background: b.isCurrent ? 'linear-gradient(to top, #be123c, #e11d48)' : barBg,
                  boxShadow: b.isCurrent ? '0 4px 16px rgba(225,29,72,0.35)' : 'none',
                  transition: 'height 0.3s ease',
                }} />
                <span style={{ fontSize: '11px', fontWeight: b.isCurrent ? 900 : 600, color: b.isCurrent ? '#e11d48' : textSub }}>
                  {b.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* === 3. ACCIONES FRECUENTES === */}
      <div style={card}>
        <div style={sectionTitle()}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', display: 'inline-block', flexShrink: 0 }} />
          Acciones Frecuentes
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1 }}>
          {/* CTA Principal */}
          <button
            onClick={onQuickRegister}
            style={{
              gridColumn: '1 / -1',
              background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
              color: '#fff', border: 'none', borderRadius: '12px', padding: '14px 16px',
              cursor: 'pointer', textAlign: 'left',
              boxShadow: '0 6px 18px rgba(225,29,72,0.35)',
              display: 'flex', alignItems: 'center', gap: '10px',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(225,29,72,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(225,29,72,0.35)'; }}
          >
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="plus" size={18} style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>Nueva Factura / Cotización</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>Registrar nuevo documento</div>
            </div>
          </button>

          {/* Botón Ver Facturas */}
          {[
            { label: 'Ver Facturas', sub: 'Módulo completo', icon: 'invoices', color: '#e11d48', bg: '#fef2f2', border: '#fecdd3', action: onGoInvoices },
            { label: 'Proveedores', sub: 'Gestionar base', icon: 'suppliers', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', action: onGoSuppliers },
            { label: 'Auditoría & Reportes', sub: 'Exportar datos', icon: 'reports', color: '#059669', bg: '#f0fdf4', border: '#a7f3d0', action: onGoReports },
          ].map((a, i) => (
            <button
              key={i}
              onClick={a.action}
              style={{
                gridColumn: i === 2 ? '1 / -1' : 'auto',
                background: cardBg, border: `1.5px solid ${cardBdr}`, borderRadius: '12px',
                padding: '12px', cursor: 'pointer', textAlign: 'left',
                display: 'flex', flexDirection: 'column', gap: '8px',
                transition: 'transform 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = cardBdr; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={a.icon} size={16} style={{ color: a.color }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: textMain }}>{a.label}</div>
                <div style={{ fontSize: '10px', color: textSub, marginTop: '1px' }}>{a.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

window.ChartsSection = ChartsSection;

