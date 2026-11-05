import { useCallback, useEffect, useRef, useState } from 'react'
import { API_BASE, IMAGE_BASE } from '../../config/api';
import { BiPrinter } from "react-icons/bi";
import { usePrint } from '../../context/PrinterContext';
import { QRCodeCanvas } from 'qrcode.react'


const EnrolleeCardID = ({ enrolleeCardModal, setEnrolleeCardModal, enrolleeId, setEnrolleeId }) => {
  const [enrolleeCurriculums, setEnrolleeCurriculums] = useState([]);
  const refToPrint = useRef();
  const { handlePrint } = usePrint();


  const fetchEnrolleeCurriculum = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/enrollments.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getEnrolleeCurriculumById", 
          enrollment_id: enrolleeId
        })
      });
      const data = await response.json();
      setEnrolleeCurriculums(data);
    } catch (error) {
      console.log("Error in fetching course curriculum", error);
    } 
  }, [enrolleeId]);

  useEffect(() => {
    if(enrolleeId) {
      fetchEnrolleeCurriculum();
    }
  }, [enrolleeId, fetchEnrolleeCurriculum]);

  // ID Card Dimensions for Print Consistency (approx CR80 ratio)
  // Using generic Tailwind classes, but ensuring layout fits standard ID feel

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300
                    ${enrolleeCardModal ? 'opacity-100 pointer-events-auto backdrop-blur-sm bg-black/40' : 'opacity-0 pointer-events-none'}`}>
      
      <div className={`bg-gray-100 shadow-2xl rounded-2xl overflow-hidden transform transition-all duration-500 flex flex-col max-h-[95vh] overflow-y-auto [&::-webkit-scrollbar]:hidden p-4 gap-4
                      md:w-auto
                      ${enrolleeCardModal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>
        
        {/* Printable Area */}
        <div ref={refToPrint} className='flex flex-col md:flex-row gap-6 justify-center items-center bg-gray-100 p-2'>
          
          {/* =====> Front ID <===== */}
          <div className="relative w-[340px] h-[540px] bg-white rounded-xl shadow-lg flex flex-col overflow-hidden border border-gray-200">
            {/* Header / Banner */}
            <div className="h-28 bg-gradient-to-r from-blue-900 to-indigo-800 flex flex-col items-center justify-center relative">
               {/* Background Pattern/Logo Watermark could go here */}
               <div className={`absolute inset-0 opacity-10 bg-center bg-no-repeat bg-contain`} style={{ backgroundImage: `url('${IMAGE_BASE}/logo/i-campus.png')` }}></div>
               
               <div className="z-10 text-center text-white px-4 pt-2">
                 <h1 className="font-serif font-bold text-xl uppercase tracking-wider">i-Campus University</h1>
                 <p className="text-[10px] font-light tracking-widest uppercase mt-1 opacity-90">Knowledge is the Key to the Future</p>
               </div>
            </div>

            {/* Avatar & Info */}
            <div className="flex-1 flex flex-col items-center relative -mt-10 px-6">
                <div className="rounded-full p-1 bg-white shadow-md z-20">
                    <img src={enrolleeCurriculums[0]?.student_image 
                                ? `${API_BASE}/images/students/${enrolleeCurriculums[0].student_image}` 
                                : `${API_BASE}/images/user.jpg`} 
                         alt="Student" 
                         className='h-32 w-32 rounded-full object-cover border-4 border-indigo-50' />
                </div>
                
                <div className="text-center mt-3 mb-5 w-full">
                    <h2 className="text-xl font-bold text-gray-800 uppercase leading-tight">
                        {enrolleeCurriculums[0]?.first_name} {enrolleeCurriculums[0]?.last_name}
                    </h2>
                    <p className="text-indigo-600 font-semibold text-xs uppercase mt-1 tracking-wide">
                        {enrolleeCurriculums[0]?.course_title || "Student"}
                    </p>
                </div>

                {/* Details Grid */}
                <div className="w-full text-sm space-y-2 mt-1">
                    <div className="flex border-b border-gray-100 pb-1">
                        <span className="w-24 text-gray-400 text-xs font-semibold uppercase tracking-wider">Student ID</span>
                        <span className="flex-1 font-medium text-gray-700 text-right">{enrolleeCurriculums[0]?.student_number}</span>
                    </div>
                    <div className="flex border-b border-gray-100 pb-1">
                        <span className="w-24 text-gray-400 text-xs font-semibold uppercase tracking-wider">Reg No.</span>
                        <span className="flex-1 font-medium text-gray-700 text-right">540546054074</span>
                    </div>
                    <div className="flex border-b border-gray-100 pb-1">
                         <span className="w-24 text-gray-400 text-xs font-semibold uppercase tracking-wider">Guardian</span>
                         <span className="flex-1 font-medium text-gray-700 text-right truncate pl-2">{enrolleeCurriculums[0]?.guardian_name}</span>
                    </div>
                    <div className="flex border-b border-gray-100 pb-1">
                         <span className="w-24 text-gray-400 text-xs font-semibold uppercase tracking-wider">Contact</span>
                         <span className="flex-1 font-medium text-gray-700 text-right">{enrolleeCurriculums[0]?.guardian_number}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-800 py-3 text-center z-10 mt-auto">
                 <p className="text-white text-[10px] tracking-wide font-light">Malipampang, San Ildefonso, Bulacan</p>
            </div>
          </div>

          {/* =====> Back ID <===== */}
          <div className="relative w-[340px] h-[540px] bg-white rounded-xl shadow-lg flex flex-col overflow-hidden border border-gray-200">
             
             {/* Header */}
             <div className="bg-gray-800 py-3 text-center">
                <h3 className="text-white font-bold tracking-widest uppercase text-sm">Terms & Conditions</h3>
             </div>

             {/* Content */}
             <div className="flex-1 p-5 flex flex-col">
                <ul className="text-[10px] text-gray-600 text-justify leading-tight list-disc pl-4 space-y-1">
                    <li>This ID is school property and for official use only. It must be worn on campus at all times.</li>
                    <li>It is non-transferable and must not be altered, damaged, or misused.</li>
                    <li>Loss, misuse, or violation of school rules may result in replacement fees, confiscation, or disciplinary action.</li>
                    <li>The ID must be returned upon withdrawal, graduation, or termination.</li>
                </ul>

                <div className="my-3 border-t border-b border-gray-100 py-3 space-y-1">
                     <div className="flex justify-between text-xs">
                         <span className="text-gray-400 uppercase font-semibold">Contact</span>
                         <span className="text-gray-700">{enrolleeCurriculums[0]?.contact_number}</span>
                     </div>
                     <div className="flex justify-between text-xs">
                         <span className="text-gray-400 uppercase font-semibold">Email</span>
                         <span className="text-gray-700">{enrolleeCurriculums[0]?.email_address}</span>
                     </div>
                     <div className="flex justify-between text-xs">
                         <span className="text-gray-400 uppercase font-semibold">Website</span>
                         <span className="text-blue-600">www.i-campus.com.ph</span>
                     </div>
                </div>

                <div className="flex flex-col items-center justify-center flex-1 space-y-2">
                     <div className="p-1.5 bg-white border border-gray-100 rounded-lg shadow-sm">
                        <QRCodeCanvas 
                            value={enrolleeCurriculums[0]?.student_number || "0000"} 
                            size={80} 
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                        />
                     </div>
                     <p className="text-[9px] text-gray-400 uppercase tracking-widest">Scan for Verification</p>
                </div>

                <div className="mt-auto pt-2">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                             <span className="text-[9px] text-gray-400 uppercase">Valid Until</span>
                             <span className="text-sm font-bold text-gray-800">03/15/2025</span>
                        </div>
                        <div className="flex flex-col items-center w-32">
                             <div className="border-b border-gray-800 w-full mb-1"></div>
                             <span className="text-[10px] font-bold uppercase tracking-wider">Principal</span>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
             <button onClick={() => {
                        setEnrolleeId("");
                        setEnrolleeCardModal(false);
                      }}
                      className="px-6 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors font-medium text-sm">
                Close
             </button>
             <button onClick={() => handlePrint(refToPrint)}
                     className="px-6 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors font-medium text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <BiPrinter /> Print ID Card
             </button>
        </div>

      </div>
    </div>
  )
}

export default EnrolleeCardID