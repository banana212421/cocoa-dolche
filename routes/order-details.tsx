import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Package,
  Plus,
  Trash2,
  Upload,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCart, type CartItem } from "@/context/CartContext";
import {
  calculateTailoredCharges,
  getBarQuantities,
  getBoxQuantities,
  quantityTiers,
  tailoredRates,
  type ArtworkChoice,
  type MessageCardSide,
  type TailoredAddonId,
  type TierRate,
} from "@/data/tastefullyTailored";

export const Route = createFileRoute("/order-details")({
  head: () => ({
    meta: [
      { title: "Order Details — Cocoa Dolce" },
      {
        name: "description",
        content: "Add shipping details, recipients, a gift message, and branded packaging to your Cocoa Dolce order.",
      },
      { property: "og:title", content: "Order Details — Cocoa Dolce" },
      {
        property: "og:description",
        content: "Prepare your Cocoa Dolce gifts for shipping and payment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderDetailsPage,
});

type RecipientGroup = {
  id: string;
  title: string;
  itemId?: string;
  itemIds?: string[];
  recipientCount: number;
  uploadedFile?: string;
};

type RecipientMode = "per-bundle" | "custom";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const countries = [
  { value: "US", label: "🇺🇸 +1" },
  { value: "CA", label: "🇨🇦 +1" },
  { value: "GB", label: "🇬🇧 +44" },
] as const;

function expectedShipDate() {
  const date = new Date();
  date.setDate(date.getDate() + 4);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function groupFromItem(item: CartItem): RecipientGroup {
  return {
    id: `group-${item.id}`,
    title: item.title,
    itemId: item.id,
    recipientCount: 0,
  };
}

function RateTable({ rows }: { rows: { label: string; rates: TierRate }[] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-[560px] text-left text-xs">
        <thead className="bg-muted/60">
          <tr>
            <th className="px-3 py-2 font-semibold">Option</th>
            {quantityTiers.map((tier) => <th key={tier} className="px-3 py-2 text-right font-semibold">{tier}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-border">
              <td className="px-3 py-2 font-medium">{row.label}</td>
              {row.rates.map((rate, index) => <td key={quantityTiers[index]} className="px-3 py-2 text-right">{rate === null ? "Not offered" : currency.format(rate)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderDetailsPage() {
  const { items, total, itemCount, setTailored } = useCart();
  const [shippingTiming, setShippingTiming] = useState("asap");
  const [scheduledDate, setScheduledDate] = useState("");
  const [country, setCountry] = useState("US");
  const [phone, setPhone] = useState("");
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("per-bundle");
  const [perBundleGroups, setPerBundleGroups] = useState<RecipientGroup[]>([]);
  const [customGroups, setCustomGroups] = useState<RecipientGroup[]>([]);
  const [customGroupName, setCustomGroupName] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [tailoredAddons, setTailoredAddons] = useState<TailoredAddonId[]>([]);
  const [artworkChoice, setArtworkChoice] = useState<ArtworkChoice>("template");
  const [messageCardSide, setMessageCardSide] = useState<MessageCardSide>("single");
  const [artworkFiles, setArtworkFiles] = useState<Record<string, string>>({});
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const artworkInputs = useRef<Record<string, HTMLInputElement | null>>({});

  function renderArtworkUpload(id: TailoredAddonId, label: string) {
    if (artworkChoice !== "template") return null;
    const fileName = artworkFiles[id];
    return (
      <div className="mt-4 rounded-md border border-dashed border-border bg-muted/30 p-3">
        <p className="text-xs font-semibold">Upload your {label.toLowerCase()} artwork</p>
        <p className="mt-1 text-xs text-muted-foreground">Please upload a high resolution jpg, jpeg, png or pdf file.</p>
        <input
          ref={(element) => {
            artworkInputs.current[id] = element;
          }}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setArtworkFiles((current) => ({ ...current, [id]: file.name }));
            event.target.value = "";
          }}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={() => artworkInputs.current[id]?.click()}>
            <Upload className="mr-2 size-4" />
            {fileName ? "Replace file" : "Upload artwork"}
          </Button>
          {fileName && <span className="text-xs text-muted-foreground">{fileName}</span>}
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (items.length === 0) return;
    setPerBundleGroups((current) => {
      const knownItemIds = new Set(current.map((group) => group.itemId).filter(Boolean));
      const additions = items.filter((item) => !knownItemIds.has(item.id)).map(groupFromItem);
      const currentItemIds = new Set(items.map((item) => item.id));
      const retained = current.filter((group) => group.itemId && currentItemIds.has(group.itemId));
      return additions.length > 0 || retained.length !== current.length ? [...retained, ...additions] : current;
    });
  }, [items]);

  const boxQuantities = useMemo(() => getBoxQuantities(items), [items]);
  const barQuantities = useMemo(() => getBarQuantities(items), [items]);
  const eligibleBoxCount = boxQuantities.small + boxQuantities.large;
  const tailored = useMemo(
    () => calculateTailoredCharges(items, tailoredAddons, artworkChoice, messageCardSide),
    [items, tailoredAddons, artworkChoice, messageCardSide],
  );
  const grandTotal = total + tailored.total;

  useEffect(() => {
    setTailored(tailored);
  }, [setTailored, tailored]);

  const activeGroups = recipientMode === "per-bundle" ? perBundleGroups : customGroups;

  function updateActiveGroups(updater: (groups: RecipientGroup[]) => RecipientGroup[]) {
    if (recipientMode === "per-bundle") {
      setPerBundleGroups(updater);
    } else {
      setCustomGroups(updater);
    }
  }

  function createCustomGroup() {
    if (selectedItemIds.length === 0) return;
    setCustomGroups((current) => [
      ...current,
      {
        id: `custom-${Date.now().toString(36)}`,
        title: customGroupName.trim() || `Custom group ${current.length + 1}`,
        itemIds: selectedItemIds,
        recipientCount: 0,
      },
    ]);
    setCustomGroupName("");
    setSelectedItemIds([]);
  }

  function toggleSelectedItem(itemId: string) {
    setSelectedItemIds((current) => current.includes(itemId)
      ? current.filter((id) => id !== itemId)
      : [...current, itemId]);
  }

  function removeCustomGroup(groupId: string) {
    setCustomGroups((current) => current.filter((group) => group.id !== groupId));
  }

  function handleRecipientUpload(groupId: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = typeof reader.result === "string"
        ? reader.result.split(/\r?\n/).filter((row) => row.trim().length > 0).length
        : 0;
      const recipientCount = Math.max(0, rows - 1);
      updateActiveGroups((current) => current.map((group) =>
        group.id === groupId
          ? { ...group, uploadedFile: file.name, recipientCount: group.recipientCount + recipientCount }
          : group,
      ));
      toast.success(`${file.name} uploaded`, {
        description: recipientCount > 0 ? `${recipientCount} recipients added.` : "Recipient file attached.",
      });
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  function addRecipient() {
    if (!activeGroupId || !recipientName.trim() || !recipientAddress.trim()) return;
    updateActiveGroups((current) => current.map((group) =>
      group.id === activeGroupId
        ? { ...group, recipientCount: group.recipientCount + 1 }
        : group,
    ));
    setRecipientName("");
    setRecipientEmail("");
    setRecipientAddress("");
    setActiveGroupId(null);
    toast.success("Recipient added.");
  }

  function toggleTailoredAddon(addon: TailoredAddonId, checked: boolean) {
    setTailoredAddons((current) => checked
      ? Array.from(new Set([...current, addon]))
      : current.filter((item) => item !== addon));
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-card">
          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
            <h1 className="text-3xl font-semibold">Order Details</h1>
            <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">Cocoa Dolce</p>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-semibold">Your cart is empty</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add a gift before entering order details.</p>
          <Button asChild className="mt-6"><Link to="/">Browse gifts</Link></Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm tracking-[0.2em] text-muted-foreground uppercase">Cocoa Dolce</p>
              <h1 className="text-3xl font-semibold">Order Details</h1>
            </div>
            <p className="text-sm text-muted-foreground">{itemCount.toLocaleString()} items &middot; {currency.format(grandTotal)}</p>
          </div>
          <nav aria-label="Checkout progress" className="mt-5">
            <ol className="flex items-center gap-2 text-sm sm:gap-3">
              <li><Link to="/cart" className="text-muted-foreground transition-colors hover:text-foreground">Cart</Link></li>
              <li aria-hidden="true"><ChevronRight className="h-4 w-4 text-muted-foreground" /></li>
              <li aria-current="step" className="font-semibold text-foreground">Order Details</li>
              <li aria-hidden="true"><ChevronRight className="h-4 w-4 text-muted-foreground" /></li>
              <li className="text-muted-foreground">Payment</li>
            </ol>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid min-w-0 max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">Delivery &amp; Scheduling</h2>
            </div>
            <RadioGroup value={shippingTiming} onValueChange={setShippingTiming} className="mt-5 gap-3">
              <Label htmlFor="ship-asap" className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-4">
                <RadioGroupItem value="asap" id="ship-asap" className="mt-0.5" />
                <span>
                  <span className="block">Ship gift as soon as it's ready</span>
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">Expected to ship on {expectedShipDate()}</span>
                </span>
              </Label>
              <Label htmlFor="ship-later" className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-4">
                <RadioGroupItem value="later" id="ship-later" className="mt-0.5" />
                <span className="block flex-1">
                  <span className="block">Schedule a later shipping date</span>
                  {shippingTiming === "later" && (
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(event) => setScheduledDate(event.target.value)}
                      className="mt-3 max-w-xs"
                      aria-label="Later shipping date"
                    />
                  )}
                </span>
              </Label>
            </RadioGroup>

            <div className="mt-6">
              <Label htmlFor="phone">Phone number</Label>
              <div className="mt-2 flex gap-2">
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="w-28" aria-label="Country code"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {countries.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input id="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(555) 555-0123" className="flex-1" />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">This phone number will be used to contact you if there are any problems delivering your gifts.</p>
            </div>

            <ul className="mt-6 list-disc space-y-2 border-t border-border pt-5 pl-5 text-sm text-muted-foreground">
              <li>Shipping availability will be determined when selecting recipients and products.</li>
              <li>Please note other Cocoa Dolce promotions/discounts are not applicable towards Self-Service orders. For personal assistance, please email us at <a className="font-medium text-foreground underline underline-offset-4" href="mailto:gifting@cocoadolce.com">gifting@cocoadolce.com</a>.</li>
              <li>Sorry, we do not ship to PO Boxes.</li>
              <li>Custom printed labels and notecards may delay shipping 1-2 business days.</li>
            </ul>
          </section>

          <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
            <h2 className="text-2xl font-semibold">Recipients</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose how products should be assigned to shipping recipients.</p>
            <RadioGroup value={recipientMode} onValueChange={(value) => setRecipientMode(value as RecipientMode)} className="mt-5 grid gap-3 sm:grid-cols-2">
              <Label htmlFor="recipients-per-bundle" className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-4 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent">
                <RadioGroupItem value="per-bundle" id="recipients-per-bundle" className="mt-0.5" />
                <span>
                  <span className="block font-semibold">Add Recipients Per Bundle</span>
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">Manage addresses separately for each item in your cart.</span>
                </span>
              </Label>
              <Label htmlFor="recipients-custom" className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-4 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-accent">
                <RadioGroupItem value="custom" id="recipients-custom" className="mt-0.5" />
                <span>
                  <span className="block font-semibold">Create Your Own Layout</span>
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">Combine selected products into your own recipient groups.</span>
                </span>
              </Label>
            </RadioGroup>

            {recipientMode === "custom" && (
              <div className="mt-5 rounded-md border border-border bg-muted/30 p-4">
                <h3 className="font-semibold">Create a custom group</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] sm:items-end">
                  <div>
                    <Label htmlFor="custom-group-name">Group name</Label>
                    <Input id="custom-group-name" className="mt-2" value={customGroupName} onChange={(event) => setCustomGroupName(event.target.value)} placeholder={`Custom group ${customGroups.length + 1}`} />
                  </div>
                  <div>
                    <Label>Products to group together</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="outline" className="mt-2 w-full justify-between font-normal">
                          <span className="truncate">{selectedItemIds.length > 0 ? `${selectedItemIds.length} product${selectedItemIds.length === 1 ? "" : "s"} selected` : "Select products"}</span>
                          <ChevronDown />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[min(22rem,calc(100vw-3rem))]">
                        <DropdownMenuLabel>Select all products for this group</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {items.map((item) => (
                          <DropdownMenuCheckboxItem
                            key={item.id}
                            checked={selectedItemIds.includes(item.id)}
                            onSelect={(event) => event.preventDefault()}
                            onCheckedChange={() => toggleSelectedItem(item.id)}
                          >
                            <span className="min-w-0 truncate">{item.title} · Qty {item.quantity}</span>
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <Button type="button" onClick={createCustomGroup} disabled={selectedItemIds.length === 0}><Plus /> Add group</Button>
                </div>
              </div>
            )}

            <div className="mt-5 space-y-3">
              {activeGroups.map((group) => {
                const groupedItems = group.itemIds
                  ? items.filter((item) => group.itemIds?.includes(item.id))
                  : [];
                return (
                <div key={group.id} className="rounded-md border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{group.title}</h3>
                      {groupedItems.length > 0 && (
                        <p className="mt-1 text-sm text-muted-foreground">{groupedItems.map((item) => `${item.title} (Qty ${item.quantity})`).join(" · ")}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {group.recipientCount > 0 ? `${group.recipientCount} recipients` : "No recipients added"}
                        {group.uploadedFile ? ` · ${group.uploadedFile}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {group.itemId && <Badge variant="outline">Order group</Badge>}
                      {group.itemIds && (
                        <Button type="button" size="icon" variant="ghost" aria-label={`Remove ${group.title}`} title="Remove group" onClick={() => removeCustomGroup(group.id)}><Trash2 /></Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input
                      ref={(node) => { fileInputs.current[group.id] = node; }}
                      type="file"
                      accept=".csv,.xls,.xlsx"
                      className="hidden"
                      onChange={(event) => handleRecipientUpload(group.id, event)}
                    />
                    <Button variant="outline" onClick={() => fileInputs.current[group.id]?.click()}><Upload /> Upload recipients</Button>
                    <Button variant="outline" onClick={() => setActiveGroupId(group.id)}><UserPlus /> Add one by one</Button>
                  </div>
                </div>
                );
              })}
              {recipientMode === "custom" && customGroups.length === 0 && (
                <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">Select products above to create your first custom group.</p>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-gift-banner px-5 py-4 text-gift-banner-foreground sm:px-6">
              <h2 className="text-2xl font-semibold">Universal Gift Message</h2>
              <span className="text-xs">Maximum 200 characters</span>
            </div>
            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <div className="flex items-center justify-between gap-2"><Label htmlFor="gift-from">From</Label><span className="text-xs text-muted-foreground">{from.length}/100</span></div>
                <Input id="gift-from" className="mt-2" value={from} maxLength={100} onChange={(event) => setFrom(event.target.value)} placeholder="Your name or company name" />
              </div>
              <div>
                <div className="flex items-center justify-between gap-2"><Label htmlFor="gift-message">Gift message</Label><span className="text-xs text-muted-foreground">{message.length}/200</span></div>
                <Textarea id="gift-message" className="mt-2 min-h-28 resize-y" value={message} maxLength={200} onChange={(event) => setMessage(event.target.value)} placeholder="Write your message here" />
                <p className="mt-1.5 text-xs text-muted-foreground">This message will be included with every order in this checkout.</p>
              </div>
            </div>
          </section>

          <section className="min-w-0 rounded-lg border border-border bg-card px-5 sm:px-6">
            <Accordion type="single" collapsible defaultValue="tastefully-tailored">
              <AccordionItem value="tastefully-tailored" className="border-0">
                <AccordionTrigger className="py-5 text-left hover:no-underline">
                  <span><span className="block text-2xl font-semibold">Tastefully Tailored</span><span className="mt-1 block text-sm font-normal text-muted-foreground">Choose an easy-to-use artwork template, or let our design team create a custom design for a one-time $75 fee.</span></span>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <RadioGroup value={artworkChoice} onValueChange={(value) => setArtworkChoice(value as ArtworkChoice)} className="mb-5 grid gap-3 sm:grid-cols-2">
                    <Label htmlFor="art-template" className="flex cursor-pointer gap-3 rounded-md border border-border p-4 has-[[data-state=checked]]:border-primary"><RadioGroupItem id="art-template" value="template" /><span><span className="block font-semibold">Artwork template</span><span className="text-xs font-normal text-muted-foreground">Use one of our ready-to-customize layouts.</span></span></Label>
                    <Label htmlFor="art-custom" className="flex cursor-pointer gap-3 rounded-md border border-border p-4 has-[[data-state=checked]]:border-primary"><RadioGroupItem id="art-custom" value="custom" /><span><span className="block font-semibold">Custom design · $75</span><span className="text-xs font-normal text-muted-foreground">One design fee for the entire order.</span></span></Label>
                  </RadioGroup>

                  <div className="space-y-3">
                    <div className="rounded-md border border-border p-4">
                      <div className="flex items-start gap-3"><Checkbox id="box-label-addon" checked={tailoredAddons.includes("box-label")} onCheckedChange={(checked) => toggleTailoredAddon("box-label", checked === true)} /><div><Label htmlFor="box-label-addon" className="cursor-pointer text-base font-semibold">Box Label</Label><p className="text-xs text-muted-foreground">Lead time: 2 business weeks</p></div></div>
                      {tailoredAddons.includes("box-label") && <><RateTable rows={[{ label: "6 / 10 / 16 Piece", rates: tailoredRates.boxLabel.small }, { label: "30 / 50 Piece", rates: tailoredRates.boxLabel.large }]} />{(boxQuantities.small < 50 || (boxQuantities.large > 0 && boxQuantities.large < 50)) && <p className="mt-2 text-xs text-destructive">Each box-size group requires at least 50 eligible boxes to receive labels.</p>}{renderArtworkUpload("box-label", "Box label")}</>}
                    </div>
                    <div className="rounded-md border border-border p-4">
                      <div className="flex items-start gap-3"><Checkbox id="box-insert-addon" checked={tailoredAddons.includes("box-insert")} onCheckedChange={(checked) => toggleTailoredAddon("box-insert", checked === true)} /><div><Label htmlFor="box-insert-addon" className="cursor-pointer text-base font-semibold">Box Insert</Label><p className="text-xs text-muted-foreground">Lead time: 2 business weeks · Double sided · Located inside the chocolate box</p></div></div>
                      {tailoredAddons.includes("box-insert") && <><RateTable rows={[{ label: "6 / 10 / 16 Piece", rates: tailoredRates.boxInsert.small }, { label: "30 / 50 Piece", rates: tailoredRates.boxInsert.large }]} />{(boxQuantities.small < 50 || (boxQuantities.large > 0 && boxQuantities.large < 50)) && <p className="mt-2 text-xs text-destructive">Each box-size group requires at least 50 eligible boxes to receive inserts.</p>}{renderArtworkUpload("box-insert", "Box insert")}</>}
                    </div>
                    <div className="rounded-md border border-border p-4">
                      <div className="flex items-start gap-3"><Checkbox id="message-card-addon" checked={tailoredAddons.includes("message-card")} onCheckedChange={(checked) => toggleTailoredAddon("message-card", checked === true)} /><div><Label htmlFor="message-card-addon" className="cursor-pointer text-base font-semibold">Personalized Message Card</Label><p className="text-xs text-muted-foreground">Lead time: 2 business weeks · Does not include envelope · Max character limit 250 · Message is identical for each recipient · Located inside the shipping box</p></div></div>
                      {tailoredAddons.includes("message-card") && <><RadioGroup value={messageCardSide} onValueChange={(value) => setMessageCardSide(value as MessageCardSide)} className="mt-4 flex flex-wrap gap-4"><Label htmlFor="card-single" className="flex cursor-pointer items-center gap-2"><RadioGroupItem id="card-single" value="single" /> Single Sided</Label><Label htmlFor="card-double" className="flex cursor-pointer items-center gap-2"><RadioGroupItem id="card-double" value="double" /> Double Sided</Label></RadioGroup><RateTable rows={[{ label: "Single Sided", rates: tailoredRates.messageCard.single }, { label: "Double Sided", rates: tailoredRates.messageCard.double }]} />{itemCount < 50 && <p className="mt-2 text-xs text-destructive">A minimum quantity of 50 is required.</p>}{renderArtworkUpload("message-card", "Message card")}</>}
                    </div>
                    <div className="rounded-md border border-border p-4">
                      <div className="flex items-start gap-3"><Checkbox id="bar-label-addon" checked={tailoredAddons.includes("bar-labels")} onCheckedChange={(checked) => toggleTailoredAddon("bar-labels", checked === true)} /><div><Label htmlFor="bar-label-addon" className="cursor-pointer text-base font-semibold">Bar Labels</Label><p className="text-xs text-muted-foreground">Lead time: 2 business weeks</p></div></div>
                      {tailoredAddons.includes("bar-labels") && <><RateTable rows={[{ label: "Tasting Square", rates: tailoredRates.barLabels.tasting }, { label: "Mini", rates: tailoredRates.barLabels.mini }, { label: "Full", rates: tailoredRates.barLabels.full }]} />{((barQuantities.mini > 0 && barQuantities.mini < 100) || (barQuantities.full > 0 && barQuantities.full < 100) || (barQuantities.tasting > 0 && barQuantities.tasting < 500) || barQuantities.mini + barQuantities.full + barQuantities.tasting === 0) && <p className="mt-2 text-xs text-destructive">Mini and Full labels start at 100 bars per format; Tasting Square labels start at 500.</p>}{renderArtworkUpload("bar-labels", "Bar label")}</>}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button asChild size="lg" variant="outline"><Link to="/cart"><ArrowLeft /> Back to Cart</Link></Button>
            <Button asChild size="lg"><Link to="/payment">Continue to Payment</Link></Button>
          </div>
        </div>

        <aside className="self-start rounded-lg border border-border bg-card p-5 lg:sticky lg:top-4">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 text-sm">
                {item.image && <img src={item.image} alt="" className="h-12 w-12 shrink-0 rounded-sm object-cover" />}
                <span className="min-w-0 flex-1"><span className="block font-medium leading-tight">{item.title}</span><span className="text-xs text-muted-foreground">Qty {item.quantity}</span></span>
                <span className="shrink-0">{currency.format(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{currency.format(total)}</span></div>
            {tailored.charges.map((charge, index) => (
              <div key={`${charge.id}-${index}`} className="flex justify-between gap-3"><span className="text-muted-foreground">{charge.label}{charge.quantity > 1 ? ` (${charge.quantity})` : ""}</span><span>{currency.format(charge.total)}</span></div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between text-lg font-semibold"><span>Total</span><span>{currency.format(grandTotal)}</span></div>
        </aside>
      </main>

      <Dialog open={activeGroupId !== null} onOpenChange={(open) => { if (!open) setActiveGroupId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add recipient</DialogTitle>
            <DialogDescription>Enter one recipient for this product group.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label htmlFor="recipient-name">Recipient name</Label><Input id="recipient-name" className="mt-2" value={recipientName} onChange={(event) => setRecipientName(event.target.value)} /></div>
            <div><Label htmlFor="recipient-email">Email (optional)</Label><Input id="recipient-email" type="email" className="mt-2" value={recipientEmail} onChange={(event) => setRecipientEmail(event.target.value)} /></div>
            <div><Label htmlFor="recipient-address">Shipping address</Label><Textarea id="recipient-address" className="mt-2" value={recipientAddress} onChange={(event) => setRecipientAddress(event.target.value)} /></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button disabled={!recipientName.trim() || !recipientAddress.trim()} onClick={addRecipient}>Add recipient</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}