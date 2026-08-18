import { motion } from "framer-motion";
import type { RankedProduct } from "@/types";

interface ComparisonTableProps {
  products: RankedProduct[];
}

function getSpecValue(product: RankedProduct, key: string): string {
  const direct = product.specs[key];
  if (direct) return direct;
  const alt = product.specs[key.replace(/\s/g, "")];
  if (alt) return alt;
  return "—";
}

export function ComparisonTable({ products }: ComparisonTableProps) {
  if (products.length === 0) return null;

  const best = products[0];
  const specKeys = Object.keys(best.specs).filter((k) => k !== "price");
  const rows: { label: string; key: string }[] = [
    { label: "Price", key: "price" },
    { label: "Rating", key: "rating" },
    { label: "Match", key: "match" },
    ...specKeys.map((k) => ({
      label: k.charAt(0).toUpperCase() + k.slice(1),
      key: k,
    })),
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-2xl border border-line bg-paper"
    >
      <div className="flex items-end justify-between gap-3 border-b border-line/60 px-6 py-4">
        <div>
          <h3 className="font-display text-lg font-medium text-ink">
            Side-by-side comparison
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            Top {products.length} products, ranked by your priorities
          </p>
        </div>
        <span className="whitespace-nowrap text-[11px] font-medium text-muted sm:hidden">
          Swipe to compare →
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line/60">
              <th className="w-32 px-6 py-3 text-left text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                Attribute
              </th>
              {products.map((p, i) => (
                <th key={p.id} className="px-4 py-3 text-left align-top">
                  <div className="flex items-start gap-2">
                    {i === 0 && (
                      <span className="mt-0.5 rounded bg-ink px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-paper">
                        Best
                      </span>
                    )}
                    <div>
                      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                        {p.brand}
                      </div>
                      <div className="font-display text-sm font-medium leading-tight text-ink">
                        {p.title}
                      </div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={row.key}
                className={ri % 2 === 0 ? "bg-paper-2/40" : ""}
              >
                <td className="px-6 py-3 text-xs font-medium text-muted">
                  {row.label}
                </td>
                {products.map((p) => {
                  let value: string;
                  if (row.key === "price") value = `$${p.price}`;
                  else if (row.key === "rating") value = `${p.rating.toFixed(1)} ★`;
                  else if (row.key === "match") value = `${p.matchPercentage}%`;
                  else value = getSpecValue(p, row.key);
                  const isBest =
                    row.key === "match" && p.id === best.id;
                  return (
                    <td
                      key={p.id}
                      className={`px-4 py-3 ${
                        isBest
                          ? "font-semibold text-accent"
                          : row.key === "price" || row.key === "rating" || row.key === "match"
                            ? "font-medium text-ink tabular-nums"
                            : "text-ink/80"
                      }`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
