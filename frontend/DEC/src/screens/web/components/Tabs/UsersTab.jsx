import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  TextInput, ScrollView, Platform 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const UsersTab = () => {
  const [selectedUser, setSelectedUser] = useState(null); // Para ver el detalle

  return (
    <View style={styles.container}>
      {/* Si no hay usuario seleccionado, vemos la lista global */}
      {!selectedUser ? (
        <View style={styles.listView}>
          <View style={styles.header}>
            <Text style={styles.title}>Monitoreo de Aprendices</Text>
          </View>

          <View style={styles.searchBar}>
            <Feather name="search" size={18} color="#9ca3af" />
            <TextInput placeholder="Buscar aprendiz..." style={styles.searchInput} />
          </View>

          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <View style={{ flex: 2 }}>
                <Text style={styles.hText}>USUARIO</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={styles.hText}>DETECCIONES</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.hText}>ACCIÓN</Text>
              </View>
            </View>

            {/* Ejemplo de fila de usuario */}
            <UserRow 
              name="Juan Diego Posada" 
              email="juan.diego@sena.edu.co" 
              count={45} 
              onViewDetail={() => setSelectedUser({ name: "Juan Diego Posada" })} 
            />
            <UserRow 
              name="Anyi Tatiana" 
              email="anyi.t@sena.edu.co" 
              count={28} 
              onViewDetail={() => setSelectedUser({ name: "Anyi Tatiana" })} 
            />
          </View>
        </View>
      ) : (
        /* VISTA DE DETALLE FILTRABLE */
        <View style={styles.detailView}>
          <TouchableOpacity onPress={() => setSelectedUser(null)} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color="#16a34a" />
            <Text style={styles.backText}>Volver a la lista</Text>
          </TouchableOpacity>

          <View style={styles.userDetailHeader}>
            <Text style={styles.detailTitle}>{selectedUser.name}</Text>
            <Text style={styles.detailSub}>Historial detallado de detecciones</Text>
          </View>

          {/* BARRA DE FILTROS ESPECÍFICOS */}
          <View style={styles.filterCard}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Afección</Text>
              <View style={styles.pickerFake}>
                <Text>Roya</Text> 
                <Feather name="chevron-down" size={14} />
              </View>
            </View>
            
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Rango de Fechas</Text>
              <View style={styles.dateRangeRow}>
                <TextInput placeholder="DD/MM/AAAA" style={styles.dateInputSmall} />
                <Text style={{color: '#9ca3af'}}>-</Text>
                <TextInput placeholder="DD/MM/AAAA" style={styles.dateInputSmall} />
              </View>
            </View>

            <TouchableOpacity style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>Filtrar</Text>
            </TouchableOpacity>
          </View>

          {/* LISTA DE DETECCIONES FILTRADAS */}
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.hText}>FECHA Y HORA</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.hText}>AFECCIÓN</Text>
              </View>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.hText}>UBICACIÓN</Text>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={styles.hText}>CONFIANZA</Text>
              </View>
            </View>
            
            <DetectionDetailRow date="12/04/2026 - 08:30" type="Roya" zone="Garzón - Vereda Central" acc="98.2%" />
            <DetectionDetailRow date="11/04/2026 - 15:45" type="Minador" zone="Garzón - Sector Norte" acc="94.5%" />
          </View>
        </View>
      )}
    </View>
  );
};

// Componente para la fila del usuario principal
const UserRow = ({ name, email, count, onViewDetail }) => (
  <View style={styles.row}>
    <View style={{ flex: 2 }}>
      <Text style={styles.uName}>{name}</Text>
      <Text style={styles.uEmail}>{email}</Text>
    </View>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
    <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
      <TouchableOpacity style={styles.detailBtn} onPress={onViewDetail}>
        <Text style={styles.detailBtnText}>Ver Historial</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Componente para el detalle de cada detección
const DetectionDetailRow = ({ date, type, zone, acc }) => (
  <View style={styles.row}>
    <View style={{ flex: 1.5 }}>
      <Text style={styles.cellText}>{date}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.typeTag, type === 'Roya' ? styles.tagRoya : styles.tagMinador]}>{type}</Text>
    </View>
    <View style={{ flex: 1.5 }}>
      <Text style={styles.cellText}>{zone}</Text>
    </View>
    <View style={{ flex: 1, alignItems: 'flex-end' }}>
      <Text style={[styles.cellText, { color: '#16a34a', fontWeight: '700' }]}>{acc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800', color: '#1f2937', marginBottom: 20 },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  searchInput: { marginLeft: 10, flex: 1 },
  tableCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  hText: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.5 },
  row: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb'
  },
  uName: { fontWeight: '700', color: '#1f2937' },
  uEmail: { fontSize: 12, color: '#6b7280' },
  countBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8
  },
  countText: { color: '#16a34a', fontWeight: '800' },
  detailBtn: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  detailBtnText: { color: '#16a34a', fontWeight: '600', fontSize: 13 },
  
  // Estilos de Detalle
  detailView: { flex: 1 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 20 },
  backText: { color: '#16a34a', fontWeight: '600' },
  detailTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  detailSub: { color: '#6b7280', marginBottom: 25 },
  
  filterCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    gap: 20,
    marginBottom: 20,
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  filterGroup: { flex: 1 },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8 },
  pickerFake: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8
  },
  dateRangeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateInputSmall: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 12
  },
  applyBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  applyBtnText: { color: '#fff', fontWeight: '700' },
  cellText: { fontSize: 13, color: '#4b5563' },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '700',
    alignSelf: 'flex-start',
  },
  tagRoya: { backgroundColor: '#fef3c7', color: '#92400e' },
  tagMinador: { backgroundColor: '#e0f2fe', color: '#075985' }
});

export default UsersTab;