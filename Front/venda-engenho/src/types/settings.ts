export type AppTheme = "light" | "dark";

export type ProductPriceMap = Record<string, number>;

export interface PixSettings {
  pixKey: string;
  pixMerchantName: string;
  pixMerchantCity: string;
}
