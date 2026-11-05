import React, { useCallback, useContext, useEffect, useState } from 'react'
import { API_BASE } from '../../config/api';
import { BiBookBookmark, BiSearch, BiXCircle, BiLoaderAlt, BiBookOpen } from "react-icons/bi";
import { AuthContext } from '../../context/AuthContext';

const StudentCurriculum = () => {
  const { userCredential } = useContext(AuthContext);
  const [curriculums, setCurriculums] = useState([]);
  const [filteredCurriculums, setFilteredCurriculums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filters
  const [yearFilter, setYearFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [unitsFilter, setUnitsFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    if(curriculums.length > 0) {
       const lowerTerm = searchTerm.toLowerCase();
       const filtered = curriculums.filter(item => {
          const matchesSearch = item.subject_code.toLowerCase().includes(lowerTerm) || 
                               item.subject_title.toLowerCase().includes(lowerTerm);
          const matchesYear = yearFilter ? item.year_level === yearFilter : true;
          const matchesSem = semFilter ? item.semester === semFilter : true;
          const matchesUnits = unitsFilter ? String(item.units) === unitsFilter : true;
          const matchesCategory = categoryFilter ? item.category === categoryFilter : true;

          return matchesSearch && matchesYear && matchesSem && matchesUnits && matchesCategory;
       });
       setFilteredCurriculums(filtered);
    } else {
       setFilteredCurriculums([]);
    }
  }, [searchTerm, curriculums, yearFilter, semFilter, unitsFilter, categoryFilter]);
  
  const fetchCurriculumsOfStudent = useCallback(async() => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/database/curriculums.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getCurriculumOfStudent", 
          userCode: userCredential?.login_code, 
        })
      });
      const data = await response.json();
      setCurriculums(data);
    } catch (error) {
      console.log("Error in fetching curriculums of student", error);
    } finally {
      setLoading(false);
    }
  }, [userCredential, setLoading]);

  useEffect(() => {
    fetchCurriculumsOfStudent();
  }, [fetchCurriculumsOfStudent]);

  // Derived options for select
  const yearLevels = [...new Set(curriculums.map(c => c.year_level))].sort();
  const semesters = [...new Set(curriculums.map(c => c.semester))].sort();
  const unitOptions = [...new Set(curriculums.map(c => c.units))].sort((a,b) => a-b);
  const categories = [...new Set(curriculums.map(c => c.category))].sort();

  return (
    <div className='flex flex-col gap-6 p-6 bg-white rounded-xl shadow-lg border border-gray-100 min-h-[500px] animate-fade-in'>
      
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 pb-4 border-b border-gray-100">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <BiBookBookmark className='text-blue-600' /> My Curriculum
                </h2>
                <p className="text-sm text-gray-500 mt-1">View your academic program structure and course requirements.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-end bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider ml-1">Search Course</label>
                <div className="relative">
                    <BiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search code or title..."
                            className='pl-9 py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm w-full sm:w-64' />
                </div>
                </div>
            </div>
         </div>

         {/* Filter Row */}
         <div className="flex flex-wrap gap-3 items-end pt-2">
            <div className="flex flex-col gap-1 min-w-[140px] flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Year Level</label>
                <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}
                        className='py-2 px-3 border border-gray-200 bg-white rounded-lg text-sm cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all'>
                    <option value="">All Levels</option>
                    {yearLevels.map(yl => <option key={yl} value={yl}>{yl}</option>)}
                </select>
            </div>
            <div className="flex flex-col gap-1 min-w-[140px] flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Semester</label>
                <select value={semFilter} onChange={(e) => setSemFilter(e.target.value)}
                        className='py-2 px-3 border border-gray-200 bg-white rounded-lg text-sm cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all'>
                    <option value="">All Semesters</option>
                    {semesters.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                </select>
            </div>
            <div className="flex flex-col gap-1 min-w-[100px] flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Units</label>
                <select value={unitsFilter} onChange={(e) => setUnitsFilter(e.target.value)}
                        className='py-2 px-3 border border-gray-200 bg-white rounded-lg text-sm cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all'>
                    <option value="">All Units</option>
                    {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
            </div>
             <div className="flex flex-col gap-1 min-w-[140px] flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Category</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                        className='py-2 px-3 border border-gray-200 bg-white rounded-lg text-sm cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all'>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            {(yearFilter || semFilter || unitsFilter || categoryFilter) && (
                <button onClick={() => {
                        setYearFilter("");
                        setSemFilter("");
                        setUnitsFilter("");
                        setCategoryFilter("");
                    }} 
                    className="mb-[2px] px-3 py-2 text-red-500 text-sm hover:bg-red-50 rounded-lg transition-colors" title="Clear Filters">
                    <BiXCircle className='text-lg' />
                </button>
            )}
         </div>
         
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col relative h-[calc(100vh-320px)] min-h-[400px]">
        <div className="absolute inset-0 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <table className='w-full whitespace-nowrap text-left border-collapse'>
            <thead className='sticky top-0 bg-gray-900 text-white z-10 shadow-md'>
              <tr>
                <th className='py-4 px-6 font-semibold track-wide text-sm'>Year Level</th>
                <th className='py-4 px-6 font-semibold track-wide text-sm'>Semester</th>
                <th className='py-4 px-6 font-semibold track-wide text-sm'>Course</th>
                <th className='py-4 px-6 font-semibold track-wide text-sm'>Code</th>
                <th className='py-4 px-6 font-semibold track-wide text-sm'>Description</th>
                <th className='py-4 px-6 font-semibold track-wide text-sm'>Units</th>
                <th className='py-4 px-6 font-semibold track-wide text-sm'>Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                   <td colSpan="7" className='p-12 text-center'>
                      <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                         <BiLoaderAlt className='animate-spin text-3xl' />
                         <span className="text-sm font-medium">Loading curriculum...</span>
                      </div>
                   </td>
                </tr>
              ) : (
                filteredCurriculums.length > 0 ? (
                  filteredCurriculums.map((curriculum, index) => (
                    <tr key={index} 
                        className='group hover:bg-blue-50/50 transition-colors duration-200 text-sm'>
                        <td className='py-4 px-6 text-gray-700 font-medium whitespace-nowrap'>{curriculum.year_level}</td>
                        <td className='py-4 px-6 text-gray-600'>{curriculum.semester}</td>
                        <td className='py-4 px-6 text-gray-500 font-medium'>{curriculum.course_code}</td>
                        <td className='py-4 px-6 text-blue-600 font-bold'>{curriculum.subject_code}</td>
                        <td className='py-4 px-6'>
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-800">{curriculum.subject_title}</span>
                                <span className="text-xs text-gray-500 italic max-w-xs truncate" title={curriculum.subject_description}>{curriculum.subject_description}</span>
                            </div>
                        </td>
                        <td className='py-4 px-6 text-center'>
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200 font-medium text-xs">
                                {curriculum.units}
                            </span>
                        </td>
                        <td className='py-4 px-6'>
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold border border-blue-200">
                                {curriculum.category}
                            </span>
                        </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                     <td colSpan="7" className='p-12 text-center text-gray-500'>
                        <div className="flex flex-col items-center justify-center gap-2">
                           <BiBookOpen className='text-4xl text-gray-300' />
                           <p>No subjects found.</p>
                        </div>
                     </td>
                  </tr>
                )
              )
            }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default StudentCurriculum