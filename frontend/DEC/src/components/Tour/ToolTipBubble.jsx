import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, UIManager, findNodeHandle, Platform } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { useTour } from '../../context/TourContextTooltip';
import { AuthContext } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';
import { useRoute, useIsFocused } from "@react-navigation/native";

const ToolTipBubble = ({ 
  children, 
  text, 
  stepNumber, 
  nextStep, 
  placement = 'bottom',
  scrollViewRef = null,
  offsetTop = 120
}) => {
  const { loading, completedScreen, currentStep, setCurrentStep, markScreenAsDone } = useTour();
  const { userToken } = useContext(AuthContext);
  const isFocused = useIsFocused();
  const route = useRoute();
  const [isScreenReady, setIsScreenReady] = useState(false);
  const elementRef = useRef(null);
  
  // ✅ Estado local para controlar cuándo mostrar el tooltip
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isFocused) {
      const timer = setTimeout(() => {
        setIsScreenReady(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsScreenReady(false);
    }
  }, [isFocused]);

  const isToolTipActive = 
    userToken &&
    isScreenReady &&
    !completedScreen[route.name] &&
    currentStep === stepNumber;

  // ✅ Efecto que maneja el scroll y luego la aparición del tooltip
  useEffect(() => {
    // Limpiar cualquier timer pendiente al cambiar condiciones
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (isToolTipActive && elementRef?.current && scrollViewRef?.current) {
      // Primero ocultamos el tooltip si estaba visible (por si acaso)
      setTooltipVisible(false);
      
      // Hacemos scroll automático
      const elementHandle = findNodeHandle(elementRef.current);
      if (elementHandle) {
        UIManager.measureInWindow(elementHandle, (x, y, width, height) => {
          try {
            if (scrollViewRef.current) {
              scrollViewRef.current.scrollTo({
                y: y - offsetTop,
                animated: true,
              });
            }
          } catch (error) {
            console.warn('Error en scroll:', error);
          }
        });
      }
      
      // Esperamos a que termine la animación del scroll (~300-400ms)
      timerRef.current = setTimeout(() => {
        setTooltipVisible(true);
        timerRef.current = null;
      }, 500); // Suficiente para scroll suave
    } else {
      // Si ya no debe estar activo, ocultamos tooltip
      setTooltipVisible(false);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isToolTipActive, elementRef, scrollViewRef, offsetTop]);

  const handleAction = async () => {
    // Al hacer clic en "Entendido", ocultamos tooltip y avanzamos
    setTooltipVisible(false);
    if (nextStep === 'finishScreen') {
      await markScreenAsDone(route.name);
      setCurrentStep(0);
    } else {
      setCurrentStep(nextStep);
    }
  };

  const enhancedChildren = React.isValidElement(children) 
    ? React.cloneElement(children, {
        disabled: tooltipVisible, 
        style: [children.props.style, { width: '100%' }] 
      })
    : children;

  return (
    <Tooltip
      isVisible={tooltipVisible}  // ✅ Usamos el estado local
      allowChildEvents={false}
      backgroundColor="rgba(0, 0, 0, 0.75)"
      content={
        <View style={styles.container}>
          <Text style={styles.text}>{text}</Text>
          <TouchableOpacity onPress={handleAction} style={styles.button}> 
            <Text style={styles.buttonText}>
              Entendido
            </Text>
          </TouchableOpacity>
        </View>
      }
      contentStyle={styles.toolTipBubble}
      placement={placement}
      onClose={() => {}}
    >
      <View 
        ref={elementRef}
        style={{ alignSelf: 'stretch', width: '100%' }} 
      > 
        {enhancedChildren}
      </View>
    </Tooltip>
  );
};

const styles = StyleSheet.create({
  toolTipBubble: {
    height: 'auto',
    width: 250,
    padding: 0,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.primaryLight
  },
  container: {
    padding: 16,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: Colors.textSoft,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 20,
  },
  button: {
    padding: 4,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
  },
  buttonText: {
    color: Colors.primaryLight,
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ToolTipBubble;