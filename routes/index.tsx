import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Candy, Nut, Package, PackageCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cocoa Dolce — Premium Chocolates & Confections" },
      {
        name: "description",
        content:
          "Browse our full selection of premium nuts, chocolate boxes, chocolate bars, and curated gift sets from Cocoa Dolce.",
      },
      { property: "og:title", content: "Cocoa Dolce — Premium Chocolates & Confections" },
      {
        property: "og:description",
        content:
          "Browse our full selection of premium nuts, chocolate boxes, chocolate bars, and curated gift sets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategorySelect,
});

const categories = [
  {
    id: "nuts",
    label: "Bites + Mixes",
    description: "Chocolate bites, premium nut mixes, and seasonal confections.",
    icon: Nut,
    available: true,
    to: "/bites-mixes" as const,
  },
  {
    id: "chocolate-boxes",
    label: "Custom Chocolate Boxes",
    description: "Build a custom assortment for corporate gifting.",
    icon: Package,
    available: true,
    to: "/chocolate-boxes" as const,
  },
  {
    id: "prebuilt-chocolate-boxes",
    label: "Pre-Built Bundles + Gift Sets",
    description: "Chef-curated, ready-to-ship bundles and boxes.",
    icon: PackageCheck,
    available: true,
    to: "/pre-built-bundles" as const,
  },
  {
    id: "chocolate-bars",
    label: "Chocolate Bars",
    description: "Single-origin and flavored chocolate bars.",
    icon: Candy,
    available: true,
    to: "/chocolate-bars" as const,
  },
];

function CategorySelect() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center">
          <h1 className="font-[var(--font-display)] text-5xl font-semibold tracking-tight">
            Cocoa Dolce
          </h1>
          <p className="mt-2 text-sm tracking-[0.25em] text-muted-foreground uppercase">
            Premium Chocolates & Confections
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="mb-2 text-center text-2xl font-semibold">What would you like?</h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Choose a category to start building your order.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const inner = (
              <div className="group flex h-full flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center transition-colors hover:border-accent hover:bg-secondary/60">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-transform group-hover:scale-110">
                  <Icon className="h-8 w-8" />
                </span>
                <div>
                  <h3 className="text-xl font-semibold">{cat.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                </div>
                {cat.available ? (
                  <span className="text-xs font-medium tracking-wide text-primary uppercase">
                    Build now →
                  </span>
                ) : (
                  <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Coming soon
                  </span>
                )}
              </div>
            );

            if (cat.available && cat.to) {
              return (
                <Link key={cat.id} to={cat.to} className="block h-full">
                  {inner}
                </Link>
              );
            }

            return (
              <button
                key={cat.id}
                onClick={() =>
                  toast.message(`${cat.label} — coming soon!`, {
                    description: "This category isn't available yet. Check back shortly.",
                  })
                }
                className="h-full text-left"
              >
                {inner}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
