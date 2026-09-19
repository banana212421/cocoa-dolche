import almondSeaSaltImage from "@/assets/chocolate-bars/almond-sea-salt.jpg.asset.json";
import blueberriesAlmondsImage from "@/assets/chocolate-bars/blueberries-almonds.jpg.asset.json";
import caramelLatteImage from "@/assets/chocolate-bars/caramel-latte.jpg.asset.json";
import champagneStrawberriesImage from "@/assets/chocolate-bars/champagne-strawberries.jpg.asset.json";
import confettiCakeImage from "@/assets/chocolate-bars/confetti-cake.jpg.asset.json";
import cookiesCreamImage from "@/assets/chocolate-bars/cookies-cream.jpg.asset.json";
import dark70Image from "@/assets/chocolate-bars/dark-70.jpg.asset.json";
import englishToffeeImage from "@/assets/chocolate-bars/english-toffee.jpg.asset.json";
import mexicanHotCocoaImage from "@/assets/chocolate-bars/mexican-hot-cocoa.jpg.asset.json";
import milkChocolateImage from "@/assets/chocolate-bars/milk-chocolate.jpg.asset.json";

export type ChocolateBar = {
  id: string;
  name: string;
  base: string;
  contains: string;
  color: string;
  accent: string;
  image: string;
  seasonal?: boolean;
};

export const barSizes = [
  { id: "mini", label: "Mini", price: 6.35 },
  { id: "full", label: "Full size", price: 10.65 },
] as const;

export type BarSizeId = (typeof barSizes)[number]["id"];

export const chocolateBars: ChocolateBar[] = [
  {
    id: "cookies-cream",
    name: "Cookies & Cream",
    base: "White Chocolate",
    contains: "Soy, Milk & Wheat",
    color: "#f3efe7",
    accent: "#3a3330",
    image: cookiesCreamImage.url,
  },
  {
    id: "champagne-strawberries",
    name: "Champagne & Strawberries",
    base: "White Chocolate",
    contains: "Soy & Milk",
    color: "#f3c9c4",
    accent: "#b06a63",
    image: champagneStrawberriesImage.url,
  },
  {
    id: "caramel-latte",
    name: "Caramel Latte",
    base: "Gold Chocolate",
    contains: "Soy & Milk",
    color: "#7d8a6d",
    accent: "#4c5540",
    image: caramelLatteImage.url,
  },
  {
    id: "confetti-cake",
    name: "Confetti Cake",
    base: "Gold Chocolate",
    contains: "Soy & Milk",
    color: "#f6efdf",
    accent: "#7c5f9c",
    image: confettiCakeImage.url,
  },
  {
    id: "milk-chocolate",
    name: "Milk Chocolate",
    base: "Milk Chocolate",
    contains: "Soy & Milk",
    color: "#f2d9e6",
    accent: "#8c5a7d",
    image: milkChocolateImage.url,
  },
  {
    id: "english-toffee",
    name: "English Toffee",
    base: "Milk Chocolate",
    contains: "Soy & Milk",
    color: "#d8a172",
    accent: "#8a5a32",
    image: englishToffeeImage.url,
  },
  {
    id: "almond-sea-salt",
    name: "Almond & Sea Salt",
    base: "54% Dark Chocolate",
    contains: "Soy, Milk & Nuts",
    color: "#9fb6c4",
    accent: "#3f5a70",
    image: almondSeaSaltImage.url,
  },
  {
    id: "mexican-hot-cocoa",
    name: "Mexican Blend Hot Cocoa",
    base: "54% Dark Chocolate",
    contains: "Soy & Milk",
    color: "#b1352f",
    accent: "#6d1f1c",
    image: mexicanHotCocoaImage.url,
    seasonal: true,
  },
  {
    id: "dark-70",
    name: "70% Dark Chocolate",
    base: "70% Dark Chocolate",
    contains: "Soy & Milk",
    color: "#5a4a3c",
    accent: "#2f251d",
    image: dark70Image.url,
  },
  {
    id: "blueberries-almonds",
    name: "Blueberries & Almonds",
    base: "70% Dark Chocolate",
    contains: "Soy, Milk & Nuts",
    color: "#41407c",
    accent: "#23224c",
    image: blueberriesAlmondsImage.url,
    seasonal: true,
  },
];
