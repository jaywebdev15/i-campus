import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { API_BASE } from '../../config/api';

const GradeChart = () => {
  const [gradeStats, setGradeStats] = useState({ passed: 0, fair: 0, bad: 0 });

  const fetchGradeStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/database/grades.php`, {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          action: "getGradeStats", 
        })
      });
      const data = await response.json();
      setGradeStats(data);
    } catch (error) {
      console.log("Error in fetching grade stats", error);
    }
  }

  useEffect(() => {
    fetchGradeStats();
  }, []);

  const data = [
      { name: 'Passed', count: Number(gradeStats?.passed || 0), color: '#10B981' }, // Green
      { name: 'Fair',   count: Number(gradeStats?.fair || 0),   color: '#F59E0B' }, // Yellow/Orange
      { name: 'Bad',    count: Number(gradeStats?.bad || 0),    color: '#EF4444' }, // Red
  ];

  return (
    <div className='bg-white p-6 rounded-xl shadow-md w-full h-[400px] flex flex-col border border-gray-100'>
      <h3 className='text-gray-700 font-bold text-lg mb-4 uppercase tracking-wide border-b border-gray-100 pb-2'>Grade Distribution</h3>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
            <XAxis dataKey="name" tick={{fill: '#6B7280'}} axisLine={false} tickLine={false} />
            <YAxis tick={{fill: '#6B7280'}} axisLine={false} tickLine={false} allowDecimals={false}/>
             <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Legend verticalAlign="bottom"/>
            <Bar dataKey="count" name="Grades" radius={[4, 4, 0, 0]}>
                 {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
};

export default GradeChart;
