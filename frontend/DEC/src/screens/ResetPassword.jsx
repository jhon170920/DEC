import React, { useState, useRef } from "react";
import {
View,
Text,
TextInput,
TouchableOpacity,
StatusBar,
ScrollView,
StyleSheet,
Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../constants/colors";
import { ResetPasswordStyles as styles } from "../styles/ResetPasswordstyles";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";

export default function ResetPassword() {
const navigation = useNavigation();
const { sp, hPad, logoRingS, logoImgS, headlineS, sublineS, fieldH, btnH, iconS } = useResponsiveLayout();

  // ── CÓDIGO DE 6 DÍGITOS ──
const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
const inputs = useRef([]);

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

  // ── CONTRASEÑAS ──
const [passNueva, setPassNueva] = useState("");
const [passConfirmar, setPassConfirmar] = useState("");
const [showPass, setShowPass] = useState(false);
const [showConfirm, setShowConfirm] = useState(false);

const handleActualizar = () => {
    // ── CONECTAR BACKEND AQUÍ ──
    // codigo.join("") → código de verificación
    // passNueva → nueva contraseña
    // passConfirmar → confirmar contraseña
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

        {/* ── LOGO ── */}
        <View style={[styles.logoWrap, {
            width: logoRingS,
            height: logoRingS,
            borderRadius: logoRingS / 2,
            marginBottom: sp(0.03),
        }]}>
        <Image
            source={require("../../assets/image/logo.png")}
            style={{ width: logoImgS, height: logoImgS, resizeMode: "contain" }}
        />
        </View>

        {/* ── TÍTULO ── */}
        <Text style={[styles.title, { fontSize: headlineS }]}>
        Ingrese el código de verificación
        </Text>
        <Text style={[styles.subtitle, { fontSize: sublineS, marginBottom: sp(0.04) }]}>
        Le hemos enviado un código a su correo
        </Text>

        {/* ── CARD ── */}
        <View style={styles.card}>

          {/* Código 6 dígitos */}
        <Text style={[styles.label, { fontSize: sublineS }]}>Código de 6 dígitos</Text>
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
            />
            <TouchableOpacity onPress={() => setShowPass(v => !v)}>
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
            />
            <TouchableOpacity onPress={() => setShowConfirm(v => !v)}>
                <Feather name={showConfirm ? "eye" : "eye-off"} size={iconS} color={Colors.textMuted} />
            </TouchableOpacity>
            </View>

          {/* Botón actualizar */}
        <TouchableOpacity style={styles.btnActualizar} activeOpacity={0.85} onPress={handleActualizar}>
            <LinearGradient
            colors={["#22c55e", "#16a34a", "#15803d"]}
            style={[styles.btnGradient, { height: btnH }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            >
            <Feather name="key" size={iconS} color="#fff" />
            <Text style={styles.btnText}>Actualizar Contraseña</Text>
            </LinearGradient>
        </TouchableOpacity>

        </View>

    </ScrollView>
    </View>
);
}