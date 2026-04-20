"use client";

import React, { createContext, useContext, useState, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/lib/utils";

type NotifType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message?: string;
  duration?: number;
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
      className="pointer-events-auto relative flex items-center gap-3 bg-white rounded-full border border-zinc-200 shadow-md px-4 py-2 w-fit min-w-[200px]"
    >
      {/* Icon and Title in one line */}
      <div className={cn("shrink-0", config.iconColor)}>
        {config.icon}
      </div>

      <div className="flex items-baseline gap-2 min-w-0 pr-4">
        <span className="text-[13px] font-bold text-zinc-900 whitespace-nowrap">
          {notif.title}
        </span>
        {notif.message && (
          <span className="text-[12px] text-zinc-500 truncate max-w-[150px]">
            {notif.message}
          </span>
        )}
      </div>

      {/* Simplified Close Button */}
      <button
        onClick={() => onDismiss(notif.id)}
        className="ml-auto p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-9999 w-full max-w-sm px-4 flex flex-col gap-2 pointer-events-none sm:top-6 sm:right-4 sm:left-auto sm:translate-x-0 sm:max-w-[360px]">
      <AnimatePresence initial={false} mode="sync">
        {notifications.map((n) => (
          <NotifItem key={n.id} notif={n} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((payload: Omit<Notification, "id">) => {
    const id = crypto.randomUUID();
    setNotifications((prev) => [{ ...payload, id }, ...prev]);
    if (payload.duration !== 0) {
      setTimeout(() => dismiss(id), payload.duration ?? 5000);
    }
  }, [dismiss]);

  return (
    <NotifContext.Provider value={{ notify, dismiss }}>
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

export function useDismiss() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error("useDismiss must be used within NotificationProvider");
  return ctx.dismiss;
}