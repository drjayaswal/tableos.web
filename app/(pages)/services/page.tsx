"use client";

import {
  ArrowRightIcon,
  MonitorIcon,
  QrCodeIcon,
  LightningIcon,
  ChartLineUpIcon,
  ClockCounterClockwiseIcon,
  ShieldCheckIcon,
  LayoutIcon,
  DeviceMobileIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const ServiceCard = ({ icon: Icon, title, desc, features }: { icon: any, title: string, desc: string, features: string[] }) => (
  <div className="bg-gray-50 rounded-[3rem] p-8 md:p-12">
    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-main mb-8 group-hover:scale-110 transition-transform duration-500">
      <Icon size={32} weight="fill" />
    </div>
    <h3 className="text-2xl font-bold mb-4 tracking-tight">{title}</h3>
    <p className="text-gray-500 mb-8 leading-relaxed font-medium">{desc}</p>
    <ul className="space-y-3">
      {features.map((f, i) => (
        <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700">
          <div className="w-1.5 h-1.5 rounded-full bg-main" />
          {f}
        </li>
      ))}
    </ul>
  </div>
);

const ServicesPage = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <header className="bg-gray-200/50 shadow-inner py-30 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-20 p-20 grayscale opacity-5 pointer-events-none">
          <Image
            src="/tableOS-logo.svg"
            className="scale-400 invert"
            alt="TableOS Logo"
            width={150}
            height={150}
          />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-black mb-6">
            Complete <span className="text-main">HORECA</span> stack
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            From QR-based ordering to real-time kitchen logistics, we provide the tools to run your unit with surgical precision.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-24 px-6 space-y-32">
        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ServiceCard
            icon={QrCodeIcon}
            title="Smart QR Engine"
            desc="Unique table-mapped QR generation that initiates isolated dining sessions instantly."
            features={["Table Session Isolation", "Dynamic Slug Generation", "Zero-App Download"]}
          />
          <ServiceCard
            icon={LayoutIcon}
            title="Digital Catalog"
            desc="A high-fidelity menu system with dietary filters, real-time availability, and calorie tracking."
            features={["Dietary Labeling", "Stock Status Toggle", "Category Architecture"]}
          />
          <ServiceCard
            icon={MonitorIcon}
            title="Kitchen Ops"
            desc="Real-time order monitoring dashboard for chefs to manage preparation and flow."
            features={["Live Status Updates", "Customer Notifications", "Time Tracking"]}
          />
          <ServiceCard
            icon={ChartLineUpIcon}
            title="Store Insights"
            desc="Deep analytics on sales performance, popular items, and peak hour trends."
            features={["Rating Analysis", "Bill Breakdown", "Traffic Heatmaps"]}
          />
          <ServiceCard
            icon={ShieldCheckIcon}
            title="Secure Checkout"
            desc="Integrated billing system with support for UPI, Cash, and Card settlements."
            features={["Automatic Tax Calculation", "Session Archiving", "Bill History"]}
          />
          <ServiceCard
            icon={LightningIcon}
            title="Rapid Response"
            desc="A lightning-fast interface optimized for weak networks in high-density areas."
            features={["Low Latency Sync", "Optimized Assets", "Offline Indicators"]}
          />
        </section>

        <section className="bg-main rounded-[80px] p-10 md:p-20 text-white overflow-hidden relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 leading-[0.9]">
                Management <br /> Simplified
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="shrink-0 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <ClockCounterClockwiseIcon size={24} weight="fill" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">Real-time Sync</h4>
                    <p className="text-white/70 text-sm mt-1">Changes to price or availability reflect on customer screens in under 200ms.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="shrink-0 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <DeviceMobileIcon size={24} weight="fill" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">Mobile First</h4>
                    <p className="text-white/70 text-sm mt-1">Designed for the mobile browser, ensuring a premium feel without installing apps.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[3rem] p-12 border-4 border-dotted border-white/20 flex flex-col items-center justify-center min-h-[350px]">
                <p className="font-bold text-white/40 uppercase tracking-widest text-xs mb-4">Infrastructure Asset</p>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-2/3 h-full bg-white" />
                </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-4 text-black">Engineered for Scale</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {[
              { title: "Geofencing", desc: "Ensure orders are only placed within the physical boundaries of your store" },
              { title: "Multi-Unit Support", desc: "Manage multiple outlets across different slugs from a single unified admin account" }
            ].map((item, index) => (
              <div key={index} className="p-10 rounded-[3rem] group transition-all duration-500">
                <h4 className="text-2xl font-bold mb-4 tracking-tight">{item.title}</h4>
                <p className="text-black/70 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>


      <footer className="bg-main p-6 py-12 text-center shadow-inner relative overflow-hidden">
        <div className="relative z-10">
          <Image
            src="/tableOS-logo.svg"
            className="hidden lg:block absolute scale-[3.5] top-0 left-0"
            alt="TableOS Logo"
            width={150}
            height={150}
          />
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-8 tracking-tighter">
            Ready to digitize your operations?
          </h2>
          <button onClick={() => router.push("/generate")}
            className="bg-black hover:bg-white text-white hover:text-main cursor-pointer transition-all duration-300 px-8 py-4 rounded-[22px] font-bold text-lg shadow-2xl shadow-main/20 inline-flex items-center gap-3">
            Get Started
            <ArrowRightIcon weight="bold" />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ServicesPage;