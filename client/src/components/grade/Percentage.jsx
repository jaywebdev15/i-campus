import React, { useEffect, useState, useCallback, useContext } from 'react'; // Added useContext
import { API_BASE } from '../../config/api';
import { BiPlus, BiInfoCircle, BiEdit, BiTrash } from 'react-icons/bi';
import FilterAndSearch from '../shared/FilterAndSearch';
import { AuthContext } from '../../context/AuthContext'; // Added Import

const Percentage = ({ selectedTab, loading, setGradeModal, setGradeData, setAvailableCriteria, refreshKey }) => {
  const { userCredential } = useContext(AuthContext); // Get user role
  const isTeacher = userCredential?.login_role === 'Teacher';

  const [percentages, setPercentages] = useState([]);
  const [filteredPercentages, setFilteredPercentages] = useState([]);
  const [criteriaColumns, setCriteriaColumns] = useState([]);
  
  // Filter/Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState(""); // This is "Filter By" (Category or Year Level)
  const [filterSubCategory, setFilterSubCategory] = useState(""); // This is the specific value
  
  const categoryTypes = {
      category: "Category",
      year_level: "Year Level"
  };

  const [subOptions, setSubOptions] = useState([]);

  // Fetch Logic (Keep same)
  const fetchPercentage = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/database/criterias.php`);
      const data = await response.json();

      setPercentages(data);
      if (data.length > 0) {
        const allCriteria = {};
        data.forEach(row => {
          row.criterias.forEach(c => {
            allCriteria[c.criteria_name] = true;
          });
        });
        const columns = Object.keys(allCriteria);
        setCriteriaColumns(columns);
        setAvailableCriteria(columns); 
      }

    } catch (error) {
      console.error("Error in fetching percentage", error);
    }
  }, [setAvailableCriteria]);

  useEffect(() => {
    fetchPercentage();
  }, [fetchPercentage, refreshKey]);

  // Handle Filter Options
  useEffect(() => {
    if(filterCategory && percentages.length > 0) {
        const uniqueValues = [...new Set(percentages.map(item => item[filterCategory]))].filter(Boolean).sort();
        setSubOptions(uniqueValues);
    } else {
        setSubOptions([]);
    }
  }, [filterCategory, percentages]);

  // Handle Filtering
  useEffect(() => {
    let result = [...percentages];

    // 1. Search (Subject/Course)
    if(searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        result = result.filter(item => 
            (item.subject_title && item.subject_title.toLowerCase().includes(lowerTerm)) ||
            (item.subject_code && item.subject_code.toLowerCase().includes(lowerTerm))
        );
    }

    // 2. Filter Category/Year Level
    if(filterCategory && filterSubCategory) {
        result = result.filter(item => item[filterCategory] === filterSubCategory);
    }

    setFilteredPercentages(result);

  }, [searchTerm, filterCategory, filterSubCategory, percentages]);

  return (
    <div className={`flex flex-col gap-4 
      ${selectedTab === "Percentage" ? '' : 'hidden'}`}>
      
      {/* Top Controls - Hide Add Button for Teacher too if needed, but request only mentioned action button in table? 
          "remove the action button on this if the login role is Teacher" - usually implies the table actions, 
          but often includes the "Add" button. I'll hide "Add" too as it's an action. 
          Actually, let's stick to the user's request "remove the action button on this". The "Add" is a button. The table icons are buttons.
          I'll hide the Add button and the Action column.
      */}
      <FilterAndSearch 
          category={filterCategory}
          setCategory={setFilterCategory}
          categoryTypes={categoryTypes}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          subCategory={filterSubCategory}
          setSubCategory={setFilterSubCategory}
          subOptions={subOptions}
      >
           {!isTeacher && (
             <button 
                  onClick={() => {
                      setGradeData({
                          course_code:        "", 
                          course_title:       "", 
                          course_description: "", 
                          category:           "", 
                          course_status:      ""
                       });
                      setGradeModal("add"); 
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium whitespace-nowrap"
              >
                  <BiPlus className="inline-block mr-1" /> Add
              </button>
           )}
      </FilterAndSearch>

      <div className="flex flex-col justify-center gap-3">
        {/* Elegant Table Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col relative h-[calc(100vh-350px)] min-h-[500px]">
          <div className="absolute inset-0 w-full h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            <table className='whitespace-nowrap w-full text-sm'>
              <thead className='sticky top-0 bg-white border-b border-gray-200 z-40 shadow-sm'>
                <tr>
                  {!isTeacher && <th className='p-4 text-left font-bold tracking-wider text-xs uppercase text-gray-500 border-r border-gray-100'>Action</th>}
                  <th className='p-4 text-left font-bold tracking-wider text-xs uppercase text-gray-500'>Category</th>
                  <th className='p-4 text-left font-bold tracking-wider text-xs uppercase text-gray-500'>Year Level</th>
                  <th className='p-4 text-left font-bold tracking-wider text-xs uppercase text-gray-500'>Subject</th>
                  {criteriaColumns.map(name => (
                    <th key={name} className='p-4 text-left font-bold tracking-wider text-xs uppercase text-gray-500'>
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                    <tr><td colSpan={(isTeacher ? 3 : 4) + criteriaColumns.length} className='p-8 text-center text-gray-500'>Loading...</td></tr>
                ) : filteredPercentages.length > 0 ? (
                    filteredPercentages.map((row, index) => (
                    <tr key={index}
                      className='cursor-pointer bg-white hover:bg-blue-50 transition-colors duration-150 group'>
                      {!isTeacher && (
                        <td className='flex items-center gap-3 p-4 border-r border-gray-100'>
                          <BiInfoCircle className='text-lg text-blue-500 hover:text-blue-700 hover:scale-110 transition-transform'
                            onClick={() => { 
                              setGradeData(row);
                              setGradeModal("info")} 
                            } />
                          <BiEdit className='text-lg text-green-500 hover:text-green-700 hover:scale-110 transition-transform'
                            onClick={() => { 
                              setGradeData(row);
                              setGradeModal("criteria_edit")} 
                            } />
                          <BiTrash className='text-lg text-red-500 hover:text-red-700 hover:scale-110 transition-transform' />
                        </td>
                      )}
                      <td className='p-4 text-gray-900'>{row.category}</td>
                      <td className='p-4 text-gray-700'>{row.year_level}</td>
                      <td className='p-4 text-gray-700 font-medium'>{row.subject_title}</td>
                      {criteriaColumns.map(name => {
                        const found = row.criterias.find(c => c.criteria_name === name);
                        return (
                          <td key={name} className='p-4 text-center text-gray-600'>
                            {found ? <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">{found.criteria_percentage}%</span> : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                    <tr><td colSpan={(isTeacher ? 3 : 4) + criteriaColumns.length} className='p-8 text-center text-gray-500'>No percentages available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Percentage;
