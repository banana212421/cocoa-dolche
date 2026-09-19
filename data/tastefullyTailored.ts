import type { CartItem } from "@/context/CartContext";

export type TailoredAddonId = "box-label" | "box-insert" | "message-card" | "bar-labels";
export type ArtworkChoice = "template" | "custom";
export type MessageCardSide = "single" | "double";

export type TailoredCharge = {
  id: TailoredAddonId | "design-fee";
  label: string;
  quantity: number;
  rate: number;
  total: number;
};

export type TastefullyTailoredState = {
  selected: TailoredAddonId[];
  artworkChoice: ArtworkChoice;
  messageCardSide: MessageCardSide;
  charges: TailoredCharge[];
  total: number;
};

export const emptyTailoredState: TastefullyTailoredState = {
  selected: [],
  artworkChoice: "template",
  messageCardSide: "single",
  charges: [],
  total: 0,
};

export const quantityTiers = ["50–99", "100–249", "250–499", "500+"] as const;
export type TierRate = readonly [number | null, number | null, number | null, number | null];

export const tailoredRates = {
  boxLabel: {
    small: [2.1, 1.3, 0.8, 0.55],
    large: [2.45, 1.8, 1.1, 0.65],
  },
  boxInsert: {
    small: [1.3, 0.9, 0.65, 0.4],
    large: [2.4, 1.85, 1.4, 1.15],
  },
  messageCard: {
    single: [0.95, 0.65, 0.4, 0.3],
    double: [1.05, 0.75, 0.6, 0.35],
  },
  barLabels: {
    tasting: [null, null, null, 0.1],
    mini: [null, 1.55, 1.4, 1.35],
    full: [null, 1.8, 1.75, 1.65],
  },
} satisfies Record<string, Record<string, TierRate>>;

export function tierIndex(quantity: number) {
  if (quantity >= 500) return 3;
  if (quantity >= 250) return 2;
  if (quantity >= 100) return 1;
  if (quantity >= 50) return 0;
  return -1;
}

export function rateFor(quantity: number, rates: TierRate) {
  const index = tierIndex(quantity);
  if (index === 0) return rates[0];
  if (index === 1) return rates[1];
  if (index === 2) return rates[2];
  if (index === 3) return rates[3];
  return null;
}

export function getBoxSize(item: CartItem) {
  if (item.productDetails?.kind === "custom-box") return item.productDetails.boxSize;
  const match = `${item.title} ${item.subtitle}`.match(/(?:Custom\s+)?(6|10|16|30|50)[- ]Piece/i);
  return match?.[1] ? Number(match[1]) : null;
}

export function getBoxQuantities(items: CartItem[]) {
  return items.reduce(
    (result, item) => {
      const size = getBoxSize(item);
      if (size && [6, 10, 16].includes(size)) result.small += item.quantity;
      if (size && [30, 50].includes(size)) result.large += item.quantity;
      return result;
    },
    { small: 0, large: 0 },
  );
}

export function getBarQuantities(items: CartItem[]) {
  return items.reduce(
    (result, item) => {
      if (item.productDetails?.kind === "chocolate-bars") {
        result.mini += item.productDetails.miniPerBundle * item.quantity;
        result.full += item.productDetails.fullPerBundle * item.quantity;
        result.tasting += item.productDetails.tastingPerBundle * item.quantity;
        return result;
      }
      if (item.category === "Chocolate Bars") {
        item.lines.forEach((line) => {
          const quantity = line.qty * item.quantity;
          if (/tasting/i.test(line.label)) result.tasting += quantity;
          else if (/mini/i.test(line.label)) result.mini += quantity;
          else if (/full/i.test(line.label)) result.full += quantity;
        });
      }
      return result;
    },
    { tasting: 0, mini: 0, full: 0 },
  );
}

function addTierCharge(charges: TailoredCharge[], id: TailoredAddonId, label: string, quantity: number, rates: TierRate) {
  const rate = rateFor(quantity, rates);
  if (quantity > 0 && rate !== null) charges.push({ id, label, quantity, rate, total: quantity * rate });
}

export function calculateTailoredCharges(
  items: CartItem[],
  selected: TailoredAddonId[],
  artworkChoice: ArtworkChoice,
  messageCardSide: MessageCardSide,
) {
  const charges: TailoredCharge[] = [];
  const boxes = getBoxQuantities(items);
  const bars = getBarQuantities(items);
  const allEligibleItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (selected.includes("box-label")) {
    addTierCharge(charges, "box-label", "Box Labels · 6/10/16 Piece", boxes.small, tailoredRates.boxLabel.small);
    addTierCharge(charges, "box-label", "Box Labels · 30/50 Piece", boxes.large, tailoredRates.boxLabel.large);
  }
  if (selected.includes("box-insert")) {
    addTierCharge(charges, "box-insert", "Box Inserts · 6/10/16 Piece", boxes.small, tailoredRates.boxInsert.small);
    addTierCharge(charges, "box-insert", "Box Inserts · 30/50 Piece", boxes.large, tailoredRates.boxInsert.large);
  }
  if (selected.includes("message-card")) {
    addTierCharge(
      charges,
      "message-card",
      `Personalized Message Cards · ${messageCardSide === "single" ? "Single Sided" : "Double Sided"}`,
      allEligibleItems,
      tailoredRates.messageCard[messageCardSide],
    );
  }
  if (selected.includes("bar-labels")) {
    addTierCharge(charges, "bar-labels", "Bar Labels · Tasting Square", bars.tasting, tailoredRates.barLabels.tasting);
    addTierCharge(charges, "bar-labels", "Bar Labels · Mini", bars.mini, tailoredRates.barLabels.mini);
    addTierCharge(charges, "bar-labels", "Bar Labels · Full", bars.full, tailoredRates.barLabels.full);
  }
  if (selected.length > 0 && artworkChoice === "custom") {
    charges.push({ id: "design-fee", label: "Custom design service", quantity: 1, rate: 75, total: 75 });
  }

  return {
    selected,
    artworkChoice,
    messageCardSide,
    charges,
    total: charges.reduce((sum, charge) => sum + charge.total, 0),
  } satisfies TastefullyTailoredState;
}
