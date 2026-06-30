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

  // ✅ Saltar todo el tour de esta screen
  const handleSkipTour = async () => {
    setTooltipVisible(false);
    await markScreenAsDone(route.name);
    setCurrentStep(0);
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
        <View style={styles.wrapper}>
          {/* ✅ Burbuja independiente de "Saltar tour" */}
          <TouchableOpacity onPress={handleSkipTour} style={styles.skipBubble} activeOpacity={0.7}>
            <Text style={styles.skipBubbleText}>Saltar tour ✕</Text>
          </TouchableOpacity>

          {/* Burbuja principal con el contenido del paso */}
          <View style={styles.container}>
            <Text style={styles.text}>{text}</Text>
            <TouchableOpacity onPress={handleAction} style={styles.button}> 
              <Text style={styles.buttonText}>
                Entendido
              </Text>
            </TouchableOpacity>
          </View>
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
    // ✅ Sin fondo/borde propio: ahora cada burbuja interna dibuja el suyo
    height: 'auto',
    width: 250,
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  wrapper: {
    alignItems: 'center',
  },
  skipBubble: {
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.primaryLight,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 8, // separación entre la burbuja de saltar y la del contenido
  },
  skipBubbleText: {
    color: Colors.textSoft,
    fontSize: 13,
    fontWeight: '600',
  },
  container: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: Colors.primaryLight,
    width: 250,
  },
  text: {
    fontSize: 18,
    color: Colors.textSoft,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  skipButton: {
    padding: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipButtonText: {
    color: Colors.textSoft,
    fontSize: 14,
    textDecorationLine: 'underline',
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