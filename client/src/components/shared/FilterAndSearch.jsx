import React from 'react'
import { BiSearch, BiX } from 'react-icons/bi';

const FilterAndSearch = ({ category, setCategory, categoryTypes = {}, searchTerm, setSearchTerm, subCategory, setSubCategory, subOptions = [], children }) => {


  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full">

      {/* =====> Search Bar <===== */}
      <div className="flex items-center bg-white border border-gray-100 rounded-xl h-11 w-full sm:max-w-xs overflow-hidden 
                      transition-all duration-300 focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-200 shadow-sm" >
        <BiSearch className="ml-4 text-gray-400 text-lg" />
        <input type="text" 
                placeholder='Search faculty...'
                className='outline-none px-3 w-full text-[0.7rem] font-bold text-gray-700 placeholder:text-gray-400 uppercase tracking-wider' 
                value={searchTerm || ""} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                />
        {searchTerm && (
            <BiX className="cursor-pointer px-3 text-lg transition-colors text-gray-400 hover:text-red-500" 
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm("");
                }} /> 
        )} 
      </div>

      <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto items-center">
        
        {/* =====> Filter by <===== \\ */}
        <div className="relative group shrink-0 w-full sm:w-auto">
           <select name="" id="" 
                  value={category || ""} 
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (typeof setSubCategory === 'function') {
                      setSubCategory("");
                    }
                  }} 
                  className='appearance-none bg-white border border-gray-100 py-3 pl-4 pr-10 rounded-xl text-[0.65rem] font-black uppercase tracking-widest text-gray-500 cursor-pointer shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-50/50 focus:border-blue-200 hover:bg-gray-50 transition-all w-full min-w-[140px]'>
            <option value="">Filter By</option>
            {Object.keys(categoryTypes || {}).map(categoryType => (
              <option key={categoryType} value={categoryType}>
                {categoryType.replace("_", " ")}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-300 group-hover:text-blue-500 transition-colors">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>

        {/* =====> Sub Category <===== \\ */}
        {typeof setSubCategory === 'function' && (
          <div className="relative group shrink-0 w-full sm:w-auto">
             <select name="" id="" 
                    value={subCategory || ""} 
                    onChange={(e) => setSubCategory(e.target.value)} 
                    className='appearance-none bg-white border border-gray-100 py-3 pl-4 pr-10 rounded-xl text-[0.65rem] font-black uppercase tracking-widest text-gray-500 cursor-pointer shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-50/50 focus:border-blue-200 hover:bg-gray-50 transition-all w-full min-w-[140px] disabled:bg-gray-50 disabled:text-gray-300'
                    disabled={!category}>
              <option value="">Category</option>
              {(subOptions || []).map(subOption => (
                <option key={subOption} value={subOption}>{
                  String(subOption).replace(/_/g, " ")
                }</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-300 group-hover:text-blue-500 transition-colors">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        )}

        {/* =====> Custom Filters (e.g. Date Range) <===== */}
        {children}
      </div>

    </div>
  )
}

export default FilterAndSearch