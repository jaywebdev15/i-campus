import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import { API_BASE } from '../../config/api';

const EnrollmentChart = () => {
  const [enrollments, setEnrollments] = useState([]);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch(`${API_BASE}/database/enrollments.php`); // Default GET returns all with student info
      const data = await response.json();
      setEnrollments(data);
    } catch (error) {
      console.log("Error in fetching enrollments", error);
    }
  }

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // Process data for Stacked Bar Chart: Payment Status vs Gender
  const paymentStatuses = ['Paid', 'Unpaid', 'Partial'];
  const data = paymentStatuses.map(status => {
    const statusGroup = enrollments.filter(e => e.payment_status === status);
    const maleCount = statusGroup.filter(e => e.gender === 'Male').length;
    const femaleCount = statusGroup.filter(e => e.gender === 'Female').length;
    return {
      name: status,
      Male: maleCount,
      Female: femaleCount
    };
  });


  return (
    <div className='bg-white p-6 rounded-xl shadow-md w-full h-[400px] flex flex-col border border-gray-100'>
      <h3 className='text-gray-700 font-bold text-lg mb-4 uppercase tracking-wide border-b border-gray-100 pb-2'>Enrollment Demographics by Payment</h3>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
            <XAxis dataKey="name" tick={{fill: '#6B7280'}} axisLine={false} tickLine={false} />
            <YAxis tick={{fill: '#6B7280'}} axisLine={false} tickLine={false} allowDecimals={false}/>
            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
            <Legend verticalAlign="bottom"/>
            <Bar dataKey="Male" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} />
            <Bar dataKey="Female" stackId="a" fill="#EC4899" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
};

export default EnrollmentChart;
