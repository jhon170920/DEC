import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Colors } from "../constants/colors";

const { width: screenWidth } = Dimensions.get("window");
const COMPACT_PHONE_WIDTH = 60;
const COMPACT_PHONE_HEIGHT = 120;
const EXPANDED_PHONE_WIDTH = 160;
const EXPANDED_PHONE_HEIGHT = 300;

export default function ProcessFlowScreen() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [expandedModal, setExpandedModal] = useState(false);
  const [expandedScreen, setExpandedScreen] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(0));
  const [expandedFadeAnim] = useState(new Animated.Value(0));

  // Ciclo de pantallas compactas
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScreen((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Ciclo de pantallas expandidas
  useEffect(() => {
    if (expandedModal) {
      const interval = setInterval(() => {
        setExpandedScreen((prev) => (prev + 1) % 3);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [expandedModal]);

  // Animación fade para cambio de pantalla
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [currentScreen]);

  // Animación slide para modal
  useEffect(() => {
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [expandedScreen]);

  // Animación fade para modal
  useEffect(() => {
    if (expandedModal) {
      expandedFadeAnim.setValue(0);
      Animated.timing(expandedFadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [expandedModal]);

  // ========== PANTALLA COMPACTA ==========
  const CompactScreen = ({ screenIndex, isActive }) => {
    const screens = [
      {
        label: "MainApp",
        gradientColors: ["#e8f5ec", "#f4faf5", "#f4faf5"],
        content: (
          <>
            <View style={styles.compactHeader}>
              <View style={styles.compactAvatar} />
            </View>
            <Text style={styles.compactGreeting}>¿Qué deseas?</Text>
            <View style={styles.compactAnimation}>
              <View style={styles.compactDot} />
              <View style={styles.compactLine} />
              <View style={styles.compactDot} />
            </View>
            <View style={styles.compactButton}>
              <Feather name="camera" size={10} color="#fff" />
              <Text style={styles.compactButtonText}>Escanear</Text>
            </View>
          </>
        ),
      },
      {
        label: "CameraScreen",
        gradientColors: ["#1a1a1a", "#2d2d2d"],
        content: (
          <>
            <View style={styles.compactCamera}>
              <View style={styles.compactReticle} />
              <Text style={styles.compactCameraText}>Enfoca</Text>
            </View>
            <View style={styles.compactControls}>
              <View style={styles.compactCapture} />
            </View>
          </>
        ),
      },
      {
        label: "Result",
        gradientColors: ["#e8f5ec", "#f4faf5", "#f4faf5"],
        content: (
          <>
            <View style={styles.compactBack} />
            <View style={styles.compactResultImage} />
            <Text style={styles.compactResultTitle}>Cercospora</Text>
            <View style={styles.compactBadge}>
              <Text style={styles.compactBadgeText}>No saludable</Text>
            </View>
          </>
        ),
      },
    ];

    const screen = screens[screenIndex];

    return (
      <Animated.View
        style={[
          styles.compactPhoneContainer,
          {
            opacity: isActive ? fadeAnim : 0.3,
          },
        ]}
      >
        <View style={styles.compactPhone}>
          <LinearGradient
            colors={screen.gradientColors}
            style={styles.compactPhoneScreen}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {screen.content}
          </LinearGradient>
        </View>
        <Text style={styles.compactLabel}>{screen.label}</Text>
      </Animated.View>
    );
  };

  // ========== PANTALLA EXPANDIDA ==========
  const ExpandedScreen = ({ screenIndex }) => {
    const screens = [
      {
        label: "MainApp",
        action: "Presiona botón",
        gradientColors: ["#e8f5ec", "#f4faf5", "#f4faf5"],
        content: (
          <>
            <View style={styles.expandedHeader}>
              <View style={styles.expandedAvatar} />
            </View>
            <View style={styles.expandedGreeting}>
              <Text style={styles.expandedGreetingText}>
                Bienvenido, ¿qué deseas explorar?
              </Text>
            </View>
            <View style={styles.expandedAnimation}>
              <View style={styles.expandedDot} />
              <View style={styles.expandedLine} />
              <View style={styles.expandedDot} />
              <View style={styles.expandedLine} />
              <View style={styles.expandedDot} />
            </View>
            <View style={styles.expandedButton}>
              <Feather name="camera" size={16} color="#fff" />
              <Text style={styles.expandedButtonText}>Escanear planta</Text>
            </View>
            <View style={styles.expandedMenuItem}>
              <View style={styles.expandedMenuDot} />
              <Text style={styles.expandedMenuText}>Mis Análisis</Text>
            </View>
            <View style={styles.expandedMenuItem}>
              <View style={styles.expandedMenuDot} />
              <Text style={styles.expandedMenuText}>Bitácora de cultivo</Text>
            </View>
          </>
        ),
      },
      {
        label: "CameraScreen",
        action: "Captura la foto",
        gradientColors: ["#1a1a1a", "#2d2d2d"],
        content: (
          <>
            <View style={styles.expandedCamera}>
              <View style={styles.expandedReticle} />
              <Text style={styles.expandedCameraText}>Enfoca la hoja</Text>
            </View>
            <View style={styles.expandedBottomControls}>
              <View style={styles.expandedBackButton} />
              <View style={styles.expandedCaptureButton}>
                <View style={styles.expandedCaptureInner} />
              </View>
              <View style={{ width: 50 }} />
            </View>
          </>
        ),
      },
      {
        label: "Result",
        action: "Ver diagnóstico",
        gradientColors: ["#e8f5ec", "#f4faf5", "#f4faf5"],
        content: (
          <>
            <View style={styles.expandedHeaderBack}>
              <Feather name="arrow-left" size={18} color={Colors.primary} />
            </View>
            <View style={styles.expandedResultImage} />
            <Text style={styles.expandedResultTitle}>Análisis: </Text>
            <Text style={styles.expandedResultValue}>Cercospora</Text>
            <View style={styles.expandedBadge}>
              <Feather name="x-square" size={14} color="#f97316" />
              <Text style={styles.expandedBadgeText}>No saludable</Text>
            </View>
            <View style={styles.expandedInfoCard}>
              <Text style={styles.expandedInfoLabel}>Nombre Científico:</Text>
              <Text style={styles.expandedInfoValue}>
                Cercospora coffeicola
              </Text>
            </View>
            <View style={styles.expandedButton}>
              <Feather name="save" size={16} color="#fff" />
              <Text style={styles.expandedButtonText}>Guardar Análisis</Text>
            </View>
          </>
        ),
      },
    ];

    const screen = screens[screenIndex];

    return (
      <Animated.View
        style={[
          styles.expandedPhoneContainer,
          {
            opacity: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1],
            }),
            transform: [
              {
                scale: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.expandedPhone}>
          <LinearGradient
            colors={screen.gradientColors}
            style={styles.expandedPhoneScreen}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {screen.content}
          </LinearGradient>
        </View>
        <View style={styles.expandedInfo}>
          <Text style={styles.expandedLabel}>{screen.label}</Text>
          <Text style={styles.expandedAction}>{screen.action}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <>
      {/* ========== CONTENEDOR COMPACTO ========== */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          setExpandedModal(true);
          setExpandedScreen(currentScreen);
        }}
      >
        <View style={styles.compactContainer}>
          {/* Título */}
          <Text style={styles.compactTitle}>Flujo de Escaneo</Text>

          {/* Pantalla actual */}
          <View style={styles.compactScreenContainer}>
            <CompactScreen screenIndex={currentScreen} isActive={true} />
          </View>

          {/* Indicadores */}
          <View style={styles.compactIndicators}>
            {[0, 1, 2].map((idx) => (
              <View
                key={idx}
                style={[
                  styles.compactIndicator,
                  {
                    backgroundColor:
                      idx === currentScreen ? Colors.primary : "#cbd5e1",
                  },
                ]}
              />
            ))}
          </View>

          {/* Descripción */}
          <View style={styles.compactDescription}>
            <Text style={styles.compactDescriptionText}>
              {currentScreen === 0
                ? "1. Presiona 'Escanear planta'"
                : currentScreen === 1
                ? "2. Captura la foto de la hoja"
                : "3. Recibe el diagnóstico"}
            </Text>
            <Text style={styles.compactSeeMore}>Ver más →</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* ========== MODAL EXPANDIDO ========== */}
      <Modal
        transparent
        animationType="fade"
        visible={expandedModal}
        onRequestClose={() => setExpandedModal(false)}
      >
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: expandedFadeAnim,
            },
          ]}
        >
          {/* Header con close button */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Flujo de Escaneo</Text>
            <TouchableOpacity
              onPress={() => setExpandedModal(false)}
              style={styles.closeButton}
            >
              <Feather name="x" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Scrollable content */}
          <ScrollView
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Pantalla expandida */}
            <View style={styles.expandedContainer}>
              <ExpandedScreen screenIndex={expandedScreen} />
            </View>

            {/* Indicadores del modal */}
            <View style={styles.expandedIndicators}>
              {[0, 1, 2].map((idx) => (
                <View
                  key={idx}
                  style={[
                    styles.expandedIndicator,
                    {
                      backgroundColor:
                        idx === expandedScreen ? Colors.primary : "#cbd5e1",
                    },
                  ]}
                />
              ))}
            </View>

            {/* Descripción completa */}
            <View style={styles.expandedDescription}>
              <Text style={styles.expandedDescriptionTitle}>
                {expandedScreen === 0
                  ? "Paso 1: Abre la App"
                  : expandedScreen === 1
                  ? "Paso 2: Captura la Foto"
                  : "Paso 3: Recibe el Resultado"}
              </Text>
              <Text style={styles.expandedDescriptionText}>
                {expandedScreen === 0
                  ? "Abre la aplicación y presiona el botón 'Escanear planta' para iniciar el proceso de análisis."
                  : expandedScreen === 1
                  ? "Posiciona la hoja dentro del recuadro punteado y captura una foto clara. La luz natural es mejor."
                  : "La IA analizará la imagen y te mostrará el diagnóstico, tratamiento recomendado y productos sugeridos."}
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // ========== COMPACTO ==========
  compactContainer: {
    paddingHorizontal: 20,
    paddingVertical: 5,
    backgroundColor: "#f8fafb",
    borderRadius: 12,
    marginBottom: 16,
  },
  compactTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 1,
    textAlign: "center",
  },
  compactScreenContainer: {
    alignItems: "center",
    minHeight: 160,
    justifyContent: "center",
  },
  compactPhoneContainer: {
    alignItems: "center",
  },
  compactPhone: {
    width: COMPACT_PHONE_WIDTH,
    height: COMPACT_PHONE_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#000",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  compactPhoneScreen: {
    flex: 1,
    padding: 8,
    justifyContent: "space-between",
  },
  compactHeader: {
    alignItems: "flex-end",
  },
  compactAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
  },
  compactGreeting: {
    fontSize: 7,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },
  compactAnimation: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    paddingVertical: 6,
  },
  compactDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  compactLine: {
    width: 4,
    height: 1,
    backgroundColor: "#d1d5db",
  },
  compactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 4,
    padding: 4,
    gap: 2,
  },
  compactButtonText: {
    color: "#fff",
    fontSize: 6,
    fontWeight: "600",
  },
  compactCamera: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: "dashed",
  },
  compactReticle: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 4,
  },
  compactCameraText: {
    color: "#fff",
    fontSize: 6,
    marginTop: 4,
  },
  compactControls: {
    alignItems: "center",
  },
  compactCapture: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  compactResultImage: {
    width: "100%",
    height: 40,
    backgroundColor: "#d1d5db",
    borderRadius: 4,
    marginVertical: 4,
  },
  compactResultTitle: {
    fontSize: 8,
    color: "#1f2937",
    fontWeight: "600",
  },
  compactBadge: {
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginTop: 4,
  },
  compactBadgeText: {
    fontSize: 6,
    color: "#f97316",
    fontWeight: "600",
  },
  compactBack: {
    width: 12,
    height: 12,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  compactLabel: {
    fontSize: 8,
    fontWeight: "600",
    color: "#1f2937",
    marginTop: 6,
  },
  compactIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  compactIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactDescription: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f0fdf4",
    borderRadius: 6,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
  },
  compactDescriptionText: {
    fontSize: 10,
    color: "#1f2937",
    fontWeight: "500",
    marginBottom: 4,
  },
  compactSeeMore: {
    fontSize: 9,
    color: Colors.primary,
    fontWeight: "600",
    textAlign: "right",
  },

  // ========== MODAL ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    paddingBottom: 40,
  },

  // ========== EXPANDIDO ==========
  expandedContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  expandedPhoneContainer: {
    alignItems: "center",
  },
  expandedPhone: {
    width: EXPANDED_PHONE_WIDTH,
    height: EXPANDED_PHONE_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  expandedPhoneScreen: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  expandedHeader: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  expandedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
  },
  expandedGreeting: {
    marginBottom: 8,
  },
  expandedGreetingText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
  },
  expandedAnimation: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    paddingVertical: 6,
    marginBottom: 4,
  },
  expandedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  expandedLine: {
    width: 6,
    height: 1.5,
    backgroundColor: "#d1d5db",
  },
  expandedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 6,
    padding: 8,
    gap: 4,
    marginVertical: 4,
  },
  expandedButtonText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
  },
  expandedMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 3,
    marginBottom: 2,
  },
  expandedMenuDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  expandedMenuText: {
    fontSize: 8,
    color: "#6b7280",
  },
  expandedCamera: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: "dashed",
  },
  expandedReticle: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 6,
  },
  expandedCameraText: {
    color: "#fff",
    fontSize: 9,
    marginTop: 8,
  },
  expandedBottomControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  expandedBackButton: {
    width: 28,
    height: 20,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  expandedCaptureButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  expandedCaptureInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  expandedHeaderBack: {
    alignItems: "flex-start",
    marginBottom: 8,
  },
  expandedResultImage: {
    width: "100%",
    height: 60,
    backgroundColor: "#d1d5db",
    borderRadius: 6,
    marginVertical: 6,
  },
  expandedResultTitle: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 2,
  },
  expandedResultValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  expandedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(249, 115, 22, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 8,
  },
  expandedBadgeText: {
    fontSize: 9,
    color: "#f97316",
    fontWeight: "600",
  },
  expandedInfoCard: {
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  expandedInfoLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 2,
  },
  expandedInfoValue: {
    fontSize: 10,
    color: "#1f2937",
    fontWeight: "600",
  },
  expandedLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    marginTop: 10,
  },
  expandedAction: {
    fontSize: 10,
    color: Colors.primary,
    marginTop: 2,
  },
  expandedInfo: {
    alignItems: "center",
  },
  expandedIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginTop: 20,
  },
  expandedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  expandedDescription: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    marginHorizontal: 20,
  },
  expandedDescriptionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
  },
  expandedDescriptionText: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 18,
  },
});