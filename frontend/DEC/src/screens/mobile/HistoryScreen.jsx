import React, {
    useState, useEffect, useRef, useContext
} from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
    TouchableOpacity,
    Alert
} from 'react-native';
import axios from 'axios'
import { AuthContext } from "../../context/AuthContext";

// función para formatear la fecha y mostrarla asi: 20 de Marzo de 2026
// dateString es el string que recibimos de monguito
const formatSimpleDate = (dateString) => {
    if (!dateString) return ''; // si no pues ni monda

    const date = new Date(dateString);
    // elegimos la forma en la que lo vamos a regresar
    return new Intl.DateTimeFormat('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
};

// componente de la Card
const HistoryCard = ({ item }) => {
    const isDiseased = item.pathologyId.name !== ''; // vemos si hay nombre de enfermedad o no, como en he visto que en el mongo, la deteccion sana tien nombre como "sana", pues aca podemos poner la condicion de que si no es sana pues es enferma
    const mainColor = isDiseased ? '#E67E22' : '#27AE60'; // Naranja o Verde dependiendo si hay o no hay enfermedad

    return (
        <TouchableOpacity style={[styles.cardContainer, { borderColor: mainColor }]}>

            {/* IMAGEN CUADRADA (100x100) */}
            <View style={styles.imageContainer}>
                <Image style={styles.image}
                    source={{ uri: item.imageUrl }}
                    resizeMode="cover" // Cover asegura que llene el cuadrado sin estirarse
                />
            </View>

            {/* CONTENIDO DE DETALLES */}
            <View style={styles.detailsContainer}>
                {/* le pasamos el string de la fecha de mongo y la formateamos */}
                <Text style={styles.dateText}>{formatSimpleDate(item.createdAt)}</Text>
                
                <Text style={[styles.diseaseName, { color: mainColor }]} numberOfLines={1}>
                    {/* miramos si hay nombre de enfermedad en la deteccion */}
                    {item.pathologyId?.name || 'Planta Sana'}
                </Text>

                <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>
                        {/* tomamos la confidence o la precision  y la mostramos en forma de porcentajw */}
                        Precisión: {(item.confidence * 100).toFixed(0)}%
                    </Text>
                </View>
            </View>

            {/* ICONO DE FLECHA */}
            <View style={styles.arrowContainer}>
                <Text style={[styles.arrow, { color: mainColor }]}>{'>'}</Text>
            </View>

        </TouchableOpacity>
    );
};
// esto se verá si no hay nada en los análsis
const EmptyState = () => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay análisis registrados aún.</Text>
    </View>
);
const PaginationFooter = ({ page, setPage, hasMore, loading }) => {
    return (
        <View style={styles.footerContainer}>
            {/* Botón Anterior: Se apaga si estás en la página 1 */}
            <TouchableOpacity
                onPress={() => setPage(page - 1)}
                disabled={page === 1 || loading}
                style={[styles.pageButton, (page === 1 || loading) && styles.disabledButton]}
            >
                <Text style={styles.buttonText}>Anterior</Text>
            </TouchableOpacity>

            <Text style={styles.pageText}>Página {page}</Text>

            {/* Botón Siguiente: Se apaga si el servidor dijo que ya NO hay más */}
            <TouchableOpacity
                onPress={() => setPage(page + 1)}
                disabled={!hasMore || loading}
                style={[styles.pageButton, (!hasMore || loading) && styles.disabledButton]}
            >
                <Text style={styles.buttonText}>Siguiente</Text>
            </TouchableOpacity>
        </View>
    );
};

// 4. Componente Principal
export default function App() {
    const { userToken } = useContext(AuthContext);

    const [history, setHistory] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);

    const limit = 4; // 2 de prueba por ahpra


    const getUserHistory = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`http://10.4.1.148:8089/api/detections/history?page=${page}&limit=${limit}`,
                {
                    headers: { 'Authorization': `Bearer ${userToken}` }
                }
            )
            console.log(response.data)
            setHistory(response.data.history)
            setHasMore(response.data.hasMore);
        } catch (error) {

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getUserHistory()
    }, [page])
    return (
        <SafeAreaView style={styles.mainContainer}>
            <StatusBar barStyle="dark-content" />
            <Text style={styles.mainHeader}>Mis análisis</Text>

            <FlatList
                data={history}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <HistoryCard item={item} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false} // Limpia la interfaz, no muestra la barrita de scroll
                ListEmptyComponent={() => <EmptyState />}
                ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee' }} />}
                ListFooterComponent={
                    <PaginationFooter
                        page={page}
                        setPage={setPage}
                        hasMore={hasMore}
                        loading={loading}
                    />
                }
            />
        </SafeAreaView>
    );
}

// 5. Estilos
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
        alignItems: 'center', // Alinea todo verticalmente al centro
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    imageContainer: {
        width: 100, // Ancho fijo para el cuadrado
        height: 100, // Alto fijo para el cuadrado
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#E1E4E8',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    detailsContainer: {
        flex: 1, // Ocupa todo el espacio restante
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
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        marginTop: 10,
    },
    pageButton: {
        backgroundColor: '#27AE60',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        minWidth: 100,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#BDC3C7',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    pageIndicator: {
        paddingHorizontal: 15,
    },
    pageNumberText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1C1E',
    },
});