// src/screens/mobile/TermsScreen.jsx
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar, StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

export default function TermsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <LinearGradient colors={['#e8f5ec', '#f4faf5']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Términos y Privacidad</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>📜 Términos y Condiciones de Uso</Text>
        <Text style={styles.version}>Versión 1.0 – Fecha de entrada en vigor: 22 de abril de 2026</Text>

        <Text style={styles.subtitle}>1. Aceptación de los Términos</Text>
        <Text style={styles.text}>
          Al descargar, acceder o utilizar la aplicación móvil "DEC – Detector de Enfermedades en Cafetales" (en adelante, "la App"), usted acepta quedar vinculado por estos Términos y Condiciones, así como por nuestra Política de Privacidad. Si no está de acuerdo con alguno de estos términos, no utilice la App.
        </Text>

        <Text style={styles.subtitle}>2. Descripción del Servicio</Text>
        <Text style={styles.text}>
          La App permite a los usuarios: capturar o seleccionar imágenes de plantas de café para analizarlas mediante inteligencia artificial; identificar posibles enfermedades o determinar si la planta está sana; guardar el historial de análisis, incluyendo ubicación GPS y fecha; consultar información sobre enfermedades y tratamientos recomendados; registrar una bitácora de cultivo con productos aplicados, dosis y fechas; programar recordatorios locales para el seguimiento de tratamientos; sincronizar los datos entre el dispositivo y un servidor seguro (MongoDB) cuando haya conexión a internet.
        </Text>

        <Text style={styles.subtitle}>3. Registro y Cuenta</Text>
        <Text style={styles.text}>
          Para acceder a todas las funciones (guardar análisis, sincronizar, etc.) debe crear una cuenta proporcionando su nombre y correo electrónico. Usted es responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta. La App permite también el uso como invitado, pero con funcionalidades limitadas.
        </Text>

        <Text style={styles.subtitle}>4. Conducta del Usuario</Text>
        <Text style={styles.text}>
          Usted se compromete a: no utilizar la App para fines ilegales o no autorizados; no subir imágenes que contengan contenido ofensivo, violento o que viole derechos de terceros; no intentar dañar, descompilar o realizar ingeniería inversa de la App o sus servidores.
        </Text>

        <Text style={styles.subtitle}>5. Propiedad Intelectual</Text>
        <Text style={styles.text}>
          Todo el contenido de la App (logos, textos, base de datos de enfermedades, diseños) es propiedad de los desarrolladores o de sus licenciantes. Las imágenes que usted sube siguen siendo de su propiedad, pero nos otorga una licencia para almacenarlas, procesarlas y mostrarlas dentro de la funcionalidad de la App.
        </Text>

        <Text style={styles.subtitle}>6. Limitación de Responsabilidad</Text>
        <Text style={styles.text}>
          La App proporciona un análisis basado en inteligencia artificial con fines informativos y de apoyo. <Text style={{ fontWeight: 'bold' }}>No sustituye el juicio de un agrónomo o especialista.</Text> No garantizamos la exactitud del 100% de los diagnósticos. No seremos responsables por pérdidas de cultivos, decisiones de manejo o daños indirectos derivados del uso de la App.
        </Text>

        <Text style={styles.subtitle}>7. Modificaciones del Servicio</Text>
        <Text style={styles.text}>
          Podemos actualizar o discontinuar funcionalidades en cualquier momento, así como modificar estos términos. Le notificaremos los cambios significativos a través de la App o por correo electrónico.
        </Text>

        <Text style={styles.subtitle}>8. Ley Aplicable y Jurisdicción</Text>
        <Text style={styles.text}>
          Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa se someterá a los tribunales competentes de Huila, Colombia.
        </Text>

        <Text style={styles.subtitle}>9. Contacto</Text>
        <Text style={styles.text}>
          Si tiene preguntas sobre estos términos, contáctenos en: soporte@dec-app.com
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>🔒 Política de Privacidad</Text>
        <Text style={styles.version}>Última actualización: 22 de abril de 2026</Text>

        <Text style={styles.subtitle}>1. Información que Recopilamos</Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: 'bold' }}>a) Información proporcionada por usted:</Text> Nombre y correo electrónico (al registrarse). Contenido de los análisis: imágenes de plantas que usted sube, junto con el resultado del diagnóstico (enfermedad, confianza). Bitácora de cultivo: productos aplicados, dosis, fechas y notas que usted ingresa voluntariamente.
        </Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: 'bold' }}>b) Información recopilada automáticamente:</Text> Ubicación GPS (si otorga permiso) para georreferenciar los análisis. Datos de uso (pantallas visitadas, funciones usadas) con fines de mejora. Identificadores del dispositivo para enviar notificaciones push y mantener la sesión.
        </Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: 'bold' }}>c) Información de terceros:</Text> Si inicia sesión con Google o Facebook, recibimos su nombre, correo y foto de perfil (solo con su consentimiento).
        </Text>

        <Text style={styles.subtitle}>2. Uso de la Información</Text>
        <Text style={styles.text}>
          Utilizamos sus datos para: proporcionar el análisis de enfermedades y mostrar su historial; sincronizar sus análisis entre dispositivos; enviarle recordatorios programados por usted (notificaciones locales); mejorar nuestros algoritmos y la base de datos de enfermedades; responder a consultas o problemas técnicos.
          <Text style={{ fontWeight: 'bold' }}> No vendemos, alquilamos ni compartimos su información personal con terceros para fines publicitarios.</Text>
        </Text>

        <Text style={styles.subtitle}>3. Almacenamiento y Seguridad</Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: 'bold' }}>Almacenamiento local:</Text> Los análisis recientes, la bitácora y las alarmas se guardan primero en su dispositivo mediante SQLite, permitiendo usar la App sin conexión.
        </Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: 'bold' }}>Almacenamiento en la nube:</Text> Cuando hay conexión a internet, sus análisis se sincronizan con una base de datos MongoDB alojada en servidores seguros. Las imágenes se almacenan en Cloudinary, un servicio con certificaciones de seguridad.
        </Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: 'bold' }}>Seguridad:</Text> Implementamos medidas técnicas (cifrado de comunicaciones, acceso restringido a los servidores) para proteger sus datos. Sin embargo, ningún sistema es 100% seguro; usted acepta los riesgos residuales.
        </Text>

        <Text style={styles.subtitle}>4. Sus Derechos (Ley 1581 de 2012 – Colombia)</Text>
        <Text style={styles.text}>
          Usted tiene derecho a: acceder, rectificar o eliminar sus datos personales; solicitar la cancelación de su cuenta y la eliminación de toda su información; oponerse al tratamiento de sus datos para ciertos fines. Para ejercer estos derechos, envíe un correo a administrador.dec@gmail.com con el asunto "Protección de datos".
        </Text>

        <Text style={styles.subtitle}>5. Conservación de Datos</Text>
        <Text style={styles.text}>
          Mantendremos su información mientras su cuenta esté activa o según sea necesario para cumplir fines legales. Si elimina su cuenta, borraremos sus datos de nuestros servidores, aunque algunos registros anonimizados pueden conservarse para análisis estadístico.
        </Text>

        <Text style={styles.subtitle}>6. Uso de la Cámara y Ubicación</Text>
        <Text style={styles.text}>
          La App solicita permisos de cámara para tomar fotos, y de ubicación para georreferenciar los análisis. Usted puede denegar estos permisos en la configuración de su dispositivo, pero algunas funciones podrían limitarse.
        </Text>

        <Text style={styles.subtitle}>7. Notificaciones Push</Text>
        <Text style={styles.text}>
          Si lo permite, recibirá notificaciones locales (recordatorios de seguimiento). Estas se almacenan solo en su dispositivo. No utilizamos notificaciones push para enviar publicidad.
        </Text>

        <Text style={styles.subtitle}>8. Menores de Edad</Text>
        <Text style={styles.text}>
          La App no está dirigida a menores de 13 años. No recopilamos conscientemente datos de menores. Si detectamos que un menor ha proporcionado información, eliminaremos sus datos.
        </Text>

        <Text style={styles.subtitle}>9. Cambios a esta Política</Text>
        <Text style={styles.text}>
          Publicaremos cualquier cambio en esta página. Si son sustanciales, le notificaremos mediante un aviso en la App o por correo electrónico.
        </Text>

        <Text style={styles.subtitle}>10. Contacto</Text>
        <Text style={styles.text}>
          Para preguntas sobre privacidad, escríbanos a: administrador.dec@gmail.com
        </Text>

        <View style={styles.footer} />
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
    marginTop: 15,
  },
  backBtn: { padding: 5 },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.primary, marginTop: 20, marginBottom: 8 },
  version: { fontSize: 12, color: Colors.textMuted, marginBottom: 15 },
  subtitle: { fontSize: 18, fontWeight: '600', color: Colors.textMid, marginTop: 15, marginBottom: 6 },
  text: { fontSize: 14, color: Colors.textSoft, lineHeight: 22, marginBottom: 8, textAlign: 'justify' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 20 },
  footer: { height: 30 },
});