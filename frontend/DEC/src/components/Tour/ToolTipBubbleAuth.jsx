import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { useTour } from '../../context/TourContextTooltip';
import { Colors } from '../../constants/colors';
import { useRoute, useIsFocused } from "@react-navigation/native";

const ToolTipBubbleAuth = ({ children, text, stepNumber, nextStep, placement = 'bottom' }) => { // Placement abajo como predeterminado si no se proporciona un lugar
    const { loading, completedScreen, currentStep, setCurrentStep, markScreenAsDone } = useTour();
    const isFocused = useIsFocused();
    const route = useRoute();
    const [isScreenReady, setIsScreenReady] = useState(false)

    useEffect(() => {
        if (isFocused) {
            const timer = setTimeout(() => {
                setIsScreenReady(true);
            }, 800); // Medio segundo para que todo se asiente y no ocurran problemas de estilos
            return () => clearTimeout(timer);
        } else {
            setIsScreenReady(false);
        }
    }, [isFocused]);

    const isToolTipActive = 
        isScreenReady && // IMPORTANTE para evitar errores de estilos
        !completedScreen[route.name] && // Si no ha completado el tutorial en esta screen
        currentStep === stepNumber; // Mismo paso

    const handleAction = async () => {
        // Tomamos el valor dado desde la screen si es el último paso
        if (nextStep === 'finishScreen'){
            await markScreenAsDone(route.name); // Marcar la screen como terminada
            setCurrentStep(0);
        } else {
            setCurrentStep(nextStep);
        }
    };

    // ✅ Saltar todo el tour de esta screen
    const handleSkipTour = async () => {
        await markScreenAsDone(route.name);
        setCurrentStep(0);
    };

    // Clonamos el botón para deshabilitarlo y evitar que presione mientrás está el tutorial
    const enhancedChildren = React.isValidElement(children) 
        ? React.cloneElement(children, {
            disabled: isToolTipActive, 
            style: [children.props.style] 
          })
        : children;

    return (
        <Tooltip
            isVisible={isToolTipActive}
            allowChildEvents={false} // Evitar toques accidentales a otros botones diferentes al tour
            backgroundColor="rgba(0, 0, 0, 0.75)"
            // Diseño del globo de texto 
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
            contentStyle={styles.toolTipBubbleAuth} // Estilos del globo de texto
            placement={placement} // Ubicaciónn del globo de texto respecto al botón
            onClose={() => {}} // NO hacer nada cuando se toque afuera del globo de texto
        >
            <View style={{ alignSelf: 'stretch', width: '100%', height: 'auto' }} pointerEvents={isToolTipActive ? 'none' : 'auto'}> 
                {enhancedChildren}
            </View>
        </Tooltip>
    );
};

const styles = StyleSheet.create({
    toolTipBubbleAuth: {
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
        backgroundColor: Colors.surfaceAlt,
        borderWidth: 1,
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

export default ToolTipBubbleAuth;