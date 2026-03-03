import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

const QrScanner = ({ onScan, onError }: QrScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    const scannerId = "qr-reader-container";

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            scanner.stop().catch(() => {});
            onScan(decodedText);
          },
          () => {} // ignore scan failures (no QR in frame)
        );
        setStarted(true);
      } catch (err: any) {
        const msg = typeof err === "string" ? err : err?.message || "Error al acceder a la cámara";
        if (msg.includes("NotAllowedError") || msg.includes("Permission")) {
          setPermissionDenied(true);
        }
        onError?.(msg);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  if (permissionDenied) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-late font-bold mb-2">Permiso de cámara denegado</p>
        <p className="text-xs text-muted-foreground">
          Habilita el acceso a la cámara en la configuración de tu navegador o dispositivo para escanear códigos QR.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        id="qr-reader-container"
        ref={containerRef}
        className="w-full rounded-2xl overflow-hidden"
      />
      {!started && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-2xl">
          <p className="text-sm text-muted-foreground animate-pulse">Iniciando cámara…</p>
        </div>
      )}
    </div>
  );
};

export default QrScanner;
