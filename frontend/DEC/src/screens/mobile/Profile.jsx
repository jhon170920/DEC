import React, { useState } from "react";
import {
View,
Text,
TouchableOpacity,
StatusBar,
ScrollView,
Switch,
StyleSheet,
Image,
Platform,
Modal,
TextInput,
KeyboardAvoidingView,
ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../../constants/colors";
import { ProfileStyles as styles } from "../../styles/Profilestyles";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";

// PANTALLA PRINCIPAL

export default function Profile() {
const navigation = useNavigation();
const { sp, hPad, logoRingS, logoImgS, iconS, btnH, headlineS, sublineS, brandS } = useResponsiveLayout();
const [notificaciones, setNotificaciones] = useState(true);
const [modalContrasena, setModalContrasena] = useState(false); 
const nombreUsuario = "Juancho";
const inicial = nombreUsuario.charAt(0).toUpperCase();

const plantas   = 1;
const analisis  = 3;
const guardadas = 7;

const avatarSize = sp(0.085);
  const badgeS     = avatarSize * 0.24;
  const menuIconS  = iconS * 1.7;
const menuPadV   = sp(0.0070);
const scrollPadT = Platform.OS === "ios" ? sp(0.07) : sp(0.06);

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
        contentContainerStyle={[
            styles.scroll,
            { paddingHorizontal: hPad, paddingTop: scrollPadT },
        ]}
        showsVerticalScrollIndicator={false}
        >

        {/* ── HEADER ── */}
        <View style={[styles.header, { marginBottom: sp(0.018) }]}>
            <View style={[
            styles.logoMark,
            { width: logoRingS, height: logoRingS, borderRadius: logoRingS / 2 },
            ]}>
            <Image
                source={require("../../../assets/image/logo.png")}
                style={{ width: logoImgS, height: logoImgS }}
                resizeMode="contain"
            />
            </View>
            <TouchableOpacity
            style={[styles.backBtn, { width: logoRingS * 0.60, height: logoRingS * 0.68 }]}
            activeOpacity={0.75}
            onPress={() => navigation.goBack()}
            >
            <Feather name="arrow-left" size={iconS} color={Colors.text} />
            </TouchableOpacity>
        </View>

        {/* ── AVATAR ── */}
        <View style={styles.avatarWrap}>
            <View style={[
            styles.avatarCircle,
            { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
            ]}>
            <Text style={[styles.avatarInitial, { fontSize: avatarSize * 0.42 }]}>
                {inicial}
            </Text>
            </View>
            <View style={[styles.avatarBadge, { width: badgeS, height: badgeS }]}>
            <Feather name="edit-2" size={badgeS * 0.5} color="#fff" />
            </View>
        </View>

        {/* ── NOMBRE ── */}
        <Text style={[styles.userName, { fontSize: headlineS * 0.5, marginBottom: sp(0.018) }]}>
            {nombreUsuario}
        </Text>

        {/* ── STATS ── */}
        <View style={[
        styles.statsCard,
            { marginBottom: sp(0.02), paddingVertical: sp(0.015) },
        ]}>
        <View style={styles.statItem}>
            <Text style={[styles.statNumber, { fontSize: headlineS * 0.5 }]}>{plantas}</Text>
            <Text style={[styles.statLabel, { fontSize: sublineS }]}>Plantas</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
            <Text style={[styles.statNumber, { fontSize: headlineS * 0.5 }]}>{analisis}</Text>
            <Text style={[styles.statLabel, { fontSize: sublineS }]}>Análisis</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
            <Text style={[styles.statNumber, { fontSize: headlineS * 0.5 }]}>{guardadas}</Text>
            <Text style={[styles.statLabel, { fontSize: sublineS }]}>Guardadas</Text>
            </View>
        </View>

        {/* ── MI CUENTA ── */}
        <View style={[styles.sectionHeader, { marginBottom: 6, marginTop: 8 }]}>
            <Text style={[styles.sectionLabel, { fontSize: sublineS - 1 }]}>MI CUENTA</Text>
            <View style={styles.sectionLine} />
        </View>

        <View style={styles.groupCard}>

            <TouchableOpacity
            style={[styles.menuItem, { paddingVertical: menuPadV }]}
            activeOpacity={0.75}
            onPress={() => navigation.navigate("EditProfile")}
        >
            <View style={[styles.menuIconWrap, { width: menuIconS, height: menuIconS, backgroundColor: "#f0faf3" }]}>
                <Feather name="edit-2" size={iconS} color={Colors.primary} />
            </View>
            <Text style={[styles.menuTitle, { fontSize: brandS }]}>Editar perfil</Text>
            <Feather name="chevron-right" size={iconS - 4} color={Colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.itemDivider} />

          {/* onpres */}

            <View style={styles.itemDivider} />

            <View style={[styles.menuItem, { paddingVertical: menuPadV }]}>
            <View style={[styles.menuIconWrap, { width: menuIconS, height: menuIconS, backgroundColor: "#eff6ff" }]}>
                <Feather name="bell" size={iconS} color="#3b82f6" />
            </View>
            <Text style={[styles.menuTitle, { fontSize: brandS }]}>Notificaciones</Text>
            <Switch
                value={notificaciones}
                onValueChange={setNotificaciones}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor="#fff"
            />
            </View>

        </View>

        {/* ── SOPORTE ── */}
        <View style={[styles.sectionHeader, { marginBottom: 6, marginTop: 8 }]}>
            <Text style={[styles.sectionLabel, { fontSize: sublineS - 1 }]}>SOPORTE</Text>
            <View style={styles.sectionLine} />
        </View>

        <View style={styles.groupCard}>

            <TouchableOpacity
            style={[styles.menuItem, { paddingVertical: menuPadV }]}
            activeOpacity={0.75}
            onPress={() => {}}
            >
            <View style={[styles.menuIconWrap, { width: menuIconS, height: menuIconS, backgroundColor: "#eff6ff" }]}>
                <Feather name="help-circle" size={iconS} color="#3b82f6" />
            </View>
            <Text style={[styles.menuTitle, { fontSize: brandS }]}>Centro de ayuda</Text>
            <Feather name="chevron-right" size={iconS - 4} color={Colors.textMuted} />
        </TouchableOpacity>

            <View style={styles.itemDivider} />

            <TouchableOpacity
            style={[styles.menuItem, { paddingVertical: menuPadV }]}
            activeOpacity={0.75}
            onPress={() => {}}
            >
            <View style={[styles.menuIconWrap, { width: menuIconS, height: menuIconS, backgroundColor: Colors.surfaceAlt }]}>
                <Feather name="file-text" size={iconS} color={Colors.textMuted} />
            </View>
                <Text style={[styles.menuTitle, { fontSize: brandS }]}>Términos y privacidad</Text>
                <Feather name="chevron-right" size={iconS - 4} color={Colors.textMuted} />
            </TouchableOpacity>

        </View>

        {/* ── BOTONES  ── */}
        <TouchableOpacity
            style={[styles.btnDanger, { height: btnH }]}
            activeOpacity={0.75}
            onPress={() => {navigation.navigate("Login");}}
        >
            <Text style={[styles.btnDangerText, { fontSize: brandS }]}>Cerrar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={[styles.btnDanger, { height: btnH }]}
            activeOpacity={0.75}
            onPress={() => {}}
        >
            <Text style={[styles.btnDangerText, { fontSize: brandS }]}>Eliminar cuenta</Text>
        </TouchableOpacity>

        </ScrollView>
    </View>
);
}