// src/components/VirtualKeyboardWrapper.tsx
import { useEffect, useState } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import VirtualKeyboard from './Virtualkeyboard';

/**
 * Componente wrapper que muestra/oculta el teclado virtual
 * según la configuración de accesibilidad
 */
export default function VirtualKeyboardWrapper() {
  const { settings } = useAccessibility();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostrar el teclado si la opción está activada
    if (settings.onScreenKeyboard) {
      setIsVisible(true);
      console.log('⌨️ Teclado virtual activado');
    } else {
      setIsVisible(false);
      console.log('⌨️ Teclado virtual desactivado');
    }
  }, [settings.onScreenKeyboard]);

  // No renderizar nada si no está activado
  if (!settings.onScreenKeyboard || !isVisible) {
    return null;
  }

  return (
    <VirtualKeyboard
      onClose={() => {
        setIsVisible(false);
        // Nota: No desactivamos la opción automáticamente,
        // solo ocultamos temporalmente. El usuario puede
        // reactivarlo desde el panel de accesibilidad.
      }}
    />
  );
}