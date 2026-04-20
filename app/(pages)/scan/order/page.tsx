"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useTransform, useMotionValue } from "framer-motion";
import { toast } from "sonner";
import { apiRequest } from "@/app/utility/api";
import { CheckIcon, ErrorIcon, Loading, MenuIcon, PlusIcon, WarningIcon } from "@/app/components/icons/svg";
import ProfessionalBill from "@/app/components/ProfessionalBill";
import { Button } from "@/app/components/ui/button";
import Image from "next/image";
import { Variants } from "framer-motion";
import { cn } from "@/app/lib/utils";
import { useSocket } from "@/app/hooks/useSocket";
import { generateUPILink } from "@/app/utility/upi";
import { QRCodeSVG } from "qrcode.react";
import { NotificationProvider, useNotify } from "@/app/components/Notifcation";

type DietaryType = "veg" | "non-veg" | "vegan" | "jain";
type CategoryKey =
    | "all" | "beverages" | "coffee_tea" | "alcohol" | "appetizers" | "soups"
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
}

interface CartItem extends MenuItem {
    quantity: number;
}

interface MenuApiResponse {
    status: number;
    message: string;
    data: {
        items?: MenuItem[];
        upiId?: string;
        storeName?: string;
    };
}

const CATEGORY_LABELS: Record<CategoryKey, string> = {
    all: "All",
    beverages: "Beverages", coffee_tea: "Coffee & Tea", alcohol: "Alcohol",
    appetizers: "Appetizers", soups: "Soups", salads: "Salads",
    small_plates: "Small Plates", sandwiches: "Sandwiches", entrees: "Entrées",
    mains_land: "Mains", mains_sea: "From the Sea", pasta_pizza: "Pasta & Pizza",
    sides: "Sides", sauces_dips: "Sauces & Dips", desserts: "Desserts",
    pastries: "Pastries", kids_menu: "Kids", specials: "Chef's Specials", others: "More",
};

const DIETARY_CONFIG: Record<DietaryType, { border: string; bg: string; text: string; dot: string; label: string }> = {
    veg: { border: "#bbf7d0", bg: "#f0fdf4", text: "#16a34a", dot: "#22c55e", label: "Veg" },
    "non-veg": { border: "#fecaca", bg: "#fef2f2", text: "#dc2626", dot: "#ef4444", label: "Non-Veg" },
    vegan: { border: "#bbf7d0", bg: "#f0fdf4", text: "#15803d", dot: "#16a34a", label: "Vegan" },
    jain: { border: "#fde68a", bg: "#fffbeb", text: "#d97706", dot: "#f59e0b", label: "Jain" },
};

const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 24, stiffness: 200 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
} as const;

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.05, type: "spring", damping: 24, stiffness: 200 },
    }),
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
} as const;

const staggerItem = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 25, stiffness: 220 } },
} as const;

const MinusIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);
const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);
const XIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
const BagIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 7C16 6.07003 16 5.60504 15.8978 5.22354C15.6204 4.18827 14.8117 3.37962 13.7765 3.10222C13.395 3 12.93 3 12 3C11.07 3 10.605 3 10.2235 3.10222C9.18827 3.37962 8.37962 4.18827 8.10222 5.22354C8 5.60504 8 6.07003 8 7M5.2 21H18.8C19.9201 21 20.4802 21 20.908 20.782C21.2843 20.5903 21.5903 20.2843 21.782 19.908C22 19.4802 22 18.9201 22 17.8V10.2C22 9.07989 22 8.51984 21.782 8.09202C21.5903 7.71569 21.2843 7.40973 20.908 7.21799C20.4802 7 19.9201 7 18.8 7H5.2C4.07989 7 3.51984 7 3.09202 7.21799C2.71569 7.40973 2.40973 7.71569 2.21799 8.09202C2 8.51984 2 9.07989 2 10.2V17.8C2 18.9201 2 19.4802 2.21799 19.908C2.40973 20.2843 2.71569 20.5903 3.09202 20.782C3.51984 21 4.0799 21 5.2 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const ChevronRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

function DietBadge({ type }: { type: DietaryType }) {
    const c = DIETARY_CONFIG[type];
    return (
        <span
            className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md border"
            style={{ background: c.bg, borderColor: c.border, color: c.text }}
        >
            <span className="w-1.5 h-1.5 rounded-xl shrink-0 shadow-sm" style={{ background: c.dot }} />
            {c.label}
        </span>
    );
}

function Stepper({ qty, onAdd, onRemove }: { qty: number; onAdd: () => void; onRemove: () => void }) {
    return (
        <div className="flex items-center gap-1.5 bg-gray-200/50 border border-gray-200 p-1 rounded-3xl shadow-inner">
            <button
                onClick={onRemove}
                className="w-8 h-8 rounded-2xl bg-white text-gray-700 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all duration-150 active:scale-95 cursor-pointer"
            >
                <MinusIcon />
            </button>
            <div className="w-6 text-center text-[15px] font-bold text-gray-900 tabular-nums relative h-6 overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                        key={qty}
                        initial={{ opacity: 0, y: -15, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.8 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300, duration: 0.15 }}
                        className="absolute"
                    >
                        {qty}
                    </motion.span>
                </AnimatePresence>
            </div>
            <button
                onClick={onAdd}
                className="w-8 h-8 rounded-2xl bg-green-500 text-white shadow-sm flex items-center justify-center hover:bg-green-600 transition-all duration-150 active:scale-95 cursor-pointer"
            >
                <PlusIcon />
            </button>
        </div>
    );
}

function MenuCard({ item, qty, onAdd, onRemove }: {
    item: MenuItem; qty: number; onAdd: () => void; onRemove: () => void;
}) {
    const bPrice = Number(item.basePrice);
    const oPrice = Number(item.offerPrice);

    const isDiscounted = !!oPrice && bPrice > oPrice;
    const isSurged = !!oPrice && oPrice > bPrice;

    return (
        <motion.div
            variants={staggerItem}
            className={`group relative flex flex-row items-start gap-3 p-3 sm:p-5 mb-3 border border-gray-100 bg-white transition-all duration-300 ${!item.isAvailable
                ? "shadow-xs opacity-60 grayscale select-none"
                : "hover:shadow-sm hover:shadow-black/15 hover:border-gray-200 sm:border-gray-100 border-gray-200 rounded-xl sm:rounded-2xl"
                }`}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <DietBadge type={item.dietaryType} />
                    {isDiscounted && (
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase sm:hidden">Offer</span>
                    )}
                    {isSurged && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase sm:hidden">High Demand</span>
                    )}
                </div>

                <h3 className={`text-base sm:text-[17px] font-bold leading-tight mb-1 truncate ${!item.isAvailable ? "text-gray-400" : "text-black"}`}>
                    {item.itemName}
                </h3>

                {item.itemDescription && (
                    <p className={`text-[12px] sm:text-[13px] leading-snug mb-3 line-clamp-2 pr-1 ${!item.isAvailable ? "text-gray-400" : "text-gray-600"}`}>
                        {item.itemDescription}
                    </p>
                )}

                <div className="flex items-center flex-wrap gap-2 mb-2">
                    {isDiscounted ? (
                        <>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-base sm:text-[17px] font-bold text-emerald-600">₹{oPrice}</span>
                                <span className="text-[11px] text-gray-400 line-through font-bold">₹{bPrice}</span>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase">
                                {Math.round(((bPrice - oPrice) / bPrice) * 100)}% OFF
                            </span>
                        </>
                    ) : isSurged ? (
                        <>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-base sm:text-[17px] font-bold text-rose-600">₹{oPrice}</span>
                                <span className="text-[11px] text-gray-400 font-bold line-through">₹{bPrice}</span>
                            </div>
                            <span className="flex items-center gap-1 font-bold text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 uppercase">
                                {Math.round(((oPrice - bPrice) / bPrice) * 100)}% Extra
                            </span>
                        </>
                    ) : (
                        <span className="text-base sm:text-[17px] font-bold text-gray-900">₹{bPrice}</span>
                    )}
                </div>

                {item.preparationTime && (
                    <div className="text-[10px] sm:text-[11px] text-gray-400 flex items-center gap-1.5 font-bold bg-gray-50 border border-gray-100 w-fit px-2 py-0.5 rounded-md uppercase tracking-tight">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        <span className="truncate">
                            {item.isAvailable ? (() => {
                                const prepSeconds = Number(item.preparationTime);
                                const range = 300;
                                const now = new Date().getTime();
                                const format = { hour: '2-digit', minute: '2-digit' } as const;
                                const t1 = new Date(now + (prepSeconds - range) * 1000).toLocaleTimeString([], format);
                                const t2 = new Date(now + (prepSeconds + range) * 1000).toLocaleTimeString([], format);
                                return `Ready By ${t1} - ${t2}`;
                            })() : "Sold Out"}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col items-end justify-center self-center sm:self-start">
                {item.isAvailable ? (
                    <div className="min-w-[80px] flex justify-end">
                        {qty === 0 ? (
                            <Button
                                variant="tableos"
                                onClick={onAdd}
                                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm h-auto"
                            >
                                <PlusIcon size={16} />
                                <span className="">Add</span>
                            </Button>
                        ) : (
                            <Stepper qty={qty} onAdd={onAdd} onRemove={onRemove} />
                        )}
                    </div>
                ) : (
                    <span className="text-[10px] font-bold text-gray-400 uppercase border border-gray-200 px-2 py-1 rounded">
                        Unavailable
                    </span>
                )}
            </div>
        </motion.div>
    );
}

function CartSheet({ cart, onAdd, setCart, onRemove, onClose, onPlaceOrder, onPlaceOrderDirect, placing }: {
    cart: CartItem[];
    onAdd: (item: MenuItem) => void;
    onRemove: (id: string) => void;
    onClose: () => void;
    onPlaceOrder: () => void;
    setCart: (cart: CartItem[]) => void;
    onPlaceOrderDirect: () => void;
    placing: boolean;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [maxSwipe, setMaxSwipe] = useState(0);
    const x = useMotionValue(0);

    const subtotal = cart.reduce((s, i) => s + Number(i.offerPrice ?? i.basePrice) * i.quantity, 0);
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

    useEffect(() => {
        if (subtotal === 0 || totalItems === 0) {
            onClose();
        }
    }, [subtotal, totalItems, onClose]);

    useEffect(() => {
        if (containerRef.current) {
            setMaxSwipe(containerRef.current.offsetWidth - 48);
        }
    }, [cart]);

    const opacity = useTransform(x, [0, maxSwipe * 0.7], [1, 0]);
    const bgSuccess = useTransform(x, [0, maxSwipe], ["#000000", "#2F2FE4"]);

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x > maxSwipe / 2) {
            x.set(maxSwipe);
            setTimeout(() => {
                onPlaceOrderDirect();
                x.set(0);
                onClose();
                setCart([]);
            }, 200);
        } else {
            x.set(0);
        }
    };

    if (subtotal === 0 || totalItems === 0) return null;

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
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed bottom-0 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 z-1001 max-w-2xl w-full rounded-t-[32px] overflow-hidden flex flex-col bg-white shadow-2xl"
                style={{ maxHeight: "85vh" }}
            >
                <div className="flex justify-center pt-4 pb-2 shrink-0">
                    <div className="w-12 h-1.5 rounded-full bg-gray-200" />
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Your Order</h2>
                        <p className="text-[13px] text-gray-500 mt-0.5 font-medium">
                            {totalItems} item{totalItems !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full flex items-center justify-center sm:text-gray-500 text-red-500 sm:bg-gray-100 bg-red-500/10 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer active:scale-95"
                    >
                        <XIcon />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 min-h-0">
                    {cart.map((item) => {
                        const lineTotal = (Number(item.offerPrice ?? item.basePrice) * item.quantity).toFixed(2);
                        return (
                            <div key={item.id} className="flex items-center gap-4 group">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[15px] font-bold text-gray-900 truncate pr-2">{item.itemName}</p>
                                    <p className="text-[13px] text-gray-400 font-medium mt-0.5">
                                        ₹{item.offerPrice ?? item.basePrice} × {item.quantity}
                                    </p>
                                </div>
                                <Stepper
                                    qty={item.quantity}
                                    onAdd={() => onAdd(item)}
                                    onRemove={() => onRemove(item.id)}
                                />
                                <div className="flex flex-col gap-1 items-end">
                                    <span className="text-[15px] font-bold text-gray-900 w-16 text-right shrink-0">
                                        ₹{lineTotal}
                                    </span>
                                    {item.offerPrice && (
                                        <span className="text-[12px] font-medium text-gray-500 line-through decoration-gray-400 w-16 text-right shrink-0">
                                            ₹{(Number(item.basePrice) * item.quantity).toFixed(0)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-gray-200/30 px-6 py-6 space-y-5 shrink-0">
                    <div className="flex items-center justify-between">
                        <span className="text-[14px] text-gray-500 font-bold uppercase tracking-wider">Subtotal</span>
                        <span className="text-[20px] font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[14px] text-gray-500 font-bold uppercase tracking-wider">Tax (5%)</span>
                        <span className="text-[20px] font-bold text-green-600 flex items-center gap-1"><PlusIcon />₹{(subtotal * 0.05).toFixed(2)}</span>
                    </div>
                    <button
                        onClick={onPlaceOrder}
                        disabled={placing}
                        className="w-full relative flex items-center justify-between sm:rounded-lg rounded-2xl px-6 py-3
                                   font-bold text-[14px] uppercase tracking-wider text-white
                                   bg-green-600 active:scale-[0.98]
                                   disabled:opacity-70 disabled:cursor-not-allowed
                                   transition-all duration-300 shadow-md cursor-pointer overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
                        <span className="relative z-10 flex items-center gap-2">
                            {placing && <Loading className="animate-spin w-5 h-5" />}
                            {placing ? "Placing Order..." : "Place Order"}
                        </span>
                        {!placing && (
                            <span className="relative z-10 flex items-center gap-1.5 text-lg">
                                ₹{(subtotal * 1.05).toFixed(2)} <ChevronRightIcon />
                            </span>
                        )}
                    </button>

                    <motion.div
                        ref={containerRef}
                        style={{ backgroundColor: bgSuccess }}
                        className="relative w-full h-14 rounded-full px-2 flex items-center overflow-hidden touch-none"
                    >
                        <motion.div
                            style={{ opacity }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <span className="text-white font-bold sm:text-[15px] text-md">
                                Slide for Self-Service
                            </span>
                        </motion.div>

                        <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: maxSwipe }}
                            dragElastic={0.05}
                            onDragEnd={handleDragEnd}
                            style={{ x }}
                            className="relative z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg"
                        >
                            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </motion.div>
                    </motion.div>

                    <p className="text-center text-[11px] text-gray-400 font-semibold tracking-wider uppercase">
                        {(() => {
                            const prepTimes = cart.map(item => Number(item.preparationTime) || 0);
                            const maxPrepTimeSeconds = Math.max(...prepTimes, 0);
                            const scalingBuffer = totalItems > 1 ? (totalItems - 1) * 120 : 0;
                            const totalMinutes = Math.ceil((maxPrepTimeSeconds + scalingBuffer) / 60);
                            return `Serve at table in approx ${totalMinutes} minutes`;
                        })()}
                    </p>
                </div>
            </motion.div>
        </>
    );
}

function FilterDrawer({
    onClose,
    filters,
    setFilters,
    maxAvailablePrice,
    maxAvailablePrepTime
}: {
    onClose: () => void;
    filters: any;
    setFilters: (f: any) => void;
    maxAvailablePrice: number;
    maxAvailablePrepTime: number;
}) {
    const handleReset = () => {
        setFilters({
            dietary: [] as DietaryType[],
            maxPrepTime: null as number | null,
            maxPrice: null as number | null,
            minDiscount: null as number | null,
            sortBy: "default",
        });
        onClose();
    };

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-1000 bg-black/40 backdrop-blur-sm" />
            <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 z-1001 w-full max-w-[340px] bg-white shadow-2xl flex flex-col"
            >
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-black">Filter & Sort</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Refine your results</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><XIcon /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sort By</label>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { id: "default", label: "Default" },
                                { id: "alpha", label: "Alphabetical (A-Z)" },
                                { id: "price_asc", label: "Price: Low to High" },
                                { id: "price_desc", label: "Price: High to Low" },
                                { id: "discount", label: "Highest Discount" },
                            ].map((opt) => (
                                <Button
                                    key={opt.id}
                                    variant="tableos"
                                    onClick={() => setFilters({ ...filters, sortBy: opt.id })}
                                    className={cn(
                                        filters.sortBy === opt.id && "bg-green-600 text-white hover:bg-green-600 hover:border-green-600 border-green-600"
                                    )}
                                >
                                    {opt.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dietary Preference</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(["veg", "non-veg", "vegan", "jain"] as DietaryType[]).map((type) => {
                                const active = filters.dietary.includes(type);
                                return (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            const next = active ? filters.dietary.filter((t: any) => t !== type) : [...filters.dietary, type];
                                            setFilters({ ...filters, dietary: next });
                                        }}
                                        className={cn(
                                            "flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl text-xs font-bold transition-all"
                                        )}
                                        style={{ background: active ? DIETARY_CONFIG[type].dot : "white", color: active ? "white" : "black" }}
                                    >
                                        <span className="w-2 h-2 rounded-full" style={{ background: DIETARY_CONFIG[type].dot, border: "1px solid", borderColor: active ? "white" : DIETARY_CONFIG[type].dot }} />
                                        {DIETARY_CONFIG[type].label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-3 text-emerald-800">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price Limit</label>
                            <span className="text-xs font-bold">Under ₹{filters.maxPrice || maxAvailablePrice}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={maxAvailablePrice}
                            value={filters.maxPrice || maxAvailablePrice}
                            onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                            className="w-full accent-green-500 hover:accent-green-600 h-1 bg-green-500/10 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prep Time</label>
                            <span className="text-xs font-bold">Within {Math.floor((filters.maxPrepTime || maxAvailablePrepTime) / 60)} mins</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={maxAvailablePrepTime}
                            step="60"
                            value={filters.maxPrepTime || maxAvailablePrepTime}
                            onChange={(e) => setFilters({ ...filters, maxPrepTime: parseInt(e.target.value) })}
                            className="w-full accent-cyan-500 hover:accent-cyan-600 h-1 bg-cyan-500/10 rounded-lg appearance-none cursor-pointer"

                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Min. Discount</label>
                            <span className="text-xs font-bold">{filters.minDiscount || 0}% or more</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="70"
                            step="5"
                            value={filters.minDiscount || 0}
                            onChange={(e) => setFilters({ ...filters, minDiscount: parseInt(e.target.value) })}
                            className="w-full accent-blue-500 hover:accent-blue-600 h-1 bg-blue-500/10 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-3">
                    <Button onClick={handleReset}>Reset</Button>
                    <Button onClick={onClose} className="flex-2 bg-green-600 border border-green-600 hover:bg-green-700 hover:border-green-700 text-white text-sm font-bold">Apply Filters</Button>
                </div>
            </motion.div>
        </>
    );
}

function LoadingOverview() {
    return (
        <div className="min-h-screen w-2xl mx-auto px-5 pt-10 pb-20 bg-white z-10 relative">
            <div className="w-1/2 h-8 bg-gray-200/60 rounded-xl animate-pulse mb-6"></div>
            <div className="w-full h-14 bg-gray-200/50 rounded-2xl animate-pulse mb-8"></div>
            <div className="flex gap-3 mb-8 overflow-hidden">
                <div className="w-24 h-10 bg-gray-200/60 rounded-full animate-pulse shrink-0"></div>
                <div className="w-32 h-10 bg-gray-200/50 rounded-full animate-pulse shrink-0"></div>
                <div className="w-20 h-10 bg-gray-200/50 rounded-full animate-pulse shrink-0"></div>
            </div>

            <div className="space-y-6 mt-10">
                <div className="w-50 h-4 bg-gray-200/50 rounded-md animate-pulse mb-4"></div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-4 p-5 rounded-[24px] border border-gray-100 bg-white shadow-sm animate-pulse">
                        <div className="flex-1 space-y-4 w-full">
                            <div className="w-14 h-5 bg-gray-200/60 rounded-md"></div>
                            <div className="w-3/4 h-6 bg-gray-200/50 rounded-lg"></div>
                            <div className="w-full h-4 bg-gray-100 rounded-md"></div>
                            <div className="w-1/2 h-4 bg-gray-100 rounded-md"></div>
                        </div>
                        <div className="w-12 h-12 bg-gray-200/60 rounded-2xl shrink-0 self-end sm:self-start"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function VerificationModal({
    orderId,
    totalAmount,
    upiLink,
    onClose,
    isConfirmed,
    isDeclined
}: {
    orderId: string;
    totalAmount: string;
    upiLink: string;
    onClose: () => void;
    isConfirmed: boolean;
    isDeclined: boolean;
}) {
    useEffect(() => {
        if (isConfirmed || isDeclined) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isConfirmed, isDeclined, onClose])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-2000 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-xl w-fit overflow-hidden shadow-2xl relative"
            >
                {isConfirmed ? (
                    <div className="p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto text-white shadow-lg">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Payment Verified!</h2>
                            <p className="text-sm text-gray-500 mt-2">Your order is being prepared.</p>
                        </div>
                    </div>
                ) : isDeclined ? (
                    <div className="p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto text-white shadow-lg">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.93 4.93L19.07 19.07M2 8.52274V15.4773C2 15.7218 2 15.8441 2.02763 15.9592C2.05213 16.0613 2.09253 16.1588 2.14736 16.2483C2.2092 16.3492 2.29568 16.4357 2.46863 16.6086L7.39137 21.5314C7.56432 21.7043 7.6508 21.7908 7.75172 21.8526C7.84119 21.9075 7.93873 21.9479 8.04077 21.9724C8.15586 22 8.27815 22 8.52274 22H15.4773C15.7218 22 15.8441 22 15.9592 21.9724C16.0613 21.9479 16.1588 21.9075 16.2483 21.8526C16.3492 21.7908 16.4357 21.7043 16.6086 21.5314L21.5314 16.6086C21.7043 16.4357 21.7908 16.3492 21.8526 16.2483C21.9075 16.1588 21.9479 16.0613 21.9724 15.9592C22 15.8441 22 15.7218 22 15.4773V8.52274C22 8.27815 22 8.15586 21.9724 8.04077C21.9479 7.93873 21.9075 7.84119 21.8526 7.75172C21.7908 7.6508 21.7043 7.56432 21.5314 7.39137L16.6086 2.46863C16.4357 2.29568 16.3492 2.2092 16.2483 2.14736C16.1588 2.09253 16.0613 2.05213 15.9592 2.02763C15.8441 2 15.7218 2 15.4773 2H8.52274C8.27815 2 8.15586 2 8.04077 2.02763C7.93873 2.05213 7.84119 2.09253 7.75172 2.14736C7.6508 2.2092 7.56432 2.29568 7.39137 2.46863L2.46863 7.39137C2.29568 7.56432 2.2092 7.6508 2.14736 7.75172C2.09253 7.84119 2.05213 7.93873 2.02763 8.04077C2 8.15586 2 8.27815 2 8.52274Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Order Declined</h2>
                            <p className="text-sm text-gray-500 mt-2">The staff has declined your order. <br /> <span className="text-xs">Please contact with them or try placing it again.</span> </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Verify Payment</h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors"><XIcon /></button>
                        </div>
                        <div className="px-8 pt-6 pb-2 text-center space-y-6">
                            <div className="inline-block">
                                <QRCodeSVG value={upiLink} size={180} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">Total to Pay</p>
                                <p className="text-3xl font-bold text-black">₹{parseFloat(totalAmount) * 1.05}</p>
                            </div>
                            <div className="space-y-4">
                                <a
                                    href={upiLink}
                                >
                                    <Button variant="tableos" className="w-full hover:bg-green-600! hover:text-white! hover:border-green-600!">
                                        Pay Now
                                    </Button>
                                </a>
                                <div className="flex items-center justify-center gap-2 py-2">
                                    <Loading className="w-4 h-4 animate-spin text-gray-400" />
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Waiting for staff to verify...</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 text-center">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Order ID: {orderId.split('-')[0]}</p>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

export default function ScanAndOrder() {
    // URL parameters and routing
    const searchParams = useSearchParams();
    const storeId = searchParams.get("storeId");
    const tableId = searchParams.get("tableId");
    const router = useRouter();

    // Application state
    const [items, setItems] = useState<MenuItem[]>([]);
    const [upiId, setUpiId] = useState<string>("");
    const [storeDisplayName, setStoreDisplayName] = useState<string>("TableOS Store");
    const [status, setStatus] = useState<"loading" | "error" | "ok">("loading");
    const [errorMsg, setErrorMsg] = useState("");

    // UI and Cart State
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<CategoryKey | "all">("all");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [placing, setPlacing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [activeOrder, setActiveOrder] = useState<any>(null);
    const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
    const [isOrderDeclined, setIsOrderDeclined] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [showBill, setShowBill] = useState(false);
    const [billData, setBillData] = useState<any>(null);
    const [fetchingBill, setFetchingBill] = useState(false);
    
    // Remote connections and global context
    const { socket, connected } = useSocket(storeId || undefined);
    const notify = useNotify();

    // ----------------------------------------------------
    // WebSockets: Listen for backend events on active orders and sessions
    // ----------------------------------------------------
    useEffect(() => {
        if (socket) {
            socket.on("order:confirmed", (data: any) => {
                if (data.orderId === activeOrder?.orderId || data.orderId === localStorage.getItem("last_order_id")) {
                    setIsOrderConfirmed(true);
                    setIsOrderDeclined(false);
                    localStorage.removeItem("is_payment_pending");
                    notify({ type: "success", title: "Payment Verified", message: "Your order has been confirmed and sent to the kitchen." });
                }
            });

            socket.on("order:declined", (data: any) => {
                if (data.orderId === activeOrder?.orderId || data.orderId === localStorage.getItem("last_order_id")) {
                    setIsOrderConfirmed(false);
                    setIsOrderDeclined(true);
                    localStorage.removeItem("is_payment_pending");
                    notify({ type: "error", title: "Order Declined", message: "Your order was not accepted. Please ask a staff member or try again." });
                }
            });

            socket.on("order:status:updated", (data: any) => {
                const { orderId, status } = data;
                const statusMessages: Record<string, { title: string; msg: string; type: any }> = {
                    preparing: { title: "Preparing Order", msg: "Chef has started preparing your meal!", type: "info" },
                    ready: { title: "Order Ready", msg: "Your food is ready and on its way to your table!", type: "success" },
                    served: { title: "Served", msg: "Hope you enjoy your meal!", type: "success" },
                    cancelled: { title: "Cancelled", msg: "This order has been cancelled.", type: "warning" }
                };

                const meta = statusMessages[status];
                if (meta) {
                    notify({ type: meta.type, title: meta.title, message: meta.msg });
                }
            });

            socket.on("session:closed", (data: any) => {
                notify({ type: "info", title: "Session Ended", message: "Thank you for dining with us! Hope to see you again soon." });
                localStorage.removeItem("last_order_id");
                localStorage.removeItem("last_order_total");
                localStorage.removeItem("table_session_id");
                localStorage.removeItem("is_payment_pending");
            });
        }
        return () => {
            socket?.off("order:confirmed");
            socket?.off("order:declined");
            socket?.off("order:status:updated");
            socket?.off("session:closed");
        };
    }, [socket, activeOrder]);

    // ----------------------------------------------------
    // Polling & Restoration: Recover lost sessions or pending payments on mount
    // ----------------------------------------------------
    useEffect(() => {
        const pending = localStorage.getItem("is_payment_pending");
        if (pending === "true") {
            const orderId = localStorage.getItem("last_order_id");
            const amount = localStorage.getItem("last_order_total");
            if (orderId && amount) {
                setActiveOrder({ orderId, totalAmount: amount });
                setShowVerification(true);
            }
        }
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (showVerification && activeOrder && !isOrderConfirmed) {
            interval = setInterval(async () => {
                const res = await apiRequest<any>(`/customer/order/status?orderId=${activeOrder.orderId}`);
                if (res.status === 200 && res.data.paymentStatus === "paid") {
                    setIsOrderConfirmed(true);
                    localStorage.removeItem("is_payment_pending");
                }
            }, 10000);
        }
        return () => clearInterval(interval);
    }, [showVerification, activeOrder, isOrderConfirmed]);

    // ----------------------------------------------------
    // Filtering Logic: Advanced search and filtering states
    // ----------------------------------------------------
    const [filters, setFilters] = useState({
        dietary: [] as DietaryType[],
        maxPrepTime: null as number | null,
        maxPrice: null as number | null,
        minDiscount: null as number | null,
        sortBy: "default" as "default" | "price_asc" | "price_desc" | "alpha" | "discount",
    });

    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    useEffect(() => {
        if (showCart || showFilters) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [showCart, showFilters]);

    // ----------------------------------------------------
    // Async Loaders: Request initial menu details from backend
    // ----------------------------------------------------
    useEffect(() => {
        if (!storeId || !tableId) {
            setErrorMsg("Invalid QR code — missing store or table information.");
            setStatus("error");
            return;
        }

        const load = async () => {
            try {
                await new Promise(r => setTimeout(r, 600));

                const menuRes = await apiRequest<MenuApiResponse>("/customer/menu/list", {
                    method: "POST",
                    body: { storeId },
                });
                if (menuRes.status !== 200) throw new Error(menuRes.message);
                setItems(menuRes.data.items ?? []);
                setUpiId(menuRes.data.upiId ?? "");
                if (menuRes.data.storeName) setStoreDisplayName(menuRes.data.storeName);
                setStatus("ok");
            } catch (err: any) {
                setErrorMsg(err.message ?? "Something went wrong.");
                setStatus("error");
            }
        };

        load();
    }, [storeId, tableId]);

    const usedCategories = useMemo<CategoryKey[]>(() => {
        const seen = new Set(items.map((i) => i.category));
        return (Object.keys(CATEGORY_LABELS) as CategoryKey[]).filter((k) => seen.has(k)).concat("all").sort((a, b) => {
            if (a === "all") return -1;
            if (b === "all") return 1;
            return 0;
        });
    }, [items]);

    const filtered = useMemo(() => {
        let list = items.filter((i) => {
            const q = search.toLowerCase();
            const matchSearch = !q
                || i.itemName.toLowerCase().includes(q)
                || (i.itemDescription ?? "").toLowerCase().includes(q);
            const matchCat = activeCategory === "all" || i.category === activeCategory;

            // Apply Advanced Filters
            const matchDietary = filters.dietary.length === 0 || filters.dietary.includes(i.dietaryType);
            const matchPrice = filters.maxPrice === null || Number(i.offerPrice ?? i.basePrice) <= filters.maxPrice;
            const matchPrep = filters.maxPrepTime === null || Number(i.preparationTime ?? 0) <= filters.maxPrepTime;

            let matchDiscount = true;
            if (filters.minDiscount !== null && filters.minDiscount > 0) {
                if (!i.offerPrice) matchDiscount = false;
                else {
                    const base = Number(i.basePrice);
                    const offer = Number(i.offerPrice);
                    const d = ((base - offer) / base) * 100;
                    matchDiscount = d >= filters.minDiscount;
                }
            }

            return matchSearch && matchCat && matchDietary && matchPrice && matchPrep && matchDiscount;
        });

        list = [...list].sort((a, b) => {
            switch (filters.sortBy) {
                case "alpha":
                    return a.itemName.localeCompare(b.itemName);
                case "price_asc":
                    return Number(a.offerPrice ?? a.basePrice) - Number(b.offerPrice ?? b.basePrice);
                case "price_desc":
                    return Number(b.offerPrice ?? b.basePrice) - Number(a.offerPrice ?? a.basePrice);
                case "discount":
                    const getD = (i: MenuItem) => i.offerPrice ? ((Number(i.basePrice) - Number(i.offerPrice)) / Number(i.basePrice)) : 0;
                    return getD(b) - getD(a);
                case "default":
                default:
                    if (a.isAvailable === b.isAvailable) return 0;
                    return a.isAvailable ? -1 : 1;
            }
        });

        return list;
    }, [items, search, activeCategory, filters]);

    const grouped = useMemo(() => {
        const g: Partial<Record<CategoryKey, MenuItem[]>> = {};
        for (const item of filtered) {
            if (!g[item.category]) g[item.category] = [];
            g[item.category]!.push(item);
        }
        return g;
    }, [filtered]);

    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
    const cartTotal = cart.reduce((s, i) => s + Number(i.offerPrice ?? i.basePrice) * i.quantity, 0);
    const getQty = (id: string) => cart.find((c) => c.id === id)?.quantity ?? 0;

    // ----------------------------------------------------
    // Cart Handlers: Add, Remove, and Modify Item Quantities
    // ----------------------------------------------------
    const addToCart = (item: MenuItem) => {
        setCart((prev) => {
            const ex = prev.find((c) => c.id === item.id);
            return ex
                ? prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
                : [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => {
            const ex = prev.find((c) => c.id === id);
            if (!ex) return prev;
            return ex.quantity === 1
                ? prev.filter((c) => c.id !== id)
                : prev.map((c) => c.id === id ? { ...c, quantity: c.quantity - 1 } : c);
        });
    };

    const scrollToCategory = (cat: CategoryKey) => {
        setActiveCategory(cat);
        setSearch("");
        setTimeout(() => {
            const el = sectionRefs.current[cat];
            if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 160, behavior: "smooth" });
        }, 50);
    };

    const handlePlaceOrder = async () => {
        if (!storeId || !tableId || cart.length === 0) return;
        setPlacing(true);
        const payload = {
            storeId,
            tableId,
            items: cart.map((i) => ({
                menuItemId: i.id,
                itemName: i.itemName,
                quantity: i.quantity,
                price: i.offerPrice ?? i.basePrice,
            })),
            totalAmount: cartTotal.toFixed(2),
        };

        try {
            // Simulated — replace with real endpoint when ready
            await new Promise((r) => setTimeout(r, 1600));
            // const res = await apiRequest("/customer/order/place", { method: "POST", body: payload });
            // if (res.status !== 200) throw new Error(res.message);
            console.log("[ORDER PAYLOAD]", payload);

            setCart([]);
            setShowCart(false);
            toast.success("Order placed successfully!", {
                duration: 5000,
            });
        } catch (err: any) {
            toast.error("Couldn't place order", {
                description: err.message ?? "Please try again or ask a staff member.",
            });
        } finally {
            setPlacing(false);
        }
    };

    // ----------------------------------------------------
    // Direct Booking Entrypoint (TableOS Unified Flow)
    // Supports generating and initializing UPI intents
    // ----------------------------------------------------
    const handlePlaceOrderDirect = async () => {
        if (!storeId || !tableId || cart.length === 0) return;
        setPlacing(true);
        const total = cartTotal.toFixed(2);
        const payload = {
            storeId,
            tableId,
            items: cart.map((i) => ({
                menuItemId: i.id,
                itemName: i.itemName,
                quantity: i.quantity,
                price: i.offerPrice ?? i.basePrice,
            })),
            totalAmount: total,
        };

        try {
            const res = await apiRequest<any>("/customer/order/create", { method: "POST", body: payload });
            if (res.status !== 200) throw new Error(res.message);

            const newOrder = res.data;
            setActiveOrder(newOrder);
            setIsOrderConfirmed(false);
            setShowVerification(true);

            localStorage.setItem("is_payment_pending", "true");
            localStorage.setItem("last_order_id", newOrder.orderId);
            localStorage.setItem("last_order_total", total);
            localStorage.setItem("table_session_id", newOrder.tableSessionId);

            setCart([]);
            setShowCart(false);

            const upiLink = generateUPILink({
                upiId,
                storeName: storeDisplayName,
                amount: String(parseFloat(total) * 1.05),
                orderId: newOrder.orderId
            });
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile) {
                window.location.href = upiLink;
            } else {
                setShowVerification(true);
            }

        } catch (err: any) {
            toast.error("Couldn't place order", {
                description: err.message ?? "Please try again or ask a staff member.",
            });
        } finally {
            setPlacing(false);
        }
    }

    // ----------------------------------------------------
    // Professional E-Bill generation proxy
    // ----------------------------------------------------
    const fetchBill = async () => {
        try {
            const sid = activeOrder?.tableSessionId || localStorage.getItem("table_session_id");
            if (!sid) {
                toast.error("No Active Table Session found");
                return;
            }
            setFetchingBill(true);
            const res = await apiRequest<any>(`/customer/order/bill?tableSessionId=${sid}`);
            if (res.status === 200) {
                setBillData(res.data);
                setShowBill(true);
            } else {
                toast.error(res.message);
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setFetchingBill(false);
        }
    };

    if (status === "loading") {
        return <LoadingOverview />;
    }

    if (status === "error") {
        return (
            <div className="min-h-screen w-2xl mx-auto flex flex-col items-center justify-center px-8 text-center gap-6 bg-white">
                <div className="text-black p-6 bg-gray-100 rounded-full shadow-inner"><ErrorIcon className="w-10 h-10" /></div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Couldn't Load Menu</h1>
                    <p className="text-[15px] text-gray-500 max-w-sm leading-relaxed mx-auto">{errorMsg}</p>
                </div>
                <div className="space-y-4 w-full max-w-xs">
                    <Button
                        onClick={() => router.push("/scan")}
                    >
                        Scan Again
                    </Button>
                    <p className="text-[12px] text-gray-500 font-medium">Please ask a staff member for assistance.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-2xl bg-transparent">
                <header className="sticky top-0 z-50 bg-white backdrop-blur-xl border-b border-gray-100 shadow-sm">
                    <div className="h-1 w-full bg-linear-to-r from-gray-200 via-gray-900 to-gray-200 opacity-20"></div>
                    <motion.div
                        variants={fadeUp} custom={0} initial="hidden" animate="visible"
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-6 pt-6 pb-4"
                    >
                        <div className="sm:pl-0 pl-15 min-w-0 shrink-0 flex justify-between items-center gap-2">
                            <div className="flex items-center gap-2">
                                <MenuIcon className="w-6 h-6 text-black" />
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-none truncate">
                                    Menu
                                </h1></div>
                            <div className="flex items-center gap-1.5 p-1 bg-gray-100 shadow-inner rounded-2xl border border-gray-100">
                                <motion.button
                                    variants={fadeUp} custom={1} initial="hidden" animate="visible"
                                    onClick={fetchBill}
                                    disabled={fetchingBill}
                                    className="px-3 py-1.5 bg-white shadow-xs border border-gray-200 cursor-pointer rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {fetchingBill ? "Loading..." : "Bill"}
                                </motion.button>
                                <motion.button
                                    variants={fadeUp} custom={1} initial="hidden" animate="visible"
                                    onClick={() => setShowFilters(true)}
                                    className="px-3 py-1.5 bg-white shadow-xs border border-gray-200 cursor-pointer rounded-xl transition-all duration-300 flex items-center gap-2 group active:scale-95"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
                                    </svg>
                                    <span className="text-[10px] font-bold uppercase tracking-widest sm:block hidden">Filters</span>
                                    {Object.values(filters).some(v => v !== null && v !== "default" && (Array.isArray(v) ? v.length > 0 : true)) && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                        <motion.div
                            variants={fadeUp} custom={1} initial="hidden" animate="visible"
                            className="w-full sm:flex-1"
                        >
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors duration-300">
                                    <SearchIcon />
                                </span>
                                <input
                                    type="search"
                                    placeholder="Search our menu..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setActiveCategory("all"); }}
                                    className="w-full rounded-md py-3.5 pl-11 pr-11 text-[15px] font-medium text-gray-900
                                           border border-transparent placeholder-gray-400
                                           focus:outline-none focus:border-gray-200 focus:bg-white focus:shadow-md transition-all duration-300"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors cursor-pointer bg-gray-200 hover:bg-gray-300 rounded-full p-1.5"
                                    >
                                        <XIcon />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>


                    <AnimatePresence>
                        {!search && usedCategories.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex gap-2.5 px-5 sm:px-6 pb-4 overflow-x-auto overflow-y-visible scrollbar-hide py-1"
                            >
                                {usedCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => scrollToCategory(cat)}
                                        className={`relative shrink-0 text-[11px] border font-bold uppercase tracking-widest px-3 py-1 rounded-md transition-all duration-300 cursor-pointer ${activeCategory === cat
                                            ? "text-black shadow-sm border-gray-200 bg-white"
                                            : "text-gray-400 bg-white border-transparent hover:text-black"
                                            }`}
                                    >
                                        {activeCategory === cat && (
                                            <motion.span
                                                layoutId="activeCategoryBubble"
                                                className="absolute inset-0"
                                                initial={false}
                                                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                            />
                                        )}
                                        <span className="relative z-10">{CATEGORY_LABELS[cat]}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

                <main className="px-5 sm:px-6 pt-6 min-h-[calc(100vh-160px)] bg-white space-y-10 scroll-smooth">
                    {Object.keys(grouped).length === 0 ? (
                        <motion.div
                            variants={pageVariants} initial="hidden" animate="visible"
                            className="flex flex-col items-center justify-center py-24 text-center gap-4"
                        >
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-2">
                                <SearchIcon />
                            </div>
                            <p className="text-[15px] font-bold text-gray-400">
                                {search ? `No results for "${search}"` : "Menu is empty"}
                            </p>
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="px-5 py-2.5 rounded-full bg-gray-100 text-[13px] font-bold text-gray-900 hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    Clear Search
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        (Object.keys(grouped) as CategoryKey[]).map((cat, si) => (
                            <motion.section
                                key={cat}
                                ref={(el) => { sectionRefs.current[cat] = el; }}
                                variants={pageVariants}
                                initial="hidden"
                                animate="visible"
                                custom={si}
                                className="scroll-mt-[160px]"
                            >
                                <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-gray-100">
                                    <h2 className="text-[13px] font-bold uppercase text-gray-900">
                                        {CATEGORY_LABELS[cat]}
                                    </h2>
                                    <span className="flex items-center justify-center text-[14px] font-bold bg-gray-200/75 text-black px-2 py-0.5 rounded-4xl">
                                        {grouped[cat]!.length}
                                    </span>
                                </div>

                                <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                                    {[...grouped[cat]!]
                                        .sort((a, b) => {
                                            const aBool = String(a.isAvailable) === 'true';
                                            const bBool = String(b.isAvailable) === 'true';
                                            if (aBool === bBool) return 0;
                                            return aBool ? -1 : 1;
                                        })
                                        .map((item) => (
                                            <MenuCard
                                                key={item.id}
                                                item={item}
                                                qty={getQty(item.id)}
                                                onAdd={() => addToCart(item)}
                                                onRemove={() => removeFromCart(item.id)}
                                            />
                                        ))}
                                </motion.div>
                            </motion.section>
                        ))
                    )}

                    {Object.keys(grouped).length > 0 && (
                        <div className="text-center">
                            <div className="h-px w-full bg-gray-200 mx-auto sm:mb-2 mb-7"></div>
                            <p className="sm:text-sm text-xs text-gray-400 font-bold flex items-center justify-center gap-1.5">
                                <Image
                                    src="/assets/tableOS-logo.svg"
                                    alt="TableOS"
                                    width={15}
                                    height={15}
                                />
                                Powered by <span className="text-black">tableOS</span>
                            </p>
                        </div>
                    )}
                </main>

                <AnimatePresence>
                    {cartCount > 0 && !showCart && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            transition={{ type: "spring", damping: 24, stiffness: 280 }}
                            className="fixed bottom-6 left-5 right-5 z-40 max-w-lg mx-auto"
                        >
                            <button
                                onClick={() => setShowCart(true)}
                                className="w-full flex items-center justify-between px-6 py-4 rounded-3xl
                                           bg-white backdrop-blur-md text-black
                                           border border-gray-200
                                           active:scale-[0.98] transition-all duration-300
                                           shadow-sm shadow-black/15 cursor-pointer overflow-hidden relative group"
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="relative">
                                        <BagIcon />
                                        <AnimatePresence mode="popLayout">
                                            <motion.span
                                                key={cartCount}
                                                initial={{ scale: 0.5, y: -10, opacity: 0 }}
                                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                                exit={{ scale: 0.5, y: 10, opacity: 0 }}
                                                className="absolute -top-2 -right-2 w-[18px] h-[18px] bg-black text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md"
                                            >
                                                {cartCount}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                    <span className="text-[14px] font-bold tracking-wider uppercase text-black">
                                        View Order
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-[16px] font-bold relative z-10">
                                    ₹{cartTotal.toFixed(2)} <ChevronRightIcon />
                                </div>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showCart && (
                    <CartSheet
                        cart={cart}
                        onAdd={addToCart}
                        onRemove={removeFromCart}
                        onClose={() => setShowCart(false)}
                        onPlaceOrder={handlePlaceOrder}
                        setCart={setCart}
                        onPlaceOrderDirect={handlePlaceOrderDirect}
                        placing={placing}
                    />
                )}
                {showFilters && (
                    <FilterDrawer
                        onClose={() => setShowFilters(false)}
                        filters={filters}
                        setFilters={setFilters}
                        maxAvailablePrice={Math.max(...items.map(i => Number(i.offerPrice ?? i.basePrice)), 0) || 2000}
                        maxAvailablePrepTime={Math.max(...items.map(i => Number(i.preparationTime ?? 0)), 0) || 3600}
                    />
                )}
                {showVerification && activeOrder && (
                    <VerificationModal
                        orderId={activeOrder.orderId}
                        totalAmount={activeOrder.totalAmount}
                        isConfirmed={isOrderConfirmed}
                        isDeclined={isOrderDeclined}
                        onClose={() => {
                            setShowVerification(false);
                            if (isOrderConfirmed || isOrderDeclined) {
                                setIsOrderConfirmed(false);
                                setIsOrderDeclined(false);
                                setActiveOrder(null);
                            }
                        }}
                        upiLink={generateUPILink({
                            upiId,
                            storeName: storeDisplayName,
                            amount: String(parseFloat(activeOrder.totalAmount) * 1.05),
                            orderId: activeOrder.orderId
                        })}
                    />
                )}
                {showBill && billData && (
                    <ProfessionalBill
                        data={billData}
                        onClose={() => setShowBill(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
