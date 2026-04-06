import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../../constants/colors";
import { ContactStyles as styles } from "../../styles/Contacstyles";

export default function Contact() {
  const navigation = useNavigation();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

const handleEnviar = () => {
  setLoading(true);
  setTimeout(() => {
    setLoading(false);
    setModalVisible(true);
  }, 2000);
};

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <LinearGradient
        colors={["#e8f5ec", "#f4faf5", "#f4faf5"]}
        style={styles.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── BACK ── */}
      <TouchableOpacity style={styles.backBtn} activeOpacity={0.75} onPress={() => navigation.goBack()}>
      <Feather name="arrow-left" size={22} color={Colors.text} />
      </TouchableOpacity>
        {/* ── LOGO ── */}
        <View style={styles.logoWrap}>
          <Image
            source={require("../../../assets/image/logo.png")}
            style={styles.logo}
          />
        </View>

        {/* ── TÍTULO ── */}
        <Text style={styles.title}>Contáctanos</Text>

        {/* ── FORMULARIO ── */}

        {/* Nombre */}
        <Text style={styles.label}>Nombre</Text>
        <View style={styles.inputWrap}>
          <Feather name="user" size={20} color={Colors.text} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor={Colors.text}
            value={nombre}
            onChangeText={setNombre}
          />
        </View>

        {/* Correo */}
        <Text style={styles.label}>Correo</Text>
        <View style={styles.inputWrap}>
          <Feather name="mail" size={20} color={Colors.text} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Correo"
            placeholderTextColor={Colors.text}
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
          />
        </View>

        {/* Mensaje */}
        <Text style={styles.label}>Mensaje</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Mensaje"
          placeholderTextColor={Colors.text}
          value={mensaje}
          onChangeText={setMensaje}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />

        {/* ── BOTÓN ENVIAR ── */}
        <TouchableOpacity style={styles.btnEnviar} activeOpacity={0.85} onPress={handleEnviar} disabled={loading}>
  <LinearGradient
    colors={["#22c55e", "#16a34a", "#15803d"]}
    style={styles.btnGradient}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    {loading ? (
      <ActivityIndicator color="#fff" size="small" />
    ) : (
      <Text style={styles.btnText}>Enviar</Text>
    )}
  </LinearGradient>
</TouchableOpacity>

        {/* ── MODAL ── */}
<Modal transparent animationType="fade" visible={modalVisible}>
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>
      <Feather name="check-circle" size={48} color={Colors.primary} />
      <Text style={styles.modalTitle}>¡Mensaje enviado!</Text>

      <Text style={styles.modalSub}>Nos pondremos en contacto contigo pronto.</Text>

      <TouchableOpacity style={styles.modalBtn} activeOpacity={0.85} onPress={() => {
        setModalVisible(false);
        navigation.navigate("MainApp");
}}>
  <Text style={styles.modalBtnText}>OK</Text>
  </TouchableOpacity>
    </View>
  </View>
</Modal>




      </ScrollView>
    </View>
  );
}