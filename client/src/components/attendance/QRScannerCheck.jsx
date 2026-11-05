import React, { useEffect, useState } from 'react';

const QRScannerCheck = ({ showScanner }) => {
  const [cameraSupported, setCameraSupported] = useState(true);
  const [cameraPermission, setCameraPermission] = useState(true);

  useEffect(() => {
    if (!showScanner) return;

    // Check if browser supports camera
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraSupported(false);
      return;
    }

    // Check camera permission
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        setCameraSupported(true);
        setCameraPermission(true);
        // Stop the stream immediately, we just want permission check
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(err => {
        console.log("Camera access error:", err);
        setCameraPermission(false);
      });
  }, [showScanner]);

  if (!showScanner) return null;

  if (!cameraSupported) {
    return (
      <div className="p-4 border border-red-500 rounded-md text-red-600 text-center">
        Your browser does not support camera access.
      </div>
    );
  }

  if (!cameraPermission) {
    return (
      <div className="p-4 border border-red-500 rounded-md text-red-600 text-center">
        Camera access is denied. Please enable it in your browser settings.
      </div>
    );
  }

  return null; // If camera works, do not show any message
};

export default QRScannerCheck;
