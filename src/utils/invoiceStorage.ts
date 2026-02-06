// src/utils/invoiceStorage.ts
// Utility para manejar facturas guardadas en localStorage

import { IInvoice } from "@/types/invoice.types";

const STORAGE_KEY = "invoices";

/**
 * Obtener todas las facturas guardadas en localStorage
 */
export function getSavedInvoices(): IInvoice[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);

    // Convertir fechas de string a Date
    return parsed.map((inv: any) => ({
      ...inv,
      issueDate: new Date(inv.issueDate),
      dueDate: inv.dueDate ? new Date(inv.dueDate) : undefined,
      createdAt: new Date(inv.createdAt),
      updatedAt: new Date(inv.updatedAt),
    }));
  } catch (error) {
    console.error("Error al obtener facturas guardadas:", error);
    return [];
  }
}

/**
 * Guardar una nueva factura
 */
export function saveInvoice(invoice: Omit<IInvoice, "_id">): IInvoice {
  const newInvoice: IInvoice = {
    ...invoice,
    _id: `invoice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };

  const existing = getSavedInvoices();
  const updated = [...existing, newInvoice];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return newInvoice;
}

/**
 * Actualizar una factura existente
 */
export function updateInvoice(
  id: string,
  updates: Partial<IInvoice>,
): IInvoice | null {
  const invoices = getSavedInvoices();
  const index = invoices.findIndex((inv) => inv._id === id);

  if (index === -1) return null;

  const updated = { ...invoices[index], ...updates, updatedAt: new Date() };
  invoices[index] = updated;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));

  return updated;
}

/**
 * Eliminar una factura
 */
export function deleteInvoice(id: string): boolean {
  const invoices = getSavedInvoices();
  const filtered = invoices.filter((inv) => inv._id !== id);

  if (filtered.length === invoices.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

  return true;
}

/**
 * Combinar facturas guardadas con facturas mock
 */
export function combineInvoices(mockInvoices: IInvoice[]): IInvoice[] {
  const savedInvoices = getSavedInvoices();

  // Combinar y ordenar por fecha de creación (más recientes primero)
  const combined = [...savedInvoices, ...mockInvoices];

  return combined.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
}

/**
 * Limpiar todas las facturas guardadas (útil para testing)
 */
export function clearSavedInvoices(): void {
  localStorage.removeItem(STORAGE_KEY);
}
