export interface SupplierService {
  serviceName: string;
  type: 'factura' | 'cotizacion';
  enabled?: boolean;
}

export interface Supplier {
  id: string;
  nit: string;
  sapCode?: string | null;
  name: string;
  tradeName?: string | null;
  address?: string | null;
  city?: string | null;
  contact?: string | null;
  phone?: string | null;
  monthlyCount?: number;
  area?: string;
  services?: SupplierService[];
  email?: string | null;
  paymentConditions?: string | null;
  bankName?: string | null;
  bankAccountType?: string | null;
  bankAccountNumber?: string | null;
  status?: 'Activo' | 'Inactivo' | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  supplier: string;
  area?: string | null;
  service?: string;
  invoiceNumber?: string;
  emissionDate?: string;
  deliveryDate?: string | null;
  dueDate?: string | null;
  value?: number;
  signed?: 'SÍ' | 'NO' | string;
  approvalStatus?: 'Pendiente' | 'Aprobado' | 'Rechazado' | string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  orderStd?: 'SÍ' | 'NO' | string;
  oc?: string;
  contractNumber?: string | null;
  enFacture?: 'SÍ' | 'NO' | 'AÚN NO' | string;
  delivered?: 'SÍ' | 'NO' | string;
  pdfPath?: string | null;
  pdfOriginalName?: string | null;
  itemsJson?: any;
  sapExported?: number;
  sapDocNum?: string | null;
  emailSent?: 'SÍ' | 'NO' | string;
  emailSentAt?: string | null;
  aiShortSummary?: string | null;
  dianEventsStatus?: string | null;
  recurrentParentId?: string | null;
  recurrentMatchReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailSettings {
  id: string;
  recipientEmail: string;
  ccEmails?: string;
  senderName?: string;
  emailSubject?: string;
  emailTemplate?: string;
  frequency?: 'manual' | 'daily' | 'each_delivery' | string;
  outlookIntegrationEnabled?: boolean | number;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  portalEnabled?: boolean | number;
  inventoryEnabled?: boolean | number;
  categoriesEnabled?: boolean | number;
  defaultClientName?: string;
  defaultClientNit?: string;
  geminiApiKey?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  googleProjectId?: string;
  updatedAt?: string;
}

export interface InternalInvoiceItem {
  code?: string;
  name?: string;
  description: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
}

export interface InternalInvoice {
  id: string;
  documentNumber: string;
  docType?: 'FACTURA DE VENTA' | 'NOTA CRÉDITO' | string;
  paymentType?: 'Crédito' | 'Contado' | string;
  referenceNumber?: string;
  contractNumber?: string | null;
  issuerName: string;
  issuerNit: string;
  clientName?: string;
  clientNit?: string;
  emissionDate?: string;
  dueDate?: string;
  paymentCondition?: string;
  paymentMethod?: string;
  subtotalAmount: number;
  ivaAmount: number;
  totalAmount: number;
  retentionAmount?: number;
  netPayableAmount?: number;
  hasIva: number | boolean;
  itemsCount: number;
  itemsWithIvaCount: number;
  itemsWithoutIvaCount: number;
  rawDetail?: string;
  itemsJson?: InternalInvoiceItem[] | string;
  pdfPath?: string | null;
  pdfOriginalName?: string | null;
  status?: string;
  folderType?: string;
  importedToMain?: number;
  mainInvoiceId?: string | null;
  uploadedBy?: string;
  eventAcuse?: number;
  eventAcuseDate?: string | null;
  eventRecibo?: number;
  eventReciboDate?: string | null;
  eventAceptacion?: number;
  eventAceptacionDate?: string | null;
  eventRechazo?: number;
  eventRechazoDate?: string | null;
  eventStatus?: string;
  eventNotification?: string | null;
  aiReadingStatus?: 'PENDIENTE' | 'LEYENDO' | 'LECTURA REALIZADA' | 'APROBADA' | string;
  aiShortSummary?: string | null;
  dianEventsStatus?: 'PENDIENTE' | 'COMPLETADO' | string;
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
  costCenterCode?: string | null;
  director?: string | null;
  headOrCoord?: string | null;
  email?: string | null;
  budgetLimit?: number;
  color?: string | null;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'superadmin' | 'admin' | 'aprobador_area' | 'viewer' | 'supplier';

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string | null;
  password?: string | null;
  role: UserRole;
  area: string;
  authorizedAreas?: string[];
  supplierNit?: string | null;
  supplierId?: string | null;
  phone?: string | null;
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
  pendingFactureAlerts?: any[];
  factureReadyCount?: number;
  factureReadyAlerts?: any[];
  totalAlertsCount?: number;
  monthlyStats?: MonthlyStat[];
  weeklyReceivedDelivered?: WeeklyReceivedDelivered[];
  recurrenceStudy?: RecurrenceStudyItem[];
}

export interface SapPresolicitudRow {
  id?: string;
  invoiceId?: string;
  docNumber?: string;
  itemLine: number;
  itemCode: string; // Número de artículo
  docType: string; // Tipo Solicitud Compra
  itemType: string; // Tipo_Item
  itemDescription: string; // Descripción del artículo
  additionalDescription: string; // Descripcion_Adic
  requiredQuantity: number; // Cantidad Requerida
  unit: string; // Nombre de unidad de medida
  infoPrice: number; // Precio info
  taxIndicator: string; // Indicador de impuestos
  taxPercentage: number; // Impuesto %
  discountPercentage: number; // % de descuento
  warehouse: string; // Almacén
  suggestedSupplier: string; // Proveedor Sugerido
  requiredDate: string; // Fecha Requerida
  costCenter: string; // Centro Costos
  totalMl: number; // Total (ML)
  requestedBy: string; // Solicitado por
  observation: string; // Observación
  motive?: string; // Motivo
  urgency?: string; // Urgencia
  originCountry?: string; // País/región de origen
  foreignUnitPrice?: number; // Vlr_Unit_Extranj
  transportRequestDate?: string; // Fecha_Solicitud_Serv_Transp
  billingManagement?: string; // Gestion_Facturacion
  donationNovelty?: string; // Novedad_Donacion
  freeText?: string; // Texto libre
  currency: string; // Moneda
  donationNovelty2?: string; // Novedad_Donaciones
  giftNovelty?: string; // Novedad_Obsequios
  status?: string;
}
