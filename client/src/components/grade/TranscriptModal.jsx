import React, { useEffect, useState, useRef } from 'react';
import { BiX, BiPrinter, BiLoaderAlt } from 'react-icons/bi';
import { API_BASE } from '../../config/api';

const TranscriptModal = ({ isOpen, onClose, studentNumber, studentName }) => {
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [studentInfo, setStudentInfo] = useState(null);
    const printRef = useRef();

    useEffect(() => {
        if (isOpen && studentNumber) {
            fetchStudentGrades();
        }
    }, [isOpen, studentNumber]);

    const fetchStudentGrades = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/database/grades.php`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: "getStudentTranscript",
                    studentNumber: studentNumber
                })
            });
            const data = await response.json();
            if (data.grades) {
                setGrades(data.grades);
                setStudentInfo(data.student);
            }
        } catch (error) {
            console.error("Error fetching transcript:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        const printWindow = window.open('', '', 'width=800,height=600');
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Transcript of Records - ${studentName}</title>
                    <style>
                        body { 
                            font-family: 'Times New Roman', Times, serif; 
                            padding: 40px; 
                            color: #000;
                        }
                        .header { text-align: center; margin-bottom: 30px; }
                        .header h1 { font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
                        .header h2 { font-size: 18px; margin: 5px 0; font-weight: normal; }
                        .header p { font-size: 12px; margin: 2px 0; color: #555; }
                        .title { text-align: center; font-size: 20px; font-weight: bold; margin: 30px 0 20px; text-decoration: underline; }
                        .student-info { margin-bottom: 20px; }
                        .student-info p { margin: 5px 0; font-size: 14px; }
                        .student-info strong { display: inline-block; width: 150px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #000; padding: 8px 12px; text-align: left; font-size: 12px; }
                        th { background-color: #f0f0f0; font-weight: bold; }
                        .text-center { text-align: center; }
                        .footer { margin-top: 50px; }
                        .signature-line { 
                            display: inline-block; 
                            width: 200px; 
                            border-bottom: 1px solid #000; 
                            margin-top: 40px;
                        }
                        .signature-label { font-size: 12px; margin-top: 5px; }
                        @media print {
                            body { padding: 20px; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    // Group grades by subject
    const groupedGrades = grades.reduce((acc, grade) => {
        const key = `${grade.subject_code} - ${grade.subject_title}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(grade);
        return acc;
    }, {});

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                    <h2 className="text-lg font-bold">Transcript of Records</h2>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded transition-colors"
                        >
                            <BiPrinter className="text-lg" />
                            Print
                        </button>
                        <button 
                            onClick={onClose}
                            className="hover:bg-white/20 p-2 rounded transition-colors"
                        >
                            <BiX className="text-2xl" />
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <BiLoaderAlt className="text-4xl animate-spin mb-2" />
                            <p>Loading transcript...</p>
                        </div>
                    ) : (
                        <div ref={printRef}>
                            {/* School Header */}
                            <div className="header text-center mb-8">
                                <h1 className="text-2xl font-bold tracking-wider uppercase">iCampus Academy</h1>
                                <h2 className="text-lg font-normal text-gray-600">Student Management System</h2>
                                <p className="text-sm text-gray-500 mt-1">123 Education Lane, Learning City</p>
                                <p className="text-sm text-gray-500">Tel: (123) 456-7890 | Email: info@icampus.edu</p>
                            </div>

                            {/* Title */}
                            <div className="title text-center text-xl font-bold underline mb-6">
                                TRANSCRIPT OF RECORDS
                            </div>

                            {/* Student Info */}
                            <div className="student-info bg-gray-50 p-4 rounded-lg mb-6 border">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <p><strong className="inline-block w-36">Student Name:</strong> {studentInfo?.full_name || studentName}</p>
                                    <p><strong className="inline-block w-36">Student Number:</strong> {studentNumber}</p>
                                    <p><strong className="inline-block w-36">Section:</strong> {studentInfo?.section_code || 'N/A'}</p>
                                    <p><strong className="inline-block w-36">Date Issued:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>

                            {/* Grades Table */}
                            {Object.keys(groupedGrades).length > 0 ? (
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border border-gray-300 px-3 py-2 text-left">Subject Code</th>
                                            <th className="border border-gray-300 px-3 py-2 text-left">Subject Title</th>
                                            <th className="border border-gray-300 px-3 py-2 text-center w-28">1st Grading</th>
                                            <th className="border border-gray-300 px-3 py-2 text-center w-28">2nd Grading</th>
                                            <th className="border border-gray-300 px-3 py-2 text-center w-24">Average</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(groupedGrades).map(([subject, subjectGrades]) => {
                                            // Extract subject code and title
                                            const [subjectCode, ...titleParts] = subject.split(' - ');
                                            const subjectTitle = titleParts.join(' - ');
                                            
                                            // Find 1st and 2nd grading grades
                                            const firstGrading = subjectGrades.find(g => 
                                                g.grading_term?.toLowerCase().includes('1st') || 
                                                g.grading_term?.toLowerCase().includes('first')
                                            );
                                            const secondGrading = subjectGrades.find(g => 
                                                g.grading_term?.toLowerCase().includes('2nd') || 
                                                g.grading_term?.toLowerCase().includes('second')
                                            );
                                            
                                            // Calculate average
                                            const firstGrade = parseFloat(firstGrading?.grade) || 0;
                                            const secondGrade = parseFloat(secondGrading?.grade) || 0;
                                            const hasGrades = firstGrade > 0 || secondGrade > 0;
                                            const gradeCount = (firstGrade > 0 ? 1 : 0) + (secondGrade > 0 ? 1 : 0);
                                            const average = hasGrades ? ((firstGrade + secondGrade) / gradeCount).toFixed(2) : '-';
                                            
                                            return (
                                                <tr key={subject} className="hover:bg-gray-50">
                                                    <td className="border border-gray-300 px-3 py-2 font-semibold text-blue-600">{subjectCode}</td>
                                                    <td className="border border-gray-300 px-3 py-2">{subjectTitle}</td>
                                                    <td className="border border-gray-300 px-3 py-2 text-center font-bold">
                                                        {firstGrading?.grade || '-'}
                                                    </td>
                                                    <td className="border border-gray-300 px-3 py-2 text-center font-bold">
                                                        {secondGrading?.grade || '-'}
                                                    </td>
                                                    <td className="border border-gray-300 px-3 py-2 text-center font-bold bg-gray-50">
                                                        {average}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center text-gray-500 py-10 italic">
                                    No grade records found for this student.
                                </div>
                            )}

                            {/* Footer / Signature */}
                            <div className="footer mt-12 flex justify-between">
                                <div className="text-center">
                                    <div className="signature-line border-b border-black w-48 mb-1 pt-8"></div>
                                    <p className="signature-label text-xs text-gray-600">Registrar's Signature</p>
                                </div>
                                <div className="text-center">
                                    <div className="signature-line border-b border-black w-48 mb-1 pt-8"></div>
                                    <p className="signature-label text-xs text-gray-600">Date</p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 text-center mt-8 italic">
                                This document is computer-generated and is valid without signature when verified electronically.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TranscriptModal;
