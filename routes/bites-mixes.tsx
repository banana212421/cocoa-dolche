import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eraser, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { BackToCategories } from "@/components/BackToCategories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { bitesMixProducts } from "@/data/bitesMixes";
import { useCart } from "@/context/CartContext";

export const Route = createFileRoute("/bites-mixes")({
  head: () => ({
    meta: [
      { title: "Bites + Mixes — Cocoa Dolce" },
      {
        name: "description",
        content:
          "Shop Cocoa Dolce bites, chocolate-covered mixes, seasonal confections, and gift boxes with live order pricing.",
      },
      { property: "og:title", content: "Bites + Mixes — Cocoa Dolce" },
      {
        property: "og:description",
        content: "Choose Cocoa Dolce bites, mixes, and seasonal confections for your order.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BitesMixesPage,
});

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const quantityKey = (productId: string, optionId: string) => `${productId}:${optionId}`;

function BitesMixesPage() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [orderMultiplier, setOrderMultiplier] = useState(1);
  const [activeCategory, setActiveCategory] = useState("All");
  const { addItem } = useCart();
  const navigate = useNavigate();

  const categories = ["All", "Bites", "Mixes", "Confections"];
  const visibleProducts = useMemo(
    () =>
      activeCategory === "All"
        ? bitesMixProducts
        : bitesMixProducts.filter((product) => product.category === activeCategory),
    [activeCategory],
  );

  const lines = useMemo(
    () =>
      bitesMixProducts.flatMap((product) =>
        product.options.flatMap((option) => {
          const quantity = quantities[quantityKey(product.id, option.id)] ?? 0;
          return quantity > 0 ? [{ product, option, quantity }] : [];
        }),
      ),
    [quantities],
  );

  const itemsPerSet = lines.reduce((total, line) => total + line.quantity, 0);
  const subtotal = lines.reduce(
    (total, line) => total + line.quantity * line.option.price,
    0,
  );
  const totalItems = itemsPerSet * orderMultiplier;
  const totalCost = subtotal * orderMultiplier;

  function setQuantity(productId: string, optionId: string, value: number) {
    setQuantities((current) => ({
      ...current,
      [quantityKey(productId, optionId)]: Math.max(0, Math.floor(value) || 0),
    }));
  }

  function adjustQuantity(productId: string, optionId: string, delta: number) {
    const key = quantityKey(productId, optionId);
    setQuantity(productId, optionId, (quantities[key] ?? 0) + delta);
  }

  function addBundleToCart() {
    if (itemsPerSet === 0) return;
    const firstImage = lines[0]?.product.image;
    addItem({
      title: "Bites + Mixes Bundle",
      subtitle: `${itemsPerSet.toLocaleString()} items per bundle`,
      category: "Bites + Mixes",
      unitLabel: "bundle",
      unitPrice: subtotal,
      quantity: orderMultiplier,
      lines: lines.map(({ product, option, quantity }) => ({
        label: `${product.name} · ${option.label}`,
        qty: quantity,
      })),
      ...(firstImage ? { image: firstImage } : {}),
    });
    toast.success("Bundle added to your cart.");
    void navigate({ to: "/cart" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
          <BackToCategories />
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h1 className="text-3xl font-semibold">Cocoa Dolce</h1>
              <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
                Bites + Mixes
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {totalItems.toLocaleString()} items &middot; {currency.format(totalCost)}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)_320px]">
        <aside className="self-start rounded-lg border border-border bg-card p-4 lg:sticky lg:top-4">
          <h2 className="text-xl font-semibold">Collection</h2>
          <p className="mb-3 text-xs text-muted-foreground">Filter the product list.</p>
          <div className="space-y-1.5">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "secondary" : "ghost"}
                className="w-full justify-between"
                onClick={() => setActiveCategory(category)}
              >
                {category}
                <Badge variant="secondary">
                  {category === "All"
                    ? bitesMixProducts.length
                    : bitesMixProducts.filter((product) => product.category === category).length}
                </Badge>
              </Button>
            ))}
          </div>
        </aside>

        <section>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <article
                key={product.id}
                className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{product.category}</Badge>
                      {product.seasonal && <Badge variant="secondary">Seasonal</Badge>}
                    </div>
                    <h2 className="text-lg font-semibold leading-tight">{product.name}</h2>
                    {product.description && (
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {product.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Contains: {product.contains}
                    </p>
                  </div>

                  <div className="mt-auto space-y-2">
                    {product.options.map((option) => {
                      const quantity = quantities[quantityKey(product.id, option.id)] ?? 0;
                      return (
                        <div key={option.id} className="flex items-center gap-2">
                          <span className="min-w-0 flex-1 text-xs">
                            {option.label}{" "}
                            <span className="text-muted-foreground">
                              {currency.format(option.price)}
                            </span>
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => adjustQuantity(product.id, option.id, -1)}
                            aria-label={`Remove one ${option.label} ${product.name}`}
                          >
                            <Minus />
                          </Button>
                          <Input
                            className="no-spinner h-8 w-14 text-center"
                            type="number"
                            min={0}
                            value={quantity}
                            aria-label={`${option.label} ${product.name} quantity`}
                            onChange={(event) =>
                              setQuantity(product.id, option.id, Number(event.target.value))
                            }
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => adjustQuantity(product.id, option.id, 1)}
                            aria-label={`Add one ${option.label} ${product.name}`}
                          >
                            <Plus />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 flex justify-center">
            <Button variant="outline" onClick={() => setQuantities({})}>
              <Eraser /> Clear selection
            </Button>
          </div>
        </section>

        <aside className="self-start rounded-lg border border-border bg-card p-4 lg:sticky lg:top-4">
          <h2 className="text-xl font-semibold">Order Details</h2>

          <div className="mt-5 space-y-2">
            <Label htmlFor="bundles">Number of bundles</Label>
            <Input
              id="bundles"
              type="number"
              min={1}
              value={orderMultiplier}
              onChange={(event) =>
                setOrderMultiplier(Math.max(1, Math.floor(Number(event.target.value)) || 1))
              }
            />
            <p className="text-xs text-muted-foreground">
              {totalItems.toLocaleString()} total items in this order.
            </p>
          </div>

          <Separator className="my-5" />

          <div className="space-y-3">
            {lines.map(({ product, option, quantity }) => (
              <div key={`${product.id}-${option.id}`} className="flex gap-3 text-sm">
                <span className="min-w-0 flex-1">
                  {product.name}
                  <span className="block text-xs text-muted-foreground">{option.label}</span>
                </span>
                <span className="shrink-0 text-right text-muted-foreground">
                  {quantity} / bundle
                  <span className="block text-xs">
                    {currency.format(quantity * option.price * orderMultiplier)}
                  </span>
                </span>
              </div>
            ))}
            {lines.length === 0 && (
              <p className="text-sm text-muted-foreground">No products selected yet.</p>
            )}
          </div>

          <Separator className="my-5" />

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Bundle subtotal ({itemsPerSet} items)</span>
              <span>{currency.format(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Bundles</span>
              <span>&times; {orderMultiplier.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{currency.format(totalCost)}</span>
            </div>
          </div>

          <Button
            size="lg"
            className="mt-5 w-full"
            disabled={itemsPerSet === 0}
            onClick={addBundleToCart}
          >
            Add to cart
          </Button>
        </aside>
      </main>
    </div>
  );
}