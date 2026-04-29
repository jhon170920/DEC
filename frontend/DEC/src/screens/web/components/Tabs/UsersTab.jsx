import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity,
  TextInput, ActivityIndicator, Modal, FlatList
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../../../api/api';
import { usersTabStyles as styles} from '../styles/usersTabStyles';

const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modal, setModal] = useState({ visible: false, type: null, user: null });
  const [growthData, setGrowthData] = useState([]);
  const [showGrowthChart, setShowGrowthChart] = useState(false);
  const [messageModal, setMessageModal] = useState({ visible: false, title: '', message: '', isError: false });
  const [emailModal, setEmailModal] = useState({ visible: false, user: null, subject: '', message: '', sending: false });
  const [messagesModal, setMessagesModal] = useState({
    visible: false,
    userId: null,
    userName: '',
    messages: [],
    loading: false
  }); // Nuevo estado para el modal de mensajes

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const showMessage = (title, message, isError = false) => {
    setMessageModal({ visible: true, title, message, isError });
  };

  // Obtener mensajes de un usuario
  const fetchUserMessages = async (userId, userName) => {
    setMessagesModal({
      visible: true,
      userId,
      userName,
      messages: [],
      loading: true
    });
    try {
      const res = await api.get(`messages/user/${userId}`);
      setMessagesModal(prev => ({
        ...prev,
        messages: res.data,
        loading: false
      }));
    } catch (err) {
      showMessage('Error', 'No se pudieron cargar los mensajes', true);
      setMessagesModal(prev => ({ ...prev, visible: false, loading: false }));
    }
  };

  // Eliminar un mensaje
  const deleteUserMessage = async (messageId) => {
    try {
      await api.delete(`messages/${messageId}`);
      setMessagesModal(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m._id !== messageId)
      }));
      showMessage('Éxito', 'Mensaje eliminado');
    } catch (err) {
      showMessage('Error', 'No se pudo eliminar el mensaje', true);
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('admin/get-users');
      setUsers(res.data.users);
      setFiltered(res.data.users);
      calculateGrowth(res.data.users);
    } catch (err) {
      setError(err?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const calculateGrowth = (usersList) => {
    const months = {};
    usersList.forEach(user => {
      const date = new Date(user.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      months[key] = (months[key] || 0) + 1;
    });
    const sorted = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]));
    const labels = sorted.map(([key]) => {
      const [year, month] = key.split('-');
      const date = new Date(year, month - 1);
      return date.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
    });
    const values = sorted.map(([, count]) => count);
    setGrowthData({ labels, values });
  };

  const exportToCSV = async () => {
    try {
      const headers = ['ID', 'Nombre', 'Email', 'Rol', 'Estado', 'Fecha registro', 'Último acceso'];
      const rows = filtered.map(u => [
        u._id,
        u.name,
        u.email,
        u.role || 'user',
        u.active !== false ? 'Activo' : 'Inhabilitado',
        new Date(u.createdAt).toLocaleDateString(),
        u.lastSync ? new Date(u.lastSync).toLocaleDateString() : '—'
      ]);
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `usuarios_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showMessage('Éxito', 'Archivo CSV exportado correctamente');
    } catch (err) {
      showMessage('Error', 'No se pudo exportar el archivo', true);
    }
  };

  const handleChangeRole = async (user, newRole) => {
    try {
      await api.patch(`admin/change-role/${user._id}`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u));
      showMessage('Éxito', `Rol cambiado a ${newRole}`);
    } catch (err) {
      showMessage('Error', err?.response?.data?.message || 'No se pudo cambiar el rol', true);
    }
  };

  const handleDelete = async (user) => {
    try {
      await api.delete(`admin/delete-user/${user._id}`);
      setUsers(prev => prev.filter(u => u._id !== user._id));
      closeModal();
      showMessage('Éxito', `Usuario ${user.name} eliminado`);
    } catch (err) {
      showMessage('Error', err?.response?.data?.message || 'Error al eliminar', true);
    }
  };

  const handleToggleBan = async (user) => {
    try {
      const res = await api.patch(`admin/toggle-ban/${user._id}`);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, active: res.data.active } : u));
      closeModal();
      showMessage('Éxito', user.active === false ? 'Usuario habilitado' : 'Usuario inhabilitado');
    } catch (err) {
      showMessage('Error', err?.response?.data?.message || 'Error al cambiar estado', true);
    }
  };

  const sendEmailToUser = async () => {
    const { user, subject, message } = emailModal;
    if (!subject.trim() || !message.trim()) {
      showMessage('Campos incompletos', 'Debes escribir asunto y mensaje', true);
      return;
    }
    setEmailModal(prev => ({ ...prev, sending: true }));
    try {
      await api.post('admin/send-email', {
        subject,
        message,
        emails: [user.email]
      });
      showMessage('Correo enviado', `Se ha enviado un correo a ${user.email}`);
      setEmailModal({ visible: false, user: null, subject: '', message: '', sending: false });
    } catch (err) {
      showMessage('Error', err.response?.data?.message || 'No se pudo enviar el correo', true);
      setEmailModal(prev => ({ ...prev, sending: false }));
    }
  };

  const openModal = (type, user) => setModal({ visible: true, type, user });
  const closeModal = () => setModal({ visible: false, type: null, user: null });

  useEffect(() => {
    const q = search.toLowerCase();
    let result = users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' ? true : statusFilter === 'banned' ? u.active === false : u.active !== false;
      return matchSearch && matchRole && matchStatus;
    });
    setFiltered(result);
    setCurrentPage(1);
  }, [search, roleFilter, statusFilter, users]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedUsers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (selectedUser) {
    return <UserDetailView user={selectedUser} onBack={() => setSelectedUser(null)} showMessage={showMessage} />;
  }

  return (
    <View style={styles.container}>
      <ConfirmModal modal={modal} onClose={closeModal} onConfirmDelete={handleDelete} onConfirmBan={handleToggleBan} />

      <Modal visible={messageModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.messageModalCard, messageModal.isError && styles.errorModalCard]}>
            <Feather name={messageModal.isError ? 'alert-triangle' : 'check-circle'} size={40} color={messageModal.isError ? '#ef4444' : '#16a34a'} />
            <Text style={styles.messageModalTitle}>{messageModal.title}</Text>
            <Text style={styles.messageModalBody}>{messageModal.message}</Text>
            <TouchableOpacity style={styles.messageModalButton} onPress={() => setMessageModal({ ...messageModal, visible: false })}>
              <Text style={styles.messageModalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={emailModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.emailModalCard}>
            <Text style={styles.modalTitle}>Enviar correo a {emailModal.user?.name}</Text>
            <TextInput
              style={styles.input}
              placeholder="Asunto"
              value={emailModal.subject}
              onChangeText={(text) => setEmailModal(prev => ({ ...prev, subject: text }))}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mensaje"
              multiline
              numberOfLines={5}
              value={emailModal.message}
              onChangeText={(text) => setEmailModal(prev => ({ ...prev, message: text }))}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEmailModal({ visible: false, user: null, subject: '', message: '', sending: false })} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={sendEmailToUser} disabled={emailModal.sending} style={[styles.confirmBtn, { backgroundColor: '#16a34a' }]}>
                {emailModal.sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Enviar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de mensajes de usuario */}
      <Modal visible={messagesModal.visible} animationType="slide" onRequestClose={() => setMessagesModal(prev => ({ ...prev, visible: false }))}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Mensajes de {messagesModal.userName}</Text>
            <TouchableOpacity onPress={() => setMessagesModal(prev => ({ ...prev, visible: false }))}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {messagesModal.loading ? (
            <ActivityIndicator size="large" color="#16a34a" />
          ) : messagesModal.messages.length === 0 ? (
            <Text style={styles.noMessages}>No hay mensajes</Text>
          ) : (
            <FlatList
              data={messagesModal.messages}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.messageCard}>
                  <Text style={styles.messageDate}>{new Date(item.createdAt).toLocaleString()}</Text>
                  <Text style={styles.messageText}>{item.message}</Text>
                  <TouchableOpacity onPress={() => deleteUserMessage(item._id)} style={styles.deleteMsgBtn}>
                    <Feather name="trash-2" size={18} color="#dc2626" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </Modal>

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Gestión de Usuarios</Text>
          <Text style={styles.subtitle}>{users.length} usuarios registrados</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={exportToCSV}>
            <Feather name="download" size={16} color="#16a34a" />
            <Text style={styles.actionBtnText}>Exportar CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowGrowthChart(!showGrowthChart)}>
            <Feather name="bar-chart-2" size={16} color="#16a34a" />
            <Text style={styles.actionBtnText}>Crecimiento</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchUsers}>
            <Feather name="refresh-cw" size={16} color="#16a34a" />
          </TouchableOpacity>
        </View>
      </View>

      {showGrowthChart && growthData.labels && growthData.labels.length > 0 && (
        <View style={styles.growthCard}>
          <Text style={styles.growthTitle}>Crecimiento de usuarios por mes</Text>
          <View style={styles.chartContainer}>
            {growthData.labels.map((label, idx) => (
              <View key={idx} style={styles.barItem}>
                <Text style={styles.barLabel}>{label}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { height: `${Math.min((growthData.values[idx] / Math.max(...growthData.values)) * 100, 100)}%` }]} />
                </View>
                <Text style={styles.barValue}>{growthData.values[idx]}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.filterTabs}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupLabel}>Rol:</Text>
          {['all', 'user', 'admin', 'tecnico'].map(role => (
            <TouchableOpacity key={role} style={[styles.filterTab, roleFilter === role && styles.filterTabActive]} onPress={() => setRoleFilter(role)}>
              <Text style={[styles.filterTabText, roleFilter === role && styles.filterTabTextActive]}>
                {role === 'all' ? 'Todos' : role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.filterGroup}>
          <Text style={styles.filterGroupLabel}>Estado:</Text>
          {['all', 'active', 'banned'].map(status => (
            <TouchableOpacity key={status} style={[styles.filterTab, statusFilter === status && styles.filterTabActive]} onPress={() => setStatusFilter(status)}>
              <Text style={[styles.filterTabText, statusFilter === status && styles.filterTabTextActive]}>
                {status === 'all' ? 'Todos' : status === 'active' ? 'Activos' : 'Inhabilitados'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.searchBar}>
        <Feather name="search" size={18} color="#9ca3af" />
        <TextInput placeholder="Buscar por nombre o correo..." style={styles.searchInput} value={search} onChangeText={setSearch} placeholderTextColor="#9ca3af" />
        {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Feather name="x" size={16} color="#9ca3af" /></TouchableOpacity>}
      </View>

      {loading && <View style={styles.centerBox}><ActivityIndicator size="large" color="#16a34a" /><Text style={styles.loadingText}>Cargando...</Text></View>}
      {!loading && error && <View style={styles.centerBox}><Feather name="alert-circle" size={40} color="#ef4444" /><Text style={styles.errorText}>{error}</Text><TouchableOpacity style={styles.retryBtn} onPress={fetchUsers}><Text style={styles.retryText}>Reintentar</Text></TouchableOpacity></View>}

      {!loading && !error && (
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.hText, styles.colUser]}>USUARIO</Text>
            <Text style={[styles.hText, styles.colRole, { textAlign: 'center' }]}>ROL</Text>
            <Text style={[styles.hText, styles.colStatus, { textAlign: 'center' }]}>ESTADO</Text>
            <Text style={[styles.hText, styles.colActions, { textAlign: 'right' }]}>ACCIONES</Text>
          </View>

          <FlatList
            data={paginatedUsers}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <UserRow
                user={item}
                isLast={index === paginatedUsers.length - 1}
                onViewDetail={() => setSelectedUser(item)}
                onDelete={() => openModal('delete', item)}
                onToggleBan={() => openModal('ban', item)}
                onChangeRole={(role) => handleChangeRole(item, role)}
                onSendEmail={() => setEmailModal({ visible: true, user: item, subject: '', message: '', sending: false })}
                onViewMessages={() => fetchUserMessages(item._id, item.name)}
              />
            )}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Feather name="users" size={32} color="#d1d5db" />
                <Text style={styles.emptyText}>No se encontraron usuarios</Text>
              </View>
            }
          />

          {filtered.length > itemsPerPage && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]} onPress={goToPrevPage} disabled={currentPage === 1}>
                <Feather name="chevron-left" size={18} color={currentPage === 1 ? '#cbd5e1' : '#16a34a'} />
                <Text style={[styles.pageButtonText, currentPage === 1 && styles.pageButtonTextDisabled]}>Anterior</Text>
              </TouchableOpacity>
              <Text style={styles.pageIndicator}>Página {currentPage} de {totalPages}</Text>
              <TouchableOpacity style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]} onPress={goToNextPage} disabled={currentPage === totalPages}>
                <Text style={[styles.pageButtonText, currentPage === totalPages && styles.pageButtonTextDisabled]}>Siguiente</Text>
                <Feather name="chevron-right" size={18} color={currentPage === totalPages ? '#cbd5e1' : '#16a34a'} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// ===================== UserRow modificado =====================
const UserRow = ({ user, isLast, onViewDetail, onDelete, onToggleBan, onChangeRole, onSendEmail, onViewMessages }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const isBanned = user.active === false;
  const isAdmin = user.role === 'admin';
  const options = ['user', 'tecnico', 'admin'].filter(r => r !== user.role);

  return (
    <>
      <View style={[styles.row, isLast && { borderBottomWidth: 0 }]}>
        <View style={styles.colUser}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[styles.avatar, isBanned && styles.avatarBanned]}>
              <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={[styles.uName, isBanned && styles.textMuted]}>{user.name}</Text>
              <Text style={styles.uEmail}>{user.email}</Text>
            </View>
          </View>
        </View>
        <View style={styles.colRole}>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role || 'user'}</Text>
            <Feather name="chevron-down" size={12} color="#6b7280" />
          </TouchableOpacity>
        </View>
        <View style={styles.colStatus}>
          <View style={[styles.statusDot, isBanned ? styles.dotBanned : styles.dotActive]} />
        </View>
        <View style={styles.colActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={onViewDetail}>
            <Feather name="eye" size={15} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={onSendEmail}>
            <Feather name="mail" size={15} color="#3b82f6" />
          </TouchableOpacity>
          {/* Botón para ver mensajes del usuario */}
          <TouchableOpacity style={styles.iconBtn} onPress={onViewMessages}>
            <Feather name="message-circle" size={15} color="#3b82f6" />
          </TouchableOpacity>
          {!isAdmin && (
            <TouchableOpacity style={[styles.iconBtn, isBanned ? styles.iconBtnGreen : styles.iconBtnOrange]} onPress={onToggleBan}>
              <Feather name={isBanned ? 'unlock' : 'lock'} size={15} color={isBanned ? '#16a34a' : '#f59e0b'} />
            </TouchableOpacity>
          )}
          {!isAdmin && (
            <TouchableOpacity style={[styles.iconBtn, styles.iconBtnRed]} onPress={onDelete}>
              <Feather name="trash-2" size={15} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View style={styles.roleModalCard}>
            <Text style={styles.roleModalTitle}>Cambiar rol de {user.name}</Text>
            {options.map(role => (
              <TouchableOpacity
                key={role}
                style={styles.roleModalOption}
                onPress={() => {
                  onChangeRole(role);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.roleModalOptionText}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.roleModalCancel} onPress={() => setModalVisible(false)}>
              <Text style={styles.roleModalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// ===================== UserDetailView =====================
const UserDetailView = ({ user, onBack, showMessage }) => {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDetections = async () => {
      try {
        const res = await api.get('admin/get-detections');
        const userDetections = res.data.detections.filter(d => d.userId === user._id || d.userId?._id === user._id);
        setDetections(userDetections);
      } catch (err) { setDetections([]); } finally { setLoading(false); }
    };
    fetchDetections();
  }, [user._id]);
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Feather name="arrow-left" size={20} color="#16a34a" />
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
      <View style={styles.detailHeaderCard}>
        <View style={styles.detailAvatar}>
          <Text style={styles.detailAvatarText}>{user.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.detailTitle}>{user.name}</Text>
          <Text style={styles.detailEmail}>{user.email}</Text>
          <Text style={styles.detailRole}>Rol: {user.role || 'user'}</Text>
        </View>
      </View>
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={[styles.hText, { flex: 2 }]}>FECHA</Text>
          <Text style={[styles.hText, { flex: 1 }]}>AFECCIÓN</Text>
          <Text style={[styles.hText, { flex: 1, textAlign: 'right' }]}>CONFIANZA</Text>
        </View>
        {loading ? <ActivityIndicator /> : detections.length === 0 ? <Text style={styles.emptyText}>Sin detecciones</Text> : detections.map(d => (
          <View key={d._id} style={styles.row}>
            <Text style={{ flex: 2 }}>{new Date(d.createdAt).toLocaleDateString()}</Text>
            <Text style={{ flex: 1 }}>{d.pathologyId?.name || '—'}</Text>
            <Text style={{ flex: 1, textAlign: 'right' }}>{Math.round((d.confidence || 0) * 100)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// ===================== ConfirmModal =====================
const ConfirmModal = ({ modal, onClose, onConfirmDelete, onConfirmBan }) => {
  if (!modal.visible || !modal.user) return null;
  const isDelete = modal.type === 'delete';
  const isBanned = modal.user?.active === false;
  return (
    <Modal transparent animationType="fade" visible={modal.visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Feather name={isDelete ? 'trash-2' : (isBanned ? 'unlock' : 'lock')} size={28} color={isDelete ? '#ef4444' : '#f59e0b'} />
          <Text style={styles.modalTitle}>{isDelete ? 'Eliminar usuario' : (isBanned ? 'Habilitar' : 'Inhabilitar')}</Text>
          <Text style={styles.modalBody}>{isDelete ? `¿Eliminar a ${modal.user.name}?` : (isBanned ? `Habilitar a ${modal.user.name}` : `Inhabilitar a ${modal.user.name}`)}</Text>
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity onPress={isDelete ? onConfirmDelete : onConfirmBan} style={[styles.confirmBtn, isDelete ? styles.confirmBtnRed : styles.confirmBtnOrange]}>
              <Text style={styles.confirmText}>{isDelete ? 'Eliminar' : (isBanned ? 'Habilitar' : 'Inhabilitar')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default UsersTab;