import { Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getStats } from '../../../../api/api';

// Datos adaptados a las afecciones del café en Garzón

// Colores coherentes: Rojo (Roya), Azul (Minador), Naranja (Broca), Verde (Sano)
const COLORS = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981'];

const IncidentPieChart = ({selectedMonth}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () =>{
      try {
        setLoading(true);
        const response = await getStats(selectedMonth);
        setData(response.data);
      } catch (error) {
        console.error("Error cargando estadisticas:", error);
      }finally{
        setLoading(false)
      }
    };
    fetchChartData();
  }, [selectedMonth]);
  if  (loading) return <Text>Cargando grafico</Text>
  
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={150}
            // fill="#8884d8"
            dataKey="value"
            stroke="none" // Quita el borde blanco entre tajadas para un look más moderno
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* LEYENDA PERSONALIZADA ABAJO */}
      <div style={styles.legendContainer}>
        {data.map((entry, index) => (
          <div key={index} style={styles.legendItem}>
            <div style={{ ...styles.dot, backgroundColor: COLORS[index] }} />
            <span style={styles.legendText}>{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  legendContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '15px',
    marginTop: '10px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  legendText: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '600'
  }
};

export default IncidentPieChart;