"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CancelIcon, EmployeeIcon, HomeIcon, MenuIcon, OrderIcon, StoreIcon, TableIcon, UserIcon } from "@/app/components/icons/svg";

const navItems = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Employees", href: "/dashboard/employee", icon: EmployeeIcon },
  { name: "Store", href: "/dashboard/store", icon: StoreIcon },
  { name: "Menu", href: "/dashboard/menu", icon: MenuIcon },
  { name: "Orders", href: "/dashboard/orders", icon: OrderIcon },
  { name: "Tables", href: "/dashboard/tables", icon: TableIcon },
  { name: "Account", href: "/dashboard/account", icon: UserIcon },
];

function SidebarContent({ isCollapsed, isMobile = false, onClose }: { isCollapsed: boolean; isMobile?: boolean; onClose?: () => void; }) {
  const pathname = usePathname();
  const collapsed = isCollapsed && !isMobile;

  return (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-3 p-4 border-b border-gray-200 shrink-0 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 flex items-center justify-center shrink-0">
          <Image src="/assets/tableOS-logo.svg" alt="Logo" width={25} height={25} />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden whitespace-nowrap">
            <p className="text-sm font-bold text-black leading-none">tableOS</p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">Dashboard</p>
          </motion.div>
        )}
        {isMobile && (
          <button onClick={onClose} className="ml-auto cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700">
            <CancelIcon size={18} weight="bold" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-hidden py-3 px-2.5 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon as any;
          return (
            <Link key={item.name} href={item.href} onClick={onClose} className="block">
              <div className={`group relative flex h-10 items-center rounded-lg transition-all duration-150 cursor-pointer ${collapsed ? "justify-center px-0" : "px-2.5"} ${isActive ? "shadow-sm" : "hover:bg-gray-50"}`}>
                {isActive && (
                  <motion.div layoutId={`sidebar-pill-${isMobile ? "mobile" : "desktop"}`} className={`absolute inset-0 bg-white shadow-sm border border-gray-200/50 shadow-black/15 rounded-lg -z-10`} transition={{ type: "spring", stiffness: 380, damping: 35 }} />
                )}
                <div className={`flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150 shrink-0 ${isActive ? `bg-white border border-gray-200 shadow-sm` : "bg-transparent"}`}>
                  <Icon size={16} className={`transition-all duration-150 ${isActive ? "text-black" : "text-gray-400 group-hover:text-black"}`} />
                </div>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`ml-2.5 whitespace-nowrap overflow-hidden text-[12px] font-semibold tracking-wide uppercase ${isActive ? "text-black" : "text-gray-400 group-hover:text-black"}`}>
                    {item.name}
                  </motion.span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-black text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 shadow-lg">
                    {item.name}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-black" />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function getInitialCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const saved = localStorage.getItem("sidebar_collapsed");
    return saved !== null ? (JSON.parse(saved) as boolean) : false;
  } catch { return false; }
}

export default function DashboardLayout({ children }: { children: React.ReactNode; }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(getInitialCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [animationReady, setAnimationReady] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimationReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleToggle = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setIsMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden">
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 64 : 220 }}
        transition={animationReady ? { type: "spring", stiffness: 280, damping: 28 } : { duration: 0 }}
        className="hidden lg:flex flex-col h-full bg-white relative border-r border-gray-200 shadow-sm z-30 shrink-0"
        style={{ willChange: "width" }}
      >
        <SidebarContent isCollapsed={isCollapsed} />

        <button
          onClick={handleToggle}
          className={`absolute -right-3.5 top-12.5 z-40 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-xs transition-all hover:text-black hover:shadow-sm cursor-pointer outline-none ${!isCollapsed && "rotate-180"}`}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </motion.aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div key="mobile-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden" onClick={() => setIsMobileOpen(false)} />
            <motion.aside key="mobile-drawer" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 320, damping: 32 }} className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl lg:hidden flex flex-col">
              <SidebarContent isCollapsed={false} isMobile={true} onClose={() => setIsMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 h-14 bg-white border-b border-gray-200 shadow-sm shrink-0 z-30">
          <button onClick={() => setIsMobileOpen(true)} className="rounded-xl transition-colors text-gray-600 border-none outline-none cursor-pointer rotate-180">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8L8 12M8 12L12 16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-black">tableOS</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-white m-2 sm:m-5 rounded-xl border border-gray-200 shadow-sm scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}