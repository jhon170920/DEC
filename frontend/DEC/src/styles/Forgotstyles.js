// styles/ForgotStyles.js
import { StyleSheet } from "react-native";
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
    highlight: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.primary,
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

    // ── Input 
    input: {
        borderWidth: 2,
        borderColor: Colors.border,
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        color: Colors.text,
        backgroundColor: Colors.surfaceAlt,
        marginBottom: 16,
        textAlign: 'center',
    },
    inputFocused: {
        borderColor: Colors.borderFocus,  
    },

    // ── Boton de enviar 
    button: {
        flexDirection: 'row',
        backgroundColor: Colors.primary,
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    buttonDisabled: {
        backgroundColor: Colors.textMuted,
    },
    buttonText: {
        color: Colors.surface,
        fontWeight: 'bold',
        fontSize: 13,
    },

    // ── Mensaje de acceder o error
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
});