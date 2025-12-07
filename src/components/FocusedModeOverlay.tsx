// src/components/FocusedModeOverlay.tsx
import { useEffect, useState } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { X, Maximize2, Minimize2 } from 'lucide-react';

/**
 * Componente que aplica el modo enfocado/simplificado
 * de manera visual y efectiva
 */
export default function FocusedModeOverlay() {
  const { settings, updateSettings, announceMessage } = useAccessibility();
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Limpiar clases previas
    root.classList.remove('focused-mode', 'simplified-mode');

    if (settings.focusedMode === 'normal') {
      // Modo normal - sin cambios
      body.style.removeProperty('filter');
      return;
    }

    // Aplicar clase según el modo
    if (settings.focusedMode === 'focused') {
      root.classList.add('focused-mode');
      applyFocusedStyles();
      announceMessage('Modo enfocado activado - Distracciones reducidas', 'polite');
      console.log('📖 Modo enfocado activado');
    } else if (settings.focusedMode === 'simplified') {
      root.classList.add('simplified-mode');
      applySimplifiedStyles();
      announceMessage('Modo simplificado activado - Solo contenido esencial', 'polite');
      console.log('📋 Modo simplificado activado');
    }

    // Cleanup
    return () => {
      removeFocusedStyles();
      removeSimplifiedStyles();
    };
  }, [settings.focusedMode, announceMessage]);

  const applyFocusedStyles = () => {
    // Atenuar elementos que NO sean el contenido principal
    const elementsToBlur = [
      'nav:not([role="main"])',
      'aside',
      'header:not(.main-header)',
      'footer',
      '[class*="sidebar"]',
      '[class*="advertisement"]',
      '[class*="ad-"]',
      '[class*="banner"]',
      '[role="complementary"]',
      '[role="banner"]:not(.main-banner)',
    ];

    elementsToBlur.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        (el as HTMLElement).style.opacity = '0.3';
        (el as HTMLElement).style.filter = 'blur(2px)';
        (el as HTMLElement).style.pointerEvents = 'none';
        (el as HTMLElement).setAttribute('data-focused-mode', 'blurred');
      });
    });

    // Centrar y destacar el contenido principal
    const mainContent = document.querySelector('main') || 
                       document.querySelector('[role="main"]') ||
                       document.querySelector('#root > div');
    
    if (mainContent) {
      (mainContent as HTMLElement).style.maxWidth = '800px';
      (mainContent as HTMLElement).style.margin = '0 auto';
      (mainContent as HTMLElement).style.padding = '2rem';
      (mainContent as HTMLElement).style.backgroundColor = 'var(--bg-primary)';
      (mainContent as HTMLElement).style.position = 'relative';
      (mainContent as HTMLElement).style.zIndex = '10';
      (mainContent as HTMLElement).setAttribute('data-focused-mode', 'active');
    }
  };

  const applySimplifiedStyles = () => {
    // Ocultar elementos secundarios completamente
    const elementsToHide = [
      '[class*="advanced"]',
      '[class*="optional"]',
      '[data-complexity="advanced"]',
      'aside',
      '[role="complementary"]',
      '.secondary-navigation',
      '[class*="sidebar"]',
      'footer',
      '[class*="advertisement"]',
    ];

    elementsToHide.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        (el as HTMLElement).style.display = 'none';
        (el as HTMLElement).setAttribute('data-simplified-mode', 'hidden');
      });
    });

    // Simplificar navegación - solo mostrar elementos principales
    const navItems = document.querySelectorAll('nav a, nav button');
    navItems.forEach((item, index) => {
      if (index > 3) { // Solo mantener los primeros 4 elementos
        (item as HTMLElement).style.display = 'none';
        (item as HTMLElement).setAttribute('data-simplified-mode', 'hidden');
      }
    });
  };

  const removeFocusedStyles = () => {
    const blurredElements = document.querySelectorAll('[data-focused-mode="blurred"]');
    blurredElements.forEach((el) => {
      (el as HTMLElement).style.removeProperty('opacity');
      (el as HTMLElement).style.removeProperty('filter');
      (el as HTMLElement).style.removeProperty('pointer-events');
      el.removeAttribute('data-focused-mode');
    });

    const activeElements = document.querySelectorAll('[data-focused-mode="active"]');
    activeElements.forEach((el) => {
      (el as HTMLElement).style.removeProperty('max-width');
      (el as HTMLElement).style.removeProperty('margin');
      (el as HTMLElement).style.removeProperty('padding');
      (el as HTMLElement).style.removeProperty('background-color');
      (el as HTMLElement).style.removeProperty('position');
      (el as HTMLElement).style.removeProperty('z-index');
      el.removeAttribute('data-focused-mode');
    });
  };

  const removeSimplifiedStyles = () => {
    const hiddenElements = document.querySelectorAll('[data-simplified-mode="hidden"]');
    hiddenElements.forEach((el) => {
      (el as HTMLElement).style.removeProperty('display');
      el.removeAttribute('data-simplified-mode');
    });
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
      announceMessage('Pantalla completa activada', 'polite');
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
      announceMessage('Pantalla completa desactivada', 'polite');
    }
  };

  const exitFocusedMode = () => {
    updateSettings({ focusedMode: 'normal' });
    announceMessage('Modo de lectura desactivado', 'polite');
  };

  // No mostrar overlay si está en modo normal
  if (settings.focusedMode === 'normal') {
    return null;
  }

  return (
    <>
      {/* Indicador visual del modo activo */}
      <div
        className="fixed top-4 right-4 z-[9999] bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-medium">
            {settings.focusedMode === 'focused' ? '📖 Modo Enfocado' : '📋 Modo Simplificado'}
          </span>
        </div>

        <div className="flex gap-2 border-l border-white/30 pl-3">
          {document.fullscreenEnabled && (
            <button
              onClick={toggleFullScreen}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label={isFullScreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              title={isFullScreen ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa (F11)'}
            >
              {isFullScreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            onClick={exitFocusedMode}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Salir del modo de lectura"
            title="Salir del modo de lectura"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Instrucciones flotantes */}
      <div
        className="fixed bottom-4 right-4 z-[9998] bg-white border-2 border-blue-600 rounded-lg shadow-lg p-4 max-w-sm"
        role="complementary"
        aria-label="Información del modo de lectura"
      >
        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
          {settings.focusedMode === 'focused' ? '📖 Modo Enfocado' : '📋 Modo Simplificado'}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          {settings.focusedMode === 'focused'
            ? 'Los elementos secundarios están atenuados para ayudarte a concentrarte en el contenido principal.'
            : 'Solo se muestra el contenido esencial. Los elementos avanzados están ocultos.'}
        </p>
        <div className="flex gap-2 text-xs">
          <kbd className="px-2 py-1 bg-gray-100 rounded border">Esc</kbd>
          <span className="text-gray-600">para salir</span>
        </div>
      </div>

      {/* Efecto de overlay sutil */}
      {settings.focusedMode === 'focused' && (
        <div
          className="fixed inset-0 bg-black/10 pointer-events-none z-[5]"
          aria-hidden="true"
        />
      )}
    </>
  );
}