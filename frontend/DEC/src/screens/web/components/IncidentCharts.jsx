import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { View, Text } from 'react-native';

const IncidentCharts = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Detectar qué enfermedades vienen en los datos (Roya, Minador, etc.)
  const dataKeys = Object.keys(data[0]).filter(key => key !== 'name');
  const colors = ['#16a34a', '#f59e0b', '#ef4444', '#3b82f6'];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} 
        />
        <Legend />
        {dataKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone" // 👈 ESTO hace que la línea sea curva y suave
            dataKey={key}
            stroke={colors[index % colors.length]}
            strokeWidth={4} // Más gruesa para que se vea mejor
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 8 }}
            animationDuration={1500}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default IncidentCharts;