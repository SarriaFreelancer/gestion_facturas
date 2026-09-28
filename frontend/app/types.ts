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

export interface MonthlyStat {
  month: string;
  short: string;
  count: number;
  totalAmount: number;
  facCount: number;
  cotCount: number;
}

export interface WeeklyReceivedDelivered {
  day: string;
  received: number;
  delivered: number;
}

export interface RecurrenceStudyItem {
  supplierId: string;
  supplierName: string;
  nit: string;
  area: string;
  monthlyCount: number;
  totalConcepts: number;
  activeConcepts: number;
  facConcepts: number;
  cotConcepts: number;
  registeredInvoices: number;
  totalSpent: number;
  compliance: number;
}

export interface TechInventoryItem {
  id: string;
  category: string;
  name: string;
  brandModel?: string | null;
  serialCode?: string | null;
  quantity: number;
  unit?: string | null;
  areaAssigned?: string | null;
  status: string;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemName: string;
  itemCategory?: string | null;
  quantity: number;
  recipient: string;
  area: string;
  actionType: 'Préstamo' | 'Entrega' | string;
  status: 'Activo' | 'Devuelto' | 'Entregado' | string;
  notes?: string | null;
  movementDate: string;
  returnDate?: string | null;
  returnedQuantity?: number;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  createdAt?: string;
}

export interface CompanyArea {
  id: string;
  name: string;
  director?: string | null;
  headOrCoord?: string | null;
  email?: string | null;
  budgetLimit?: number;
  color?: string | null;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string | null;
  password?: string | null;
  role: 'superadmin' | 'admin' | 'viewer';
  area: string;
  status: 'Activo' | 'Inactivo';
  createdAt?: string;
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
  monthlyStats?: MonthlyStat[];
  weeklyReceivedDelivered?: WeeklyReceivedDelivered[];
  recurrenceStudy?: RecurrenceStudyItem[];
}
