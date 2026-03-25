import React from "react";
import {
View,
Text,
Image,
TouchableOpacity,
StatusBar,
ScrollView,
StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../constants/colors";
import { ResultStyles as styles } from "../styles/ResultStyles";

export default function Result() {
const navigation = useNavigation();

  // ── CONECTAR IA AQUÍ ──
const imagenResultado = "";
const saludable = true;
const nombrePlanta = "";
const nombreCientifico = "";
const descripcion = "";

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
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        >

        {/* ── HEADER ── */}
        <View style={styles.header}>
            <Image
            source={require("../../assets/image/logo.png")}
            style={styles.logo}
            />
            <TouchableOpacity style={styles.avatarInner}>
            <Feather name="user" size={20} color={Colors.primary} />
            </TouchableOpacity>
        </View>

        {/* ── SECCION ── */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>RESULTADO</Text>
            <View style={styles.sectionLine} />
        </View>

        {/* ── IMAGEN ── */}
        <View style={styles.imageCard}>
            <Image
            source={{ uri: imagenResultado }}
            style={styles.image}
            />
        </View>

        {/* ── TÍTULO ── */}
        <Text style={styles.analysisTitle}>
            Análisis: <Text style={styles.analysisAccent}>{nombrePlanta}</Text>
        </Text>

        {/* ── BADGE ── */}
        <View style={[styles.badge, !saludable && styles.badgeDanger]}>
            <Feather
            name={saludable ? "check-square" : "x-square"}
            size={16}
            color={saludable ? Colors.primary : "#f97316"}
            />
            <Text style={[styles.badgeText, !saludable && styles.badgeTextDanger]}>
                {saludable ? "Saludable" : "No saludable"}
            </Text>
        </View>

        {/* ── CARDS INFO ── */}
        <View style={styles.menuList}>

            <TouchableOpacity style={styles.menuCard} activeOpacity={0.75} onPress={() => {}}>
            <View style={styles.menuIconWrap}>
                <Feather name="search" size={24} color={Colors.primary} />
            </View>
            <View style={styles.menuTexts}>
                <Text style={styles.menuTitle}>Nombre Científico:</Text>
                <Text style={styles.menuSub}>{nombreCientifico}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuCard} activeOpacity={0.75} onPress={() => {}}>
            <View style={styles.menuIconWrap}>
                <Feather name="book-open" size={24} color={Colors.primary} />
            </View>
            <View style={styles.menuTexts}>
                <Text style={styles.menuTitle}>Descripción</Text>
                <Text style={styles.menuSub}>{descripcion}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={Colors.textMuted} />
            </TouchableOpacity>

        </View>

        {/* ── BOTÓN GUARDAR ── */}
        <TouchableOpacity style={styles.scanBtn} activeOpacity={0.85} onPress={() => {}}>
            <LinearGradient
            colors={["#22c55e", "#16a34a", "#15803d"]}
            style={styles.scanGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            >
            <Text style={styles.scanText}>Guardar Análisis</Text>
            </LinearGradient>
        </TouchableOpacity>

        </ScrollView>
    </View>
    );
}