function ExcelPreviewModal({ isOpen, onClose, selectedInvoices, onToggleDelivered, onUploadPdf }) {
  if (!isOpen || !selectedInvoices || selectedInvoices.length === 0) return null;

  const totalSelectedAmount = selectedInvoices.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  const deliveredCount = selectedInvoices.filter(i => i.delivered === 'SÍ').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ['Proveedor', 'Servicio', 'N DE FACTURA', 'FECHA DE EMISION', 'FECHA DE ENTREGA', 'VALOR', 'FIRMADA', 'ORDEN STD', 'OC', 'EN FACTURE', 'ENTREGADA'];
    const rows = selectedInvoices.map(i => [
      `"${i.supplier}"`,
      `"${i.service}"`,
      `"${i.invoiceNumber}"`,
      `"${i.emissionDate}"`,
      `"${i.deliveryDate}"`,
      i.value,
      `"${i.signed}"`,
      `"${i.orderStd}"`,
      `"${i.oc}"`,
      `"${i.enFacture}"`,
      `"${i.delivered}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vista_Previa_Facturas_Entregadas_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6 animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
        
        {/* Cabecera Tipo Excel / Hoja de Cálculo */}
        <div className="p-4 md:px-6 bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20">
              <i className="fa-regular fa-file-excel"></i>
              <span>Excel View</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Vista Previa de Facturas Entregadas y Seleccionadas
              </h3>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {selectedInvoices.length} facturas seleccionadas | {deliveredCount} con estado ENTREGADA | Total: <strong className="text-slate-800 dark:text-slate-200 font-mono">${totalSelectedAmount.toLocaleString('es-CO')}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors shadow-xs" 
              onClick={handleExportCsv} 
              title="Descargar archivo Excel / CSV"
            >
              <i className="fa-solid fa-file-arrow-down text-emerald-600"></i>
              <span>Exportar CSV</span>
            </button>
            <button 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors shadow-xs" 
              onClick={handlePrint} 
              title="Imprimir informe"
            >
              <i className="fa-solid fa-print text-blue-600"></i>
              <span>Imprimir</span>
            </button>
            <button 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors" 
              onClick={onClose} 
              title="Cerrar modal"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>
        </div>

        {/* Barra de herramientas / Fórmula tipo Excel */}
        <div className="px-6 py-2 bg-slate-100/70 dark:bg-zinc-800/40 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-3 text-xs">
          <div className="font-mono font-bold text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-[11px]">
            A1:{String.fromCharCode(65 + 10)}{selectedInvoices.length + 1}
          </div>
          <div className="flex items-center gap-2 flex-1">
            <span className="font-black italic text-slate-400 font-serif">fx</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">
              =SUMA(VALOR) = ${totalSelectedAmount.toLocaleString('es-CO')} COP | Entregadas: {deliveredCount}/{selectedInvoices.length}
            </span>
          </div>
        </div>

        {/* Tabla Estilo Hoja de Cálculo Excel */}
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-zinc-950">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead className="sticky top-0 bg-slate-200/90 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 shadow-xs z-10">
              <tr className="border-b border-slate-300 dark:border-zinc-700 text-[10px] font-bold uppercase tracking-wider">
                <th className="py-2 px-3 text-center w-10 bg-slate-300/80 dark:bg-zinc-700 text-slate-600 dark:text-slate-300">#</th>
                <th className="py-2 px-3">PROVEEDOR</th>
                <th className="py-2 px-3">SERVICIO</th>
                <th className="py-2 px-3 font-mono">N° FACTURA</th>
                <th className="py-2 px-3">FECHA EMISIÓN</th>
                <th className="py-2 px-3">FECHA ENTREGA</th>
                <th className="py-2 px-3 text-right">VALOR ($)</th>
                <th className="py-2 px-3 text-center">FIRMADA</th>
                <th className="py-2 px-3 text-center">ORDEN STD</th>
                <th className="py-2 px-3">OC</th>
                <th className="py-2 px-3 text-center">EN FACTURE</th>
                <th className="py-2 px-3 text-center">ENTREGADA</th>
                <th className="py-2 px-3 text-center">DOCUMENTO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
              {selectedInvoices.map((inv, idx) => (
                <tr key={inv.id || idx} className={`hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 ${inv.delivered === 'SÍ' ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''}`}>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-[10px] text-slate-400 bg-slate-50 dark:bg-zinc-800/40 border-r border-slate-200 dark:border-zinc-800">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{inv.supplier}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{inv.service}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-rose-600 dark:text-rose-400">{inv.invoiceNumber}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{inv.emissionDate}</td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-700 dark:text-emerald-400">{inv.deliveryDate}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ${Number(inv.value || 0).toLocaleString('es-CO')}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                      inv.signed === 'SÍ' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {inv.signed || 'NO'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                      inv.orderStd === 'SÍ' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {inv.orderStd || 'NO'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{inv.oc}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                      inv.enFacture === 'SÍ' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {inv.enFacture || 'AÚN NO'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button 
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-black border transition-all cursor-pointer ${
                        inv.delivered === 'SÍ' 
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs' 
                          : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-300 border-slate-200 dark:border-zinc-700'
                      }`}
                      onClick={() => onToggleDelivered && onToggleDelivered(inv.id)}
                      title="Clic para cambiar estado de entrega"
                    >
                      {inv.delivered === 'SÍ' ? 'SÍ ✓' : 'NO ✕'}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {inv.pdfPath ? (
                      <a 
                        href={inv.pdfPath} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline"
                        title={`Ver PDF: ${inv.pdfOriginalName || 'Archivo adjunto'}`}
                      >
                        <i className="fa-solid fa-file-pdf"></i> Ver
                      </a>
                    ) : (
                      <button 
                        className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                        onClick={() => onUploadPdf && onUploadPdf(inv.id)}
                      >
                        <i className="fa-solid fa-paperclip"></i> Adjuntar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0 bg-slate-100 dark:bg-zinc-800 font-bold border-t-2 border-slate-300 dark:border-zinc-700 z-10">
              <tr>
                <td colSpan="6" className="py-3 px-4 text-right font-black uppercase text-slate-800 dark:text-slate-100 text-xs">
                  TOTAL GENERAL SELECCIONADO:
                </td>
                <td className="py-3 px-3 text-right font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                  ${totalSelectedAmount.toLocaleString('es-CO')}
                </td>
                <td colSpan="6" className="py-3 px-3 text-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {deliveredCount} facturas entregadas de {selectedInvoices.length} seleccionadas
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer del Modal */}
        <div className="p-4 md:px-6 bg-slate-50 dark:bg-zinc-800/60 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            💡 Documentos guardados de forma segura en local <code>/uploads</code> y registros persistidos en <strong>MySQL</strong>.
          </div>
          <button 
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors"
            onClick={onClose}
          >
            Cerrar Vista
          </button>
        </div>

      </div>
    </div>
  );
}

window.ExcelPreviewModal = ExcelPreviewModal;
