import berryBites from "@/assets/bites-mixes/berry-bites.jpg.asset.json";
import healthyBites from "@/assets/bites-mixes/healthy-bites.jpg.asset.json";
import coffeeBites from "@/assets/bites-mixes/coffee-bites.jpg.asset.json";
import nuttyBites from "@/assets/bites-mixes/nutty-bites.jpg.asset.json";
import spicyNutMix from "@/assets/bites-mixes/spicy-nut-mix.jpg.asset.json";
import mapleBourbonPecans from "@/assets/bites-mixes/milk-chocolate-maple-bourbon-pecans.jpg.asset.json";
import darkAlmonds from "@/assets/bites-mixes/dark-chocolate-covered-almonds.jpg.asset.json";
import milkAlmondToffee from "@/assets/bites-mixes/milk-chocolate-almond-toffee.jpg.asset.json";
import espressoMix from "@/assets/bites-mixes/espresso-mix.jpg.asset.json";
import cinnamonAlmondToffee from "@/assets/bites-mixes/cinnamon-almond-toffee.jpg.asset.json";
import peppermintPretzels from "@/assets/bites-mixes/peppermint-pretzels.jpg.asset.json";
import lemonShortbread from "@/assets/bites-mixes/lemon-shortbread.jpg.asset.json";
import mintCookieCrunch from "@/assets/bites-mixes/mint-chocolate-cookie-crunch.jpg.asset.json";
import englishToffee from "@/assets/bites-mixes/english-toffee.jpg.asset.json";
import holidayPeppermintBark from "@/assets/bites-mixes/holiday-peppermint-bark.jpg.asset.json";

export type ProductOption = {
  id: string;
  label: string;
  price: number;
};

export type BitesMixProduct = {
  id: string;
  name: string;
  category: "Bites" | "Mixes" | "Confections";
  description?: string;
  contains: string;
  seasonal?: boolean;
  image: string;
  options: ProductOption[];
};

const miniFull = (): ProductOption[] => [
  { id: "mini", label: "Mini", price: 9.5 },
  { id: "full", label: "Full", price: 18.75 },
];

export const bitesMixProducts: BitesMixProduct[] = [
  {
    id: "berry-bites",
    name: "Berry Bites",
    category: "Bites",
    description: "White chocolate with strawberry, blueberry, raspberries and cherries",
    contains: "Soy & Milk",
    image: berryBites.url,
    options: [{ id: "tube", label: "Tube", price: 16.75 }],
  },
  {
    id: "healthy-bites",
    name: "Healthy Bites",
    category: "Bites",
    description: "70% dark chocolate with pomegranate, almonds and blueberries",
    contains: "Soy, Milk & Nuts",
    image: healthyBites.url,
    options: [{ id: "tube", label: "Tube", price: 16.75 }],
  },
  {
    id: "coffee-bites",
    name: "Coffee Bites",
    category: "Bites",
    description: "Gold chocolate with chocolate-covered coffee beans, cocoa nibs and rice crisps",
    contains: "Soy, Milk & Wheat",
    image: coffeeBites.url,
    options: [{ id: "tube", label: "Tube", price: 16.75 }],
  },
  {
    id: "nutty-bites",
    name: "Nutty Bites",
    category: "Bites",
    description: "54% dark chocolate with cashews, pecans and almonds",
    contains: "Soy, Milk & Nuts",
    image: nuttyBites.url,
    options: [{ id: "tube", label: "Tube", price: 16.75 }],
  },
  {
    id: "spicy-nut-mix",
    name: "Spicy Nut Mix",
    category: "Mixes",
    contains: "Nuts",
    image: spicyNutMix.url,
    options: miniFull(),
  },
  {
    id: "milk-chocolate-maple-bourbon-pecans",
    name: "Milk Chocolate Maple Bourbon Pecans",
    category: "Mixes",
    contains: "Milk & Nuts",
    image: mapleBourbonPecans.url,
    options: miniFull(),
  },
  {
    id: "dark-chocolate-covered-almonds",
    name: "Dark Chocolate Covered Almonds",
    category: "Mixes",
    contains: "Nuts",
    image: darkAlmonds.url,
    options: miniFull(),
  },
  {
    id: "milk-chocolate-almond-toffee",
    name: "Milk Chocolate Almond Toffee",
    category: "Mixes",
    contains: "Soy, Milk & Nuts",
    image: milkAlmondToffee.url,
    options: miniFull(),
  },
  {
    id: "espresso-mix",
    name: "Espresso Mix",
    category: "Mixes",
    contains: "Soy & Milk",
    image: espressoMix.url,
    options: miniFull(),
  },
  {
    id: "cinnamon-almond-toffee",
    name: "Cinnamon Almond Toffee",
    category: "Mixes",
    contains: "Milk & Nuts",
    seasonal: true,
    image: cinnamonAlmondToffee.url,
    options: miniFull(),
  },
  {
    id: "peppermint-pretzels",
    name: "Peppermint Pretzels",
    category: "Confections",
    contains: "Soy, Milk & Wheat",
    seasonal: true,
    image: peppermintPretzels.url,
    options: [{ id: "full", label: "Full", price: 18.75 }],
  },
  {
    id: "lemon-shortbread",
    name: "Lemon Shortbread",
    category: "Confections",
    contains: "Milk, Eggs & Wheat",
    seasonal: true,
    image: lemonShortbread.url,
    options: miniFull(),
  },
  {
    id: "mint-chocolate-cookie-crunch",
    name: "Mint Chocolate Cookie Crunch",
    category: "Confections",
    contains: "Milk & Wheat",
    seasonal: true,
    image: mintCookieCrunch.url,
    options: miniFull(),
  },
  {
    id: "english-toffee",
    name: "English Toffee",
    category: "Confections",
    contains: "Milk, Soy & Nuts",
    seasonal: true,
    image: englishToffee.url,
    options: [{ id: "gift-box", label: "Gift box", price: 42 }],
  },
  {
    id: "holiday-peppermint-bark",
    name: "Holiday Peppermint Bark",
    category: "Confections",
    contains: "Milk & Soy",
    seasonal: true,
    image: holidayPeppermintBark.url,
    options: [{ id: "gift-box", label: "Gift box", price: 42 }],
  },
];