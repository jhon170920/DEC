import { useEffect, useRef } from 'react';
import { UIManager, findNodeHandle, Platform } from 'react-native';

/**
 * Hook que hace scroll automático a un elemento cuando el tooltip está visible
 * @param {boolean} isVisible - Si el tooltip está visible
 * @param {Ref} elementRef - Referencia al elemento que debe ser visible
 * @param {Ref} scrollViewRef - Referencia al ScrollView padre
 * @param {number} offsetTop - Espacio extra desde la parte superior (padding)
 */
const useAutoScrollToElement = (isVisible, elementRef, scrollViewRef, offsetTop = 100) => {
  useEffect(() => {
    if (isVisible && elementRef?.current && scrollViewRef?.current) {
      // Pequeño delay para asegurar que el layout está actualizado
      const timeout = setTimeout(() => {
        try {
          // Obtener la posición del elemento
          const elementHandle = findNodeHandle(elementRef.current);
          
          if (elementHandle && Platform.OS === 'android') {
            // Para Android
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
          } else if (elementHandle && Platform.OS === 'ios') {
            // Para iOS
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
        } catch (error) {
          console.warn('Error obteniendo posición del elemento:', error);
        }
      }, 400); // Aumentado a 400ms para más estabilidad

      return () => clearTimeout(timeout);
    }
  }, [isVisible, elementRef, scrollViewRef, offsetTop]);
};

export default useAutoScrollToElement;