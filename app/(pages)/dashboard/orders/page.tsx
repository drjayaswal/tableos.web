"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
    | "accepted"
    | "preparing"
    | "ready"
    | "served"
    | "declined"
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
    accepted: 2,
    confirmed: 2,
    preparing: 3,
    ready: 4,
    served: 5,
    declined: 6,
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
    pending: { label: "Pending", dot: "bg-amber-500", text: "text-amber-700" },
    accepted: { label: "Accepted", dot: "bg-blue-500", text: "text-blue-700" },
    confirmed: { label: "Confirmed", dot: "bg-blue-500", text: "text-blue-700" },
    preparing: { label: "Preparing", dot: "bg-purple-500", text: "text-purple-700" },
    ready: { label: "Ready", dot: "bg-green-500", text: "text-green-700" },
    served: { label: "Served", dot: "bg-slate-500", text: "text-slate-500" },
    declined: { label: "Declined", dot: "bg-rose-500", text: "text-rose-700" },
    cancelled: { label: "Cancelled", dot: "bg-gray-500", text: "text-gray-700" },
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
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white">
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

function EmptyState({ title, description, icon: Icon }: { title: string; description: string; icon?: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30 text-center"
        >
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                {Icon ? <Icon className="w-6 h-6 text-gray-300" /> : <OrderIcon className="w-6 h-6 text-gray-300" />}
            </div>
            <h3 className="text-sm font-bold text-black mb-1">{title}</h3>
            <p className="text-xs text-gray-400 font-medium max-w-[200px] leading-relaxed">
                {description}
            </p>
        </motion.div>
    );
}

function OrderCard({
    order,
    onUpdateStatus,
    onVerifyPayment,
    onDecline,
    onAccept,
    onFetchBill,
    fetchingBill,
}: {
    order: Order;
    onUpdateStatus: (id: string, status: string) => void;
    onVerifyPayment: (id: string) => void;
    onDecline: (id: string) => void;
    onAccept: (id: string) => void;
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
            <header className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                        <h3 className="sm:text-sm text-xs font-semibold text-black tracking-tight">
                            {order.table?.tableLabel}
                        </h3>
                        <span className="text-[11px] text-gray-400 font-mono">
                            #{order.id.split("-")[0]}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <StatusBadge status={status} />
                    {status === "pending" && (
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide", isPaid ? "bg-green-600 text-white" : "bg-amber-600/10 text-amber-600")}>
                            {isPaid ? "Paid" : "Unpaid"}
                        </span>
                    )}
                </div>
            </header>

            <ul className="flex-1 px-4 py-3 space-y-2">
                {order.details?.map((item) => (
                    <li key={item.id} className="flex items-start font-bold justify-between gap-3 sm:text-sm text-xs ">
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

            <footer className="bg-gray-200/25 px-4 py-3 space-y-3">
                <div className="flex items-end justify-between">
                    <div className="space-y-1">
                        <p className="text-xl font-bold flex items-baseline gap-0.5 text-black tabular-nums leading-none">
                            <span className="sm:text-sm text-xs font-bold mr-0.5">₹</span>
                            {finalAmount}
                        </p>
                        <div className="flex items-center gap-px text-[12px] font-bold text-gray-400 uppercase tracking-tight">
                            <span>₹{subtotal}</span>
                            <PlusIcon className="w-3 h-3 text-green-600" />
                            <span className="text-green-600">₹{taxAmount}</span>
                        </div>
                    </div>
                    {status !== "declined" && status !== "cancelled" && (
                        <button
                            onClick={() => onFetchBill(order.tableSessionId)}
                            disabled={fetchingBill}
                            className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-md text-[11px] font-bold text-gray-500 hover:bg-gray-200/50 hover:text-black transition-all disabled:opacity-40"
                        >
                            <OrderIcon className="h-3.5 w-3.5" />
                            View bill
                        </button>
                    )}
                </div>

                <ActionButtons
                    status={status}
                    isPaid={isPaid}
                    orderId={order.id}
                    onUpdateStatus={onUpdateStatus}
                    onVerifyPayment={onVerifyPayment}
                    onDecline={onDecline}
                    onAccept={onAccept}
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
    onAccept,
}: {
    status: OrderStatus;
    isPaid: boolean;
    orderId: string;
    onUpdateStatus: (id: string, s: string) => void;
    onVerifyPayment: (id: string) => void;
    onDecline: (id: string) => void;
    onAccept: (id: string) => void;
}) {
    const base = "h-8 text-[11px] font-bold tracking-wide rounded-md transition-colors cursor-pointer";

    if (status === "pending") {
        if (isPaid) {
            return (
                <div className="grid grid-cols-2 gap-1.5">
                    <button onClick={() => onDecline(orderId)} className={cn(base, "border border-red-500 text-white bg-red-600 hover:bg-red-700")}>Decline</button>
                    <button onClick={() => onVerifyPayment(orderId)} className={cn(base, "bg-green-600 text-white hover:bg-green-700")}>Accept Payment</button>
                </div>
            );
        } else {
            return (
                <div className="grid grid-cols-2 gap-1.5">
                    <button onClick={() => onDecline(orderId)} className={cn(base, "border border-red-500 text-white bg-red-600 hover:bg-red-700")}>Decline</button>
                    <button onClick={() => onAccept(orderId)} className={cn(base, "bg-blue-600 text-white hover:bg-blue-700")}>Accept Order</button>
                </div>
            );
        }
    }

    return (
        <div className="grid grid-cols-2 gap-1.5">
            {status === "accepted" && (
                <button onClick={() => onUpdateStatus(orderId, "preparing")} className={cn(base, "col-span-2 bg-indigo-600 text-white hover:bg-indigo-700")}>Start Preparing</button>
            )}
            {status === "preparing" && (
                <button onClick={() => onUpdateStatus(orderId, "ready")} className={cn(base, "col-span-2 bg-violet-600 text-white hover:bg-violet-700")}>Mark as Ready</button>
            )}
            {status === "ready" && (
                <button onClick={() => onUpdateStatus(orderId, "served")} className={cn(base, "col-span-2 bg-emerald-600 text-white hover:bg-emerald-700")}>Mark as Served</button>
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
            const orderRef = data.id ? ` #${data.id.slice(0, 6).toUpperCase()}` : "";
            toast.success("New Order Received", {
                description: `Table ${data.tableLabel} placed order${orderRef} for ₹${data.totalAmount}.`,
                duration: 10000,
            });
            playNewOrderSound();
            fetchData();
        });

        socket.on("bill:payment:intent", (data: any) => {
            toast.info("Payment Verification Required", {
                description: `UPI payment intent received for Table ${data.tableLabel || "Session"}. Verify the transaction?`,
                action: {
                    label: "Approve",
                    onClick: () => {
                        socket.emit("verify:session_payment", { tableSessionId: data.tableSessionId, storeId });
                        toast.success("Payment Approved", { description: "Session balance updated to paid." });
                        fetchData();
                    }
                },
                cancel: {
                    label: "Decline",
                    onClick: () => {
                        socket.emit("decline:session_payment", { tableSessionId: data.tableSessionId, storeId });
                        toast.error("Payment Declined", { description: "Notification sent back to the customer." });
                    }
                },
                duration: Infinity
            });
            playNewOrderSound();
        });

        socket.on("order:confirmed", fetchData);
        socket.on("order:declined", fetchData);
        socket.on("session:closed", fetchData);
        socket.on("session:payment:verified", fetchData);
        socket.on("session:payment:declined", fetchData);

        return () => {
            socket.off("order:new");
            socket.off("bill:payment:intent");
            socket.off("order:confirmed");
            socket.off("order:declined");
            socket.off("session:closed");
            socket.off("session:payment:verified");
            socket.off("session:payment:declined");
        };
    }, [storeId, socket, fetchData]);

    const activeOrders = useMemo(() => orders.filter(o => !["served", "declined", "cancelled"].includes(o.orderStatus)), [orders]);
    const recentOrders = useMemo(() => orders.filter(o => ["served", "declined", "cancelled"].includes(o.orderStatus)), [orders]);

    const sortedActive = useMemo(() => [...activeOrders].sort((a, b) => {
        const priorityA = STATUS_PRIORITY[a.orderStatus] || 99;
        const priorityB = STATUS_PRIORITY[b.orderStatus] || 99;
        if (priorityA !== priorityB) return priorityA - priorityB;
        return new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime();
    }), [activeOrders]);

    const sortedRecent = useMemo(() => [...recentOrders].sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()), [recentOrders]);

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

    const acceptOrder = (orderId: string) => {
        if (!socket || !storeId) return;
        socket.emit("order:accept", { orderId, storeId });
        toast.success(`Order #${orderId.slice(0, 4)}... Accepted!`);
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
            const res = await apiRequest<ApiResponse>(`/customer/order/bill?tableSessionId=${tableSessionId}`);
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
        const sessionOrders = orders.filter(o => o.tableSessionId === tableSessionId);
        const unpaidAmount = sessionOrders
            .filter(o => o.paymentStatus !== "paid" && !["declined", "cancelled"].includes(o.orderStatus))
            .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

        const endSession = async (msg: string) => {
            try {
                const res = await apiRequest<any>("/owner/orders/session-end", {
                    method: "POST",
                    body: { tableSessionId }
                });
                if (res.status === 200) {
                    toast.success(msg);
                    fetchData();
                } else {
                    toast.error(res.message);
                }
            } catch (err: any) {
                toast.error(err.message);
            }
        };

        if (unpaidAmount > 0) {
            toast.warning(`Unpaid Amount: ₹${unpaidAmount.toFixed(2)}`, {
                description: "Confirm collection of payment and end session?",
                action: { label: "Collect & End", onClick: () => endSession("Payment collected and session ended!") }
            });
        } else {
            toast.info("End this session?", {
                action: { label: "Yes", onClick: () => endSession("Session ended and table freed!") }
            });
        }
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
                                <h1 className="text-2xl font-bold text-black tracking-tight">Orders</h1>
                            </div>
                            <p className="sm:text-sm text-xs text-gray-400 ml-8.5">
                                {loading ? "Loading…" : `${orders.length} total order${orders.length !== 1 ? "s" : ""}`}
                            </p>
                        </div>
                    </div>
                </motion.header>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loading className="animate-spin w-4 h-4" />
                    </div>
                ) : (
                    <div className="space-y-12">
                        <section className="space-y-4">
                            <h2 className="text-lg font-bold text-black">Active Tables</h2>
                            {sessions.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {sessions.sort((a, b) => (a.table?.tableLabel || "").localeCompare(b.table?.tableLabel || "")).map((session) => (
                                        <div key={session.id} className="flex flex-col gap-2 p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-all group">
                                            <div className="flex items-center justify-between">
                                                <span className="sm:text-sm text-xs font-bold text-black">{session.table?.tableLabel}</span>
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-mono truncate">ID: {session.id.slice(0, 8)}...</p>
                                            <button onClick={() => handleEndSession(session.id)} className="sm:hidden block cursor-pointer mt-1 w-full py-1.5 text-[10px] font-bold uppercase tracking-wider text-white bg-rose-500 rounded-lg">End</button>
                                            <button onClick={() => handleEndSession(session.id)} className="sm:block hidden cursor-pointer mt-1 w-full py-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-600 hover:text-white transition-colors">End Session</button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState title="No Active Tables" description="All tables are currently free. New sessions will appear here." icon={PlusIcon} />
                            )}
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-lg font-bold text-black">Active Orders</h2>
                            {sortedActive.length > 0 ? (
                                <motion.div variants={grid} initial="hidden" animate="visible" className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
                                    <AnimatePresence mode="popLayout">
                                        {sortedActive.map((order) => (
                                            <div key={order.id} className="break-inside-avoid mb-3">
                                                <OrderCard
                                                    order={order}
                                                    onUpdateStatus={updateStatus}
                                                    onVerifyPayment={verifyPayment}
                                                    onDecline={declineOrder}
                                                    onAccept={acceptOrder}
                                                    onFetchBill={fetchBill}
                                                    fetchingBill={fetchingBill}
                                                />
                                            </div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            ) : (
                                <EmptyState title="No Active Orders" description="Waiting for new orders from customers. Pending orders will show up here." />
                            )}
                        </section>

                        {recentOrders.length > 0 && (
                            <section className="space-y-4">
                                <h2 className="text-lg font-bold text-black/40">Recent Orders</h2>
                                <motion.div variants={grid} initial="hidden" animate="visible" className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3 opacity-60 grayscale-[0.5] hover:grayscale-0 transition-all duration-300">
                                    <AnimatePresence mode="popLayout">
                                        {sortedRecent.map((order) => (
                                            <div key={order.id} className="break-inside-avoid mb-3">
                                                <OrderCard
                                                    order={order}
                                                    onUpdateStatus={updateStatus}
                                                    onVerifyPayment={verifyPayment}
                                                    onDecline={declineOrder}
                                                    onAccept={acceptOrder}
                                                    onFetchBill={fetchBill}
                                                    fetchingBill={fetchingBill}
                                                />
                                            </div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            </section>
                        )}
                        
                        {orders.length === 0 && sessions.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                    <OrderIcon className="w-10 h-10 text-gray-200" />
                                </div>
                                <h2 className="text-xl font-bold text-black mb-2">Welcome to tableOS</h2>
                                <p className="text-gray-400 text-sm max-w-sm mx-auto">
                                    Your dashboard is ready! Once customers scan QR codes and place orders, they will appear right here.
                                </p>
                            </div>
                        )}
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
