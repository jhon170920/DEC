import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Platform, ActivityIndicator, Modal, ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../../../../api/api';

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'banned'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Modal de confirmación
  const [modal, setModal] = useState({ visible: false, type: null, user: null });

  // ── Cargar usuarios ──────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('admin/get-users');
      setUsers(res.data.users);
      setFiltered(res.data.users);
    } catch (err) {
      setError(err?.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Búsqueda + filtro de estado ──────────────
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        const matchStatus =
          statusFilter === 'all'    ? true :
          statusFilter === 'banned' ? u.active === false :
          u.active !== false;
        return matchSearch && matchStatus;
      })
    );
  }, [search, statusFilter, users]);

  // ── Eliminar usuario ────────────────────────
  const handleDelete = async (user) => {
    try {
      await api.delete(`admin/delete-user/${user._id}`);
      setUsers(prev => prev.filter(u => u._id !== user._id));
      closeModal();
    } catch (err) {
      alert(err?.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  // ── Ban / Unban ──────────────────────────────
  const handleToggleBan = async (user) => {
    try {
      const res = await api.patch(`admin/toggle-ban/${user._id}`);
      setUsers(prev =>
        prev.map(u => u._id === user._id ? { ...u, active: res.data.active } : u)
      );
      closeModal();
    } catch (err) {
      alert(err?.response?.data?.message || 'Error al cambiar estado del usuario');
    }
  };

  const openModal = (type, user) => setModal({ visible: true, type, user });
  const closeModal = () => setModal({ visible: false, type: null, user: null });

  // ── Historial del usuario ────────────────────
  if (selectedUser) {
    return (
      <UserDetailView
        user={selectedUser}
        onBack={() => setSelectedUser(null)}
        onDelete={() => openModal('delete', selectedUser)}
        onToggleBan={() => openModal('ban', selectedUser)}
      />
    );
  }

  // ── Lista de usuarios ────────────────────────
  return (
    <View style={styles.container}>
      <ConfirmModal
        modal={modal}
        onClose={closeModal}
        onConfirmDelete={() => handleDelete(modal.user)}
        onConfirmBan={() => handleToggleBan(modal.user)}
      />

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Gestión de Usuarios</Text>
          <Text style={styles.subtitle}>{users.length} usuarios registrados</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchUsers}>
          <Feather name="refresh-cw" size={16} color="#16a34a" />
        </TouchableOpacity>
      </View>

      {/* Tabs de filtro por estado */}
      <View style={styles.filterTabs}>
        {[
          { key: 'all',    label: 'Todos',        count: users.length },
          { key: 'active', label: 'Activos',       count: users.filter(u => u.active !== false).length },
          { key: 'banned', label: 'Inhabilitados', count: users.filter(u => u.active === false).length },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterTab, statusFilter === tab.key && styles.filterTabActive]}
            onPress={() => setStatusFilter(tab.key)}
          >
            <Text style={[styles.filterTabText, statusFilter === tab.key && styles.filterTabTextActive]}>
              {tab.label}
            </Text>
            <View style={[
              styles.filterTabBadge,
              statusFilter === tab.key && styles.filterTabBadgeActive,
              tab.key === 'banned' && tab.count > 0 && statusFilter !== 'banned' && styles.filterTabBadgeBanned,
            ]}>
              <Text style={[
                styles.filterTabBadgeText,
                statusFilter === tab.key && styles.filterTabBadgeTextActive,
                tab.key === 'banned' && tab.count > 0 && statusFilter !== 'banned' && styles.filterTabBadgeTextBanned,
              ]}>
                {tab.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchBar}>
        <Feather name="search" size={18} color="#9ca3af" />
        <TextInput
          placeholder="Buscar por nombre o correo..."
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9ca3af"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={16} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Estado de carga / error */}
      {loading && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      )}
      {!loading && error && (
        <View style={styles.centerBox}>
          <Feather name="alert-circle" size={40} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchUsers}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tabla */}
      {!loading && !error && (
        <View style={styles.tableCard}>
          {/* Encabezado */}
          <View style={styles.tableHeader}>
            <View style={{ flex: 2.5 }}><Text style={styles.hText}>USUARIO</Text></View>
            <View style={{ flex: 1, alignItems: 'center' }}><Text style={styles.hText}>ROL</Text></View>
            <View style={{ flex: 1, alignItems: 'center' }}><Text style={styles.hText}>ESTADO</Text></View>
            <View style={{ flex: 1.5, alignItems: 'flex-end' }}><Text style={styles.hText}>ACCIONES</Text></View>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Feather name="users" size={32} color="#d1d5db" />
              <Text style={styles.emptyText}>No se encontraron usuarios</Text>
            </View>
          ) : (
            filtered.map((user, idx) => (
              <UserRow
                key={user._id}
                user={user}
                isLast={idx === filtered.length - 1}
                onViewDetail={() => setSelectedUser(user)}
                onDelete={() => openModal('delete', user)}
                onToggleBan={() => openModal('ban', user)}
              />
            ))
          )}
        </View>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────
// FILA DE USUARIO
// ─────────────────────────────────────────────
const UserRow = ({ user, isLast, onViewDetail, onDelete, onToggleBan }) => {
  const isBanned = user.active === false;
  const isAdmin = user.role === 'admin';

  return (
    <View style={[styles.row, isLast && { borderBottomWidth: 0 }]}>
      {/* Info */}
      <View style={{ flex: 2.5 }}>
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

      {/* Rol */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={[styles.roleBadge, isAdmin && styles.roleBadgeAdmin]}>
          <Text style={[styles.roleText, isAdmin && styles.roleTextAdmin]}>
            {user.role || 'user'}
          </Text>
        </View>
      </View>

      {/* Estado */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={[styles.statusDot, isBanned ? styles.dotBanned : styles.dotActive]} />
      </View>

      {/* Acciones */}
      <View style={{ flex: 1.5, flexDirection: 'row', justifyContent: 'flex-end', gap: 6, alignItems: 'center' }}>
        {/* Ver historial */}
        <TouchableOpacity style={styles.iconBtn} onPress={onViewDetail} title="Ver historial">
          <Feather name="eye" size={15} color="#6b7280" />
        </TouchableOpacity>

        {/* Ban / Unban — no aplica para admins */}
        {!isAdmin && (
          <TouchableOpacity
            style={[styles.iconBtn, isBanned ? styles.iconBtnGreen : styles.iconBtnOrange]}
            onPress={onToggleBan}
          >
            <Feather name={isBanned ? 'unlock' : 'lock'} size={15} color={isBanned ? '#16a34a' : '#f59e0b'} />
          </TouchableOpacity>
        )}

        {/* Eliminar — no aplica para admins */}
        {!isAdmin && (
          <TouchableOpacity style={[styles.iconBtn, styles.iconBtnRed]} onPress={onDelete}>
            <Feather name="trash-2" size={15} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────
// VISTA DE DETALLE / HISTORIAL
// ─────────────────────────────────────────────
const UserDetailView = ({ user, onBack, onDelete, onToggleBan }) => {
  const [allDetections, setAllDetections] = useState([]);      // datos originales sin filtrar
  const [filteredDetections, setFilteredDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ pathology: '', startDate: '', endDate: '' });

  // Cargar todas las detecciones del usuario (backend no filtra, lo haremos local)
  const fetchDetections = async () => {
    setLoading(true);
    try {
      // Se puede pasar userId como query param, pero el backend lo ignora.
      // Obtenemos todas las detecciones y luego filtramos por userId en cliente.
      const res = await api.get('admin/get-detections');
      // Filtramos las que pertenecen a este usuario
      const userDetections = res.data.detections.filter(d => 
        d.userId === user._id || d.userId?._id === user._id
      );
      setAllDetections(userDetections);
    } catch (err) {
      console.error(err);
      setAllDetections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDetections(); }, [user._id]);

  // Aplicar filtros locales cada vez que cambien allDetections o filters
  useEffect(() => {
    let filtered = [...allDetections];

    // 1. Filtro por nombre de afección (búsqueda parcial, insensible a mayúsculas)
    if (filters.pathology.trim() !== '') {
      const searchTerm = filters.pathology.toLowerCase().trim();
      filtered = filtered.filter(d => 
        d.pathologyId?.name?.toLowerCase().includes(searchTerm)
      );
    }

    // 2. Filtro por fecha de inicio (startDate)
    if (filters.startDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(d => new Date(d.createdAt) >= start);
    }

    // 3. Filtro por fecha de fin (endDate)
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(d => new Date(d.createdAt) <= end);
    }

    setFilteredDetections(filtered);
  }, [allDetections, filters]);

  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilters({ pathology: '', startDate: '', endDate: '' });
  };

  const isBanned = user.active === false;

  return (
    <View style={styles.container}>
      {/* Header de detalle */}
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Feather name="arrow-left" size={20} color="#16a34a" />
        <Text style={styles.backText}>Volver a la lista</Text>
      </TouchableOpacity>

      <View style={styles.detailHeaderCard}>
        <View style={styles.detailAvatar}>
          <Text style={styles.detailAvatarText}>{user.name?.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.detailTitle}>{user.name}</Text>
          <Text style={styles.detailEmail}>{user.email}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
            <View style={[styles.roleBadge, user.role === 'admin' && styles.roleBadgeAdmin]}>
              <Text style={[styles.roleText, user.role === 'admin' && styles.roleTextAdmin]}>
                {user.role || 'user'}
              </Text>
            </View>
            <View style={[styles.statusBadge, isBanned ? styles.statusBanned : styles.statusActive]}>
              <Text style={[styles.statusBadgeText, isBanned ? styles.statusBannedText : styles.statusActiveText]}>
                {isBanned ? 'Inhabilitado' : 'Activo'}
              </Text>
            </View>
          </View>
        </View>

        {/* Acciones rápidas */}
        <View style={{ gap: 8 }}>
          <TouchableOpacity
            style={[styles.actionBtn, isBanned ? styles.actionBtnGreen : styles.actionBtnOrange]}
            onPress={onToggleBan}
          >
            <Feather name={isBanned ? 'unlock' : 'lock'} size={14} color="#fff" />
            <Text style={styles.actionBtnText}>{isBanned ? 'Habilitar' : 'Inhabilitar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.actionBtnRed]} onPress={onDelete}>
            <Feather name="trash-2" size={14} color="#fff" />
            <Text style={styles.actionBtnText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filterCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.filterLabel}>Afección (nombre)</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="Ej: Roya, Minador..."
            value={filters.pathology}
            onChangeText={v => setFilters(f => ({ ...f, pathology: v }))}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.filterLabel}>Fecha inicio</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="YYYY-MM-DD"
            value={filters.startDate}
            onChangeText={v => setFilters(f => ({ ...f, startDate: v }))}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.filterLabel}>Fecha fin</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="YYYY-MM-DD"
            value={filters.endDate}
            onChangeText={v => setFilters(f => ({ ...f, endDate: v }))}
          />
        </View>
        <TouchableOpacity style={styles.applyBtn} onPress={clearFilters}>
          <Feather name="x" size={14} color="#fff" />
          <Text style={styles.applyBtnText}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      {/* Tabla de detecciones */}
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <View style={{ flex: 1.8 }}><Text style={styles.hText}>FECHA Y HORA</Text></View>
          <View style={{ flex: 1 }}><Text style={styles.hText}>AFECCIÓN</Text></View>
          <View style={{ flex: 1.5 }}><Text style={styles.hText}>UBICACIÓN</Text></View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}><Text style={styles.hText}>CONFIANZA</Text></View>
        </View>

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator color="#16a34a" />
          </View>
        ) : filteredDetections.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="camera-off" size={32} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {allDetections.length === 0 
                ? 'Sin detecciones registradas' 
                : 'No hay coincidencias con los filtros aplicados'}
            </Text>
          </View>
        ) : (
          filteredDetections.map((d, i) => (
            <DetectionDetailRow
              key={d._id || i}
              date={new Date(d.createdAt).toLocaleString('es-CO')}
              type={d.pathologyId?.name || '—'}
              coords={d.location?.coordinates}
              confidence={d.confidence}
              isLast={i === filteredDetections.length - 1}
            />
          ))
        )}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────
// FILA DE DETECCIÓN EN DETALLE
// ─────────────────────────────────────────────
const DetectionDetailRow = ({ date, type, coords, confidence, isLast }) => {
  const pct = confidence != null ? `${(confidence * 100).toFixed(1)}%` : '—';
  const location = coords?.length === 2
    ? `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`
    : '—';

  const tagStyle = type === 'Roya' ? styles.tagRoya
    : type === 'Minador' ? styles.tagMinador
    : styles.tagDefault;

  return (
    <View style={[styles.row, isLast && { borderBottomWidth: 0 }]}>
      <View style={{ flex: 1.8 }}><Text style={styles.cellText}>{date}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.typeTag, tagStyle]}>{type}</Text>
      </View>
      <View style={{ flex: 1.5 }}><Text style={styles.cellText}>{location}</Text></View>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <Text style={[styles.cellText, { color: '#16a34a', fontWeight: '700' }]}>{pct}</Text>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────
// MODAL DE CONFIRMACIÓN
// ─────────────────────────────────────────────
const ConfirmModal = ({ modal, onClose, onConfirmDelete, onConfirmBan }) => {
  if (!modal.visible || !modal.user) return null;
  const isDelete = modal.type === 'delete';
  const isBanned = modal.user?.active === false;

  return (
    <Modal transparent animationType="fade" visible={modal.visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={[styles.modalIconCircle, isDelete ? styles.modalIconRed : styles.modalIconOrange]}>
            <Feather
              name={isDelete ? 'trash-2' : isBanned ? 'unlock' : 'lock'}
              size={28}
              color={isDelete ? '#ef4444' : '#f59e0b'}
            />
          </View>
          <Text style={styles.modalTitle}>
            {isDelete
              ? '¿Eliminar usuario?'
              : isBanned ? '¿Habilitar usuario?' : '¿Inhabilitar usuario?'}
          </Text>
          <Text style={styles.modalBody}>
            {isDelete
              ? `Esta acción eliminará permanentemente la cuenta de "${modal.user.name}". No se puede deshacer.`
              : isBanned
                ? `Se habilitará la cuenta de "${modal.user.name}" y podrá volver a acceder.`
                : `Se inhabilitará la cuenta de "${modal.user.name}". No podrá iniciar sesión hasta que sea habilitado.`}
          </Text>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, isDelete ? styles.confirmBtnRed : styles.confirmBtnOrange]}
              onPress={isDelete ? onConfirmDelete : onConfirmBan}
            >
              <Text style={styles.confirmText}>
                {isDelete ? 'Eliminar' : isBanned ? 'Habilitar' : 'Inhabilitar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────
// ESTILOS
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1f2937' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  refreshBtn: {
    padding: 10, borderRadius: 10,
    borderWidth: 1, borderColor: '#d1fae5', backgroundColor: '#f0fdf4'
  },

  filterTabs: {
    flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap'
  },
  filterTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb'
  },
  filterTabActive: {
    backgroundColor: '#16a34a', borderColor: '#16a34a'
  },
  filterTabText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  filterTabTextActive: { color: '#fff' },
  filterTabBadge: {
    paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: 6, backgroundColor: '#f3f4f6'
  },
  filterTabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  filterTabBadgeBanned: { backgroundColor: '#fee2e2' },
  filterTabBadgeText: { fontSize: 11, fontWeight: '700', color: '#6b7280' },
  filterTabBadgeTextActive: { color: '#fff' },
  filterTabBadgeTextBanned: { color: '#ef4444' },

  searchBar: {
    flexDirection: 'row', backgroundColor: '#fff', padding: 12,
    borderRadius: 12, alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: '#e5e7eb', gap: 8
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1f2937' },

  // Tabla
  tableCard: {
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden', marginBottom: 24
  },
  tableHeader: {
    flexDirection: 'row', padding: 14,
    backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#f3f4f6'
  },
  hText: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.5 },
  row: {
    flexDirection: 'row', padding: 14, alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#f9fafb'
  },

  // Avatar
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center'
  },
  avatarBanned: { backgroundColor: '#fee2e2' },
  avatarText: { fontWeight: '800', color: '#16a34a', fontSize: 15 },

  uName: { fontWeight: '700', color: '#1f2937', fontSize: 14 },
  textMuted: { color: '#9ca3af' },
  uEmail: { fontSize: 12, color: '#6b7280' },

  // Badges
  roleBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6, backgroundColor: '#f3f4f6', alignSelf: 'flex-start'
  },
  roleBadgeAdmin: { backgroundColor: '#ede9fe' },
  roleText: { fontSize: 11, fontWeight: '700', color: '#6b7280' },
  roleTextAdmin: { color: '#7c3aed' },

  statusDot: { width: 10, height: 10, borderRadius: 5 },
  dotActive: { backgroundColor: '#16a34a' },
  dotBanned: { backgroundColor: '#ef4444' },

  statusBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6, alignSelf: 'flex-start'
  },
  statusActive: { backgroundColor: '#dcfce7' },
  statusBanned: { backgroundColor: '#fee2e2' },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  statusActiveText: { color: '#16a34a' },
  statusBannedText: { color: '#ef4444' },

  // Botones de icono en tabla
  iconBtn: {
    padding: 8, borderRadius: 8,
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#f3f4f6'
  },
  iconBtnRed: { backgroundColor: '#fff5f5', borderColor: '#fecaca' },
  iconBtnOrange: { backgroundColor: '#fffbeb', borderColor: '#fde68a' },
  iconBtnGreen: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },

  // Estados vacíos / carga
  centerBox: { padding: 40, alignItems: 'center', gap: 12 },
  loadingText: { color: '#6b7280', fontSize: 14 },
  errorText: { color: '#ef4444', fontSize: 14, textAlign: 'center' },
  retryBtn: {
    backgroundColor: '#16a34a', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8
  },
  retryText: { color: '#fff', fontWeight: '700' },
  emptyBox: { padding: 40, alignItems: 'center', gap: 10 },
  emptyText: { color: '#9ca3af', fontSize: 14 },

  // Detalle
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backText: { color: '#16a34a', fontWeight: '600' },

  detailHeaderCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#fff', padding: 20, borderRadius: 16,
    marginBottom: 20, borderWidth: 1, borderColor: '#e5e7eb'
  },
  detailAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#dcfce7', justifyContent: 'center', alignItems: 'center'
  },
  detailAvatarText: { fontWeight: '800', color: '#16a34a', fontSize: 22 },
  detailTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  detailEmail: { fontSize: 13, color: '#6b7280', marginTop: 2 },

  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  actionBtnGreen: { backgroundColor: '#16a34a' },
  actionBtnOrange: { backgroundColor: '#f59e0b' },
  actionBtnRed: { backgroundColor: '#ef4444' },

  // Filtros
  filterCard: {
    flexDirection: 'row', backgroundColor: '#fff',
    padding: 16, borderRadius: 16, gap: 12, marginBottom: 20,
    alignItems: 'flex-end', borderWidth: 1, borderColor: '#e5e7eb', flexWrap: 'wrap'
  },
  filterLabel: { fontSize: 11, fontWeight: '700', color: '#374151', marginBottom: 6 },
  filterInput: {
    padding: 9, borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 8, fontSize: 13, color: '#1f2937'
  },
  applyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#16a34a', paddingVertical: 10,
    paddingHorizontal: 16, borderRadius: 8
  },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Detecciones
  cellText: { fontSize: 13, color: '#4b5563' },
  typeTag: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4,
    fontSize: 11, fontWeight: '700', alignSelf: 'flex-start'
  },
  tagRoya: { backgroundColor: '#fef3c7', color: '#92400e' },
  tagMinador: { backgroundColor: '#e0f2fe', color: '#075985' },
  tagDefault: { backgroundColor: '#f3f4f6', color: '#6b7280' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 30
  },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: 32, width: '100%', maxWidth: 420, alignItems: 'center', gap: 12
  },
  modalIconCircle: {
    width: 70, height: 70, borderRadius: 35,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8
  },
  modalIconRed: { backgroundColor: '#fee2e2' },
  modalIconOrange: { backgroundColor: '#fef3c7' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827', textAlign: 'center' },
  modalBody: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8, width: '100%' },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: 10,
    borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center'
  },
  cancelText: { fontWeight: '700', color: '#6b7280' },
  confirmBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  confirmBtnRed: { backgroundColor: '#ef4444' },
  confirmBtnOrange: { backgroundColor: '#f59e0b' },
  confirmText: { fontWeight: '700', color: '#fff' },
});

export default UsersTab;