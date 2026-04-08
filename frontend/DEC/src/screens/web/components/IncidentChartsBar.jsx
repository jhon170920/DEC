import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { View, Text } from 'react-native';

const IncidentCharts = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#6b7280' }}>No hay datos disponibles</Text>
      </View>
    );
  }

  // Colores profesionales para el sector agro
  const COLORS = ['#16a34a', '#f59e0b', '#ef4444', '#3b82f6'];
  const dataKeys = Object.keys(data[0]).filter(key => key !== 'name');

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12, fill: '#6b7280' }} 
          axisLine={false} 
          tickLine={false}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
        <Tooltip 
          cursor={{ fill: '#f9fafb' }}
          contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
        />
        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: 20 }} />
        
        {dataKeys.map((key, index) => (
          <Bar 
            key={key} 
            dataKey={key} 
            fill={COLORS[index % COLORS.length]} 
            radius={[6, 6, 0, 0]} 
            barSize={35}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IncidentCharts;