export function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(value: number) {
  return `R$ ${roundCurrency(value).toFixed(2).replace(".", ",")}`;
}

export function formatCurrencyInput(value: number) {
  return roundCurrency(value).toFixed(2).replace(".", ",");
}

export function parseCurrencyInput(value: string) {
  const cleaned = value.trim().replace(/[^\d.,]/g, "");

  if (!cleaned) {
    return 0;
  }

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const separatorCount = (cleaned.match(/[.,]/g) ?? []).length;

  if (separatorCount === 1) {
    const separatorIndex = Math.max(lastComma, lastDot);
    const digitsAfterSeparator = cleaned.length - separatorIndex - 1;

    if (digitsAfterSeparator === 3) {
      const thousandsValue = Number(cleaned.replace(/[^\d]/g, ""));
      return Number.isFinite(thousandsValue) ? roundCurrency(thousandsValue) : 0;
    }
  }

  const decimalSeparator =
    lastComma > lastDot ? "," : lastDot > -1 ? "." : undefined;

  if (!decimalSeparator) {
    const integerValue = Number(cleaned.replace(/[^\d]/g, ""));
    return Number.isFinite(integerValue) ? roundCurrency(integerValue) : 0;
  }

  const parts = cleaned.split(decimalSeparator);
  const decimalPart = parts.pop() ?? "";
  const integerPart = parts.join("").replace(/[^\d]/g, "") || "0";
  const normalizedValue = `${integerPart}.${decimalPart.replace(/[^\d]/g, "")}`;
  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? roundCurrency(parsedValue) : 0;
}

export function parseCurrencyInputStrict(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue || trimmedValue.includes("-")) {
    return undefined;
  }

  const cleaned = trimmedValue.replace(/^R\$\s?/i, "").trim();

  if (!/^\d+(?:[,.]\d{0,2})?$/.test(cleaned)) {
    return undefined;
  }

  const parsedValue = Number(cleaned.replace(",", "."));

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return undefined;
  }

  return roundCurrency(parsedValue);
}
