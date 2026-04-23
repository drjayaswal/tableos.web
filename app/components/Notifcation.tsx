"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/lib/utils";

type NotifType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message?: string;
  duration?: number;
  /** Unix ms timestamp — stored so history survives refreshes with real times */
  timestamp?: number;
}

interface NotifContextValue {
  notify: (n: Omit<Notification, "id">) => void;
  dismiss: (id: string) => void;
}

const NotifContext = createContext<NotifContextValue | null>(null);

const itemVariants = {
  initial: { opacity: 0, y: -16, scale: 0.94 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 22, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.94, y: -8, transition: { duration: 0.18, ease: "easeIn" } },
} as const;

const TYPE_CONFIG: Record<NotifType, { icon: React.ReactNode; bar: string; iconColor: string }> = {
  success: {
    bar: "bg-emerald-500",
    iconColor: "text-emerald-600",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  error: {
    bar: "bg-rose-500",
    iconColor: "text-rose-500",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  warning: {
    bar: "bg-amber-400",
    iconColor: "text-amber-500",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2L14.5 13H1.5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 7v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
  info: {
    bar: "bg-blue-500",
    iconColor: "text-blue-500",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 7v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="5" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
};

function NotifItem({ notif, onDismiss }: { notif: Notification; onDismiss: (id: string) => void }) {
  const config = TYPE_CONFIG[notif.type];

  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="pointer-events-auto relative flex items-center gap-2.5 w-full bg-white rounded-2xl border border-zinc-200 shadow-lg px-3.5 py-2.5"
    >
      <div className={cn("shrink-0", config.iconColor)}>
        {config.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-zinc-900 leading-snug">{notif.title}</p>
        {notif.message && (
          <p className="text-[11px] text-zinc-500 leading-snug mt-0.5 line-clamp-2">{notif.message}</p>
        )}
      </div>

      <button
        onClick={() => onDismiss(notif.id)}
        className="shrink-0 p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </motion.div>
  );
}

function NotifPortal({ notifications, dismiss }: { notifications: Notification[]; dismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-9999 w-[calc(100%-2rem)] max-w-sm flex flex-col gap-2 pointer-events-none sm:left-auto sm:right-5 sm:translate-x-0 sm:max-w-[380px]">
      <AnimatePresence initial={false} mode="sync">
        {notifications.map((n) => (
          <NotifItem key={n.id} notif={n} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

/**
 * Safely read the persisted notification history from localStorage.
 * Called once as the lazy initializer for useState — runs before the first render,
 * so the save-effect never sees an empty initial state and won't overwrite stored data.
 */
function loadHistoryFromStorage(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("notif_history");
    return saved ? (JSON.parse(saved) as Notification[]) : [];
  } catch {
    return [];
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // FIX 2: Lazy-initialize from localStorage so the initial state is the persisted
  // history. This means the save-effect always writes real data (never an empty array
  // from the initial render before the load-effect could fire).
  const [history, setHistory] = useState<Notification[]>(loadHistoryFromStorage);

  // FIX 1: Track recently-added notifications by content key so that duplicate
  // socket emits (e.g. React StrictMode double-invoke, isPaymentMode re-register)
  // within a 2-second window are silently ignored.
  const recentKeys = useRef<Map<string, number>>(new Map());

  // Persist history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("notif_history", JSON.stringify(history));
    } catch {
      // quota exceeded — ignore
    }
  }, [history]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((payload: Omit<Notification, "id">) => {
    // ── Deduplication guard ────────────────────────────────────────────────────
    // Build a content key: same type + title + message within 2 s = duplicate.
    const dedupeKey = `${payload.type}|${payload.title}|${payload.message ?? ""}`;
    const now = Date.now();
    const lastSeen = recentKeys.current.get(dedupeKey);
    if (lastSeen !== undefined && now - lastSeen < 2000) {
      // Duplicate within 2 s — skip silently
      return;
    }
    recentKeys.current.set(dedupeKey, now);
    // Prune old entries from the map every time to avoid unbounded growth
    for (const [key, ts] of recentKeys.current.entries()) {
      if (now - ts > 10_000) recentKeys.current.delete(key);
    }
    // ──────────────────────────────────────────────────────────────────────────

    const id = crypto.randomUUID();
    const newNotif: Notification = { ...payload, id, timestamp: now };
    setNotifications((prev) => [newNotif, ...prev]);
    setHistory((prev) => [newNotif, ...prev].slice(0, 50)); // keep last 50

    if (payload.duration !== 0) {
      setTimeout(() => dismiss(id), payload.duration ?? 5000);
    }
  }, [dismiss]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem("notif_history");
  }, []);

  return (
    <NotifContext.Provider value={{ notify, dismiss, history, clearHistory } as any}>
      {children}
      <NotifPortal notifications={notifications} dismiss={dismiss} />
    </NotifContext.Provider>
  );
}

export function useNotify() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error("useNotify must be used within NotificationProvider");
  return ctx.notify;
}

export function useNotificationHistory() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error("useNotificationHistory must be used within NotificationProvider");
  return {
    history: (ctx as any).history as Notification[],
    clearHistory: (ctx as any).clearHistory as () => void,
  };
}

export function useDismiss() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error("useDismiss must be used within NotificationProvider");
  return ctx.dismiss;
}