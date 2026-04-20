"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { motion } from "framer-motion";
import Image from "next/image";

interface QRScannerProps {
  onClose: () => void;
  onScanSuccess: (data: { storeId: string; tableId: string }) => void;
}

export function QRScanner({ onClose, onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 20,
            aspectRatio: 1.0,
          },
          async (decodedText) => {
            try {
              const url = new URL(decodedText);
              const pathParts = url.pathname.split("/").filter(Boolean);
              const storeId = url.searchParams.get("storeId") || pathParts[pathParts.length - 2];
              const tableId = url.searchParams.get("tableId") || pathParts[pathParts.length - 1];

              if (storeId && tableId) {
                if (scannerRef.current?.isScanning) {
                  await scannerRef.current.stop();
                }
                onScanSuccess({ storeId, tableId });
              }
            } catch (e) {
              console.warn("Invalid QR URL structure");
            }
          },
          () => { }
        );
      } catch (err) {
        console.error("Camera error:", err);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().then(() => {
          const container = document.getElementById("reader");
          if (container) container.innerHTML = "";
        });
      }
    };
  }, [onScanSuccess]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-[320px] bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50">
          <div className="flex items-center gap- rounded-l-4xl overflow-hidden">
            <Image src="/assets/tableOS-logo.svg" alt="Logo" width={28} height={28} />
            <span className="text-[18.5px] text-main bg-linear-to-r from-main/20 via-main/10 to-main/1 px-2 pr-3 font-bold tracking-tight">tableOS</span>
          </div>
          <button onClick={onClose} className="sm:text-gray-400 hover:text-red-500 text-red-500 p-1 cursor-pointer transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 9L9 15M9 9L15 15M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="relative aspect-square overflow-hidden">
          <div id="reader" className="w-full h-full" />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48" />
            <motion.div
              animate={{ y: [-100, 100] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute w-full h-0.5 bg-white"
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-white text-center">
          <p className="text-[10px] font-medium text-gray-500 leading-relaxed text-center">
            Scan the QR code on your table to <br />
            <span className="text-gray-900 font-bold">Open Menu & Start Ordering</span>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}