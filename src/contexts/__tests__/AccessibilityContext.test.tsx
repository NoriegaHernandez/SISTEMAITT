// src/contexts/__tests__/AccessibilityContext.test.tsx
// Pruebas unitarias para AccessibilityContext

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AccessibilityProvider, useAccessibility } from '../AccessibilityContext';
import { ReactNode } from 'react';

describe('AccessibilityContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AccessibilityProvider>{children}</AccessibilityProvider>
  );

  describe('Configuración inicial', () => {
    it('debe inicializar con configuración por defecto', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      expect(result.current.settings.contrastMode).toBe('normal');
      expect(result.current.settings.textSize).toBe('normal');
      expect(result.current.settings.largePointer).toBe(false);
    });

    it('debe cargar configuración guardada de localStorage', () => {
      const savedSettings = {
        contrastMode: 'high',
        textSize: 'large',
        largePointer: true,
      };
      
      localStorage.setItem('accessibility-settings', JSON.stringify(savedSettings));

      const { result } = renderHook(() => useAccessibility(), { wrapper });

      expect(result.current.settings.contrastMode).toBe('high');
      expect(result.current.settings.textSize).toBe('large');
      expect(result.current.settings.largePointer).toBe(true);
    });
  });

  describe('updateSettings', () => {
    it('debe actualizar configuración correctamente', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.updateSettings({ textSize: 'large' });
      });

      expect(result.current.settings.textSize).toBe('large');
    });

    it('debe guardar configuración en localStorage', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.updateSettings({ contrastMode: 'high' });
      });

      const saved = JSON.parse(localStorage.getItem('accessibility-settings')!);
      expect(saved.contrastMode).toBe('high');
    });

    it('debe aplicar estilos de accesibilidad al actualizar', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.updateSettings({ contrastMode: 'deuteranopia' });
      });

      const html = document.querySelector('html');
      expect(html?.classList.contains('deuteranopia')).toBe(true);
    });
  });

  describe('resetSettings', () => {
    it('debe restaurar configuración por defecto', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.updateSettings({ textSize: 'xlarge', contrastMode: 'high' });
      });

      act(() => {
        result.current.resetSettings();
      });

      expect(result.current.settings.textSize).toBe('normal');
      expect(result.current.settings.contrastMode).toBe('normal');
    });

    it('debe limpiar localStorage al resetear', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.updateSettings({ textSize: 'large' });
      });

      act(() => {
        result.current.resetSettings();
      });

      expect(localStorage.getItem('accessibility-settings')).toBeNull();
    });
  });

  describe('exportSettings', () => {
    it('debe exportar configuración como JSON', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.updateSettings({ textSize: 'large', contrastMode: 'high' });
      });

      const exported = result.current.exportSettings();
      const parsed = JSON.parse(exported);

      expect(parsed.textSize).toBe('large');
      expect(parsed.contrastMode).toBe('high');
    });
  });

  describe('importSettings', () => {
    it('debe importar configuración desde JSON', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      const settings = JSON.stringify({
        textSize: 'xlarge',
        contrastMode: 'inverted',
      });

      act(() => {
        result.current.importSettings(settings);
      });

      expect(result.current.settings.textSize).toBe('xlarge');
      expect(result.current.settings.contrastMode).toBe('inverted');
    });

    it('debe manejar JSON inválido sin errores', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.importSettings('invalid json');
      });

      // No debe lanzar error, simplemente no actualizar
      expect(result.current.settings.textSize).toBe('normal');
    });
  });

  describe('Filtros de daltonismo', () => {
    it('debe aplicar filtro de deuteranopia', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.updateSettings({ contrastMode: 'deuteranopia' });
      });

      const html = document.querySelector('html');
      expect(html?.classList.contains('deuteranopia')).toBe(true);
    });

    it('debe aplicar filtro de protanopia', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.updateSettings({ contrastMode: 'protanopia' });
      });

      const html = document.querySelector('html');
      expect(html?.classList.contains('protanopia')).toBe(true);
    });

    it('debe aplicar filtro de tritanopia', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.updateSettings({ contrastMode: 'tritanopia' });
      });

      const html = document.querySelector('html');
      expect(html?.classList.contains('tritanopia')).toBe(true);
    });

    it('debe limpiar filtros anteriores al cambiar', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });
      const html = document.querySelector('html');

      act(() => {
        result.current.updateSettings({ contrastMode: 'deuteranopia' });
      });

      expect(html?.classList.contains('deuteranopia')).toBe(true);

      act(() => {
        result.current.updateSettings({ contrastMode: 'protanopia' });
      });

      expect(html?.classList.contains('deuteranopia')).toBe(false);
      expect(html?.classList.contains('protanopia')).toBe(true);
    });
  });

  describe('Puntero grande', () => {
    it('debe aplicar clase de puntero grande', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.updateSettings({ largePointer: true });
      });

      const root = document.documentElement;
      expect(root.classList.contains('large-pointer')).toBe(true);
    });

    it('debe remover clase de puntero grande', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.updateSettings({ largePointer: true });
      });

      act(() => {
        result.current.updateSettings({ largePointer: false });
      });

      const root = document.documentElement;
      expect(root.classList.contains('large-pointer')).toBe(false);
    });
  });

  describe('Movimiento reducido', () => {
    it('debe aplicar clase de movimiento reducido', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.updateSettings({ reducedMotion: true });
      });

      const root = document.documentElement;
      expect(root.classList.contains('reduce-motion')).toBe(true);
    });
  });

  describe('Alto contraste', () => {
    it('debe aplicar alto contraste', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.updateSettings({ contrastMode: 'high' });
      });

      const root = document.documentElement;
      expect(root.classList.contains('high-contrast')).toBe(true);
    });
  });

  describe('Tamaños de texto', () => {
    it('debe aplicar diferentes tamaños de texto', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });
      const sizes = ['small', 'normal', 'large', 'xlarge', 'xxlarge'] as const;

      sizes.forEach(size => {
        act(() => {
          result.current.updateSettings({ textSize: size });
        });

        expect(result.current.settings.textSize).toBe(size);
      });
    });
  });

  describe('announceMessage', () => {
    it('debe crear elemento de anuncio ARIA', () => {
      const { result } = renderHook(() => useAccessibility(), { wrapper });

      act(() => {
        result.current.announceMessage('Test message');
      });

      // Verificar que se creó el elemento (se elimina después de 3s)
      const announcements = document.querySelectorAll('[role="status"]');
      expect(announcements.length).toBeGreaterThan(0);
    });
  });
});
