import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../../context/AuthContext';
import { API_BASE } from '../../config/api';

const Average = ({ setLoading, selectedTab }) => {
  const { userCredential } = useContext(AuthContext);
  const teacherCode = userCredential?.login_code;
  
  const [teacherInfo, setTeacherInfo] = useState([]);
  const [studentsOfTeacher, setStudentsOfTeacher] = useState([]);
  const [schoolYear, setSchoolYear] = useState("");
  const [curriculumId, setCurriculumId] = useState("");
  const [sectionCode, setSectionCode] = useState("");
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  // Helper: Transmutation Table
  const transmuteGrade = (initialGrade) => {
    if (initialGrade >= 98.4) return 99;
    if (initialGrade >= 96.8) return 98;
    if (initialGrade >= 95.2) return 97;
    if (initialGrade >= 93.6) return 96;
    if (initialGrade >= 92.0) return 95;
    if (initialGrade >= 90.4) return 94;
    if (initialGrade >= 88.8) return 93;
    if (initialGrade >= 87.2) return 92;
    if (initialGrade >= 85.6) return 91;
    if (initialGrade >= 84.0) return 90;
    if (initialGrade >= 82.4) return 89;
    if (initialGrade >= 80.8) return 88;
    if (initialGrade >= 79.2) return 87;
    if (initialGrade >= 77.6) return 86;
    if (initialGrade >= 76.0) return 85;
    if (initialGrade >= 74.4) return 84;
    if (initialGrade >= 72.8) return 83;
    if (initialGrade >= 71.2) return 82;
    if (initialGrade >= 69.6) return 81;
    if (initialGrade >= 68.0) return 80;
    if (initialGrade >= 66.4) return 79;
    if (initialGrade >= 64.8) return 78;
    if (initialGrade >= 63.2) return 77;
    if (initialGrade >= 61.6) return 76;
    if (initialGrade >= 60.0) return 75;
    // Simplified logic for lower grades
    if (initialGrade >= 0)
      return Math.max(60, Math.floor(60 + initialGrade / 4));
    return 60;
  };

  // Helper: Derive Headers for a Period
  const deriveHeaders = (students, term) => {
      const wwHeaders = new Map();
      const ptHeaders = new Map();
      let qaTotalItems = 0;

      students.forEach(student => {
          if(student.grades) {
              student.grades.filter(g => g.grading_term === term).forEach(g => {
                  if(g.criteria_id == 1) { // Written Works
                      if(!wwHeaders.has(g.assessment)) {
                          wwHeaders.set(g.assessment, parseFloat(g.items) || 0);
                      }
                  } else if (g.criteria_id == 2) { // Performance Tasks
                      if(!ptHeaders.has(g.assessment)) {
                          ptHeaders.set(g.assessment, parseFloat(g.items) || 0);
                      }
                  }
              });
          }
      });
      
      // QA Items are fixed/assumed 100 usually, or we can scan for them too if variable
      // For now assuming standard 100 for QA total (Monthly + Periodical) 
      // recursive check? GradingTable usually sets empty items for QA, so we might need a fixed assumption or checks.
      // Let's assume 100 for now as per previous logic.
      qaTotalItems = 100; 

      return {
          wwTotalItems: Array.from(wwHeaders.values()).reduce((a, b) => a + b, 0),
          ptTotalItems: Array.from(ptHeaders.values()).reduce((a, b) => a + b, 0),
          qaTotalItems: qaTotalItems
      };
  };

  // Helper: Calculate Score for a Period
  const calculatePeriodGrade = (student, term, derivedTotals) => {
      if (!student.grades) return "-";
      
      const termGrades = student.grades.filter(g => g.grading_term === term);
      if (termGrades.length === 0) return "-";

      // Written Works (Criteria 1)
      const wwGrades = termGrades.filter(g => g.criteria_id == 1);
      const wwTotalScore = wwGrades.reduce((acc, curr) => acc + (parseFloat(curr.score)||0), 0);
      const wwPS = !derivedTotals.wwTotalItems ? 0 : (wwTotalScore / derivedTotals.wwTotalItems) * 100;
      const wwWS = wwPS * 0.30;

      // Performance Tasks (Criteria 2)
      const ptGrades = termGrades.filter(g => g.criteria_id == 2);
      const ptTotalScore = ptGrades.reduce((acc, curr) => acc + (parseFloat(curr.score)||0), 0);
      const ptPS = !derivedTotals.ptTotalItems ? 0 : (ptTotalScore / derivedTotals.ptTotalItems) * 100;
      const ptWS = ptPS * 0.50;

      // QA
      let qaTotal = 0;
      if (term === "1st Grading") {
          const qaM = termGrades.find(g => g.assessment === "QA1_Monthly")?.score || 0;
          const qaP = termGrades.find(g => g.assessment === "QA1_Periodical")?.score || 0;
          qaTotal = parseFloat(qaM) + parseFloat(qaP);
      } else {
          const qaM = termGrades.find(g => g.assessment === "QA2_Monthly")?.score || 0;
          const qaP = termGrades.find(g => g.assessment === "QA2_Periodical")?.score || 0;
          qaTotal = parseFloat(qaM) + parseFloat(qaP);
      }
      const qaWS = (qaTotal / 100) * 20; 

      const initialGrade = wwWS + ptWS + qaWS;
      return transmuteGrade(initialGrade);
  };
  
  // Mounted Ref
  const mountedRef = useRef(true);

  // ==========> Default Section Selection <========== \\
  useEffect(() => {
    if (teacherInfo.length > 0 && !sectionCode && !initialLoadDone) {
        const first = teacherInfo[0];
        if (first && first.section_code) {
           setSectionCode(first.section_code);
           setCurriculumId(first.curriculum_id);
           setSchoolYear(first.school_year || "");
           setInitialLoadDone(true);
        }
    }
  }, [teacherInfo, sectionCode, initialLoadDone]);

  useEffect(() => {
    mountedRef.current = true; 
    return () => {
      mountedRef.current = false; 
    };
  }, []);

  // ==========> Fetch Teacher Info <========== \\
  const fetchTeacherInfo = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/grades.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          action: "getStudentsOfTeacher", 
          userCode: teacherCode
        })
      });
      setTeacherInfo(await response.json());
    } catch (error) {
      console.log("Error fetching subjects", error);
    }
  }, [teacherCode]);

  useEffect(() => {
    if(teacherCode) fetchTeacherInfo();
  }, [teacherCode, fetchTeacherInfo]);

   // ==========> Fetch Students Handle By Teacher Login <========== \\
   const fetchStudentsOfTeacher = useCallback(async () => {
    setLoading(true);
    let data = [];
    try {
      const response = await fetch(`${API_BASE}/database/grades.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getStudentsOfTeacher", 
          userCode: teacherCode, 
          curriculumId: curriculumId, 
          schoolYear: schoolYear, 
          sectionCode: sectionCode, 
        })
      });
      data = await response.json();

    } catch (error) {
      console.log("Error fetching students of teacher", error);
    }
    if (mountedRef.current) {
      setStudentsOfTeacher(data);
      setLoading(false);
    }
  }, [setLoading, teacherCode, curriculumId, schoolYear, sectionCode]);


  useEffect(() => {
    if(teacherCode) fetchStudentsOfTeacher();
  }, [teacherCode, curriculumId, schoolYear, sectionCode, fetchStudentsOfTeacher]);

  const currentInfo = teacherInfo.find(t => t.curriculum_id === parseInt(curriculumId)) || {};
  const subjectTitle = currentInfo.subject_title || "";
  const teacherName = currentInfo.teacher_name || "";
  const semester = currentInfo.semester || "";
  const academicYear = schoolYear || currentInfo.school_year || "";


  return (
    <div className={`flex flex-col gap-4 font-sans ${selectedTab === "Average" ? '' : 'hidden'}`}>
       
       {/* Filters similar to GradingTable */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
             <label className="text-xs font-bold text-gray-500 uppercase">Subject Code</label>
             <select className="border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     value={curriculumId} onChange={(e) => setCurriculumId(e.target.value)}>
                <option value="">Select Subject</option>
                {Array.from(new Map(teacherInfo.map(item => [`${item.subject_code}-${item.section_code}`, item])).values()).map(sub => (
                    <option key={sub.curriculum_id} value={sub.curriculum_id}>{sub.subject_code} - {sub.section_code}</option>
                ))}
             </select>
          </div>
          <div className="flex flex-col gap-1">
             <label className="text-xs font-bold text-gray-500 uppercase">Section</label>
             <select className="border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     value={sectionCode} onChange={(e) => setSectionCode(e.target.value)}>
                {Array.from(new Map(teacherInfo.map(item => [`${item.section_code}-${item.subject_code}`, item])).values()).map(sec => (
                    <option key={sec.section_code} value={sec.section_code}>{sec.section_code}</option>
                ))}
             </select>
          </div>
           {/* Period not needed for Semester Summary, but School Year is */}
          <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">School Year</label>
              <select className="border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)}>
                <option value="">Select Year</option>
                {Array.from(new Map(teacherInfo.map(item => [item.school_year, item])).values()).map(y => (
                    <option key={y.school_year} value={y.school_year}>{y.school_year}</option>
                ))}
              </select>
          </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col flex-1 relative min-h-[500px]">
        <div className="absolute inset-0 w-full h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <table className='border-collapse whitespace-nowrap text-sm min-w-full'>
            <thead className="sticky top-0 z-40 bg-white shadow-sm ring-1 ring-gray-100">
                {/* Header Information Rows */}
                <tr className="bg-white">
                  <th className='border border-gray-100 p-2 text-xs font-bold bg-blue-50/50 text-blue-900 text-right w-40 uppercase tracking-wider'>SUBJECT CODE:</th>
                  <th className='border border-gray-100 p-2 text-xs text-left w-40 font-bold text-gray-700 bg-white'>{currentInfo.subject_code || ""}</th>
                  <th colSpan="3" className='border border-gray-100 p-2 text-xs text-center bg-green-50/50 font-bold text-green-800 uppercase tracking-widest'>GRADING SHEET</th>
                </tr>
                <tr>
                  <th className='border border-gray-100 p-2 text-xs font-bold bg-blue-50/50 text-blue-900 text-right uppercase tracking-wider'>SUBJECT TITLE:</th>
                  <th className='border border-gray-100 p-2 text-xs text-left bg-white font-bold text-gray-700'>{subjectTitle}</th>
                   <th colSpan="3" rowSpan={4} className='border border-gray-100 bg-green-50/10'></th>
                </tr>
                <tr>
                  <th className='border border-gray-100 p-2 text-xs font-bold bg-blue-50/50 text-blue-900 text-right uppercase tracking-wider'>TEACHER:</th>
                  <th className='border border-gray-100 p-2 text-xs text-left bg-white font-bold text-gray-700'>{teacherName}</th>
                </tr>
                <tr>
                  <th className='border border-gray-100 p-2 text-xs font-bold bg-blue-50/50 text-blue-900 text-right uppercase tracking-wider'>SEMESTER:</th>
                  <th className='border border-gray-100 p-2 text-xs text-left bg-white font-bold text-gray-700'>{semester}</th>
                </tr>
                <tr>
                  <th className='border border-gray-100 p-2 text-xs font-bold bg-blue-50/50 text-blue-900 text-right uppercase tracking-wider'>ACADEMIC YEAR:</th>
                  <th className='border border-gray-100 p-2 text-xs text-left bg-white font-bold text-gray-700'>{academicYear}</th>
                </tr>

              {/* =====> Main Headers <===== \\ */}
                <tr>
                  <th colSpan={2} className='border border-gray-100 py-3 px-4 text-center font-bold bg-blue-50/50 text-blue-900 text-xs uppercase tracking-widest'>NAME</th>
                  <th className='border border-gray-100 py-3 px-4 bg-blue-50/30 font-bold text-blue-900 text-center w-40 text-xs uppercase tracking-widest'>1st GRADING</th>
                  <th className='border border-gray-100 py-3 px-4 bg-blue-50/30 font-bold text-blue-900 text-center w-40 text-xs uppercase tracking-widest'>2nd GRADING</th>
                  <th className='border border-gray-100 py-3 px-4 text-center font-bold bg-orange-50/50 text-orange-900 w-40 text-xs uppercase tracking-widest'>SEMESTER GRADE <br/><span className="text-[10px] font-normal opacity-75">100%</span></th>
                </tr>
            </thead>

            <tbody>
              {/* =====> Data <===== \\ */}
              {studentsOfTeacher.length > 0 ? studentsOfTeacher.map(student => {
                // Derive totals for the entire class context (or specific to student if we want per-student dynamic, 
                // but "Average" usually implies standard denominator. 
                // Actually, `deriveHeaders` scans ALL students. We should run it ONCE per render/effect, 
                // but inside map is inefficient. However, for now let's memoize or just compute outside.
                // Better: Compute outside map.
                return (
                <tr key={student.enrollment_id} className="hover:bg-blue-50 transition-colors">
                  <td colSpan={2} className='border border-gray-300 py-2 px-4 text-gray-800 font-medium'>{student.name}</td>
                  <td className='border border-gray-300 p-0'>
                      <input type="text" className="w-full h-full py-2 text-center bg-transparent outline-none focus:bg-blue-50" 
                             value={calculatePeriodGrade(student, "1st Grading", deriveHeaders(studentsOfTeacher, "1st Grading"))} readOnly />
                  </td>
                  <td className='border border-gray-300 p-0'>
                      <input type="text" className="w-full h-full py-2 text-center bg-transparent outline-none focus:bg-blue-50" 
                             value={calculatePeriodGrade(student, "2nd Grading", deriveHeaders(studentsOfTeacher, "2nd Grading"))} readOnly />
                  </td>
                  <td className='border border-gray-300 p-0 bg-blue-50/50'>
                      <input type="text" className="w-full h-full py-2 text-center bg-transparent outline-none font-bold text-gray-800" 
                             value={(() => {
                                 const g1 = calculatePeriodGrade(student, "1st Grading", deriveHeaders(studentsOfTeacher, "1st Grading"));
                                 const g2 = calculatePeriodGrade(student, "2nd Grading", deriveHeaders(studentsOfTeacher, "2nd Grading"));
                                 if(g1 === "-" || g2 === "-") return "-";
                                 return Math.round((g1 + g2) / 2);
                             })()} readOnly />
                  </td>
                </tr>
              );
            }) : (
                 <tr><td colSpan={5} className="p-10 text-center text-gray-500">No students found for this subject/section.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Average