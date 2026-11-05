import React, { useEffect, useState, useContext } from 'react';
import { API_BASE } from '../../config/api';
import { AuthContext } from '../../context/AuthContext';
import { BiUser } from 'react-icons/bi';
import { getTransmutedGrade } from '../../utils/transmutation';

const StudentGrades = ({ searchTerm }) => {
  const { userCredential } = useContext(AuthContext);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudentGrades = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/database/grades.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getStudentGrades",
          userCode: userCredential.login_code
        })
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setSubjects(data);
      }
    } catch (error) {
      console.error("Error fetching student grades:", error);
    } finally {
      setLoading(false);
    }
  }, [userCredential]);

  useEffect(() => {
    if (userCredential?.login_code) {
      fetchStudentGrades();
    }
  }, [fetchStudentGrades, userCredential]);

  // Filter States
  const [filterCourse, setFilterCourse] = useState("");
  const [filterTerm, setFilterTerm] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterSchoolYear, setFilterSchoolYear] = useState("");
  
  // Extract unique options
  const uniqueCourses = [...new Set(subjects.map(s => s.course_code).filter(Boolean))].sort();
  const uniqueSemesters = [...new Set(subjects.map(s => s.semester).filter(Boolean))].sort();
  const uniqueSchoolYears = [...new Set(subjects.map(s => s.school_year).filter(Boolean))].sort();
  const uniqueTerms = [...new Set(subjects.flatMap(s => s.grades?.map(g => g.grading_term)).filter(Boolean))].sort();

  const filteredSubjects = subjects.filter(sub => {
    // 1. Search Term (Subject Code or Title)
    const matchesSearch = 
        sub.subject_title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        sub.subject_code.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Course Filter
    const matchesCourse = filterCourse ? sub.course_code === filterCourse : true;

    // 3. Semester Filter
    const matchesSemester = filterSemester ? sub.semester === filterSemester : true;

    // 4. School Year Filter
    const matchesSchoolYear = filterSchoolYear ? sub.school_year === filterSchoolYear : true;

    // 5. Grading Term Filter
    // If a specific term is selected, we only check if the subject has grades for that term.
    // The display logic inside the card will also need to filter, but here we just check existence.
    const matchesTerm = filterTerm 
        ? sub.grades?.some(g => g.grading_term === filterTerm) 
        : true;

    return matchesSearch && matchesCourse && matchesSemester && matchesSchoolYear && matchesTerm;
  });

  return (
    <div className="flex flex-col gap-6 h-full overflow-hidden">
      <div className="flex flex-col gap-4 shrink-0">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-gray-800">My Grades</h1>
            <p className="text-gray-500">View and filter your detailed academic performance.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100 shadow-sm">
            <FilterSelect label="Course" value={filterCourse} onChange={setFilterCourse} options={uniqueCourses} />
            <FilterSelect label="Semester" value={filterSemester} onChange={setFilterSemester} options={uniqueSemesters} />
            <FilterSelect label="School Year" value={filterSchoolYear} onChange={setFilterSchoolYear} options={uniqueSchoolYears} />
            <FilterSelect label="Grading Term" value={filterTerm} onChange={setFilterTerm} options={uniqueTerms} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">
        {loading ? (
          <div className="flex items-center justify-center p-20 text-gray-400">Loading Grades...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 pb-6">
            {filteredSubjects.map((subject) => (
              <div key={subject.enrollment_id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:border-blue-300 transition-colors">
                {/* Card Header */}
                <div className="p-5 border-b border-gray-200 bg-white">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded border border-blue-100">{subject.subject_code}</span>
                     <div className="flex flex-col items-end">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{subject.semester} • {subject.school_year}</span>
                       <span className="text-[10px] text-gray-300 font-mono mt-0.5">{subject.course_code}</span> 
                     </div>
                  </div>
                  <h3 className="font-black text-lg text-gray-800 leading-tight mb-1 tracking-tight">{subject.subject_title}</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1 mt-2">
                     <BiUser className="inline-block mr-1 text-lg" /> {subject.teacher_name}
                  </p>
                </div>

                {/* Grades Summary */}
                <div className="p-5 flex flex-col gap-6">
                   {subject.grades && subject.grades.length > 0 ? (
                      [...new Set(subject.grades.map(g => g.grading_term))]
                        .sort()
                        .filter(term => filterTerm ? term === filterTerm : true) // Filter displayed terms as well
                        .map(term => (
                            <GradeTermTable key={term} term={term} grades={subject.grades} />
                        ))
                   ) : (
                      <div className="text-center py-6 text-gray-400 text-xs italic">
                          No grades recorded for this subject yet.
                      </div>
                   )}
                </div>
              </div>
            ))}
            
            {filteredSubjects.length === 0 && (
               <div className="col-span-full text-center py-20 text-gray-400 italic">
                  No subjects found matching your filters.
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const FilterSelect = ({ label, value, onChange, options }) => (
    <div className="flex flex-col gap-1 min-w-[150px] flex-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
        <select 
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">All</option>
            {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
            ))}
        </select>
    </div>
)

const GradeTermTable = ({ term, grades }) => {
   const termGrades = grades.filter(g => g.grading_term === term);
   
   if (termGrades.length === 0) return null;

   // Group by Criteria Name (Assessment Type)
   // We expect grades to have: score, items, criteria_percentage, criteria_name
   const grouped = termGrades.reduce((acc, curr) => {
       const key = curr.criteria_name || curr.assessment; // Fallback if criteria_name is missing
       if (!acc[key]) {
           acc[key] = {
               name: key,
               totalScore: 0,
               totalItems: 0,
               percentage: parseFloat(curr.criteria_percentage || 0),
               rawScores: [] // Just for tracking
           };
       }
       acc[key].totalScore += parseFloat(curr.score || 0);
       acc[key].totalItems += parseFloat(curr.items || 0);
       acc[key].rawScores.push(`${curr.score}/${curr.items}`);
       return acc;
   }, {});

   let initialGrade = 0;
   const rows = Object.values(grouped).map(group => {
       const ps = group.totalItems > 0 ? (group.totalScore / group.totalItems) * 100 : 0;
       const ws = ps * (group.percentage / 100);
       initialGrade += ws;

       return {
           ...group,
           ps,
           ws
       };
   });

   const transmutedGrade = getTransmutedGrade(initialGrade);

   return (
     <div className="flex flex-col gap-3">
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-l-4 border-blue-500 pl-3">{term}</h4>
        
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                    <tr>
                        <th className="px-4 py-3">Component</th>
                        <th className="px-4 py-3 text-center">Total Score / Max</th>
                        <th className="px-4 py-3 text-center">PS (100%)</th>
                        <th className="px-4 py-3 text-center">Weight</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-700">Weighted Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-medium text-gray-800">{row.name}</td>
                            <td className="px-4 py-3 text-center text-gray-600">{row.totalScore} / {row.totalItems}</td>
                            <td className="px-4 py-3 text-center text-gray-600">{row.ps.toFixed(2)}</td>
                            <td className="px-4 py-3 text-center text-gray-500">{row.percentage}%</td>
                            <td className="px-4 py-3 text-center font-bold text-blue-600">{row.ws.toFixed(2)}</td>
                        </tr>
                    ))}
                    {/* Summary Row */}
                    <tr className="bg-blue-50/30 border-t-2 border-blue-100">
                        <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-700">Initial Grade</td>
                        <td className="px-4 py-3 text-center font-bold text-gray-800 text-lg">{initialGrade.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-blue-100/50">
                        <td colSpan={4} className="px-4 py-3 text-right font-bold text-blue-800 uppercase tracking-wider">Transmuted Grade</td>
                        <td className="px-4 py-3 text-center font-extrabold text-blue-700 text-xl">{transmutedGrade}</td>
                    </tr>
                </tbody>
            </table>
        </div>
     </div>
   );
}

export default StudentGrades;
