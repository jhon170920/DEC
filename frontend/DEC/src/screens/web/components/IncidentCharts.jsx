// IncidentCharts.jsx optimizado
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { View, Text } from 'react-native';

const IncidentCharts = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <Text style={{ color: '#6b7280' }}>No hay datos para mostrar en este periodo</Text>
      </View>
    );
  }

  // Extraemos dinámicamente todos los nombres de enfermedades presentes en los datos
  const diseases = Array.from(
    new Set(data.flatMap(day => Object.keys(day).filter(key => key !== 'name')))
  );

  const colors = ['#16a34a', '#f59e0b', '#ef4444', '#3b82f6'];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        {diseases.map((disease, index) => (
          <Line 
            key={disease}
            type="monotone" 
            dataKey={disease} 
            stroke={colors[index % colors.length]} 
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default IncidentCharts;