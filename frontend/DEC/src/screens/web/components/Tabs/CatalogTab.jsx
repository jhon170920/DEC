import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  ScrollView, Image, Platform, Switch, Modal 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const CatalogTab = () => {
  const [selectedPathology, setSelectedPathology] = useState(MOCK_CATALOG[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* MODAL DE NOTIFICACIÓN PUSH */}
      <AlertModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        pathologyName={selectedPathology.name} 
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Catálogo Fitopatológico</Text>
          <Text style={styles.sub}>Base de conocimientos y alertas sanitarias</Text>
        </View>
        
        {/* BOTÓN DE ALERTA RÁPIDA */}
        <TouchableOpacity 
          style={styles.broadcastBtn}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="rss" size={18} color="#fff" />
          <Text style={styles.broadcastBtnText}>Emitir Alerta Push</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainLayout}>
        {/* LISTA IZQUIERDA: Selector de Patologías */}
        <View style={styles.listSide}>
          {MOCK_CATALOG.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.itemCard, selectedPathology?.id === item.id && styles.itemCardActive]}
              onPress={() => { setSelectedPathology(item); setIsEditing(false); }}
            >
              <Text style={[styles.itemTitle, selectedPathology?.id === item.id && styles.activeText]}>
                {item.name}
              </Text>
              <Feather name="chevron-right" size={16} color={selectedPathology?.id === item.id ? '#fff' : '#9ca3af'} />
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

        {/* LADO DERECHO: Editor de Contenido */}
        <View style={styles.editorSide}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.editorHeader}>
              <View>
                <Text style={styles.pathologyTitle}>{selectedPathology.name}</Text>
                <Text style={styles.scientificName}>{selectedPathology.scientificName}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.editBtn, isEditing && styles.saveBtn]} 
                onPress={() => setIsEditing(!isEditing)}
              >
                <Feather name={isEditing ? "check" : "edit-3"} size={18} color="#fff" />
                <Text style={styles.editBtnText}>{isEditing ? "Guardar Cambios" : "Editar Ficha"}</Text>
              </TouchableOpacity>
            </View>

            {/* IMAGEN DE REFERENCIA */}
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedPathology.image }} style={styles.refImage} />
              {isEditing && (
                <TouchableOpacity style={styles.uploadOverlay}>
                  <Feather name="camera" size={24} color="#fff" />
                  <Text style={styles.uploadText}>Cambiar Imagen de Referencia</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* FORMULARIO DE EDICIÓN */}
            <View style={styles.form}>
              <Text style={styles.label}>Descripción de la Afección (Síntomas)</Text>
              <TextInput 
                multiline 
                editable={isEditing}
                style={[styles.input, styles.textArea, isEditing && styles.inputActive]}
                value={selectedPathology.description}
              />

              <Text style={styles.label}>Protocolo de Tratamiento Sugerido</Text>
              <TextInput 
                multiline 
                editable={isEditing}
                style={[styles.input, styles.textArea, isEditing && styles.inputActive]}
                value={selectedPathology.treatment}
              />

              <View style={styles.row}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Estado de Alerta</Text>
                  <View style={styles.switchContainer}>
                    <Text style={[styles.statusText, { color: selectedPathology.alert ? '#ef4444' : '#6b7280' }]}>
                      {selectedPathology.alert ? 'ALTA PRIORIDAD' : 'Normal'}
                    </Text>
                    <Switch 
                      value={selectedPathology.alert} 
                      trackColor={{ false: "#d1d5db", true: "#fca5a5" }}
                      thumbColor={selectedPathology.alert ? "#ef4444" : "#f4f3f4"}
                    />
                  </View>
                </View>
                
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Incidencia en Garzón</Text>
                  <Text style={styles.incidenciaValue}>{selectedPathology.totalDetections} casos</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

/* COMPONENTE INTERNO: Modal de Notificación */
const AlertModal = ({ visible, onClose, pathologyName }) => {
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
          <TextInput placeholder="Ej: Vereda La Jagua, Garzón" style={styles.modalInput} />

          <Text style={styles.label}>Instrucciones para el usuario</Text>
          <TextInput 
            multiline 
            numberOfLines={4}
            placeholder="Ej: Se reporta alta incidencia. Favor intensificar muestreos y cuidados." 
            style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]} 
          />

          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={onClose}>
              <Feather name="send" size={16} color="#fff" />
              <Text style={styles.confirmBtnText}>Enviar Alerta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- DATOS DE EJEMPLO ---
const MOCK_CATALOG = [
  { 
    id: '1', 
    name: 'Roya del Café', 
    scientificName: 'Hemileia vastatrix',
    description: 'Pústulas de color naranja en el envés de las hojas. Provoca defoliación severa.',
    treatment: 'Manejo de sombra, fertilización adecuada y fungicidas cúpricos en periodos de lluvia.',
    image: 'https://images.unsplash.com/photo-1592819695396-064b9570a5d0?q=80&w=500',
    totalDetections: 452,
    alert: true
  },
  { 
    id: '2', 
    name: 'Minador de Hoja', 
    scientificName: 'Leucoptera coffeella',
    description: 'Manchas cafés secas (minas) que reducen la capacidad fotosintética del árbol.',
    treatment: 'Control cultural mediante podas y monitoreo de poblaciones de avispas depredadoras.',
    image: 'https://images.unsplash.com/photo-1521503862181-2cdd007b0555?q=80&w=500',
    totalDetections: 215,
    alert: false
  }
];

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
    ...Platform.select({ web: { cursor: 'pointer' } })
  },
  broadcastBtnText: { color: '#fff', fontWeight: '700' },

  mainLayout: { flexDirection: 'row', gap: 20, flex: 1 },

  /* Lista Izquierda */
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

  /* Lado Derecho */
  editorSide: { 
    flex: 1, 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 30,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    ...Platform.select({ web: { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' } })
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

  /* Modal */
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
  confirmBtnText: { color: '#fff', fontWeight: '700' }
});

export default CatalogTab;