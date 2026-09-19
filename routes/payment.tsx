import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef } from "react";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Download, ImageDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BackToCategories } from "@/components/BackToCategories";
import { useCart } from "@/context/CartContext";
import { availableChocolates, boxOptions } from "@/data/chocolates";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Payment — Cocoa Dolce" },
      {
        name: "description",
        content: "Review your Cocoa Dolce order and download the production spec.",
      },
      { property: "og:title", content: "Payment — Cocoa Dolce" },
      {
        property: "og:description",
        content: "Review your Cocoa Dolce order and download the production spec.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaymentPage,
});

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function PaymentPage() {
  const { items, itemCount, total, tailored } = useCart();
  const grandTotal = total + tailored.total;
  const layoutRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const customBoxes = items.filter(
    (item) => item.category === "Custom Chocolate Boxes" && item.productDetails?.kind === "custom-box",
  );
  const chocolateById = useMemo(
    () => new Map(availableChocolates.map((chocolate) => [chocolate.id, chocolate])),
    [],
  );

  async function downloadVisualLayout(itemId: string, title: string) {
    const layout = layoutRefs.current[itemId];
    if (!layout) {
      toast.error("This box does not have a saved visual layout.");
      return;
    }

    try {
      await document.fonts.ready;
      const { default: html2canvas } = await import("html2canvas-pro");
      const canvas = await html2canvas(layout, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      link.download = `${filename || "custom-box"}-visual-layout.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Visual box layout downloaded.");
    } catch {
      toast.error("The visual layout could not be downloaded. Please try again.");
    }
  }

  function downloadSpec() {
    const boxItems = items.filter(
      (item) => item.category === "Custom Chocolate Boxes",
    );
    if (boxItems.length === 0) {
      toast.error("There are no custom chocolate boxes in this order.");
      return;
    }
    const boxCount = boxItems.reduce((sum, item) => sum + item.quantity, 0);
    const boxTotal = boxItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity + (item.oneTimeFee ?? 0),
      0,
    );
    const spec = {
      generatedAt: new Date().toISOString(),
      boxCount,
      boxesTotal: boxTotal,
      items: boxItems.map((item) => ({
        title: item.title,
        subtitle: item.subtitle,
        category: item.category,
        unitLabel: item.unitLabel,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.unitPrice * item.quantity + (item.oneTimeFee ?? 0),
        companyLogoIncluded: Boolean(item.image),
        logoChocolateSetup: item.productDetails?.kind === "custom-box" ? item.productDetails.logoSetup : undefined,
        contents: item.lines,
      })),
    };
    const blob = new Blob([JSON.stringify(spec, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cocoa-dolce-production-spec.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Production spec downloaded.");
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
                Payment
              </p>
            </div>
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/cart" className="hover:text-foreground">
                Cart
              </Link>
              <span>&gt;</span>
              <Link to="/order-details" className="hover:text-foreground">
                Order Details
              </Link>
              <span>&gt;</span>
              <span className="font-semibold text-foreground">Payment</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-6 px-6 py-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5 rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Payment</h2>
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-6 py-12 text-center">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">Payment coming soon</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Secure checkout is not connected yet. In the meantime you can
              download the production spec for this order to share with our
              gifting team.
            </p>
            <Button
              variant="outline"
              disabled={items.length === 0}
              onClick={downloadSpec}
            >
              <Download /> Download production spec
            </Button>
          </div>

          {customBoxes.length > 0 && (
            <div className="space-y-4 border-t border-border pt-5">
              <div>
                <h2 className="text-xl font-semibold">Custom Box Visual Layouts</h2>
                <p className="text-sm text-muted-foreground">
                  Download a visual layout for each custom chocolate box in this order.
                </p>
              </div>
              <div className="grid gap-5 xl:grid-cols-2">
                {customBoxes.map((item) => {
                  const details = item.productDetails?.kind === "custom-box" ? item.productDetails : undefined;
                  const option = boxOptions.find((candidate) => candidate.size === details?.boxSize);
                  const layout = details?.layout;

                  return (
                    <article key={item.id} className="space-y-3 rounded-md border border-border p-3">
                      <div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          Quantity: {item.quantity.toLocaleString()} {item.unitLabel}{item.quantity === 1 ? "" : "s"}
                        </p>
                      </div>
                      {option && layout ? (
                        <>
                          <div
                            ref={(element) => {
                              layoutRefs.current[item.id] = element;
                            }}
                            className="bg-secondary p-5"
                          >
                            {item.image && (
                              <div className="mb-4 flex justify-center">
                                <img src={item.image} alt="Company logo" className="max-h-12 max-w-44 object-contain" />
                              </div>
                            )}
                            <div
                              className="grid gap-2"
                              style={{ gridTemplateColumns: `repeat(${option.cols}, minmax(0, 1fr))` }}
                            >
                              {layout.map((chocolateId, index) => {
                                const chocolate = chocolateId ? chocolateById.get(chocolateId) : undefined;
                                return (
                                  <div
                                    key={`${item.id}-${index}`}
                                    className="relative flex aspect-square items-center justify-center overflow-hidden rounded-sm border border-border bg-card"
                                  >
                                    {chocolate?.isLogo ? (
                                      item.image ? (
                                        <img src={item.image} alt="" className="h-full w-full object-contain p-1" />
                                      ) : (
                                        <span className="p-1 text-center text-[8px] leading-tight text-muted-foreground">Your Logo Here</span>
                                      )
                                    ) : chocolate?.image ? (
                                      <img src={chocolate.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                                    ) : (
                                      <span className="text-xs text-muted-foreground">{index + 1}</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <p className="mt-4 text-center text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                              Cocoa Dolce · {option.size} Piece Collection
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => void downloadVisualLayout(item.id, item.title)}
                          >
                            <ImageDown /> Download visual layout
                          </Button>
                        </>
                      ) : (
                        <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                          No visual layout was saved for this box. Re-add it from the Custom Chocolate Box builder to create one.
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4 self-start rounded-lg border border-border bg-card p-4 lg:sticky lg:top-6">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-sm border border-border object-cover"
                      />
                    ) : (
                      <span className="h-10 w-10 shrink-0 rounded-sm border border-border bg-muted" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} {item.unitLabel}
                        {item.quantity > 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="text-sm">
                      {currency.format(item.unitPrice * item.quantity + (item.oneTimeFee ?? 0))}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              {tailored.charges.length > 0 && (
                <div className="space-y-1.5 text-sm">
                  {tailored.charges.map((charge, index) => (
                    <div key={`${charge.id}-${index}`} className="flex justify-between gap-3 text-muted-foreground">
                      <span>{charge.label}</span>
                      <span>{currency.format(charge.total)}</span>
                    </div>
                  ))}
                </div>
              )}
              {tailored.charges.length > 0 && <Separator />}
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Items</span>
                  <Badge variant="secondary">{itemCount}</Badge>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{currency.format(grandTotal)}</span>
                </div>
              </div>
            </>
          )}
          <Separator />
          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              onClick={() =>
                toast.message("Payment coming soon!", {
                  description:
                    "Your order is ready for payment once checkout is connected.",
                })
              }
            >
              Pay now
            </Button>
            <Link to="/order-details">
              <Button variant="outline" className="w-full">
                <ArrowLeft /> Back to Order Details
              </Button>
            </Link>
          </div>
        </aside>
      </main>
    </div>
  );
}
