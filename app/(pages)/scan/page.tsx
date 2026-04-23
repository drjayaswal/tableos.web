"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { QRScanner } from "@/app/components/QRScanner";
import { QRFetcher } from "@/app/components/QRFetcher";
import { Button } from "@/app/components/ui/button";

interface ScanData {
  storeId: string;
  tableId: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 200 }
  }
};

export default function ScanPage() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isFetcherOpen, setIsFetcherOpen] = useState(false);
  const router = useRouter();

  const handleScanSuccess = useCallback(async ({ storeId, tableId }: ScanData) => {
    setIsScannerOpen(false);
    router.push(`/scan/order/?storeId=${storeId}&tableId=${tableId}`);
  }, [router]);

  const handleFetcherSuccess = useCallback(async ({ storeId, tableId }: ScanData) => {
    setIsFetcherOpen(false);
    router.push(`/scan/order/?storeId=${storeId}&tableId=${tableId}`);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <main className="flex-1 flex flex-col items-center gap-0 px-6 pt-20 md:py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 sm:gap-12 gap-0 lg:gap-24 items-center"
        >
          <div className="text-center lg:text-left space-y-6">
            <motion.div variants={itemVariants} className="space-y-2">
              <h1 className="text-4xl lg:text-7xl font-bold text-black tracking-tight leading-[0.95]">
                Ready to <span className="text-main">Order?</span>
              </h1>
              <p className="text-gray-500 text-sm lg:text-xl leading-relaxed max-w-md mx-auto lg:mx-0">
                Scan your table's QR code or upload a photo to start your dining experience.
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="pt-4">
              <div className="sm:flex hidden items-center gap-4 p-4 bg-linear-to-r from-indigo-500/10 via-transparent to-transparent rounded-full max-w-sm mx-auto lg:mx-0">
                <div className="shrink-0 text-white p-3 bg-indigo-600 rounded-4xl">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 11C6.38695 11 8.67613 11.9482 10.364 13.636C12.0518 15.3239 13 17.6131 13 20M4 4C8.24346 4 12.3131 5.68571 15.3137 8.68629C18.3143 11.6869 20 15.7565 20 20M6 19C6 19.5523 5.55228 20 5 20C4.44772 20 4 19.5523 4 19C4 18.4477 4.44772 18 5 18C5.55228 18 6 18.4477 6 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-indigo-600">Coming Soon...</span>
                  </div>
                  <span className="text-sm font-bold text-black leading-tight">NFC Tap-to-Order</span>
                  <p className="text-[11px] text-black/40 font-bold">Enterprise exclusive for Q3</p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="flex justify-center">
            <motion.div layout className="relative p-10 lg:p-14 pt-0 flex flex-col items-center text-center w-full max-w-md">
              <motion.div layout className="relative mb-8">
                <div
                  className="relative w-32 h-32 bg-white rounded-4xl flex items-center overflow-hidden justify-center text-white shadow-black/25 border border-gray-200 shadow-md"
                >
                  <Image src="/assets/tableOS-text-logo.svg" alt="Logo" width={250} height={250} />
                </div>
              </motion.div>

              <motion.div layout className="space-y-3 mb-10">
                <h2 className="text-2xl font-bold text-black tracking-tight">Scan or Upload</h2>
                <p className="text-gray-500 text-sm leading-relaxed max-w-[240px]">
                  Use your camera or select a photo from your gallery to begin.
                </p>
              </motion.div>

              <motion.div layout className="w-full flex flex-col items-center gap-4">
                <Button
                  variant={"tableos"}
                  onClick={() => setIsScannerOpen(true)}
                >
                  <svg strokeWidth="2" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 8.37722C2 8.0269 2 7.85174 2.01462 7.70421C2.1556 6.28127 3.28127 5.1556 4.70421 5.01462C4.85174 5 5.03636 5 5.40558 5C5.54785 5 5.61899 5 5.67939 4.99634C6.45061 4.94963 7.12595 4.46288 7.41414 3.746C7.43671 3.68986 7.45781 3.62657 7.5 3.5C7.54219 3.37343 7.56329 3.31014 7.58586 3.254C7.87405 2.53712 8.54939 2.05037 9.32061 2.00366C9.38101 2 9.44772 2 9.58114 2H14.4189C14.5523 2 14.619 2 14.6794 2.00366C15.4506 2.05037 16.126 2.53712 16.4141 3.254C16.4367 3.31014 16.4578 3.37343 16.5 3.5C16.5422 3.62657 16.5633 3.68986 16.5859 3.746C16.874 4.46288 17.5494 4.94963 18.3206 4.99634C18.381 5 18.4521 5 18.5944 5C18.9636 5 19.1483 5 19.2958 5.01462C20.7187 5.1556 21.8444 6.28127 21.9854 7.70421C22 7.85174 22 8.0269 22 8.37722V16.2C22 17.8802 22 18.7202 21.673 19.362C21.3854 19.9265 20.9265 20.3854 20.362 20.673C19.7202 21 18.8802 21 17.2 21H6.8C5.11984 21 4.27976 21 3.63803 20.673C3.07354 20.3854 2.6146 19.9265 2.32698 19.362C2 18.7202 2 17.8802 2 16.2V8.37722Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 16.5C14.2091 16.5 16 14.7091 16 12.5C16 10.2909 14.2091 8.5 12 8.5C9.79086 8.5 8 10.2909 8 12.5C8 14.7091 9.79086 16.5 12 16.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Open Camera
                </Button>
                <Button
                  variant={"tableos"}
                  onClick={() => setIsFetcherOpen(true)}
                >
                  <svg strokeWidth="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H17C17.93 21 18.395 21 18.7765 20.8978C19.8117 20.6204 20.6204 19.8117 20.8978 18.7765C21 18.395 21 17.93 21 17M19 8V2M16 5H22M10.5 8.5C10.5 9.60457 9.60457 10.5 8.5 10.5C7.39543 10.5 6.5 9.60457 6.5 8.5C6.5 7.39543 7.39543 6.5 8.5 6.5C9.60457 6.5 10.5 7.39543 10.5 8.5ZM14.99 11.9181L6.53115 19.608C6.05536 20.0406 5.81747 20.2568 5.79643 20.4442C5.77819 20.6066 5.84045 20.7676 5.96319 20.8755C6.10478 21 6.42628 21 7.06929 21H16.456C17.8951 21 18.6147 21 19.1799 20.7582C19.8894 20.4547 20.4547 19.8894 20.7582 19.1799C21 18.6147 21 17.8951 21 16.456C21 15.9717 21 15.7296 20.9471 15.5042C20.8805 15.2208 20.753 14.9554 20.5733 14.7264C20.4303 14.5442 20.2412 14.3929 19.8631 14.0905L17.0658 11.8527C16.6874 11.5499 16.4982 11.3985 16.2898 11.3451C16.1061 11.298 15.9129 11.3041 15.7325 11.3627C15.5279 11.4291 15.3486 11.5921 14.99 11.9181Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Upload Image
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>

      <AnimatePresence>
        {isScannerOpen && (
          <QRScanner
            onClose={() => setIsScannerOpen(false)}
            onScanSuccess={handleScanSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFetcherOpen && (
          <QRFetcher
            onClose={() => setIsFetcherOpen(false)}
            onScanSuccess={handleFetcherSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}