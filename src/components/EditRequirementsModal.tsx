import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Plus, Trash2, Sliders, Check } from "lucide-react";
import type { Requirements } from "@/types";
import { formatINR } from "@/lib/currency";

interface EditRequirementsModalProps {
  isOpen: boolean;
  requirements: Requirements | null;
  query: string;
  onClose: () => void;
  onSaveAndRerun: (newQuery: string, newReq: Requirements) => void;
}

const CATEGORY_OPTIONS = [
  { value: "smartphones", label: "Smartphones / Mobile Phones" },
  { value: "laptops", label: "Laptops / Notebooks" },
  { value: "headphones", label: "Headphones / Earbuds" },
  { value: "smartwatches", label: "Smartwatches / Fitness Bands" },
  { value: "tablets", label: "Tablets / iPads" },
  { value: "watches", label: "Traditional Watches" },
  { value: "fragrances", label: "Fragrances / Perfumes" },
  { value: "womens-bags", label: "Bags & Backpacks" },
  { value: "mens-shoes", label: "Shoes & Sneakers" },
];

const POPULAR_PRIORITIES = [
  "battery",
  "sound",
  "performance",
  "camera",
  "comfort",
  "display",
  "portability",
  "gaming",
  "productivity",
  "durability",
];

const POPULAR_USE_CASES = [
  "gaming",
  "college",
  "work",
  "travel",
  "fitness",
  "music",
  "photography",
];

export function EditRequirementsModal({
  isOpen,
  requirements,
  query,
  onClose,
  onSaveAndRerun,
}: EditRequirementsModalProps) {
  const [editedQuery, setEditedQuery] = useState("");
  const [category, setCategory] = useState("smartphones");
  const [maxBudget, setMaxBudget] = useState<number | string>("");
  const [priorities, setPriorities] = useState<string[]>([]);
  const [useCases, setUseCases] = useState<string[]>([]);
  const [newPriorityInput, setNewPriorityInput] = useState("");
  const [newUseCaseInput, setNewUseCaseInput] = useState("");

  useEffect(() => {
    if (requirements) {
      setEditedQuery(query || "");
      setCategory(requirements.category || "smartphones");
      setMaxBudget(requirements.maxBudget || "");
      setPriorities([...requirements.priorities]);
      setUseCases([...requirements.useCases]);
    }
  }, [requirements, query, isOpen]);

  if (!requirements) return null;

  const handleAddPriority = (val: string) => {
    const trimmed = val.trim().toLowerCase();
    if (trimmed && !priorities.includes(trimmed)) {
      setPriorities([...priorities, trimmed]);
      setNewPriorityInput("");
    }
  };

  const handleRemovePriority = (index: number) => {
    setPriorities(priorities.filter((_, i) => i !== index));
  };

  const handleAddUseCase = (val: string) => {
    const trimmed = val.trim().toLowerCase();
    if (trimmed && !useCases.includes(trimmed)) {
      setUseCases([...useCases, trimmed]);
      setNewUseCaseInput("");
    }
  };

  const handleRemoveUseCase = (index: number) => {
    setUseCases(useCases.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericBudget = typeof maxBudget === "number" ? maxBudget : parseInt(String(maxBudget).replace(/\D/g, ""), 10);

    const updatedReq: Requirements = {
      ...requirements,
      category,
      maxBudget: !isNaN(numericBudget) && numericBudget > 0 ? numericBudget : null,
      priorities,
      useCases,
    };

    onSaveAndRerun(editedQuery.trim() || query, updatedReq);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-line bg-paper p-6 shadow-2xl sm:p-8 hide-scrollbar text-ink"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line/60 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-paper">
                  <Sliders className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold leading-tight text-ink">
                    Edit Your Requirements
                  </h2>
                  <p className="text-[11px] text-muted">
                    Adjust criteria & recalculate match scoring in real time
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-muted transition-colors hover:bg-paper-2 hover:text-ink cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* 1. Original Request Text */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-muted mb-1.5">
                  What are you looking for? (Search Prompt)
                </label>
                <textarea
                  value={editedQuery}
                  onChange={(e) => setEditedQuery(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-line bg-paper-2/40 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-ink focus:outline-none"
                  placeholder="Describe what you need in plain words..."
                />
              </div>

              {/* 2. Category Dropdown */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-muted mb-1.5">
                    Product Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-line bg-paper-2/40 px-3.5 py-2.5 text-sm font-medium text-ink focus:border-ink focus:outline-none cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Maximum Budget */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-[0.14em] text-muted">
                      Max Budget (INR)
                    </label>
                    {maxBudget && (
                      <span className="font-mono text-xs font-bold text-accent">
                        {formatINR(Number(maxBudget))}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-sans text-sm font-semibold text-muted">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value ? Number(e.target.value) : "")}
                      placeholder="e.g. 40000"
                      className="w-full rounded-xl border border-line bg-paper-2/40 pl-8 pr-3.5 py-2.5 text-sm text-ink font-medium focus:border-ink focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Priorities Management */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-muted mb-1.5">
                  Priorities (Ranked by Importance)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {priorities.map((p, i) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-accent/30 bg-accent-soft px-2.5 py-1 text-xs font-semibold capitalize text-accent"
                    >
                      <span>#{i + 1} {p}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePriority(i)}
                        className="rounded-full hover:bg-accent/20 p-0.5 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {priorities.length === 0 && (
                    <span className="text-xs text-muted">No priorities set</span>
                  )}
                </div>

                {/* Quick Add Suggestions */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[11px] text-muted mr-1">Add:</span>
                  {POPULAR_PRIORITIES.filter((p) => !priorities.includes(p)).slice(0, 5).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleAddPriority(p)}
                      className="rounded-md border border-line/60 bg-paper-2/50 px-2 py-0.5 text-[11px] capitalize text-muted hover:border-ink hover:text-ink cursor-pointer"
                    >
                      + {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Use Cases Management */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-muted mb-1.5">
                  Use Cases
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {useCases.map((u, i) => (
                    <span
                      key={u}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper-2 px-2.5 py-1 text-xs font-semibold capitalize text-ink"
                    >
                      <span>{u}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUseCase(i)}
                        className="rounded-full hover:bg-ink/10 p-0.5 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {useCases.length === 0 && (
                    <span className="text-xs text-muted">No use cases specified</span>
                  )}
                </div>

                {/* Quick Add Suggestions */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[11px] text-muted mr-1">Add:</span>
                  {POPULAR_USE_CASES.filter((u) => !useCases.includes(u)).slice(0, 5).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleAddUseCase(u)}
                      className="rounded-md border border-line/60 bg-paper-2/50 px-2 py-0.5 text-[11px] capitalize text-muted hover:border-ink hover:text-ink cursor-pointer"
                    >
                      + {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-7 flex items-center justify-end gap-3 border-t border-line/60 pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-line px-5 py-2.5 text-xs sm:text-sm font-semibold text-muted hover:border-ink hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-xs sm:text-sm font-semibold text-paper shadow-md transition-all hover:bg-ink/90 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-accent" />
                  Update & Re-run
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
