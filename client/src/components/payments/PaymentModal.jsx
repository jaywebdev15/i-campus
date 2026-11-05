import React, { useEffect, useState, useContext, useCallback } from 'react'
import { API_BASE } from '../../config/api';
import { BiX, BiSave } from "react-icons/bi";
import { FlashMessageContext } from '../../context/FlashMessageContext';

const PaymentModal = ({ isOpen, onClose, enrollmentId, onSuccess }) => {
    const { showFlashMessage } = useContext(FlashMessageContext);
    const [details, setDetails] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('breakdown'); // breakdown, history, add
    
    // Add Payment Form State
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('Cash');
    const [refNo, setRefNo] = useState('');
    const [remarks, setRemarks] = useState('');

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/database/payments.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "getPaymentDetails",
                    enrollment_id: enrollmentId
                })
            });
            const result = await response.json();
            if (result.status === "success") {
                setDetails(result.data);
                setHistory(result.history || []);
            }
        } catch (error) {
            console.error("Error fetching payment details:", error);
        } finally {
            setLoading(false);
        }
    }, [enrollmentId]);

    useEffect(() => {
        if (isOpen && enrollmentId) {
            fetchDetails();
        }
    }, [isOpen, enrollmentId, fetchDetails]);

    const handleAddPayment = async () => {
        if (!amount || amount <= 0) {
            showFlashMessage("failed", "Please enter a valid amount.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/database/payments.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "addPaymentTransaction",
                    enrollment_id: enrollmentId,
                    amount: amount,
                    payment_method: method,
                    reference_no: refNo,
                    remarks: remarks
                })
            });
            const result = await response.json();
            showFlashMessage(result.status, result.message);
            if (result.status === "success") {
                // Reset form
                setAmount('');
                setRefNo('');
                setRemarks('');
                setActiveTab('history');
                fetchDetails();
                onSuccess();
            }
        } catch (error) {
            console.error("Error adding payment:", error);
            showFlashMessage("failed", "Error recording payment.");
        }
    };

    if (!isOpen) return null;

    const student = details[0] || {};
    const totalAssessment = details.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const totalPaid = history.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const balance = totalAssessment - totalPaid;

    // Validation Logic
    const isOverpaying = Number(amount) > balance;
    const isRefRequired = method !== 'Cash';
    const isRefMissing = isRefRequired && !refNo.trim();
    const isInvalidAmount = !amount || Number(amount) <= 0 || isOverpaying;
    const isSubmitDisabled = isInvalidAmount || isRefMissing;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold tracking-wide">Financial Account</h3>
                        <p className="text-xs text-blue-300 font-mono">{student.student_number} | {student.last_name}, {student.first_name}</p>
                    </div>
                    <BiX className="text-3xl cursor-pointer hover:text-red-400 transition-colors" onClick={onClose} />
                </div>

                {/* Summary Strip */}
                <div className="grid grid-cols-4 divide-x divide-gray-100 bg-blue-50/50 border-b border-gray-100 text-center">
                    <div className="p-4">
                        <p className="text-[0.65rem] text-gray-500 uppercase font-bold tracking-widest mb-1">Assessment</p>
                        <p className="text-lg font-bold text-gray-800 font-mono">₱{totalAssessment.toLocaleString()}</p>
                    </div>
                    <div className="p-4">
                        <p className="text-[0.65rem] text-gray-500 uppercase font-bold tracking-widest mb-1">Paid</p>
                        <p className="text-lg font-bold text-green-600 font-mono">₱{totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="p-4">
                        <p className="text-[0.65rem] text-gray-500 uppercase font-bold tracking-widest mb-1">Balance</p>
                        <p className={`text-lg font-bold font-mono ${balance > 0 ? 'text-red-500' : 'text-gray-400'}`}>₱{balance.toLocaleString()}</p>
                    </div>
                    <div className="p-4">
                        <p className="text-[0.65rem] text-gray-500 uppercase font-bold tracking-widest mb-1">Status</p>
                        <p className={`text-[0.55rem] font-black uppercase leading-tight
                            ${totalAssessment === 0 ? 'text-red-600 animate-pulse' : 
                              balance <= 0 ? 'text-green-600' : 
                              totalPaid > 0 ? 'text-yellow-600' : 'text-red-500'}`}>
                            {totalAssessment === 0 ? 'Please fill up correct data on the curriculum to appear the price' : 
                             balance <= 0 ? 'Paid' : 
                             totalPaid > 0 ? 'Partial' : 'Unpaid'}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-50 border-b border-gray-200">
                    <button 
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'breakdown' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        onClick={() => setActiveTab('breakdown')}
                    >
                        Fee Breakdown
                    </button>
                    <button 
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'history' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Payment History
                    </button>
                    <button 
                        className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-30 disabled:cursor-not-allowed
                            ${activeTab === 'add' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        onClick={() => setActiveTab('add')}
                        disabled={balance <= 0 && totalAssessment > 0}
                        title={balance <= 0 ? "Account already settled" : ""}
                    >
                        Record Payment
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500 italic">Fetching information...</div>
                    ) : (
                        <>
                            {activeTab === 'breakdown' && (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[0.65rem] tracking-wider">
                                            <tr>
                                                <th className="p-3">Subject</th>
                                                <th className="p-3 text-center">Units</th>
                                                <th className="p-3 text-right">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 italic">
                                            {details.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="p-3">
                                                        <p className="font-medium text-gray-800">{item.subject_code}</p>
                                                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.subject_title}</p>
                                                    </td>
                                                    <td className="p-3 text-center text-gray-600">{item.units}</td>
                                                    <td className="p-3 text-right font-mono text-gray-700">₱{Number(item.price).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[0.65rem] tracking-wider">
                                            <tr>
                                                <th className="p-3">Date</th>
                                                <th className="p-3">Method / Ref</th>
                                                <th className="p-3 text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 italic">
                                            {history.length > 0 ? history.map((pay, index) => (
                                                <tr key={index}>
                                                    <td className="p-3 text-gray-600">{new Date(pay.payment_date).toLocaleDateString()}</td>
                                                    <td className="p-3">
                                                        <p className="font-medium text-gray-800">{pay.payment_method}</p>
                                                        <p className="text-[0.65rem] text-gray-400 font-mono tracking-tighter">{pay.reference_no || 'N/A'}</p>
                                                    </td>
                                                    <td className="p-3 text-right font-bold text-green-600 font-mono">₱{Number(pay.amount).toLocaleString()}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="3" className="p-8 text-center text-gray-400">No payment records found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'add' && (
                                <div className="flex flex-col gap-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[0.65rem] uppercase font-bold text-gray-500 tracking-wider">Amount to Pay</label>
                                            <input 
                                                type="number" 
                                                className={`w-full p-2.5 border rounded-lg bg-white text-base font-bold text-blue-600 focus:ring-2 outline-none transition-all
                                                    ${isOverpaying ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                                                placeholder="0.00"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                            />
                                            {isOverpaying && <p className="text-[0.65rem] text-red-500 font-bold">Amount exceeds balance (₱{balance.toLocaleString()})</p>}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[0.65rem] uppercase font-bold text-gray-500 tracking-wider">Payment Method</label>
                                            <select 
                                                className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={method}
                                                onChange={(e) => setMethod(e.target.value)}
                                            >
                                                <option value="Cash">Cash</option>
                                                <option value="GCash">GCash</option>
                                                <option value="Maya">Maya</option>
                                                <option value="Bank Transfer">Bank Transfer</option>
                                                <option value="Check">Check</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[0.65rem] uppercase font-bold text-gray-500 tracking-wider">
                                            Reference / Check Number {isRefRequired && <span className="text-red-500">*</span>}
                                        </label>
                                        <input 
                                            type="text" 
                                            className={`w-full p-2.5 border rounded-lg bg-white text-sm focus:ring-2 outline-none uppercase font-mono transition-all
                                                ${isRefMissing ? 'border-red-500 focus:ring-red-500 shadow-sm shadow-red-50' : 'border-gray-300 focus:ring-blue-500'}`}
                                            placeholder={isRefRequired ? "Required for " + method : "Optional"}
                                            value={refNo}
                                            onChange={(e) => setRefNo(e.target.value)}
                                        />
                                        {isRefMissing && <p className="text-[0.65rem] text-red-500 font-bold">Please provide a reference number for {method}</p>}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[0.65rem] uppercase font-bold text-gray-500 tracking-wider">Remarks</label>
                                        <textarea 
                                            className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                                            placeholder="Notes about this transaction..."
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        className="mt-2 w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none disabled:bg-gray-400"
                                        onClick={handleAddPayment}
                                        disabled={isSubmitDisabled}
                                    >
                                        Submit Payment
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-3">
                    <button 
                        className="px-8 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors text-sm uppercase tracking-wide"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PaymentModal
