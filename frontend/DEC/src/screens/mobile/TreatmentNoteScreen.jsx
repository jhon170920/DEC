import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, StatusBar, StyleSheet, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { getTreatmentNoteByDetectionId, saveTreatmentNote } from '../../services/dbService';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';

export default function TreatmentNoteScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { detectionId, initialDiseaseName } = route.params;
  const { sp, hPad, fieldH, btnH, iconS } = useResponsiveLayout();

  const [diseaseName, setDiseaseName] = useState(initialDiseaseName || '');
  const [productName, setProductName] = useState('');
  const [dose, setDose] = useState('');
  const [applicationDate, setApplicationDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadNote = async () => {
      const existing = await getTreatmentNoteByDetectionId(detectionId);
      if (existing) {
        setDiseaseName(existing.disease_name || '');
        setProductName(existing.product_name || '');
        setDose(existing.dose || '');
        setApplicationDate(existing.application_date || '');
        setNotes(existing.notes || '');
      } else {
        // Fecha actual por defecto
        const today = new Date().toISOString().split('T')[0];
        setApplicationDate(today);
      }
    };
    loadNote();
  }, [detectionId]);

  const handleSave = async () => {
    if (!diseaseName.trim()) {
      Alert.alert('Error', 'Debes indicar la enfermedad o afección');
      return;
    }
    if (!productName.trim()) {
      Alert.alert('Error', 'Ingresa el nombre del producto o agroquímico');
      return;
    }
    setLoading(true);
    await saveTreatmentNote({
      detection_id: detectionId,
      disease_name: diseaseName.trim(),
      product_name: productName.trim(),
      dose: dose.trim(),
      application_date: applicationDate,
      notes: notes.trim(),
    });
    Alert.alert('Éxito', 'Nota de tratamiento guardada correctamente');
    navigation.goBack();
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <LinearGradient colors={['#e8f5ec', '#f4faf5']} style={StyleSheet.absoluteFill} />
      
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingHorizontal: hPad }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Seguimiento de tratamiento</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Enfermedad / Afección *</Text>
          <TextInput
            style={[styles.input, { height: fieldH }]}
            placeholder="Ej: Roya, Mancha de hierro, etc."
            placeholderTextColor={Colors.textMuted}
            value={diseaseName}
            onChangeText={setDiseaseName}
          />

          <Text style={styles.label}>Producto / Agroquímico *</Text>
          <TextInput
            style={[styles.input, { height: fieldH }]}
            placeholder="Ej: Fungicida X, Caldo bordelés"
            placeholderTextColor={Colors.textMuted}
            value={productName}
            onChangeText={setProductName}
          />

          <Text style={styles.label}>Dosis aplicada</Text>
          <TextInput
            style={[styles.input, { height: fieldH }]}
            placeholder="Ej: 2 L/ha, 500 ml/20L agua"
            placeholderTextColor={Colors.textMuted}
            value={dose}
            onChangeText={setDose}
          />

          <Text style={styles.label}>Fecha de aplicación</Text>
          <TextInput
            style={[styles.input, { height: fieldH }]}
            placeholder="AAAA-MM-DD"
            value={applicationDate}
            onChangeText={setApplicationDate}
          />

          <Text style={styles.label}>Observaciones adicionales</Text>
          <TextInput
            style={[styles.textArea, { height: fieldH * 1.5 }]}
            placeholder="Notas sobre el tratamiento, resultados, etc."
            placeholderTextColor={Colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.saveBtn, { height: btnH }]}
            onPress={handleSave}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#22c55e', '#16a34a', '#15803d']}
              style={styles.btnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.btnText}>{loading ? 'Guardando...' : 'Guardar seguimiento'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { flexGrow: 1, paddingBottom: 30 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  backBtn: { padding: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.text, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  saveBtn: {
    marginTop: 25,
    borderRadius: 12,
    overflow: 'hidden',
  },
  btnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});