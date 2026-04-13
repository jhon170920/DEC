import React, { useState } from 'react';
import {
View,
Text,
TextInput,
Platform,
TouchableOpacity,
ActivityIndicator,
Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/Forgotstyles';

const API_URL = ''; // colocar la url correspondiente

export default function ForgotPasswordScreen() {
const navigation = useNavigation();
const [email, setEmail] = useState('');
const [isFocused, setIsFocused] = useState(false);
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState(null);

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const handleRecover = async () => {
    if (!email.trim()) {
    setMessage({ type: 'error', text: 'Por favor ingrese su correo electrónico.' });
    return;
    }
    if (!isValidEmail(email)) {
    setMessage({ type: 'error', text: 'El correo ingresado no es válido.' });
    return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await axios.post(`${API_URL}/forgot-password`, { email: email.trim() }); // ── CONECTAR BACKEND AQUÍ ──
        setMessage({ type: 'success', text: '¡Correo enviado! Revisa tu bandeja de entrada.' });
        setEmail('');
      // ── Navegar a ResetPassword ──
        setTimeout(() => {
        navigation.navigate("ResetPassword");
        }, 1500);
    } catch (error) {
        const msg = error.response?.data?.message || 'Ocurrió un error. Inténtalo de nuevo.';
        setMessage({ type: 'error', text: msg });
    } finally {
        setLoading(false);
    }
};

const isDisabled = loading || !email.trim();

return (
    <SafeAreaView style={styles.safeArea}>

      {/* ── Sección superior ── */}
    <View style={styles.topSection}>
        <View style={styles.logoCircle}>
            <Image
            source={require('../../../assets/image/logo.png')} // logo
            style={{ width: 80, height: 80 }}
            resizeMode="contain"
            />
        </View>
        <Text style={styles.headline}>
            ¿Olvidaste tu contraseña?{'\n'}
            <Text style={styles.headlineAccent}>Recupérala</Text>
        </Text>
        </View>

      {/* ── Tarjeta ── */}
        <View style={styles.card}>
        <Text style={styles.cardTitle}>Ingrese el correo de su cuenta</Text>

        {message && (
            <Text style={message.type === 'success' ? styles.messageSuccess : styles.messageError}>
            {message.text}
            </Text>
        )}

        {/* ── Input ── */}
        <LinearGradient
            colors={isFocused ? ['#22c55e', '#16a34a'] : ['#d1d5db', '#d1d5db']}
            style={styles.inputGradientBorder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <TextInput
            style={styles.input}
            placeholder="Ingrese su correo"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={(text) => {
                setEmail(text);
                if (message) setMessage(null);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            />
        </LinearGradient>

        {/* ── Botón ── */}
        <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleRecover}
            disabled={isDisabled}
            activeOpacity={0.8}
        >
            <LinearGradient
            colors={['#22c55e', '#16a34a', '#15803d']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            >
            {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
            ) : (
                <>
                <Ionicons name="camera-outline" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Recuperar Contraseña</Text>
                </>
            )}
            </LinearGradient>
        </TouchableOpacity>

    </View>

    </SafeAreaView>
);
}