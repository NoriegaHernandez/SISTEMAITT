// src/components/LargePointerTracker.tsx
import { useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

/**
 * Componente que mejora el puntero grande añadiendo un círculo visual
 * que sigue el cursor del mouse cuando la opción está activada.
 * 
 * Este componente soluciona problemas con cursores personalizados que
 * algunos navegadores no soportan correctamente.
 */
export default function LargePointerTracker() {
  const { settings } = useAccessibility();

  useEffect(() => {
    if (!settings.largePointer) return;

    let cursorCircle: HTMLDivElement | null = null;
    let hoverCircle: HTMLDivElement | null = null;
    let isOverClickable = false;

    // Crear círculos seguidores
    const createCursorCircles = () => {
      // Círculo principal (siempre visible)
      cursorCircle = document.createElement('div');
      cursorCircle.id = 'large-cursor-tracker';
      cursorCircle.style.cssText = `
        position: fixed;
        width: 48px;
        height: 48px;
        border: 4px solid rgba(0, 102, 204, 0.8);
        border-radius: 50%;
        background: rgba(0, 102, 204, 0.15);
        pointer-events: none;
        z-index: 999999;
        transform: translate(-50%, -50%);
        transition: all 0.1s ease-out;
        mix-blend-mode: multiply;
      `;
      document.body.appendChild(cursorCircle);

      // Círculo de hover (aparece sobre elementos clickeables)
      hoverCircle = document.createElement('div');
      hoverCircle.id = 'large-cursor-hover';
      hoverCircle.style.cssText = `
        position: fixed;
        width: 64px;
        height: 64px;
        border: 3px solid rgba(255, 140, 0, 0.9);
        border-radius: 50%;
        background: rgba(255, 215, 0, 0.2);
        pointer-events: none;
        z-index: 999998;
        transform: translate(-50%, -50%) scale(0);
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        opacity: 0;
      `;
      document.body.appendChild(hoverCircle);
    };

    // Actualizar posición del cursor
    const updateCursorPosition = (e: MouseEvent) => {
      if (cursorCircle) {
        cursorCircle.style.left = `${e.clientX}px`;
        cursorCircle.style.top = `${e.clientY}px`;
      }
      if (hoverCircle) {
        hoverCircle.style.left = `${e.clientX}px`;
        hoverCircle.style.top = `${e.clientY}px`;
      }
    };

    // Detectar elementos clickeables
    const checkClickableElement = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickableElements = [
        'A',
        'BUTTON',
        'INPUT',
        'SELECT',
        'TEXTAREA',
        'LABEL',
      ];
      
      const isClickable = 
        clickableElements.includes(target.tagName) ||
        target.hasAttribute('role') && ['button', 'link', 'tab', 'menuitem'].includes(target.getAttribute('role') || '') ||
        target.hasAttribute('onclick') ||
        target.style.cursor === 'pointer' ||
        window.getComputedStyle(target).cursor === 'pointer';

      if (isClickable !== isOverClickable) {
        isOverClickable = isClickable;
        if (hoverCircle) {
          if (isClickable) {
            hoverCircle.style.transform = 'translate(-50%, -50%) scale(1)';
            hoverCircle.style.opacity = '1';
          } else {
            hoverCircle.style.transform = 'translate(-50%, -50%) scale(0)';
            hoverCircle.style.opacity = '0';
          }
        }
        
        // Animar el círculo principal
        if (cursorCircle) {
          if (isClickable) {
            cursorCircle.style.width = '56px';
            cursorCircle.style.height = '56px';
            cursorCircle.style.borderColor = 'rgba(255, 140, 0, 0.8)';
            cursorCircle.style.background = 'rgba(255, 215, 0, 0.2)';
          } else {
            cursorCircle.style.width = '48px';
            cursorCircle.style.height = '48px';
            cursorCircle.style.borderColor = 'rgba(0, 102, 204, 0.8)';
            cursorCircle.style.background = 'rgba(0, 102, 204, 0.15)';
          }
        }
      }
    };

    // Efecto de click
    const handleClick = () => {
      if (cursorCircle) {
        cursorCircle.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => {
          if (cursorCircle) {
            cursorCircle.style.transform = 'translate(-50%, -50%) scale(1)';
          }
        }, 150);
      }
    };

    // Ocultar cuando el cursor sale de la ventana
    const handleMouseLeave = () => {
      if (cursorCircle) cursorCircle.style.opacity = '0';
      if (hoverCircle) hoverCircle.style.opacity = '0';
    };

    const handleMouseEnter = () => {
      if (cursorCircle) cursorCircle.style.opacity = '1';
    };

    // Inicializar
    createCursorCircles();

    // Event listeners
    document.addEventListener('mousemove', updateCursorPosition);
    document.addEventListener('mousemove', checkClickableElement);
    document.addEventListener('click', handleClick);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', updateCursorPosition);
      document.removeEventListener('mousemove', checkClickableElement);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      
      if (cursorCircle) cursorCircle.remove();
      if (hoverCircle) hoverCircle.remove();
    };
  }, [settings.largePointer]);

  return null; // Este componente no renderiza nada
}