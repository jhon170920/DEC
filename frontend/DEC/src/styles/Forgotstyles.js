import { StyleSheet, Platform } from 'react-native';
import { Colors } from "../constants/colors";

export const styles = StyleSheet.create({

    // --color de fondo--
    safeArea: {
        flex: 1,
        backgroundColor: Colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },

    // -- parte superior  --
    topSection: {
        alignItems: 'center',
        marginBottom: 32,
    },

    // -- logo --
    logoCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
        elevation: 4,
    },
    logo: {
        width: 70,
        height: 70,
        resizeMode: 'contain',
    },
    question: {
        fontSize: 20,
        color: Colors.textMid,
        fontWeight: '500',
    },
    headline: {
        fontWeight: '300',
        color: Colors.text,
        letterSpacing: -0.5,
        marginBottom: 6,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        fontSize: 26,
    },
    headlineAccent: {
        fontStyle: 'italic',
        color: Colors.primary,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    },

    // ── Tarjeta
    card: {
        width: '100%',
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 28,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
        marginBottom: 24,
    },

    // ── Input con borde gradiente
    inputGradientBorder: {
        borderRadius: 12,
        padding: 2,
        marginBottom: 16,
    },
    input: {
        borderRadius: 10,
        padding: 14,
        fontSize: 15,
        color: Colors.text,
        backgroundColor: Colors.surfaceAlt,
        textAlign: 'left',
        
    },

    // ── Botón de enviar
    button: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    buttonGradient: {
        flexDirection: 'row',
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: '100%',
    },
    buttonText: {
        color: Colors.surface,
        fontWeight: 'bold',
        fontSize: 13,
    },

    // ── Mensajes de éxito o error
    messageSuccess: {
        color: Colors.primary,
        textAlign: 'center',
        marginBottom: 12,
        fontSize: 14,
    },
    messageError: {
        color: '#dc2626',
        textAlign: 'center',
        marginBottom: 12,
        fontSize: 13,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 10 : 16,
        left: 16,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});