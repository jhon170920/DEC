import React, { useState, useContext, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Animated,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
} from 'react-native';
import { scale, moderateScale } from 'react-native-size-matters'
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from '../context/AuthContext';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { Colors } from '../constants/colors';
import { MaterialCommunityIcons} from '@expo/vector-icons'


const API_URL = "http://10.4.1.148:8089/api/users/login";

// ─── CAMPO CON FLOATING LABEL ──────────────────────────────
const FloatingInput = ({ label, value, onChangeText, keyboardType, isPassword, fieldHeight }) => {
    const [secureText, setSecureText] = useState(isPassword)
    const [focused, setFocused] = useState(false);


    const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
    const borderAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(labelAnim, { toValue: focused || value ? 1 : 0, duration: 180, useNativeDriver: true }).start();
        Animated.timing(borderAnim, { toValue: focused ? 1 : 0, duration: 180, useNativeDriver: true }).start();
    }, [focused, value]);

    const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [fieldHeight * 0.28, fieldHeight * 0.10] });
    const labelSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 10] });
    const labelColor = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [Colors.textMuted, Colors.primaryLight] });
    const borderColor = borderAnim.interpolate({ inputRange: [0, 1], outputRange: [Colors.border, Colors.borderFocus] });

    return (
        <Animated.View style={[styles.field, { borderColor, height: fieldHeight }]}>
            <Animated.Text
                style={[styles.floatingLabel, { top: labelTop, fontSize: labelSize, color: labelColor }]}
                pointerEvents="none"
            >
                {focused || value ? label.toUpperCase() : label}
            </Animated.Text>

            <View style={styles.fieldRow}>
                <TextInput
                    style={styles.fieldInput}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onChangeText={onChangeText}
                    value={value}
                    secureTextEntry={secureText}
                    keyboardType={keyboardType || 'default'}
                    selectionColor={Colors.primary}
                    placeholder=''
                    underlineColorAndroid='transparent'
                />

                {/* Mostramos el icono SOLO si 'isPassword' es verdadero */}
                {isPassword && (
                    <TouchableOpacity
                        style={styles.iconContainer}
                        onPress={() => setSecureText(!secureText)}

                    >
                        <MaterialCommunityIcons
                            name={secureText ? 'eye-off-outline' : 'eye-outline'}
                            size={moderateScale(22)}
                            color={focused ? Colors.primary : '#777'}
                        />

                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    // Campos
  field: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  floatingLabel: {
    position: 'absolute',
    left: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    paddingTop: 8,
    paddingBottom: 0,
  },
  iconContainer: {
    paddingHorizontal: scale(6),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
})
export default FloatingInput