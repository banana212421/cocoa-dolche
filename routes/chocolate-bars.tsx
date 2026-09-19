import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Eraser, Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BackToCategories } from "@/components/BackToCategories";
import { useCart } from "@/context/CartContext";
import { barSizes, chocolateBars, type BarSizeId } from "@/data/chocolateBars";

export const Route = createFileRoute("/chocolate-bars")({
  head: () => ({
    meta: [
      { title: "Chocolate Bars — Cocoa Dolce" },
      {
        name: "description",
        content:
          "Choose from ten Cocoa Dolce chocolate bar flavors in mini or full size, set your quantities, and see your order total instantly.",
      },
      { property: "og:title", content: "Chocolate Bars — Cocoa Dolce" },
      {
        property: "og:description",
        content:
          "Mini and full size Cocoa Dolce chocolate bars with live order pricing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BarBuilder,
});

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const key = (barId: string, size: BarSizeId) => `${barId}:${size}`;

function BarBuilder() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [caseMultiplier, setCaseMultiplier] = useState(1);
  const [activeBase, setActiveBase] = useState<string>("All");
  const { addItem } = useCart();
  const navigate = useNavigate();

  const bases = useMemo(
    () => ["All", ...Array.from(new Set(chocolateBars.map((b) => b.base)))],
    [],
  );

  const visibleBars = useMemo(
    () =>
      activeBase === "All"
        ? chocolateBars
        : chocolateBars.filter((b) => b.base === activeBase),
    [activeBase],
  );

  const barById = useMemo(
    () => new Map(chocolateBars.map((b) => [b.id, b])),
    [],
  );

  const lines = useMemo(() => {
    const result: {
      barId: string;
      size: BarSizeId;
      label: string;
      qty: number;
      price: number;
    }[] = [];
    chocolateBars.forEach((bar) => {
      barSizes.forEach((size) => {
        const qty = quantities[key(bar.id, size.id)] ?? 0;
        if (qty > 0) {
          result.push({
            barId: bar.id,
            size: size.id,
            label: size.label,
            qty,
            price: size.price,
          });
        }
      });
    });
    return result;
  }, [quantities]);

  const barsPerSet = lines.reduce((sum, l) => sum + l.qty, 0);
  const setSubtotal = lines.reduce((sum, l) => sum + l.qty * l.price, 0);
  const totalBars = barsPerSet * caseMultiplier;
  const totalCost = setSubtotal * caseMultiplier;

  function adjust(barId: string, size: BarSizeId, delta: number) {
    setQuantities((prev) => {
      const k = key(barId, size);
      const next = Math.max(0, (prev[k] ?? 0) + delta);
      return { ...prev, [k]: next };
    });
  }

  function setQty(barId: string, size: BarSizeId, value: number) {
    setQuantities((prev) => ({
      ...prev,
      [key(barId, size)]: Math.max(0, Math.floor(value) || 0),
    }));
  }

  function clearAll() {
    setQuantities({});
  }

  function addBundleToCart() {
    if (barsPerSet === 0) return;
    const firstBar = lines[0] ? barById.get(lines[0].barId) : undefined;
    addItem({
      title: "Chocolate Bar Bundle",
      subtitle: `${barsPerSet.toLocaleString()} bars per bundle`,
      category: "Chocolate Bars",
      unitLabel: "bundle",
      unitPrice: setSubtotal,
      quantity: caseMultiplier,
      lines: lines.map((line) => ({
        label: `${barById.get(line.barId)?.name ?? "Unknown flavor"} · ${line.label}`,
        qty: line.qty,
      })),
      productDetails: {
        kind: "chocolate-bars",
        miniPerBundle: lines.filter((line) => line.size === "mini").reduce((sum, line) => sum + line.qty, 0),
        fullPerBundle: lines.filter((line) => line.size === "full").reduce((sum, line) => sum + line.qty, 0),
        tastingPerBundle: 0,
      },
      ...(firstBar?.image ? { image: firstBar.image } : {}),
    });
    toast.success("Bundle added to your cart.");
    void navigate({ to: "/cart" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-[1600px] px-6 py-5">
          <BackToCategories />
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h1 className="text-3xl font-semibold">Cocoa Dolce</h1>
              <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
                Chocolate Bar Selection
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {barsPerSet.toLocaleString()} bars per bundle &middot;{" "}
              {caseMultiplier.toLocaleString()} bundles &middot; {currency.format(totalCost)}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-6 px-6 py-8 lg:grid-cols-[240px_1fr_320px]">
        {/* Filters */}
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-xl font-semibold">Chocolate Type</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Filter the flavor list by chocolate base.
          </p>
          <div className="space-y-1.5">
            {bases.map((base) => (
              <button
                key={base}
                onClick={() => setActiveBase(base)}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                  activeBase === base
                    ? "border-accent bg-secondary"
                    : "border-border hover:bg-secondary/60"
                }`}
              >
                <span>{base}</span>
                <Badge variant="secondary">
                  {base === "All"
                    ? chocolateBars.length
                    : chocolateBars.filter((b) => b.base === base).length}
                </Badge>
              </button>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1 text-xs text-muted-foreground">
            {barSizes.map((size) => (
              <div key={size.id} className="flex justify-between">
                <span>{size.label}</span>
                <span>{currency.format(size.price)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bar grid */}
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleBars.map((bar) => (
              <article
                key={bar.id}
                className="flex flex-col overflow-hidden rounded-lg border border-border bg-card"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={bar.image}
                    alt={`${bar.name} chocolate bar packaging`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h3 className="text-sm font-semibold tracking-wide uppercase">
                      {bar.name}
                      {bar.seasonal && "*"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Contains: {bar.contains}
                      {bar.seasonal && " · Seasonal"}
                    </p>
                  </div>

                  <div className="mt-auto space-y-2">
                    {barSizes.map((size) => {
                      const qty = quantities[key(bar.id, size.id)] ?? 0;
                      return (
                        <div key={size.id} className="flex items-center gap-2">
                          <span className="flex-1 text-xs">
                            {size.label}
                            <span className="text-muted-foreground">
                              {" "}
                              {currency.format(size.price)}
                            </span>
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => adjust(bar.id, size.id, -1)}
                            aria-label={`Remove one ${size.label} ${bar.name}`}
                          >
                            <Minus />
                          </Button>
                          <Input
                            className="no-spinner h-8 w-14 text-center"
                            type="number"
                            min={0}
                            value={qty}
                            aria-label={`${size.label} ${bar.name} quantity`}
                            onChange={(e) => setQty(bar.id, size.id, Number(e.target.value))}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => adjust(bar.id, size.id, 1)}
                            aria-label={`Add one ${size.label} ${bar.name}`}
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

          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={clearAll}>
              <Eraser /> Clear selection
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            * Seasonal flavor — availability varies by time of year.
          </p>
        </section>

        {/* Order details */}
        <section className="space-y-5 rounded-lg border border-border bg-card p-4">
          <h2 className="text-xl font-semibold">Order Details</h2>

          <div className="space-y-2">
            <Label htmlFor="bundles">Number of bundles</Label>
            <Input
              id="bundles"
              type="number"
              min={1}
              value={caseMultiplier}
              onChange={(e) => setCaseMultiplier(Math.max(1, Number(e.target.value) || 1))}
            />
            <p className="text-xs text-muted-foreground">
              {totalBars.toLocaleString()} total bars in this run.
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            {lines.map((line) => (
              <div key={`${line.barId}-${line.size}`} className="flex justify-between text-sm">
                <span>
                  {barById.get(line.barId)?.name ?? "Unknown flavor"}
                  <span className="text-muted-foreground"> · {line.label}</span>
                </span>
                <span className="text-muted-foreground">
                  {line.qty} / bundle &middot; {(line.qty * caseMultiplier).toLocaleString()}
                </span>
              </div>
            ))}
            {lines.length === 0 && (
              <p className="text-sm text-muted-foreground">No bars selected yet.</p>
            )}
          </div>

          <Separator />

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Bundle subtotal ({barsPerSet.toLocaleString()} bars)</span>
              <span>{currency.format(setSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Bundles</span>
              <span>&times; {caseMultiplier.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{currency.format(totalCost)}</span>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={barsPerSet === 0}
            onClick={addBundleToCart}
          >
            Add to cart
          </Button>
        </section>
      </main>
    </div>
  );
}
