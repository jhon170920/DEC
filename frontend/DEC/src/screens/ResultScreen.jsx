import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ResultStyles } from '../styles/ResultStyles';

export default function ResultScreen({ route, navigation }) {
  const { result } = route.params;
  const { userToken } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultado del Análisis</Text>

      <Text style={styles.text}>
        Enfermedad: {result.disease}
      </Text>

      <Text style={styles.text}>
        Confianza: {result.confidence}
      </Text>

      {userToken ? (
        <Text style={styles.text}>
          Tratamiento: Aplicar fungicida orgánico.
        </Text>
      ) : (
        <Text style={styles.text}>
          Inicia sesión para ver el tratamiento completo.
        </Text>
      )}

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.button}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 10 },
  button: { marginTop: 20, color: 'blue' }
});