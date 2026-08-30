import React, { useState } from 'react';
import { DocumentRecord, Invoice } from '../../types';
import { Eye, Printer, X, Download, FileText, CheckCircle } from 'lucide-react';

interface DocumentViewerModalProps {
  document?: DocumentRecord;
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ document, invoice, isOpen, onClose }) => {
  const [printMode, setPrintMode] = useState<'DOCUMENT' | 'SUMMARY'>('SUMMARY');

  if (!isOpen) return null;

  const viewUrl = document ? `/api/documents/${document.id}/view` : null;
  const isPdf = document?.mimeType === 'application/pdf';

  const handlePrint = () => {
    if (printMode === 'DOCUMENT' && viewUrl) {
      const printWindow = window.open(viewUrl, '_blank');
      printWindow?.focus();
      printWindow?.print();
    } else {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header no-print */}
        <div className="p-4 bg-slate-800 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-lg">
              {document ? `Documento: ${document.originalName}` : `Ficha de Registro — ${invoice.invoiceCode}`}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              <Printer className="w-4 h-4" /> 🖨️ Imprimir
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Visor / Vista de Impresión */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
          
          {/* Ficha legible para imprimir */}
          <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 max-w-2xl mx-auto print:shadow-none print:border-none">
            <div className="text-center border-b pb-4 mb-6">
              <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">Alimentos Enriko</h1>
              <p className="text-sm font-medium text-slate-600">Sistema de Control y Gestión de Facturas & Cotizaciones</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div>
                <span className="text-slate-500 block text-xs">PROVEEDOR:</span>
                <span className="font-semibold text-slate-800">{invoice.supplierName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">CÓDIGO:</span>
                <span className="font-semibold text-slate-800">{invoice.invoiceCode}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">TIPO DE DOCUMENTO:</span>
                <span className="font-semibold text-slate-800">{invoice.type === 'QUOTATION' ? 'COTIZACIÓN' : 'FACTURA'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">VALOR:</span>
                <span className="font-semibold text-emerald-700">${invoice.amount.toLocaleString('es-CO')}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-xs">DESCRIPCIÓN:</span>
                <span className="text-slate-700">{invoice.description}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">FECHA DE REMISIÓN:</span>
                <span>{new Date(invoice.remissionDate).toLocaleDateString('es-CO')}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">FECHA DE ENTREGA:</span>
                <span>{invoice.deliveryDate ? new Date(invoice.deliveryDate).toLocaleDateString('es-CO') : 'Pendiente'}</span>
              </div>
            </div>

            <div className="border-t pt-4 grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-lg">
              <div><strong>COTIZACIÓN FIRMADA:</strong> {invoice.quotationSigned ? 'SÍ 🟢' : 'NO 🔴'}</div>
              <div><strong>FACTURA FIRMADA:</strong> {invoice.invoiceSigned ? 'SÍ 🟢' : 'NO 🔴'}</div>
              <div><strong>LLEGÓ EN FACTURE:</strong> {invoice.factureReceived === 'SÍ' ? `SÍ 🟢 (${invoice.factureReceivedDate ? new Date(invoice.factureReceivedDate).toLocaleDateString('es-CO') : ''})` : 'AÚN NO 🟡'}</div>
              <div><strong>GESTIÓN REALIZADA:</strong> {invoice.management ? 'SÍ 🟢' : 'NO 🔴'}</div>
              <div><strong>ENTREGADA:</strong> {invoice.delivered ? 'SÍ 🟢' : 'NO 🔴'}</div>
              <div><strong>CONFIRMADO POR:</strong> {invoice.factureReceivedBy || invoice.managedBy || 'Usuario Sistema'}</div>
            </div>
          </div>

          {/* Visualizador de documento físico */}
          {document && viewUrl && (
            <div className="mt-6 border-t pt-6 no-print">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" /> Vista previa del archivo adjunto
              </h4>

              {isPdf ? (
                <iframe
                  src={viewUrl}
                  className="w-full h-[500px] rounded-lg border border-slate-300"
                  title="Visor PDF"
                />
              ) : (
                <div className="flex justify-center bg-slate-900/5 p-4 rounded-lg border">
                  <img
                    src={viewUrl}
                    alt={document.originalName}
                    className="max-h-[500px] object-contain rounded shadow"
                  />
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
