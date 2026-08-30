import React from 'react';
import { Invoice, AuditLogRecord } from '../../types';
import { CheckCircle2, Clock, FileText, Send, Lock } from 'lucide-react';

interface TimelineProps {
  invoice: Invoice;
  history: AuditLogRecord[];
}

export const DocumentTimeline: React.FC<TimelineProps> = ({ invoice, history }) => {
  const steps = [
    {
      title: 'Cotización recibida',
      isDone: true,
      date: invoice.createdAt,
      user: 'Proveedor / Sistema',
      docPath: invoice.quotationDocumentPath
    },
    {
      title: 'Cotización firmada',
      isDone: invoice.quotationSigned,
      date: invoice.quotationSignedDate,
      user: invoice.quotationSignedBy,
      docPath: invoice.signedQuotationDocumentPath
    },
    {
      title: 'Factura recibida',
      isDone: invoice.type === 'INVOICE' || !!invoice.invoiceDocumentPath,
      date: invoice.type === 'INVOICE' ? invoice.createdAt : undefined,
      user: 'Proveedor / Sistema',
      docPath: invoice.invoiceDocumentPath
    },
    {
      title: 'Factura firmada',
      isDone: invoice.invoiceSigned,
      date: invoice.invoiceSignedDate,
      user: invoice.invoiceSignedBy,
      docPath: invoice.signedInvoiceDocumentPath
    },
    {
      title: 'Llegó a Facture',
      isDone: invoice.factureReceived === 'SÍ',
      date: invoice.factureReceivedDate,
      user: invoice.factureReceivedBy
    },
    {
      title: 'Gestionada',
      isDone: invoice.management,
      date: invoice.managementDate,
      user: invoice.managedBy
    },
    {
      title: 'Entregada',
      isDone: invoice.delivered,
      date: invoice.deliveredDate,
      user: invoice.deliveredBy
    }
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
      <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-600" />
        Panel de Estado del Documento (Timeline del Proceso)
      </h3>

      <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="relative pl-6">
            <span
              className={`absolute -left-3 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step.isDone ? 'bg-emerald-500 text-white ring-4 ring-emerald-50' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step.isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
            </span>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className={`font-semibold ${step.isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                {step.title}
              </span>

              {step.isDone && step.date && (
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {new Date(step.date).toLocaleString('es-CO')}
                </span>
              )}
            </div>

            {step.isDone && step.user && (
                <p className="text-xs text-slate-500 mt-0.5">Responsable: <span className="font-medium text-slate-700">{step.user}</span></p>
            )}

            {step.docPath && (
              <div className="mt-1">
                <span className="inline-flex items-center text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  <FileText className="w-3 h-3 mr-1" /> Documento adjunto
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
