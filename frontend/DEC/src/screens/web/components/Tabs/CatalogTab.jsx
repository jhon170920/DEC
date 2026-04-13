import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Image, Platform, Switch, Modal, ActivityIndicator, Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../../../api/api';

const CatalogTab = () => {
  const [pathologies, setPathologies] = useState([]);
  const [selectedPathology, setSelectedPathology] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detectionsCount, setDetectionsCount] = useState({});
  const [saving, setSaving] = useState(false);

  // Cargar patologías y conteo de detecciones
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resPath, resDet] = await Promise.all([
        api.get('admin/get-pathologies'),
        api.get('admin/get-detections')
      ]);
      const pathologiesData = resPath.data.pathologies || [];
      setPathologies(pathologiesData);
      if (pathologiesData.length > 0 && !selectedPathology) {
        setSelectedPathology(pathologiesData[0]);
      }

      // Contar detecciones por pathologyId
      const detections = resDet.data.detections || [];
      const counts = {};
      detections.forEach(d => {
        const pid = d.pathologyId?._id || d.pathologyId;
        if (pid) counts[pid] = (counts[pid] || 0) + 1;
      });
      setDetectionsCount(counts);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Guardar cambios de la patología actual
  const handleSave = async () => {
    if (!selectedPathology) return;
    setSaving(true);
    try {
      const { _id, name, description, treatment, alert } = selectedPathology;
      await api.put(`admin/edit-pathology/${_id}`, { name, description, treatment, alert });
      // Actualizar lista local
      setPathologies(prev => prev.map(p => p._id === _id ? { ...selectedPathology } : p));
      setIsEditing(false);
      Alert.alert('Éxito', 'Patología actualizada');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  // Cambiar el estado de alerta (toggle)
  const toggleAlert = async (value) => {
    if (!selectedPathology) return;
    const updated = { ...selectedPathology, alert: value };
    setSelectedPathology(updated);
    // Guardar automáticamente al cambiar el switch
    try {
      await api.put(`admin/edit-pathology/${updated._id}`, {
        name: updated.name,
        description: updated.description,
        treatment: updated.treatment,
        alert: updated.alert
      });
      setPathologies(prev => prev.map(p => p._id === updated._id ? updated : p));
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo actualizar el estado de alerta');
      // revertir
      setSelectedPathology(prev => ({ ...prev, alert: !value }));
    }
  };

  // Enviar alerta push (mock)
  
const handleSendAlert = async (location, message) => {
  try {
    await api.post('/admin/send-notification', {
      title: `🚨 Alerta: ${selectedPathology.name}`,
      body: `${message}\n📍 Ubicación: ${location}`,
      data: { pathologyId: selectedPathology._id, location, type: 'alert' }
    });
    Alert.alert('Alerta enviada', 'La notificación se ha enviado a todos los usuarios.');
    setModalVisible(false);
  } catch (error) {
    console.error(error);
    Alert.alert('Error', 'No se pudo enviar la alerta. Intenta de nuevo.');
  }
};

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={styles.loadingText}>Cargando catálogo...</Text>
      </View>
    );
  }

  if (!selectedPathology) return null;

  return (
    <View style={styles.container}>
      <AlertModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        pathologyName={selectedPathology.name}
        onSend={handleSendAlert}
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Catálogo Fitopatológico</Text>
          <Text style={styles.sub}>Base de conocimientos y alertas sanitarias</Text>
        </View>
        <TouchableOpacity
          style={styles.broadcastBtn}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="rss" size={18} color="#fff" />
          <Text style={styles.broadcastBtnText}>Emitir Alerta Push</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainLayout}>
        {/* Lista izquierda */}
        <View style={styles.listSide}>
          {pathologies.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={[styles.itemCard, selectedPathology?._id === item._id && styles.itemCardActive]}
              onPress={() => { setSelectedPathology(item); setIsEditing(false); }}
            >
              <Text style={[styles.itemTitle, selectedPathology?._id === item._id && styles.activeText]}>
                {item.name}
              </Text>
              <Feather name="chevron-right" size={16} color={selectedPathology?._id === item._id ? '#fff' : '#9ca3af'} />
            </TouchableOpacity>
          ))}
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Últimas Alertas</Text>
            <View style={styles.historyItem}>
              <Text style={styles.historyDate}>Hoy, 08:30 AM</Text>
              <Text style={styles.historyText}>Brote de Roya en Vereda El Recreo...</Text>
            </View>
          </View>
        </View>

        {/* Lado derecho: editor */}
        <View style={styles.editorSide}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.editorHeader}>
              <View>
                <Text style={styles.pathologyTitle}>{selectedPathology.name}</Text>
                {/* Si tuvieras nombre científico, agrégalo */}
                <Text style={styles.scientificName}>{selectedPathology.scientificName || 'Nombre científico no disponible'}</Text>
              </View>
              <TouchableOpacity
                style={[styles.editBtn, isEditing && styles.saveBtn]}
                onPress={isEditing ? handleSave : () => setIsEditing(true)}
                disabled={saving}
              >
                <Feather name={isEditing ? "check" : "edit-3"} size={18} color="#fff" />
                <Text style={styles.editBtnText}>{isEditing ? (saving ? 'Guardando...' : 'Guardar') : "Editar Ficha"}</Text>
              </TouchableOpacity>
            </View>

            {/* Imagen de referencia (mock, podrías agregar campo imageUrl a Pathology) */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1592819695396-064b9570a5d0?w=500' }} style={styles.refImage} />
              {isEditing && (
                <TouchableOpacity style={styles.uploadOverlay}>
                  <Feather name="camera" size={24} color="#fff" />
                  <Text style={styles.uploadText}>Cambiar Imagen de Referencia</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Descripción de la Afección (Síntomas)</Text>
              <TextInput
                multiline
                editable={isEditing}
                style={[styles.input, styles.textArea, isEditing && styles.inputActive]}
                value={selectedPathology.description}
                onChangeText={(text) => setSelectedPathology({ ...selectedPathology, description: text })}
              />

              <Text style={styles.label}>Protocolo de Tratamiento Sugerido</Text>
              <TextInput
                multiline
                editable={isEditing}
                style={[styles.input, styles.textArea, isEditing && styles.inputActive]}
                value={selectedPathology.treatment}
                onChangeText={(text) => setSelectedPathology({ ...selectedPathology, treatment: text })}
              />

              <View style={styles.row}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Estado de Alerta</Text>
                  <View style={styles.switchContainer}>
                    <Text style={[styles.statusText, { color: selectedPathology.alert ? '#ef4444' : '#6b7280' }]}>
                      {selectedPathology.alert ? 'ALTA PRIORIDAD' : 'Normal'}
                    </Text>
                    <Switch
                      value={selectedPathology.alert || false}
                      onValueChange={toggleAlert}
                      trackColor={{ false: "#d1d5db", true: "#fca5a5" }}
                      thumbColor={selectedPathology.alert ? "#ef4444" : "#f4f3f4"}
                    />
                  </View>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Incidencia en Garzón</Text>
                  <Text style={styles.incidenciaValue}>
                    {detectionsCount[selectedPathology._id] || 0} casos
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

// Modal para enviar alerta push
const AlertModal = ({ visible, onClose, pathologyName, onSend }) => {
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!location.trim()) {
      Alert.alert('Error', 'Ingresa la ubicación del brote');
      return;
    }
    onSend(location, message);
    setLocation('');
    setMessage('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Feather name="alert-triangle" size={24} color="#ef4444" />
            <Text style={styles.modalTitle}>Emitir Notificación Push</Text>
          </View>
          <Text style={styles.modalSub}>
            Esta alerta llegará al celular de todos los usuarios vinculados.
          </Text>
          <Text style={styles.label}>Ubicación del Brote</Text>
          <TextInput
            placeholder="Ej: Vereda La Jagua, Garzón"
            style={styles.modalInput}
            value={location}
            onChangeText={setLocation}
          />
          <Text style={styles.label}>Instrucciones para el usuario</Text>
          <TextInput
            multiline
            numberOfLines={4}
            placeholder="Ej: Se reporta alta incidencia. Favor intensificar muestreos y cuidados."
            style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
            value={message}
            onChangeText={setMessage}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleSend}>
              <Feather name="send" size={16} color="#fff" />
              <Text style={styles.confirmBtnText}>Enviar Alerta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Estilos (los mismos que tenías, solo añado centerContainer, loadingText, etc.)
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25
  },
  title: { fontSize: 26, fontWeight: '800', color: '#1f2937' },
  sub: { color: '#6b7280', marginTop: 4 },
  broadcastBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  broadcastBtnText: { color: '#fff', fontWeight: '700' },
  mainLayout: { flexDirection: 'row', gap: 20, flex: 1 },
  listSide: { width: 300 },
  itemCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  itemCardActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  itemTitle: { fontWeight: '700', color: '#374151', fontSize: 15 },
  activeText: { color: '#fff' },
  historyCard: { marginTop: 20, backgroundColor: '#fff', padding: 15, borderRadius: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: '#d1d5db' },
  historyTitle: { fontSize: 12, fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 10 },
  historyItem: { marginBottom: 8 },
  historyDate: { fontSize: 11, fontWeight: '700', color: '#16a34a' },
  historyText: { fontSize: 12, color: '#6b7280' },
  editorSide: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 30,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  pathologyTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
  scientificName: { fontStyle: 'italic', color: '#6b7280', fontSize: 18 },
  editBtn: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    gap: 8
  },
  saveBtn: { backgroundColor: '#16a34a' },
  editBtnText: { color: '#fff', fontWeight: '700' },
  imageContainer: { width: '100%', height: 220, borderRadius: 20, overflow: 'hidden', marginBottom: 30, position: 'relative' },
  refImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10
  },
  uploadText: { color: '#fff', fontWeight: '700' },
  form: { gap: 20 },
  label: { fontSize: 13, fontWeight: '800', color: '#4b5563', marginBottom: 8 },
  input: {
    backgroundColor: '#f9fafb',
    padding: 18,
    borderRadius: 15,
    fontSize: 14,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  inputActive: { backgroundColor: '#fff', borderColor: '#16a34a', borderWidth: 1.5 },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 25 },
  fieldGroup: { flex: 1 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 5 },
  statusText: { fontSize: 12, fontWeight: '800' },
  incidenciaValue: { fontSize: 22, fontWeight: '800', color: '#16a34a', marginTop: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', width: 450, padding: 30, borderRadius: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  modalSub: { color: '#6b7280', fontSize: 14, marginBottom: 20 },
  modalInput: { backgroundColor: '#f3f4f6', padding: 15, borderRadius: 12, marginBottom: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
  cancelBtn: { padding: 15 },
  cancelBtnText: { color: '#6b7280', fontWeight: '700' },
  confirmBtn: { backgroundColor: '#ef4444', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  confirmBtnText: { color: '#fff', fontWeight: '700' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6b7280' }
});

export default CatalogTab;