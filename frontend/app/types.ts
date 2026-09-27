export interface SupplierService {
  serviceName: string;
  type: 'factura' | 'cotizacion';
  enabled?: boolean;
}

export interface Supplier {
  id: string;
  nit: string;
  name: string;
  contact?: string | null;
  phone?: string | null;
  monthlyCount?: number;
  area?: string;
  services?: SupplierService[];
  email?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  supplier: string;
  service?: string;
  invoiceNumber?: string;
  emissionDate?: string;
  deliveryDate?: string | null;
  value?: number;
  signed?: 'SÍ' | 'NO' | string;
  orderStd?: 'SÍ' | 'NO' | string;
  oc?: string;
  enFacture?: 'SÍ' | 'NO' | 'AÚN NO' | string;
  delivered?: 'SÍ' | 'NO' | string;
  pdfPath?: string | null;
  pdfOriginalName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardMetrics {
  total: number;
  facCount: number;
  cotCount: number;
  toSignCount: number;
  pendingFactureCount: number;
  factureCount: number;
  deliveredCount: number;
  pendingDeliveryCount: number;
  totalAmount: number;
  delayedCount: number;
}
