// src/screens/mobile/HelpCenterScreen.jsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar, StyleSheet, Linking, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

export default function HelpCenterScreen() {
  const navigation = useNavigation();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "¿Cómo funciona el análisis de enfermedades?",
      answer: "La aplicación utiliza un modelo de inteligencia artificial entrenado para reconocer enfermedades comunes en cafetos. Solo debes tomar una foto de una hoja o fruto del café, y la IA analizará la imagen para determinar si la planta está sana o presenta alguna enfermedad, mostrando el nombre, la precisión y una descripción."
    },
    {
      id: 2,
      question: "¿Necesito internet para usar la app?",
      answer: "No. Puedes tomar fotos y realizar análisis sin conexión. Los resultados se guardan localmente en tu dispositivo. Cuando recuperes internet, los análisis pendientes se sincronizarán automáticamente con tu cuenta en la nube."
    },
    {
      id: 3,
      question: "¿Cómo guardo un análisis?",
      answer: "Después de analizar una planta, en la pantalla de resultados presiona el botón 'Guardar Análisis'. Si tienes sesión iniciada, se almacenará en tu historial y se sincronizará con tus otros dispositivos. Si no has iniciado sesión, se te pedirá que lo hagas."
    },
    {
      id: 4,
      question: "¿Qué es la bitácora de cultivo?",
      answer: "Es un diario donde puedes registrar los tratamientos que aplicas a tus cultivos. Puedes agregar la enfermedad tratada, múltiples productos con sus dosis, fechas de aplicación y notas. Además, puedes asociar cada registro a una detección previa del historial y programar recordatorios para seguimiento."
    },
    {
      id: 5,
      question: "¿Cómo programo un recordatorio?",
      answer: "Desde la pantalla de detalle de una detección (en tu historial), pulsa 'Programar recordatorio'. Elige una fecha y hora futura. Recibirás una notificación local en tu dispositivo para recordarte revisar la evolución del tratamiento."
    },
    {
      id: 6,
      question: "¿Qué pasa con mis datos y privacidad?",
      answer: "Tus análisis, fotos y bitácora se almacenan de forma segura. Las fotos se suben a Cloudinary y los datos a MongoDB. No compartimos tu información con terceros sin tu consentimiento. Puedes leer nuestra política completa en la sección 'Términos y Privacidad' de tu perfil."
    },
    {
      id: 7,
      question: "¿Cómo elimino mi cuenta?",
      answer: "Ve a tu perfil, desplázate hasta abajo y pulsa 'Eliminar cuenta'. Se te pedirá tu contraseña para confirmar. Una vez eliminada, toda tu información (análisis, bitácora, alarmas) se borrará permanentemente."
    },
    {
      id: 8,
      question: "¿Puedo usar la app en varios dispositivos?",
      answer: "Sí, al iniciar sesión con la misma cuenta en otro dispositivo, todos tus análisis y bitácora se sincronizarán automáticamente (si tienes internet)."
    }
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const openEmail = () => {
    Linking.openURL('mailto:administrador.dec@gmail.com');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <LinearGradient colors={['#e8f5ec', '#f4faf5']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Centro de ayuda</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Sección de contacto rápido */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>📞 ¿Necesitas ayuda?</Text>
          <Text style={styles.contactSubtitle}>Contáctanos directamente</Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.contactBtn} onPress={openEmail}>
              <Feather name="mail" size={22} color="#fff" />
              <Text style={styles.contactBtnText}>Correo</Text>
            </TouchableOpacity>
            
          </View>
        </View>

        {/* Sección de guía rápida */}
        <View style={styles.guideSection}>
          <Text style={styles.sectionTitle}>📘 Guía rápida</Text>
          <View style={styles.guideSteps}>
            <View style={styles.guideStep}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepText}>Toma o selecciona una foto de tu cafeto</Text>
            </View>
            <View style={styles.guideStep}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepText}>La IA analiza la imagen y muestra el resultado</Text>
            </View>
            <View style={styles.guideStep}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepText}>Guarda el análisis en tu historial</Text>
            </View>
            <View style={styles.guideStep}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
              <Text style={styles.stepText}>Registra tratamientos en la bitácora y programa recordatorios</Text>
            </View>
          </View>
        </View>

        {/* Sección de preguntas frecuentes */}
        <Text style={styles.sectionTitle}>❓ Preguntas frecuentes</Text>
        {faqs.map((faq) => (
          <View key={faq.id} style={styles.faqCard}>
            <TouchableOpacity
              style={styles.faqQuestion}
              onPress={() => toggleFaq(faq.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.faqQuestionText}>{faq.question}</Text>
              <Feather
                name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"}
                size={20}
                color={Colors.primary}
              />
            </TouchableOpacity>
            {expandedFaq === faq.id && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </View>
        ))}

        {/* Pie de página */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿No encuentras lo que buscas? Escríbenos a administrador.dec@gmail.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: { padding: 5 },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  contactSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.primary, marginBottom: 8 },
  contactSubtitle: { fontSize: 14, color: Colors.textMuted, marginBottom: 16 },
  contactButtons: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    gap: 8,
  },
  contactBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  guideSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  guideSteps: { marginTop: 12 },
  guideStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: { color: Colors.primary, fontWeight: 'bold', fontSize: 16 },
  stepText: { fontSize: 15, color: Colors.text, flex: 1 },
  faqCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: { fontSize: 16, fontWeight: '600', color: Colors.text, flex: 1, paddingRight: 12 },
  faqAnswer: { fontSize: 14, color: Colors.textSoft, lineHeight: 20, paddingHorizontal: 16, paddingBottom: 16, textAlign: 'justify' },
  footer: { marginTop: 30, alignItems: 'center' },
  footerText: { fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
});