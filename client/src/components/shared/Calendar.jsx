import React, { useState } from "react";
import WeekView from "../calendar/WeekView";
import MonthView from "../calendar/MonthView.jsx";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const daysName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  
  const handlePrev = () => {
    if (view === "month") setCurrentDate(new Date(year, month - 1, 1));
    else setCurrentDate(new Date(year, month, currentDate.getDate() - 7));
  };

  const handleNext = () => {
    if (view === "month") setCurrentDate(new Date(year, month + 1, 1));
    else setCurrentDate(new Date(year, month, currentDate.getDate() + 7));
  };

  return (
    <div className="flex justify-center items-center p-5">
      <div className="flex flex-col p-5 gap-3 w-full max-w-5xl border border-gray-500 rounded-lg">
        {/* Header */}
        <header className="flex flex-row items-center justify-between p-2">
          <span className="font-semibold text-lg">
            {monthName} {year}
          </span>
          <div className="flex items-center gap-3">
            <select
              name="calendarView"
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="border p-1 rounded"
            >
              <option value="month" className="bg-gray-200">Month</option>
              <option value="week" className="bg-gray-200">Week</option>
            </select>
            <BiChevronLeft
              className="cursor-pointer text-xl"
              onClick={handlePrev}
            />
            <BiChevronRight
              className="cursor-pointer text-xl"
              onClick={handleNext}
            />
          </div>
        </header>

        {view === "month" 
          ? <MonthView  daysInMonth={daysInMonth}
                        firstDayOfWeek={firstDayOfWeek}
                        prevMonthDays={prevMonthDays} 
                        today={today} 
                        month={month} 
                        year={year} 
                        daysName={daysName} /> 
          : <WeekView currentDate={currentDate} 
                      daysName={daysName} 
                      today={today} />
        }
      </div>
    </div>
  );
};

export default Calendar;