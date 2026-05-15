export type Stage = 1 | 2 | 3 | 4 | 5;
export type MerchantType = "geral" | "ferreiro" | "alimentos" | "alquimista" | "esoterico" | "vestuario";

export type StageInfo = {
  name: string;
  flavor: string;
  icon: string;
  stockMultiplier: number;
  priceMultiplier: number;
  maxItemPricePc: number;
  unlocksRareItems?: boolean;
};

export type MerchantInfo = {
  name: string;
  icon: string;
  description: string;
  categories: string[];
  flavor: { greeting: string };
};

export const STAGES: Record<Stage, StageInfo> = {
  1: {
    name: "Vilarejo Isolado",
    flavor: "Pouco estoque e preços altos. O mascate passa de vez em quando.",
    icon: "🏚",
    stockMultiplier: 0.3,
    priceMultiplier: 1.2,
    maxItemPricePc: 500,
  },
  2: {
    name: "Posto Comercial",
    flavor: "Feira semanal e mercadores de passagem.",
    icon: "⛺",
    stockMultiplier: 0.6,
    priceMultiplier: 1,
    maxItemPricePc: 1500,
  },
  3: {
    name: "Vila Comercial",
    flavor: "Mercado fixo com a maioria dos itens comuns.",
    icon: "🏘",
    stockMultiplier: 1,
    priceMultiplier: 1,
    maxItemPricePc: 5000,
  },
  4: {
    name: "Cidade Grande",
    flavor: "Guildas, ourives e alquimistas estabelecidos.",
    icon: "🏛",
    stockMultiplier: 2,
    priceMultiplier: 1,
    maxItemPricePc: 30000,
  },
  5: {
    name: "Bazar Arcano",
    flavor: "Itens raros, superiores e alquimia mística.",
    icon: "✨",
    stockMultiplier: 5,
    priceMultiplier: 1,
    maxItemPricePc: Number.MAX_SAFE_INTEGER,
    unlocksRareItems: true,
  },
};

export const MERCHANT_TYPES: Record<MerchantType, MerchantInfo> = {
  geral: {
    name: "Mercador Geral",
    icon: "🛒",
    description: "Um pouco de tudo.",
    categories: [
      "arma", "armadura", "escudo", "equipamento_aventura", "ferramenta",
      "vestuario", "alquimico_preparado", "animal", "bens_comuns", "servico", "municao",
    ],
    flavor: { greeting: "Bem-vindo à minha humilde tenda, viajante." },
  },
  ferreiro: {
    name: "Ferreiro",
    icon: "⚒",
    description: "Armas, armaduras e ferramentas de metal.",
    categories: ["arma", "armadura", "escudo", "municao", "ferramenta"],
    flavor: { greeting: "Aço bom, preço justo. Olhe à vontade." },
  },
  alimentos: {
    name: "Alimentos",
    icon: "🍞",
    description: "Comida, rações e animais de carga.",
    categories: ["bens_comuns", "animal", "servico"],
    flavor: { greeting: "Pão fresco e carne defumada — o que vai querer?" },
  },
  alquimista: {
    name: "Alquimista",
    icon: "⚗",
    description: "Poções, venenos e catalisadores.",
    categories: ["alquimico_preparado", "alquimico_catalisador", "alquimico_veneno", "alquimia_mistica"],
    flavor: { greeting: "Cuidado onde pisa. Algumas misturas reagem." },
  },
  esoterico: {
    name: "Esotérico",
    icon: "🔮",
    description: "Cajados, símbolos e curiosidades arcanas.",
    categories: ["esoterico", "ferramenta"],
    flavor: { greeting: "Cada objeto aqui tem uma história." },
  },
  vestuario: {
    name: "Alfaiate",
    icon: "🧵",
    description: "Roupas, mantos e ferramentas finas.",
    categories: ["vestuario", "ferramenta"],
    flavor: { greeting: "Vista-se como quer ser tratado." },
  },
};

export type CatalogItem = {
  slug: string;
  category: string;
  price_pc: number;
  min_stage?: number;
  improvements?: number;
  is_arcanium?: boolean;
};

export function generateShopInventory(
  catalog: CatalogItem[],
  stage: Stage,
  merchantType: MerchantType,
  dmMode = false,
): Record<string, number> {
  if (dmMode) {
    const all: Record<string, number> = {};
    catalog.forEach((item) => { all[item.slug] = 99; });
    return all;
  }

  const stageInfo = STAGES[stage];
  const merchant = MERCHANT_TYPES[merchantType];
  const stock: Record<string, number> = {};

  for (const item of catalog) {
    const minStage = item.min_stage ?? 3;
    if (minStage > stage) continue;
    if (!merchant.categories.includes(item.category)) continue;
    if (item.price_pc > stageInfo.maxItemPricePc) continue;
    if (stage < 5) {
      if ((item.improvements ?? 0) > 0) continue;
      if (item.is_arcanium) continue;
      if (item.category === "alquimia_mistica") continue;
    }

    if (stage >= 4) {
      stock[item.slug] = 99;
    } else {
      const baseStock =
        item.price_pc < 1000 ? 5 :
        item.price_pc < 10000 ? 3 : 1;
      const finalStock = Math.max(0, Math.round(baseStock * stageInfo.stockMultiplier));
      if (finalStock > 0) stock[item.slug] = finalStock;
    }
  }

  return stock;
}

export function stagePrice(pc: number, stage: Stage, dmMode = false): number {
  if (dmMode) return pc;
  return Math.round(pc * STAGES[stage].priceMultiplier);
}
