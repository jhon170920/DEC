# 📋 Informe: Arreglo del ScrollView en Expo Web

**Fecha:** 5 de abril de 2026  
**Problema:** ScrollView no desplazarse en web - contenido fijo en una pantalla  
**Solución:** Ajuste de estilos de altura y overflow  

---

## 🔴 Problema Identificado

El `ScrollView` en la landing page web no mostraba:
- Barra de scroll vertical
- Capacidad de desplazamiento
- Contenido completo (parte inferior no visible sin zoom)

El contenido se renderizaba como una **sola pantalla fija**, sin importar cuánto contenido hubiera debajo.

### Síntomas observados:
```
✗ No hay barra de scroll en navegador
✗ Rueda del mouse no funciona
✗ Necesario zoom out para ver todo
✗ Contenido se "aplasta" en viewport
✗ Mensaje en consola: "Normal rendering but no scroll"
```

---

## 🔍 Investigación Realizada

### 1. Búsqueda de causas

Revisé múltiples aspectos:

| Aspecto | Búsqueda | Resultado |
|---------|----------|-----------|
| CSS global | `grep overflow hidden` | No había bloqueos globales |
| Navegadores | Múltiples `NavigationContainer` | Encontré duplicados (otro error) |
| Props ScrollView | `scrollEnabled`, `showsScrollbar` | Parecían correctos |
| Estilos raíz | App.jsx, AppNavigator | Sans restricciones de altura web |
| React Native Web | Diferencias flex/altura | Mobile ≠ Web |

### 2. Diferencia crítica: Mobile vs Web

En **Mobile (React Native nativo):**
```javascript
flexView: { flex: 1 }  // Funciona: expande al 100%
```

En **Web (React Native Web):**
```javascript
flexView: { flex: 1 }  // NO FUNCIONA: flex sin altura explícita
```

React Native Web simula CSS, pero necesita ser más explícito con alturas.

---

## ✅ Solución Implementada

### Cambio 1: `src/screens/web/LandingPage.web.jsx`

**Antes:**
```javascript
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scrollView: { flex: 1, width: '100%' },
  scrollContainer: { flexGrow: 1, minHeight: '100%' },
});
```

**Después:**
```javascript
const styles = StyleSheet.create({
  root: { 
    minHeight: '100vh',      // ← Fuerza altura mínima
    height: '100vh',         // ← Garantiza exactamente 100%
    width: '100%', 
    backgroundColor: C.bg 
  },
  scrollView: { 
    width: '100%', 
    height: '100%',          // ← Ocupa todo el padre
    maxHeight: '100vh',      // ← No puede expandirse más
    overflowY: 'auto'        // ← Habilita scroll vertical
  },
  scrollContainer: { 
    flexGrow: 1,             // ← Expande si hay poco contenido
    width: '100%' 
  },
});
```

**Props importantes añadidas:**
- `height: '100%'` - El ScrollView ocupa todo su contenedor padre
- `maxHeight: '100vh'` - No puede crecer más allá del viewport
- `overflowY: 'auto'` - CSS web para mostrar scroll cuando necesario

### Cambio 2: `App.jsx`

**Antes:**
```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Sin restricción de altura en web
    backgroundColor: '#e6f3ef', 
  },
});
```

**Después:**
```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100vh',      // ← Garantiza que la raíz tenga altura
    width: '100%',           // ← Ancho explícito
    backgroundColor: '#e6f3ef', 
  },
});
```

---

## 🎯 Por qué funciona

```
┌─ App.jsx container (minHeight: 100vh, width: 100%)
│   └─ AppNavigator > NavigationContainer
│       └─ WebNavigator > WebStack
│           └─ LandingPage.web.jsx
│               ├─ root (height: 100vh)
│               └─ ScrollView (height: 100%, maxHeight: 100vh, overflowY: auto)
│                   └─ Content (flexGrow: 1)
│
Ahora: ScrollView SABE su altura → Puede calcular si hay overflow → Muestra scroll
```

**Cadena de causas:**

1. **App root** → `minHeight: 100vh` → Tiene una altura conocida
2. **LandingPage root** → `height: 100vh` → Confina el espacio
3. **ScrollView** → `height: 100%` → Ocupa todo el root
4. **ScrollView** → `maxHeight: 100vh` → No crece más allá
5. **ScrollView** → `overflowY: auto` → Si content > height, muestra scroll
6. **Content** → `flexGrow: 1` → Se expande si hay poco contenido

---

## 📊 Comparativa Final

| Antes | Después |
|-------|---------|
| Sin barra scroll | ✓ Barra scroll visible |
| Zoom necesario | ✓ Desplazamiento natural |
| Una pantalla | ✓ Múltiples secciones visibles |
| Contenido cortado | ✓ Todo accesible |

---

## 🛠️ Checklist para Futuros Problemas similares

```markdown
- [ ] ¿El ScrollView tiene height explícita (no solo flex)?
- [ ] ¿El parent (root) tiene minHeight o height en web?
- [ ] ¿ScrollView tiene overflowY: 'auto' o overflow: 'visible'?
- [ ] ¿Hay overflow: 'hidden' en algún elemento padre?
- [ ] ¿El contenido real es más grande que el ScrollView?
- [ ] ¿Se está usando Platform.OS === 'web' para estilos específicos?
- [ ] ¿DevTools muestra overflow-y: auto en el elemento?
- [ ] ¿La altura del contenedor padre es conocida (px, vh, %)?
```

---

## 🚀 Patrón Recomendado para Web + Mobile

```javascript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      web: { minHeight: '100vh', width: '100%' },
    }),
  },
  
  scrollView: {
    flex: 1,
    ...Platform.select({
      web: { height: '100%', maxHeight: '100vh', overflowY: 'auto' },
    }),
  },
});
```

**Ventajas:**
- Mobile sigue usando `flex` (su patrón nativo)
- Web obtiene restricciones explícitas
- Código limpio y mantenible

---

## 📖 Conceptos Clave

### React Native Web vs Web CSS

| Concepto | React Native | Web CSS |
|----------|--------------|---------|
| Altura con flex | `flex: 1` expande al 100% | `flex: 1` sin altura padre = 0 |
| Scroll | Automático si overflow | Requiere `overflow-y: auto` |
| Unidades | pt (puntos) | px, %, vh, em |
| Padding | Usado por defecto | Afecta el tamaño total |

### Scroll en web requiere:

1. **Contenedor con altura conocida** (100px, 100vh, etc.)
2. **Propiedad overflow** (auto, scroll, visible)
3. **Contenido que exceda esa altura**

Sin los 3, el navegador no renderiza scroll.

---

## 🔗 Archivos Modificados

```
/home/jhon/Documentos/DEC/
├── App.jsx                                    ← Añadido minHeight web
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.jsx                   ← Sin cambios (bien estructurado)
│   │   └── WebNavigator.web.jsx               ← Sin cambios
│   └── screens/
│       └── web/
│           └── LandingPage.web.jsx            ← CAMBIOS PRINCIPALES
```

---

## ✨ Resultado Final

✅ ScrollView funcional en web  
✅ Barra de scroll visible en navegador  
✅ Desplazamiento fluido  
✅ Contenido completo accesible  
✅ Sin necesidad de zoom  

