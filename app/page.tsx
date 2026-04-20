"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const NAV_LINKS = ["Product", "How it works", "For HoReCa", "Pricing"];

const STATS = [
  { value: "3.2×", label: "Faster order turnaround" },
  { value: "40%", label: "Reduction in wait time" },
  { value: "98%", label: "Guest satisfaction rate" },
  { value: "12k+", label: "Tables served daily" },
];

const FEATURES = [
  {
    tag: "QR — Zero friction",
    title: "One scan, full menu",
    desc: "Guests scan the table QR and land directly on your branded menu — no app downloads, no logins, no friction.",
    accent: "#E8FF5A",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="4" y="4" width="6" height="6" rx="1" fill="currentColor"/>
        <rect x="16" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="18" y="4" width="6" height="6" rx="1" fill="currentColor"/>
        <rect x="2" y="16" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <rect x="4" y="18" width="6" height="6" rx="1" fill="currentColor"/>
        <rect x="16" y="16" width="4" height="4" rx="1" fill="currentColor"/>
        <rect x="22" y="16" width="4" height="4" rx="1" fill="currentColor"/>
        <rect x="16" y="22" width="4" height="4" rx="1" fill="currentColor"/>
        <rect x="22" y="22" width="4" height="4" rx="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    tag: "Menu — Rich detail",
    title: "Menus guests actually read",
    desc: "Calories, allergens, prep time, ingredients, chef notes — every item tells its story. Guests decide faster when they trust the data.",
    accent: "#FF6B35",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M6 4h16a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.8"/>
        <path d="M8 9h12M8 13h8M8 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    tag: "Favourites — Personalised",
    title: "Guests remember, menus adapt",
    desc: "Repeat visitors see their favourite dishes highlighted. Re-orders happen in seconds. Loyalty built into the experience.",
    accent: "#A78BFA",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 22s-9-5.5-9-11a5 5 0 0110 0 5 5 0 0110 0c0 5.5-11 11-11 11z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    tag: "Analytics — Live insights",
    title: "Know what sells, in real time",
    desc: "See which dishes are trending, where guests drop off, peak hours, and average order value — all from a single dashboard.",
    accent: "#34D399",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 22V14l6-4 5 3 9-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="24" cy="4" r="2" fill="currentColor"/>
      </svg>
    ),
  },
];

const HOW_STEPS = [
  { num: "01", title: "Print & place", body: "We generate unique QR codes per table. Print, laminate, done." },
  { num: "02", title: "Guest scans", body: "Phone camera, no app. Menu opens in under a second." },
  { num: "03", title: "Order placed", body: "Guest selects, customises, and submits. Kitchen gets it instantly." },
  { num: "04", title: "You serve faster", body: "Staff spend time serving, not waiting. Turnover improves." },
];

const MENU_ITEMS = [
  { name: "Truffle Risotto", cal: 620, time: "18 min", tag: "Chef's pick", color: "#FF6B35" },
  { name: "Burrata & Heritage Tomato", cal: 310, time: "5 min", tag: "Seasonal", color: "#34D399" },
  { name: "Wagyu Beef Sliders", cal: 840, time: "12 min", tag: "Bestseller", color: "#E8FF5A" },
  { name: "Seared Sea Bass", cal: 480, time: "15 min", tag: "New", color: "#A78BFA" },
];

function FloatingOrb({ style }: { style: React.CSSProperties }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={style}
      animate={{ y: [-18, 18, -18], x: [-8, 8, -8], rotate: [0, 180, 360] }}
      transition={{ duration: 12 + Math.random() * 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E8FF5A] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" fill="#0A0A0A"/>
              <rect x="8" y="1" width="5" height="5" rx="1" fill="#0A0A0A"/>
              <rect x="1" y="8" width="5" height="5" rx="1" fill="#0A0A0A"/>
              <rect x="8" y="8" width="2" height="2" rx="0.5" fill="#0A0A0A"/>
              <rect x="11" y="8" width="2" height="2" rx="0.5" fill="#0A0A0A"/>
              <rect x="8" y="11" width="2" height="2" rx="0.5" fill="#0A0A0A"/>
              <rect x="11" y="11" width="2" height="2" rx="0.5" fill="#0A0A0A"/>
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">TableOS</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a key={l} href="#" className="text-white/50 hover:text-white text-sm font-medium transition-colors duration-200">{l}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="text-white/60 hover:text-white text-sm font-medium transition-colors hidden md:block">Sign in</a>
          <motion.a
            href="#"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="bg-[#E8FF5A] text-[#0A0A0A] text-sm font-bold px-4 py-2 rounded-xl hover:bg-white transition-colors duration-200"
          >
            Get started
          </motion.a>
        </div>
      </div>
    </motion.nav>
  );
}

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen bg-[#0A0A0A] py-30 flex flex-col items-center justify-center overflow-hidden px-6">
      <FloatingOrb style={{ width: 600, height: 600, background: "radial-gradient(circle, rgba(232,255,90,0.08) 0%, transparent 70%)", top: "10%", left: "20%", transform: "translate(-50%,-50%)" }} />
      <FloatingOrb style={{ width: 400, height: 400, background: "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)", top: "60%", right: "10%", transform: "translate(50%,-50%)" }} />
      <FloatingOrb style={{ width: 300, height: 300, background: "radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)", bottom: "20%", left: "15%" }} />

      <motion.div style={{ y, opacity }} className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(3rem,8vw,7rem)] font-black leading-[0.92] tracking-tight text-white mb-6"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Stop waiting.
          <br />
          <span className="text-[#E8FF5A]">Start serving.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-white/50 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
        >
          TableOS turns every table into a digital ordering point. Guests scan, browse, and order — your staff focuses on hospitality, not taking orders.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <motion.a
            href="#"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="bg-[#E8FF5A] text-[#0A0A0A] font-bold text-base px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-colors"
          >
            Book a demo
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </motion.a>
          <motion.a
            href="#"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="border border-white/15 text-white/80 font-medium text-base px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
          >
            See how it works
          </motion.a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mt-20 w-full max-w-5xl mx-auto"
      >
        <MockPhoneMenu />
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0D0D0D] to-transparent pointer-events-none" />
    </section>
  );
}

function MockPhoneMenu() {
  const [activeItem, setActiveItem] = useState<number | null>(null);
  return (
    <div className="flex items-end justify-center gap-6 px-4">
      <motion.div
        className="relative w-[240px] bg-[#141414] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl shrink-0"
        style={{ aspectRatio: "9/19" }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-x-0 top-0 h-6 bg-[#141414] z-10 flex items-center justify-center">
          <div className="w-16 h-1 rounded-full bg-white/20" />
        </div>
        <div className="pt-8 px-3 pb-3 h-full flex flex-col gap-3 overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E8FF5A] flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="#0A0A0A"/><rect x="8" y="1" width="5" height="5" rx="1" fill="#0A0A0A"/><rect x="1" y="8" width="5" height="5" rx="1" fill="#0A0A0A"/><rect x="8" y="8" width="2" height="2" rx="0.5" fill="#0A0A0A"/><rect x="11" y="8" width="2" height="2" rx="0.5" fill="#0A0A0A"/><rect x="8" y="11" width="2" height="2" rx="0.5" fill="#0A0A0A"/><rect x="11" y="11" width="2" height="2" rx="0.5" fill="#0A0A0A"/></svg>
            </div>
            <div>
              <p className="text-white text-[10px] font-bold leading-tight">La Piazza</p>
              <p className="text-white/40 text-[8px]">Table 7 — Scan active</p>
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {["All", "Starters", "Mains", "Desserts"].map((c, i) => (
              <span key={c} className={`shrink-0 text-[8px] font-bold px-2 py-0.5 rounded-full ${i === 0 ? "bg-[#E8FF5A] text-[#0A0A0A]" : "bg-white/8 text-white/50"}`}>{c}</span>
            ))}
          </div>
          <div className="flex flex-col gap-2 overflow-hidden">
            {MENU_ITEMS.map((item, i) => (
              <motion.div
                key={item.name}
                onClick={() => setActiveItem(activeItem === i ? null : i)}
                whileTap={{ scale: 0.97 }}
                className="bg-white/5 rounded-xl p-2 cursor-pointer border border-white/5 hover:border-white/15 transition-colors"
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <p className="text-white text-[9px] font-bold leading-tight">{item.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-white/40 text-[7px]">{item.cal} kcal</span>
                      <span className="text-white/20 text-[7px]">·</span>
                      <span className="text-white/40 text-[7px]">{item.time}</span>
                    </div>
                  </div>
                  <span className="text-[6px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: item.color + "22", color: item.color }}>{item.tag}</span>
                </div>
                <AnimatePresence>
                  {activeItem === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden mt-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#E8FF5A] text-[8px] font-bold">+ Add to order</span>
                        <div className="flex items-center gap-1">
                          <button className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-white text-[8px]">−</button>
                          <span className="text-white text-[8px]">1</span>
                          <button className="w-4 h-4 rounded-full bg-[#E8FF5A] flex items-center justify-center text-[#0A0A0A] text-[8px] font-bold">+</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
          <div className="mt-auto">
            <div className="bg-[#E8FF5A] rounded-xl py-2 flex items-center justify-center gap-1">
              <span className="text-[#0A0A0A] text-[9px] font-black">View order · 2 items</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="hidden sm:block w-[200px] bg-[#141414] rounded-[1.5rem] border border-white/10 overflow-hidden shrink-0"
        style={{ aspectRatio: "4/5" }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="p-4 h-full flex flex-col gap-3">
          <p className="text-white/40 text-[9px] uppercase tracking-wider font-bold">Kitchen display</p>
          <div className="flex flex-col gap-2">
            {[
              { table: "T-03", items: "Truffle Risotto × 2", status: "Preparing", color: "#FF6B35" },
              { table: "T-07", items: "Burrata × 1", status: "Ready", color: "#34D399" },
              { table: "T-12", items: "Sea Bass × 3", status: "Queued", color: "#A78BFA" },
            ].map((o) => (
              <div key={o.table} className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-[9px] font-black">{o.table}</span>
                  <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: o.color + "22", color: o.color }}>{o.status}</span>
                </div>
                <p className="text-white/40 text-[8px]">{o.items}</p>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-2 border-t border-white/8">
            <div className="flex justify-between">
              <span className="text-white/30 text-[8px]">Avg. serve time</span>
              <span className="text-[#E8FF5A] text-[8px] font-bold">11 min</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="hidden lg:block w-[180px] bg-[#141414] rounded-[1.5rem] border border-white/10 overflow-hidden shrink-0"
        style={{ aspectRatio: "3/4" }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="p-4 h-full flex flex-col gap-3">
          <p className="text-white/40 text-[9px] uppercase tracking-wider font-bold">Today's pulse</p>
          <div className="flex flex-col gap-2">
            {[
              { label: "Orders placed", val: "148", change: "+12%" },
              { label: "Active tables", val: "23", change: "+3" },
              { label: "Avg. order", val: "€34", change: "+8%" },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-xl p-2.5">
                <p className="text-white/40 text-[8px] mb-0.5">{s.label}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-white text-sm font-black">{s.val}</span>
                  <span className="text-[#34D399] text-[7px] font-bold">{s.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatsBar() {
  return (
    <section className="bg-[#0D0D0D] border-y border-white/6 py-12">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-[clamp(2.5rem,5vw,3.5rem)] font-black text-[#E8FF5A] leading-none mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{s.value}</p>
              <p className="text-white/40 text-sm font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="bg-[#0D0D0D] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <p className="text-[#E8FF5A] text-xs font-bold uppercase tracking-widest mb-4">Built for hospitality</p>
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-black text-white leading-[1.05] max-w-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            Everything your guests need. Nothing they don't.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              whileHover={{ y: -4 }}
              className="group relative bg-white/3 border border-white/8 rounded-3xl p-6 flex flex-col gap-4 hover:border-white/15 transition-all duration-300 cursor-default overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" style={{ background: `radial-gradient(circle at 30% 20%, ${f.accent}0A 0%, transparent 60%)` }} />
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4" style={{ background: f.accent + "15", color: f.accent }}>
                  {f.icon}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: f.accent }}>{f.tag}</p>
                <h3 className="text-white font-black text-lg leading-tight mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="bg-[#0A0A0A] py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(232,255,90,0.04) 0%, transparent 70%)" }} />
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <p className="text-[#E8FF5A] text-xs font-bold uppercase tracking-widest mb-4">How it works</p>
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Live in an afternoon.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {HOW_STEPS.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="flex flex-col gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#E8FF5A]/8 border border-[#E8FF5A]/20 flex items-center justify-center">
                <span className="text-[#E8FF5A] text-xl font-black" style={{ fontFamily: "'Playfair Display', serif" }}>{s.num}</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">{s.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MenuShowcase() {
  const [selected, setSelected] = useState(0);
  const item = MENU_ITEMS[selected];

  return (
    <section className="bg-[#0D0D0D] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <p className="text-[#E8FF5A] text-xs font-bold uppercase tracking-widest mb-4">Menu detail</p>
          <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black text-white leading-tight max-w-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            Menus that answer every question before it's asked.
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col gap-3">
            {MENU_ITEMS.map((m, i) => (
              <motion.button
                key={m.name}
                onClick={() => setSelected(i)}
                whileHover={{ x: 4 }}
                className={`text-left p-4 rounded-2xl border transition-all duration-200 ${selected === i ? "border-white/20 bg-white/6" : "border-white/5 bg-white/2 hover:border-white/10"}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-base ${selected === i ? "text-white" : "text-white/50"}`}>{m.name}</span>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: m.color + "20", color: m.color }}>{m.tag}</span>
                </div>
                <AnimatePresence>
                  {selected === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-white/40 text-sm">{m.cal} kcal</span>
                        <span className="text-white/20">·</span>
                        <span className="text-white/40 text-sm">Ready in {m.time}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          <motion.div
            key={selected}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/3 border border-white/8 rounded-3xl p-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-white font-black text-2xl mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{item.name}</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: item.color + "20", color: item.color }}>{item.tag}</span>
              </div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: item.color + "15" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: item.color }}><path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Calories", val: `${item.cal} kcal` },
                { label: "Serve time", val: item.time },
                { label: "Allergens", val: "Gluten, dairy" },
                { label: "Dietary", val: "Vegetarian" },
              ].map((d) => (
                <div key={d.label} className="bg-white/4 rounded-xl p-3">
                  <p className="text-white/30 text-xs mb-0.5">{d.label}</p>
                  <p className="text-white font-bold text-sm">{d.val}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-white/8 pt-4">
              <p className="text-white/30 text-xs mb-2">Chef's note</p>
              <p className="text-white/60 text-sm leading-relaxed">Prepared fresh to order. Ask your server about modifications. Pairs well with our house Primitivo.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-[#0A0A0A] py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <FloatingOrb style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(232,255,90,0.07) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto text-center relative z-10"
      >
        <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black text-white leading-[1.0] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
          Your tables are
          <br />
          <span className="text-[#E8FF5A]">waiting.</span>
        </h2>
        <p className="text-white/40 text-lg mb-10 leading-relaxed">
          Join 200+ hotels, restaurants, and cafés already running TableOS. Setup takes one afternoon. Results are immediate.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.a
            href="#"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="bg-[#E8FF5A] text-[#0A0A0A] font-bold text-base px-10 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-colors"
          >
            Start free trial
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </motion.a>
          <motion.a
            href="#"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="border border-white/15 text-white/70 font-medium text-base px-10 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
          >
            Talk to sales
          </motion.a>
        </div>
        <p className="text-white/20 text-sm mt-6">No credit card required · Cancel anytime · Setup support included</p>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/6 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#E8FF5A] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="#0A0A0A"/><rect x="8" y="1" width="5" height="5" rx="1" fill="#0A0A0A"/><rect x="1" y="8" width="5" height="5" rx="1" fill="#0A0A0A"/><rect x="8" y="8" width="2" height="2" rx="0.5" fill="#0A0A0A"/><rect x="11" y="8" width="2" height="2" rx="0.5" fill="#0A0A0A"/><rect x="8" y="11" width="2" height="2" rx="0.5" fill="#0A0A0A"/><rect x="11" y="11" width="2" height="2" rx="0.5" fill="#0A0A0A"/></svg>
          </div>
          <span className="text-white/60 text-sm font-medium">TableOS</span>
        </div>
        <p className="text-white/20 text-xs">© 2025 TableOS. Hospitality, accelerated.</p>
        <div className="flex gap-6">
          {["Privacy", "Terms", "Contact"].map((l) => (
            <a key={l} href="#" className="text-white/30 hover:text-white/60 text-xs transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&display=swap" rel="stylesheet" />
      <main className="bg-[#0A0A0A]">
        <Navbar />
        <HeroSection />
        <StatsBar />
        <FeaturesSection />
        <HowItWorks />
        <MenuShowcase />
        <CTASection />
        <Footer />
      </main>
    </>
  );
}