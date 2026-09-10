import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { Colors } from "@/constants/theme";
import { DEFAULT_PRODUCTS } from "@/data/products";
import type { Product } from "@/types/sale";
import type { AppTheme, ProductPriceMap } from "@/types/settings";
import { roundCurrency } from "@/utils/money";

interface SettingsContextValue {
  products: Product[];
  themeMode: AppTheme;
  colors: (typeof Colors)[AppTheme];
  settingsLoading: boolean;
  saveProductPrices: (prices: ProductPriceMap) => Promise<void>;
  updateProductPrice: (id: string, unitPrice: number) => Promise<void>;
  setThemeMode: (theme: AppTheme) => Promise<void>;
  loadSettings: () => Promise<void>;
}

const PRODUCT_STORAGE_KEY = "@venda-engenho:products";
const THEME_STORAGE_KEY = "@venda-engenho:theme";
const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined
);

function isAppTheme(value: unknown): value is AppTheme {
  return value === "light" || value === "dark";
}

function normalizePrice(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return undefined;
  }

  return roundCurrency(value);
}

function mapProductsWithPrices(prices: ProductPriceMap) {
  return DEFAULT_PRODUCTS.map((product) => ({
    ...product,
    unitPrice: prices[product.id] ?? product.unitPrice,
  }));
}

function readPricesFromParsedValue(value: unknown): ProductPriceMap {
  const prices: ProductPriceMap = {};

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (!item || typeof item !== "object") {
        return;
      }

      const storedProduct = item as Partial<Product>;
      const unitPrice = normalizePrice(storedProduct.unitPrice);

      if (typeof storedProduct.id === "string" && unitPrice !== undefined) {
        prices[storedProduct.id] = unitPrice;
      }
    });

    return prices;
  }

  if (!value || typeof value !== "object") {
    return prices;
  }

  Object.entries(value as Record<string, unknown>).forEach(([id, price]) => {
    const unitPrice = normalizePrice(price);

    if (unitPrice !== undefined) {
      prices[id] = unitPrice;
    }
  });

  return prices;
}

async function readStoredPrices() {
  const storedProducts = await AsyncStorage.getItem(PRODUCT_STORAGE_KEY);

  if (!storedProducts) {
    return {};
  }

  return readPricesFromParsedValue(JSON.parse(storedProducts));
}

function normalizePriceMap(prices: ProductPriceMap) {
  return DEFAULT_PRODUCTS.reduce<ProductPriceMap>((normalizedPrices, product) => {
    const unitPrice = normalizePrice(prices[product.id]);

    if (unitPrice === undefined) {
      throw new Error(`Preco invalido para ${product.name}.`);
    }

    normalizedPrices[product.id] = unitPrice;
    return normalizedPrices;
  }, {});
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [themeMode, setThemeModeState] = useState<AppTheme>("light");
  const [settingsLoading, setSettingsLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      setSettingsLoading(true);

      const [storedPrices, storedTheme] = await Promise.all([
        readStoredPrices(),
        AsyncStorage.getItem(THEME_STORAGE_KEY),
      ]);

      setProducts(mapProductsWithPrices(storedPrices));

      if (isAppTheme(storedTheme)) {
        setThemeModeState(storedTheme);
      }
    } catch (error) {
      console.warn("Nao foi possivel carregar as configuracoes.", error);
      setProducts(DEFAULT_PRODUCTS);
      setThemeModeState("light");
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const saveProductPrices = useCallback(async (prices: ProductPriceMap) => {
    const normalizedPrices = normalizePriceMap(prices);
    const nextProducts = mapProductsWithPrices(normalizedPrices);

    await AsyncStorage.setItem(
      PRODUCT_STORAGE_KEY,
      JSON.stringify(normalizedPrices)
    );
    setProducts(nextProducts);
  }, []);

  const updateProductPrice = useCallback(
    async (id: string, unitPrice: number) => {
      const currentPrices = products.reduce<ProductPriceMap>((prices, product) => {
        prices[product.id] = product.unitPrice;
        return prices;
      }, {});

      await saveProductPrices({
        ...currentPrices,
        [id]: unitPrice,
      });
    },
    [products, saveProductPrices]
  );

  const setThemeMode = useCallback(
    async (nextThemeMode: AppTheme) => {
      const previousThemeMode = themeMode;

      setThemeModeState(nextThemeMode);

      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, nextThemeMode);
      } catch (error) {
        setThemeModeState(previousThemeMode);
        console.warn("Nao foi possivel salvar o tema.", error);
        throw error;
      }
    },
    [themeMode]
  );

  const contextValue = useMemo<SettingsContextValue>(
    () => ({
      products,
      themeMode,
      colors: Colors[themeMode],
      settingsLoading,
      saveProductPrices,
      updateProductPrice,
      setThemeMode,
      loadSettings,
    }),
    [
      products,
      themeMode,
      settingsLoading,
      saveProductPrices,
      updateProductPrice,
      setThemeMode,
      loadSettings,
    ]
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings deve ser usado dentro de SettingsProvider.");
  }

  return context;
}
