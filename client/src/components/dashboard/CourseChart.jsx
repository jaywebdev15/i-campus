import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { API_BASE } from '../../config/api';

const CourseChart = () => {
  const [enrollees, setEnrollees] = useState([]);

  const fetchEnrollees = async () => {
    try {
      const response = await fetch(`${API_BASE}/database/enrollments.php`, {
        method: "POST", 
        headers: { 'Content-type': 'application/json' }, 
        body: JSON.stringify({
          action: "getEnrolleeByCourses"
        })
      });
      const data = await response.json();
      setEnrollees(data);
    } catch (error) {
      console.log("Error in fetching enrollees", error);
    }
  }

  useEffect(() => {
    fetchEnrollees();
  }, []);

  const data = enrollees.map(enrollee => ({
    course: enrollee.course_code, 
    enrollees: enrollee.total_enrollees
  }))

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c'];

  return (
    <div className='bg-white p-6 rounded-xl shadow-md w-full h-[400px] flex flex-col border border-gray-100'>
      <h3 className='text-gray-700 font-bold text-lg mb-4 uppercase tracking-wide border-b border-gray-100 pb-2'>Enrollees Per Course</h3>
      <div className='flex-1 w-full'>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
            <XAxis dataKey="course" tick={{fill: '#6B7280'}} axisLine={false} tickLine={false} />
            <YAxis tick={{fill: '#6B7280'}} axisLine={false} tickLine={false} />
            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Legend verticalAlign="bottom"/>
            <Bar dataKey="enrollees" fill="#8884d8" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
};

export default CourseChart;
