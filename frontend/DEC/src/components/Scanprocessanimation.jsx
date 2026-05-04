import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Colors } from "../constants/colors";

// Este componente reemplaza la imagen estática mostrando una animación 
// que visualiza el proceso completo de escaneo y análisis

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 56;

export default function ScanProcessAnimation() {
  // Estados para animar cada paso
  const [currentStep, setCurrentStep] = useState(0);
  const [stepAnimations] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  const [pulseAnim] = useState(new Animated.Value(1));
  const [scanLineAnim] = useState(new Animated.Value(0));

  // Ciclo continuo de pasos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Animar el paso actual
  useEffect(() => {
    Animated.sequence([
      Animated.timing(stepAnimations[currentStep], {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset para el siguiente ciclo
      if (currentStep === 3) {
        stepAnimations.forEach((anim) => anim.setValue(0));
      }
    });
  }, [currentStep]);

  // Animación de pulso continuo en el paso actual
  useEffect(() => {
    const pulseSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseSequence.start();
    return () => pulseSequence.stop();
  }, []);

  // Animación de línea de escaneo (solo en paso 1 - Capturar)
  useEffect(() => {
    if (currentStep === 1) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanLineAnim.setValue(0);
    }
  }, [currentStep]);

  const steps = [
    {
      icon: "camera",
      title: "Presiona",
      subtitle: "Escanear Planta",
      color: "#22c55e",
      bgColor: "#f0fdf4",
    },
    {
      icon: "aperture",
      title: "Captura",
      subtitle: "Imagen de la hoja",
      color: "#3b82f6",
      bgColor: "#eff6ff",
    },
    {
      icon: "zap",
      title: "Analiza",
      subtitle: "IA procesa datos",
      color: "#f59e0b",
      bgColor: "#fffbeb",
    },
    {
      icon: "check-circle",
      title: "Resultado",
      subtitle: "Diagnóstico listo",
      color: "#10b981",
      bgColor: "#ecfdf5",
    },
  ];

  return (
    <View style={styles.container}>
      {/* VISUALIZATION AREA */}
      <LinearGradient
        colors={["#ffffff", "#f8fafb", "#ffffff"]}
        style={styles.visualizationBox}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Contenedor de pasos */}
        <View style={styles.stepsContainer}>
          {/* PASO 0: Escanear */}
          <Animated.View
            style={[
              styles.stepBox,
              {
                opacity: stepAnimations[0].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
                transform: [
                  {
                    scale: stepAnimations[0].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: steps[0].bgColor },
              ]}
            >
              <Animated.View
                style={[
                  styles.iconWrapper,
                  currentStep === 0 && {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Feather name={steps[0].icon} size={32} color={steps[0].color} />
              </Animated.View>
            </View>
            <Text style={styles.stepNumber}>1</Text>
          </Animated.View>

          {/* Línea conectora */}
          <View style={styles.connectorLine}>
            <Animated.View
              style={[
                styles.connectorFill,
                {
                  width: currentStep > 0 ? "100%" : "0%",
                },
              ]}
            />
          </View>

          {/* PASO 1: Capturar */}
          <Animated.View
            style={[
              styles.stepBox,
              {
                opacity: stepAnimations[1].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
                transform: [
                  {
                    scale: stepAnimations[1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: steps[1].bgColor },
              ]}
            >
              <Animated.View
                style={[
                  styles.iconWrapper,
                  currentStep === 1 && {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Feather name={steps[1].icon} size={32} color={steps[1].color} />
              </Animated.View>

              {/* Línea de escaneo en el paso Capturar */}
              {currentStep === 1 && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [
                        {
                          translateY: scanLineAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-40, 40],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              )}
            </View>
            <Text style={styles.stepNumber}>2</Text>
          </Animated.View>

          {/* Línea conectora */}
          <View style={styles.connectorLine}>
            <Animated.View
              style={[
                styles.connectorFill,
                {
                  width: currentStep > 1 ? "100%" : "0%",
                },
              ]}
            />
          </View>

          {/* PASO 2: Analizar */}
          <Animated.View
            style={[
              styles.stepBox,
              {
                opacity: stepAnimations[2].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
                transform: [
                  {
                    scale: stepAnimations[2].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: steps[2].bgColor },
              ]}
            >
              <Animated.View
                style={[
                  styles.iconWrapper,
                  currentStep === 2 && {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Feather name={steps[2].icon} size={32} color={steps[2].color} />
              </Animated.View>
            </View>
            <Text style={styles.stepNumber}>3</Text>
          </Animated.View>

          {/* Línea conectora */}
          <View style={styles.connectorLine}>
            <Animated.View
              style={[
                styles.connectorFill,
                {
                  width: currentStep > 2 ? "100%" : "0%",
                },
              ]}
            />
          </View>

          {/* PASO 3: Resultado */}
          <Animated.View
            style={[
              styles.stepBox,
              {
                opacity: stepAnimations[3].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
                transform: [
                  {
                    scale: stepAnimations[3].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: steps[3].bgColor },
              ]}
            >
              <Animated.View
                style={[
                  styles.iconWrapper,
                  currentStep === 3 && {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Feather name={steps[3].icon} size={32} color={steps[3].color} />
              </Animated.View>
            </View>
            <Text style={styles.stepNumber}>4</Text>
          </Animated.View>
        </View>

        {/* INFORMACIÓN DEL PASO ACTUAL */}
        <View style={styles.infoSection}>
          <Animated.View
            style={{
              opacity: stepAnimations[currentStep],
            }}
          >
            <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
            <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>
          </Animated.View>
        </View>

        {/* PROGRESS INDICATOR */}
        <View style={styles.progressContainer}>
          {steps.map((_, idx) => (
            <Animated.View
              key={idx}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    idx === currentStep
                      ? Colors.primary
                      : idx < currentStep
                      ? Colors.primary
                      : "#e2e8f0",
                  transform: [
                    {
                      scale: idx === currentStep ? pulseAnim : 1,
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </LinearGradient>

          </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 28,
    marginVertical: 20,
    width: '100%'
  },
  visualizationBox: {
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  stepBox: {
    alignItems: "center",
    zIndex: 2,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#f0f0f0",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  scanLine: {
    position: "absolute",
    width: "90%",
    height: 2,
    backgroundColor: "#3b82f6",
    borderRadius: 1,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textMuted,
  },
  connectorLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 8,
    borderRadius: 1,
    overflow: "hidden",
    minWidth: 20,
  },
  connectorFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
  infoSection: {
    alignItems: "center",
    marginBottom: 20,
    minHeight: 60,
    justifyContent: "center",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
    textAlign: "center",
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  description: {
    marginTop: 16,
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
});