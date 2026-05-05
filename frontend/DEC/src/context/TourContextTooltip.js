import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TreatmentLogScreen from '../screens/mobile/TreatmentLogScreen';
import TreatmentFormScreen from '../screens/mobile/TreatmentFormScreen';

const TourContext = createContext();

export const TourProvider = ({ children }) => {
  const [tourCompleted, setTourCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  // TODAS LAS SCREENS A MOSTRAR EL TOOLTIP
  const [completedScreen, setCompletedScreen] = useState({
    MainApp: false,
    Profile: false,
    History: false,
    TreatmentLog: false,
    TreatmentForm: false,
  });
  useEffect(() => {
    // SOLO EN APP
    if(Platform.OS !== 'web'){
      checkTourCompleted();
      checkCompletedScreen();
    }
  }, []);
  // Revisamos si el tutorial está completado en cada pantalla
  const checkTourCompleted = async () => {
    const isTourCompleted = Object.values(completedScreen).every(screen => screen === true); // Será TRUE si todas las screens de <<completedScreen>> están en true
    console.log(isTourCompleted)
    if (isTourCompleted) {
      setTourCompleted(true);
    }
  };
  // Revisamos si hay alguna screen para pasar por el tutorial
  const checkCompletedScreen = async  () => {
    setLoading(true);
    const completedScreen = await AsyncStorage.getItem('completedScreen'); // Obtener, del almacenamiento, TODAS las screens ya terminadas por el tutorial
    if(completedScreen){
      setCompletedScreen(JSON.parse(completedScreen)); // Guardarlas en el estado de la app
    }
    console.log(completedScreen);
    setLoading(false);
  }
  // Guardado de screens ya terminadas por el tutorial
  const markScreenAsDone = async (screen) => {
    const updatedStatus = { ...completedScreen, [screen]: true} // Actualizamos la screen como ya marcada por el tutorial
    setCompletedScreen(updatedStatus); // Guardado en el estado de la app
    await AsyncStorage.setItem('completedScreen', JSON.stringify(updatedStatus)); // Guardado en el almacenamiento para leerlo después
  };
  // Completado del tutorial
  const completeTutorial = async () => {
    await AsyncStorage.setItem('hasSeenTutorial', 'true');
    setIsFirstLaunch(false);
    setIsTourActive(false);
  };

  return (
    <TourContext.Provider value={{
      loading,
      tourCompleted,
      checkTourCompleted,
      currentStep, 
      setCurrentStep,
      completedScreen,
      markScreenAsDone,
      completeTutorial 
    }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);