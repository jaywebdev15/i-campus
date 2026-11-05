import React from 'react'

const WeekView = ({ currentDate, daysName, today }) => {
  const hours = Array.from({ length: 24 }, (_, i) =>
    i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`
  );

  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  return (
    <div className="border rounded-lg h-[300px] overflow-y-auto">
      {/* You can adjust h-[300px] to your desired visible height */}
      <table className="w-full text-sm border-collapse rounded-lg">
        <thead className="sticky top-0 border-b border-gray-500 z-10 rounded-t-lg">
          <tr className="bg-gray-500">
            <th className="border w-20"></th>
            {weekDays.map((d, i) => (
              <th
                key={i}
                className={`border text-center py-2 ${
                  d.toDateString() === today.toDateString()
                    ? "bg-green-100 text-green-700 font-semibold"
                    : ""
                }`}
              >
                {daysName[d.getDay()]} <br />
                {d.getDate()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour, i) => (
            <tr key={i}>
              <td className="border text-right pr-2 text-gray-500 w-20 sticky left-0">
                {hour}
              </td>
              {weekDays.map((_, j) => (
                <td
                  key={j}
                  className="border h-[50px] hover:bg-green-50 cursor-pointer"
                ></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeekView