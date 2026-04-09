import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { View, Text, Platform } from 'react-native';

const IncidentCharts = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={{ height: 300, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#6b7280' }}>Esperando datos de la zona...</Text>
      </View>
    );
  }

  // Obtenemos las patologías (ej: 'Roya', 'Minador') dinámicamente
  const keys = Object.keys(data[0]).filter(key => key !== 'name');

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <ResponsiveContainer width="100%" aspect={1.618}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          style={{ maxWidth: '700px' }} // Siguiendo tu modelo
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#6b7280' }} 
          />
          
          {/* Eje Izquierdo: Para la patología principal */}
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke="#16a34a" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          
          {/* Eje Derecho: Para las demás patologías */}
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#f59e0b" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />

          <Tooltip 
            cursor={{ fill: '#f9fafb' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: 20 }} />

          {/* Generamos las barras dinámicamente basándonos en tu modelo */}
          {keys.map((key, index) => (
            <Bar 
              key={key}
              yAxisId={index === 0 ? "left" : "right"} // La primera va a la izq, el resto a la der
              dataKey={key} 
              fill={index === 0 ? "#16a34a" : index === 1 ? "#f59e0b" : "#ef4444"} 
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </View>
  );
};

export default IncidentCharts;