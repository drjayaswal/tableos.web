"use client";

import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  CirclesThreePlusIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react";

interface QRGeneratorProps {
  slug: string;
  tableId: string;
}

export default function QRGenerator({ slug, tableId }: QRGeneratorProps) {
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fullUrl = `${window.location.origin}/restaurant/${slug}?tableId=${tableId}`;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `Table-${tableId}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold tracking-wider text-black">
        QR CODE
      </label>

      <div style={{ display: 'none' }}>
        <QRCodeCanvas
          value={fullUrl}
          size={600}
          level="H"
          marginSize={2}
          ref={canvasRef}
        />
      </div>

      <div className="h-8.5 mt-1 flex items-center pl-3 pr-0.5 bg-white text-black border border-gray-200 hover:bg-gray-100 rounded-md transition-colors">
        {isGenerated ? (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 text-[11px] font-bold text-gray-700 uppercase w-full group"
          >
            <DownloadSimpleIcon size={16} weight="bold" className="group-hover:translate-y-0.5 transition-transform" />
            Download QR
          </button>
        ) : (
          <button
            onClick={() => setIsGenerated(true)}
            className="flex items-center justify-between w-full text-gray-400 cursor-pointer hover:text-gray-900 transition-colors"
          >
            <span className="text-[11px] flex items-center gap-2 font-bold text-gray-700 uppercase">
              <CirclesThreePlusIcon size={16} weight="bold" />
              Generate
            </span>
          </button>
        )}
      </div>
    </div>
  );
}