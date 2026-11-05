import React, { useEffect, useState } from "react";
import { API_BASE } from '../../config/api';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const StudentChart = () => {
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      // We fetch counts or all data. Assuming default fetch returns all students as per dashboard logic
      const response = await fetch(`${API_BASE}/database/students.php`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.log("Error in fetching students", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const maleParams = students.filter((s) => s.gender === "Male").length;
  const femaleParams = students.filter((s) => s.gender === "Female").length;

  const data = [
    { name: "Male", value: maleParams },
    { name: "Female", value: femaleParams },
  ];

  const colors = ["#3B82F6", "#EC4899"]; // Blue, Pink

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full h-[400px] flex flex-col border border-gray-100">
      <h3 className="text-gray-700 font-bold text-lg mb-4 uppercase tracking-wide border-b border-gray-100 pb-2">
        Student Gender Distribution
      </h3>
      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudentChart;