import { Invoice } from '../types';

export interface InvoiceCalculatedStatus {
  processStatusText: string;
  processStatusBadgeClass: string;
  alertText?: string;
  alertBadgeClass?: string;
  isUrgent: boolean;
  daysPending: number;
}

export function calculateInvoiceStatus(invoice: Invoice, now: Date = new Date()): InvoiceCalculatedStatus {
  const remissionDate = new Date(invoice.remissionDate);
  const diffTime = Math.abs(now.getTime() - remissionDate.getTime());
  const daysPending = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let processStatusText = '';
  let processStatusBadgeClass = '';

  // 12. ESTADO DEL PROCESO
  if (invoice.type === 'QUOTATION') {
    if (!invoice.quotationSigned) {
      processStatusText = '🟡 Cotización pendiente de firma';
      processStatusBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
    } else {
      processStatusText = '🔵 Cotización firmada — Esperando factura';
      processStatusBadgeClass = 'bg-blue-100 text-blue-800 border-blue-300';
    }
  } else {
    // FACTURA
    if (invoice.delivered) {
      processStatusText = '🟢 Entregada';
      processStatusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    } else if (invoice.management) {
      processStatusText = '🟢 Gestionada';
      processStatusBadgeClass = 'bg-green-100 text-green-800 border-green-300';
    } else if (invoice.factureReceived === 'SÍ') {
      processStatusText = '🟢 Recibida en Facture';
      processStatusBadgeClass = 'bg-teal-100 text-teal-800 border-teal-300';
    } else if (invoice.invoiceSigned) {
      processStatusText = '🟢 Factura firmada';
      processStatusBadgeClass = 'bg-lime-100 text-lime-800 border-lime-300';
    } else {
      processStatusText = '🟡 Factura pendiente de firma';
      processStatusBadgeClass = 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  }

  // 15 & 16. ALERTAS COMBINADAS
  let alertText: string | undefined = undefined;
  let alertBadgeClass: string | undefined = undefined;
  let isUrgent = false;

  if (invoice.type === 'INVOICE') {
    if (invoice.factureReceived === 'AÚN NO' && daysPending >= 3) {
      // Caso 4: URGENTE
      alertText = '🔴 URGENTE — Pendiente de recepción en Facture';
      alertBadgeClass = 'bg-red-100 text-red-800 border-red-400 font-bold animate-pulse';
      isUrgent = true;
    } else if (invoice.factureReceived === 'AÚN NO' && !invoice.management) {
      // Caso 1
      alertText = '🔴 Pendiente de Facture y gestión';
      alertBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
    } else if (invoice.factureReceived === 'SÍ' && !invoice.management) {
      // Caso 2
      alertText = '🟡 Llegó en Facture — Pendiente de gestión';
      alertBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
    } else if (invoice.factureReceived === 'SÍ' && invoice.management) {
      // Caso 3
      alertText = '🟢 Gestionada';
      alertBadgeClass = 'bg-green-100 text-green-800 border-green-300';
    } else if (invoice.factureReceived === 'AÚN NO') {
      alertText = '🟡 Pendiente en Facture';
      alertBadgeClass = 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  }

  return {
    processStatusText,
    processStatusBadgeClass,
    alertText,
    alertBadgeClass,
    isUrgent,
    daysPending
  };
}
