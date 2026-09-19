import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Cocoa Dolce" },
      {
        name: "description",
        content:
          "Review the custom boxes, bars, bites, and pre-built bundles you added, then proceed to checkout.",
      },
      { property: "og:title", content: "Your Cart — Cocoa Dolce" },
      {
        property: "og:description",
        content: "Review your Cocoa Dolce order and proceed to checkout.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function CartPage() {
  const { items, removeItem, setQuantity, clearCart, total, itemCount } = useCart();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h1 className="text-3xl font-semibold">Your Cart</h1>
              <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">
                Cocoa Dolce
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {itemCount.toLocaleString()} items &middot; {currency.format(total)}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-12 text-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold">Your cart is empty</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a category and build your order to see it here.
              </p>
            </div>
            <Button asChild>
              <Link to="/">Continue shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-28 w-28 shrink-0 rounded-md object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <Badge variant="outline">{item.category}</Badge>
                  <h2 className="mt-1 text-lg font-semibold leading-tight">{item.title}</h2>
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  {item.lines.length > 0 && (
                    <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                      {item.lines.map((line) => (
                        <li key={line.label}>
                          {line.label} &times; {line.qty}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <p className="text-sm text-muted-foreground">
                    {currency.format(item.unitPrice)} per {item.unitLabel}
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      className="h-9 w-20 text-center"
                      type="number"
                      min={1}
                      value={item.quantity}
                      aria-label={`${item.title} quantity`}
                      onChange={(event) => setQuantity(item.id, Number(event.target.value))}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.title}`}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                  <p className="text-lg font-semibold">
                    {currency.format(item.unitPrice * item.quantity + (item.oneTimeFee ?? 0))}
                  </p>
                  {item.oneTimeFee ? <p className="text-xs text-muted-foreground">Includes {currency.format(item.oneTimeFee)} setup fee</p> : null}
                </div>
              </article>
            ))}

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Items</span>
                <span>{itemCount.toLocaleString()}</span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Order total</span>
                <span>{currency.format(total)}</span>
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button asChild size="lg" className="flex-1">
                  <Link to="/order-details">Proceed to checkout</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="flex-1">
                  <Link to="/">Continue shopping</Link>
                </Button>
              </div>
              <div className="mt-3 flex justify-center">
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  Clear cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
