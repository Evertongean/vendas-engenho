import { roundCurrency } from "@/utils/money";

export interface GeneratePixPayloadInput {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  txid?: string;
}

const GUI = "br.gov.bcb.pix";
const MERCHANT_CATEGORY_CODE = "0000";
const CURRENCY_BRL = "986";
const COUNTRY_CODE = "BR";
const DEFAULT_TXID = "***";
const MAX_MERCHANT_NAME_LENGTH = 25;
const MAX_MERCHANT_CITY_LENGTH = 15;
const MAX_TXID_LENGTH = 25;

export function normalizePixText(value: string, maxLength: number) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 $%*+\-./:]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, maxLength)
    .trim();
}

export function calculateCRC16(payload: string) {
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }

      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function generatePixPayload({
  pixKey,
  merchantName,
  merchantCity,
  amount,
  txid = DEFAULT_TXID,
}: GeneratePixPayloadInput) {
  const normalizedPixKey = pixKey.trim();
  const normalizedMerchantName = normalizePixText(
    merchantName,
    MAX_MERCHANT_NAME_LENGTH
  );
  const normalizedMerchantCity = normalizePixText(
    merchantCity,
    MAX_MERCHANT_CITY_LENGTH
  );
  const normalizedTxid = normalizePixText(txid, MAX_TXID_LENGTH) || DEFAULT_TXID;
  const normalizedAmount = roundCurrency(amount);

  if (!normalizedPixKey) {
    throw new Error("Chave PIX obrigatoria.");
  }

  if (!normalizedMerchantName) {
    throw new Error("Nome do recebedor PIX obrigatorio.");
  }

  if (!normalizedMerchantCity) {
    throw new Error("Cidade PIX obrigatoria.");
  }

  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new Error("Valor PIX invalido.");
  }

  const merchantAccountInformation = createTLV("26", [
    createTLV("00", GUI),
    createTLV("01", normalizedPixKey),
  ].join(""));
  const additionalDataField = createTLV("62", createTLV("05", normalizedTxid));
  const payloadWithoutCRC = [
    createTLV("00", "01"),
    merchantAccountInformation,
    createTLV("52", MERCHANT_CATEGORY_CODE),
    createTLV("53", CURRENCY_BRL),
    createTLV("54", normalizedAmount.toFixed(2)),
    createTLV("58", COUNTRY_CODE),
    createTLV("59", normalizedMerchantName),
    createTLV("60", normalizedMerchantCity),
    additionalDataField,
  ].join("");
  const payloadForCRC = `${payloadWithoutCRC}6304`;

  return `${payloadForCRC}${calculateCRC16(payloadForCRC)}`;
}

function createTLV(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}
