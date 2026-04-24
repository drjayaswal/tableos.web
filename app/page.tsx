"use client";

import { Button } from "../app/components/ui/button";
import {
  QrCode,
  ChefHat,
  Receipt,
  BellRinging,
  Storefront,
  Users,
  Clock,
  CurrencyInr,
  CheckCircle,
  Layout,
  ChartLineUp,
  Monitor,
  DeviceMobile,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loading } from "./components/icons/svg";

const features = [
  {
    icon: QrCode,
    title: "Scan-to-Order",
    description:
      "Instant menu access via table-specific QR codes. No app downloads required — works directly in any mobile browser.",
    stat: "100%",
    statLabel: "contactless",
  },
  {
    icon: BellRinging,
    title: "Smart Notifications",
    description:
      "Synthesized audio alerts and real-time push notifications keep customers and staff synced on order progress.",
    stat: "<2s",
    statLabel: "latency",
  },
  {
    icon: Receipt,
    title: "Professional Billing",
    description:
      "Itemized session-based bills with clear separation of paid and unpaid items. Automated GST and service charge logic.",
    stat: "0",
    statLabel: "billing errors",
  },
  {
    icon: Layout,
    title: "Floor Management",
    description:
      "Visual overview of active tables, sessions, and pending payments. Mark tables free with a single tap.",
    stat: "Real-time",
    statLabel: "sync",
  },
];

const steps = [
  {
    number: "01",
    title: "Configure your Store",
    description:
      "Register your unit, set your local currency, and upload your digital menu catalog with images and dietary labels.",
  },
  {
    number: "02",
    title: "Deploy QR Codes",
    description:
      "Generate and place unique QR codes for every table. Each code is linked to a specific floor location for easy tracking.",
  },
  {
    number: "03",
    title: "Guest Self-Service",
    description:
      "Guests scan, browse, and place orders at their own pace. Orders flow instantly to your kitchen dashboard.",
  },
  {
    number: "04",
    title: "Frictionless Checkout",
    description:
      "Guests pay via UPI or at the counter. Verify payments instantly and close sessions to free up tables for new guests.",
  },
];

const metrics = [
  {
    label: "Active Sessions",
    value: "12",
    icon: Users,
    sub: "8 dining · 4 waiting",
  },
  {
    label: "Today's Revenue",
    value: "₹14,580",
    icon: CurrencyInr,
    sub: "↑ 12% from yesterday",
  },
  {
    label: "Pending Orders",
    value: "4",
    icon: ChefHat,
    sub: "Avg prep time: 14m",
  },
  {
    label: "Occupancy Rate",
    value: "82%",
    icon: ChartLineUp,
    sub: "Peak hours ongoing",
  },
];

const sessions = [
  {
    table: "Table 04",
    status: "Served",
    items: 6,
    total: "₹1,240",
    time: "42m",
  },
  {
    table: "Table 07",
    status: "Preparing",
    items: 2,
    total: "₹420",
    time: "8m",
  },
  { table: "Table 12", status: "Ready", items: 3, total: "₹580", time: "15m" },
  {
    table: "Table 09",
    status: "Pending",
    items: 5,
    total: "₹950",
    time: "28m",
  },
  {
    table: "Table 01",
    status: "Confirmed",
    items: 8,
    total: "₹2,840",
    time: "1h 10m",
  },
];

const systemAdvantages = [
  {
    icon: Monitor,
    title: "Owner Dashboard",
    description:
      "Real-time control over menu availability, order status, and session management.",
  },
  {
    icon: DeviceMobile,
    title: "Guest Interface",
    description:
      "High-fidelity, image-rich menu with dietary filters and real-time order tracking.",
  },
  {
    icon: BellRinging,
    title: "Audio Synthesis",
    description:
      "Browser-generated UI tones for various order states — no audio assets required.",
  },
  {
    icon: Storefront,
    title: "HORECA Ready",
    description:
      "Specifically architected for Hotels, Restaurants, and Cafes of all sizes.",
  },
  {
    icon: Clock,
    title: "Prep Tracking",
    description:
      "Set and display estimated preparation times to manage guest expectations.",
  },
  {
    icon: CheckCircle,
    title: "UPI Verification",
    description:
      "Instant slide-to-pay verification on the dashboard for seamless digital exits.",
  },
];

const font = "'Onest', system-ui, sans-serif";

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-landing-bg" style={{ fontFamily: font }}>
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 sm:pb-20 text-center">
          <h1 className="text-[36px] sm:text-[52px] lg:text-[64px] font-semibold tracking-tighter text-black leading-[1.05] mb-4">
            The only perfect table
            <span className="text-pink-500">
              OS
            </span>
            .
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] sm:text-[20px] text-landing-light-muted leading-relaxed font-medium">
            Eliminate friction in your restaurant with our intelligent
            scan-to-order workflow. From QR menus to real-time kitchen sync, we
            handle the floor so you can focus on the food.
          </p>
          <div className="mt-12 w-fit mx-auto flex items-center gap-3">
            <Button
              onClick={() => router.push("/how-to-use")}
              variant="tableos"
              className="gap-2 min-h-[46px] font-semibold! text-[15px] px-6 rounded-2xl"
            >
              How it works
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
            <Button
              onClick={() => router.push("/about")}
              variant="tableos"
              className="flex items-center gap-3 min-h-[46px] font-semibold! text-[15px] pr-1.5 rounded-2xl border-gray-200 bg-white hover:bg-gray-50 text-black"
            >
              About
              <div className="flex items-center gap-1.5 bg-gray-200/80 text-black px-2.5 py-1.5 shadow-inner rounded">
                <Image
                  src="/assets/tableOS-logo.svg"
                  alt="Logo"
                  width={18}
                  height={18}
                  priority
                />
                tableOS
              </div>
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8 pb-24 sm:pb-36 relative z-10">
          <div className="overflow-hidden rounded-xl border border-gray-200/50 shadow-xl bg-white">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200/50">
              <span className="h-3 w-3 rounded-full bg-rose-500" />
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
            </div>
            <div
              className="p-4 sm:p-8 space-y-6 text-landing-dark"
              style={{ fontSize: "13px" }}
            >
              <div className="flex items-center gap-2">
                <Image
                  src="/assets/tableOS-logo.svg"
                  alt="tableOS"
                  width={24}
                  height={24}
                  priority
                />
                <span className="font-bold text-lg tracking-tight">Orders</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border border-gray-200/70 p-4 shadow-sm shadow-black/15"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                        {m.label}
                      </span>
                      <m.icon className="h-4 w-4 text-main" />
                    </div>
                    <div className="text-2xl font-bold leading-tight">
                      {m.value}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 font-medium">
                      {m.sub}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border border-gray-200/70 p-4 shadow-sm shadow-black/15 rounded-xl">
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm font-bold">Table Sessions</p>
                </div>
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-widest">
                      <th className="text-left font-bold pb-3">Label</th>
                      <th className="text-left font-bold pb-3">Status</th>
                      <th className="text-left font-bold pb-3 hidden sm:table-cell">
                        Items
                      </th>
                      <th className="text-right font-bold pb-3">Subtotal</th>
                      <th className="text-right font-bold pb-3 hidden sm:table-cell">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-medium">
                    {sessions.map((s) => (
                      <tr
                        key={s.table}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3.5 font-bold text-black">
                          {s.table}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`text-white flex items-center gap-2 rounded-lg w-fit px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                              s.status === "Ready" ||
                              s.status === "Served" ||
                              s.status === "Confirmed"
                                ? "bg-green-600"
                                : s.status === "Pending"
                                  ? " bg-amber-500"
                                  : s.status === "Preparing"
                                    ? "bg-purple-500"
                                    : "bg-gray-500"
                            }`}
                          >
                            {s.status === "Ready" ||
                            s.status === "Served" ||
                            s.status === "Confirmed" ? (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M19 7L9 17L5 13"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : s.status === "Pending" ? (
                              <Loading
                                className="animate-spin h-3 w-3"
                                strokeWidth={2}
                              />
                            ) : s.status === "Preparing" ? (
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="rotate-90 animate-bounce"
                              >
                                <path
                                  d="M21 18C21 18 19.8096 17.5305 19 17.3021C13.8797 15.8574 10.1203 20.1426 5 18.6979C4.19041 18.4695 3 18 3 18M21 12C21 12 19.8096 11.5305 19 11.3021C13.8797 9.85739 10.1203 14.1426 5 12.6979C4.19041 12.4695 3 12 3 12M21 6C21 6 19.8096 5.53048 19 5.30206C13.8797 3.85739 10.1203 8.14261 5 6.69794C4.19041 6.46952 3 6 3 6"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : null}
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3.5 text-gray-400 hidden sm:table-cell">
                          {s.items} orders
                        </td>
                        <td className="py-3.5 text-right font-bold tabular-nums">
                          {s.total}
                        </td>
                        <td className="py-3.5 text-right text-gray-400 tabular-nums hidden sm:table-cell">
                          {s.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-32 lg:py-40 bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="mb-16 sm:mb-24">
            <p className="text-[16px] font-normal text-landing-dark mb-3">
              Features
            </p>
            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-normal text-landing-dark leading-tight tracking-tight">
              Everything you need to
              <br className="hidden sm:block" /> manage assets
            </h2>
            <p className="mt-4 text-[17px] text-landing-light-muted max-w-xl font-normal">
              Built for IT managers, office managers, and operations teams who
              need full visibility into company equipment.
            </p>
          </div>

          <div className="grid gap-px bg-black sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="group relative bg-white p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-landing-dark text-landing-light">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-semibold text-landing-dark">
                      {f.stat}
                    </span>
                    <p className="text-xs text-landing-light-muted">
                      {f.statLabel}
                    </p>
                  </div>
                </div>
                <h3 className="text-[18px] font-semibold text-landing-dark">
                  {f.title}
                </h3>
                <p className="mt-1.5 text-[16px] text-landing-light-muted leading-relaxed font-normal">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-32 lg:py-40 bg-landing-bg">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="mb-16 sm:mb-24">
            <p className="text-[16px] font-normal text-landing-dark mb-3">
              How it works
            </p>
            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-normal text-landing-dark leading-tight tracking-tight">
              Get up and running in minutes
            </h2>
            <p className="mt-4 text-[17px] text-landing-light-muted max-w-xl font-normal">
              Four simple steps to full asset visibility.
            </p>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.number} className="relative">
                <span className="text-[64px] font-normal text-landing-dark/10 leading-none">
                  {s.number}
                </span>
                <h3 className="mt-2 text-[18px] font-semibold text-landing-dark">
                  {s.title}
                </h3>
                <p className="mt-2 text-[16px] text-landing-light-muted leading-relaxed font-normal">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-32 lg:py-40 bg-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="mb-16 sm:mb-24">
            <p className="text-[16px] font-normal text-landing-dark mb-3">
              Enterprise security
            </p>
            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-normal text-landing-dark leading-tight tracking-tight">
              Secure & reliable by design
            </h2>
          </div>
          <div className="grid gap-px bg-black sm:grid-cols-2 lg:grid-cols-3">
            {systemAdvantages.map((sf) => (
              <div key={sf.title} className="bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-landing-dark text-landing-light mb-4">
                  <sf.icon className="h-5 w-5" />
                </div>
                <h3 className="text-[18px] font-semibold text-landing-dark">
                  {sf.title}
                </h3>
                <p className="mt-1 text-[16px] text-landing-light-muted leading-relaxed font-normal">
                  {sf.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 sm:py-36 lg:py-40 bg-landing-bg overflow-hidden">
        <div className="relative mx-auto max-w-[700px] px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-[30px] sm:text-[35px] lg:text-[40px] leading-tight tracking-tight">
            Ready to take control of your assets?
          </h2>
          <p className="mt-4 text-[17px] text-landing-light-muted max-w-lg mx-auto font-normal">
            The luxury of choosing your own pace
          </p>
          <div className="mt-10">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="tableos"
              className="rounded-3xl! gap-2 min-h-[40px] font-medium text-[15px] px-5"
            >
              Get started for free{" "}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>
        </div>
      </section>
      <footer className="pb-6 sm:pb-4">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/tableOS-logo.png"
              alt="Logo"
              width={20}
              height={20}
            />
            <span className="text-[15px] text-landing-light-muted">
              tableOS
            </span>
          </div>
          <p className="text-xs text-landing-light-muted/60">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
