import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    StyleSheet,
    Image,
    Alert,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Colors } from "../../constants/colors";
import { ResetPasswordStyles as styles } from "../../styles/ResetPasswordstyles";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { changePasswordWithCode } from "../../api/api";

export default function ResetPassword() {
    const navigation = useNavigation();
    const route = useRoute();
    const { email } = route.params || {};
    
    const { sp, hPad, logoRingS, logoImgS, headlineS, sublineS, fieldH, btnH, iconS } = useResponsiveLayout();
    
    const [loading, setLoading] = useState(false);
    
    // Código de 6 dígitos
    const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
    const inputs = useRef([]);
    
    // Contraseñas
    const [passNueva, setPassNueva] = useState("");
    const [passConfirmar, setPassConfirmar] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    useEffect(() => {
        if (!email) {
            Alert.alert("Error", "No se encontró el correo. Por favor, solicita nuevamente la recuperación.");
            navigation.navigate("ForgotPassword");
        }
    }, []);
    
    const handleCodigo = (text, index) => {
        const nuevo = [...codigo];
        nuevo[index] = text;
        setCodigo(nuevo);
        if (text && index < 5) {
            inputs.current[index + 1].focus();
        }
    };
    
    const handleBackspace = (key, index) => {
        if (key === "Backspace" && !codigo[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };
    
    const handleActualizar = async () => {
        const codeCompleto = codigo.join("");
        
        // Validaciones
        if (codeCompleto.length !== 6) {
            Alert.alert("Error", "Ingresa el código de 6 dígitos");
            return;
        }
        
        if (!passNueva.trim()) {
            Alert.alert("Error", "Ingresa una nueva contraseña");
            return;
        }
        
        if (passNueva.length < 6) {
            Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
            return;
        }
        
        if (passNueva !== passConfirmar) {
            Alert.alert("Error", "Las contraseñas no coinciden");
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await changePasswordWithCode(email, codeCompleto, passNueva);
            Alert.alert(
                "¡Éxito!", 
                response.message || "Contraseña actualizada correctamente",
                [
                    {
                        text: "Ir al login",
                        onPress: () => navigation.navigate("Login")
                    }
                ]
            );
        } catch (error) {
            const msg = error.message || "Error al restablecer la contraseña";
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
            
            <LinearGradient
                colors={["#e8f5ec", "#f4faf5", "#f4faf5"]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            
            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingHorizontal: hPad }]}
                showsVerticalScrollIndicator={false}
            >
                {/* LOGO */}
                <View style={[styles.logoWrap, {
                    width: logoRingS,
                    height: logoRingS,
                    borderRadius: logoRingS / 2,
                    marginBottom: sp(0.03),
                }]}>
                    <Image
                        source={require("../../../assets/image/logo.png")}
                        style={{ width: logoImgS, height: logoImgS, resizeMode: "contain" }}
                    />
                </View>
                
                {/* TÍTULO */}
                <Text style={[styles.title, { fontSize: headlineS }]}>
                    Restablecer contraseña
                </Text>
                <Text style={[styles.subtitle, { fontSize: sublineS, marginBottom: sp(0.04) }]}>
                    Ingresa el código enviado a {email || "tu correo"}
                </Text>
                
                {/* CARD */}
                <View style={styles.card}>
                    
                    {/* Código 6 dígitos */}
                    <Text style={[styles.label, { fontSize: sublineS }]}>Código de verificación</Text>
                    <View style={styles.codeRow}>
                        {codigo.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={ref => inputs.current[index] = ref}
                                style={[styles.codeInput, digit && styles.codeInputFilled]}
                                value={digit}
                                onChangeText={text => handleCodigo(text.slice(-1), index)}
                                onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                textAlign="center"
                                editable={!loading}
                            />
                        ))}
                    </View>
                    
                    {/* Nueva contraseña */}
                    <Text style={[styles.label, { fontSize: sublineS }]}>Nueva Contraseña</Text>
                    <View style={[styles.inputWrap, { height: fieldH }]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nueva Contraseña"
                            placeholderTextColor={Colors.textMuted}
                            value={passNueva}
                            onChangeText={setPassNueva}
                            secureTextEntry={!showPass}
                            editable={!loading}
                        />
                        <TouchableOpacity onPress={() => setShowPass(v => !v)} disabled={loading}>
                            <Feather name={showPass ? "eye" : "eye-off"} size={iconS} color={Colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Confirmar contraseña */}
                    <Text style={[styles.label, { fontSize: sublineS }]}>Confirmar Nueva Contraseña</Text>
                    <View style={[styles.inputWrap, { height: fieldH }]}>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirme Contraseña"
                            placeholderTextColor={Colors.textMuted}
                            value={passConfirmar}
                            onChangeText={setPassConfirmar}
                            secureTextEntry={!showConfirm}
                            editable={!loading}
                        />
                        <TouchableOpacity onPress={() => setShowConfirm(v => !v)} disabled={loading}>
                            <Feather name={showConfirm ? "eye" : "eye-off"} size={iconS} color={Colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Botón actualizar */}
                    <TouchableOpacity 
                        style={[styles.btnActualizar, loading && { opacity: 0.7 }]} 
                        activeOpacity={0.85} 
                        onPress={handleActualizar}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={["#22c55e", "#16a34a", "#15803d"]}
                            style={[styles.btnGradient, { height: btnH }]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Feather name="key" size={iconS} color="#fff" />
                                    <Text style={styles.btnText}>Actualizar Contraseña</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                    
                </View>
            </ScrollView>
        </View>
    );
}