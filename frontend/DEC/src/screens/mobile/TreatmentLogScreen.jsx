import React, { useState, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import api from '../../api/api';
import {
  View, Text, FlatList, TouchableOpacity, Alert, StatusBar,
  ActivityIndicator, StyleSheet, RefreshControl, Modal, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { getAllTreatmentLogs, deleteTreatmentLog, updateTreatmentLog } from '../../services/dbService';
import ToolTipBubble from '../../components/Tour/ToolTipBubble';

export default function TreatmentLogScreen() {
  const navigation = useNavigation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para modales
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info'); // 'info', 'success', 'error', 'confirm'
  const [modalOnConfirm, setModalOnConfirm] = useState(null);
  const [modalConfirmText, setModalConfirmText] = useState('Aceptar');
  const [modalCancelText, setModalCancelText] = useState('Cancelar');
  const [showCancelButton, setShowCancelButton] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState(null);
  const [pendingUnlink, setPendingUnlink] = useState(null);

  const loadLogs = async () => {
    const data = await getAllTreatmentLogs();
    setLogs(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [])
  );

  // Función para mostrar modales
  const showModal = (title, message, type = 'info', onConfirm = null, confirmText = 'Aceptar', cancelText = 'Cancelar', showCancel = false) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalOnConfirm(() => onConfirm);
    setModalConfirmText(confirmText);
    setModalCancelText(cancelText);
    setShowCancelButton(showCancel);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalOnConfirm(null);
    setPendingDeleteItem(null);
    setPendingUnlink(null);
  };

  const handleModalConfirm = () => {
    if (modalOnConfirm) {
      modalOnConfirm();
    }
    closeModal();
  };

  // Eliminar seguimiento (local y remoto)
  const confirmDelete = async (item) => {
    // Verificar conexión antes de eliminar en la nube
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      showModal('Sin conexión', 'Conéctate a internet para eliminar el seguimiento de forma permanente.', 'error');
      return;
    }

    try {
      // Eliminar en MongoDB si el registro tiene un _id remoto
      if (item._id && item._id.trim() !== '') {
        await api.delete(`treatments/${item._id}`);
        console.log(`✅ Tratamiento remoto ${item._id} eliminado`);
      }
      // Eliminar localmente
      await deleteTreatmentLog(item.id);
      loadLogs(); // Recargar lista
      showModal('Éxito', 'Seguimiento eliminado completamente', 'success');
    } catch (error) {
      console.error(error);
      showModal('Error', 'No se pudo eliminar el seguimiento. Inténtalo de nuevo.', 'error');
    }
  };

  const handleDelete = (item) => {
    setPendingDeleteItem(item);
    showModal(
      'Eliminar seguimiento',
      `¿Eliminar el seguimiento de "${item.disease_name}"?`,
      'confirm',
      () => confirmDelete(item),
      'Eliminar',
      'Cancelar',
      true
    );
  };

  // Desasociar la detección (solo local)
  const confirmRemoveDetection = async (logId, diseaseName) => {
    try {
      const logToUpdate = logs.find(l => l.id === logId);
      if (!logToUpdate) return;
      await updateTreatmentLog(logId, {
        disease_name: diseaseName,
        general_notes: logToUpdate.general_notes || '',
        detection_id: null,
        products: logToUpdate.products || []
      });
      loadLogs();
      showModal('Éxito', 'Detección desasociada correctamente', 'success');
    } catch (error) {
      console.error(error);
      showModal('Error', 'No se pudo desasociar la detección', 'error');
    }
  };

  const handleRemoveDetection = (logId, diseaseName) => {
    setPendingUnlink({ logId, diseaseName });
    showModal(
      'Desasociar detección',
      `¿Eliminar la relación de este seguimiento con la detección asociada?`,
      'confirm',
      () => confirmRemoveDetection(logId, diseaseName),
      'Desasociar',
      'Cancelar',
      true
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TreatmentForm', { logId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.diseaseName}>{item.disease_name}</Text>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Feather name="trash-2" size={20} color="#dc2626" />
        </TouchableOpacity>
      </View>
      <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
      {item.general_notes ? (
        <Text style={styles.notes} numberOfLines={2}>{item.general_notes}</Text>
      ) : null}
      {item.detection_id ? (
        <View style={styles.detectionActions}>
          <TouchableOpacity
            style={styles.linkDetection}
            onPress={() => navigation.navigate('DetectionDetail', { detectionId: item.detection_id })}
          >
            <Feather name="link" size={14} color={Colors.primary} />
            <Text style={styles.linkText}>Ver detección asociada</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.unlinkButton}
            onPress={() => handleRemoveDetection(item.id, item.disease_name)}
          >
            <Feather name="x-circle" size={14} color="#dc2626" />
            <Text style={styles.unlinkText}>Desasociar</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  const getModalIcon = () => {
    switch (modalType) {
      case 'success':
        return <Feather name="check-circle" size={50} color={Colors.primary} style={{ alignSelf: 'center', marginBottom: 10 }} />;
      case 'error':
        return <Feather name="alert-circle" size={50} color="#dc2626" style={{ alignSelf: 'center', marginBottom: 10 }} />;
      case 'confirm':
        return <Feather name="alert-triangle" size={50} color={Colors.warning} style={{ alignSelf: 'center', marginBottom: 10 }} />;
      default:
        return <Feather name="info" size={50} color={Colors.primaryLight} style={{ alignSelf: 'center', marginBottom: 10 }} />;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <LinearGradient colors={['#e8f5ec', '#f4faf5']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Bitácora de cultivo</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TreatmentForm')} style={styles.addBtn}>
          <Feather name="plus" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      {logs.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="clipboard" size={60} color={Colors.textMuted} />
          <Text style={styles.emptyText}>No hay seguimientos registrados</Text>
          <ToolTipBubble
            stepNumber={0} 
            nextStep={'finishScreen'} 
            text="Puedes pulsar aquí para crear un seguimiento personalizado a tu cafetal."
          >
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('TreatmentForm')}>
              <Text style={styles.emptyBtnText}>Crear primer seguimiento</Text>
            </TouchableOpacity>
          </ToolTipBubble>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadLogs} />}
        />
      )}

      {/* Modal personalizado */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {getModalIcon()}
            <Text style={[styles.modalTitle, modalType === 'error' && { color: '#dc2626' }]}>
              {modalTitle}
            </Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
              {showCancelButton && (
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnCancel, { marginRight: 10 }]}
                  onPress={closeModal}
                >
                  <Text style={styles.modalBtnCancelText}>{modalCancelText}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  (modalType === 'error' || modalType === 'confirm') ? styles.modalBtnDanger : styles.modalBtnPrimary,
                  showCancelButton ? { flex: 1 } : null
                ]}
                onPress={handleModalConfirm}
              >
                <Text style={styles.modalBtnText}>{modalConfirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
  },
  backBtn: { padding: 5 },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  addBtn: { padding: 5 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  diseaseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  notes: {
    fontSize: 14,
    color: '#555',
  },
  detectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  linkDetection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
  unlinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unlinkText: {
    fontSize: 11,
    color: '#dc2626',
    marginLeft: 4,
    fontWeight: '500',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { fontSize: 16, color: Colors.textMuted, marginTop: 16, textAlign: 'center' },
  emptyBtn: { marginTop: 20, backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25 },
  emptyBtnText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
      android: { elevation: 5 },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1f2937',
  },
  modalMessage: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  modalBtnPrimary: {
    backgroundColor: Colors.primary,
  },
  modalBtnDanger: {
    backgroundColor: '#dc2626',
  },
  modalBtnCancel: {
    backgroundColor: '#e5e7eb',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalBtnCancelText: {
    color: '#1f2937',
    fontWeight: 'bold',
    fontSize: 16,
  },
});