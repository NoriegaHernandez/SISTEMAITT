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
  letterSpacing: number; // NUEVA PROPIEDAD
  lineHeight: number; // NUEVA PROPIEDAD
  wordSpacing: number; // NUEVA PROPIEDAD
  
  // Auditivas
  transcriptionEnabled: boolean;
  captions: boolean;
  visualNotifications: boolean;
  screenReader: boolean; // NUEVA PROPIEDAD
  
  // Motoras
  largePointer: boolean;
  keyboardNavigationOnly: boolean;
  slowKeyRepeat: boolean;
  voiceControl: boolean;
  gestureRecognition: boolean;
  onScreenKeyboard: boolean;
  clickAssist: boolean; // NUEVA PROPIEDAD
  
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
  speakText: (text: string) => void; // NUEVA FUNCIÓN
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
  letterSpacing: 0, // NUEVO
  lineHeight: 1.6, // NUEVO
  wordSpacing: 0, // NUEVO
  transcriptionEnabled: false,
  captions: false,
  visualNotifications: true,
  screenReader: false, // NUEVO
  largePointer: false,
  keyboardNavigationOnly: false,
  slowKeyRepeat: false,
  voiceControl: false,
  gestureRecognition: false,
  onScreenKeyboard: false,
  clickAssist: false, // NUEVO
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
      applyAccessibilityStyles(newSettings);
      return newSettings;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility-settings');
    applyAccessibilityStyles(defaultSettings);
  }, []);

  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback((json: string) => {
    try {
      const imported = JSON.parse(json);
      updateSettings(imported);
    } catch (error) {
      console.error('Error importing settings:', error);
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

  // NUEVA FUNCIÓN: speakText para lectura en voz alta
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
      speakText, // AGREGAR AQUÍ
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

// Aplicar estilos de accesibilidad
function applyAccessibilityStyles(settings: AccessibilitySettings) {
  const root = document.documentElement;
  
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

  // NUEVOS ESTILOS: Espaciado
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

  // Contraste
  root.classList.toggle('high-contrast', settings.contrastMode === 'high');
  root.classList.toggle('inverted-colors', settings.contrastMode === 'inverted');

  // Daltonismo - aplicar filtros
  const colorblindFilters = {
    deuteranopia: 'url(#deuteranopia-filter)',
    protanopia: 'url(#protanopia-filter)',
    tritanopia: 'url(#tritanopia-filter)',
  };
  
  if (settings.contrastMode in colorblindFilters) {
    root.style.filter = colorblindFilters[settings.contrastMode as keyof typeof colorblindFilters];
  } else {
    root.style.filter = 'none';
  }

  // Movimiento reducido
  root.classList.toggle('reduce-motion', settings.reducedMotion);

  // Puntero grande
  root.classList.toggle('large-pointer', settings.largePointer);

  // Focus destacado
  root.classList.toggle('highlight-focus', settings.highlightFocusArea);

  // Modo enfocado
  root.classList.toggle('focused-mode', settings.focusedMode === 'focused');
  root.classList.toggle('simplified-mode', settings.focusedMode === 'simplified');

  // Contornos de texto
  root.classList.toggle('text-outline', settings.showTextOutlines);

  // Asistencia de click (hover pause)
  root.classList.toggle('click-assist', settings.clickAssist);

  // Inyectar fuente Dyslexic si es necesaria
  if (settings.textStyle === 'dyslexic' && !document.getElementById('dyslexic-font')) {
    const link = document.createElement('link');
    link.id = 'dyslexic-font';
    link.href = 'https://fonts.cdnfonts.com/css/opendyslexic';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
}