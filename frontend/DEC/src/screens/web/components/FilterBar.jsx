import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';

export default function FilterBar({ onApplyFilters }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleApply = () => {
    onApplyFilters({ startDate, endDate });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Desde:</Text>
        <TextInput
          style={styles.dateInput}
          type="date" // Esto activa el selector de fecha nativo en Web
          value={startDate}
          onChangeText={setStartDate}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Hasta:</Text>
        <TextInput
          style={styles.dateInput}
          type="date"
          value={endDate}
          onChangeText={setEndDate}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleApply}>
        <Text style={styles.buttonText}>Filtrar Datos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    gap: 20,
    marginBottom: 20,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  inputGroup: { flex: 1 },
  label: { fontSize: 12, color: '#6b7280', marginBottom: 5, fontWeight: '600' },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 10,
    borderRadius: 8,
    color: '#374151'
  },
  button: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});