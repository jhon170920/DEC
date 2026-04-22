import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  StyleSheet, Text, View, FlatList, Image, SafeAreaView,
  StatusBar, TouchableOpacity, Alert, RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { AuthContext } from "../../context/AuthContext";
import { getAllRemoteDetections } from '../../services/dbService';
import { syncServerToLocal } from '../../services/syncService';
import api from '../../api/api';

// Formatear fecha
const formatSimpleDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);
};

// Componente de tarjeta (ahora con navegación)
const HistoryCard = ({ item, onPress }) => {
  const diseaseName = item.disease_name || item.pathologyId?.name || 'Planta Sana';
  const confidence = item.confidence ?? 0;
  const imageUrl = item.image_url || item.imageUrl;
  const isDiseased = diseaseName !== 'Planta Sana';
  const mainColor = isDiseased ? '#E67E22' : '#27AE60';

  return (
    <TouchableOpacity
      style={[styles.cardContainer, { borderColor: mainColor }]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={{ uri: imageUrl }} resizeMode="cover" />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.dateText}>{formatSimpleDate(item.created_at || item.createdAt)}</Text>
        <Text style={[styles.diseaseName, { color: mainColor }]} numberOfLines={1}>
          {diseaseName}
        </Text>
        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>Precisión: {(confidence * 100).toFixed(0)}%</Text>
        </View>
      </View>
      <View style={styles.arrowContainer}>
        <Text style={[styles.arrow, { color: mainColor }]}>{'>'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>No hay análisis registrados aún.</Text>
  </View>
);

export default function HistoryScreen() {
  const navigation = useNavigation();
  const { userToken } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Cargar datos (online o local)
  const loadData = async () => {
    setLoading(true);
    const netState = await NetInfo.fetch();
    const connected = netState.isConnected;
    setIsOnline(connected);

    if (connected && userToken) {
      try {
        const response = await api.get('detections/history?page=1&limit=100');
        const data = response.data;
        setHistory(data.history);
        // Sincronizar en segundo plano (guardar en SQLite)
        syncServerToLocal(userToken).catch(err => console.warn(err));
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "No se pudo cargar el historial desde el servidor");
        const localData = getAllRemoteDetections();
        setHistory(localData);
      }
    } else {
      const localData = getAllRemoteDetections();
      setHistory(localData);
    }
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isOnline && userToken) {
      await syncServerToLocal(userToken);
    }
    await loadData();
    setRefreshing(false);
  }, [isOnline, userToken]);

  // Al presionar una tarjeta, navegar al detalle
  const handlePressItem = (item) => {
    navigation.navigate('DetectionDetail', { detection: item });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Escuchar cambios de conectividad
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      loadData();
    });
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.mainHeader}>Mis análisis</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => (
          <HistoryCard item={item} onPress={handlePressItem} />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee' }} />}
        ListEmptyComponent={EmptyState}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  mainHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1C1E',
    textAlign: 'center',
    marginVertical: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 16,
    borderWidth: 2,
    padding: 15,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E1E4E8',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
    paddingLeft: 15,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  diseaseName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  confidenceBadge: {
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  arrowContainer: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#7F8C8D',
    fontSize: 16,
  },
});