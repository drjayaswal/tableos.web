"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/lib/utils";
type SortOption = "default" | "price_asc" | "price_desc" | "alpha" | "discount";
const SORT_OPTIONS = [
  { id: "default",    label: "Default" },
  { id: "alpha",      label: "A → Z" },
  { id: "price_asc",  label: "Price: low to high" },
  { id: "price_desc", label: "Price: high to low" },
  { id: "discount",   label: "Highest discount" },
] as const;
type DietaryType = "veg" | "non-veg" | "vegan" | "jain";
const DIETARY_OPTIONS: { key: DietaryType; label: string; color: string }[] = [
  { key: "veg",     label: "Veg",     color: "#16a34a" },
  { key: "non-veg", label: "Non-veg", color: "#dc2626" },
  { key: "vegan",   label: "Vegan",   color: "#15803d" },
  { key: "jain",    label: "Jain",    color: "#b45309" },
];

const DEFAULT_FILTERS = {
  dietary: [] as DietaryType[],
  maxPrepTime: null as number | null,
  maxPrice: null as number | null,
  minDiscount: null as number | null,
  sortBy: "default" as SortOption,
};
export function FilterDrawer({
  onClose,
  filters,
  setFilters,
  maxAvailablePrice,
  maxAvailablePrepTime,
}: {
  onClose: () => void;
  filters: typeof DEFAULT_FILTERS;
  setFilters: (f: typeof DEFAULT_FILTERS) => void;
  maxAvailablePrice: number;
  maxAvailablePrepTime: number;
}) {
  const activeCount = [
    filters.sortBy !== "default",
    filters.dietary.length > 0,
    filters.maxPrice !== null && filters.maxPrice < maxAvailablePrice,
    filters.maxPrepTime !== null && filters.maxPrepTime < maxAvailablePrepTime,
    filters.minDiscount !== null && filters.minDiscount > 0,
  ].filter(Boolean).length;

  const toggleDiet = (type: DietaryType) => {
    const next = filters.dietary.includes(type)
      ? filters.dietary.filter((t) => t !== type)
      : [...filters.dietary, type];
    setFilters({ ...filters, dietary: next });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-1000 bg-black/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 bottom-0 z-1001 w-full max-w-[300px] sm:max-w-[300px] bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-base font-bold text-black flex items-center gap-1.5">
              Filter &amp; Sort
              {activeCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] font-bold grid place-items-center leading-none">
                  {activeCount}
                </span>
              )}
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              {activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? "s" : ""} active` : "Refine your results"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 cursor-pointer text-gray-400 hover:text-black transition-colors"
          >
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-6">

          {/* Sort */}
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
              Sort by
            </h3>
            {SORT_OPTIONS.map((opt) => {
              const active = filters.sortBy === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setFilters({ ...filters, sortBy: opt.id })}
                  className={cn(
                    "w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-md text-[11px] font-bold uppercase tracking-tight transition-all cursor-pointer",
                    active ? "text-green-600 bg-green-600/10" : "text-gray-500 hover:bg-gray-50 hover:text-black"
                  )}
                >
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full bg-green-600 shrink-0 transition-opacity",
                    active ? "opacity-100" : "opacity-0"
                  )} />
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Dietary */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">
              Dietary
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {DIETARY_OPTIONS.map(({ key, label, color }) => {
                const active = filters.dietary.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleDiet(key)}
                    className={cn(
                      "flex items-center gap-2 px-2.5 py-2 rounded-md text-[11px] font-bold uppercase tracking-tight transition-all cursor-pointer",
                      active
                        ? "bg-gray-600/10 text-black"
                        : "bg-white text-gray-500 hover:text-black"
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                Price limit
              </h3>
              <span className="text-[11px] font-bold text-black">
                Under ₹{filters.maxPrice ?? maxAvailablePrice}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={maxAvailablePrice}
              step="50"
              value={filters.maxPrice ?? maxAvailablePrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
              className="w-full h-px rounded-full accent-green-600 cursor-pointer bg-gray-200 appearance-none"
            />
          </div>

          {/* Prep Time */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                Prep time
              </h3>
              <span className="text-[11px] font-bold text-black">
                Within {Math.floor((filters.maxPrepTime ?? maxAvailablePrepTime) / 60)} min
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={maxAvailablePrepTime}
              step="60"
              value={filters.maxPrepTime ?? maxAvailablePrepTime}
              onChange={(e) => setFilters({ ...filters, maxPrepTime: parseInt(e.target.value) })}
              className="w-full h-0.5 rounded-full accent-green-600 cursor-pointer bg-gray-200 appearance-none"
            />
          </div>

          {/* Min Discount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                Min. discount
              </h3>
              <span className="text-[11px] font-bold text-black">
                {filters.minDiscount ?? 0}% or more
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              step="5"
              value={filters.minDiscount ?? 0}
              onChange={(e) => setFilters({ ...filters, minDiscount: parseInt(e.target.value) })}
              className="w-full h-0.5 rounded-full accent-green-600 cursor-pointer bg-gray-200 appearance-none"
            />
          </div>

        </div>

        {/* ── Footer — identical structure to NotificationsDrawer ── */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-2 shrink-0">
          <button
            onClick={() => { setFilters(DEFAULT_FILTERS); onClose(); }}
            className="h-9 px-4 rounded-md border border-gray-200 text-[12px] font-bold text-gray-500 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-md bg-black text-white text-[12px] font-bold transition-all active:scale-95 hover:opacity-85 cursor-pointer"
          >
            Apply
          </button>
        </div>
      </motion.div>
    </>
  );
}