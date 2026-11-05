import React, { useState } from "react";
import { BarcodeScannerComponent } from "react-qr-barcode-scanner";
import { API_BASE } from '../../config/api';

const BarcodeScanner = () => {
  const [studentNumber, setStudentNumber] = useState("");
  const [isScanning, setIsScanning] = useState(true);

  const handleScan = (err, result) => {
    if (result) {
      setStudentNumber(result.text); // auto-fill textbox
      setIsScanning(false);

      // auto-send to backend
      sendToBackend(result.text);
    }
  };

  const sendToBackend = async (studentNum) => {
    try {
      const res = await fetch(`${API_BASE}/database/attendance.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ student_number: studentNum }),
      });

      const data = await res.json();
      console.log("Server response:", data);
      alert(`Attendance saved for ${studentNum}`);
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-lg font-semibold text-[#00BFA6]">
        Scan Student ID
      </h2>

      {isScanning && (
        <div className="border-2 border-[#00BFA6] rounded-xl overflow-hidden w-[300px] h-[300px]">
          <BarcodeScannerComponent
            width={300}
            height={300}
            onUpdate={handleScan}
          />
        </div>
      )}

      <input
        type="text"
        value={studentNumber}
        readOnly
        className="border-b-2 border-[#00BFA6] outline-none text-center p-2 w-[250px]"
        placeholder="Student Number"
      />

      {!isScanning && (
        <button
          onClick={() => setIsScanning(true)}
          className="bg-[#00BFA6] text-white px-4 py-2 rounded-lg"
        >
          Scan Another
        </button>
      )}
    </div>
  );
};

export default BarcodeScanner;
