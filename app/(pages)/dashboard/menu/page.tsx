"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/button";
import {
    CancelIcon, MenuIcon, SearchIcon, WarningIcon, PlusIcon,
    Loading,
} from "@/app/components/icons/svg";
import { useUser } from "@/app/context/UserContext";
import { apiRequest } from "@/app/utility/api";
import { toast } from "sonner";
import { cn } from "@/app/lib/utils";

type DietaryType = "veg" | "non-veg" | "vegan" | "jain";
type CategoryKey =
    | "beverages" | "coffee_tea" | "alcohol" | "appetizers" | "soups"
    | "salads" | "small_plates" | "sandwiches" | "entrees" | "mains_land"
    | "mains_sea" | "pasta_pizza" | "sides" | "sauces_dips" | "desserts"
    | "pastries" | "kids_menu" | "specials" | "others";

interface MenuItem {
    id: string;
    storeId: string;
    category: CategoryKey;
    itemName: string;
    itemDescription: string | null;
    basePrice: string;
    offerPrice: string | null;
    dietaryType: DietaryType;
    preparationTime: string | null;
    isAvailable: boolean;
    updatedAt: string;
}

interface ApiResponse {
    status: number;
    message: string;
    data: {
        items?: MenuItem[];
        grouped?: Record<CategoryKey, MenuItem[]>;
        itemId?: string;
    };
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<CategoryKey, string> = {
    beverages: "Beverages", coffee_tea: "Coffee & Tea", alcohol: "Alcohol",
    appetizers: "Appetizers", soups: "Soups", salads: "Salads",
    small_plates: "Small Plates", sandwiches: "Sandwiches", entrees: "Entrées",
    mains_land: "Mains (Land)", mains_sea: "Mains (Sea)", pasta_pizza: "Pasta & Pizza",
    sides: "Sides", sauces_dips: "Sauces & Dips", desserts: "Desserts",
    pastries: "Pastries", kids_menu: "Kids Menu", specials: "Specials", others: "Others",
};
const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS) as CategoryKey[];

const DIETARY_COLORS: Record<DietaryType, string> = {
    veg: "text-emerald-600 bg-emerald-500/10",
    "non-veg": "text-red-600 bg-red-500/10",
    vegan: "text-green-600 bg-green-500/10",
    jain: "text-amber-600 bg-amber-500/10",
};

// ─── Motion variants (mirrors employee/store pages) ───────────────────────────
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 300 } },
} as const;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const EditIcon = () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M8.5 1.5l3 3L4 12H1v-3L8.5 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
);
const TrashIcon = () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M2 3.5h9M5 3.5V2h3v1.5M3.5 3.5l.7 7h4.6l.7-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const ChevronIcon = ({ open }: { open: boolean }) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={cn("transition-transform duration-200", open && "rotate-180")}>
        <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ─── Dietary Badge ────────────────────────────────────────────────────────────
function DietaryBadge({ type }: { type: DietaryType }) {
    return (
        <span className={cn("text-[8px] flex items-center gap-1 font-bold uppercase px-1.5 py-0.5 rounded-sm tracking-wider", DIETARY_COLORS[type])}>
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            {type}
        </span>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm animate-pulse">
            <div className="flex justify-between mb-3">
                <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-16 rounded bg-gray-100" />
                    <div className="h-4 w-32 rounded bg-gray-100" />
                    <div className="h-3 w-24 rounded bg-gray-100" />
                </div>
                <div className="h-5 w-12 rounded bg-gray-100" />
            </div>
            <div className="h-px bg-gray-50 my-3" />
            <div className="flex justify-between">
                <div className="flex gap-2">
                    <div className="h-3 w-8 rounded bg-gray-100" />
                    <div className="h-3 w-10 rounded bg-gray-100" />
                </div>
                <div className="h-5 w-16 rounded-full bg-gray-100" />
            </div>
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrepTime = (secondsStr: string | null) => {
    if (!secondsStr) return "";
    const totalSeconds = parseInt(secondsStr);
    if (isNaN(totalSeconds) || totalSeconds <= 0) return secondsStr; // fallback if it's already a string like "10 mins"

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.length > 0 ? parts.join(" ") : "";
};

// ─── Menu Item Card ───────────────────────────────────────────────────────────
function MenuItemCard({
    item, onEdit, onDelete, onToggle,
}: {
    item: MenuItem;
    onEdit: (item: MenuItem) => void;
    onDelete: (id: string) => void;
    onToggle: (item: MenuItem) => void;
}) {
    return (
        <motion.div
            layout
            className={cn(
                "group relative rounded-xl border-2 bg-white py-3 px-4 sm:py-4 sm:px-5 transition-all duration-200",
                !item.isAvailable ? "opacity-60 border-transparent" : "border-gray-200/75"
            )}
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                        <DietaryBadge type={item.dietaryType} />
                        {item.preparationTime && (
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-200/50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                {formatPrepTime(item.preparationTime)}
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-md text-gray-900 truncate">{item.itemName}</h3>
                    {item.itemDescription && (
                        <p className="text-sm text-gray-400 font-bold mt-0.5">{item.itemDescription}</p>
                    )}
                </div>
                <div className="text-right shrink-0">
                    <p className="font-bold text-lg text-green-600">₹{item.offerPrice === null ? item.basePrice : item.offerPrice}</p>
                    {item.offerPrice !== null && (
                        <p className="text-xs text-gray-400 line-through font-bold">
                            ₹{item.basePrice}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between pt-3">
                <div className="flex gap-3">
                    <button
                        onClick={() => onEdit(item)}
                        className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-gray-400 hover:text-green-600 transition-colors"
                    >
                        <EditIcon /> Edit
                    </button>
                    <button
                        onClick={() => onDelete(item.id)}
                        className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-gray-400 hover:text-pink-500 transition-colors"
                    >
                        <TrashIcon /> Delete
                    </button>
                </div>
                <button
                    className={cn(
                        "text-[9px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full transition-all",
                        item.isAvailable
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-pink-500/10 text-pink-500"
                    )}
                >
                    {item.isAvailable ? "Available" : "Sold Out"}
                </button>
            </div>
        </motion.div>
    );
}

function CategorySection({
    category, items, onEdit, onDelete, onToggle,
}: {
    category: CategoryKey;
    items: MenuItem[];
    onEdit: (item: MenuItem) => void;
    onDelete: (id: string) => void;
    onToggle: (item: MenuItem) => void;
}) {
    const [open, setOpen] = useState(true);

    return (
        <motion.section variants={itemVariants} className="space-y-2">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 w-full px-1 group"
            >
                <h2 className="text-[14px] font-bold text-gray-400 group-hover:text-gray-600 transition-colors">
                    {CATEGORY_LABELS[category]}
                </h2>
                <span className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors">
                    <ChevronIcon open={open} />
                </span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                            {items.map((item) => (
                                <MenuItemCard
                                    key={item.id}
                                    item={item}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onToggle={onToggle}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.section>
    );
}

function ItemModal({
    editing, categories, storeId, onClose, onSuccess,
}: {
    editing: MenuItem | null;
    categories: CategoryKey[];
    storeId: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [form, setForm] = useState({
        itemName: editing?.itemName ?? "",
        itemDescription: editing?.itemDescription ?? "",
        basePrice: editing?.basePrice ?? "",
        offerPrice: editing?.offerPrice ?? "",
        category: editing?.category ?? (categories[0] ?? "others"),
        dietaryType: editing?.dietaryType ?? ("veg" as DietaryType),
        preparationTime: editing?.preparationTime ?? "",
        isAvailable: editing?.isAvailable ?? true,
        prepHours: editing?.preparationTime ? Math.floor(Number(editing.preparationTime) / 3600).toString() : "",
        prepMinutes: editing?.preparationTime ? Math.floor((Number(editing.preparationTime) % 3600) / 60).toString() : "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setField = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
        setForm((f) => ({ ...f, [k]: v }));

    const save = async () => {
        setError(null);
        if (!form.itemName.trim()) return setError("Item name is required.");
        if (!form.basePrice || isNaN(Number(form.basePrice))) return setError("Valid base price is required.");

        // Sync final preparation time before saving
        const h = parseInt(form.prepHours) || 0;
        const m = parseInt(form.prepMinutes) || 0;
        const totalSeconds = (h * 3600) + (m * 60);

        setLoading(true);
        try {
            const isEdit = !!editing;
            const endpoint = "/owner/menu/item";
            const method = isEdit ? "PATCH" : "POST";
            const body = isEdit
                ? {
                    itemId: editing!.id,
                    category: form.category,
                    itemName: form.itemName,
                    itemDescription: form.itemDescription || undefined,
                    basePrice: form.basePrice,
                    offerPrice: form.offerPrice || undefined,
                    dietaryType: form.dietaryType,
                    preparationTime: totalSeconds > 0 ? totalSeconds.toString() : undefined,
                    isAvailable: form.isAvailable,
                }
                : {
                    storeId,
                    category: form.category,
                    itemName: form.itemName,
                    itemDescription: form.itemDescription || undefined,
                    basePrice: form.basePrice,
                    offerPrice: form.offerPrice || undefined,
                    dietaryType: form.dietaryType,
                    preparationTime: totalSeconds > 0 ? totalSeconds.toString() : undefined,
                    isAvailable: form.isAvailable,
                };

            const res = await apiRequest<ApiResponse>(endpoint, { method, body });
            if (res.status !== 200) throw new Error(res.message);

            toast(isEdit ? "Item updated" : "Item created");
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message ?? "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleTimeChange = (type: 'hours' | 'minutes', value: string) => {
        const val = value.replace(/[^0-9]/g, ''); // Ensure only digits
        if (type === 'hours') {
            setForm(f => {
                const total = (parseInt(val || "0") * 3600) + (parseInt(f.prepMinutes || "0") * 60);
                return { ...f, prepHours: val, preparationTime: total.toString() };
            });
        } else {
            // Cap minutes at 59 for sanity, though not strictly required
            const numericMin = Math.min(59, parseInt(val || "0"));
            const finalMin = val === "" ? "" : numericMin.toString();
            setForm(f => {
                const total = (parseInt(f.prepHours || "0") * 3600) + (parseInt(finalMin || "0") * 60);
                return { ...f, prepMinutes: finalMin, preparationTime: total.toString() };
            });
        }
    };
    const inputCls = "w-full rounded-xl border font-bold border-gray-200/50 bg-white py-2.5 px-4 text-sm text-gray-700 placeholder:text-gray-400 focus:shadow-sm focus:border-gray-200 focus:outline-none transition-all";
    const labelCls = "block text-xs font-bold text-gray-500 mb-1.5 uppercase";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/35 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="relative w-full max-w-md mx-auto rounded-2xl bg-white shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="flex items-center justify-between border-b border-gray-100 px-5 sm:px-6 py-4 sm:py-5 shrink-0">
                    <div>
                        <h2 className="text-[15px] font-bold text-gray-900 tracking-tight">
                            {editing ? "Update Menu Item" : "Add Menu Item"}
                        </h2>
                        <p className="mt-0.5 text-xs text-gray-500">
                            {editing ? "Edit item details" : "Add a new item to your menu"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center cursor-pointer rounded-xl text-gray-400 hover:bg-pink-500/10 hover:text-pink-500 transition-colors"
                    >
                        <CancelIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="px-5 sm:px-6 py-5 space-y-4 overflow-y-auto overscroll-contain">
                    <div>
                        <label className={labelCls}>Item Name *</label>
                        <input
                            type="text"
                            value={form.itemName}
                            onChange={(e) => setField("itemName", e.target.value)}
                            placeholder="e.g. Masala Chai"
                            className={inputCls}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Category</label>
                            <select
                                value={form.category}
                                onChange={(e) => setField("category", e.target.value as CategoryKey)}
                                className={cn(inputCls, "appearance-none cursor-pointer")}
                            >
                                {CATEGORY_KEYS.map((k) => (
                                    <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Dietary Type</label>
                            <select
                                value={form.dietaryType}
                                onChange={(e) => setField("dietaryType", e.target.value as DietaryType)}
                                className={cn(inputCls, "appearance-none cursor-pointer")}
                            >
                                {["veg", "non-veg", "vegan", "jain"].map((t) => (
                                    <option key={t} value={t}>{t.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelCls}>Base Price (₹) *</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.basePrice}
                                onChange={(e) => setField("basePrice", e.target.value)}
                                placeholder="0.00"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Offer Price (₹)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.offerPrice}
                                onChange={(e) => setField("offerPrice", e.target.value)}
                                placeholder="Optional"
                                className={inputCls}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Preparation Time (Hours & Minutes)</label>
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    min="0"
                                    value={form.prepHours}
                                    onChange={(e) => handleTimeChange('hours', e.target.value)}
                                    placeholder="0"
                                    className={cn(inputCls, "pr-8")}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 pointer-events-none uppercase">H</span>
                            </div>
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={form.prepMinutes}
                                    onChange={(e) => handleTimeChange('minutes', e.target.value)}
                                    placeholder="0"
                                    className={cn(inputCls, "pr-8")}
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 pointer-events-none uppercase">M</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Description</label>
                        <textarea
                            value={form.itemDescription}
                            onChange={(e) => setField("itemDescription", e.target.value)}
                            placeholder="Short description of the item…"
                            rows={2}
                            className={cn(inputCls, "resize-none")}
                        />
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-gray-200/50 bg-white py-2.5 px-4">
                        <div>
                            <p className="text-sm font-bold text-gray-700">Available Now</p>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">Show this item to customers</p>
                        </div>
                        <button
                            onClick={() => setField("isAvailable", !form.isAvailable)}
                            className={cn(
                                "relative h-6 w-11 cursor-pointer rounded-full border transition-all duration-200 shrink-0",
                                form.isAvailable ? "bg-green-600 border-green-600" : "bg-pink-500 border-pink-500"
                            )}
                        >
                            <span className={cn(
                                "absolute top-0.75 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200",
                                form.isAvailable ? "left-[22px]" : "left-1"
                            )} />
                        </button>
                    </div>

                    {error && (
                        <div className="rounded-xl flex items-center gap-2 font-bold bg-red-50 px-4 py-3 text-xs text-red-600">
                            <WarningIcon className="w-4 h-4 shrink-0" />{error}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
                    <Button
                        variant="tableos"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-500 shadow-none! border-0! hover:bg-pink-500/10! hover:text-pink-500!"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="tableos"
                        size="sm"
                        onClick={save}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-1.5">
                                <Loading className="w-4 h-4 animate-spin" />
                                {editing ? "Updating…" : "Creating…"}
                            </span>
                        ) : editing ? "Update" : "Create"}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}


function DeleteModal({
    itemName, onConfirm, onClose, loading,
}: {
    itemName: string;
    onConfirm: () => void;
    onClose: () => void;
    loading: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/35 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl z-10 p-6"
            >
                <div className="flex items-start gap-3 mb-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-pink-500">
                        <TrashIcon />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">Remove Item</h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            <span className="font-bold text-gray-700">{itemName}</span> will be removed from your menu. This can't be undone.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <Button variant="tableos" size="sm" onClick={onClose} className="text-gray-500 shadow-none! border-0!">
                        Cancel
                    </Button>
                    <Button
                        variant="tableos" size="sm" onClick={onConfirm} disabled={loading}
                        className="bg-pink-500! text-white! border-pink-500! hover:bg-red-600!"
                    >
                        {loading ? <span className="flex items-center gap-1.5"><Loading />Deleting…</span> : "Delete"}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

export default function MenuPage() {
    const { storeId } = useUser();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterCat, setFilterCat] = useState<CategoryKey | "all">("all");

    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [showItemModal, setShowItemModal] = useState(false);
    const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        if (showItemModal || !!deletingItem) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [showItemModal, deletingItem]);

    // ── Fetch ────────────────────────────────────────────────────────────────
    const fetchMenu = async () => {
        if (!storeId) return;
        setLoading(true);
        try {
            const res = await apiRequest<ApiResponse>(`/owner/menu/list?storeId=${storeId}`);
            if (res.status === 200) setItems(res.data.items ?? []);
            else toast(res.message);
        } catch {
            toast("Failed to load menu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMenu(); }, [storeId]);

    // ── Derived data ─────────────────────────────────────────────────────────
    const usedCategories = useMemo<CategoryKey[]>(() => {
        const set = new Set(items.map((i) => i.category));
        return CATEGORY_KEYS.filter((k) => set.has(k));
    }, [items]);

    const filtered = useMemo(() => {
        return items.filter((i) => {
            const matchSearch =
                i.itemName.toLowerCase().includes(search.toLowerCase()) ||
                (i.itemDescription ?? "").toLowerCase().includes(search.toLowerCase());
            const matchCat = filterCat === "all" || i.category === filterCat;
            return matchSearch && matchCat;
        });
    }, [items, search, filterCat]);

    const grouped = useMemo(() => {
        const g: Partial<Record<CategoryKey, MenuItem[]>> = {};
        for (const item of filtered) {
            if (!g[item.category]) g[item.category] = [];
            g[item.category]!.push(item);
        }
        return g;
    }, [filtered]);

    // ── Actions ──────────────────────────────────────────────────────────────
    const handleToggle = async (item: MenuItem) => {
        try {
            const res = await apiRequest<ApiResponse>("/owner/menu/item", {
                method: "PATCH",
                body: { itemId: item.id, isAvailable: !item.isAvailable },
            });
            if (res.status === 200) {
                setItems((prev) =>
                    prev.map((i) => i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i)
                );
                toast(`${item.itemName} marked as ${!item.isAvailable ? "available" : "sold out"}`);
            } else throw new Error(res.message);
        } catch (err: any) {
            toast(err.message ?? "Failed to update");
        }
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        setDeleteLoading(true);
        try {
            const res = await apiRequest<ApiResponse>(`/owner/menu/item/${deletingItem.id}`, { method: "DELETE" });
            if (res.status === 200) {
                setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
                toast("Item removed");
                setDeletingItem(null);
            } else throw new Error(res.message);
        } catch (err: any) {
            toast(err.message ?? "Failed to delete");
        } finally {
            setDeleteLoading(false);
        }
    };

    const openCreate = () => { setEditingItem(null); setShowItemModal(true); };
    const openEdit = (item: MenuItem) => { setEditingItem(item); setShowItemModal(true); };

    // ── Stats ────────────────────────────────────────────────────────────────
    const totalAvailable = items.filter((i) => i.isAvailable).length;

    return (
        <div className="h-full scroll-smooth">
            <motion.div initial="hidden" animate="visible" variants={containerVariants} className="pb-10">

                <motion.div variants={itemVariants} className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <MenuIcon className="w-6 h-6 text-black" />
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Menu</h1>
                        </div>
                        <p className="text-sm text-gray-400 ml-8.5">
                            {loading
                                ? "Loading catalog…"
                                : `${totalAvailable} available · ${items.length - totalAvailable} sold out · ${usedCategories.length} categories`}
                        </p>
                    </div>
                    <Button variant="tableos" onClick={openCreate} className="sm:self-auto self-start">
                        <PlusIcon className="w-4 h-4" /> Add Item
                    </Button>
                </motion.div>

                <motion.div variants={itemVariants} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1 max-w-sm">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search items…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-gray-200/50 bg-white py-2.5 pl-9 pr-4 text-sm font-bold text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-gray-300 focus:shadow-sm transition-all"
                        />
                    </div>

                </motion.div>
                <motion.div variants={itemVariants} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">

                    {usedCategories.length > 0 && (
                        <div className="flex gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar">
                            <button
                                onClick={() => setFilterCat("all")}
                                className={cn(
                                    "shrink-0 bg-white border border-transparent text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-xl cursor-pointer transition-all",
                                    filterCat === "all"
                                    && " text-black border-gray-200 shadow-sm"
                                )}
                            >
                                All
                            </button>
                            {usedCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCat(cat === filterCat ? "all" : cat)}
                                    className={cn(
                                        "shrink-0 text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full border cursor-pointer transition-all",
                                        filterCat === cat
                                            ? "text-gray-900 border-gray-200 shadow-sm"
                                            : "text-gray-400 border-transparent"
                                    )}
                                >
                                    {CATEGORY_LABELS[cat]}
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>

                <div className="space-y-8">
                    {loading ? (
                        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
                        </motion.div>
                    ) : items.length === 0 ? (
                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col items-center justify-center h-[69vh] text-center rounded-2xl border border-dashed border-gray-200 bg-white"
                        >
                            <MenuIcon className="w-10 h-10 text-gray-200 mb-4" />
                            <p className="text-sm font-bold text-gray-400">Your menu is empty</p>
                            <p className="text-xs text-gray-300 mt-1">Add your first item to get started</p>
                            <div className="mt-5">
                                <Button variant="tableos" size="sm" onClick={openCreate}>
                                    <PlusIcon className="w-4 h-4" /> Add First Item
                                </Button>
                            </div>
                        </motion.div>
                    ) : filtered.length === 0 ? (
                        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-16 text-center">
                            <p className="text-sm font-bold text-gray-400">No items match your search</p>
                            <p className="text-xs text-gray-300 mt-1">Try a different keyword or category</p>
                        </motion.div>
                    ) : (
                        (Object.keys(grouped) as CategoryKey[]).map((cat) => (
                            <CategorySection
                                key={cat}
                                category={cat}
                                items={grouped[cat]!}
                                onEdit={openEdit}
                                onDelete={(id) => {
                                    const item = items.find((i) => i.id === id);
                                    if (item) setDeletingItem(item);
                                }}
                                onToggle={handleToggle}
                            />
                        ))
                    )}
                </div>

            </motion.div>

            <AnimatePresence>
                {showItemModal && (
                    <ItemModal
                        editing={editingItem}
                        categories={CATEGORY_KEYS}
                        storeId={storeId!}
                        onClose={() => { setShowItemModal(false); setEditingItem(null); }}
                        onSuccess={fetchMenu}
                    />
                )}
                {deletingItem && (
                    <DeleteModal
                        itemName={deletingItem.itemName}
                        onConfirm={handleDelete}
                        onClose={() => setDeletingItem(null)}
                        loading={deleteLoading}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}