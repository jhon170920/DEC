import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Config'; 

export const styles = StyleSheet.create({
  //-- Contenedor principal --
container: {
    flex: 1,
    backgroundColor: Colors.bg,
},

scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 40,
    alignItems: 'center',
},

  // -- Logo y icono --
logoWrapper: {
    marginTop: 36,
    marginBottom: 20,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    // sombra sutil en el logo
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
},

logoImage: {
    width: 52,
    height: 52,
    resizeMode: 'contain',
},

  // -- Titulo --
title: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 36,
    letterSpacing: -0.5,
    textAlign: 'center',
},

  // -- Formulario --
form: {
    width: '100%',
    gap: 24,             // aqui va los espacio entre campos 
},

  // -- Campo individual --
fieldWrapper: {
    width: '100%',
},

label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 6,
    letterSpacing: 0.2,
},

inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
},

inputRowFocused: {
    borderBottomColor: Colors.borderFocus,
},

inputIcon: {
    marginRight: 10,
    color: Colors.textSoft,
},

input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 0,          
},

inputPlaceholder: {           
    color: Colors.textMuted,
 },

  // -- Textarea  --
textareaWrapper: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 140,
},

textareaWrapperFocused: {
    borderColor: Colors.borderFocus,
},

textarea: {
    fontSize: 15,
    color: Colors.text,
    textAlignVertical: 'top',    
    minHeight: 116,
},

  // -- Boton Enviar --
button: {
    width: '100%',
    marginTop: 12,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    // sombra verde
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
},

buttonPressed: {
    backgroundColor: Colors.primary,
    shadowOpacity: 0.15,
    elevation: 2,
},

buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.surface,
    letterSpacing: 0.4,
    },
});