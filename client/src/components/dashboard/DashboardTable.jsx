import React from 'react'

const DashboardTable = ({ attendance, loading }) => {
  return (
    <div className="p-5 text-xs">
      <div className="hide-scrollbar flex overflow-x-auto bg-gray-200 rounded-lg">
        <table className='whitespace-nowrap'>
          <thead className='p-2'>
            <tr>
              <th className='py-1.5 px-3 text-left'>Date</th>
              <th className='py-1.5 px-3 text-left'>Full Name</th>
              <th className='py-1.5 px-3 text-left'>Time In</th>
              <th className='py-1.5 px-3 text-left'>Time Out</th>
              <th className='py-1.5 px-3 text-left'>Advance/Late</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5"className='p-2'>Loading...</td></tr>
            ) : (
              attendance.length > 0 ? (
                attendance.map((attend, index) => (
                  <tr key={index}
                    className='cursor-pointer 
                                hover:bg-white' 
                    onClick={() => console.log("ok")}>
                    <td className='py-1 px-2'>{attend.attendance_date}</td>
                    <td className='py-1 px-2'>{attend.last_name}, {attend.first_name}</td>
                    <td className='py-1 px-2'>{attend.time_in}</td>
                    <td className='py-1 px-2'>{attend.time_out}</td>
                    <td className='py-1 px-2'>{attend.time_out}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className='p-2'>No Record</td></tr>
              )
            )
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DashboardTable