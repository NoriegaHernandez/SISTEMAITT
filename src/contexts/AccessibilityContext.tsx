// src/contexts/AccessibilityContext.tsx - VERSIÓN CORREGIDA PARA FILTROS
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

export type ContrastMode = 'normal' | 'high' | 'inverted' | 'deuteranopia' | 'protanopia' | 'tritanopia';
export type TextSize = 'small' | 'normal' | 'large' | 'xlarge' | 'xxlarge';
export type TextStyle = 'default' | 'dyslexic' | 'sans-serif' | 'serif';
export type Theme = 'light' | 'dark' | 'night';
export type ReadingMode = 'normal' | 'focused' | 'simplified';

export interface AccessibilitySettings {
  // Visuales
  contrastMode: ContrastMode;
  textSize: TextSize;
  textStyle: TextStyle;
  theme: Theme;
  screenMagnification: number;
  showTextOutlines: boolean;
  reducedMotion: boolean;
  flashingDisabled: boolean;
  colorBlindMode: boolean;
  letterSpacing: number;
  lineHeight: number;
  wordSpacing: number;
  
  // Auditivas
  transcriptionEnabled: boolean;
  captions: boolean;
  visualNotifications: boolean;
  screenReader: boolean;
  
  // Motoras
  largePointer: boolean;
  keyboardNavigationOnly: boolean;
  slowKeyRepeat: boolean;
  voiceControl: boolean;
  gestureRecognition: boolean;
  onScreenKeyboard: boolean;
  clickAssist: boolean;
  
  // Cognitivas
  readAloud: boolean;
  focusedMode: ReadingMode;
  simplifiedMenus: boolean;
  highlightFocusArea: boolean;
  
  // Fuentes de letra accesibles
  accessibleFont: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (json: string) => void;
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
  speakText: (text: string) => void;
}

const defaultSettings: AccessibilitySettings = {
  contrastMode: 'normal',
  textSize: 'normal',
  textStyle: 'default',
  theme: 'light',
  screenMagnification: 100,
  showTextOutlines: false,
  reducedMotion: false,
  flashingDisabled: false,
  colorBlindMode: false,
  letterSpacing: 0,
  lineHeight: 1.6,
  wordSpacing: 0,
  transcriptionEnabled: false,
  captions: false,
  visualNotifications: true,
  screenReader: false,
  largePointer: false,
  keyboardNavigationOnly: false,
  slowKeyRepeat: false,
  voiceControl: false,
  gestureRecognition: false,
  onScreenKeyboard: false,
  clickAssist: false,
  readAloud: false,
  focusedMode: 'normal',
  simplifiedMenus: false,
  highlightFocusArea: false,
  accessibleFont: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const updateSettings = useCallback((updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
      
      // Log especial para cambios importantes
      if ('contrastMode' in updates) {
        console.log(' Modo de contraste actualizado:', {
          anterior: prev.contrastMode,
          nuevo: updates.contrastMode,
          timestamp: new Date().toISOString()
        });
      }
      
      if ('largePointer' in updates) {
        console.log(' Puntero grande actualizado:', {
          nuevoValor: updates.largePointer,
          timestamp: new Date().toISOString()
        });
      }
      
      applyAccessibilityStyles(newSettings);
      return newSettings;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility-settings');
    applyAccessibilityStyles(defaultSettings);
    console.log(' Configuración de accesibilidad restablecida');
  }, []);

  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback((json: string) => {
    try {
      const imported = JSON.parse(json);
      updateSettings(imported);
      console.log(' Configuración importada exitosamente');
    } catch (error) {
      console.error('Error al importar configuración:', error);
    }
  }, [updateSettings]);

  const announceMessage = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => announcement.remove(), 3000);
  }, []);

  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window && settings.readAloud) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, [settings.readAloud]);

  useEffect(() => {
    applyAccessibilityStyles(settings);
    
    // Configurar atajos de teclado
    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt+A para abrir panel de accesibilidad
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        announceMessage('Atajo de teclado: Alt+A presionado');
      }
      
      // Alt+1 al Alt+5 para cambiar tamaños de texto
      if (e.altKey && ['1', '2', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        const sizes: TextSize[] = ['small', 'normal', 'large', 'xlarge', 'xxlarge'];
        const index = parseInt(e.key) - 1;
        updateSettings({ textSize: sizes[index] });
        announceMessage(`Tamaño de texto cambiado a ${sizes[index]}`);
      }

      // Alt+C para alto contraste
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        const newMode = settings.contrastMode === 'high' ? 'normal' : 'high';
        updateSettings({ contrastMode: newMode });
        announceMessage(`Contraste cambiado a ${newMode === 'high' ? 'alto' : 'normal'}`);
      }

      // Alt+R para leer texto seleccionado
      if (e.altKey && e.key === 'r' && settings.readAloud) {
        e.preventDefault();
        const selection = window.getSelection()?.toString();
        if (selection) {
          speakText(selection);
        }
      }

      // Alt+P para toggle puntero grande (debugging)
      if (e.altKey && e.key === 'p') {
        e.preventDefault();
        const newValue = !settings.largePointer;
        updateSettings({ largePointer: newValue });
        announceMessage(`Puntero grande ${newValue ? 'activado' : 'desactivado'}`);
        console.log('⌨️ Atajo Alt+P - Puntero grande:', newValue);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [settings, announceMessage, speakText, updateSettings]);

  return (
    <AccessibilityContext.Provider value={{
      settings,
      updateSettings,
      resetSettings,
      exportSettings,
      importSettings,
      announceMessage,
      speakText,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

// Aplicar estilos de accesibilidad - VERSIÓN CORREGIDA PARA FILTROS
function applyAccessibilityStyles(settings: AccessibilitySettings) {
  const root = document.documentElement;
  const htmlElement = document.querySelector('html') as HTMLElement;
  
  console.log('🎨 Aplicando estilos de accesibilidad...', {
    contrastMode: settings.contrastMode,
    largePointer: settings.largePointer,
    timestamp: new Date().toISOString()
  });
  
  // Limpiar TODAS las clases de accesibilidad primero
  const accessibilityClasses = [
    'high-contrast',
    'inverted-colors',
    'protanopia',
    'deuteranopia',
    'tritanopia',
    'reduce-motion',
    'large-pointer',
    'highlight-focus',
    'focused-mode',
    'simplified-mode',
    'text-outline',
    'click-assist',
    'dark-mode',
    'night-mode',
    'keyboard-only'
  ];
  
  accessibilityClasses.forEach(className => {
    root.classList.remove(className);
    htmlElement?.classList.remove(className);
  });
  
  // Tamaño de texto
  const fontSizeMap = {
    small: '12px',
    normal: '16px',
    large: '18px',
    xlarge: '20px',
    xxlarge: '24px',
  };
  root.style.fontSize = fontSizeMap[settings.textSize];

  // Tipo de fuente
  const fontMap = {
    default: 'system-ui, -apple-system, sans-serif',
    dyslexic: "'OpenDyslexic', sans-serif",
    'sans-serif': 'Trebuchet MS, Lucida Sans, sans-serif',
    serif: 'Georgia, serif',
  };
  root.style.fontFamily = fontMap[settings.textStyle];

  // Espaciado
  root.style.letterSpacing = `${settings.letterSpacing}px`;
  root.style.lineHeight = `${settings.lineHeight}`;
  root.style.wordSpacing = `${settings.wordSpacing}px`;

  // Zoom/Magnificación
  root.style.zoom = `${settings.screenMagnification}%`;

  // Tema
  const themeMap: Record<Theme, Record<string, string>> = {
    light: {
      '--bg-primary': '#ffffff',
      '--text-primary': '#000000',
      '--bg-secondary': '#f5f5f5',
    },
    dark: {
      '--bg-primary': '#1a1a1a',
      '--text-primary': '#ffffff',
      '--bg-secondary': '#2d2d2d',
    },
    night: {
      '--bg-primary': '#0a0e27',
      '--text-primary': '#e0e6ff',
      '--bg-secondary': '#1a1f3a',
    },
  };

  Object.entries(themeMap[settings.theme]).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Aplicar clases según el tema
  if (settings.theme === 'dark') {
    root.classList.add('dark-mode');
  } else if (settings.theme === 'night') {
    root.classList.add('night-mode');
  }

  // Contraste y Daltonismo - CORRECCIÓN: Aplicar a HTML en lugar de :root
  if (settings.contrastMode === 'high') {
    root.classList.add('high-contrast');
    console.log(' Alto contraste aplicado');
  } else if (settings.contrastMode === 'inverted') {
    root.classList.add('inverted-colors');
    console.log(' Colores invertidos aplicados');
  } else if (settings.contrastMode === 'deuteranopia') {
    // Aplicar clase tanto a html como a root
    htmlElement?.classList.add('deuteranopia');
    root.classList.add('deuteranopia');
    
    console.log('✅ Filtro deuteranopia aplicado - verificando...');
    
    setTimeout(() => {
      const filter = document.getElementById('deuteranopia-filter');
      const htmlHasClass = htmlElement?.classList.contains('deuteranopia');
      const rootHasClass = root.classList.contains('deuteranopia');
      
      console.log('   📋 Estado del filtro deuteranopia:', {
        filtroSVGExiste: !!filter,
        htmlTieneClase: htmlHasClass,
        rootTieneClase: rootHasClass,
        computedFilter: window.getComputedStyle(htmlElement).filter
      });
      
      if (!filter) {
        console.error('❌ PROBLEMA: El filtro SVG deuteranopia NO existe');
        console.log('   💡 Asegúrate de que <ColorblindFilters /> está en App.tsx');
      } else if (window.getComputedStyle(htmlElement).filter === 'none') {
        console.warn('⚠️ El filtro existe pero no se está aplicando');
        console.log('   💡 Verifica que accessibility.css se esté cargando correctamente');
      }
    }, 100);
  } else if (settings.contrastMode === 'protanopia') {
    htmlElement?.classList.add('protanopia');
    root.classList.add('protanopia');
    console.log(' Filtro protanopia aplicado');
    
    setTimeout(() => {
      const filter = document.getElementById('protanopia-filter');
      console.log('    Filtro SVG protanopia:', {
        existe: !!filter,
        htmlClass: htmlElement?.classList.contains('protanopia'),
        computedFilter: window.getComputedStyle(htmlElement).filter
      });
    }, 100);
  } else if (settings.contrastMode === 'tritanopia') {
    htmlElement?.classList.add('tritanopia');
    root.classList.add('tritanopia');
    console.log(' Filtro tritanopia aplicado');
    
    setTimeout(() => {
      const filter = document.getElementById('tritanopia-filter');
      console.log('    Filtro SVG tritanopia:', {
        existe: !!filter,
        htmlClass: htmlElement?.classList.contains('tritanopia'),
        computedFilter: window.getComputedStyle(htmlElement).filter
      });
    }, 100);
  } else {
    console.log('ℹ Modo de contraste: normal');
  }

  // Movimiento reducido
  if (settings.reducedMotion) {
    root.classList.add('reduce-motion');
  }

  // PUNTERO GRANDE
  if (settings.largePointer) {
    root.classList.add('large-pointer');
    document.body.style.cursor = 'var(--cursor-large-default)';
    
    console.log(' Puntero grande ACTIVADO:', {
      claseAñadida: root.classList.contains('large-pointer'),
      cursorBody: document.body.style.cursor,
    });
  } else {
    root.classList.remove('large-pointer');
    document.body.style.cursor = '';
    
    console.log('Puntero grande DESACTIVADO');
  }

  // Focus destacado
  if (settings.highlightFocusArea) {
    root.classList.add('highlight-focus');
  }

  // Modo enfocado
  if (settings.focusedMode === 'focused') {
    root.classList.add('focused-mode');
  } else if (settings.focusedMode === 'simplified') {
    root.classList.add('simplified-mode');
  }

  // Contornos de texto
  if (settings.showTextOutlines) {
    root.classList.add('text-outline');
  }

  // Asistencia de click
  if (settings.clickAssist) {
    root.classList.add('click-assist');
  }

  // Navegación solo por teclado
  if (settings.keyboardNavigationOnly) {
    root.classList.add('keyboard-only');
  }

  // Inyectar fuente Dyslexic si es necesaria
  if (settings.textStyle === 'dyslexic' && !document.getElementById('dyslexic-font')) {
    const link = document.createElement('link');
    link.id = 'dyslexic-font';
    link.href = 'https://fonts.cdnfonts.com/css/opendyslexic';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }

  // Log final de resumen
  console.log(' Resumen de estilos aplicados:', {
    contrastMode: settings.contrastMode,
    punteroGrande: settings.largePointer,
    htmlHasClass: htmlElement?.classList.contains(settings.contrastMode),
    rootHasClass: root.classList.contains(settings.contrastMode),
    todasLasClasesRoot: Array.from(root.classList).filter(c => accessibilityClasses.includes(c)),
    todasLasClasesHTML: Array.from(htmlElement?.classList || []).filter(c => accessibilityClasses.includes(c))
  });
}