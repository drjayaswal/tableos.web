"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "./ui/button";
import {
  Document, Page, Text, View, StyleSheet, pdf, Svg, Rect, Image as PdfImage,
} from "@react-pdf/renderer";

const TAX_RATE = 0.05;

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.16 } },
};

const modalVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 30, stiffness: 360, delay: 0.04 } },
  exit: { opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.15 } },
} as const;

function TableOSLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <Image src="/assets/tableOS-logo.svg" alt="tableOS" width={50} height={50} />
      <div className="text-3xl font-bold text-black">tableOS</div>
    </div>
  );
}

function BillHeader({ store, sessionId, startTime }: any) {
  const date = new Date(startTime);
  return (
    <div className="px-7 pt-7 pb-5">
      <div className="flex items-start justify-between">
        <TableOSLogo />
        <div className="text-right leading-none">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/40 mb-1">Invoice</div>
          <div className="text-[13px] font-bold font-mono text-black tracking-tight">
            #{sessionId.slice(0, 8).toUpperCase()}
          </div>
          <div className="text-[11px] text-black/50 font-medium mt-2">
            {date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </div>
          <div className="text-[10px] text-black/35 mt-0.5">
            {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
          </div>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-black/10">
        <div className="text-[11px] font-bold uppercase text-black/35 mb-1.5">Billed At</div>
        <div className="text-[15px] font-bold text-black tracking-tight">{store.name}</div>
        {store.address && (
          <div className="text-[11px] text-black/50 mt-0.5 leading-relaxed max-w-[220px]">{store.address}</div>
        )}
        {store.upiId && (
          <div className="text-[11px] text-black/50">
            UPI · <span className="text-black/60">{store.upiId}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemRow({ item, index }: { item: any; index: number }) {
  const rate = parseFloat(item.soldAtPrice);
  const total = item.quantity * rate;

  return (
    <tr className="border-b border-black/6 last:border-0">
      <td className="py-3 pr-3">
        <div className="text-[13px] font-bold text-black leading-tight">{item.itemNameAtOrder}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] font-mono text-black/30 uppercase tracking-tight">
            #{item.orderId.slice(0, 6).toUpperCase()}
          </span>
          {item.isPaid ? (
            <span className="text-[9px] font-bold uppercase flex items-center gap-1 tracking-wide text-white bg-green-600 border border-green-600 px-1.5 py-1 rounded-md leading-none">
              <div className="bg-white w-1 h-1 rounded-full" />
              PAID
            </span>
          ) : (
            <span className="text-[9px] font-bold uppercase flex items-center gap-1 tracking-wide text-white bg-amber-500 border border-amber-500 px-1.5 py-1 rounded-md leading-none">
              <div className="bg-white w-1 h-1 rounded-full" />
              UNPAID
            </span>
          )}
        </div>
      </td>
      <td className="py-3 text-center text-[12px] text-black/50 font-bold tabular-nums w-10">
        {item.quantity}
      </td>
      <td className="py-3 text-right text-[11px] text-black/40 tabular-nums font-medium w-20">
        ₹{rate.toFixed(2)}
      </td>
      <td className="py-3 text-right text-[13px] text-black font-bold tabular-nums w-20">
        ₹{total.toFixed(2)}
      </td>
    </tr>
  );
}

function BillTable({ items }: { items: any[] }) {
  return (
    <div className="px-7 py-5">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-black/10 text-black">
            <th className="text-left pb-2.5 text-[9px] font-bold uppercase">Description</th>
            <th className="text-center pb-2.5 text-[9px] font-bold uppercase w-10">Qty</th>
            <th className="text-right pb-2.5 text-[9px] font-bold uppercase w-20">Rate</th>
            <th className="text-right pb-2.5 text-[9px] font-bold uppercase w-20">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <ItemRow key={`${item.orderId}-${i}`} item={item} index={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryRow({ label, value, bold = false, large = false, accent = false }: any) {
  return (
    <div className={`flex items-center justify-between ${large ? "pt-1" : ""}`}>
      <span className={`${large ? "text-[13px] font-bold uppercase tracking-tight" : "text-[12px] font-medium"} ${accent ? "text-green-600" : "text-black/60"} ${large ? "text-black" : ""}`}>
        {label}
      </span>
      <span className={`tabular-nums ${large ? "text-[17px] font-bold text-black" : "text-[12px] font-bold"} ${accent ? "text-green-600" : "text-black"}`}>
        {value}
      </span>
    </div>
  );
}

function BillSummary({ subtotal, tax, grandTotal, totalPaid, balanceDue }: any) {
  return (
    <div className="px-7 py-5 border-t border-black/10">
      <div className="flex flex-col gap-2.5">
        <SummaryRow label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-medium text-black/60">TAX 5%</span>
          </div>
          <span className="font-semibold">₹{tax.toFixed(2)}</span>
        </div>
        <div className="h-px bg-gray-200 my-1" />
        <div className="flex justify-between items-center">
          <span className="text-[14px] font-bold text-black">Grand Total</span>
          <span className="text-[16px] font-bold text-black tabular-nums">₹{grandTotal.toFixed(2)}</span>
        </div>

        {totalPaid > 0 && (
          <div className="flex justify-between font-bold p-3 text-blue-600 bg-blue-500/10 rounded-xl mt-2">
            <span className="text-sm">Amount Paid (UPI)</span>
            <span className="text-sm tabular-nums">-₹{totalPaid.toFixed(2)}</span>
          </div>
        )}

        {balanceDue > 0 && (
          <div className="flex justify-between font-bold p-3 text-amber-500 bg-amber-500/10 rounded-xl mt-2">
            <span className="text-sm">Balance Due</span>
            <span className="text-sm tabular-nums">₹{balanceDue.toFixed(2)}</span>
          </div>
        )}

        {balanceDue <= 0 && (
          <div className="flex justify-between font-bold p-3 text-green-600 bg-green-600/10 rounded-xl mt-2">
            <span className="text-sm font-bold">Fully Paid</span>
          </div>
        )}
      </div>
    </div>
  );
}

function BillFooter() {
  return (
    <div className="px-7 py-5 border-t border-black/6 flex items-center justify-between">
      <p className="text-sm font-bold text-gray-500/70 flex items-center gap-1">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14M15 9H15.01M9 9H9.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM15.5 9C15.5 9.27614 15.2761 9.5 15 9.5C14.7239 9.5 14.5 9.27614 14.5 9C14.5 8.72386 14.7239 8.5 15 8.5C15.2761 8.5 15.5 8.72386 15.5 9ZM9.5 9C9.5 9.27614 9.27614 9.5 9 9.5C8.72386 9.5 8.5 9.27614 8.5 9C8.5 8.72386 8.72386 8.5 9 8.5C9.27614 8.5 9.5 8.72386 9.5 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Thank you for dining with us
      </p>
      <div className="px-7 pb-3 pt-2 text-center text-gray-400 flex font-bold items-center justify-center gap-2 text-xs">
        Powered by
        <span className="flex bg-black/25 text-black items-center gap-1 px-1 p-px rounded">
          <Image src="/assets/tableOS-logo.svg" alt="tableOS" width={15} height={15} />
          tableOS
        </span>
      </div>
    </div>
  );
}

const pdfStyles = StyleSheet.create({
  page: { fontFamily: "Helvetica", backgroundColor: "#ffffff", paddingBottom: 48 },
  header: { paddingHorizontal: 32, paddingTop: 32, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoImg: { width: 34, height: 34 },
  logoName: { fontSize: 24, fontFamily: "Helvetica-Bold", color: "#000000", letterSpacing: -0.8 },
  invoiceLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "rgba(0,0,0,0.4)", letterSpacing: 1.5, textAlign: "right", marginBottom: 3 },
  invoiceId: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#000000", textAlign: "right" },
  invoiceDate: { fontSize: 9, color: "rgba(0,0,0,0.5)", textAlign: "right", marginTop: 6 },
  invoiceTime: { fontSize: 8, color: "rgba(0,0,0,0.35)", textAlign: "right", marginTop: 1 },
  billedDivider: { borderTopWidth: 0.5, borderTopColor: "rgba(0,0,0,0.1)", marginTop: 18, paddingTop: 14 },
  billedLabel: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "rgba(0,0,0,0.35)", letterSpacing: 1.5, marginBottom: 4 },
  storeName: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#000000" },
  storeAddress: { fontSize: 9, color: "rgba(0,0,0,0.5)", marginTop: 2, maxWidth: 200 },
  storeUpi: { fontSize: 8, color: "rgba(0,0,0,0.4)", marginTop: 3 },
  tableWrap: { paddingHorizontal: 32, paddingVertical: 20 },
  tableHead: { flexDirection: "row", borderBottomWidth: 1.5, borderBottomColor: "rgba(0,0,0,0.1)", paddingBottom: 8, marginBottom: 2 },
  thBase: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "rgba(0,0,0,0.4)" },
  row: { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: "rgba(0,0,0,0.04)" },
  rowDesc: { flex: 1 },
  rowItemName: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#000000" },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  rowOrderId: { fontSize: 7, color: "rgba(0,0,0,0.3)", fontFamily: "Helvetica" },
  badgePaid: { backgroundColor: "#16a34a", borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, flexDirection: "row", alignItems: "center", gap: 2 },
  badgeUnpaid: { backgroundColor: "#f59e0b", borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, flexDirection: "row", alignItems: "center", gap: 2 },
  badgeDot: { width: 2, height: 2, backgroundColor: "#ffffff", borderRadius: 1 },
  badgeText: { fontSize: 6, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  summaryWrap: { paddingHorizontal: 32, paddingTop: 16, paddingBottom: 20, borderTopWidth: 0.5, borderTopColor: "rgba(0,0,0,0.1)" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 10, color: "rgba(0,0,0,0.5)" },
  summaryVal: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#000000" },
  dividerLine: { borderTopWidth: 0.5, borderTopColor: "#e5e7eb", marginVertical: 8 },
  grandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  grandLabel: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#000000" },
  grandVal: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#000000" },
  pillPaid: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#eff6ff", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 10 },
  pillPaidText: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#2563eb" },
  pillDue: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fffbeb", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8 },
  pillDueText: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#f59e0b" },
  pillFull: { flexDirection: "row", justifyContent: "center", backgroundColor: "#f0fdf4", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8 },
  pillFullText: { fontSize: 10, fontFamily: "Helvetica-Bold", color: "#16a34a" },
  footer: { borderTopWidth: 0.5, borderTopColor: "rgba(0,0,0,0.06)", paddingHorizontal: 32, paddingVertical: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerThanks: { fontSize: 10, color: "rgba(0,0,0,0.4)", fontFamily: "Helvetica-Bold" },
  footerPowered: { flexDirection: "row", alignItems: "center", gap: 4 },
  poweredByText: { fontSize: 8, color: "rgba(0,0,0,0.35)", fontFamily: "Helvetica-Bold" },
  poweredBox: { flexDirection: "row", alignItems: "center", gap: 2, backgroundColor: "rgba(0,0,0,0.08)", paddingHorizontal: 4, paddingVertical: 2, borderRadius: 3 },
  poweredBrand: { fontSize: 8, color: "#000000", fontFamily: "Helvetica-Bold" },
  footerLogo: { width: 10, height: 10 },
});

function BillPDFDocument({ data, allItems, subtotal, tax, grandTotal, totalPaid, balanceDue }: {
  data: any; allItems: any[]; subtotal: number; tax: number;
  grandTotal: number; totalPaid: number; balanceDue: number;
}) {
  const date = new Date(data.startTime);
  const logoUrl = typeof window !== "undefined" ? `${window.location.origin}/assets/tableOS-logo.png` : "/assets/tableOS-logo.png";

  return (
    <Document
      title={`Invoice #${data.id.slice(0, 8).toUpperCase()}`}
      author="tableOS"
      subject="Restaurant Invoice"
      creator="tableOS POS"
    >
      <Page size="A4" style={pdfStyles.page}>

        <View style={pdfStyles.header}>
          <View style={pdfStyles.headerRow}>
            <View style={pdfStyles.logoRow}>
              <PdfImage src={logoUrl} style={pdfStyles.logoImg} />
              <Text style={pdfStyles.logoName}>tableOS</Text>
            </View>
            <View>
              <Text style={pdfStyles.invoiceLabel}>INVOICE</Text>
              <Text style={pdfStyles.invoiceId}>#{data.id.slice(0, 8).toUpperCase()}</Text>
              <Text style={pdfStyles.invoiceDate}>
                {date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </Text>
              <Text style={pdfStyles.invoiceTime}>
                {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
              </Text>
            </View>
          </View>

          <View style={pdfStyles.billedDivider}>
            <Text style={pdfStyles.billedLabel}>BILLED AT</Text>
            <Text style={pdfStyles.storeName}>{data.store.name}</Text>
            {data.store.address && <Text style={pdfStyles.storeAddress}>{data.store.address}</Text>}
            {data.store.upiId && <Text style={pdfStyles.storeUpi}>UPI · {data.store.upiId}</Text>}
          </View>
        </View>

        <View style={pdfStyles.tableWrap}>
          <View style={pdfStyles.tableHead}>
            <Text style={[pdfStyles.thBase, { flex: 1 }]}>DESCRIPTION</Text>
            <Text style={[pdfStyles.thBase, { width: 32, textAlign: "center" }]}>QTY</Text>
            <Text style={[pdfStyles.thBase, { width: 56, textAlign: "right" }]}>RATE</Text>
            <Text style={[pdfStyles.thBase, { width: 64, textAlign: "right" }]}>AMOUNT</Text>
          </View>

          {allItems.map((item, i) => {
            const rate = parseFloat(item.soldAtPrice);
            const total = item.quantity * rate;
            return (
              <View key={`${item.orderId}-${i}`} style={pdfStyles.row} wrap={false}>
                <View style={pdfStyles.rowDesc}>
                  <Text style={pdfStyles.rowItemName}>{item.itemNameAtOrder}</Text>
                  <View style={pdfStyles.rowMeta}>
                    <Text style={pdfStyles.rowOrderId}>#{item.orderId.slice(0, 6).toUpperCase()}</Text>
                    <View style={item.isPaid ? pdfStyles.badgePaid : pdfStyles.badgeUnpaid}>
                      <View style={pdfStyles.badgeDot} />
                      <Text style={pdfStyles.badgeText}>{item.isPaid ? "PAID" : "UNPAID"}</Text>
                    </View>
                  </View>
                </View>
                <Text style={[pdfStyles.summaryLabel, { width: 32, textAlign: "center" }]}>{item.quantity}</Text>
                <Text style={[pdfStyles.summaryLabel, { width: 56, textAlign: "right", fontSize: 9 }]}>₹{rate.toFixed(2)}</Text>
                <Text style={[pdfStyles.summaryVal, { width: 64, textAlign: "right" }]}>₹{total.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        <View style={pdfStyles.summaryWrap}>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>Subtotal</Text>
            <Text style={pdfStyles.summaryVal}>₹{subtotal.toFixed(2)}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text style={pdfStyles.summaryLabel}>TAX 5%</Text>
            <Text style={pdfStyles.summaryVal}>₹{tax.toFixed(2)}</Text>
          </View>
          <View style={pdfStyles.dividerLine} />
          <View style={pdfStyles.grandRow}>
            <Text style={pdfStyles.grandLabel}>Grand Total</Text>
            <Text style={pdfStyles.grandVal}>₹{grandTotal.toFixed(2)}</Text>
          </View>

          {totalPaid > 0 && (
            <View style={pdfStyles.pillPaid}>
              <Text style={pdfStyles.pillPaidText}>Amount Paid (UPI)</Text>
              <Text style={pdfStyles.pillPaidText}>-₹{totalPaid.toFixed(2)}</Text>
            </View>
          )}
          {balanceDue > 0 ? (
            <View style={pdfStyles.pillDue}>
              <Text style={pdfStyles.pillDueText}>Balance Due</Text>
              <Text style={pdfStyles.pillDueText}>₹{balanceDue.toFixed(2)}</Text>
            </View>
          ) : (
            <View style={pdfStyles.pillFull}>
              <Text style={pdfStyles.pillFullText}>Fully Paid</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <Text style={pdfStyles.footerThanks}>Thank you for dining with us</Text>
          <View style={pdfStyles.footerPowered}>
            <Text style={pdfStyles.poweredByText}>Powered by</Text>
            <View style={pdfStyles.poweredBox}>
              <PdfImage src={logoUrl} style={pdfStyles.footerLogo} />
              <Text style={pdfStyles.poweredBrand}>tableOS</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default function ProfessionalBill({
  data,
  onClose,
  onPay,
}: {
  data: any;
  onClose: () => void;
  onPay?: (amount: number) => void;
}) {
  const allItems = data.orders.flatMap((o: any) =>
    o.details.map((i: any) => ({
      ...i,
      orderId: o.id,
      isPaid: o.paymentStatus === "paid",
    }))
  );

  const grandTotal = data.orders.reduce((s: number, o: any) => s + parseFloat(o.totalAmount), 0);
  const subtotal = grandTotal / (1 + TAX_RATE);
  const tax = grandTotal - subtotal;
  const totalPaid = data.orders
    .filter((o: any) => o.paymentStatus === "paid")
    .reduce((s: number, o: any) => s + parseFloat(o.totalAmount), 0);
  const balanceDue = Math.max(0, grandTotal - totalPaid);

  const handleDownloadPDF = async () => {
    const blob = await pdf(
      <BillPDFDocument
        data={data}
        allItems={allItems}
        subtotal={subtotal}
        tax={tax}
        grandTotal={grandTotal}
        totalPaid={totalPaid}
        balanceDue={balanceDue}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Bill-${data.id.slice(0, 8).toUpperCase()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-1000 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 print:bg-white print:p-0 print:block"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[94vh] sm:max-h-[88vh] overflow-hidden bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col print:shadow-none print:w-full print:max-h-none print:rounded-none"
      >
        <div className="overflow-y-auto flex-1 overscroll-contain print:overflow-visible bg-white">
          <BillHeader store={data.store} sessionId={data.id} startTime={data.startTime} />
          <BillTable items={allItems} />
          <BillSummary
            subtotal={subtotal}
            tax={tax}
            grandTotal={grandTotal}
            totalPaid={totalPaid}
            balanceDue={balanceDue}
          />
          <BillFooter />
        </div>

        <footer className="px-7 py-4 border-t border-black/10 flex items-center gap-3 bg-white no-print">
          <Button variant="tableos" onClick={onClose}>
            Close
          </Button>

          <Button variant="tableos" onClick={handleDownloadPDF} className="font-bold">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Download PDF
          </Button>

          <div className="flex-1">
            {balanceDue > 0 && onPay ? (
              <Button variant="tableos" onClick={() => onPay(balanceDue)} className="font-bold flex items-center gap-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5295 8.35186C12.9571 8.75995 12.2566 9 11.5 9C9.567 9 8 7.433 8 5.5C8 3.567 9.567 2 11.5 2C12.753 2 13.8522 2.65842 14.4705 3.64814M6 20.0872H8.61029C8.95063 20.0872 9.28888 20.1277 9.61881 20.2086L12.3769 20.8789C12.9753 21.0247 13.5988 21.0388 14.2035 20.9214L17.253 20.3281C18.0585 20.1712 18.7996 19.7854 19.3803 19.2205L21.5379 17.1217C22.154 16.5234 22.154 15.5524 21.5379 14.9531C20.9832 14.4134 20.1047 14.3527 19.4771 14.8103L16.9626 16.6449C16.6025 16.9081 16.1643 17.0498 15.7137 17.0498H13.2855L14.8311 17.0498C15.7022 17.0498 16.4079 16.3633 16.4079 15.5159V15.2091C16.4079 14.5055 15.9156 13.892 15.2141 13.7219L12.8286 13.1417C12.4404 13.0476 12.0428 13 11.6431 13C10.6783 13 8.93189 13.7988 8.93189 13.7988L6 15.0249M20 6.5C20 8.433 18.433 10 16.5 10C14.567 10 13 8.433 13 6.5C13 4.567 14.567 3 16.5 3C18.433 3 20 4.567 20 6.5ZM2 14.6L2 20.4C2 20.9601 2 21.2401 2.10899 21.454C2.20487 21.6422 2.35785 21.7951 2.54601 21.891C2.75992 22 3.03995 22 3.6 22H4.4C4.96005 22 5.24008 22 5.45399 21.891C5.64215 21.7951 5.79513 21.6422 5.89101 21.454C6 21.2401 6 20.9601 6 20.4V14.6C6 14.0399 6 13.7599 5.89101 13.546C5.79513 13.3578 5.64215 13.2049 5.45399 13.109C5.24008 13 4.96005 13 4.4 13L3.6 13C3.03995 13 2.75992 13 2.54601 13.109C2.35785 13.2049 2.20487 13.3578 2.10899 13.546C2 13.7599 2 14.0399 2 14.6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Pay
              </Button>
            ) : (
              <Button variant="tableos" onClick={onClose} className="font-bold">Done</Button>
            )}
          </div>
        </footer>
      </motion.div>
    </motion.div>
  );
}