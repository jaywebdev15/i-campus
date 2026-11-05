import React, { useCallback, useContext, useEffect, useState } from 'react'
import { API_BASE } from '../../config/api';
import { logStudentAttendance } from '../../scripts/attendance';
import { completeDate, completeDateTime, completeTime } from '../../scripts/utility';
import { FlashMessageContext } from '../../context/FlashMessageContext';
import { BiX, BiQrScan, BiLoaderAlt } from 'react-icons/bi';
import BarcodeScannerModal from './BarcodeScannerModal';

import { AuthContext } from '../../context/AuthContext';

const AttendanceModal = ({ modal, setModal, attendanceData, setAttendanceData, fetchAttendance }) => {
  const { userCredential } = useContext(AuthContext);
  const { showFlashMessage } = useContext(FlashMessageContext) ?? null;
  const [studentDetail, setStudentDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [getSubjects, setGetSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjectCategory, setSubjectCategory] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const fetchStudentDetail = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/database/enrollments.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getEnrolleeByNumber", 
          student_number: attendanceData.student_number
        })
      });
      const data = await response.json();
      setStudentDetail(data);
    } catch (error) {
      console.log("Error in getting student details", error);
    } finally {
      setLoading(false);
    }
  }, [attendanceData.student_number]);

  useEffect(() => {
    if(attendanceData.student_number.trim() !== "") {
      fetchStudentDetail();
    }
  }, [fetchStudentDetail, attendanceData.student_number]);


  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/database/subjects.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ action: "getCategory" })
      });
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.log("Error in fetching categories", error);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchSubject = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/subjects.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getSubjectByCategory", 
          subjectCategory: subjectCategory
        })
      });
      const data = await response.json();
      setGetSubjects(data);
    } catch (error) {
      console.log("Error in getting subject", error);
    }
  }, [subjectCategory]);

  useEffect(() => {
    if(subjectCategory.trim() !== "") {
      fetchSubject();
    }
  }, [fetchSubject, subjectCategory]);

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300 ${modal ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
           onClick={() => setModal(false)}
      />

      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                    w-[95%] md:w-[600px] 
                    bg-white rounded-2xl shadow-2xl z-40 overflow-hidden flex flex-col
                    transition-all duration-300 ease-out
                    ${modal ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className='text-2xl font-bold text-gray-800 tracking-tight'>Attendance Form</h2>
            <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <BiX className="text-3xl" />
            </button>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col gap-5">
           
           <div className="flex flex-col gap-1">
             <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
              <select value={subjectCategory || ""}
                    onChange={(e) => setSubjectCategory(e.target.value)} 
                    className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none bg-white cursor-pointer'>
              <option value="" disabled>Select Category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
           </div>

           <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subject</label>
              <select value={attendanceData.subject_code || ""}
                    onChange={(e) => setAttendanceData({...attendanceData, subject_code: e.target.value})} 
                    className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none bg-white cursor-pointer'>
              <option value="" disabled>Select Subject</option>
              {getSubjects.length > 0 ? (
                getSubjects.map((getSubject, index) => (
                  <option key={index} value={getSubject.subject_code}>{getSubject.subject_title}</option>
                ))
              ) : (
                 <option disabled>No Subject found</option>
              )}
            </select>
           </div>
           
           <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Student ID</label>
              <div className='flex gap-2'>
                <input type="text" 
                      placeholder='Scan or enter Student Number...' 
                      value={attendanceData.student_number}
                      onChange={(e) => setAttendanceData({...attendanceData, student_number: e.target.value})} 
                      className='flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 outline-none' />
                <button 
                  onClick={() => setShowScanner(true)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-300 transition-colors"
                  title="Open Scanner">
                  <BiQrScan className="text-xl" />
                </button>
              </div>
           </div>
           
           {/* Student Info Preview */}
           {loading ? (
             <div className="mt-2 p-4 flex items-center justify-center gap-2 text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
               <BiLoaderAlt className="animate-spin text-xl" />
               <span className="text-sm font-medium">Verifying student...</span>
             </div>
           ) : studentDetail && (
              <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-bold text-blue-800 mb-2">Student Verified</h4>
                  <div className="text-sm text-blue-700 grid grid-cols-2 gap-2">
                     <p><span className="font-semibold">Name:</span> {studentDetail.last_name}, {studentDetail.first_name}</p>
                     <p><span className="font-semibold">Course:</span> {studentDetail.course_code}</p>
                     <p><span className="font-semibold">Section:</span> {studentDetail.section}</p>
                  </div>
              </div>
           )}

        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-gray-200"
                    onClick={() => {
                       setAttendanceData({
                        student_number:     "", 
                        subject_code:       "", 
                        teacher_id:         userCredential?.login_code || "", 
                        attendance_date:    completeDate(), 
                        time_in:            completeTime(), 
                        time_out:           completeTime(),  
                        attendance_status:  "Present", 
                        recorded_by:        userCredential?.login_code || "", 
                        created_at:         completeDateTime() 
                      });
                      setModal(false);
                    }}>
               Close
            </button>
            <button className={`px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all focus:ring-2 focus:ring-blue-500/50 
                                ${(studentDetail && attendanceData.subject_code && attendanceData.student_number) ? 'opacity-100 pointer-events-auto' : 'opacity-50 pointer-events-none'}`}
                    onClick={async () => {
                      const result = await logStudentAttendance({...attendanceData, 
                        attendance_date: completeDate(), 
                        time_in:         completeTime(), 
                        time_out:        completeTime(), 
                        created_at:      completeDateTime() 
                      });
                      showFlashMessage(result.status, result.message);
                      if(result.status !== "success") return;
                      setAttendanceData({
                        student_number:     "", 
                        subject_code:       attendanceData.subject_code,
                        teacher_id:         attendanceData.teacher_id, 
                        attendance_date:    completeDate(), 
                        time_in:            completeTime(), 
                        time_out:           completeTime(),  
                        attendance_status:  "Present", 
                        recorded_by:        attendanceData.recorded_by, 
                        created_at:         completeDateTime() 
                      });
                      fetchAttendance();
                      setStudentDetail(null)
                    }}>
               Submit Attendance
            </button>
        </div>

      </div>

      {showScanner && (
        <BarcodeScannerModal 
          onDetected={(code) => {
            setAttendanceData(prev => ({...prev, student_number: code}));
            setShowScanner(false);
          }} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </>
  )
}

export default AttendanceModal