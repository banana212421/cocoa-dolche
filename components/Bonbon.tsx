import type { Chocolate } from "@/data/chocolates";

export function Bonbon({
  chocolate,
  size = 40,
}: {
  chocolate: Chocolate;
  size?: number;
}) {
  return (
    <div
      className="bonbon relative shrink-0 shadow-sm"
      style={{
        width: size,
        height: size * 0.86,
        background: `radial-gradient(120% 90% at 35% 12%, ${chocolate.accent}55 0%, ${chocolate.color} 55%, #00000033 100%)`,
      }}
      aria-hidden
    >
      <span
        className="absolute rounded-full"
        style={{
          width: Math.max(3, size * 0.1),
          height: Math.max(3, size * 0.1),
          left: "26%",
          top: "24%",
          background: chocolate.accent,
        }}
      />
      <span
        className="absolute rounded-full"
        style={{
          width: Math.max(2, size * 0.07),
          height: Math.max(2, size * 0.07),
          left: "60%",
          top: "45%",
          background: chocolate.accent,
          opacity: 0.85,
        }}
      />
    </div>
  );
}
