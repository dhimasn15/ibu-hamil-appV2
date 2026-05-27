"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type QrBadgeProps = {
  value: string;
  size?: number;
  downloadName?: string;
  showDownload?: boolean;
};

export default function QrBadge({
  value,
  size = 120,
  downloadName = "qr-code.png",
  showDownload = false,
}: QrBadgeProps) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(value, {
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 8,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl("");
      });

    return () => {
      active = false;
    };
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 shadow-[0_1px_0_rgba(15,23,42,0.04)]"
        style={{ width: size, height: size }}
        aria-label={`QR ${value}`}
      >
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt="QR code"
            width={size - 16}
            height={size - 16}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="h-full w-full animate-pulse rounded-md bg-slate-100" />
        )}
      </div>
      {showDownload && dataUrl ? (
        <a
          href={dataUrl}
          download={downloadName}
          className="rounded-full border border-amber-200 bg-amber-50/70 px-2.5 py-0.5 text-[10px] font-bold leading-4 text-amber-700 transition hover:bg-amber-100"
        >
          Download
        </a>
      ) : null}
    </div>
  );
}
