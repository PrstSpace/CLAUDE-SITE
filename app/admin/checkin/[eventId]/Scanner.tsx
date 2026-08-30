"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

type ScanResult = {
  ok: boolean;
  alreadyCheckedIn?: boolean;
  message: string;
  registrant?: {
    fullName: string;
    company: string;
    position: string;
    checkedInAt: string | null;
  };
};

const READER_ELEMENT_ID = "qr-reader";

export default function Scanner({ eventId }: { eventId: string }) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const busyRef = useRef(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = useCallback(
    async (scanned: string) => {
      if (busyRef.current) return;
      busyRef.current = true;

      try {
        const res = await fetch("/api/admin/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scanned, eventId }),
        });
        const data = (await res.json()) as ScanResult;
        setResult(data);
      } catch {
        setResult({ ok: false, message: "Ошибка сети, попробуйте ещё раз" });
      } finally {
        setTimeout(() => {
          busyRef.current = false;
        }, 1500);
      }
    },
    [eventId]
  );

  useEffect(() => {
    const scanner = new Html5Qrcode(READER_ELEMENT_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decodedText) => {
          void handleScan(decodedText);
        },
        () => {
          // ignore per-frame decode failures, this fires continuously
        }
      )
      .catch((err) => {
        setCameraError(
          err instanceof Error ? err.message : "Не удалось получить доступ к камере"
        );
      });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [handleScan]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        id={READER_ELEMENT_ID}
        className="w-full max-w-sm overflow-hidden rounded-lg border border-neutral-200"
      />

      {cameraError && (
        <p className="max-w-sm text-center text-sm text-red-600">
          Камера недоступна: {cameraError}. Разрешите доступ к камере в браузере.
        </p>
      )}

      {result && (
        <div
          className={
            result.ok
              ? "w-full max-w-sm rounded-lg border border-green-600/30 bg-green-50 p-4 text-green-900"
              : "w-full max-w-sm rounded-lg border border-red-600/30 bg-red-50 p-4 text-red-900"
          }
        >
          <p className="font-semibold">{result.message}</p>
          {result.registrant && (
            <div className="mt-2 text-sm">
              <div className="font-medium">{result.registrant.fullName}</div>
              <div>{result.registrant.company} — {result.registrant.position}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
