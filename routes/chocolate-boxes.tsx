import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Eraser, Sparkles, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bonbon } from "@/components/Bonbon";
import { BackToCategories } from "@/components/BackToCategories";
import { useCart } from "@/context/CartContext";
import {
  availableChocolates,
  boxOptions,
  isCenterSlot,
  type BoxOption,
  type Chocolate,
} from "@/data/chocolates";


export const Route = createFileRoute("/chocolate-boxes")({
  head: () => ({
    meta: [
      { title: "Cocoa Dolce Corporate Box Builder" },
      {
        name: "description",
        content:
          "Configure bulk corporate chocolate boxes: choose flavors, box size, add your company name and logo, and see your order price instantly.",
      },
      { property: "og:title", content: "Cocoa Dolce Corporate Box Builder" },
      {
        property: "og:description",
        content:
          "Design 6, 10, 16, 30 or 50-piece corporate chocolate boxes with live pricing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BoxBuilder,
});

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const logoSetups = [
  { colors: 1 as const, label: "1-Color Design", fee: 275 },
  { colors: 2 as const, label: "2-Color Design", fee: 400 },
  { colors: 3 as const, label: "3-Color Design", fee: 525 },
];

function BoxBuilder() {
  const [box, setBox] = useState<BoxOption>(boxOptions[0]);
  const [currentBox, setCurrentBox] = useState<(string | null)[]>(
    Array(boxOptions[0].size).fill(null),
  );
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [selectedId, setSelectedId] = useState<string>(availableChocolates.find((item) => !item.isLogo)?.id ?? "");
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [pendingLogoSetup, setPendingLogoSetup] = useState("");
  const [logoSetup, setLogoSetup] = useState<(typeof logoSetups)[number] | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const chocolateById = useMemo(
    () => new Map(availableChocolates.map((c) => [c.id, c])),
    [],
  );
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    currentBox.forEach((id) => id && map.set(id, (map.get(id) ?? 0) + 1));
    return map;
  }, [currentBox]);

  const filled = currentBox.filter(Boolean).length;
  const selected = chocolateById.get(selectedId) ?? availableChocolates[0];

  const perPiece = box.price / box.size;
  const productSubtotal = box.price * orderQuantity;
  const hasLogoChocolate = (counts.get("corporate-logo") ?? 0) > 0;
  const logoSetupFee = hasLogoChocolate ? logoSetup?.fee ?? 0 : 0;
  const totalCost = productSubtotal + logoSetupFee;

  function changeSize(option: BoxOption) {
    setBox(option);
    setCurrentBox((prev) => {
      const next = Array<string | null>(option.size).fill(null);
      prev.slice(0, option.size).forEach((id, i) => {
        next[i] = id ?? null;
      });
      return next;
    });
  }

  function placeAt(index: number) {
    if (!selected) return;
    if (selected?.isLogo && !isCenterSlot(index, box)) {
      toast.error("Company Logo can only be placed in the center slots.");
      return;
    }
    setCurrentBox((prev) => {
      const next = [...prev];
      next[index] = selectedId;
      return next;
    });
  }

  function chooseChocolate(chocolate: Chocolate) {
    if (!chocolate.isLogo) {
      setSelectedId(chocolate.id);
      return;
    }
    setPendingLogoSetup(logoSetup ? String(logoSetup.colors) : "");
    setLogoDialogOpen(true);
  }

  function confirmLogoSetup() {
    const setup = logoSetups.find((option) => String(option.colors) === pendingLogoSetup);
    if (!setup) return;
    setLogoSetup(setup);
    setSelectedId("corporate-logo");
    setLogoDialogOpen(false);
  }

  function clearSlot(index: number) {
    setCurrentBox((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }

  function distributeEvenly() {
    const flavors = Array.from(counts.keys()).filter((id) => !chocolateById.get(id)?.isLogo);
    const firstChocolate = availableChocolates.find((chocolate) => !chocolate.isLogo);
    const pool = flavors.length
      ? flavors
      : selected?.isLogo
        ? firstChocolate
          ? [firstChocolate.id]
          : []
        : selected
          ? [selected.id]
          : [];

    if (!pool.length) return;

    setCurrentBox((prev) => {
      const next = [...prev];
      let i = 0;
      next.forEach((slot, idx) => {
        if (slot === null) {
          const nextFlavor = pool[i % pool.length];
          if (nextFlavor) next[idx] = nextFlavor;
          i++;
        }
      });
      return next;
    });
    toast.success("Remaining slots filled evenly.");
  }

  function clearBox() {
    setCurrentBox(Array(box.size).fill(null));
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    readImageUpload(event, setLogoUrl, "Logo added to the box front.");
  }

  function readImageUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    onLoad: (url: string | null) => void,
    successMessage: string,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG, JPG or SVG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be smaller than 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onLoad(typeof reader.result === "string" ? reader.result : null);
      toast.success(successMessage);
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setLogoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function addBoxToCart() {
    if (filled === 0) {
      toast.error("Place at least one piece in the box first.");
      return;
    }
    if (hasLogoChocolate && !logoSetup) {
      toast.error("Choose a Custom Logo Chocolates design setup first.");
      return;
    }
    if (hasLogoChocolate && productSubtotal < 500) {
      toast.error("Custom Logo Chocolates require a minimum product spend of $500.");
      return;
    }
    addItem({
      title: `Custom ${box.size}-Piece Box`,
      subtitle: `${filled} of ${box.size} slots filled${logoUrl ? " · company logo included" : ""}`,
      category: "Custom Chocolate Boxes",
      unitLabel: "box",
      unitPrice: box.price,
      quantity: orderQuantity,
      oneTimeFee: logoSetupFee,
      productDetails: {
        kind: "custom-box",
        boxSize: box.size,
        layout: [...currentBox],
        ...(hasLogoChocolate && logoSetup ? { logoSetup: { colors: logoSetup.colors, fee: logoSetup.fee } } : {}),
      },
      lines: Array.from(counts.entries()).map(([id, qty]) => ({
        label: chocolateById.get(id)?.name ?? "Unknown flavor",
        qty,
      })),
      ...(logoUrl ? { image: logoUrl } : {}),
    });
    toast.success("Added to your cart.");
    void navigate({ to: "/cart" });
  }

  function renderChocolate(chocolate: Chocolate, size: number) {
    if (chocolate.isLogo) {
      if (logoUrl) {
        return (
          <span
            className="flex shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-card p-1 shadow-sm"
            style={{ width: size, height: size }}
            aria-hidden
          >
            <img src={logoUrl} alt="" className="h-full w-full object-contain" />
          </span>
        );
      }

      return (
        <span
          className="flex shrink-0 items-center justify-center overflow-hidden rounded-sm border border-border bg-muted p-1 text-center text-muted-foreground shadow-sm"
          style={{ width: size, height: size }}
          aria-hidden
        >
          <span className={size < 40 ? "text-[6px] leading-tight" : "text-[9px] leading-tight"}>
            Your Logo Here
          </span>
        </span>
      );
    }

    if (chocolate.image) {
      return (
        <img
          src={chocolate.image}
          alt=""
          className="shrink-0 rounded-sm object-cover shadow-sm"
          style={{ width: size, height: size }}
          aria-hidden
        />
      );
    }

    return <Bonbon chocolate={chocolate} size={size} />;
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
                Corporate Box Builder
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {filled} of {box.size} slots filled &middot; {orderQuantity.toLocaleString()} boxes
              &middot; {currency.format(totalCost)}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-6 px-6 py-8 lg:grid-cols-[300px_1fr_320px]">
        {/* Palette */}
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-xl font-semibold">Flavor Palette</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Pick a flavor, then click a slot in the box.
          </p>
          <div className="max-h-[70vh] space-y-1.5 overflow-y-auto pr-1">
            {availableChocolates.map((c) => {
              const active = c.id === selectedId;
              const count = counts.get(c.id) ?? 0;
              return (
                <button
                  key={c.id}
                   onClick={() => chooseChocolate(c)}
                  className={`flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors ${
                    active
                      ? "border-accent bg-secondary"
                      : "border-border hover:bg-secondary/60"
                  }`}
                >
                    {renderChocolate(c, 32)}
                  <span className="flex-1 text-sm leading-tight">{c.name}</span>
                  {count > 0 && <Badge variant="secondary">{count}</Badge>}
                </button>
              );
            })}
          </div>
        </section>

        {/* Box */}
        <section className="flex flex-col items-center gap-4">
          <div
            className="w-full rounded-lg border border-border p-6"
            style={{ background: "#efe6d4" }}
          >
            <div className="mb-5 flex flex-col items-center gap-2">
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt="Company logo"
                  className="max-h-16 max-w-[220px] object-contain"
                />
              )}
              <div className="h-px w-24" style={{ background: "#c9bca4" }} />
            </div>

            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${box.cols}, minmax(0, 1fr))` }}
            >
              {currentBox.map((id, i) => {
                const choc = id ? chocolateById.get(id) : null;
                return (
                  <button
                    key={i}
                    onClick={() => (choc ? clearSlot(i) : placeAt(i))}
                    title={choc ? `${choc.name} — click to remove` : "Click to place"}
                    className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md border transition-colors"
                    style={{
                      borderColor: "#c9bca4",
                      background: choc ? "#fbf7ef" : "#e5dac6",
                    }}
                  >
                    {choc?.isLogo ? (
                      logoUrl ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-card p-2">
                          <img src={logoUrl} alt="Company logo chocolate" className="h-full w-full object-contain" />
                        </span>
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center bg-muted p-1 text-center text-[9px] leading-tight text-muted-foreground">
                          Your Logo Here
                        </span>
                      )
                    ) : choc?.image ? (
                      <img
                        src={choc.image}
                        alt={choc.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : choc ? (
                      renderChocolate(choc, 56)
                    ) : (
                      <span className="text-xs text-[#a3937a]">{i + 1}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-5 text-center text-[11px] tracking-[0.25em] text-[#8a7a62] uppercase">
              Cocoa Dolce &middot; {box.size} Piece Collection
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={distributeEvenly}>
              <Sparkles /> Distribute evenly
            </Button>
            <Button variant="outline" onClick={clearBox}>
              <Eraser /> Clear box
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Selected: <span className="text-foreground">{selected?.name}</span>
          </p>
        </section>

        {/* Order details */}
        <section className="space-y-5 rounded-lg border border-border bg-card p-4">
          <h2 className="text-xl font-semibold">Order Details</h2>

          <div className="space-y-2">
            <Label>Box size</Label>
            <div className="grid grid-cols-2 gap-2">
              {boxOptions.map((option) => (
                <Button
                  key={option.size}
                  variant={box.size === option.size ? "default" : "outline"}
                  onClick={() => changeSize(option)}
                  className="h-auto flex-col py-2"
                >
                  <span>{option.size} piece</span>
                  <span className="text-xs font-normal opacity-80">
                    {currency.format(option.price)} &middot; $
                    {(option.price / option.size).toFixed(2)} each
                  </span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qty">Box quantity</Label>
            <Input
              id="qty"
              type="number"
              min={1}
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value) || 1))}
            />
            <p className="text-xs text-muted-foreground">
              {(filled * orderQuantity).toLocaleString()} total pieces in this run.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Company logo</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={handleLogoChange}
            />
            {logoUrl ? (
              <div className="flex items-center gap-3 rounded-md border border-border p-2">
                <img
                  src={logoUrl}
                  alt="Company logo"
                  className="h-12 w-12 object-contain"
                />
                <span className="flex-1 text-xs text-muted-foreground">
                  Logo ready for print
                </span>
                <Button variant="ghost" size="icon" onClick={removeLogo} aria-label="Remove logo">
                  <X />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload /> Upload logo
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              PNG, JPG, SVG or WebP up to 5 MB.
            </p>
          </div>



          <Separator />

          <div className="space-y-2">
            {Array.from(counts.entries()).map(([id, qty]) => (
              <div key={id} className="flex justify-between text-sm">
                <span>{chocolateById.get(id)?.name ?? "Unknown flavor"}</span>
                <span className="text-muted-foreground">
                  {qty} / box &middot; {(qty * orderQuantity).toLocaleString()}
                </span>
              </div>
            ))}
            {counts.size === 0 && (
              <p className="text-sm text-muted-foreground">No pieces placed yet.</p>
            )}
          </div>

          <Separator />

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {box.size}-piece box ({currency.format(perPiece)} per piece)
              </span>
              <span>{currency.format(box.price)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Quantity</span>
              <span>&times; {orderQuantity.toLocaleString()}</span>
            </div>
            {hasLogoChocolate && logoSetup && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{logoSetup.label} setup</span>
                <span>{currency.format(logoSetup.fee)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{currency.format(totalCost)}</span>
            </div>
          </div>

          <Button size="lg" className="w-full" disabled={filled === 0} onClick={addBoxToCart}>
            Add to cart
          </Button>
        </section>
      </main>

      <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom Logo Chocolates</DialogTitle>
            <DialogDescription>Select a required design setup before placing logo chocolates in your box.</DialogDescription>
          </DialogHeader>
          <div className="rounded-md border border-border bg-muted/40 p-4 text-sm">
            <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>Lead time: 4–6 business weeks</li>
              <li>54% Classic ganache flavor</li>
              <li>Minimum product spend: $500</li>
              <li>Includes 1,500 transfers stored for 18 months for future orders</li>
              <li>Placement is limited to the center slots of each box</li>
            </ul>
          </div>
          <RadioGroup value={pendingLogoSetup} onValueChange={setPendingLogoSetup} className="gap-3">
            {logoSetups.map((setup) => (
              <Label key={setup.colors} htmlFor={`logo-${setup.colors}`} className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-4 has-[[data-state=checked]]:border-primary">
                <RadioGroupItem id={`logo-${setup.colors}`} value={String(setup.colors)} />
                <span className="flex flex-1 justify-between gap-3"><span>{setup.label}</span><span className="font-semibold">{currency.format(setup.fee)}</span></span>
              </Label>
            ))}
          </RadioGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoDialogOpen(false)}>Cancel</Button>
            <Button disabled={!pendingLogoSetup} onClick={confirmLogoSetup}>Use Custom Logo Chocolates</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
