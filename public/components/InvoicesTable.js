// public/components/InvoicesTable.js
// Tabla de Facturas y Cotizaciones con Diseño SaaS Moderno, 2D Nítido, Inputs Compactos y Vista Completa

function MoneyInputField({ initialValue, onCommit }) {
  const [text, setText] = React.useState(() => {
    if (initialValue === '' || initialValue === null || initialValue === undefined) return '';
    const num = Number(initialValue);
    if (isNaN(num) || num === 0) return '';
    return num.toFixed(2);
  });

  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (!isFocused) {
      if (initialValue === '' || initialValue === null || initialValue === undefined) {
        setText('');
      } else {
        const num = Number(initialValue);
        if (isNaN(num) || num === 0) {
          setText('');
        } else {
          setText(num.toFixed(2));
        }
      }
    }
  }, [initialValue, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    if (text === '0' || text === '0.00') {
      setText('');
    }
  };

  const handleChange = (e) => {
    let raw = e.target.value.replace(/[^0-9.]/g, '');
    const parts = raw.split('.');
    if (parts.length > 2) {
      raw = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts.length === 2 && parts[1].length > 2) {
      raw = parts[0] + '.' + parts[1].substring(0, 2);
    }
    setText(raw);
  };

  const handleBlur = () => {
    setIsFocused(false);
    let valStr = text.trim();
    if (!valStr) {
      setText('');
      if (onCommit) onCommit(0);
      return;
    }

    let finalNum = 0;
    if (valStr.includes('.')) {
      const [entero, dec = ''] = valStr.split('.');
      const dec2 = (dec + '00').substring(0, 2);
      finalNum = Number(`${entero || '0'}.${dec2}`) || 0;
    } else {
      finalNum = Number(`${valStr}.00`) || 0;
    }

    setText(finalNum.toFixed(2));
    if (onCommit) onCommit(finalNum);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <input 
      type="text" 
      inputMode="decimal"
      className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 rounded-lg px-2 py-1 text-[11px] font-mono font-bold text-right text-slate-800 dark:text-zinc-100 outline-none w-20 transition-all shadow-2xs"
      value={text} 
      placeholder="0.00"
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      title="Monto monetario (ej: 5205300)"
    />
  );
}

window.MoneyInputField = MoneyInputField;

function InvoicesTable({ 
  rows, 
  currentTab, 
  setCurrentTab, 
  tabCounts, 
  selectedIds, 
  onToggleSelectRow, 
  onToggleSelectAll, 
  onToggleSigned, 
  onToggleFacture, 
  onToggleDelivered, 
  onToggleOrderStd, 
  onUpdateInvoiceField,
  onViewDetail, 
  onDeleteInvoice, 
  onUploadPdf 
}) {
  const isAllSelected = rows.length > 0 && rows.every(r => selectedIds.includes(r.id));

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden mb-6">
      {/* PESTAÑAS DE ESTADO */}
      <div className="flex items-center gap-2 p-3 bg-white dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800/80 overflow-x-auto">
        {[
          { id: 'Todos', label: 'Todos', count: tabCounts.total, icon: 'dashboard' },
          { id: 'Facturas', label: 'Facturas', count: tabCounts.fac, icon: 'invoices' },
          { id: 'Cotizaciones', label: 'Cotizaciones', count: tabCounts.cot, icon: 'crm' },
          { id: 'Pendientes', label: 'Pendientes', count: tabCounts.pending, icon: 'clock' },
          { id: 'Atrasadas', label: 'Atrasadas', count: tabCounts.delayed, icon: 'alerts' },
          { id: 'En Facture', label: 'En Facture', count: tabCounts.facture, icon: 'inventory' }
        ].map(tab => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm shadow-red-600/30'
                  : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700/60 border border-slate-200 dark:border-zinc-700'
              }`}
            >
              <Icon name={tab.icon} size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                isActive 
                  ? 'bg-red-800/60 text-white' 
                  : 'bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TABLA PRINCIPAL CON ESTILO SAAS Y CELDAS COMPACTAS */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
              <th className="px-3 py-3 w-8 text-center text-white">
                <input 
                  type="checkbox" 
                  checked={isAllSelected} 
                  onChange={(e) => onToggleSelectAll(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 cursor-pointer w-4 h-4 accent-red-500"
                  title="Seleccionar todo"
                />
              </th>
              <th className="px-3 py-3 text-white">
                <div className="flex items-center gap-1.5">
                  <Icon name="dashboard" size={13} className="text-white/80" />
                  <span>PROVEEDOR</span>
                </div>
              </th>
              <th className="px-3 py-3 text-white">
                <div className="flex items-center gap-1.5">
                  <Icon name="inventory" size={13} className="text-white/80" />
                  <span>SERVICIO</span>
                </div>
              </th>
              <th className="px-3 py-3 text-white">
                <div className="flex items-center gap-1.5">
                  <Icon name="file-text" size={13} className="text-white/80" />
                  <span>N° COMPROBANTE</span>
                </div>
              </th>
              <th className="px-3 py-3 text-white">
                <div className="flex items-center gap-1.5">
                  <Icon name="calendar" size={13} className="text-white/80" />
                  <span>EMISIÓN</span>
                </div>
              </th>
              <th className="px-3 py-3 text-white">
                <div className="flex items-center gap-1.5">
                  <Icon name="calendar" size={13} className="text-white/80" />
                  <span>ENTREGA</span>
                </div>
              </th>
              <th className="px-3 py-3 text-right text-white">
                <div className="flex items-center justify-end gap-1.5">
                  <Icon name="budgets" size={13} className="text-white/80" />
                  <span>VALOR ($)</span>
                </div>
              </th>
              <th className="px-3 py-3 text-center text-white">
                <div className="flex items-center justify-center gap-1.5">
                  <Icon name="signature" size={13} className="text-white/80" />
                  <span>FIRMADA</span>
                </div>
              </th>
              <th className="px-3 py-3 text-center text-white">
                <div className="flex items-center justify-center gap-1.5">
                  <Icon name="history" size={13} className="text-white/80" />
                  <span>ORDEN STD</span>
                </div>
              </th>
              <th className="px-3 py-3 text-white">OC</th>
              <th className="px-3 py-3 text-center text-white">FACTURE</th>
              <th className="px-3 py-3 text-center text-white">ENTREGADA</th>
              <th className="px-3 py-3 text-center text-white">PDF</th>
              <th className="px-3 py-3 text-center text-white">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
            {rows.length === 0 ? (
              <tr>
                <td colSpan="14" className="text-center py-12 text-slate-400 dark:text-zinc-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Icon name="folder" size={32} className="text-slate-300 dark:text-zinc-600" />
                    <span>No hay documentos que coincidan con los filtros seleccionados.</span>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isChecked = selectedIds.includes(row.id);
                const isCot = (row.invoiceNumber || '').toUpperCase().startsWith('COT') || (row.docType === 'cotizacion');

                return (
                  <tr 
                    key={row.id} 
                    className={`hover:bg-rose-50/20 dark:hover:bg-zinc-800/40 transition-colors ${
                      isChecked ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                    }`}
                  >
                    {/* CHECKBOX */}
                    <td className="px-3 py-2 text-center">
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => onToggleSelectRow(row.id)}
                        className="rounded text-red-600 focus:ring-red-500 cursor-pointer w-4 h-4 accent-red-500"
                      />
                    </td>

                    {/* PROVEEDOR */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-red-600 to-red-700 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 shadow-xs ring-1 ring-red-100 dark:ring-red-950">
                          {row.logoText || (row.supplier || 'PR').substring(0, 2).toUpperCase()}
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-white truncate max-w-[150px]" title={row.supplier}>
                          {row.supplier}
                        </span>
                      </div>
                    </td>

                    {/* SERVICIO */}
                    <td className="px-3 py-2 text-slate-600 dark:text-zinc-300 truncate max-w-[130px]" title={row.service}>
                      {row.service || '—'}
                    </td>

                    {/* NÚMERO FACTURA / COTIZACIÓN (COMPACTO) */}
                    <td className="px-2.5 py-1.5">
                      <input 
                        type="text" 
                        className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 rounded-lg px-2 py-1 text-[11px] font-mono font-bold text-slate-800 dark:text-zinc-100 outline-none w-24 transition-all shadow-2xs"
                        value={row.invoiceNumber || ''} 
                        placeholder={isCot ? "FAC-..." : "FAC-..."}
                        onChange={(e) => onUpdateInvoiceField && onUpdateInvoiceField(row.id, 'invoiceNumber', e.target.value)}
                        title="Escribe el número de comprobante"
                      />
                    </td>

                    {/* FECHA EMISIÓN (COMPACTO) */}
                    <td className="px-2.5 py-1.5">
                      <input 
                        type="date" 
                        className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-700 dark:text-zinc-300 outline-none transition-all cursor-pointer w-[112px] shadow-2xs"
                        value={row.emissionDate || ''} 
                        onChange={(e) => onUpdateInvoiceField && onUpdateInvoiceField(row.id, 'emissionDate', e.target.value)}
                      />
                    </td>

                    {/* FECHA ENTREGA (COMPACTO) */}
                    <td className="px-2.5 py-1.5">
                      <input 
                        type="date" 
                        className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 rounded-lg px-2 py-1 text-[11px] font-mono text-slate-700 dark:text-zinc-300 outline-none transition-all cursor-pointer w-[112px] shadow-2xs"
                        value={row.deliveryDate || ''} 
                        onChange={(e) => onUpdateInvoiceField && onUpdateInvoiceField(row.id, 'deliveryDate', e.target.value)}
                      />
                    </td>

                    {/* VALOR MONETARIO (COMPACTO) */}
                    <td className="px-2.5 py-1.5 text-right">
                      <MoneyInputField 
                        initialValue={row.value} 
                        onCommit={(newVal) => onUpdateInvoiceField && onUpdateInvoiceField(row.id, 'value', newVal)}
                      />
                    </td>

                    {/* FIRMADA (TOGGLE SWITCH SÍ / NO) */}
                    <td className="px-3 py-2 text-center">
                      <button 
                        onClick={() => onToggleSigned(row.id)}
                        className={`w-11 h-5 rounded-full px-1 flex items-center transition-all cursor-pointer border ${
                          row.signed === 'SÍ'
                            ? 'bg-emerald-500 border-emerald-600 justify-end'
                            : 'bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 justify-start'
                        }`}
                        title="Clic para alternar estado de firma"
                      >
                        <span className={`text-[8.5px] font-black mr-1 ${row.signed === 'SÍ' ? 'text-white' : 'hidden'}`}>SÍ</span>
                        <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs"></span>
                        <span className={`text-[8.5px] font-black ml-1 ${row.signed === 'SÍ' ? 'hidden' : 'text-slate-500 dark:text-zinc-300'}`}>NO</span>
                      </button>
                    </td>

                    {/* ORDEN STD (TOGGLE SWITCH SÍ / NO) */}
                    <td className="px-3 py-2 text-center">
                      <button 
                        onClick={() => onToggleOrderStd(row.id)}
                        className={`w-11 h-5 rounded-full px-1 flex items-center transition-all cursor-pointer border ${
                          row.orderStd === 'SÍ'
                            ? 'bg-purple-600 border-purple-700 justify-end'
                            : 'bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 justify-start'
                        }`}
                        title="Clic para alternar Orden STD"
                      >
                        <span className={`text-[8.5px] font-black mr-1 ${row.orderStd === 'SÍ' ? 'text-white' : 'hidden'}`}>SÍ</span>
                        <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs"></span>
                        <span className={`text-[8.5px] font-black ml-1 ${row.orderStd === 'SÍ' ? 'hidden' : 'text-slate-500 dark:text-zinc-300'}`}>NO</span>
                      </button>
                    </td>

                    {/* OC (COMPACTO) */}
                    <td className="px-3 py-2">
                      <input 
                        type="text" 
                        className="bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-zinc-700 focus:border-red-500 focus:bg-white dark:focus:bg-zinc-800 rounded px-1.5 py-0.5 text-[11px] font-mono font-bold text-slate-800 dark:text-zinc-100 outline-none w-16 transition-all"
                        value={row.oc || ''} 
                        placeholder="OC-..."
                        onChange={(e) => onUpdateInvoiceField && onUpdateInvoiceField(row.id, 'oc', e.target.value)}
                        title="Número de Orden de Compra"
                      />
                    </td>

                    {/* EN FACTURE (TOGGLE SWITCH) */}
                    <td className="px-3 py-2 text-center">
                      <button 
                        onClick={() => onToggleFacture(row.id)}
                        className={`w-11 h-5 rounded-full px-1 flex items-center transition-all cursor-pointer border ${
                          row.enFacture === 'SÍ'
                            ? 'bg-emerald-500 border-emerald-600 justify-end'
                            : 'bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 justify-start'
                        }`}
                        title="Clic para alternar radicación en Facture"
                      >
                        <span className={`text-[8.5px] font-black mr-1 ${row.enFacture === 'SÍ' ? 'text-white' : 'hidden'}`}>SÍ</span>
                        <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs"></span>
                        <span className={`text-[8.5px] font-black ml-1 ${row.enFacture === 'SÍ' ? 'hidden' : 'text-slate-500 dark:text-zinc-300'}`}>NO</span>
                      </button>
                    </td>

                    {/* ENTREGADA (TOGGLE SWITCH) */}
                    <td className="px-3 py-2 text-center">
                      <button 
                        onClick={() => onToggleDelivered(row.id)}
                        className={`w-11 h-5 rounded-full px-1 flex items-center transition-all cursor-pointer border ${
                          row.delivered === 'SÍ'
                            ? 'bg-emerald-600 border-emerald-700 justify-end'
                            : 'bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 justify-start'
                        }`}
                        title="Clic para marcar como entregada (asigna fecha actual)"
                      >
                        <span className={`text-[8.5px] font-black mr-1 ${row.delivered === 'SÍ' ? 'text-white' : 'hidden'}`}>SÍ</span>
                        <span className="w-3.5 h-3.5 rounded-full bg-white shadow-xs"></span>
                        <span className={`text-[8.5px] font-black ml-1 ${row.delivered === 'SÍ' ? 'hidden' : 'text-slate-500 dark:text-zinc-300'}`}>NO</span>
                      </button>
                    </td>

                    {/* PDF ADJUNTO */}
                    <td className="px-3 py-2 text-center">
                      {row.pdfPath ? (
                        <a 
                          href={row.pdfPath} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 inline-flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors shadow-2xs border border-red-200"
                          title={`Ver archivo: ${row.pdfOriginalName || 'PDF'}`}
                        >
                          <Icon name="pdf" size={14} />
                        </a>
                      ) : (
                        <button 
                          onClick={() => onUploadPdf(row.id)}
                          className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-red-600 hover:bg-red-50 inline-flex items-center justify-center transition-colors border border-slate-200 dark:border-zinc-700"
                          title="Subir PDF del comprobante"
                        >
                          <Icon name="upload" size={13} />
                        </button>
                      )}
                    </td>

                    {/* ACCIONES */}
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => onViewDetail(row)}
                          className="w-7 h-7 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors border border-transparent hover:border-blue-200"
                          title="Ver detalle"
                        >
                          <Icon name="eye" size={14} />
                        </button>

                        <button 
                          onClick={() => onDeleteInvoice(row.id)}
                          className="w-7 h-7 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 inline-flex items-center justify-center transition-colors border border-transparent hover:border-red-200"
                          title="Eliminar factura"
                        >
                          <Icon name="trash" size={14} />
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
  );
}

window.InvoicesTable = InvoicesTable;
