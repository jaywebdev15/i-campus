import React from 'react'
import { getPaginationRange } from '../../scripts/pagination';

const Pagination = ({ setPage, paginationInfo }) => {
  const { currentPage, lastPage, total } = paginationInfo;

  const middleButtons = getPaginationRange(currentPage, lastPage);

  return (
    <div className='flex flex-col sm:flex-row gap-4 items-center justify-between mt-4 px-2'>
      <span className="text-[0.7rem] text-gray-400 font-bold uppercase tracking-widest">
        Showing {Math.min((currentPage - 1) * 10 + 1, total)} - {Math.min(currentPage * 10, total)} of {total} results
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => setPage(1)}
          disabled={currentPage === 1}
          className={`h-8 min-w-[32px] px-2 text-[0.7rem] font-bold rounded-lg border transition-all
                      ${currentPage === 1 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200'}`}
        >
          1
        </button>

        {middleButtons.map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => setPage(pageNumber)}
            className={`h-8 min-w-[32px] px-2 text-[0.7rem] font-bold rounded-lg border transition-all
              ${currentPage === pageNumber 
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-100' 
                : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:border-blue-200'
              }`}
          >
            {pageNumber}
          </button>
        ))}

        {lastPage > 1 && lastPage !== middleButtons[middleButtons.length - 1] && (
          <button
            onClick={() => setPage(lastPage)}
            className={`h-8 min-w-[32px] px-2 text-[0.7rem] font-bold rounded-lg border transition-all
                        ${currentPage === lastPage ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:border-blue-200'}`}
          >
            {lastPage}
          </button>
        )}
      </div>
    </div>
  )
}

export default Pagination