"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { Loading, TableIcon } from "@/app/components/icons/svg";
import { useUser } from "@/app/context/UserContext";
import { apiRequest } from "@/app/utility/api";
import { toast } from "sonner";
import { cn } from "@/app/lib/utils";
import { QRCodeSVG } from "qrcode.react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Table {
    id: string;
    tableLabel: string;
    isOccupied: boolean;
    isActive: boolean;
}

export interface ApiResponse {
    status: number;
    message: string;
    data: {
        tables: Table[];
    };
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TablesPage() {
    const { storeId } = useUser();
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTables = async () => {
        if (!storeId) return;
        try {
            const res = await apiRequest<ApiResponse>(`/owner/store/tables/${storeId}`);
            if (res.status === 200) {
                setTables(res.data.tables);
            }
        } catch {
            toast.error("Failed to fetch tables");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, [storeId]);

    const downloadQR = (tableLabel: string, id: string) => {
        const svg = document.getElementById(id);
        if (!svg) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const svgSize = 2000;
        canvas.width = svgSize;
        canvas.height = svgSize;

        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        const qrImg = new Image();
        const logoImg = new Image();

        logoImg.crossOrigin = "anonymous";
        logoImg.src = "/assets/tableOS-logo.svg";

        qrImg.onload = () => {
            if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(qrImg, 0, 0, svgSize, svgSize);

                const logoSize = svgSize * 0.2;
                const pos = (svgSize - logoSize) / 2;

                logoImg.onload = () => {
                    ctx.drawImage(logoImg, pos, pos, logoSize, logoSize);
                    finishDownload();
                };

                if (logoImg.complete) {
                    ctx.drawImage(logoImg, pos, pos, logoSize, logoSize);
                    finishDownload();
                }
            }
        };

        const finishDownload = () => {
            const pngUrl = canvas.toDataURL("image/png", 1.0);
            const link = document.createElement("a");
            link.download = `${tableLabel}-HDQR.png`;
            link.href = pngUrl;
            link.click();
            URL.revokeObjectURL(url);
        };

        qrImg.src = url;
    };

    return (
        <div className="h-full scroll-smooth">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-1">
                    <TableIcon className="w-6 h-6 text-black" />
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tables</h1>
                </div>
                <p className="text-sm text-gray-400">Monitor table occupancy and download QR codes for customer scanning</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><Loading className="w-10 h-10 animate-spin" /></div>
            ) : tables.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold">No tables configured</p>
                    <p className="text-xs text-gray-400 mt-1">Configure the number of tables in Store Settings</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
                    {tables.map((table) => {
                        const qrValue = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/scan/order?storeId=${storeId}&tableId=${table.id}`;
                        return (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key={table.id}
                                className={`bg-white relative rounded-xl p-4 ${table.isOccupied ? "shadow-sm border border-gray-200/80" : ""} flex flex-col items-center group transition-all`}
                            >
                                <div className="flex items-center mb-3 justify-between w-full">
                                    <span className="text-[10px] font-bold uppercase text-gray-400">{table.tableLabel}</span>
                                    <div className={cn(
                                        "h-2 w-2 rounded-full",
                                        !table.isActive ? "bg-pink-500 animate-pulse" : "bg-emerald-500"
                                    )} />
                                </div>

                                <motion.div
                                    whileHover="hover"
                                    initial="initial"
                                    className="relative mb-3 cursor-pointer"
                                    style={{ perspective: 1000 }}
                                >
                                    <motion.div
                                        variants={{
                                            initial: { rotateY: 0 },
                                            hover: { rotateY: 180 }
                                        }}
                                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                                        style={{ transformStyle: "preserve-3d" }}
                                        className="relative w-[100px] h-[100px]"
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ backfaceVisibility: "hidden" }}>
                                            <TableIcon className="w-10 h-10 text-black" />
                                        </div>
                                        <div
                                            className="absolute inset-0 rounded-none overflow-hidden bg-white"
                                            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                                        >
                                            <QRCodeSVG
                                                id={`qr-${table.id}`}
                                                value={qrValue}
                                                size={100}
                                                level="H"
                                                imageSettings={{
                                                    src: "/assets/tableOS-logo.svg",
                                                    height: 24,
                                                    width: 24,
                                                    excavate: true,
                                                }}
                                            />
                                        </div>
                                    </motion.div>
                                </motion.div>

                                <Button
                                    variant="tableos"
                                    onClick={() => downloadQR(table.tableLabel, `qr-${table.id}`)}
                                    className="w-full text-[12px] font-bold h-9"
                                >
                                    Download QR
                                </Button>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
