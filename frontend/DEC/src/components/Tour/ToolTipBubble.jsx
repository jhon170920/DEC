import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { useTour } from '../../context/TourContextTooltip';
import { AuthContext } from '../../context/AuthContext';
import { Colors } from '../../constants/colors';
import { useRoute, useIsFocused } from "@react-navigation/native";

const ToolTipBubble = ({ children, text, stepNumber, nextStep, placement = 'bottom' }) => { // Placement abajo como predeterminado si no se proporciona un lugar
    const { loading, completedScreen, currentStep, setCurrentStep, markScreenAsDone } = useTour();
    const { userToken } = useContext(AuthContext);
    const isFocused = useIsFocused();
    const route = useRoute();
    const [isScreenReady, setIsScreenReady] = useState(false)

    useEffect(() => {
        if (isFocused) {
            const timer = setTimeout(() => {
                setIsScreenReady(true);
            }, 500); // Medio segundo para que todo se asiente y no ocurran problemas de estilos
            return () => clearTimeout(timer);
        } else {
            setIsScreenReady(false);
        }
    }, [isFocused]);

    const isToolTipActive = 
        userToken && // Logueado
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
    // Clonamos el botón para deshabilitarlo y evitar que presione mientrás está el tutorial
    const enhancedChildren = React.isValidElement(children) 
        ? React.cloneElement(children, {
            disabled: isToolTipActive, 
            style: [children.props.style, { width: '100%' }] 
          })
        : children;

    return (
        <Tooltip
            isVisible={isToolTipActive}
            allowChildEvents={false} // Evitar toques accidentales a otros botones diferentes al tour
            backgroundColor="rgba(0, 0, 0, 0.75)"
            // Diseño del globo de texto 
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
            contentStyle={styles.toolTipBubble} // Estilos del globo de texto
            placement={placement} // Ubicaciónn del globo de texto respecto al botón
            onClose={() => {}} // NO hacer nada cuando se toque afuera del globo de texto
        >
            <View style={{ alignSelf: 'stretch', width: '100%' }}> 
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