"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChatCircleDotsIcon
} from "@phosphor-icons/react";
import { apiRequest } from "@/app/utility/api";
import { GlobalTableOSLoader, useUser } from "@/app/context/UserContext";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};
interface TimingSlot {
  is_open: boolean;
  open_time: string;
  close_time: string;
}

interface StoreTiming {
  monday: TimingSlot;
  tuesday: TimingSlot;
  wednesday: TimingSlot;
  thursday: TimingSlot;
  friday: TimingSlot;
  saturday: TimingSlot;
  sunday: TimingSlot;
}

interface StoreData {
  id: string;
  name: string;
  address: string;
  category: string;
  currency: string;
  tables: any[];
  rating: number;
  slug: string;
  timing?: StoreTiming;
  lat?: number;
  lon?: number;
  menu: any[];
  activeSessions: any[];
  orders: any[];
  stats: {
    totalTables: number;
    occupiedTables: number;
    totalMenuItems: number;
    recentOrdersCount: number;
    recentRevenue: number;
  }
}

interface DashboardResponse {
  status: number;
  message: string;
  data: StoreData;
}

export default function StoreDashboard() {
  const { storeId } = useUser();
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState<StoreData | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!storeId) return;
      setLoading(true);
      try {
        const res = await apiRequest<DashboardResponse>(`/owner/store/${storeId}/data`);
        if (res.status !== 200) throw new Error(res.message);
        setStoreData(res.data);
      } catch (err: any) {
        console.log("Error fetching store data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [storeId]);

  if (loading) {
    return (
      <GlobalTableOSLoader />
    );
  }

  if (!storeData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Failed to load store data.</p>
      </div>
    );
  }

  const { name, category, tables, stats, orders } = storeData as any;

  return (
    <div className="min-h-screen text-black font-sans">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
          <p className="text-sm text-gray-400 ml-0.5">
            {loading ? "Loading staff..." : `${storeData.tables.length} tables across your store...`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Revenue (Recent)</p>
          <p className="text-2xl font-mono font-semibold">₹{stats.recentRevenue.toLocaleString()}</p>
        </div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 mb-1"
      >
        <StatCard title="Occupancy" value={`${stats.occupiedTables}/${stats.totalTables}`} icon={<ChatCircleDotsIcon size={20} />} detail="Active Tables" />
        <StatCard title="Menu Items" value={stats.totalMenuItems} icon={<ChatCircleDotsIcon size={20} />} detail="Live on Menu" />
        <StatCard title="Recent Orders" value={stats.recentOrdersCount} icon={<ChatCircleDotsIcon size={20} />} detail="Last 50 Orders" />
        <StatCard title="Avg Rating" value={storeData.rating || "0.0"} icon={<ChatCircleDotsIcon size={20} />} detail="Customer Feedback" color="text-amber-500" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
        <motion.div variants={itemVariants} initial="hidden" animate="show" className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold">Recent Transactions</h3>
            <button className="text-xs text-gray-400 hover:text-gray-600">View All</button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs uppercase text-gray-400 bg-gray-50/50">
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Method</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {orders && (orders as any).slice(0, 8).map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 capitalize text-gray-600">{order.paymentMethod}</td>
                  <td className="px-6 py-4 text-right font-medium">₹{order.totalAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="show" className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Table Status</h3>
          <div className="grid grid-cols-3 gap-3 overflow-y-scroll h-[250px]">
            {tables && (tables as any).map((table: any) => (
              <div
                key={table.id}
                className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all ${table.isOccupied
                  ? "border-emerald-100 bg-emerald-50/30 text-emerald-700"
                  : "border-gray-100 bg-gray-50 text-gray-400"
                  }`}
              >
                <span className="text-xs font-bold">{table.tableLabel}</span>
                <span className="text-[10px]">{table.isOccupied ? "Busy" : "Free"}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, detail, color = "text-gray-400" }: any) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white p-5 border border-gray-200/75 rounded-xl"
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`p-2 rounded-lg bg-gray-50 ${color}`}>{icon}</span>
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h4 className="text-2xl font-bold tracking-tight">{value}</h4>
        <p className="text-xs text-gray-400 mt-1">{detail}</p>
      </div>
    </motion.div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-amber-100 text-amber-700';
    case 'ready': return 'bg-blue-100 text-blue-700';
    case 'cancelled': return 'bg-rose-100 text-rose-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}