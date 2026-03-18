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
    paddingBottom: 40,
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

  // -- Banner verde principal --
banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 28,
    gap: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 6,
},

bannerIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
},

bannerTextWrapper: {
    flex: 1,
},

bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.surface,
    letterSpacing: -0.3,
    marginBottom: 4,
},

bannerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.80)',
    lineHeight: 18,
},

  // -- Titulo de seccion --
sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 16,
},

  // -- Contenedor de todos los pasos --
stepsContainer: {
    width: '100%',
    gap: 12,
},

  // -- Card de paso --
stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
},

stepCardPressed: {
    backgroundColor: Colors.surfaceAlt,
},

  // Icono del paso
stepIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
},

  // Contenido textual de pasos
stepContent: {
    flex: 1,
},

stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
},

stepDescription: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryLight,
    lineHeight: 18,
},
});