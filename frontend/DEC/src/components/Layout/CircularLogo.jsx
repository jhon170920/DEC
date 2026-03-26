import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { scale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors'
// 1. Importamos la imagen localmente para mejor rendimiento
// Asegúrate de tener tu logo PNG en esta ruta
const logoPng = require('../../../assets/image/logo.png'); 

const LogoCircular = ({ size = scale(70), ...props }) => {
  // Calculamos el radio para que sea un círculo perfecto
  const borderRadius = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius }, props.style]}>
      <Image 
        source={logoPng} 
        style={styles.image}
        // 2. resizeMode="contain" asegura que el PNG no se estire ni se corte
        resizeMode="contain" 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.border,
    borderWidth: 1,
    elevation: 5, // sombra para androud
    //sombra para IOS
    shadowColor: Colors.bg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  image: {
    // La imagen ocupa el 75% del círculo para dejar un margen respirable
    width: '85%', 
    height: '85%',
  },
});

export default LogoCircular;