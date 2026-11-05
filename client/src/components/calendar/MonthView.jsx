import React from 'react'

const MonthView = ({ daysInMonth, firstDayOfWeek, prevMonthDays, today, month, year, daysName }) => {
  const days = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    days.push(
      <li
        key={`prev-${dayNum}`}
        className="text-gray-400 cursor-default text-sm py-2"
      >
        {dayNum}
      </li>
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    days.push(
      <li
        key={day}
        className={`rounded-md cursor-pointer text-sm py-2 ${
          isToday
            ? "bg-green-500 text-white font-bold"
            : "hover:text-green-400"
        }`}
      >
        {day}
      </li>
    );
  }

  const totalCells = days.length;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remainingCells; i++) {
    days.push(
      <li
        key={`next-${i}`}
        className="text-gray-400 cursor-default text-sm py-2"
      >
        {i}
      </li>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-7 gap-2 list-none text-center font-semibold">
        {daysName.map((dayname) => (
          <li key={dayname}>{dayname}</li>
        ))}
      </ul>

      <ul className="grid grid-cols-7 gap-2 list-none text-center">
        {days}
      </ul>
    </>
  );
};

export default MonthView