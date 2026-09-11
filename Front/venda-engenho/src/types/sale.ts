export type PaymentMethod = "dinheiro" | "pix";

export interface Product {
  id: string;
  name: string;
  unitPrice: number;
}

export interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleRecord {
  id: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  received: number;
  change: number;
  createdAt: string;
}

export type ProductQuantities = Record<string, number>;
