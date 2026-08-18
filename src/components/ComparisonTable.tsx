import { motion } from "framer-motion";
import type { RankedProduct } from "@/types";
import { formatUSDAsINR } from "@/lib/currency";

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
    { label: "Price (INR)", key: "price" },
    { label: "Rating", key: "rating" },
    { label: "Match Score", key: "match" },
    ...specKeys.map((k) => ({
      label: k.charAt(0).toUpperCase() + k.slice(1),
      key: k,
    })),
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-2xl border border-line bg-paper shadow-xs"
    >
      <div className="border-b border-line/60 bg-paper-2/30 px-6 py-4">
        <h3 className="font-display text-lg font-medium text-ink">
          Side-by-side comparison
        </h3>
        <p className="mt-0.5 text-xs text-muted">
          Top {products.length} products compared across your exact needs and verified specifications
        </p>
      </div>

      <div className="overflow-x-auto hide-scrollbar">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line/60">
              <th className="w-40 px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                Attribute
              </th>
              {products.map((p, i) => (
                <th
                  key={p.id}
                  className={`px-5 py-3.5 text-left align-top ${
                    i === 0 ? "bg-accent-soft/30 border-x border-accent/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {i === 0 && (
                      <span className="mt-0.5 rounded bg-ink px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-paper shadow-2xs">
                        Best
                      </span>
                    )}
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
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
                className={`transition-colors hover:bg-paper-2/60 ${
                  ri % 2 === 0 ? "bg-paper-2/30" : "bg-paper"
                }`}
              >
                <td className="px-6 py-3.5 text-xs font-semibold text-muted">
                  {row.label}
                </td>
                {products.map((p, pi) => {
                  let value: string;
                  if (row.key === "price") value = formatUSDAsINR(p.price);
                  else if (row.key === "rating") value = `${p.rating.toFixed(1)} ★`;
                  else if (row.key === "match") value = `${p.matchPercentage}%`;
                  else value = getSpecValue(p, row.key);

                  const isWinner = pi === 0;
                  const isMatchCol = row.key === "match" && isWinner;

                  return (
                    <td
                      key={p.id}
                      className={`px-5 py-3.5 transition-colors ${
                        isWinner ? "bg-accent-soft/20 border-x border-accent/15" : ""
                      } ${
                        isMatchCol
                          ? "font-bold text-accent text-base"
                          : row.key === "price"
                            ? "font-bold text-ink"
                            : row.key === "rating" || row.key === "match"
                              ? "font-semibold text-ink tabular-nums"
                              : "text-ink/80 text-xs sm:text-sm"
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
