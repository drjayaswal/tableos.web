"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { StoreIcon, CancelIcon, CheckIcon, WarningIcon, LocationIcon, PlusIcon, MinusIcon, SaveIcon, Loading } from "@/app/components/icons/svg";
import { useUser } from "@/app/context/UserContext";
import { apiRequest } from "@/app/utility/api";
import { AddressSuggestion, searchAddressSuggestions } from "@/app/utility/geocoding";
import { toast } from "sonner";
import { cn } from "@/app/lib/utils";

interface TimingSlot {
  is_open: boolean;
  open_time: string;
  close_time: string;
}

interface StoreTiming {
  monday: TimingSlot;
  tuesday: TimingSlot;
  wednesday: TimingSlot;
  thursday: TimingSlot;
  friday: TimingSlot;
  saturday: TimingSlot;
  sunday: TimingSlot;
}

interface Store {
  id: string;
  name: string;
  address: string;
  category: string;
  currency: string;
  tables: number;
  slug: string;
  timing?: StoreTiming;
  lat?: number;
  lon?: number;
}

interface ApiResponse {
  status: number;
  message: string;
  data: Store;
}


const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const DAY_LABELS: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed",
  thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun",
};
const CURRENCIES = ["INR", "USD", "EUR"];
const CATEGORIES = ["restaurant", "cafe", "hotel"];

function buildDefaultTiming(): StoreTiming {
  return Object.fromEntries(
    DAYS.map((d) => [d, { is_open: true, open_time: "09:00", close_time: "22:00" }])
  ) as unknown as StoreTiming;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } },
} as const;

function FieldLabel({ label }: { label: string }) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-1.5 uppercase">
      {label}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-gray-200/50 bg-white py-2.5 px-4 text-sm font-bold text-gray-700 placeholder:text-gray-400 focus:shadow-sm focus:border-gray-200 focus:outline-none transition-all";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={itemVariants} className="rounded-lg border h-fit border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <h2 className="text-sm font-bold text-gray-900 tracking-tight">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm animate-pulse space-y-4">
      <div className="h-4 w-24 rounded bg-gray-100" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 w-full rounded-xl bg-gray-100" />
      ))}
    </div>
  );
}

function TimingEditor({ timing, onChange }: { timing: StoreTiming; onChange: (t: StoreTiming) => void }) {
  const update = (day: keyof StoreTiming, field: keyof TimingSlot, value: string | boolean) => {
    onChange({ ...timing, [day]: { ...timing[day], [field]: value } });
  };

  return (
    <div className="space-y-2 overflow-scroll">
      {DAYS.map((day) => {
        const slot = timing[day] ?? { is_open: true, open_time: "09:00", close_time: "22:00" };
        return (
          <div
            key={day}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 transition-colors"
            )}
          >
            <span className="w-8 text-xs font-bold text-gray-500 shrink-0">{DAY_LABELS[day]}</span>
            <div className={cn("flex items-center gap-2 flex-1 transition-opacity", !slot.is_open && "opacity-30")}>
              <input
                type="time"
                value={slot.open_time}
                disabled={!slot.is_open}
                onChange={(e) => update(day, "open_time", e.target.value)}
                className="flex-1 min-w-0 rounded-lg border border-gray-200/50 bg-gray-50 px-2 py-1 text-xs text-black font-bold focus:outline-none focus:border-gray-200 transition-all"
              />
              <span className="text-xs text-gray-200"></span>
              <input
                type="time"
                value={slot.close_time}
                disabled={!slot.is_open}
                onChange={(e) => update(day, "close_time", e.target.value)}
                className="flex-1 min-w-0 rounded-lg border border-gray-200/50 bg-gray-50 px-2 py-1 text-xs text-black font-bold focus:outline-none focus:border-gray-200 transition-all"
              />
            </div>
            <button
              onClick={() => update(day, "is_open", !slot.is_open)}
              className={cn(
                "shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer",
                !slot.is_open
                  ? "bg-pink-500/10 text-pink-500"
                  : "bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white"
              )}
            >
              {slot.is_open ? "Open" : "Closed"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function StorePage() {
  const { storeId } = useUser();
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [form, setForm] = useState({
    name: "",
    address: "",
    category: "restaurant",
    currency: "INR",
    tables: 1,
    lat: undefined as number | undefined,
    lon: undefined as number | undefined,
    timing: buildDefaultTiming(),
  });

  const set = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (!storeId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiRequest<ApiResponse>(`/owner/store/${storeId}`);
        if (res.status !== 200) throw new Error(res.message);
        setStore(res.data);
        setForm({
          name: res.data.name ?? "",
          address: res.data.address ?? "",
          category: res.data.category ?? "restaurant",
          currency: res.data.currency ?? "INR",
          tables: res.data.tables ?? 1,
          lat: res.data.lat,
          lon: res.data.lon,
          timing: res.data.timing ?? buildDefaultTiming(),
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [storeId]);

  const handleAddressChange = (val: string) => {
    set("address", val);
    set("lat", undefined);
    set("lon", undefined);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      const results = await searchAddressSuggestions(val);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 400);
  };

  const handleSelectSuggestion = (s: AddressSuggestion) => {
    setForm((f) => ({ ...f, address: s.display_name, lat: s.lat, lon: s.lon }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSave = async () => {
    if (!storeId) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await apiRequest<ApiResponse>("/owner/update/store", {
        method: "POST",
        body: {
          storeId,
          name: form.name || undefined,
          address: form.address || undefined,
          category: form.category || undefined,
          currency: form.currency || undefined,
          tables: form.tables || undefined,
          lat: form.lat,
          lon: form.lon,
          timing: form.timing,
        },
      });
      if (res.status !== 200) throw new Error(res.message);

      setStore(prev => prev ? { ...prev, name: form.name } : null);
      toast.success("Store settings updated.");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message ?? "Failed to save store.");
      toast.error(err.message ?? "Failed to save store.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full scroll-smooth">
      <div className="relative z-10 mx-auto">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          <motion.div variants={itemVariants} className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="flex items-center justify-center text-black">
                  <StoreIcon className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {loading ? "Store Settings" : store?.name ?? "Store Settings"}
                </h1>
              </div>
              <p className="text-sm text-gray-400 ml-10.5">
                {loading ? "Loading store profile…" : "Manage your establishment's profile & operational settings"}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:self-auto self-start">
              {!loading && store?.slug && (
                <span className="text-[11px] font-bold tracking-tight text-gray-400 px-2.5 py-1.5">
                  /{store.slug}
                </span>
              )}
              <Button variant="tableos" className="font-bold" onClick={handleSave} disabled={saving || loading}>
                {saving ? (
                  <span className="flex items-center gap-1.5">
                    <Loading className="animate-spin" /> Saving…
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <SaveIcon /> Save
                  </span>
                )}
              </Button>
            </div>
          </motion.div>

          <AnimatePresence>
            {(error || success) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className={cn(
                  "mb-5 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-bold",
                  error ? "border-red-100 bg-red-50 text-red-600" : "border-green-100 bg-green-50 text-green-700"
                )}>
                  <span className="flex items-center gap-2">
                    {error ? <WarningIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                    {error ?? "Changes saved successfully."}
                  </span>
                  <button onClick={() => { setError(null); setSuccess(false); }} className="text-current opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                    <CancelIcon className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SkeletonCard rows={3} />
              <SkeletonCard rows={2} />
              <SkeletonCard rows={2} />
              <SkeletonCard rows={7} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              <SectionCard title="Information">
                <div className="space-y-4">
                  <div>
                    <FieldLabel label="Store Name" />
                    <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Chai & Co." className={inputCls} />
                  </div>
                  <div className="space-y-4">
                    <div className="relative">
                      <FieldLabel label="Address" />
                      {form.lat && form.lon && <div className="flex items-center gap-2 absolute top-8.5 right-3">
                        <CheckIcon className="w-4 h-4 text-green-600" />
                      </div>}
                      <input value={form.address} onChange={(e) => handleAddressChange(e.target.value)} onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} placeholder="e.g. 12 MG Road, Jaipur" className={cn(inputCls, form.lat && form.lon && "bg-green-600/5 text-green-600 pr-8")} />
                      <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden">
                            {suggestions.map((s, i) => (
                              <button key={i} onClick={() => handleSelectSuggestion(s)} className="group w-full cursor-pointer text-left flex font-bold items-center gap-3 px-3 sm:px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                <div className="text-black">
                                  <LocationIcon />
                                </div>
                                <div className="min-w-0 font-bold">
                                  <p className="text-sm text-black truncate">{s.display_name.split(",")[0]}</p>
                                  <p className="text-xs text-gray-400 truncate">{s.display_name.split(",").slice(1).join(",").trim()}</p>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="w-full sm:flex-2">
                      <FieldLabel label="Tables" />
                      <div className="flex items-center gap-4">
                        <button onClick={() => set("tables", Math.max(1, form.tables - 1))} className="flex p-2 shrink-0 rounded-xl border border-gray-200/50 bg-white text-gray-600 hover:bg-gray-50 transition-colors text-lg font-bold shadow-sm cursor-pointer">
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-black">{form.tables}</span>
                        <button onClick={() => set("tables", form.tables + 1)} className="flex p-2 shrink-0 rounded-xl border border-gray-200/50 bg-white text-gray-600 hover:bg-gray-50 transition-colors text-lg font-bold shadow-sm cursor-pointer">
                          <PlusIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full sm:flex-3">
                      <FieldLabel label="Category" />
                      <select value={form.category} onChange={(e) => set("category", e.target.value)} className={cn(inputCls, "appearance-none cursor-pointer capitalize font-bold")}>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="w-full sm:flex-3">
                      <FieldLabel label="Currency" />
                      <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className={cn(inputCls, "appearance-none cursor-pointer font-bold")}>
                        {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Operating Hours">
                <TimingEditor
                  timing={Object.keys(form.timing).length ? form.timing : buildDefaultTiming()}
                  onChange={(t) => set("timing", t)}
                />
              </SectionCard>

            </div>
          )}

          {!loading && (
            <motion.div variants={itemVariants} className="mt-6 sm:hidden">
              <Button
                variant="tableos"
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <Loading className="animate-spin" /> Saving…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <SaveIcon /> Save Changes
                  </span>
                )}
              </Button>
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  );
}