"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import Image from "next/image";
import { apiRequest } from "../../utility/api";
import { Button } from "@/app/components/ui/button";
import { useUser } from "@/app/context/UserContext";
import { CancelIcon, ChangeTableIcon, DownloadIcon, ErrorIcon, GenerateIcon, SearchIcon, StoreIcon, TableIcon } from "@/app/components/icons/svg";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 200 },
  },
};

interface StoreData {
  slug: string;
  tables: number;
}

const Skeleton = () => (
  <div className="animate-pulse space-y-8 w-full">
    <div className="space-y-3">
      <div className="h-4 w-24 bg-gray-100 rounded-full" />
      <div className="h-12 w-full bg-gray-50 rounded-2xl border-b-2 border-gray-100" />
    </div>
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-3 w-20 bg-gray-100 rounded-full" />
        <div className="h-3 w-16 bg-gray-50 rounded-full" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-gray-50 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

const ROW_HEIGHT = 40;
const VISIBLE_ROWS = 4;
const COLUMNS = 4;
const OVERSCAN = 3;

function TableSelector({
  total,
  selected,
  onSelect,
}: {
  total: number;
  selected: number | null;
  onSelect: (n: number) => void;
}) {
  const [query, setQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return Array.from({ length: total }, (_, i) => i + 1);
    return Array.from({ length: total }, (_, i) => i + 1).filter((n) =>
      String(n).startsWith(q)
    );
  }, [total, query]);

  const rows = useMemo(() => {
    const chunks: number[][] = [];
    for (let i = 0; i < filtered.length; i += COLUMNS) {
      chunks.push(filtered.slice(i, i + COLUMNS));
    }
    return chunks;
  }, [filtered]);

  const totalHeight = rows.length * ROW_HEIGHT;
  const viewportHeight = VISIBLE_ROWS * ROW_HEIGHT;

  const startRow = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endRow = Math.min(rows.length, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  useEffect(() => {
    setScrollTop(0);
    scrollRef.current?.scrollTo({ top: 0 });
  }, [query]);

  useEffect(() => {
    if (selected === null) return;
    const idx = filtered.indexOf(selected);
    if (idx === -1) return;
    const rowIdx = Math.floor(idx / COLUMNS);
    const targetTop = rowIdx * ROW_HEIGHT;
    const currentBottom = scrollTop + viewportHeight;
    if (targetTop < scrollTop || targetTop + ROW_HEIGHT > currentBottom) {
      scrollRef.current?.scrollTo({
        top: Math.max(0, targetTop - ROW_HEIGHT * 2),
        behavior: "smooth",
      });
    }
  }, [selected]);

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
        >
          <SearchIcon />
        </div>
        <input
          type="number"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Jump to table…`}
          className="w-full pl-10 pr-7 py-2.5 text-sm font-bold shadow-sm focus:shadow-md shadow-black/25 text-black placeholder-gray-400 border border-gray-200 rounded-xl outline-none bg-white transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
          >
         <CancelIcon/>
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-8 text-center text-xs font-semibold text-gray-300 border-2 border-gray-100 rounded-2xl">
          No table #{query} found
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-y-auto min-h-30 max-h-50 bg-white shadow-md shadow-black/25 rounded-xl relative"
        >
          <div style={{ height: totalHeight, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                top: startRow * ROW_HEIGHT,
                left: 0,
                right: 0,
              }}
            >
              {rows.slice(startRow, endRow).map((row, ri) => (
                <div
                  key={startRow + ri}
                  className="grid border-b border-gray-100 last:border-b-0"
                  style={{
                    gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
                    height: ROW_HEIGHT,
                  }}
                >
                  {row.map((num) => (
                    <button
                      key={num}
                      onClick={() => onSelect(num)}
                      className={`flex items-center justify-center gap-1.5 text-sm font-bold cursor-pointer transition-all duration-150 border-r border-gray-100 last:border-r-0
                        ${selected === num
                          ? "bg-teal-500 text-white"
                          : "bg-white text-gray-400 hover:bg-teal-50 hover:text-teal-500"
                        }`}
                    >
                      {selected == num ?
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 1 * 0.02 }}
                        >
                        <TableIcon className="w-5 h-5" />
                        </motion.div>
                        :
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 1 * 0.02 }}
                        >
                        <TableIcon className="w-5 h-5" />
                        </motion.div>
                      }
                      <span>{num}</span>
                    </button>
                  ))}
                  {row.length < COLUMNS &&
                    Array.from({ length: COLUMNS - row.length }).map((_, pi) => (
                      <div
                        key={`pad-${pi}`}
                        className="border-r border-gray-100 last:border-r-0 bg-white"
                      />
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-0.5 h-4">
        <AnimatePresence mode="wait">
          {selected !== null ? (
            <motion.p
              key="selected"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="text-[11px] font-bold text-main"
            >
              Table number {selected} selected
            </motion.p>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[11px] text-gray-400 font-medium"
            >
              {total} tables available
            </motion.p>
          )}
        </AnimatePresence>
        {query.trim() && (
          <p className="text-[11px] text-gray-300 font-medium">
            {filtered.length} match{filtered.length !== 1 ? "es" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

const CACHE_EXPIRY = 60 * 60 * 1000;

export default function GeneratorPage() {
  const { storeId, isLoading: contextLoading } = useUser();
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [fetchError, setFetchError] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchStore = useCallback(async (force = false) => {
    if (!storeId) return;

    const cacheKey = `store_tables_${storeId}`;
    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          setStoreData(data);
          return;
        }
      }
    }

    setFetchLoading(true);
    setFetchError("");
    try {
      const json = await apiRequest<any>(`/owner/store/tables/${storeId}`);
      if (json.status === 200) {
        setStoreData(json.data);
        localStorage.setItem(cacheKey, JSON.stringify({ data: json.data, timestamp: Date.now() }));
      } else {
        setFetchError(json.message);
      }
    } catch (e: any) {
      setFetchError("Connection to TableOS failed.");
    } finally {
      setFetchLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (!contextLoading && storeId) {
      fetchStore();
    }
  }, [contextLoading, storeId, fetchStore]);

  const fullUrl = typeof window !== "undefined" && storeData && selectedTable !== null
    ? `${window.location.origin}/${storeData.slug}?tableId=${selectedTable}`
    : "";

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${storeData?.slug}-table-${selectedTable}.png`;
    link.click();
  }, [selectedTable]);

  const canGenerate = storeData !== null && selectedTable !== null;

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <main className="flex-1 flex flex-col items-center justify-center px-5 sm:px-6 py-12 md:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center"
        >
          <div className="text-center lg:text-left space-y-8">
            <motion.div variants={itemVariants} className="space-y-3">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black tracking-tight leading-[0.95]">
                Generate <br />
                <span className="text-main">QR Code</span>
              </h1>
              <p className="text-gray-500 text-base sm:textLg lg:text-xl leading-relaxed max-w-md mx-auto lg:mx-0">
                Create high-resolution digital IDs for your HORECA tables instantly.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full max-w-sm mx-auto lg:mx-0">
              {fetchLoading ? (
                <Skeleton />
              ) : fetchError ? (
                <div className="flex items-start gap-3 px-5 py-4 bg-red-500/10 rounded-xl">
                  <div className="text-red-500 shrink-0 mt-0.5" >
                    <ErrorIcon />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-red-900 font-bold">Error Accessing Store</p>
                    <p className="text-xs text-red-700 font-medium leading-relaxed">{fetchError}</p>
                  </div>
                </div>
              ) : storeData ? (
                <div className="space-y-7">
                  <div className="relative bg-white shadow-sm shadow-black/25 px-4 rounded-2xl">
                    <div
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-black"
                    >
                      <StoreIcon className="w-5 h-5" />
                    </div>
                    <div className="w-full pl-8 pr-2 py-3 font-bold text-black bg-transparent flex items-center justify-between">
                      <span className="truncate">{storeData.slug}</span>
                      <Button
                        variant={"tableos"}
                        onClick={() => fetchStore(true)}
                        disabled={fetchLoading}
                      >
                        Sync
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-0.5">
                      <p className="text-[11px] font-bold text-black uppercase">
                        Select Table
                      </p>
                      <p className="text-[11px] font-bold text-black">
                        {storeData.tables} total
                      </p>
                    </div>
                    <TableSelector
                      total={storeData.tables}
                      selected={selectedTable}
                      onSelect={(n) => {
                        setSelectedTable(n);
                        setIsGenerated(false);
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="flex justify-center w-full">
            <div className="relative p-6 sm:p-10 lg:p-16 flex flex-col items-center text-center w-full max-w-md">
              <motion.div
                layout
                className={`relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center ${isGenerated && canGenerate ? "mb-8" : "mb-4"
                  }`}
              >
                <AnimatePresence mode="wait">
                  {isGenerated && canGenerate ? (
                    <motion.div
                      key="qr-active"
                      initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0.5, opacity: 0, rotate: 15 }}
                      transition={{ type: "spring", damping: 15, stiffness: 200 }}
                      className="p-3 bg-white border-2 border-black rounded-2xl"
                    >
                      <QRCodeCanvas
                        value={fullUrl}
                        size={148}
                        level="H"
                        ref={canvasRef}
                        imageSettings={{
                          src: "/assets/tableOS-logo.svg",
                          height: 32,
                          width: 32,
                          excavate: true,
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="relative"
                    >
                      <div
                        className="relative w-32 h-32 bg-white rounded-3xl flex items-center overflow-hidden justify-center text-white shadow-black/25 border border-gray-200 shadow-md"
                      >
                        <Image src="/assets/tableOS-text-logo.svg" alt="Logo" width={250} height={250} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div className="w-full flex flex-col items-center">
                <AnimatePresence mode="wait">
                  {!isGenerated ? (
                    <Button
                      onClick={() => setIsGenerated(true)}
                      disabled={!canGenerate}
                    >
                      <GenerateIcon />
                      Generate
                    </Button>
                  ) : (
                    <div className="flex flex-col items-center gap-5">
                      <Button onClick={handleDownload}>
                        <DownloadIcon />
                        Download PNG
                      </Button>
                      <button
                        onClick={() => setIsGenerated(false)}
                        className="flex items-center gap-2 text-gray-400 hover:text-black font-bold text-xs transition-colors cursor-pointer"
                      >
                        <ChangeTableIcon />
                        Change Table
                      </button>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}