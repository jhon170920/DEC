import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// 1. COMPONENTES DE NAVEGACIÓN PERSONALIZADOS
const Dots = ({ selected }) => {
  return (
    <View style={[
      styles.dot,
      { 
        width: selected ? 22 : 6, 
        backgroundColor: selected ? '#16a34a' : '#d1d5db',
        opacity: selected ? 1 : 0.5 
      }
    ]} />
  );
};

const NextButton = ({ ...props }) => (
  <TouchableOpacity style={styles.nextButton} {...props}>
    <Feather name="chevron-right" size={24} color="#16a34a" />
  </TouchableOpacity>
);

const DoneButton = ({ ...props }) => (
  <TouchableOpacity style={styles.doneButton} {...props}>
    <Text style={styles.doneButtonText}>Comenzar</Text>
    <Feather name="arrow-right" size={18} color="#fff" />
  </TouchableOpacity>
);

const SkipButton = ({ ...props }) => (
  <TouchableOpacity style={styles.skipButton} {...props}>
    <Text style={styles.skipButtonText}>Saltar</Text>
  </TouchableOpacity>
);

// 2. COMPONENTE PRINCIPAL
const OnboardingScreen = ({ onDone }) => {
  const handleComplete = async () => {
    await AsyncStorage.setItem('@hasSeenOnboarding', 'true');
    onDone();
  };

  return (
    <View style={styles.container}>
      <Onboarding
        onDone={handleComplete}
        onSkip={handleComplete}
        DotComponent={Dots}
        NextButtonComponent={NextButton}
        DoneButtonComponent={DoneButton}
        SkipButtonComponent={SkipButton}
        bottomBarHeight={90}
        bottomBarBackgroundColor="#ffffff"
        titleStyles={styles.title}
        subTitleStyles={styles.subtitle}
        containerStyles={{ paddingBottom: 100 }} // Espacio para el texto
        pages={[
          {
            backgroundColor: '#ffffff',
            image: (
              <View style={styles.imageContainer}>
                <View style={styles.blob} />
                <Image 
                  source={require('../../assets/image/logo.png')} 
                  style={styles.illustration}
                  resizeMode="contain"
                />
              </View>
            ),
            title: 'Bienvenido a DEC',
            subtitle: 'La evolución tecnológica para el cuidado de tus cafetales en Garzón.',
          },
          {
            backgroundColor: '#f0fdf4',
            image: (
              <View style={[styles.imageContainer, { backgroundColor: '#dcfce7' }]}>
                <Feather name="zap-off" size={80} color="#16a34a" />
                <View style={styles.badgeIA}><Text style={styles.badgeText}>IA OFFLINE</Text></View>
              </View>
            ),
            title: 'Detección sin Internet',
            subtitle: 'Nuestra inteligencia artificial analiza tus cultivos directamente en el campo, sin necesidad de señal.',
          },
          {
            backgroundColor: '#ffffff',
            image: (
              <View style={[styles.imageContainer, { backgroundColor: '#fef3c7' }]}>
                <Feather name="bar-chart-2" size={80} color="#d97706" />
              </View>
            ),
            title: 'Control de Cosecha',
            subtitle: 'Sincroniza tus datos al llegar a casa y obtén estadísticas detalladas de cada lote.',
          },
        ]}
      />
    </View>
  );
};

// 3. ESTILOS PROFESIONALES (UX/UI)
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Ilustraciones y Contenedores
  imageContainer: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 10 },
    }),
  },
  illustration: {
    width: '70%',
    height: '70%',
  },
  badgeIA: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  // Textos
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#064e3b',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 40,
    marginTop: 10,
  },
  // Navegación (Pills)
  dot: {
    height: 6,
    marginHorizontal: 4,
    borderRadius: 3,
  },
  // Botones
  nextButton: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 30,
    marginRight: 20,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginRight: 20,
    gap: 8,
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  skipButton: {
    marginLeft: 25,
  },
  skipButtonText: {
    fontSize: 15,
    color: '#9ca3af',
    fontWeight: '600',
  },
});

export default OnboardingScreen;