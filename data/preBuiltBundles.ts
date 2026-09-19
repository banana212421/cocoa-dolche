type AssetPointer = { url: string };

const assetPointers = import.meta.glob<AssetPointer>(
  "../assets/pre-built-bundles/*.jpg.asset.json",
  { eager: true, import: "default" },
);

const image = (slug: string) =>
  assetPointers[`../assets/pre-built-bundles/${slug}.jpg.asset.json`]?.url ?? "";

export type PreBuiltProduct = {
  id: string;
  name: string;
  category: "Bites + Mixes" | "Chocolate Boxes" | "Gift Sets";
  collection: string;
  price: number;
  description: string;
  contains?: string;
  seasonal?: boolean;
  note?: string;
  image: string;
};

const product = (
  id: string,
  name: string,
  category: PreBuiltProduct["category"],
  collection: string,
  price: number,
  description: string,
  contains?: string,
  seasonal?: boolean,
  note?: string,
): PreBuiltProduct => ({
  id,
  name,
  category,
  collection,
  price,
  description,
  image: image(id),
  ...(contains ? { contains } : {}),
  ...(seasonal ? { seasonal } : {}),
  ...(note ? { note } : {}),
});

export const preBuiltProducts: PreBuiltProduct[] = [
  product("classic-mix-collection", "Classic Mix Collection", "Bites + Mixes", "Mix Collections", 42, "Four classic chocolate and nut mixes", "Milk, Soy & Nuts", true, "Available in 2027"),
  product("holiday-mix-collection", "Holiday Mix Collection", "Bites + Mixes", "Mix Collections", 42, "Four festive chocolate and nut mixes", "Milk, Wheat & Nuts", true),
  product("6-classic-collection", "Classic Collection", "Chocolate Boxes", "6-Piece", 26.5, "All-time customer favorite", "Milk, Soy, Nuts, Wheat & Alcohol"),
  product("6-cheers-collection", "Cheers Collection", "Chocolate Boxes", "6-Piece", 26.5, "Six cocktail-inspired flavors", "Milk, Soy, Wheat & Alcohol"),
  product("6-grey-salt-caramel", "Grey Salt Caramel", "Chocolate Boxes", "6-Piece", 26.5, "Buttery brown sugar and vanilla bean caramel", "Milk & Soy"),
  product("6-desserts", "Desserts", "Chocolate Boxes", "6-Piece", 26.5, "Classic desserts in bite size", "Soy, Milk, Eggs, Nuts, Wheat & Alcohol", true),
  product("6-summer-vibes", "Summer Vibes", "Chocolate Boxes", "6-Piece", 26.5, "Tropical, fruity and refreshing", "Soy, Milk, Eggs, Wheat & Alcohol", true),
  product("6-white-wine-pairing", "White Wine Pairing Collection", "Chocolate Boxes", "6-Piece", 27.5, "Includes tasting guide", "Milk, Soy, Wheat & Alcohol"),
  product("6-red-wine-pairing", "Red Wine Pairing Collection", "Chocolate Boxes", "6-Piece", 27.5, "Includes tasting guide", "Soy, Eggs, Nuts, Wheat & Alcohol"),
  product("6-bubbles-pairing", "Bubbles Pairing Collection", "Chocolate Boxes", "6-Piece", 27.5, "Includes tasting guide", "Soy, Eggs, Nuts, Milk, Wheat & Alcohol"),
  product("6-whiskey-pairing", "Whiskey Pairing Collection", "Chocolate Boxes", "6-Piece", 27.5, "Includes tasting guide", "Soy, Eggs, Nuts, Milk, Wheat & Alcohol"),
  product("10-signature-selection", "Signature Selection", "Chocolate Boxes", "10-Piece", 40, "Bestseller", "Soy, Milk, Nuts, Eggs, Wheat & Alcohol"),
  product("10-caramel-collection", "Caramel Collection", "Chocolate Boxes", "10-Piece", 40, "Ensemble of fine chocolate and caramel", "Milk, Soy, Nuts, Wheat & Alcohol"),
  product("10-fall-flavors", "Fall Flavors", "Chocolate Boxes", "10-Piece", 40, "A collection that will give you a cardigan vibe", "Soy, Milk, Eggs, Nuts, Wheat & Alcohol", true),
  product("10-date-night", "Date Night", "Chocolate Boxes", "10-Piece", 40, "The Valentine Collection", "Soy, Milk, Eggs, Wheat & Alcohol", true),
  product("10-holly-jolly", "Holly Jolly", "Chocolate Boxes", "10-Piece", 40, "Holiday cheer in every bite", "Soy, Milk, Eggs, Nuts, Wheat & Alcohol", true),
  product("16-cocoa-lovers", "Cocoa Lovers", "Chocolate Boxes", "16-Piece", 57.5, "Our bestselling collection", "Soy, Milk, Nuts, Eggs, Wheat & Alcohol"),
  product("16-mothers-day", "Mother's Day Collection", "Chocolate Boxes", "16-Piece", 57.5, "Flavors she'll love", "Soy, Milk, Nuts, Eggs, Wheat & Alcohol", true),
  product("16-spring-fling", "Spring Fling", "Chocolate Boxes", "16-Piece", 57.5, "Refreshing spring flavors", "Soy, Milk, Eggs, Nuts, Wheat & Alcohol", true),
  product("30-cocoa-royale", "Cocoa Royale", "Chocolate Boxes", "30-Piece", 95, "Bestseller", "Soy, Milk, Nuts, Eggs, Wheat & Alcohol"),
  product("30-sweetheart", "Sweetheart Collection", "Chocolate Boxes", "30-Piece", 95, "Flavors they'll love", "Soy, Milk, Eggs, Nuts, Wheat & Alcohol", true),
  product("30-holiday", "Holiday Collection", "Chocolate Boxes", "30-Piece", 95, "Christmas in a box", "Soy, Milk, Eggs, Nuts & Alcohol", true),
  product("50-magnum-opus", "Magnum Opus", "Chocolate Boxes", "50-Piece", 135, "Flavor variety", "Soy, Milk, Nuts, Eggs, Wheat & Alcohol"),
  product("indulgence-build", "Build A Gift Set", "Gift Sets", "Indulgence", 175, "Create your own Indulgence Gift Set"),
  product("indulgence-signature", "Signature", "Gift Sets", "Indulgence", 175, "Best-selling products", "Soy, Milk, Nuts, Eggs & Wheat"),
  product("indulgence-holiday", "Holiday", "Gift Sets", "Indulgence", 170, "A gift that will bring tidings of comfort and joy", "Soy, Milk, Nuts, Eggs & Wheat", true),
  product("indulgence-valentines", "Valentine's", "Gift Sets", "Indulgence", 170, "Flavors with a romantic twist", "Soy, Milk, Eggs, Nuts, Wheat & Alcohol", true),
  product("luxe-build", "Build A Gift Set", "Gift Sets", "Luxe", 280, "Create your own Luxe Gift Set"),
  product("luxe-signature", "Signature", "Gift Sets", "Luxe", 280, "Best-selling products", "Soy, Milk, Nuts, Eggs & Wheat"),
  product("bliss-build", "Build A Gift Set", "Gift Sets", "Bliss", 115, "Create your own Bliss Gift Set"),
  product("bliss-signature", "Signature", "Gift Sets", "Bliss", 115, "Best-selling products", "Soy, Milk, Nuts, Eggs & Wheat"),
  product("bliss-coffee-chocolate", "Coffee & Chocolate", "Gift Sets", "Bliss", 120, "Coffee-inspired products", "Soy, Milk, Eggs, Nuts & Wheat"),
  product("bliss-easter", "Easter", "Gift Sets", "Bliss", 120, "Limited edition spring gifts", "Soy, Milk, Eggs, Nuts & Wheat", true),
  product("bliss-mothers-day", "Mother's Day", "Gift Sets", "Bliss", 115, "Limited edition Mother's Day set", "Soy, Milk, Eggs, Nuts & Wheat", true),
  product("splendor-build", "Build A Gift Set", "Gift Sets", "Splendor", 90, "Create your own Splendor Gift Set"),
  product("splendor-signature", "Signature Selection", "Gift Sets", "Splendor", 90, "Best-selling products", "Soy, Milk, Nuts, Eggs & Wheat"),
  product("splendor-nutty-chocolate", "Nutty & Chocolate", "Gift Sets", "Splendor", 90, "Indulge in chocolate, with a nutty twist", "Soy, Milk, Nuts, Eggs & Wheat"),
  product("splendor-holiday", "Holiday", "Gift Sets", "Splendor", 90, "Flavors to make the season bright", "Soy, Milk, Eggs, Nuts & Wheat", true),
  product("splendor-valentines", "Valentine's", "Gift Sets", "Splendor", 90, "Flavors with a romantic twist", "Soy, Milk, Eggs, Nuts, Wheat & Alcohol", true),
  product("delight-signature", "Signature", "Gift Sets", "Delight", 60, "Best-selling products", "Soy, Milk, Nuts & Wheat"),
  product("delight-coffee-chocolate", "Coffee & Chocolate", "Gift Sets", "Delight", 60, "Coffee-inspired products that pair well with coffee or by themselves", "Soy, Milk, Nuts & Wheat"),
  product("delight-nutty-chocolate", "Nutty & Chocolate", "Gift Sets", "Delight", 60, "Decadent chocolate with a nutty twist", "Soy, Milk, Eggs, Nuts & Wheat", true),
  product("delight-easter-basket", "Easter Basket", "Gift Sets", "Delight", 60, "Limited edition spring gifts. Includes gift basket", "Soy, Milk, Eggs & Wheat", true),
  product("delight-mothers-day", "Mother's Day", "Gift Sets", "Delight", 60, "Limited edition Mother's Day set", "Soy, Milk, Eggs & Wheat", true),
];