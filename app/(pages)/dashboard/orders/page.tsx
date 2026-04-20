"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loading, OrderIcon, PlusIcon } from "@/app/components/icons/svg";
import ProfessionalBill from "@/app/components/ProfessionalBill";
import { useUser } from "@/app/context/UserContext";
import { apiRequest } from "@/app/utility/api";
import { toast } from "sonner";
import { cn } from "@/app/lib/utils";
import { useSocket } from "@/app/hooks/useSocket";

const playNewOrderSound = () => {
    try {
        const audio = new Audio(
            "https://audio-previews.elements.envatousercontent.com/files/746568278/preview.mp3"
        );
        audio.play().catch(() => { });
    } catch { }
};

type OrderStatus =
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "served"
    | "cancelled";

interface ApiResponse {
    status: number;
    message: string;
    data: {
        orders: Order[];
    };
}

interface TableSession {
    id: string;
    tableId: string;
    storeId: string;
    startTime: string;
    status: string;
    table?: { tableLabel: string };
}

const STATUS_PRIORITY: Record<string, number> = {
    pending: 1,
    confirmed: 2,
    preparing: 3,
    ready: 4,
    served: 5,
    cancelled: 6,
};
interface OrderItem {
    id: string;
    itemNameAtOrder: string;
    quantity: number;
    soldAtPrice: string;
    customerNote: string | null;
}

interface Order {
    id: string;
    tableId: string;
    storeId: string;
    orderStatus: OrderStatus;
    paymentStatus: string;
    totalAmount: string;
    orderedAt: string;
    tableSessionId: string;
    table?: { tableLabel: string };
    details?: OrderItem[];
}

const STATUS_META: Record<
    OrderStatus,
    { label: string; dot: string; text: string; }
> = {
    pending: {
        label: "Pending",
        dot: "bg-amber-500",
        text: "text-amber-700",
    },
    confirmed: {
        label: "Confirmed",
        dot: "bg-blue-500",
        text: "text-blue-700",
    },
    preparing: {
        label: "Preparing",
        dot: "bg-purple-500",
        text: "text-purple-700",
    },
    ready: {
        label: "Ready",
        dot: "bg-green-500",
        text: "text-green-700",
    },
    served: {
        label: "Served",
        dot: "bg-slate-500",
        text: "text-slate-500",
    },
    cancelled: {
        label: "Declined",
        dot: "bg-rose-500",
        text: "text-rose-700",
    },
};

const grid = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

const card = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 26, stiffness: 280 } },
    exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
} as const;

function StatusBadge({ status }: { status: OrderStatus }) {
    const m = STATUS_META[status];
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white"
        >
            {m.label !== "Served" && (
                <span
                    className={cn(
                        ["Pending", "Confirmed", "Preparing"].includes(m.label) ? "animate-pulse" : "",
                        "h-1.5 w-1.5 rounded-full",
                        m.dot
                    )}
                />
            )}
            <span className={cn("text-[10px] font-bold tracking-wide uppercase", m.text)}>
                {m.label}
            </span>
        </span>
    );
}

function timeAgo(iso: string) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}

function OrderCard({
    order,
    onUpdateStatus,
    onVerifyPayment,
    onDecline,
    onFetchBill,
    fetchingBill,
}: {
    order: Order;
    onUpdateStatus: (id: string, status: string) => void;
    onVerifyPayment: (id: string) => void;
    onDecline: (id: string) => void;
    onFetchBill: (sessionId: string) => void;
    fetchingBill: boolean;
}) {
    const isPaid = order.paymentStatus === "paid";
    const status = order.orderStatus;

    const finalAmount = parseFloat(order.totalAmount);
    const taxRate = 0.05;
    const subtotal = parseFloat((finalAmount / (1 + taxRate)).toFixed(2));
    const taxAmount = parseFloat((finalAmount - subtotal).toFixed(2));
    return (
        <motion.article
            layout
            variants={card}
            exit="exit"
            className={cn("group flex flex-col bg-white rounded-lg overflow-hidden h-fit shadow-sm border border-gray-200 transition-colors")}
        >
            <header className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-3 border-b border-gray-100">
                <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
                            {order.table?.tableLabel}
                        </h3>
                        <span className="text-[11px] text-gray-400 font-mono">
                            #{order.id.split("-")[0]}
                        </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                        {timeAgo(order.orderedAt)}
                    </p>
                </div>
                <StatusBadge status={status} />
            </header>

            <ul className="flex-1 px-4 py-3 space-y-2">
                {order.details?.map((item) => (
                    <li key={item.id} className="flex items-start font-bold justify-between gap-3 text-sm">
                        <div className="flex gap-2 min-w-0">
                            <span className="shrink-0 text-black tabular-nums w-6">
                                {item.quantity}×
                            </span>
                            <div className="min-w-0">
                                <p className="text-black leading-snug truncate">
                                    {item.itemNameAtOrder}
                                </p>
                                {item.customerNote && (
                                    <p className="mt-0.5 text-[11px] text-black italic line-clamp-2">
                                        “{item.customerNote}”
                                    </p>
                                )}
                            </div>
                        </div>
                        <span className="shrink-0 text-gray-700 tabular-nums">
                            ₹{parseFloat(item.soldAtPrice)}
                        </span>
                    </li>
                ))}
            </ul>

            <footer className="bg-gray-200/30 px-4 py-3 space-y-3">
                <div className="flex items-end justify-between">
                    <div className="space-y-1">
                        <p className="text-xl font-bold flex items-baseline gap-0.5 text-black tabular-nums leading-none">
                            <span className="text-sm font-bold mr-0.5">₹</span>
                            {finalAmount}
                        </p>
                        <div className="flex items-center gap-px text-[12px] font-bold text-gray-400 uppercase tracking-tight">
                            <span>₹{subtotal}</span>
                            <PlusIcon className="w-3 h-3 text-green-600" />
                            <span className=" text-green-600">₹{taxAmount}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => onFetchBill(order.tableSessionId)}
                        disabled={fetchingBill}
                        className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-md text-[11px] font-bold text-gray-500 hover:bg-gray-200/50 hover:text-gray-900 transition-all disabled:opacity-40"
                    >
                        <OrderIcon className="h-3.5 w-3.5" />
                        View bill
                    </button>
                </div>

                <ActionButtons
                    status={status}
                    isPaid={isPaid}
                    orderId={order.id}
                    onUpdateStatus={onUpdateStatus}
                    onVerifyPayment={onVerifyPayment}
                    onDecline={onDecline}
                />
            </footer>
        </motion.article>
    );
}

function ActionButtons({
    status,
    isPaid,
    orderId,
    onUpdateStatus,
    onVerifyPayment,
    onDecline,
}: {
    status: OrderStatus;
    isPaid: boolean;
    orderId: string;
    onUpdateStatus: (id: string, s: string) => void;
    onVerifyPayment: (id: string) => void;
    onDecline: (id: string) => void;
}) {
    const base =
        "h-8 text-[11px] font-bold tracking-wide rounded-md transition-colors cursor-pointer";

    if (!isPaid && status === "pending") {
        return (
            <div className="grid grid-cols-2 gap-1.5">
                <button
                    onClick={() => onDecline(orderId)}
                    className={cn(base, "border border-red-500 text-white bg-red-600 hover:bg-red-700")}
                >
                    Decline
                </button>
                <button
                    onClick={() => onVerifyPayment(orderId)}
                    className={cn(base, "bg-green-600 text-white hover:bg-green-700")}
                >
                    Accept
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-1.5">
            {status === "pending" && (
                <>
                    <button
                        onClick={() => onUpdateStatus(orderId, "cancelled")}
                        className={cn(base, "border border-gray-200 text-gray-600 hover:bg-gray-100")}
                    >
                        Decline
                    </button>
                    <button
                        onClick={() => onUpdateStatus(orderId, "confirmed")}
                        className={cn(base, "bg-blue-600 text-white hover:bg-blue-700")}
                    >
                        Accept Order
                    </button>
                </>
            )}
            {status === "confirmed" && (
                <button
                    onClick={() => onUpdateStatus(orderId, "preparing")}
                    className={cn(base, "col-span-2 bg-indigo-600 text-white hover:bg-indigo-700")}
                >
                    Start Preparing
                </button>
            )}
            {status === "preparing" && (
                <button
                    onClick={() => onUpdateStatus(orderId, "ready")}
                    className={cn(base, "col-span-2 bg-violet-600 text-white hover:bg-violet-700")}
                >
                    Mark as Ready
                </button>
            )}
            {status === "ready" && (
                <button
                    onClick={() => onUpdateStatus(orderId, "served")}
                    className={cn(base, "col-span-2 bg-emerald-600 text-white hover:bg-emerald-700")}
                >
                    Mark as Served
                </button>
            )}
        </div>
    );
}

export default function OrdersPage() {
    const { storeId } = useUser();
    const [orders, setOrders] = useState<Order[]>([]);
    const [sessions, setSessions] = useState<TableSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBill, setShowBill] = useState(false);
    const [billData, setBillData] = useState<any>(null);
    const [fetchingBill, setFetchingBill] = useState(false);

    const { socket } = useSocket(storeId || undefined);

    const fetchData = useCallback(async () => {
        if (!storeId) return;
        try {
            const [orderRes, sessionRes] = await Promise.all([
                apiRequest<ApiResponse>(`/owner/orders/list?storeId=${storeId}`),
                apiRequest<{ status: number; data: { sessions: TableSession[] } }>(`/owner/orders/sessions?storeId=${storeId}`)
            ]);
            if (orderRes.status === 200) setOrders(orderRes.data.orders || []);
            if (sessionRes.status === 200) setSessions(sessionRes.data.sessions || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [storeId]);

    useEffect(() => {
        fetchData();
        if (!socket) return;

        socket.on("order:new", (data: any) => {
            toast.success(`${data.tableLabel} with ₹${data.totalAmount}`, {
                duration: 10000,
            });
            playNewOrderSound();
            fetchData();
        });
        socket.on("order:confirmed", fetchData);
        socket.on("session:closed", fetchData);

        return () => {
            socket.off("order:new");
            socket.off("order:confirmed");
            socket.off("session:closed");
        };
    }, [storeId, socket, fetchData]);

    const verifyPayment = (orderId: string) => {
        if (!socket || !storeId) return;
        socket.emit("verify:payment", { orderId, storeId });
        toast.success(`Order #${orderId.slice(0, 4)}... Confirmed!`);
        fetchData();
    };

    const declineOrder = (orderId: string) => {
        if (!socket || !storeId) return;
        socket.emit("order:decline", { orderId, storeId });
        toast.error(`Order #${orderId.slice(0, 4)}... Declined!`);
        fetchData();
    };

    const updateStatus = async (orderId: string, status: string) => {
        try {
            const res = await apiRequest<ApiResponse>("/owner/orders/status", {
                method: "PATCH",
                body: { orderId, status },
            });
            if (res.status === 200) {
                toast.success(`Order #${orderId.slice(0, 4)}... ${status.charAt(0).toUpperCase() + status.slice(1)}!`);
                fetchData();
            }
        } catch {
            toast.error("Failed to update");
        }
    };

    const fetchBill = async (tableSessionId: string) => {
        setFetchingBill(true);
        try {
            const res = await apiRequest<ApiResponse>(
                `/customer/order/bill?tableSessionId=${tableSessionId}`
            );
            if (res.status === 200) {
                setBillData(res.data);
                setShowBill(true);
            } else toast.error(res.message);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setFetchingBill(false);
        }
    };

    const handleEndSession = async (tableSessionId: string) => {
        toast.info("End this session?"
            ,
            {
                action: {
                    label: "Yes",
                    onClick: async () => {
                        try {
                            const res = await apiRequest<any>("/owner/orders/session-end", {
                                method: "POST",
                                body: { tableSessionId }
                            });
                            if (res.status === 200) {
                                toast.success("Session ended and table freed!");
                                fetchData();
                            } else {
                                toast.error(res.message);
                            }
                        } catch (err: any) {
                            toast.error(err.message);
                        }
                    }
                }
            }
        );
    };

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-7xl">
                <motion.header
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex flex-col gap-4 pb-5 mb-5 border-b border-gray-200"
                >
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2.5 mb-1">
                                <OrderIcon className="w-6 h-6 text-black" />
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
                            </div>
                            <p className="text-sm text-gray-400 ml-8.5">
                                {loading
                                    ? "Loading…"
                                    : `${orders.length} order${orders.length !== 1 ? "s" : ""} in queue`}
                            </p>
                        </div>
                    </div>
                </motion.header>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loading />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {sessions.length > 0 && (
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900">Active Tables</h2>                                </div>
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {sessions.sort((a, b) => (a.table?.tableLabel || "").localeCompare(b.table?.tableLabel || "")).map((session) => (
                                        <div
                                            key={session.id}
                                            className="flex flex-col gap-2 p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-all group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-gray-900">
                                                    {session.table?.tableLabel}
                                                </span>
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-mono truncate">
                                                ID: {session.id.slice(0, 8)}...
                                            </p>
                                            <button
                                                onClick={() => handleEndSession(session.id)}
                                                className="cursor-pointer mt-1 w-full py-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-600 hover:text-white transition-colors"
                                            >
                                                End Session
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900">Orders</h2>
                            <motion.div
                                variants={grid}
                                initial="hidden"
                                animate="visible"
                                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                            >
                                <AnimatePresence mode="popLayout">
                                    {orders
                                        .sort((a, b) => {
                                            const priorityA = STATUS_PRIORITY[a.orderStatus] || 99;
                                            const priorityB = STATUS_PRIORITY[b.orderStatus] || 99;

                                            if (priorityA !== priorityB) {
                                                return priorityA - priorityB;
                                            }

                                            return new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime();
                                        })
                                        .map((order) => (

                                            <OrderCard
                                                key={order.id}
                                                order={order}
                                                onUpdateStatus={updateStatus}
                                                onVerifyPayment={verifyPayment}
                                                onDecline={declineOrder}
                                                onFetchBill={fetchBill}
                                                fetchingBill={fetchingBill}
                                            />
                                        ))}
                                </AnimatePresence>
                            </motion.div>
                        </section>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showBill && billData && (
                    <ProfessionalBill data={billData} onClose={() => setShowBill(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}
