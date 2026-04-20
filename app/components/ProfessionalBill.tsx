"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/app/lib/utils";

const TAX_RATE = 0.05;

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
};

const modalVariants = {
  hidden:  { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 26, stiffness: 300, delay: 0.05 } },
  exit:    { opacity: 0, y: 10, scale: 0.97, transition: { duration: 0.16 } },
} as const;

const listVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03, delayChildren: 0.1 } },
} as const;

const rowVariants = {
  hidden:  { opacity: 0, x: -6 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", damping: 24, stiffness: 300 } },
} as const;

function StoreLogo({ name }: { name: string }) {
  const initials = name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
  return (
    <div className="w-10 h-10 rounded-xl bg-zinc-900 grid place-items-center shrink-0">
      <span className="text-[13px] font-bold text-white tracking-tight">{initials}</span>
    </div>
  );
}

function BillHeader({ store, sessionId, startTime }: any) {
  const date = new Date(startTime);
  return (
    <header className="px-6 pt-6 pb-5 flex items-start justify-between gap-4 border-b border-zinc-100">
      <div className="flex items-center gap-3 min-w-0">
        <StoreLogo name={store.name} />
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-zinc-900 truncate leading-tight">{store.name}</h2>
          {store.address && <p className="mt-0.5 text-[11px] text-zinc-400 leading-snug truncate">{store.address}</p>}
          {store.upiId && (
            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100">
              <span className="text-[9px] text-zinc-400 uppercase tracking-wider">UPI</span>
              <span className="text-[10px] font-mono text-zinc-600">{store.upiId}</span>
            </div>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 mb-2">
          <span className="text-[9px] uppercase tracking-widest text-zinc-400">INV</span>
          <span className="text-[12px] font-mono font-bold text-white">#{sessionId.split("-")[0].toUpperCase()}</span>
        </div>
        <p className="text-[11px] text-zinc-400 block">
          {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
        <p className="text-[11px] text-zinc-400">
          {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </header>
  );
}

function StatPill({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center px-4 py-2 rounded-xl first:rounded-l-xl last:rounded-r-xl", accent ? "bg-emerald-50" : "bg-zinc-50")}>
      <span className={cn("text-[9px] uppercase tracking-widest font-semibold", accent ? "text-emerald-500" : "text-zinc-400")}>{label}</span>
      <span className={cn("text-[13px] font-bold leading-tight mt-0.5", accent ? "text-emerald-700" : "text-zinc-800")}>{value}</span>
    </div>
  );
}

function MetaStrip({ tableLabel, orderCount, itemCount, totalPaid }: any) {
  return (
    <section className="px-6 py-3.5 flex items-center justify-between gap-3 border-b border-zinc-100 bg-zinc-50/40">
      <div className="flex items-center gap-1.5">
        <StatPill label="Table"  value={tableLabel}          />
        <StatPill label="Orders" value={String(orderCount)}  />
        <StatPill label="Items"  value={String(itemCount)}   />
      </div>
      {totalPaid > 0 && (
        <StatPill label="Paid" value={`₹${totalPaid.toFixed(2)}`} accent />
      )}
    </section>
  );
}

function ItemRow({ item }: { item: any }) {
  const lineTotal = (item.quantity * parseFloat(item.soldAtPrice)).toFixed(2);
  return (
    <motion.li
      variants={rowVariants}
      className="grid grid-cols-12 gap-2 py-3 border-b border-zinc-50 last:border-0 group"
    >
      <div className="col-span-6 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] text-zinc-800 font-medium truncate">{item.itemNameAtOrder}</p>
          {item.isPaid && (
            <span className="shrink-0 inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200/80 px-1.5 py-px rounded-md font-bold">
              <span className="w-1 h-1 rounded-full bg-emerald-500 inline-block" />
              Paid
            </span>
          )}
        </div>
        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">#{item.orderId.split("-")[0]}</p>
      </div>
      <div className="col-span-2 text-right self-center text-[12px] text-zinc-500 tabular-nums">{item.quantity}</div>
      <div className="col-span-2 text-right self-center text-[12px] text-zinc-400 tabular-nums">
        ₹{parseFloat(item.soldAtPrice).toFixed(0)}
      </div>
      <div className="col-span-2 text-right self-center text-[13px] text-zinc-900 font-semibold tabular-nums">
        ₹{lineTotal}
      </div>
    </motion.li>
  );
}

function ItemsTable({ items }: any) {
  return (
    <section className="px-6 py-4">
      <div className="grid grid-cols-12 gap-2 pb-2.5 border-b border-zinc-200 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
        <div className="col-span-6">Item</div>
        <div className="col-span-2 text-right">Qty</div>
        <div className="col-span-2 text-right">Rate</div>
        <div className="col-span-2 text-right">Amount</div>
      </div>
      <motion.ul variants={listVariants} initial="hidden" animate="visible" className="mt-1">
        {items.map((item: any) => <ItemRow key={`${item.orderId}-${item.id}`} item={item} />)}
      </motion.ul>
    </section>
  );
}

function DividerLine() {
  return <div className="h-px bg-linear-to-r from-transparent via-zinc-200 to-transparent mx-6" />;
}

function BillSummary({ subtotal, tax, grandTotal, totalPaid, balanceDue, isFullyPaid }: any) {
  return (
    <section className="px-6 py-5">
      <div className="w-full mx-auto space-y-2">
        <div className="flex justify-between items-center text-[12px]">
          <span className="text-zinc-400">Subtotal</span>
          <span className="text-zinc-700 tabular-nums font-medium">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-[12px]">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Tax</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md ring-1 ring-amber-200/70">
              5%
            </span>
          </div>
          <span className="text-amber-600 tabular-nums font-medium">+₹{tax.toFixed(2)}</span>
        </div>

        <div className="h-px bg-zinc-100 my-1" />

        <div className="flex justify-between items-center">
          <span className="text-[13px] font-bold text-zinc-900">Grand Total</span>
          <span className="text-[16px] font-bold text-zinc-900 tabular-nums">₹{grandTotal.toFixed(2)}</span>
        </div>

        {totalPaid > 0 && (
          <div className="flex justify-between items-center text-[12px]">
            <span className="text-emerald-600 font-medium">Paid</span>
            <span className="text-emerald-600 tabular-nums font-semibold">−₹{totalPaid.toFixed(2)}</span>
          </div>
        )}
      </div>
    </section>
  );
}

function BillActions({ onClose }: any) {
  return (
    <footer className="border-t border-zinc-100 px-6 py-3.5 flex items-center justify-between gap-2 bg-white">
      <button
        onClick={onClose}
        className="h-9 px-4 rounded-xl text-[12px] font-semibold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
      >
        Close
      </button>
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.print()}
          className="h-9 px-4 rounded-xl text-[12px] font-semibold border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
        >
          Print
        </button>
        <button
          className="h-9 px-4 rounded-xl text-[12px] font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </footer>
  );
}

export default function ProfessionalBill({ data, onClose }: any) {
  const allItems = data.orders.flatMap((o: any) =>
    o.details.map((i: any) => ({ ...i, orderId: o.id, isPaid: o.paymentStatus === "paid" }))
  );

  const subtotal   = data.orders.reduce((s: number, o: any) => s + parseFloat(o.totalAmount), 0);
  const tax        = subtotal * TAX_RATE;
  const grandTotal = subtotal + tax;
  const totalPaid  = data.orders.filter((o: any) => o.paymentStatus === "paid").reduce((s: number, o: any) => s + parseFloat(o.totalAmount), 0);
  const balanceDue = grandTotal - totalPaid;
  const isFullyPaid = balanceDue <= 0;

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] overflow-hidden bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col"
      >
        <div className="overflow-y-auto flex-1 overscroll-contain">
          <BillHeader store={data.store} sessionId={data.id} startTime={data.startTime} />
          <MetaStrip
            tableLabel={data.table.tableLabel}
            orderCount={data.orders.length}
            itemCount={allItems.length}
            totalPaid={totalPaid}
          />
          <ItemsTable items={allItems} />
          <DividerLine />
          <BillSummary
            subtotal={subtotal}
            tax={tax}
            grandTotal={grandTotal}
            totalPaid={totalPaid}
            balanceDue={balanceDue}
            isFullyPaid={isFullyPaid}
          />
        </div>
        <BillActions onClose={onClose} />
      </motion.div>
    </motion.div>
  );
}