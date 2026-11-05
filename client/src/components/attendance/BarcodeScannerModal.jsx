// BarcodeScannerModal.jsx
import React, { useState } from "react";
import BarcodeScanner from "react-qr-barcode-scanner";

const BarcodeScannerModal = ({ onDetected, onClose }) => {
  const [stopStream, setStopStream] = useState(false);

  // helper to close safely: first stop stream then close modal next tick
  const safeClose = () => {
    setStopStream(true);
    // give the component a tick to stop the stream (workaround for known issue)
    setTimeout(() => {
      onClose();
      // reset stopStream just in case (optional)
      setStopStream(false);
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center gap-3">
        <h2 className="text-lg font-semibold">Scan Student QR Code</h2>

        <div style={{ width: 300, height: 300 }}>
          <BarcodeScanner
            width={300}
            height={300}
            stopStream={stopStream}         // important: allow stopping stream
            onUpdate={(err, result) => {
              if (result) {
                // result may expose getText() depending on version; handle both:
                const text = typeof result.getText === "function" ? result.getText() : result.text ?? "";
                if (text) {
                  onDetected(text);
                  safeClose();
                }
              }
            }}
            onError={(error) => {
              // optionally handle permission denied or other camera errors
              console.error("Barcode scanner error:", error);
            }}
          />
        </div>

        <button
          onClick={safeClose}
          className="mt-3 bg-gray-700 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;
