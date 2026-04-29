import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Image, Platform, Switch, Modal, ActivityIndicator, Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../../../api/api';
import { Linking } from 'react-native';
import { catalogTabStyles as styles} from '../styles/catalogTabStyles';

const CatalogTab = () => {
  const [pathologies, setPathologies] = useState([]);
  const [selectedPathology, setSelectedPathology] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detectionsCount, setDetectionsCount] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Estado para insumos mientras se edita
  const [recommendations, setRecommendations] = useState([]);

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
        setRecommendations(pathologiesData[0].recommendations || []);
      }
      const detections = resDet.data.detections || [];
      const counts = {};
      detections.forEach(d => {
        const pid = d.pathologyId?._id || d.pathologyId;
        if (pid) counts[pid] = (counts[pid] || 0) + 1;
      });
      setDetectionsCount(counts);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => { fetchData(); }, [fetchData]);

  // Guardar cambios de la patología (incluyendo insumos)
  const handleSave = async () => {
    if (!selectedPathology) return;
    setSaving(true);
    try {
      const { _id, name, description, treatment, alert } = selectedPathology;
      await api.put(`admin/edit-pathology/${_id}`, {
        name, description, treatment, alert, recommendations
      });
      // Actualizar lista local
      const updatedPathology = { ...selectedPathology, recommendations };
      setPathologies(prev => prev.map(p => p._id === _id ? updatedPathology : p));
      setSelectedPathology(updatedPathology);
      setIsEditing(false);
      Alert.alert('Éxito', 'Patología actualizada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  // Cambiar alerta
  const toggleAlert = async (value) => {
    if (!selectedPathology) return;
    const updated = { ...selectedPathology, alert: value };
    setSelectedPathology(updated);
    try {
      await api.put(`admin/edit-pathology/${updated._id}`, {
        name: updated.name, description: updated.description,
        treatment: updated.treatment, alert: updated.alert, recommendations
      });
      setPathologies(prev => prev.map(p => p._id === updated._id ? updated : p));
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el estado de alerta');
      setSelectedPathology(prev => ({ ...prev, alert: !value }));
    }
  };

  // Subir imagen
const pickImage = async () => {
  // Solicitar permisos
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
    base64: false
  });

  if (!result.canceled) {
    setUploadingImage(true);
    const asset = result.assets[0];
    
    try {
      let fileToSend;
      
      if (Platform.OS === 'web') {
        // En web: convertir la URI a Blob usando fetch
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const filename = asset.uri.split('/').pop() || 'image.jpg';
        fileToSend = new File([blob], filename, { type: blob.type });
      } else {
        // En móvil: usar el objeto con uri, name, type
        const filename = asset.uri.split('/').pop();
        const extension = filename?.split('.').pop() || 'jpg';
        const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
        fileToSend = {
          uri: asset.uri,
          name: `patologia_${Date.now()}.${extension}`,
          type: mimeType,
        };
      }
      
      const formData = new FormData();
      formData.append('image', fileToSend);
      
      const res = await api.post(`admin/upload-pathology-image/${selectedPathology._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const updated = { ...selectedPathology, imageUrl: res.data.imageUrl };
      setSelectedPathology(updated);
      setPathologies(prev => prev.map(p => p._id === updated._id ? updated : p));
      Alert.alert('Éxito', 'Imagen actualizada correctamente');
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      Alert.alert('Error', error.response?.data?.message || 'No se pudo subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  }
};

  // Gestión de insumos
  const addRecommendation = () => {
    setRecommendations([
      ...recommendations,
      { productName: '', dose: '', price: '', supplier: '', link: '' }
    ]);
  };

  const updateRecommendation = (index, field, value) => {
    const updated = [...recommendations];
    updated[index][field] = value;
    setRecommendations(updated);
  };

  const removeRecommendation = (index) => {
    const updated = [...recommendations];
    updated.splice(index, 1);
    setRecommendations(updated);
  };

  // Enviar alerta push
  const handleSendAlert = async (location, message) => {
    try {
      await api.post('/admin/create', {
        title: `🚨 Alerta: ${selectedPathology.name}`,
        body: `${message}\n📍 Ubicación: ${location}`,
        type: 'alert',
        pathologyId: selectedPathology._id,
        location: location,
        targetRoles: ['user', 'tecnico']
      });
      Alert.alert('Alerta creada', 'Notificación guardada y estar disponible para los usuarios en su proxima sincronizacion');
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'No se crear la notificacion');
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
        <TouchableOpacity style={styles.broadcastBtn} onPress={() => setModalVisible(true)}>
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
              onPress={() => {
                setSelectedPathology(item);
                setRecommendations(item.recommendations || []);
                setIsEditing(false);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                ) : (
                  <View style={styles.itemImagePlaceholder}>
                    <Feather name="image" size={16} color="#9ca3af" />
                  </View>
                )}
                <Text style={[styles.itemTitle, selectedPathology?._id === item._id && styles.activeText]}>
                  {item.name}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={selectedPathology?._id === item._id ? '#fff' : '#9ca3af'} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Lado derecho: editor */}
        <View style={styles.editorSide}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.editorHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pathologyTitle}>{selectedPathology.name}</Text>
                <Text style={styles.scientificName}>
                  {selectedPathology.scientificName || 'Nombre científico no registrado'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.editBtn, isEditing && styles.saveBtn]}
                onPress={isEditing ? handleSave : () => setIsEditing(true)}
                disabled={saving}
              >
                <Feather name={isEditing ? "check" : "edit-3"} size={18} color="#fff" />
                <Text style={styles.editBtnText}>
                  {isEditing ? (saving ? 'Guardando...' : 'Guardar') : "Editar Ficha"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Imagen */}
            <View style={styles.imageContainer}>
              {selectedPathology.imageUrl ? (
                <Image source={{ uri: selectedPathology.imageUrl }} style={styles.refImage} />
              ) : (
                <View style={[styles.refImage, styles.noImage]}>
                  <Feather name="image" size={48} color="#d1d5db" />
                  <Text style={styles.noImageText}>Sin imagen</Text>
                </View>
              )}
              {isEditing && (
                <TouchableOpacity style={styles.uploadOverlay} onPress={pickImage} disabled={uploadingImage}>
                  {uploadingImage ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Feather name="camera" size={24} color="#fff" />
                      <Text style={styles.uploadText}>
                        {selectedPathology.imageUrl ? 'Cambiar imagen' : 'Subir imagen'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Formulario */}
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

              {/* Insumos recomendados */}
              <View style={styles.recommendationsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.label}>Insumos recomendados</Text>
                  {isEditing && (
                    <TouchableOpacity onPress={addRecommendation} style={styles.addBtn}>
                      <Feather name="plus" size={16} color="#16a34a" />
                      <Text style={styles.addBtnText}>Agregar</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {recommendations.map((rec, idx) => (
                  <View key={idx} style={styles.recommendationCard}>
                    {isEditing ? (
                      <>
                        <View style={styles.recommendationRow}>
                          <TextInput
                            style={[styles.input, styles.recommendationInput]}
                            placeholder="Producto"
                            value={rec.productName}
                            onChangeText={(v) => updateRecommendation(idx, 'productName', v)}
                          />
                          <TextInput
                            style={[styles.input, styles.recommendationInputSmall]}
                            placeholder="Dosis"
                            value={rec.dose}
                            onChangeText={(v) => updateRecommendation(idx, 'dose', v)}
                          />
                        </View>
                        <View style={styles.recommendationRow}>
                          <TextInput
                            style={[styles.input, styles.recommendationInput]}
                            placeholder="Precio"
                            value={rec.price}
                            onChangeText={(v) => updateRecommendation(idx, 'price', v)}
                          />
                          <TextInput
                            style={[styles.input, styles.recommendationInput]}
                            placeholder="Proveedor"
                            value={rec.supplier}
                            onChangeText={(v) => updateRecommendation(idx, 'supplier', v)}
                          />
                        </View>
                        <TouchableOpacity onPress={() => removeRecommendation(idx)} style={styles.removeBtn}>
                          <Feather name="trash-2" size={14} color="#ef4444" />
                          <Text style={styles.removeBtnText}>Eliminar</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View>
                        <Text style={styles.recommendationProduct}>{rec.productName}</Text>
                        <Text style={styles.recommendationDetail}>Dosis: {rec.dose}</Text>
                        {rec.price && <Text style={styles.recommendationDetail}>Precio: {rec.price}</Text>}
                        {rec.supplier && <Text style={styles.recommendationDetail}>Proveedor: {rec.supplier}</Text>}
                        {rec.link && (
                          <TouchableOpacity onPress={() => Linking.openURL(rec.link)}>
                            <Text style={styles.linkText}>Ver producto</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                ))}
                {!isEditing && recommendations.length === 0 && (
                  <Text style={styles.noDataText}>No hay insumos registrados</Text>
                )}
              </View>

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

// Modal de alerta (sin cambios)
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

export default CatalogTab;