import React from 'react'
import { GoPlus } from "react-icons/go";
import { CiImport, CiExport } from "react-icons/ci";

const Command = ({ handleExport, handleImport, setModal, buttonText = "Add Product" }) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
      <div className="flex gap-2 order-2 sm:order-1">
        {/* =====> Import <===== */}
        {handleImport && (
          <label className="flex flex-row items-center gap-2 bg-white text-gray-500 border border-gray-100 rounded-xl py-2 px-5 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer text-[0.7rem] font-black uppercase tracking-widest" 
                  id='import'>
            <CiImport className="text-lg"/> 
            <span>Import </span>
            <input type="file" 
                      id='import' 
                      hidden 
                      onChange={handleImport} 
                      accept='.csv, .xslx, .xls'/>
          </label>
        )}
        {/* =====> Export <===== */}
        <button className="flex flex-row items-center gap-2 bg-white text-gray-500 border border-gray-100 rounded-xl py-2 px-5 shadow-sm hover:bg-gray-50 hover:text-gray-900 transition-all text-[0.7rem] font-black uppercase tracking-widest" 
                onClick={() => handleExport('xlsx')}>
          <CiExport className="text-lg"/> 
          <span>Export </span>
        </button>
      </div>

      {setModal && (
        <button className="flex flex-row items-center justify-center gap-2 bg-blue-600 text-white rounded-xl py-3 px-6 shadow-lg shadow-blue-100 hover:bg-blue-700 hover:shadow-blue-200 transition-all active:scale-95 text-[0.75rem] font-black uppercase tracking-widest order-1 sm:order-2 ml-auto" 
                onClick={() => setModal("add")}>
          <GoPlus className="text-lg"/> 
          <span>{buttonText}</span>
        </button>
      )}
    </div>
  )
}

export default Command