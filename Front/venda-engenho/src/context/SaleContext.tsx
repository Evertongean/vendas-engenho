import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useSettings } from "@/context/SettingsContext";
import { roundCurrency } from "@/utils/money";
import type {
  PaymentMethod,
  Product,
  ProductQuantities,
  SaleItem,
  SaleRecord,
} from "@/types/sale";

interface CreateSaleRecordInput {
  paymentMethod: PaymentMethod;
  received: number;
  change: number;
}

interface AddVoiceSaleItemInput {
  productId: string;
  quantity: number;
}

interface SaleContextValue {
  products: Product[];
  quantities: ProductQuantities;
  items: SaleItem[];
  total: number;
  totalItems: number;
  sales: SaleRecord[];
  salesLoading: boolean;
  settingsLoading: boolean;
  addProduct: (id: string) => void;
  addVoiceItems: (items: AddVoiceSaleItemInput[]) => void;
  removeProduct: (id: string) => void;
  clearProduct: (id: string) => void;
  updateProductQuantity: (id: string, quantity: number) => void;
  clearSale: () => void;
  createSaleRecord: (input: CreateSaleRecordInput) => SaleRecord;
  saveSale: (sale: SaleRecord) => Promise<void>;
  loadSales: () => Promise<void>;
  clearSales: () => Promise<void>;
}

const SaleContext = createContext<SaleContextValue | undefined>(undefined);
const SALES_STORAGE_KEY = "@venda-engenho:sales";

function createSaleId() {
  return `sale-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) {
    return 0;
  }

  return Math.max(Math.floor(quantity), 0);
}

function isSaleRecord(value: unknown): value is SaleRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const sale = value as SaleRecord;

  return (
    typeof sale.id === "string" &&
    Array.isArray(sale.items) &&
    typeof sale.total === "number" &&
    (sale.paymentMethod === "dinheiro" || sale.paymentMethod === "pix") &&
    typeof sale.received === "number" &&
    typeof sale.change === "number" &&
    typeof sale.createdAt === "string"
  );
}

async function readStoredSales() {
  const storedSales = await AsyncStorage.getItem(SALES_STORAGE_KEY);

  if (!storedSales) {
    return [];
  }

  const parsedSales: unknown = JSON.parse(storedSales);

  if (!Array.isArray(parsedSales)) {
    return [];
  }

  return parsedSales.filter(isSaleRecord);
}

export function SaleProvider({ children }: { children: ReactNode }) {
  const { products, settingsLoading } = useSettings();
  const [quantities, setQuantities] = useState<ProductQuantities>({});
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);

  useEffect(() => {
    void loadSales();
  }, []);

  const items = useMemo(() => {
    return products.reduce<SaleItem[]>((saleItems, product) => {
      const quantity = quantities[product.id] ?? 0;

      if (quantity <= 0) {
        return saleItems;
      }

      saleItems.push({
        id: product.id,
        name: product.name,
        quantity,
        unitPrice: product.unitPrice,
        subtotal: roundCurrency(product.unitPrice * quantity),
      });

      return saleItems;
    }, []);
  }, [products, quantities]);

  const total = useMemo(() => {
    return roundCurrency(
      items.reduce((saleTotal, item) => saleTotal + item.subtotal, 0)
    );
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce((quantityTotal, item) => quantityTotal + item.quantity, 0);
  }, [items]);

  function updateProductQuantity(id: string, quantity: number) {
    const nextQuantity = normalizeQuantity(quantity);

    setQuantities((current) => ({
      ...current,
      [id]: nextQuantity,
    }));
  }

  function addProduct(id: string) {
    setQuantities((current) => ({
      ...current,
      [id]: (current[id] ?? 0) + 1,
    }));
  }

  function addVoiceItems(voiceItems: AddVoiceSaleItemInput[]) {
    const productIds = new Set(products.map((product) => product.id));

    setQuantities((current) => {
      const nextQuantities = { ...current };

      voiceItems.forEach((item) => {
        const quantity = normalizeQuantity(item.quantity);

        if (quantity <= 0 || !productIds.has(item.productId)) {
          return;
        }

        nextQuantities[item.productId] =
          (nextQuantities[item.productId] ?? 0) + quantity;
      });

      return nextQuantities;
    });
  }

  function removeProduct(id: string) {
    setQuantities((current) => ({
      ...current,
      [id]: Math.max((current[id] ?? 0) - 1, 0),
    }));
  }

  function clearProduct(id: string) {
    setQuantities((current) => ({
      ...current,
      [id]: 0,
    }));
  }

  function clearSale() {
    setQuantities({});
  }

  function createSaleRecord(input: CreateSaleRecordInput): SaleRecord {
    return {
      id: createSaleId(),
      items: items.map((item) => ({ ...item })),
      total,
      paymentMethod: input.paymentMethod,
      received: roundCurrency(input.received),
      change: roundCurrency(input.change),
      createdAt: new Date().toISOString(),
    };
  }

  async function loadSales() {
    try {
      setSalesLoading(true);
      const storedSales = await readStoredSales();
      setSales(storedSales);
    } catch (error) {
      console.warn("Nao foi possivel carregar o historico de vendas.", error);
      setSales([]);
    } finally {
      setSalesLoading(false);
    }
  }

  async function saveSale(sale: SaleRecord) {
    try {
      const storedSales = await readStoredSales();
      const nextSales = [
        sale,
        ...storedSales.filter((storedSale) => storedSale.id !== sale.id),
      ];

      await AsyncStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(nextSales));
      setSales(nextSales);
    } catch (error) {
      console.warn("Nao foi possivel salvar a venda no historico.", error);
      throw error;
    }
  }

  async function clearSales() {
    try {
      await AsyncStorage.removeItem(SALES_STORAGE_KEY);
      setSales([]);
    } catch (error) {
      console.warn("Nao foi possivel limpar o historico de vendas.", error);
      throw error;
    }
  }

  const contextValue = useMemo<SaleContextValue>(
    () => ({
      products,
      quantities,
      items,
      total,
      totalItems,
      sales,
      salesLoading,
      settingsLoading,
      addProduct,
      addVoiceItems,
      removeProduct,
      clearProduct,
      updateProductQuantity,
      clearSale,
      createSaleRecord,
      saveSale,
      loadSales,
      clearSales,
    }),
    [items, quantities, sales, salesLoading, settingsLoading, total, totalItems, products]
  );

  return (
    <SaleContext.Provider value={contextValue}>{children}</SaleContext.Provider>
  );
}

export function useSale() {
  const context = useContext(SaleContext);

  if (!context) {
    throw new Error("useSale deve ser usado dentro de SaleProvider.");
  }

  return context;
}
