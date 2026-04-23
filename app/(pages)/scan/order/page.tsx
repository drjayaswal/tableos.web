"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    motion,
    AnimatePresence,
    useTransform,
    useMotionValue,
    useDragControls,
} from "framer-motion";

import { apiRequest } from "@/app/utility/api";
import {
    CheckIcon,
    ErrorIcon,
    Loading,
    MenuIcon,
    OrderIcon,
    PlusIcon,
} from "@/app/components/icons/svg";
import ProfessionalBill from "@/app/components/ProfessionalBill";
import { Button } from "@/app/components/ui/button";
import Image from "next/image";
import { Variants } from "framer-motion";
import { cn } from "@/app/lib/utils";
import { useSocket } from "@/app/hooks/useSocket";
import { generateUPILink } from "@/app/utility/upi";
import { QRCodeSVG } from "qrcode.react";
import { SoundType, useNotifySound } from "@/app/hooks/useNotifySound";
import {
    useNotificationHistory,
    useNotify,
} from "@/app/components/Notifcation";
import { FilterDrawer } from "@/app/components/FilterModal";
import { GlobalTableOSLoader } from "@/app/context/UserContext";




type DietaryType = "veg" | "non-veg" | "vegan" | "jain";
type CategoryKey =
    | "all"
    | "beverages"
    | "coffee_tea"
    | "alcohol"
    | "appetizers"
    | "soups"
    | "salads"
    | "small_plates"
    | "sandwiches"
    | "entrees"
    | "mains_land"
    | "mains_sea"
    | "pasta_pizza"
    | "sides"
    | "sauces_dips"
    | "desserts"
    | "pastries"
    | "kids_menu"
    | "specials"
    | "others";

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
    beverages: "Beverages",
    coffee_tea: "Coffee & Tea",
    alcohol: "Alcohol",
    appetizers: "Appetizers",
    soups: "Soups",
    salads: "Salads",
    small_plates: "Small Plates",
    sandwiches: "Sandwiches",
    entrees: "Entrées",
    mains_land: "Mains",
    mains_sea: "From the Sea",
    pasta_pizza: "Pasta & Pizza",
    sides: "Sides",
    sauces_dips: "Sauces & Dips",
    desserts: "Desserts",
    pastries: "Pastries",
    kids_menu: "Kids",
    specials: "Chef's Specials",
    others: "More",
};

const DIETARY_CONFIG: Record<
    DietaryType,
    { border: string; bg: string; text: string; dot: string; label: string }
> = {
    veg: {
        border: "#bbf7d0",
        bg: "#f0fdf4",
        text: "#16a34a",
        dot: "#22c55e",
        label: "Veg",
    },
    "non-veg": {
        border: "#fecaca",
        bg: "#fef2f2",
        text: "#dc2626",
        dot: "#ef4444",
        label: "Non-Veg",
    },
    vegan: {
        border: "#bbf7d0",
        bg: "#f0fdf4",
        text: "#15803d",
        dot: "#16a34a",
        label: "Vegan",
    },
    jain: {
        border: "#fde68a",
        bg: "#fffbeb",
        text: "#d97706",
        dot: "#f59e0b",
        label: "Jain",
    },
};




const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", damping: 24, stiffness: 200 },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
} as const;

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.05,
            type: "spring",
            damping: 24,
            stiffness: 200,
        },
    }),
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
} as const;

const staggerItem = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", damping: 25, stiffness: 220 },
    },
} as const;




const MinusIcon = ({ size = 16 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const SearchIcon = ({ size = 18 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const XIcon = ({ size = 12 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const BagIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M16 7C16 6.07003 16 5.60504 15.8978 5.22354C15.6204 4.18827 14.8117 3.37962 13.7765 3.10222C13.395 3 12.93 3 12 3C11.07 3 10.605 3 10.2235 3.10222C9.18827 3.37962 8.37962 4.18827 8.10222 5.22354C8 5.60504 8 6.07003 8 7M5.2 21H18.8C19.9201 21 20.4802 21 20.908 20.782C21.2843 20.5903 21.5903 20.2843 21.782 19.908C22 19.4802 22 18.9201 22 17.8V10.2C22 9.07989 22 8.51984 21.782 8.09202C21.5903 7.71569 21.2843 7.40973 20.908 7.21799C20.4802 7 19.9201 7 18.8 7H5.2C4.07989 7 3.51984 7 3.09202 7.21799C2.71569 7.40973 2.40973 7.71569 2.21799 8.09202C2 8.51984 2 9.07989 2 10.2V17.8C2 18.9201 2 19.4802 2.21799 19.908C2.40973 20.2843 2.71569 20.5903 3.09202 20.782C3.51984 21 4.0799 21 5.2 21Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
const ChevronRightIcon = ({ size = 16 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="9 18 15 12 9 6" />
    </svg>
);
const GripIcon = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="9" cy="5" r="1" fill="currentColor" />
        <circle cx="9" cy="12" r="1" fill="currentColor" />
        <circle cx="9" cy="19" r="1" fill="currentColor" />
        <circle cx="15" cy="5" r="1" fill="currentColor" />
        <circle cx="15" cy="12" r="1" fill="currentColor" />
        <circle cx="15" cy="19" r="1" fill="currentColor" />
    </svg>
);
const FilterIcon = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
);

function DietBadge({ type }: { type: DietaryType }) {
    const c = DIETARY_CONFIG[type];
    return (
        <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: c.bg, color: c.text }}
        >
            <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: c.dot }}
            />
            {c.label}
        </span>
    );
}

function Stepper({
    qty,
    onAdd,
    onRemove,
}: {
    qty: number;
    onAdd: () => void;
    onRemove: () => void;
}) {
    return (
        <div className="flex items-center gap-1 bg-gray-100 border border-gray-200 p-0.5 rounded-full shadow-inner">
            {qty > 1 && (
                <button
                    onClick={() => {
                        for (let i = 1; i <= qty; i++) {
                            onRemove();
                        }
                    }}
                    className="w-7 h-7 rounded-full sm:bg-white bg-red-600 sm:text-red-600 text-white hover:text-white shadow-sm flex items-center justify-center hover:bg-red-600 transition-all active:scale-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M16 6V5.2C16 4.0799 16 3.51984 15.782 3.09202C15.5903 2.71569 15.2843 2.40973 14.908 2.21799C14.4802 2 13.9201 2 12.8 2H11.2C10.0799 2 9.51984 2 9.09202 2.21799C8.71569 2.40973 8.40973 2.71569 8.21799 3.09202C8 3.51984 8 4.0799 8 5.2V6M10 11.5V16.5M14 11.5V16.5M3 6H21M19 6V17.2C19 18.8802 19 19.7202 18.673 20.362C18.3854 20.9265 17.9265 21.3854 17.362 21.673C16.7202 22 15.8802 22 14.2 22H9.8C8.11984 22 7.27976 22 6.63803 21.673C6.07354 21.3854 5.6146 20.9265 5.32698 20.362C5 19.7202 5 18.8802 5 17.2V6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            )}
            <button
                onClick={onRemove}
                className="w-7 h-7 rounded-full bg-white text-gray-700 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all active:scale-90 cursor-pointer"
            >
                <MinusIcon size={13} />
            </button>
            <div className="w-6 text-center text-sm font-bold text-gray-900 tabular-nums relative h-6 overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                        key={qty}
                        initial={{ opacity: 0, y: -10, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.8 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="absolute"
                    >
                        {qty}
                    </motion.span>
                </AnimatePresence>
            </div>
            <button
                onClick={onAdd}
                className="w-7 h-7 rounded-full bg-green-600 text-white shadow-sm flex items-center justify-center hover:bg-green-700 transition-all active:scale-90 cursor-pointer"
            >
                <PlusIcon size={13} />
            </button>
        </div>
    );
}

function MenuCard({
    item,
    qty,
    onAdd,
    onRemove,
}: {
    item: MenuItem;
    qty: number;
    onAdd: () => void;
    onRemove: () => void;
}) {
    const bPrice = Number(item.basePrice);
    const oPrice = Number(item.offerPrice);
    const isDiscounted = !!oPrice && bPrice > oPrice;
    const isSurged = !!oPrice && oPrice > bPrice;

    return (
        <motion.div
            variants={staggerItem}
            className={cn(
                "group relative flex flex-row items-start gap-3 sm:gap-4 p-3.5 sm:p-4 mb-2.5 rounded-lg border transition-all duration-200",
                !item.isAvailable
                    ? "opacity-50 grayscale select-none bg-white border-gray-100"
                    : "bg-white border-gray-200/50 hover:shadow-sm",
            )}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <DietBadge type={item.dietaryType} />
                    {isDiscounted && (
                        <span className="text-[9px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase tracking-wide">
                            {Math.round(((bPrice - oPrice) / bPrice) * 100)}% off
                        </span>
                    )}
                    {isSurged && (
                        <span className="text-[9px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                            High demand
                        </span>
                    )}
                </div>

                <h3
                    className={cn(
                        "text-sm sm:text-[15px] font-bold leading-tight mb-1 pr-2",
                        !item.isAvailable ? "text-gray-400" : "text-black",
                    )}
                >
                    {item.itemName}
                </h3>

                {item.itemDescription && (
                    <p
                        className={cn(
                            "text-xs sm:text-[12.5px] leading-relaxed mb-2 line-clamp-2",
                            !item.isAvailable ? "text-gray-300" : "text-gray-500",
                        )}
                    >
                        {item.itemDescription}
                    </p>
                )}

                <div className="flex items-center flex-wrap gap-1.5">
                    {isDiscounted ? (
                        <>
                            <span className="text-sm sm:text-[15px] font-bold text-black">
                                ₹{oPrice}
                            </span>
                            <span className="text-[11px] text-gray-400 line-through font-bold">
                                ₹{bPrice}
                            </span>
                        </>
                    ) : isSurged ? (
                        <>
                            <span className="text-sm sm:text-[15px] font-bold text-black">
                                ₹{oPrice}
                            </span>
                            <span className="text-[11px] text-gray-400 font-bold line-through">
                                ₹{bPrice}
                            </span>
                        </>
                    ) : (
                        <span className="text-sm sm:text-[15px] font-bold text-black">
                            ₹{bPrice}
                        </span>
                    )}

                    {item.preparationTime && item.isAvailable && (
                        <span className="text-[10px] text-gray-500 flex items-center gap-1 font-bold">
                            <svg
                                width="9"
                                height="9"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {(() => {
                                const s = Number(item.preparationTime);
                                const fmt = { hour: "2-digit", minute: "2-digit" } as const;
                                const t1 = new Date(
                                    Date.now() + (s - 300) * 1000,
                                ).toLocaleTimeString([], fmt);
                                const t2 = new Date(
                                    Date.now() + (s + 300) * 1000,
                                ).toLocaleTimeString([], fmt);
                                return `${t1}–${t2}`;
                            })()}
                        </span>
                    )}
                    {!item.isAvailable && (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                            Sold out
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-end justify-center self-center shrink-0">
                {item.isAvailable ? (
                    qty === 0 ? (
                        <Button
                            variant="tableos"
                            onClick={onAdd}
                            className="h-8 px-3 text-xs"
                        >
                            <PlusIcon size={13} />
                            Add
                        </Button>
                    ) : (
                        <Stepper qty={qty} onAdd={onAdd} onRemove={onRemove} />
                    )
                ) : (
                    <span className="text-[10px] font-bold text-gray-300 uppercase border border-gray-100 px-2 py-1 rounded-lg">
                        N/A
                    </span>
                )}
            </div>
        </motion.div>
    );
}

function CategoryDock({
    categories,
    activeCategory,
    onSelect,
}: {
    categories: CategoryKey[];
    activeCategory: CategoryKey;
    onSelect: (cat: CategoryKey) => void;
}) {
    const dockRef = useRef<HTMLDivElement>(null);
    const constraintsRef = useRef<HTMLDivElement>(null);
    const [collapsed, setCollapsed] = useState(true);
    const [isDragging, setIsDragging] = useState(false);

    const sorted = useMemo(() => {
        const rest = categories
            .filter((c) => c !== "all")
            .sort((a, b) => CATEGORY_LABELS[a].localeCompare(CATEGORY_LABELS[b]));
        return categories.includes("all") ? ["all" as CategoryKey, ...rest] : rest;
    }, [categories]);

    const handleSelect = (cat: CategoryKey) => {
        onSelect(cat);
        setCollapsed(true);
    };

    return (
        <>
            <div
                ref={constraintsRef}
                className="pointer-events-none fixed inset-0 z-299"
            />

            <motion.div
                ref={dockRef}
                drag="y"
                dragConstraints={constraintsRef}
                dragMomentum={true}
                dragElastic={0.08}
                dragTransition={{ bounceStiffness: 280, bounceDamping: 28 }}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
                whileDrag={{ scale: 1.03 }}
                style={{ right: 0, top: 200 }}
                className="fixed z-300 flex flex-col items-end touch-none lg:hidden"
            >
                <motion.button
                    onClick={() => !isDragging && setCollapsed((p) => !p)}
                    whileTap={{ scale: 0.93 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="mb-1.5 mr-2 flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1.5 shadow-[0_2px_12px_rgba(0,0,0,0.10)] cursor-grab active:cursor-grabbing"
                    aria-label={collapsed ? "Show categories" : "Hide categories"}
                >
                    {collapsed ? (
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M3 12H21M3 6H21M3 18H15"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    ) : (
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M3 12H21M3 6H21M9 18H21"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </motion.button>

                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            key="dock-panel"
                            initial={{ opacity: 0, x: 56, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 56, scale: 0.9 }}
                            transition={{
                                type: "spring",
                                damping: 24,
                                stiffness: 300,
                                mass: 0.8,
                            }}
                            className="mr-2 flex max-h-[60vh] min-w-[82px] flex-col gap-0.5 overflow-y-auto overscroll-contain rounded-[14px] border border-gray-200 bg-white/95 p-1.5 shadow-[0_6px_28px_rgba(0,0,0,0.12)] backdrop-blur-sm scrollbar-hide"
                        >
                            {sorted.map((cat) => {
                                const isActive = activeCategory === cat;
                                return (
                                    <motion.button
                                        key={cat}
                                        onClick={() => handleSelect(cat)}
                                        whileTap={{ scale: 0.95 }}
                                        className={cn(
                                            "relative rounded-[10px] border px-2.5 py-2 text-left text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors duration-150 cursor-pointer",
                                            isActive
                                                ? "border-gray-200 bg-white text-black shadow-sm"
                                                : "border-transparent text-gray-400 hover:text-gray-700 hover:bg-gray-50",
                                        )}
                                    >
                                        {isActive && (
                                            <motion.span
                                                layoutId="dock-active-pill"
                                                className="absolute inset-0 rounded-[10px] border border-gray-200 bg-white shadow-sm"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 380,
                                                    damping: 28,
                                                }}
                                            />
                                        )}
                                        <span className="relative z-10">
                                            {CATEGORY_LABELS[cat]}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
}

function CartSheet({
    cart,
    onAdd,
    setCart,
    onRemove,
    onClose,
    onPlaceOrder,
    onPlaceOrderDirect,
    onViewBill,
    placing,
    sessionUnpaidBalance,
}: {
    cart: CartItem[];
    onAdd: (item: MenuItem) => void;
    onRemove: (id: string) => void;
    onClose: () => void;
    onPlaceOrder: () => void;
    setCart: (cart: CartItem[]) => void;
    onPlaceOrderDirect: () => void;
    onViewBill: () => void;
    placing: boolean;
    sessionUnpaidBalance: number;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [maxSwipe, setMaxSwipe] = useState(0);
    const x = useMotionValue(0);

    const subtotal = cart.reduce(
        (s, i) => s + Number(i.offerPrice ?? i.basePrice) * i.quantity,
        0,
    );
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

    useEffect(() => {
        if (subtotal === 0 || totalItems === 0) onClose();
    }, [subtotal, totalItems, onClose]);

    useEffect(() => {
        if (containerRef.current)
            setMaxSwipe(containerRef.current.offsetWidth - 56);
    }, [cart]);

    const opacity = useTransform(x, [0, maxSwipe * 0.7], [1, 0]);
    const bgSuccess = useTransform(x, [0, maxSwipe], ["#000000", "#2F2FE4"]);
    const thumbBgSuccess = useTransform(x, [0, maxSwipe], ["#FFFFFF", "#2F2FE4"]);
    const thumbColorSuccess = useTransform(
        x,
        [0, maxSwipe],
        ["#000000", "#FFFFFF"],
    );

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
                className="fixed inset-0 z-1000 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 z-1001 max-w-2xl w-full rounded-t-3xl overflow-hidden flex flex-col bg-white"
                style={{ maxHeight: "88vh", boxShadow: "0 -8px 40px rgba(0,0,0,0.18)" }}
            >
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>

                <div className="flex items-center justify-between px-5 sm:px-6 py-3 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-black tracking-tight">
                            Your Order
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5 font-bold">
                            {totalItems} item{totalItems !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="sm:text-gray-400 cursor-pointer text-red-600"
                    >
                        <XIcon size={14} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 min-h-0">
                    {cart.map((item, idx) => {
                        const lineTotal = (
                            Number(item.offerPrice ?? item.basePrice) * item.quantity
                        ).toFixed(2);
                        return (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-black truncate">
                                        {item.itemName}
                                    </p>
                                    <p className="text-xs text-gray-400 font-bold mt-0.5">
                                        ₹{item.offerPrice ?? item.basePrice} × {item.quantity}
                                    </p>
                                </div>
                                <Stepper
                                    qty={item.quantity}
                                    onAdd={() => onAdd(item)}
                                    onRemove={() => onRemove(item.id)}
                                />
                                <div className="flex flex-col items-end shrink-0 w-14">
                                    <motion.span
                                        key={lineTotal}
                                        initial={{ y: -8, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 8, opacity: 0 }}
                                        className="text-md font-bold text-black text-right"
                                    >
                                        ₹{lineTotal}
                                    </motion.span>
                                    {item.offerPrice && (
                                        <motion.span
                                            key={(Number(item.basePrice) * item.quantity).toFixed(0)}
                                            initial={{ y: -8, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 8, opacity: 0 }}
                                            className="text-[13px] font-bold text-gray-400 line-through text-right"
                                        >
                                            ₹{(Number(item.basePrice) * item.quantity).toFixed(0)}
                                        </motion.span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="border-t border-gray-200 bg-gray-100 shadow-inner px-5 sm:px-6 py-5 space-y-4 shrink-0">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Subtotal
                        </span>
                        <motion.span
                            key={subtotal}
                            initial={{ y: -8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 8, opacity: 0 }}
                            className="text-lg text-black font-bold"
                        >
                            ₹{subtotal.toFixed(2)}
                        </motion.span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Tax (5%)
                        </span>
                        <span className="text-base font-bold flex items-center gap-1 text-green-600">
                            <PlusIcon size={12} />
                            <motion.span
                                key={subtotal}
                                initial={{ y: -8, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 8, opacity: 0 }}
                                className="text-lg text-green-600"
                            >
                                ₹{(subtotal * 0.05).toFixed(2)}
                            </motion.span>
                        </span>
                    </div>

                    {sessionUnpaidBalance > 0 && (
                        <div className="flex items-center justify-between mb-px px-5 py-3 text-white font-bold bg-amber-600 rounded-t-3xl">
                            <motion.div
                                initial={{ x: "-100%", skewX: -20 }}
                                animate={{ x: "200%" }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 1,
                                    ease: "linear",
                                }}
                                className="absolute inset-0 w-1/2 h-full bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                            />

                            <span className="relative z-10 flex items-center gap-2">
                                <span className="text-left leading-tight">
                                    <span className="text-sm block">
                                        Unpaid Amount : ₹{sessionUnpaidBalance.toFixed(2)}
                                    </span>
                                    <span className="text-xs font-semibold text-white/90 tracking-tight">
                                        Adding to next paid order
                                    </span>
                                </span>
                            </span>

                            <div className="flex items-center gap-3">
                                <span className="text-base font-bold text-white tabular-nums">
                                    ₹{sessionUnpaidBalance.toFixed(2)}
                                </span>
                                <button
                                    onClick={() => {
                                        onClose();
                                        onViewBill();
                                    }}
                                    className="px-2.5 flex items-center gap-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-white border border-white/10 transition-colors cursor-pointer"
                                >
                                    <OrderIcon size={12} /> View Bill
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onPlaceOrder}
                        disabled={placing}
                        className={`${sessionUnpaidBalance > 0 ? "rounded-b-3xl" : "rounded-3xl"} relative overflow-hidden w-full group flex items-center justify-between px-5 py-3 cursor-pointer h-auto bg-green-600 group/btn text-white text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed active:scale-98 transition-all`}
                    >
                        <motion.div
                            initial={{ x: "-100%", skewX: -20 }}
                            animate={{ x: "200%" }}
                            transition={{
                                repeat: Infinity,
                                duration: 1,
                                ease: "linear",
                            }}
                            className="group-hover:block hidden absolute inset-0 w-1/2 h-full bg-linear-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                        />

                        <span className="relative z-10 flex items-center gap-2">
                            {placing && <Loading className="animate-spin w-4 h-4" />}
                            <span className="text-left leading-tight">
                                <span className="block">
                                    {placing ? "Placing…" : "Order Now, Pay Later"}
                                </span>
                                <span className="text-xs font-semibold text-white/90 tracking-tight">
                                    Will have to wait for staff confirmation
                                </span>
                            </span>
                        </span>

                        {!placing && (
                            <span className="relative z-10 flex flex-col items-end">
                                <span className="text-base font-bold text-white">
                                    ₹{(subtotal * 1.05).toFixed(2)}
                                </span>
                                <span className="text-[9px] font-bold text-white/90 uppercase">
                                    Adding to Bill
                                </span>
                            </span>
                        )}
                    </button>

                    <div className="relative">
                        <motion.div
                            ref={containerRef}
                            style={{ backgroundColor: bgSuccess }}
                            className="relative w-full h-12 rounded-full px-1.5 flex items-center overflow-hidden touch-none"
                        >
                            <motion.div
                                style={{ opacity }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                                <span className="text-white font-bold text-sm tracking-wide">
                                    Slide to Pay ₹{(subtotal * 1.05).toFixed(2)}
                                </span>
                            </motion.div>
                            <motion.div
                                drag="x"
                                dragConstraints={{ left: 0, right: maxSwipe }}
                                dragElastic={0.05}
                                onDragEnd={handleDragEnd}
                                style={{
                                    x,
                                    backgroundColor: thumbBgSuccess,
                                    color: thumbColorSuccess,
                                }}
                                className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M6 17L11 12L6 7M13 17L18 12L13 7"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </motion.div>
                        </motion.div>
                    </div>

                    <p className="text-center text-[10px] text-gray-400 font-semibold tracking-widest uppercase">
                        {(() => {
                            const max = Math.max(
                                ...cart.map((i) => Number(i.preparationTime) || 0),
                                0,
                            );
                            const buf = totalItems > 1 ? (totalItems - 1) * 120 : 0;
                            return `Approx ${Math.ceil((max + buf) / 60)} min to your table`;
                        })()}
                    </p>
                </div>
            </motion.div>
        </>
    );
}

function NotificationsDrawer({
    activeOrder,
    billData,
    upiLink,
    onClose,
    isConfirmed,
    isDeclined,
    isPaymentMode,
}: {
    activeOrder: any;
    billData: any;
    upiLink: string;
    onClose: () => void;
    isConfirmed: boolean;
    isDeclined: boolean;
    isPaymentMode: boolean;
}) {
    const { history } = useNotificationHistory();
    const orders = billData?.orders || [];
    const allOrders = [...orders];
    if (activeOrder && !allOrders.find((o) => o.id === activeOrder.orderId)) {
        allOrders.unshift({
            id: activeOrder.orderId,
            orderStatus: isDeclined
                ? "declined"
                : isConfirmed
                    ? "accepted"
                    : "pending",
            paymentStatus: isPaymentMode
                ? isConfirmed
                    ? "paid"
                    : "unpaid"
                : "unpaid",
            totalAmount: activeOrder.checkoutAmount || activeOrder.totalAmount,
            orderedAt: new Date().toISOString(),
        });
    }



    const statusStyle = (s: string) => {
        if (s === "pending") return "bg-amber-500";
        if (s === "declined" || s === "cancelled") return "bg-red-500";
        return "bg-green-500";
    };



    const notifStyle = (type: string) => {
        if (type === "success")
            return { dot: "bg-green-600", text: "text-green-600" };
        if (type === "error") return { dot: "bg-red-600", text: "text-red-600" };
        if (type === "warning")
            return { dot: "bg-amber-600", text: "text-amber-600" };
        return { dot: "bg-blue-600", text: "text-blue-600" };
    };

    const formatTime = (ts?: number) =>
        ts
            ? new Date(ts).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })
            : "";

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
                        <h2 className="text-base font-bold text-black">Notifications</h2>
                        {history.length > 0 && (
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                                {history.length} notification{history.length !== 1 ? "s" : ""}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="sm:text-gray-400 cursor-pointer text-red-600 p-1.5 hover:text-black"
                    >
                        <XIcon size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-3 space-y-6">
                    {upiLink && !isConfirmed && !isDeclined && (
                        <div className="space-y-4 p-4 text-center">
                            <h3 className="text-sm font-bold text-black">
                                Payment Verification
                            </h3>
                            <div className="inline-block p-3 rounded-2xl bg-white shadow-md border-2 border-gray-300/50">
                                <QRCodeSVG value={upiLink} size={140} />
                            </div>
                            <p className="text-xl font-bold text-black">
                                ₹
                                {parseFloat(
                                    activeOrder?.checkoutAmount || activeOrder?.totalAmount,
                                ).toFixed(2)}
                            </p>
                            <a href={upiLink} className="block w-full">
                                <Button variant="tableos">Open UPI App</Button>
                            </a>
                            <p className="text-[10px] font-bold text-gray-400 mx-auto w-fit animate-pulse uppercase tracking-wider flex items-center gap-1">
                                <Loading className="animate-spin w-3 h-3" />
                                Staff will verify shortly
                            </p>
                        </div>
                    )}

                    {!upiLink && activeOrder && !isConfirmed && !isDeclined && (
                        <div className="space-y-4 p-4 text-center">
                            <h3 className="text-sm font-bold text-black">
                                Receiving Update...
                            </h3>
                            <div className="w-12 h-12 mx-auto border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                            <p className="text-[10px] font-bold text-gray-500 animate-pulse uppercase tracking-wider">
                                Waiting for acceptance...
                            </p>
                        </div>
                    )}

                    {allOrders.length > 0 && (
                        <div className="space-y-2.5">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">
                                Recent Orders
                            </h3>
                            {allOrders
                                .sort(
                                    (a, b) =>
                                        new Date(b.orderedAt).getTime() -
                                        new Date(a.orderedAt).getTime(),
                                )
                                .map((order) => (
                                    <div
                                        key={order.id}
                                        className="p-3 bg-white border border-gray-200/70 rounded-md flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="text-[11px] font-bold text-black uppercase flex items-center gap-2 tracking-tight">
                                                Order <span className="flex items-center gap-1 text-gray-500 bg-gray-700/10 px-1 py-0.5 rounded">
                                                    <OrderIcon className="w-3.5 h-3.5" />
                                                    {order.id.slice(0, 6).toUpperCase()}</span>
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                                                ₹{parseFloat(order.totalAmount).toFixed(2)}
                                            </p>
                                        </div>
                                        <span
                                            className={cn(
                                                "flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded text-white uppercase tracking-widest",
                                                statusStyle(order.orderStatus),
                                            )}
                                        >
                                            {order.orderStatus == "pending" ? (
                                                <Loading className="animate-spin w-3 h-3" />
                                            ) : order.orderStatus == "accepted" ? (
                                                <CheckIcon className="w-3 h-3" />
                                            ) : order.orderStatus == "declined" ? (
                                                <XIcon />
                                            ) : null}
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    )}

                    <div className="space-y-2.5">
                        {history.length > 0 && (
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase">
                                History
                            </h3>
                        )}

                        {history.length === 0 ? (
                            <div className="py-8 text-center">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M14.9997 19C14.9997 20.6569 13.6566 22 11.9997 22C10.3429 22 8.99972 20.6569 8.99972 19M13.7962 6.23856C14.2317 5.78864 14.4997 5.17562 14.4997 4.5C14.4997 3.11929 13.3804 2 11.9997 2C10.619 2 9.49972 3.11929 9.49972 4.5C9.49972 5.17562 9.76772 5.78864 10.2032 6.23856M17.9997 11.2C17.9997 9.82087 17.3676 8.49823 16.2424 7.52304C15.1171 6.54786 13.591 6 11.9997 6C10.4084 6 8.8823 6.54786 7.75708 7.52304C6.63186 8.49823 5.99972 9.82087 5.99972 11.2C5.99972 13.4818 5.43385 15.1506 4.72778 16.3447C3.92306 17.7056 3.5207 18.3861 3.53659 18.5486C3.55476 18.7346 3.58824 18.7933 3.73906 18.9036C3.87089 19 4.53323 19 5.85791 19H18.1415C19.4662 19 20.1286 19 20.2604 18.9036C20.4112 18.7933 20.4447 18.7346 20.4629 18.5486C20.4787 18.3861 20.0764 17.7056 19.2717 16.3447C18.5656 15.1506 17.9997 13.4818 17.9997 11.2Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <p className="text-sm font-bold text-gray-500">
                                    No notifications yet
                                </p>
                                <p className="text-[12px] text-gray-500 mt-0.5">
                                    Updates will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute left-[3px] top-2 bottom-2 w-0.5 bg-gray-200" />
                                <div className="space-y-0">
                                    {history
                                        .filter(
                                            (h, index, self) =>
                                                h.id && self.findIndex((t) => t.id === h.id) === index,
                                        )
                                        .map((h, i) => {
                                            const s = notifStyle(h.type);
                                            return (
                                                <motion.div
                                                    key={h.id || i}
                                                    initial={{ opacity: 0, x: 8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.04 }}
                                                    className="relative flex gap-3 pb-4"
                                                >
                                                    {/* Coloured timeline dot */}
                                                    <div
                                                        className={cn(
                                                            "relative z-10 mt-1 w-2 h-2 rounded-full shrink-0 ring-2 ring-white",
                                                            s.dot,
                                                        )}
                                                    />

                                                    {/* Card */}
                                                    <div className="flex-1 bg-white border border-gray-200/70 rounded-md p-3 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p
                                                                className={cn(
                                                                    "text-[11px] font-bold uppercase tracking-tight leading-tight",
                                                                    i === 0 ? "text-black" : "text-gray-700",
                                                                )}
                                                            >
                                                                {h.title}
                                                            </p>
                                                            {i === 0 ? (
                                                                <span className="h-1.5 rounded-4xl w-1.5 bg-fuchsia-600" />
                                                            ) : (h as any).timestamp ? (
                                                                <span className="shrink-0 text-[9px] text-gray-500 font-medium tabular-nums">
                                                                    {formatTime((h as any).timestamp)}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        {h.message && (
                                                            <p className="text-[10px] text-gray-700/50 font-medium mt-0.5 leading-snug">
                                                                {h.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </>
    );
}

export default function ScanAndOrder() {
    const searchParams = useSearchParams();
    const storeId = searchParams.get("storeId");
    const tableId = searchParams.get("tableId");
    const router = useRouter();
    const playSound = useNotifySound();

    const [items, setItems] = useState<MenuItem[]>([]);
    const [upiId, setUpiId] = useState<string>("");
    const [storeDisplayName, setStoreDisplayName] =
        useState<string>("TableOS Store");
    const [status, setStatus] = useState<"loading" | "error" | "ok">("loading");
    const [errorMsg, setErrorMsg] = useState("");

    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<CategoryKey | "all">(
        "all",
    );
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [placing, setPlacing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [activeOrder, setActiveOrder] = useState<any>(null);
    const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
    const [isOrderDeclined, setIsOrderDeclined] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showBill, setShowBill] = useState(false);
    const [billData, setBillData] = useState<any>(null);
    const [fetchingBill, setFetchingBill] = useState(false);
    const [sessionUnpaidBalance, setSessionUnpaidBalance] = useState(0);
    const [isPaymentMode, setIsPaymentMode] = useState(false);

    
    const activeOrderRef = useRef<string | null>(null);

    const [filters, setFilters] = useState({
        dietary: [] as DietaryType[],
        maxPrepTime: null as number | null,
        maxPrice: null as number | null,
        minDiscount: null as number | null,
        sortBy: "default" as
            | "default"
            | "price_asc"
            | "price_desc"
            | "alpha"
            | "discount",
    });

    const { clearHistory } = useNotificationHistory();
    const notify = useNotify();
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
    const { socket, connected } = useSocket(storeId || undefined);

    
    useEffect(() => {
        if (activeOrder?.orderId) activeOrderRef.current = activeOrder.orderId;
    }, [activeOrder?.orderId]);



    useEffect(() => {
        if (!socket) return;

        const getOrderId = () =>
            activeOrderRef.current || localStorage.getItem("last_order_id");

        const handleConfirmed = (data: any) => {


            if (data.tableSessionId) {
                localStorage.setItem("table_session_id", data.tableSessionId);
            }
            fetchSessionBalance();

            const currentOrderId = getOrderId();
            const orderRefStr = currentOrderId
                ? ` #${currentOrderId.slice(0, 6).toUpperCase()}`
                : "";

            if (data.orderId === currentOrderId) {
                setIsOrderConfirmed(true);
                setIsOrderDeclined(false);
                localStorage.removeItem("is_payment_pending");
                localStorage.removeItem("is_order_pending");
                playSound("confirmed");

                const title = isPaymentMode ? "Payment Confirmed" : "Order Accepted";
                const message = isPaymentMode
                    ? `Your payment for order${orderRefStr} was verified.`
                    : `Order${orderRefStr} is now being prepared.`;



                notify({ type: "success", title, message });
            }
        };

        const handleDeclined = (data: any) => {
            const currentOrderId = getOrderId();
            if (data.orderId !== currentOrderId) return;

            const orderRefStr = currentOrderId
                ? ` #${currentOrderId.slice(0, 6).toUpperCase()}`
                : "";
            setIsOrderConfirmed(false);
            setIsOrderDeclined(true);
            localStorage.removeItem("is_payment_pending");
            localStorage.removeItem("is_order_pending");
            playSound("declined");
            const declineTitle = "Order Declined";
            const declineMsg = `Unfortunately, order${orderRefStr} could not be accepted.`;
            notify({ type: "error", title: declineTitle, message: declineMsg });
        };

        const handleStatusUpdated = (data: any) => {
            const orderRefStr = data.orderId
                ? ` #${data.orderId.slice(0, 6).toUpperCase()}`
                : "";
            const msgs: Record<
                string,
                {
                    title: string;
                    msg: string;
                    type: "success" | "error" | "warning" | "info";
                    sound: SoundType;
                }
            > = {
                preparing: {
                    title: "Chef at Work",
                    msg: `Order${orderRefStr} is currently being prepared.`,
                    type: "info",
                    sound: "preparing",
                },
                ready: {
                    title: "Order Ready",
                    msg: `Your items for${orderRefStr} are ready to be served.`,
                    type: "success",
                    sound: "ready",
                },
                served: {
                    title: "Order Served",
                    msg: `Order${orderRefStr} has been delivered to your table.`,
                    type: "success",
                    sound: "served",
                },
                cancelled: {
                    title: "Order Cancelled",
                    msg: `Order${orderRefStr} was cancelled.`,
                    type: "warning",
                    sound: "warning",
                },
            };
            const meta = msgs[data.status];
            if (meta) {
                playSound(meta.sound);


                notify({ type: meta.type, title: meta.title, message: meta.msg });
            }
        };

        const handleSessionClosed = () => {
            playSound("info");
            const closeTitle = "Visit Completed";
            const closeMsg = "Thank you for dining with us! Your session has ended.";


            notify({ type: "info", title: closeTitle, message: closeMsg });
            setTimeout(() => {
                [
                    "last_order_id",
                    "last_order_total",
                    "table_session_id",
                    "is_payment_pending",
                    "is_order_pending",
                    "notif_history",
                ].forEach((k) => localStorage.removeItem(k));
                activeOrderRef.current = null;
                clearHistory();
            }, 4000);
        };

        const handleSessionPaymentVerified = (data: any) => {
            fetchSessionBalance();
            if (
                activeOrderRef.current?.startsWith("BILL_") &&
                activeOrderRef.current.includes(data.tableSessionId.slice(0, 8))
            ) {
                setIsOrderConfirmed(true);
                localStorage.removeItem("is_payment_pending");
                playSound("confirmed");
                notify({
                    type: "success",
                    title: "Payment Verified",
                    message: "Your outstanding balance has been cleared. Thank you!",
                });
            }
        };

        const handleSessionPaymentDeclined = (data: any) => {
            if (
                activeOrderRef.current?.startsWith("BILL_") &&
                activeOrderRef.current.includes(data.tableSessionId.slice(0, 8))
            ) {
                setIsOrderConfirmed(false);
                setIsOrderDeclined(true);
                localStorage.removeItem("is_payment_pending");
                playSound("declined");
                notify({
                    type: "error",
                    title: "Payment Declined",
                    message:
                        "We couldn't verify your bill payment. Please check with our staff.",
                });
            }
        };

        socket.on("order:confirmed", handleConfirmed);
        socket.on("order:declined", handleDeclined);
        socket.on("order:status:updated", handleStatusUpdated);
        socket.on("session:closed", handleSessionClosed);
        socket.on("session:payment:verified", handleSessionPaymentVerified);
        socket.on("session:payment:declined", handleSessionPaymentDeclined);

        return () => {
            socket.off("order:confirmed", handleConfirmed);
            socket.off("order:declined", handleDeclined);
            socket.off("order:status:updated", handleStatusUpdated);
            socket.off("session:closed", handleSessionClosed);
            socket.off("session:payment:verified", handleSessionPaymentVerified);
            socket.off("session:payment:declined", handleSessionPaymentDeclined);
        };
    }, [socket, isPaymentMode]); 



    useEffect(() => {
        const isPaid = localStorage.getItem("is_payment_pending") === "true";
        const isUnpaid = localStorage.getItem("is_order_pending") === "true";
        const orderId = localStorage.getItem("last_order_id");
        const amount = localStorage.getItem("last_order_total");
        if ((isPaid || isUnpaid) && orderId && amount) {
            setActiveOrder({ orderId, totalAmount: amount, checkoutAmount: amount });
            activeOrderRef.current = orderId;


            if (isPaid) setIsPaymentMode(true);
            setShowNotifications(true);
        }
    }, []);



    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (showNotifications && activeOrder && !isOrderConfirmed) {
            interval = setInterval(async () => {
                const res = await apiRequest<any>(
                    `/customer/order/status?orderId=${activeOrder.orderId}`,
                );
                if (res.status === 200) {
                    const s: string = res.data.orderStatus;
                    if (
                        s === "confirmed" ||
                        s === "accepted" ||
                        s === "preparing" ||
                        s === "ready" ||
                        s === "served"
                    ) {
                        setIsOrderConfirmed(true);
                        localStorage.removeItem("is_payment_pending");
                        localStorage.removeItem("is_order_pending");
                    }
                }
            }, 10000);
        }
        return () => clearInterval(interval);
    }, [showNotifications, activeOrder, isOrderConfirmed]);



    useEffect(() => {
        document.body.style.overflow = showCart || showFilters ? "hidden" : "unset";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [showCart, showFilters]);



    useEffect(() => {
        if (!storeId || !tableId) {
            setErrorMsg("Invalid QR code — missing store or table information.");
            setStatus("error");
            return;
        }
        const load = async () => {
            try {
                await new Promise((r) => setTimeout(r, 600));
                const menuRes = await apiRequest<MenuApiResponse>(
                    "/customer/menu/list",
                    { method: "POST", body: { storeId } },
                );
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
        return (Object.keys(CATEGORY_LABELS) as CategoryKey[])
            .filter((k) => seen.has(k))
            .concat("all")
            .sort((a, b) => (a === "all" ? -1 : b === "all" ? 1 : 0));
    }, [items]);

    const filtered = useMemo(() => {
        let list = items.filter((i) => {
            const q = search.toLowerCase();
            const matchSearch =
                !q ||
                i.itemName.toLowerCase().includes(q) ||
                (i.itemDescription ?? "").toLowerCase().includes(q);
            const matchCat =
                activeCategory === "all" || i.category === activeCategory;
            const matchDietary =
                filters.dietary.length === 0 || filters.dietary.includes(i.dietaryType);
            const matchPrice =
                filters.maxPrice === null ||
                Number(i.offerPrice ?? i.basePrice) <= filters.maxPrice;
            const matchPrep =
                filters.maxPrepTime === null ||
                Number(i.preparationTime ?? 0) <= filters.maxPrepTime;
            let matchDiscount = true;
            if (filters.minDiscount !== null && filters.minDiscount > 0) {
                if (!i.offerPrice) matchDiscount = false;
                else {
                    const d =
                        ((Number(i.basePrice) - Number(i.offerPrice)) /
                            Number(i.basePrice)) *
                        100;
                    matchDiscount = d >= filters.minDiscount;
                }
            }
            return (
                matchSearch &&
                matchCat &&
                matchDietary &&
                matchPrice &&
                matchPrep &&
                matchDiscount
            );
        });
        list = [...list].sort((a, b) => {
            switch (filters.sortBy) {
                case "alpha":
                    return a.itemName.localeCompare(b.itemName);
                case "price_asc":
                    return (
                        Number(a.offerPrice ?? a.basePrice) -
                        Number(b.offerPrice ?? b.basePrice)
                    );
                case "price_desc":
                    return (
                        Number(b.offerPrice ?? b.basePrice) -
                        Number(a.offerPrice ?? a.basePrice)
                    );
                case "discount":
                    const gD = (i: MenuItem) =>
                        i.offerPrice
                            ? (Number(i.basePrice) - Number(i.offerPrice)) /
                            Number(i.basePrice)
                            : 0;
                    return gD(b) - gD(a);
                default:
                    return a.isAvailable === b.isAvailable ? 0 : a.isAvailable ? -1 : 1;
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



    const groupedKeys = useMemo(
        () =>
            (Object.keys(grouped) as CategoryKey[]).sort((a, b) =>
                CATEGORY_LABELS[a].localeCompare(CATEGORY_LABELS[b]),
            ),
        [grouped],
    );

    const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
    const cartTotal = cart.reduce(
        (s, i) => s + Number(i.offerPrice ?? i.basePrice) * i.quantity,
        0,
    );
    const getQty = (id: string) => cart.find((c) => c.id === id)?.quantity ?? 0;

    const addToCart = (item: MenuItem) => {
        setCart((prev) => {
            const ex = prev.find((c) => c.id === item.id);
            return ex
                ? prev.map((c) =>
                    c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
                )
                : [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => {
            const ex = prev.find((c) => c.id === id);
            if (!ex) return prev;
            return ex.quantity === 1
                ? prev.filter((c) => c.id !== id)
                : prev.map((c) =>
                    c.id === id ? { ...c, quantity: c.quantity - 1 } : c,
                );
        });
    };

    const scrollToCategory = (cat: CategoryKey) => {
        setActiveCategory(cat);
        setSearch("");
        setTimeout(() => {
            const el = sectionRefs.current[cat];
            if (el)
                window.scrollTo({
                    top: el.getBoundingClientRect().top + window.scrollY - 140,
                    behavior: "smooth",
                });
        }, 50);
    };



    const handlePlaceOrder = async () => {
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
            paymentStatus: "unpaid",
        };
        try {
            const res = await apiRequest<any>("/customer/order/create", {
                method: "POST",
                body: payload,
            });
            if (res.status !== 200) throw new Error(res.message);
            const newOrder = res.data;
            setActiveOrder(newOrder);
            activeOrderRef.current = newOrder.orderId;
            localStorage.setItem("last_order_id", newOrder.orderId);
            localStorage.setItem("last_order_total", total);




            setCart([]);
            setShowCart(false);
            setIsPaymentMode(false);
            setShowNotifications(true);
            notify({
                type: "info",
                title: "Order Sent!",
                message: "Waiting for kitchen confirmation.",
            });
        } catch (err: any) {
            notify({
                type: "error",
                title: "Couldn't place order",
                message: err.message ?? "Please try again or ask a staff member.",
            });
        } finally {
            setPlacing(false);
        }
    };



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
            paymentStatus: "paid",
        };
        try {
            const res = await apiRequest<any>("/customer/order/create", {
                method: "POST",
                body: payload,
            });
            if (res.status !== 200) throw new Error(res.message);
            const newOrder = res.data;
            const totalWithHistory = cartTotal + sessionUnpaidBalance;
            const orderData = { ...newOrder, checkoutAmount: totalWithHistory };
            setActiveOrder(orderData);
            activeOrderRef.current = newOrder.orderId;
            setIsOrderConfirmed(false);
            setIsPaymentMode(true);
            localStorage.setItem("is_payment_pending", "true");
            localStorage.setItem("last_order_id", newOrder.orderId);
            localStorage.setItem("last_order_total", String(totalWithHistory));





            if (sessionUnpaidBalance > 0 && socket && storeId) {
                const sid = localStorage.getItem("table_session_id");
                if (sid) {
                    socket.emit("bill:payment:intent", { tableSessionId: sid, storeId });
                }
            }

            setCart([]);
            setShowCart(false);

            const upiLink = generateUPILink({
                upiId,
                storeName: storeDisplayName,
                amount: String(parseFloat(String(totalWithHistory)) * 1.05),
                orderId: newOrder.orderId,
            });

            notify({
                type: "info",
                title: "Payment Initiated",
                message: "Awaiting staff payment verification.",
            });

            if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                window.location.href = upiLink;
            } else {
                setShowNotifications(true);
            }
        } catch (err: any) {
            notify({
                type: "error",
                title: "Couldn't place order",
                message: err.message ?? "Please try again or ask a staff member.",
            });
        } finally {
            setPlacing(false);
        }
    };

    const handlePayBillOnly = (balance: number) => {
        const sid = localStorage.getItem("table_session_id");
        if (!sid) return;





        const virtualOrder = {
            orderId: "BILL_" + sid.slice(0, 8),
            totalAmount: balance.toString(),
            checkoutAmount: balance.toString(),
            tableSessionId: sid,
        };

        setActiveOrder(virtualOrder);
        activeOrderRef.current = virtualOrder.orderId;
        setIsOrderConfirmed(false);
        setIsPaymentMode(true);
        localStorage.setItem("is_payment_pending", "true");
        setShowBill(false);
        setShowNotifications(true);



        if (socket && storeId) {
            socket.emit("bill:payment:intent", { tableSessionId: sid, storeId });
        }
    };

    const fetchSessionBalance = useCallback(async () => {
        const sid = localStorage.getItem("table_session_id");
        if (!sid) return;
        try {
            const res = await apiRequest<any>(
                `/customer/order/bill?tableSessionId=${sid}`,
            );
            if (res.status === 200) {
                const validStatuses = [
                    "confirmed",
                    "accepted",
                    "preparing",
                    "ready",
                    "served",
                ];
                const validOrders = res.data.orders.filter((o: any) =>
                    validStatuses.includes(o.orderStatus),
                );
                const grandTotal = validOrders.reduce(
                    (s: number, o: any) => s + parseFloat(o.totalAmount),
                    0,
                );
                const totalPaid = validOrders
                    .filter((o: any) => o.paymentStatus === "paid")
                    .reduce((s: number, o: any) => s + parseFloat(o.totalAmount), 0);
                setSessionUnpaidBalance(Math.max(0, grandTotal - totalPaid));
            }
        } catch (e) { }
    }, []);



    useEffect(() => {
        if (connected) fetchSessionBalance();
    }, [connected, fetchSessionBalance]);
    const fetchBill = async () => {
        try {
            const sid = localStorage.getItem("table_session_id");


            if (!sid) {
                notify({
                    type: "info",
                    title: "No active bill yet",
                    message: "Your bill appears once staff confirms an order.",
                });
                return;
            }
            setFetchingBill(true);
            const res = await apiRequest<any>(
                `/customer/order/bill?tableSessionId=${sid}`,
            );
            if (res.status === 200) {
                const validStatuses = [
                    "confirmed",
                    "accepted",
                    "preparing",
                    "ready",
                    "served",
                ];
                const validOrders = res.data.orders.filter((o: any) =>
                    validStatuses.includes(o.orderStatus),
                );


                if (validOrders.length === 0) {
                    notify({
                        type: "info",
                        title: "No confirmed orders yet",
                        message: "Bill is available once at least one order is accepted.",
                    });
                    return;
                }
                setBillData({ ...res.data, orders: validOrders });
                setShowBill(true);
            } else {
                notify({ type: "error", title: res.message });
            }
        } catch (err: any) {
            notify({ type: "error", title: err.message });
        } finally {
            setFetchingBill(false);
        }
    };

    const hasActiveFilters =
        filters.dietary.length > 0 ||
        filters.maxPrice !== null ||
        filters.maxPrepTime !== null ||
        (filters.minDiscount !== null && filters.minDiscount > 0) ||
        filters.sortBy !== "default";

    if (status === "loading") return <GlobalTableOSLoader/>;

    if (status === "error") {
        return (
            <div className="min-h-screen max-w-2xl mx-auto flex flex-col items-center justify-center px-8 text-center gap-6">
                <div className="p-5 bg-white rounded-4xl border border-gray-200 shadow-md shadow-black/15">
                    <ErrorIcon className="w-9 h-9 text-black" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight mb-2">
                        Couldn't Load Menu
                    </h1>
                    <p className="text-sm text-gray-500 font-semibold max-w-sm leading-relaxed mx-auto">
                        {errorMsg}
                    </p>
                </div>
                <div className="space-y-3 w-full max-w-xs">
                    <Button onClick={() => router.push("/scan")}>
                        Scan Again
                    </Button>
                    <p className="text-xs text-gray-400 font-bold">
                        Please ask a staff member for assistance.
                    </p>
                </div>
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-white">
            <div className="mx-auto max-w-2xl bg-white">
                <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
                    <motion.div
                        variants={fadeUp}
                        custom={0}
                        initial="hidden"
                        animate="visible"
                        className="flex items-center justify-between gap-3 px-4 sm:px-6 pt-4 pb-3"
                    >
                        <div className="flex items-center gap-2 min-w-0 shrink-0">
                            <MenuIcon className="w-5 h-5 text-black shrink-0" />
                            <h1 className="text-lg sm:text-xl font-bold text-black tracking-tight truncate leading-none">
                                {storeDisplayName}
                            </h1>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            <Button
                                variant="tableos"
                                onClick={fetchBill}
                                className="h-8 px-3 text-xs uppercase relative"
                            >
                                <div className="flex items-center gap-1">
                                    {sessionUnpaidBalance > 0 && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 shadow-sm rounded-full bg-amber-500" />
                                    )}
                                    {fetchingBill ? (
                                        <Loading className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <>
                                            <OrderIcon /> Bill
                                        </>
                                    )}
                                </div>
                            </Button>

                            <Button
                                variant="tableos"
                                onClick={() => setShowFilters(true)}
                                className="h-8 px-3 text-xs uppercase relative"
                            >
                                <div className="flex items-center gap-1">
                                    <FilterIcon />
                                </div>
                                {hasActiveFilters && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 shadow-sm rounded-full bg-green-500" />
                                )}
                            </Button>
                            <Button
                                variant="tableos"
                                onClick={() => setShowNotifications(true)}
                                className="h-8 px-3 text-xs uppercase relative"
                            >
                                <div className="flex items-center gap-1">
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M14.9997 19C14.9997 20.6569 13.6566 22 11.9997 22C10.3429 22 8.99972 20.6569 8.99972 19M13.7962 6.23856C14.2317 5.78864 14.4997 5.17562 14.4997 4.5C14.4997 3.11929 13.3804 2 11.9997 2C10.619 2 9.49972 3.11929 9.49972 4.5C9.49972 5.17562 9.76772 5.78864 10.2032 6.23856M17.9997 11.2C17.9997 9.82087 17.3676 8.49823 16.2424 7.52304C15.1171 6.54786 13.591 6 11.9997 6C10.4084 6 8.8823 6.54786 7.75708 7.52304C6.63186 8.49823 5.99972 9.82087 5.99972 11.2C5.99972 13.4818 5.43385 15.1506 4.72778 16.3447C3.92306 17.7056 3.5207 18.3861 3.53659 18.5486C3.55476 18.7346 3.58824 18.7933 3.73906 18.9036C3.87089 19 4.53323 19 5.85791 19H18.1415C19.4662 19 20.1286 19 20.2604 18.9036C20.4112 18.7933 20.4447 18.7346 20.4629 18.5486C20.4787 18.3861 20.0764 17.7056 19.2717 16.3447C18.5656 15.1506 17.9997 13.4818 17.9997 11.2Z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        custom={1}
                        initial="hidden"
                        animate="visible"
                        className="px-4 sm:px-6 pb-3"
                    >
                        <div className="relative group">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                                <SearchIcon size={16} />
                            </span>
                            <input
                                type="search"
                                placeholder="Search dishes…"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setActiveCategory("all");
                                }}
                                className="w-full h-10 sm:h-11 rounded-2xl pl-10 pr-3 text-sm font-bold text-black bg-white border border-gray-200 placeholder-gray-400 focus:outline-none focus:shadow-sm transition-all"
                            />
                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {!search && usedCategories.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex gap-1.5 px-4 sm:px-6 pb-3 overflow-x-auto overflow-y-visible scrollbar-hide"
                            >
                                {usedCategories.map((cat, idx) => {
                                    const isActive = activeCategory === cat;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => scrollToCategory(cat)}
                                            className={cn(
                                                "relative bg-white shrink-0 text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer",
                                                isActive
                                                    ? "text-black border-gray-200 shadow-sm"
                                                    : "text-gray-400  border-transparent",
                                            )}
                                        >
                                            <span className="relative z-10">
                                                {CATEGORY_LABELS[cat]}
                                            </span>
                                        </button>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>

                <main className="px-4 sm:px-6 pt-5 pb-36 min-h-[calc(100vh-160px)] space-y-8">
                    {Object.keys(grouped).length === 0 ? (
                        <motion.div
                            variants={pageVariants}
                            initial="hidden"
                            animate="visible"
                            className="flex flex-col items-center justify-center py-28 text-center gap-4"
                        >
                            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-1">
                                <SearchIcon size={24} />
                            </div>
                            <p className="text-sm font-bold text-gray-400">
                                {search ? `No results for "${search}"` : "Menu is empty"}
                            </p>
                            {search && (
                                <Button
                                    variant="tableos"
                                    onClick={() => setSearch("")}
                                    className="mt-1 h-9 px-5 text-xs font-bold rounded-full border-gray-200"
                                >
                                    Clear Search
                                </Button>
                            )}
                        </motion.div>
                    ) : (
                        groupedKeys.map((cat, si) => (
                            <motion.section
                                key={cat}
                                ref={(el) => {
                                    sectionRefs.current[cat] = el;
                                }}
                                variants={pageVariants}
                                initial="hidden"
                                animate="visible"
                                custom={si}
                                className="scroll-mt-[160px]"
                            >
                                <div className="flex items-center gap-2.5 mb-3 pb-2.5 border-b border-gray-100">
                                    <h2 className="text-xs sm:text-[13px] font-bold uppercase tracking-widest text-black">
                                        {CATEGORY_LABELS[cat]}
                                    </h2>
                                </div>

                                <motion.div
                                    variants={staggerContainer}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {[...grouped[cat]!]
                                        .sort((a, b) => {
                                            const aB = String(a.isAvailable) === "true";
                                            const bB = String(b.isAvailable) === "true";
                                            if (aB === bB) return 0;
                                            return aB ? -1 : 1;
                                        })
                                        .map((item, idx) => (
                                            <MenuCard
                                                key={idx}
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
                        <div className="text-center pt-4">
                            <div className="h-px w-full bg-gray-100 mb-5" />
                            <p className="text-xs text-gray-400 font-bold flex items-center justify-center gap-1.5">
                                <Image
                                    src="/assets/tableOS-logo.svg"
                                    alt="TableOS"
                                    width={13}
                                    height={13}
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
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            className="fixed -bottom-7 left-0 right-0 z-40 flex justify-center"
                        >
                            <button
                                onClick={() => setShowCart(true)}
                                className="w-full max-w-lg flex items-center justify-between px-5 py-3.5 pb-10 rounded-t-3xl bg-blue-600 text-white border border-blue-600 active:scale-[0.98] transition-all cursor-pointer overflow-hidden relative group"
                            >
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="relative">
                                        <BagIcon />
                                        <AnimatePresence mode="popLayout">
                                            <motion.span
                                                key={cartCount}
                                                initial={{ scale: 0.5, y: -8, opacity: 0 }}
                                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                                exit={{ scale: 0.5, y: 8, opacity: 0 }}
                                                className="absolute -top-2 -right-2 w-4 h-4 bg-white text-blue-600 text-[10px] font-bold rounded-full flex items-center justify-center"
                                            >
                                                {cartCount}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                    <span className="text-sm font-bold tracking-wide">
                                        View Order
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-lg font-bold relative z-10">
                                    <motion.span
                                        key={cartCount}
                                        initial={{ y: -8, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 8, opacity: 0 }}
                                    >
                                        ₹{cartTotal.toFixed(2)}
                                    </motion.span>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M6 17L11 12L6 7M13 17L18 12L13 7"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {!search && usedCategories.length > 1 && (
                <CategoryDock
                    categories={usedCategories}
                    activeCategory={activeCategory}
                    onSelect={scrollToCategory}
                />
            )}

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
                        onViewBill={fetchBill}
                        placing={placing}
                        sessionUnpaidBalance={sessionUnpaidBalance}
                    />
                )}
                {showFilters && (
                    <FilterDrawer
                        onClose={() => setShowFilters(false)}
                        filters={filters}
                        setFilters={setFilters}
                        maxAvailablePrice={
                            Math.max(
                                ...items.map((i) => Number(i.offerPrice ?? i.basePrice)),
                                0,
                            ) || 2000
                        }
                        maxAvailablePrepTime={
                            Math.max(
                                ...items.map((i) => Number(i.preparationTime ?? 0)),
                                0,
                            ) || 3600
                        }
                    />
                )}
                {showNotifications && (
                    <NotificationsDrawer
                        activeOrder={activeOrder}
                        billData={billData}
                        isConfirmed={isOrderConfirmed}
                        isDeclined={isOrderDeclined}
                        isPaymentMode={isPaymentMode}
                        onClose={() => {
                            setShowNotifications(false);
                            if (isOrderConfirmed || isOrderDeclined) {
                                setIsOrderConfirmed(false);
                                setIsOrderDeclined(false);
                                setActiveOrder(null);
                                setIsPaymentMode(false);
                            }
                        }}
                        upiLink={
                            isPaymentMode && activeOrder
                                ? generateUPILink({
                                    upiId,
                                    storeName: storeDisplayName,
                                    amount: String(
                                        parseFloat(
                                            activeOrder.checkoutAmount || activeOrder.totalAmount,
                                        ) * 1.05,
                                    ),
                                    orderId: activeOrder.orderId,
                                })
                                : ""
                        }
                    />
                )}
                {showBill && billData && (
                    <ProfessionalBill
                        data={billData}
                        onClose={() => setShowBill(false)}
                        onPay={handlePayBillOnly}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
