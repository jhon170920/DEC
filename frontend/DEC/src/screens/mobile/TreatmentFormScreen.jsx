import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Alert,
  StatusBar, StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { saveTreatmentLog, updateTreatmentLog, getTreatmentLogById } from '../../services/dbService';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

export default function TreatmentFormScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { logId } = route.params || {};

  const [diseaseName, setDiseaseName] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [tempProduct, setTempProduct] = useState({ product_name: '', dose: '', application_date: '', notes: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentProductIndex, setCurrentProductIndex] = useState(null);

  useEffect(() => {
    if (logId) {
      loadLog();
    }
  }, [logId]);

  const loadLog = async () => {
    const log = await getTreatmentLogById(logId);
    if (log) {
      setDiseaseName(log.disease_name);
      setGeneralNotes(log.general_notes || '');
      setProducts(log.products || []);
    }
  };

  const addProduct = () => {
    if (!tempProduct.product_name.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return;
    }
    if (currentProductIndex !== null) {
      const updated = [...products];
      updated[currentProductIndex] = { ...tempProduct };
      setProducts(updated);
      setCurrentProductIndex(null);
    } else {
      setProducts([...products, { ...tempProduct }]);
    }
    setTempProduct({ product_name: '', dose: '', application_date: '', notes: '' });
    setShowProductModal(false);
  };

  const editProduct = (index) => {
    setTempProduct(products[index]);
    setCurrentProductIndex(index);
    setShowProductModal(true);
  };

  const removeProduct = (index) => {
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  const handleSave = async () => {
    if (!diseaseName.trim()) {
      Alert.alert('Error', 'Ingresa el nombre de la enfermedad o afección');
      return;
    }
    setLoading(true);
    try {
      const logData = {
        disease_name: diseaseName.trim(),
        general_notes: generalNotes.trim(),
        detection_id: null,
        products: products.map(p => ({
          product_name: p.product_name,
          dose: p.dose,
          application_date: p.application_date,
          notes: p.notes
        }))
      };
      if (logId) {
        await updateTreatmentLog(logId, logData);
        Alert.alert('Éxito', 'Seguimiento actualizado');
      } else {
        await saveTreatmentLog(logData);
        Alert.alert('Éxito', 'Seguimiento creado');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el seguimiento');
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = (item, index) => (
    <View style={styles.productCard} key={index}>
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{item.product_name}</Text>
        <View style={styles.productActions}>
          <TouchableOpacity onPress={() => editProduct(index)}>
            <Feather name="edit-2" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeProduct(index)} style={{ marginLeft: 12 }}>
            <Feather name="trash-2" size={18} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
      {item.dose ? <Text style={styles.productDetail}>💊 Dosis: {item.dose}</Text> : null}
      {item.application_date ? <Text style={styles.productDetail}>📅 Aplicación: {new Date(item.application_date).toLocaleDateString()}</Text> : null}
      {item.notes ? <Text style={styles.productDetail}>📝 {item.notes}</Text> : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <LinearGradient colors={['#e8f5ec', '#f4faf5']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{logId ? 'Editar seguimiento' : 'Nuevo seguimiento'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Enfermedad / Afección *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Roya, Mancha de hierro"
            value={diseaseName}
            onChangeText={setDiseaseName}
          />

          <Text style={styles.label}>Notas generales</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Observaciones adicionales"
            value={generalNotes}
            onChangeText={setGeneralNotes}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Productos aplicados</Text>
          {products.length === 0 ? (
            <Text style={styles.emptyList}>No hay productos agregados</Text>
          ) : (
            products.map((item, index) => renderProduct(item, index))
          )}
          <TouchableOpacity style={styles.addProductBtn} onPress={() => setShowProductModal(true)}>
            <Feather name="plus" size={20} color={Colors.primary} />
            <Text style={styles.addProductText}>Agregar producto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.saveGradient}>
              <Text style={styles.saveText}>{loading ? 'Guardando...' : 'Guardar seguimiento'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showProductModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{currentProductIndex !== null ? 'Editar producto' : 'Nuevo producto'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nombre del producto *"
              value={tempProduct.product_name}
              onChangeText={(text) => setTempProduct({ ...tempProduct, product_name: text })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Dosis (ej: 2 L/ha)"
              value={tempProduct.dose}
              onChangeText={(text) => setTempProduct({ ...tempProduct, dose: text })}
            />
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                style={styles.modalInput}
                placeholder="Fecha de aplicación"
                value={tempProduct.application_date ? new Date(tempProduct.application_date).toLocaleDateString() : ''}
                editable={false}
              />
            </TouchableOpacity>
            <TextInput
              style={styles.modalInput}
              placeholder="Observaciones del producto"
              value={tempProduct.notes}
              onChangeText={(text) => setTempProduct({ ...tempProduct, notes: text })}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowProductModal(false)}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={addProduct}>
                <Text style={{ color: '#fff' }}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={(date) => {
          setShowDatePicker(false);
          setTempProduct({ ...tempProduct, application_date: date.toISOString() });
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { padding: 5 },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  card: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 20, padding: 20, elevation: 3 },
  label: { fontSize: 16, fontWeight: '600', color: '#2C3E50', marginBottom: 5, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, marginBottom: 10 },
  textArea: { height: 80, textAlignVertical: 'top' },
  productCard: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 10, marginBottom: 8 },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productName: { fontSize: 16, fontWeight: 'bold', color: Colors.primary },
  productActions: { flexDirection: 'row' },
  productDetail: { fontSize: 13, color: '#475569', marginTop: 4 },
  emptyList: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginVertical: 10 },
  addProductBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 15 },
  addProductText: { color: Colors.primary, marginLeft: 8, fontWeight: '600' },
  saveBtn: { marginTop: 20, borderRadius: 12, overflow: 'hidden' },
  saveGradient: { paddingVertical: 12, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalCancel: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#e2e8f0', borderRadius: 8, marginRight: 8 },
  modalConfirm: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: Colors.primary, borderRadius: 8, marginLeft: 8 }
});