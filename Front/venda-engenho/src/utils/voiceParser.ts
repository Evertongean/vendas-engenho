import type { Product } from "@/types/sale";

export interface VoiceParsedItem {
  productId: string;
  productName: string;
  quantity: number;
}

export interface VoiceParseResult {
  transcript: string;
  items: VoiceParsedItem[];
  unrecognized: string[];
}

interface ProductAlias {
  product: Product;
  alias: string;
  tokenCount: number;
}

interface AliasMatch {
  alias: ProductAlias;
  start: number;
  end: number;
}

interface QuantityMatch {
  quantity: number;
  removeStart: number;
  removeEnd: number;
}

const MAX_QUANTITY = 100;

const UNIT_WORDS: Record<string, number> = {
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  tres: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
};

const TEEN_WORDS: Record<string, number> = {
  onze: 11,
  doze: 12,
  treze: 13,
  catorze: 14,
  quatorze: 14,
  quinze: 15,
  dezesseis: 16,
  dezaseis: 16,
  dezessete: 17,
  dezoito: 18,
  dezenove: 19,
};

const TENS_WORDS: Record<string, number> = {
  vinte: 20,
  trinta: 30,
  quarenta: 40,
  cinquenta: 50,
  sessenta: 60,
  setenta: 70,
  oitenta: 80,
  noventa: 90,
};

const PRODUCT_ALIASES_BY_NAME: Record<string, string[]> = {
  mel: ["mel", "meis"],
  rapadura: ["rapadura", "rapaduras"],
  "rapadura temperada": [
    "rapadura temperada",
    "rapaduras temperadas",
    "temperada",
    "temperadas",
  ],
  batida: ["batida", "batidas"],
  "caldo de cana": ["caldo de cana", "caldos de cana", "caldo", "caldos"],
};

const IGNORED_PHRASES = [
  "por favor",
  "para mim",
  "pra mim",
  "me de",
  "me da",
  "eu quero",
  "coloca",
  "coloque",
  "quero",
  "adiciona",
  "adicionar",
  "adicione",
].sort((first, second) => second.length - first.length);

const UNSUPPORTED_COMMANDS = [
  "tira",
  "tirar",
  "remove",
  "remover",
  "menos",
  "zera",
  "zerar",
  "limpa",
  "limpar",
];

export function parseVoiceCommand(
  transcript: string,
  products: Product[]
): VoiceParseResult {
  const normalizedTranscript = normalizeText(transcript);
  const preparedTranscript = stripIgnoredPhrases(
    replaceNumberWords(normalizedTranscript)
  );

  if (!preparedTranscript) {
    return {
      transcript: transcript.trim(),
      items: [],
      unrecognized: [],
    };
  }

  if (hasUnsupportedCommand(preparedTranscript)) {
    return {
      transcript: transcript.trim(),
      items: [],
      unrecognized: [cleanUnrecognized(preparedTranscript)],
    };
  }

  const aliases = buildProductAliases(products);
  const aggregatedItems = new Map<string, VoiceParsedItem>();
  const unrecognized: string[] = [];

  splitSegments(preparedTranscript).forEach((segment) => {
    const parsedSegment = parseSegment(segment, aliases);

    parsedSegment.items.forEach((item) => {
      const currentItem = aggregatedItems.get(item.productId);

      if (currentItem) {
        currentItem.quantity += item.quantity;
        return;
      }

      aggregatedItems.set(item.productId, { ...item });
    });

    if (parsedSegment.unrecognized) {
      unrecognized.push(parsedSegment.unrecognized);
    }
  });

  return {
    transcript: transcript.trim(),
    items: Array.from(aggregatedItems.values()),
    unrecognized: uniqueValues(unrecognized),
  };
}

function parseSegment(segment: string, aliases: ProductAlias[]) {
  const items: VoiceParsedItem[] = [];
  let remaining = cleanSegment(segment);

  while (remaining) {
    const match = findBestAlias(remaining, aliases);

    if (!match) {
      break;
    }

    const quantityMatch = findQuantityForMatch(remaining, match);

    items.push({
      productId: match.alias.product.id,
      productName: match.alias.product.name,
      quantity: quantityMatch.quantity,
    });

    remaining = cleanSegment(
      `${remaining.slice(0, quantityMatch.removeStart)} ${remaining.slice(
        quantityMatch.removeEnd
      )}`
    );
  }

  return {
    items,
    unrecognized: remaining ? cleanUnrecognized(remaining) : "",
  };
}

function findQuantityForMatch(segment: string, match: AliasMatch): QuantityMatch {
  const beforeProduct = segment.slice(0, match.start);
  const previousNumber = findLastNumber(beforeProduct);

  if (previousNumber && beforeProduct.slice(previousNumber.end).trim() === "") {
    return {
      quantity: previousNumber.value,
      removeStart: previousNumber.start,
      removeEnd: match.end,
    };
  }

  const afterProduct = segment.slice(match.end);
  const nextNumber = findFirstNumber(afterProduct);

  if (nextNumber && afterProduct.slice(0, nextNumber.start).trim() === "") {
    return {
      quantity: nextNumber.value,
      removeStart: match.start,
      removeEnd: match.end + nextNumber.end,
    };
  }

  return {
    quantity: 1,
    removeStart: match.start,
    removeEnd: match.end,
  };
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.,;:!?]+/g, " | ")
    .replace(/[^a-z0-9|\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function replaceNumberWords(text: string) {
  const tokens = text.split(" ");
  const nextTokens: string[] = [];
  let index = 0;

  while (index < tokens.length) {
    const parsedNumber = parseNumberAt(tokens, index);

    if (parsedNumber) {
      nextTokens.push(String(parsedNumber.value));
      index = parsedNumber.nextIndex;
      continue;
    }

    nextTokens.push(tokens[index]);
    index += 1;
  }

  return nextTokens.join(" ");
}

function parseNumberAt(tokens: string[], index: number) {
  const token = tokens[index];
  const numericValue = Number(token);

  if (Number.isInteger(numericValue) && isSupportedQuantity(numericValue)) {
    return {
      value: numericValue,
      nextIndex: index + 1,
    };
  }

  if (token === "cem") {
    return {
      value: 100,
      nextIndex: index + 1,
    };
  }

  const teenValue = TEEN_WORDS[token];

  if (teenValue) {
    return {
      value: teenValue,
      nextIndex: index + 1,
    };
  }

  const unitValue = UNIT_WORDS[token];

  if (unitValue) {
    return {
      value: unitValue,
      nextIndex: index + 1,
    };
  }

  const tensValue = TENS_WORDS[token];

  if (!tensValue) {
    return undefined;
  }

  const connector = tokens[index + 1];
  const nextUnitValue = UNIT_WORDS[tokens[index + 2]];

  if (connector === "e" && nextUnitValue) {
    return {
      value: tensValue + nextUnitValue,
      nextIndex: index + 3,
    };
  }

  return {
    value: tensValue,
    nextIndex: index + 1,
  };
}

function stripIgnoredPhrases(text: string) {
  return IGNORED_PHRASES.reduce((currentText, phrase) => {
    return currentText.replace(new RegExp(`\\b${phrase}\\b`, "g"), " ");
  }, ` ${text} `)
    .replace(/\s+/g, " ")
    .trim();
}

function splitSegments(text: string) {
  return text
    .replace(/\s*\|\s*/g, " | ")
    .replace(/\s+e\s+/g, " | ")
    .split("|")
    .map(cleanSegment)
    .filter(Boolean);
}

function buildProductAliases(products: Product[]) {
  return products
    .flatMap((product) => {
      const normalizedName = normalizeAlias(product.name);
      const aliases = PRODUCT_ALIASES_BY_NAME[normalizedName] ?? [
        normalizedName,
      ];

      return uniqueValues([normalizedName, ...aliases]).map((alias) => ({
        product,
        alias: normalizeAlias(alias),
        tokenCount: alias.split(" ").length,
      }));
    })
    .filter((alias) => alias.alias.length > 0)
    .sort((first, second) => {
      if (second.tokenCount !== first.tokenCount) {
        return second.tokenCount - first.tokenCount;
      }

      return second.alias.length - first.alias.length;
    });
}

function normalizeAlias(value: string) {
  return normalizeText(value).replace(/\s*\|\s*/g, " ").trim();
}

function findBestAlias(segment: string, aliases: ProductAlias[]) {
  const paddedSegment = ` ${segment} `;

  for (const alias of aliases) {
    const paddedAlias = ` ${alias.alias} `;
    const index = paddedSegment.indexOf(paddedAlias);

    if (index >= 0) {
      return {
        alias,
        start: index,
        end: index + alias.alias.length,
      };
    }
  }

  return undefined;
}

function findLastNumber(value: string) {
  const matches = Array.from(value.matchAll(/\b(100|[1-9][0-9]?)\b/g));
  const lastMatch = matches.at(-1);

  if (!lastMatch || lastMatch.index === undefined) {
    return undefined;
  }

  return createNumberMatch(lastMatch[0], lastMatch.index);
}

function findFirstNumber(value: string) {
  const match = value.match(/\b(100|[1-9][0-9]?)\b/);

  if (!match || match.index === undefined) {
    return undefined;
  }

  return createNumberMatch(match[0], match.index);
}

function createNumberMatch(rawValue: string, start: number) {
  const value = Number(rawValue);

  if (!isSupportedQuantity(value)) {
    return undefined;
  }

  return {
    value,
    start,
    end: start + rawValue.length,
  };
}

function isSupportedQuantity(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= MAX_QUANTITY;
}

function hasUnsupportedCommand(text: string) {
  return UNSUPPORTED_COMMANDS.some((command) => {
    return new RegExp(`\\b${command}\\b`, "g").test(text);
  });
}

function cleanSegment(segment: string) {
  return segment.replace(/\s+/g, " ").trim();
}

function cleanUnrecognized(value: string) {
  return cleanSegment(value.replace(/\s*\|\s*/g, " ").replace(/\be\b/g, " "));
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map(cleanSegment).filter(Boolean)));
}
