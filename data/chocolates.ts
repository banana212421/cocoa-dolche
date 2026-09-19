import amarettoImage from "@/assets/chocolates/amaretto.jpg.asset.json";
import bananasFosterImage from "@/assets/chocolates/bananas-foster.jpg.asset.json";
import brownieBatterImage from "@/assets/chocolates/brownie-batter.jpg.asset.json";
import caramelAppleCiderImage from "@/assets/chocolates/caramel-apple-cider.jpg.asset.json";
import champagneImage from "@/assets/chocolates/champagne.jpg.asset.json";
import cheesecakeImage from "@/assets/chocolates/cheesecake.jpg.asset.json";
import confettiCakeImage from "@/assets/chocolates/confetti-cake.jpg.asset.json";
import cookiesCreamImage from "@/assets/chocolates/cookies-cream.jpg.asset.json";
import cremeBruleeImage from "@/assets/chocolates/creme-brulee.jpg.asset.json";
import dulceDeLecheImage from "@/assets/chocolates/dulce-de-leche.jpg.asset.json";
import espressoMartiniImage from "@/assets/chocolates/espresso-martini.jpg.asset.json";
import greySaltCaramelImage from "@/assets/chocolates/grey-salt-caramel.jpg.asset.json";
import keyLimePieImage from "@/assets/chocolates/key-lime-pie.jpg.asset.json";
import lemonImage from "@/assets/chocolates/lemon.jpg.asset.json";
import manhattanImage from "@/assets/chocolates/manhattan.jpg.asset.json";
import mapleCreamImage from "@/assets/chocolates/maple-cream.jpg.asset.json";
import peanutButterCaramelImage from "@/assets/chocolates/peanut-butter-caramel.jpg.asset.json";
import pineappleMoscatoImage from "@/assets/chocolates/pineapple-moscato.jpg.asset.json";
import pistachioImage from "@/assets/chocolates/pistachio.jpg.asset.json";
import pumpkinSpiceLatteImage from "@/assets/chocolates/pumpkin-spice-latte.jpg.asset.json";
import raspberryImage from "@/assets/chocolates/raspberry.jpg.asset.json";
import saltedCaramelImage from "@/assets/chocolates/salted-caramel.jpg.asset.json";
import smoresImage from "@/assets/chocolates/smores.jpg.asset.json";
import teaHoneyImage from "@/assets/chocolates/tea-honey.jpg.asset.json";
import turtleImage from "@/assets/chocolates/turtle.jpg.asset.json";

export type Chocolate = {
  id: string;
  name: string;
  /** Bonbon shell color */
  color: string;
  /** Decorative splatter / accent color */
  accent: string;
  /** Catalog product photo */
  image?: string;
  /** Printed company logo marker */
  isLogo?: boolean;
};

export const availableChocolates: Chocolate[] = [
  { id: "corporate-logo", name: "Custom Logo Chocolates", color: "#efe6d4", accent: "#5b4632", isLogo: true },
  { id: "amaretto", name: "Amaretto", color: "#7a4a3a", accent: "#c1392b", image: amarettoImage.url },
  { id: "bananas-foster", name: "Bananas Foster", color: "#3b2318", accent: "#f0c060", image: bananasFosterImage.url },
  { id: "brownie-batter", name: "Brownie Batter", color: "#3d2a5c", accent: "#2f9e8f", image: brownieBatterImage.url },
  { id: "caramel-apple-cider", name: "Caramel Apple Cider", color: "#c05a24", accent: "#8c1f1f", image: caramelAppleCiderImage.url },
  { id: "champagne", name: "Champagne", color: "#4a3324", accent: "#e0c48a", image: champagneImage.url },
  { id: "cheesecake", name: "Cheesecake", color: "#1f3a7a", accent: "#e8b04b", image: cheesecakeImage.url },
  { id: "confetti-cake", name: "Confetti Cake", color: "#4fb3c9", accent: "#f2e26b", image: confettiCakeImage.url },
  { id: "cookies-cream", name: "Cookies & Cream", color: "#2f6fae", accent: "#f4f4f4", image: cookiesCreamImage.url },
  { id: "creme-brulee", name: "Crème Brûlée", color: "#6b4429", accent: "#f6e7c1", image: cremeBruleeImage.url },
  { id: "dulce-de-leche", name: "Dulce de Leche", color: "#12657a", accent: "#e07a2b", image: dulceDeLecheImage.url },
  { id: "espresso-martini", name: "Espresso Martini", color: "#2b1a14", accent: "#d98b3a", image: espressoMartiniImage.url },
  { id: "grey-salt-caramel", name: "Grey Salt Caramel", color: "#4a2f21", accent: "#dcdcdc", image: greySaltCaramelImage.url },
  { id: "key-lime-pie", name: "Key Lime Pie", color: "#6faa3f", accent: "#e9f2c0", image: keyLimePieImage.url },
  { id: "lemon", name: "Lemon", color: "#e8c93f", accent: "#fff3a8", image: lemonImage.url },
  { id: "manhattan", name: "Manhattan", color: "#5a3a20", accent: "#c76a2a", image: manhattanImage.url },
  { id: "maple-cream", name: "Maple Cream", color: "#a06a44", accent: "#f0dcc0", image: mapleCreamImage.url },
  { id: "peanut-butter-caramel", name: "Peanut Butter Caramel", color: "#4a2a1c", accent: "#2f9ec4", image: peanutButterCaramelImage.url },
  { id: "pineapple-moscato", name: "Pineapple Moscato", color: "#d94f7a", accent: "#f2d24b", image: pineappleMoscatoImage.url },
  { id: "pistachio", name: "Pistachio", color: "#1f5c46", accent: "#a8d5a2", image: pistachioImage.url },
  { id: "pumpkin-spice-latte", name: "Pumpkin Spice Latte", color: "#d08020", accent: "#f6e0b8", image: pumpkinSpiceLatteImage.url },
  { id: "raspberry", name: "Raspberry", color: "#a8172a", accent: "#e5556f", image: raspberryImage.url },
  { id: "smores", name: "S'Mores", color: "#8a6242", accent: "#f4e3c8", image: smoresImage.url },
  { id: "salted-caramel", name: "Salted Caramel", color: "#4a3b52", accent: "#2fb0c4", image: saltedCaramelImage.url },
  { id: "tea-honey", name: "Tea & Honey", color: "#6a4a2a", accent: "#4fb3c9", image: teaHoneyImage.url },
  { id: "turtle", name: "Turtle", color: "#a5734a", accent: "#3a2a20", image: turtleImage.url },
];

export const ribbonColors = [
  { id: "gold", name: "Antique Gold", color: "#c8a24a" },
  { id: "burgundy", name: "Burgundy", color: "#7a1f2b" },
  { id: "ivory", name: "Ivory", color: "#efe6d4" },
  { id: "navy", name: "Midnight Navy", color: "#1e2a4a" },
  { id: "forest", name: "Forest Green", color: "#24503c" },
];

export const boxOptions = [
  { size: 6, price: 26.5, cols: 3, rows: 2 },
  { size: 10, price: 40.0, cols: 5, rows: 2 },
  { size: 16, price: 57.5, cols: 4, rows: 4 },
  { size: 30, price: 95.0, cols: 6, rows: 5 },
  { size: 50, price: 135.0, cols: 10, rows: 5 },
] as const;

export type BoxOption = (typeof boxOptions)[number];

/**
 * Logo slots form a centered rectangle scaled to the box size.
 * For short (2-row) boxes the logo spans every row and the inner columns:
 *   6-piece  (3×2) → slots 2, 5  (1 center col × 2 rows)
 *   10-piece (5×2) → slots 2, 3, 4, 7, 8, 9  (3 center cols × 2 rows)
 * For taller boxes (4+ rows) the block is ~40% of the width and ~60% of
 * the height, e.g. the 50-piece box (10×5) gets a 4-across × 3-down block.
 */
export function isCenterSlot(index: number, option: BoxOption) {
  const row = Math.floor(index / option.cols);
  const col = index % option.cols;

  let colBand: number;
  let rowBand: number;

  if (option.rows <= 2) {
    colBand = Math.max(1, option.cols - 2);
    rowBand = option.rows;
  } else {
    colBand = Math.max(1, Math.round(option.cols * 0.4));
    rowBand = Math.max(1, Math.round(option.rows * 0.6));
  }

  const colStart = Math.floor((option.cols - colBand) / 2);
  const rowStart = Math.floor((option.rows - rowBand) / 2);

  return (
    col >= colStart && col < colStart + colBand &&
    row >= rowStart && row < rowStart + rowBand
  );
}
