import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eraser, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { BackToCategories } from "@/components/BackToCategories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { preBuiltProducts } from "@/data/preBuiltBundles";
import { useCart } from "@/context/CartContext";

export const Route = createFileRoute("/pre-built-bundles")({
  head: () => ({
    meta: [
      { title: "Pre-Built Bundles + Gift Sets — Cocoa Dolce" },
      { name: "description", content: "Shop chef-curated Cocoa Dolce chocolate boxes, bundles, and ready-to-ship gift sets." },
      { property: "og:title", content: "Pre-Built Bundles + Gift Sets — Cocoa Dolce" },
      { property: "og:description", content: "Chef-curated, ready-to-ship Cocoa Dolce bundles and chocolate boxes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PreBuiltBundlesPage,
});

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const filters = ["All", "Bites + Mixes", "Chocolate Boxes", "Gift Sets", "Seasonal"] as const;

const matchesFilter = (filter: (typeof filters)[number], item: (typeof preBuiltProducts)[number]) =>
  filter === "All" || (filter === "Seasonal" ? item.seasonal === true : item.category === filter);

function PreBuiltBundlesPage() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addItem } = useCart();
  const navigate = useNavigate();

  const visibleProducts = useMemo(
    () => preBuiltProducts.filter((item) => matchesFilter(activeFilter, item)),
    [activeFilter],
  );
  const selectedProducts = useMemo(
    () => preBuiltProducts.flatMap((item) => {
      const quantity = quantities[item.id] ?? 0;
      return quantity > 0 ? [{ item, quantity }] : [];
    }),
    [quantities],
  );
  const totalItems = selectedProducts.reduce((sum, line) => sum + line.quantity, 0);
  const total = selectedProducts.reduce((sum, line) => sum + line.quantity * line.item.price, 0);

  function setQuantity(id: string, value: number) {
    setQuantities((current) => ({ ...current, [id]: Math.max(0, Math.floor(value) || 0) }));
  }

  function addBundleToCart() {
    if (totalItems === 0) return;
    for (const { item, quantity } of selectedProducts) {
      addItem({
        title: item.name,
        subtitle: item.collection,
        category: "Pre-Built Bundles + Gift Sets",
        unitLabel: "item",
        unitPrice: item.price,
        quantity,
        lines: [],
        image: item.image,
      });
    }
    toast.success("Items added to your cart.");
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
              <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">Pre-Built Bundles + Gift Sets</p>
            </div>
            <p className="text-sm text-muted-foreground">{totalItems.toLocaleString()} items &middot; {currency.format(total)}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)_320px]">
        <aside className="self-start rounded-lg border border-border bg-card p-4 lg:sticky lg:top-4">
          <h2 className="text-xl font-semibold">Collection</h2>
          <p className="mb-3 text-xs text-muted-foreground">Filter the catalog by product type.</p>
          <div className="space-y-1.5">
            {filters.map((filter) => (
              <Button key={filter} variant={activeFilter === filter ? "secondary" : "ghost"} className="w-full justify-between" onClick={() => setActiveFilter(filter)}>
                {filter}
                <Badge variant="secondary">{preBuiltProducts.filter((item) => matchesFilter(filter, item)).length}</Badge>
              </Button>
            ))}
          </div>
          <Separator className="my-4" />
          <p className="text-xs leading-relaxed text-muted-foreground">Seasonal products are offered while supplies last.</p>
        </aside>

        <section>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((item) => {
              const quantity = quantities[item.id] ?? 0;
              return (
                <article key={item.id} className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img src={item.image} alt={`${item.name} ${item.collection}`} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                      <div className="mb-1 flex flex-wrap gap-2"><Badge variant="outline">{item.collection}</Badge>{item.seasonal && <Badge variant="secondary">Seasonal</Badge>}</div>
                      <h2 className="text-lg font-semibold leading-tight">{item.name}</h2>
                      <p className="mt-1 text-sm font-medium">{currency.format(item.price)}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                      {item.contains && <p className="mt-1 text-xs text-muted-foreground">Contains: {item.contains}</p>}
                      {item.note && <p className="mt-1 text-xs italic text-muted-foreground">{item.note}</p>}
                    </div>
                    <div className="mt-auto flex items-center justify-end gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(item.id, quantity - 1)} aria-label={`Remove one ${item.name}`}><Minus /></Button>
                      <Input className="no-spinner h-8 w-14 text-center" type="number" min={0} value={quantity} aria-label={`${item.name} quantity`} onChange={(event) => setQuantity(item.id, Number(event.target.value))} />
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQuantity(item.id, quantity + 1)} aria-label={`Add one ${item.name}`}><Plus /></Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="mt-5 flex justify-center"><Button variant="outline" onClick={() => setQuantities({})}><Eraser /> Clear selection</Button></div>
        </section>

        <aside className="self-start rounded-lg border border-border bg-card p-4 lg:sticky lg:top-4">
          <h2 className="text-xl font-semibold">Order Details</h2>
          <div className="mt-5 space-y-3">
            {selectedProducts.map(({ item, quantity }) => (
              <div key={item.id} className="flex gap-3 text-sm">
                <span className="min-w-0 flex-1">{item.name}<span className="block text-xs text-muted-foreground">{item.collection}</span></span>
                <span className="shrink-0 text-right text-muted-foreground">{quantity}<span className="block text-xs">{currency.format(quantity * item.price)}</span></span>
              </div>
            ))}
            {selectedProducts.length === 0 && <p className="text-sm text-muted-foreground">No products selected yet.</p>}
          </div>
          <Separator className="my-5" />
          <div className="space-y-1.5">
            <div className="flex justify-between text-lg font-semibold"><span>Total ({totalItems.toLocaleString()} items)</span><span>{currency.format(total)}</span></div>
          </div>
          <Button size="lg" className="mt-5 w-full" disabled={totalItems === 0} onClick={addBundleToCart}>Add to cart</Button>
        </aside>
      </main>
    </div>
  );
}