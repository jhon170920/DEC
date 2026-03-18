import { StyleSheet } from 'react-native';
import { Colors } from '../constants/colors'; 

export const styles = StyleSheet.create({

  // -- Contenedor principal --
container: {
    flex: 1,
    backgroundColor: Colors.bg,
},

scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 120, // Con esto dejo un espacio pal footer fijo 
},

  // -- Header (logo y icono del usuario) --
header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: Colors.bg,
},

logoImage: {
    width: 52,
    height: 52,
    resizeMode: 'contain',
},

avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
},

  // -- Titulo --
title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 20,
    letterSpacing: -0.8,
},

  // -- Lista de analisis --
list: {
    gap: 12, // si no se usa marginBottom en cada card pngan 0.71 
},

  // -- Card de analisis --
card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 12,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
},

cardPressed: {
    backgroundColor: Colors.surfaceAlt,
},

  // Imagen miniatura
cardImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
    resizeMode: 'cover',
    backgroundColor: Colors.border,
},

  // Contenido texto de la card
cardContent: {
    flex: 1,
    marginLeft: 14,
},

cardDate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 3,
    fontWeight: '500',
},

cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 20,
},
  // son los estilos de la flecha que esta al lado de las enfermedades ">"
cardChevron: {
    fontSize: 18,
    color: Colors.textMuted,
    paddingLeft: 8,
},

  // -- Seleccion (checkbox opcional) --
cardSelected: {
    borderWidth: 2,
    borderColor: Colors.primaryLight,
},

checkmark: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
},

checkmarkText: {
    color: Colors.surface,
    fontSize: 11,
    fontWeight: '800',
},

  // -- Footer fijo --
footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 28, 
    backgroundColor: Colors.bg,
    gap: 12,
},

  // Boton Eliminar Seleccionados
deleteButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
},

deleteButtonPressed: {
    backgroundColor: Colors.surfaceAlt,
},

deleteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.1,
},

  // boton icono de la hamburgesa
filterButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
},

filterButtonPressed: {
    backgroundColor: Colors.surfaceAlt,
},

  // -- Estado vacio  estilos en la pantalla cuando no hay datos--
emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
},

emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    },
});