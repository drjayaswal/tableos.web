"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { EmployeeIcon, HomeIcon, MenuIcon, OrderIcon, StoreIcon, TableIcon, UserIcon } from "@/app/components/icons/svg";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
const navItems = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Employees", href: "/dashboard/employee", icon: EmployeeIcon },
  { name: "Store", href: "/dashboard/store", icon: StoreIcon },
  { name: "Menu", href: "/dashboard/menu", icon: MenuIcon },
  { name: "Orders", href: "/dashboard/orders", icon: OrderIcon },
  { name: "Tables", href: "/dashboard/tables", icon: TableIcon }
];

export default function DashboardHome() {
  const [time, setTime] = useState(new Date());

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <p className="text-xs font-mono text-gray-400 mb-1 tracking-tight">
            {time.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-black">
            {getGreeting()} 👋
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-gray-100 shadow-inner rounded-xl px-3 py-1.5">
            <span className="text-xs font-mono font-semibold text-gray-500 tabular-nums">
              {time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-1">
        {navItems.map((item, idx) => (
          <motion.a
            key={item.name}
            href={item.href}
            className="group relative bg-white border-2 border-gray-200/30 sm:border-gray-200 rounded-md p-5 flex flex-col justify-between h-32 sm:shadow-none shadow-sm hover:shadow-sm transition-all duration-300 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <item.icon size={28} className="text-black/80 group-hover:text-black transition-colors duration-300" />
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
            </div>
            <div>
              <h3 className="text-lg font-bold text-black leading-none">{item.name}</h3>
              <p className="text-[10px] font-medium text-gray-400 font-mono mt-1">
                {item.name === "Orders" ? "Manage Live & Pending Orders" :
                  item.name === "Tables" ? "Monitor Table Status" :
                    item.name === "Menu" ? "Update Dishes & Prices" :
                      item.name === "Employees" ? "Manage Staff & Shifts" :
                        item.name === "Store" ? "Manage Inventory" :
                          item.name === "Account" ? "Manage Profile & Settings" : "Start Your Day"
                }
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}