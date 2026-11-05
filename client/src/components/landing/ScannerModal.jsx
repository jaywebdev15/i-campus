import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { BiX, BiErrorCircle } from 'react-icons/bi';
import { IMAGE_BASE } from '../../config/api';
import { API_BASE } from '../../config/api';

const ScannerModal = ({ isOpen, onClose }) => {
    const [studentData, setStudentData] = useState(null);
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
             if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
             }
             return;
        }

        // Initialize Scanner when modal opens
        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            const scanner = new Html5QrcodeScanner(
                "reader-modal",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );
    
            scanner.render(onScanSuccess, onScanFailure);
            scannerRef.current = scanner;
    
            function onScanSuccess(decodedText, decodedResult) {
                console.log(`Code matched = ${decodedText}`, decodedResult);
                if(decodedResult) {
                    handleScan(decodedText);
                    scanner.clear(); 
                }
            }
    
            function onScanFailure() {
                // Ignore failures
            }
        }, 300);

        return () => {
            clearTimeout(timer);
             if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
             }
        };
    }, [isOpen]);

    const handleScan = async (studentNumber) => {
        try {
            const response = await fetch(`${API_BASE}/database/scan_entry.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ student_number: studentNumber })
            });
            const data = await response.json();

            if (data.status === "success") {
                setStudentData(data.student);
                setTimeout(() => {
                    setStudentData(null);
                    if(scannerRef.current) {
                         // Re-render scanner to continue scanning? 
                         // For now, simpler to just close or reload.
                         // Or create a new instance?
                         // Ideally, we just restart scanning. 
                         // But Html5QrcodeScanner is tricky to restart without full re-init.
                         // Let's just close modal or reset state.
                         window.location.reload(); 
                    }
                }, 5000);
            } else {
                setError(data.message || "Student not found");
                setTimeout(() => { setError(null); window.location.reload(); }, 2000);
            }
        } catch (err) {
            console.error("Scanning error:", err);
            setError("Connection error");
             setTimeout(() => { setError(null); window.location.reload(); }, 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-zoom-in">
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <BiX className="text-2xl" />
                </button>

                <div className="flex flex-col h-full bg-slate-900 border border-slate-700">
                     {/* Header */}
                    <div className="p-6 text-center border-b border-white/10">
                        <h2 className="text-2xl font-bold text-white">Attendance Scanner</h2>
                        <p className="text-slate-400 text-sm">Scan your ID barcode or QR code</p>
                    </div>

                    <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[400px]">
                         {/* Scanner Container */}
                        {!studentData && !error && (
                            <div className="w-full max-w-md bg-white rounded-xl overflow-hidden">
                                <div id="reader-modal" className="w-full"></div>
                            </div>
                        )}

                        {/* Success Display */}
                        {studentData && (
                            <div className="text-center animate-in fade-in zoom-in w-full">
                                <div className="w-32 h-32 mx-auto rounded-full border-4 border-green-500 p-1 mb-4 shadow-lg overflow-hidden">
                                    <img 
                                        src={studentData.student_image && studentData.student_image !== '' 
                                            ? `${IMAGE_BASE}/students/${studentData.student_image}`
                                            : `${IMAGE_BASE}/students/default.jpg`} 
                                        alt="Student" 
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                </div>
                                <div className="bg-green-500 text-white px-4 py-1 rounded-full inline-block text-xs font-bold uppercase tracking-wider mb-4">Access Granted</div>
                                <h3 className="text-3xl font-bold text-white mb-1">
                                    {`${studentData.last_name}, ${studentData.first_name}`}
                                </h3>
                                <p className="text-xl text-slate-400">{studentData.student_number}</p>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="text-center text-red-400 animate-bounce">
                                <BiErrorCircle className="text-6xl mb-2 mx-auto" />
                                <p className="text-xl font-bold">{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScannerModal;
