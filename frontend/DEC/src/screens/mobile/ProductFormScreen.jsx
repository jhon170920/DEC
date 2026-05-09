// screens/ProductFormScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Modal
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Colors } from '../../constants/colors';

export default function ProductFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { product, index, onSave } = route.params || {};

  const [productName, setProductName] = useState('');
  const [dose, setDose] = useState('');
  const [applicationDate, setApplicationDate] = useState(null);
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Cargar datos si estamos editando
  useEffect(() => {
    if (product) {
      setProductName(product.product_name || '');
      setDose(product.dose || '');
      setApplicationDate(product.application_date ? new Date(product.application_date) : null);
      setNotes(product.notes || '');
    }
  }, [product]);

  const handleSave = () => {
    if (!productName.trim()) {
      showModal('El nombre del producto es obligatorio');
      return;
    }
    if (!dose.trim()) {
      showModal('La dosis es obligatoria');
      return;
    }
    if (!applicationDate) {
      showModal('La fecha de aplicación es obligatoria');
      return;
    }

    const newProduct = {
      product_name: productName.trim(),
      dose: dose.trim(),
      application_date: applicationDate.toISOString(),
      notes: notes.trim(),
    };

    if (onSave) {
      onSave(newProduct, index);
    }
    navigation.goBack();
  };

  const showModal = (message) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES');
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Feather name="arrow-left" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {product ? 'Editar producto' : 'Nuevo producto'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Nombre del producto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Fungicida X"
              placeholderTextColor="#999"
              value={productName}
              onChangeText={setProductName}
            />

            <Text style={styles.label}>Dosis *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 2 L/ha"
              placeholderTextColor="#999"
              value={dose}
              onChangeText={setDose}
            />

            <Text style={styles.label}>Fecha de aplicación *</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <View style={styles.dateInput}>
                <Text style={applicationDate ? styles.dateText : styles.placeholderText}>
                  {applicationDate ? formatDate(applicationDate) : 'Seleccionar fecha'}
                </Text>
                <Feather name="calendar" size={20} color={Colors.primary} />
              </View>
            </TouchableOpacity>

            <Text style={styles.label}>Observaciones (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notas adicionales sobre la aplicación"
              placeholderTextColor="#999"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.saveGradient}>
                <Text style={styles.saveText}>Guardar producto</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="datetime"
        onConfirm={(date) => {
          setApplicationDate(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
        minimumDate={new Date()}
        locale="es_ES"
      />

      {/* Modal de error */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Feather name="alert-circle" size={50} color="#dc2626" style={{ alignSelf: 'center' }} />
            <Text style={styles.modalTitle}>Error</Text>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, marginTop: 15 },
  backBtn: { padding: 5 },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  card: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 20, padding: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  label: { fontSize: 16, fontWeight: '600', color: '#2C3E50', marginBottom: 5, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 10, backgroundColor: '#fff', color: '#000' },
  textArea: { height: 80, textAlignVertical: 'top' },
  dateInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, backgroundColor: '#fff' },
  dateText: { fontSize: 16, color: '#000' },
  placeholderText: { fontSize: 16, color: '#999' },
  saveBtn: { marginTop: 20, borderRadius: 12, overflow: 'hidden' },
  saveGradient: { paddingVertical: 12, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '80%', backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, color: '#dc2626' },
  modalText: { fontSize: 16, textAlign: 'center', marginVertical: 15 },
  modalButton: { backgroundColor: '#dc2626', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 10, marginTop: 10 },
  modalButtonText: { color: '#fff', fontWeight: 'bold' },
});