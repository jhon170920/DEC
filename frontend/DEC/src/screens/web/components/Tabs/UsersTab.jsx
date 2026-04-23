import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Platform, ActivityIndicator, Modal, FlatList
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import ReactDOM from 'react-dom';
import api from '../../../../api/api';

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

  // Modal para mensajes (éxito/error)
  const [messageModal, setMessageModal] = useState({ visible: false, title: '', message: '', isError: false });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const showMessage = (title, message, isError = false) => {
    setMessageModal({ visible: true, title, message, isError });
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
      const csvBlob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(csvBlob);
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

  const handleResetPassword = async (user) => {
    try {
      await api.post('admin/reset-password', { userId: user._id });
      showMessage('Éxito', `Se ha enviado un enlace de restablecimiento a ${user.email}`);
    } catch (err) {
      showMessage('Error', err?.response?.data?.message || 'No se pudo enviar el enlace', true);
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

  const openModal = (type, user) => setModal({ visible: true, type, user });
  const closeModal = () => setModal({ visible: false, type: null, user: null });

  // Filtros
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
      {/* Modal de confirmación (eliminar/inhabilitar) */}
      <ConfirmModal modal={modal} onClose={closeModal} onConfirmDelete={handleDelete} onConfirmBan={handleToggleBan} />

      {/* Modal de mensajes (éxito/error) */}
      <Modal visible={messageModal.visible} transparent animationType="fade" onRequestClose={() => setMessageModal({ ...messageModal, visible: false })}>
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

      {/* Cabecera y resto del contenido igual que antes */}
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
                onResetPassword={() => handleResetPassword(item)}
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

// ------------------------------------------------------------
// UserRow (con modal para roles como ya tienes)
// ------------------------------------------------------------
const UserRow = ({ user, isLast, onViewDetail, onDelete, onToggleBan, onChangeRole, onResetPassword }) => {
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
          <TouchableOpacity style={styles.iconBtn} onPress={onResetPassword}>
            <Feather name="mail" size={15} color="#3b82f6" />
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

      {/* Modal para cambiar rol */}
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

// ------------------------------------------------------------
// UserDetailView (también mostramos mensajes con modal)
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// ConfirmModal (sin cambios, solo mantiene la estructura)
// ------------------------------------------------------------
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

// ===================== ESTILOS =====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 },
  title: { fontSize: 24, fontWeight: '800', color: '#1f2937' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#d1fae5', backgroundColor: '#f0fdf4' },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: '#16a34a' },
  refreshBtn: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#d1fae5', backgroundColor: '#f0fdf4' },
  growthCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  growthTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 150, flexWrap: 'wrap' },
  barItem: { alignItems: 'center', width: 50, marginVertical: 5 },
  barLabel: { fontSize: 10, marginBottom: 6 },
  barBg: { width: 30, height: 100, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: '#16a34a', borderRadius: 4 },
  barValue: { fontSize: 10, marginTop: 4, color: '#6b7280' },
  filterTabs: { flexDirection: 'row', gap: 20, marginBottom: 16, flexWrap: 'wrap' },
  filterGroup: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  filterGroupLabel: { fontSize: 12, fontWeight: '700', color: '#6b7280', marginRight: 4 },
  filterTab: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb' },
  filterTabActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  filterTabText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  filterTabTextActive: { color: '#fff' },
  searchBar: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#e5e7eb', gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#1f2937' },
  tableCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f3f4f6', overflowX: 'auto', marginBottom: 24 },
  tableHeader: { flexDirection: 'row', padding: 14, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  hText: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.5 },
  colUser: { flex: 2, minWidth: 180 },
  colRole: { flex: 1, alignItems: 'center', justifyContent: 'center', minWidth: 100, position: 'relative' },
  colStatus: { flex: 1, alignItems: 'center', justifyContent: 'center', minWidth: 80 },
  colActions: { flex: 1.5, flexDirection: 'row', justifyContent: 'flex-end', gap: 6, minWidth: 140 },
  row: { flexDirection: 'row', padding: 14, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f9fafb', flexWrap: 'wrap' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center' },
  avatarBanned: { backgroundColor: '#fee2e2' },
  avatarText: { fontWeight: '800', color: '#16a34a', fontSize: 15 },
  uName: { fontWeight: '700', color: '#1f2937', fontSize: 14 },
  textMuted: { color: '#9ca3af' },
  uEmail: { fontSize: 12, color: '#6b7280' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#f3f4f6', flexDirection: 'row', alignItems: 'center', gap: 4 },
  roleText: { fontSize: 11, fontWeight: '700', color: '#6b7280' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  dotActive: { backgroundColor: '#16a34a' },
  dotBanned: { backgroundColor: '#ef4444' },
  iconBtn: { padding: 8, borderRadius: 8, backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#f3f4f6' },
  iconBtnRed: { backgroundColor: '#fff5f5', borderColor: '#fecaca' },
  iconBtnOrange: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  iconBtnGreen: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  centerBox: { padding: 40, alignItems: 'center', gap: 12 },
  loadingText: { color: '#6b7280', fontSize: 14 },
  errorText: { color: '#ef4444', fontSize: 14, textAlign: 'center' },
  retryBtn: { backgroundColor: '#16a34a', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700' },
  emptyBox: { padding: 40, alignItems: 'center', gap: 10 },
  emptyText: { color: '#9ca3af', fontSize: 14, textAlign: 'center' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backText: { color: '#16a34a', fontWeight: '600' },
  detailHeaderCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  detailAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center' },
  detailAvatarText: { fontWeight: '800', color: '#16a34a', fontSize: 22 },
  detailTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  detailEmail: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  detailRole: { fontSize: 12, color: '#16a34a', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  modalCard: { backgroundColor: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 420, alignItems: 'center', gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827', textAlign: 'center' },
  modalBody: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8, width: '100%' },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center' },
  cancelText: { fontWeight: '700', color: '#6b7280' },
  confirmBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  confirmBtnRed: { backgroundColor: '#ef4444' },
  confirmBtnOrange: { backgroundColor: '#f59e0b' },
  confirmText: { fontWeight: '700', color: '#fff' },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    flexWrap: 'wrap',
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
  },
  pageButtonDisabled: {
    backgroundColor: '#f3f4f6',
    opacity: 0.6,
  },
  pageButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16a34a',
  },
  pageButtonTextDisabled: {
    color: '#9ca3af',
  },
  pageIndicator: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  roleMenuLocal: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    zIndex: 1000,
    minWidth: 100,
    marginTop: 4,
    ...Platform.select({
      web: { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 }
    })
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleModalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 320,
    ...Platform.select({
      web: { boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }
    })
  },
  roleModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  roleModalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  roleModalOptionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  roleModalCancel: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  roleModalCancelText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  messageModalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    width: '90%',
    maxWidth: 380,
    alignItems: 'center',
    gap: 16,
  },
  errorModalCard: {
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  messageModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
  },
  messageModalBody: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  messageModalButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 8,
  },
  messageModalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default UsersTab;