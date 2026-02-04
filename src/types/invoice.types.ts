// Tipos principales para el sistema de facturación

export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar?: {
    url: string;
  };
}

export interface IInvoiceItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  discount?: number;
  tax?: number;
  total: number;
}

export type InvoiceStatus = 'draft' | 'pending' | 'sent' | 'paid' | 'rejected' | 'overdue';
export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'transfer' | 'check';
export type PaymentType = 'immediate' | 'credit';
export type Currency = 'COP' | 'USD' | 'EUR';

export interface IInvoice {
  _id: string;
  invoiceNumber: string; // TW0001, TW0002, etc.
  institute: string;
  student: IUser;
  customer: IUser;
  
  // Fechas
  issueDate: Date;
  dueDate?: Date; // Solo si es pago a crédito
  
  // Financiero
  currency: Currency;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  purchaseOrder?: string;
  
  // Items
  invoiceItems: IInvoiceItem[];
  
  // Cálculos
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  total: number;
  
  // Adicionales
  additionalCharges?: number;
  additionalDiscount?: number;
  notes?: string;
  
  // Estado
  status: InvoiceStatus;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Tipo para crear/editar facturas (sin campos calculados)
export type CreateInvoiceInput = Omit<IInvoice, '_id' | 'createdAt' | 'updatedAt' | 'subtotal' | 'totalDiscount' | 'totalTax' | 'total'>;

// Filtros para búsqueda
export interface InvoiceFilters {
  search?: string; // Búsqueda por cliente o número
  status?: InvoiceStatus;
  startDate?: Date;
  endDate?: Date;
  customerId?: string;
}

// Tipos para los stats del dashboard
export interface InvoiceStats {
  total: number;
  pending: number;
  sent: number;
  problem: number;
  rejected: number;
}