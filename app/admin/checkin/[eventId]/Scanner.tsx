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

      // Freeze the camera immediately so the still-visible QR code in
      // frame can't trigger another decode while the hostess is reading
      // the result — that would look like a false "already used" repeat.
      try {
        scannerRef.current?.pause(true);
      } catch {
        // ignore — scanner may not be in a pausable state
      }

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
      }
    },
    [eventId]
  );

  const scanNext = useCallback(() => {
    setResult(null);
    try {
      scannerRef.current?.resume();
    } catch {
      // ignore — scanner may already be running
    }
    busyRef.current = false;
  }, []);

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
        // Width/height are set inline (not via Tailwind classes) on purpose:
        // the scanner library reads clientWidth synchronously as soon as the
        // camera stream is ready and bakes it into the injected <video>'s
        // inline style permanently. On a client-side navigation to this
        // page, the stylesheet for a class-based size can still be loading
        // at that exact moment, so the library would read 0 and the video
        // stays stuck at 0 width forever. Inline style has no such race.
        style={{ width: "100%", maxWidth: 384, height: 320 }}
        className="overflow-hidden rounded-lg border border-neutral-200 [&_video]:!h-full [&_video]:!w-full [&_video]:object-cover"
      />

      {cameraError && (
        <p className="max-w-sm text-center text-sm text-red-600">
          Камера недоступна: {cameraError}. Разрешите доступ к камере в браузере.
        </p>
      )}

      {result && (
        <div className="flex w-full max-w-sm flex-col gap-4">
          <div
            className={
              result.ok
                ? "rounded-lg border border-green-600/30 bg-green-50 p-4 text-green-900"
                : "rounded-lg border border-red-600/30 bg-red-50 p-4 text-red-900"
            }
          >
            <p className="font-semibold">{result.message}</p>
            {result.registrant && (
              <div className="mt-2 text-sm">
                <div className="font-medium">{result.registrant.fullName}</div>
                <div>
                  {result.registrant.company} — {result.registrant.position}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={scanNext}
            className="rounded-md bg-neutral-900 px-4 py-2.5 font-medium text-white transition hover:bg-neutral-800"
          >
            Следующий посетитель
          </button>
        </div>
      )}
    </div>
  );
}
