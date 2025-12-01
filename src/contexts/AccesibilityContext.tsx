// src/contexts/AccessibilityContext.tsx
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
  screenMagnification: number; // 100-300%
  showTextOutlines: boolean;
  reducedMotion: boolean;
  flashingDisabled: boolean;
  colorBlindMode: boolean;
  
  // Auditivas
  transcriptionEnabled: boolean;
  captions: boolean;
  visualNotifications: boolean;
  
  // Motoras
  largePointer: boolean;
  keyboardNavigationOnly: boolean;
  slowKeyRepeat: boolean;
  voiceControl: boolean;
  gestureRecognition: boolean;
  onScreenKeyboard: boolean;
  
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
  transcriptionEnabled: false,
  captions: false,
  visualNotifications: true,
  largePointer: false,
  keyboardNavigationOnly: false,
  slowKeyRepeat: false,
  voiceControl: false,
  gestureRecognition: false,
  onScreenKeyboard: false,
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

  useEffect(() => {
    applyAccessibilityStyles(settings);
  }, [settings]);

  return (
    <AccessibilityContext.Provider value={{
      settings,
      updateSettings,
      resetSettings,
      exportSettings,
      importSettings,
      announceMessage,
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
  if (settings.contrastMode === 'high') {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  if (settings.contrastMode === 'inverted') {
    root.classList.add('inverted-colors');
  } else {
    root.classList.remove('inverted-colors');
  }

  // Daltonismo
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
  if (settings.reducedMotion) {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }

  // Puntero grande
  if (settings.largePointer) {
    root.classList.add('large-pointer');
  } else {
    root.classList.remove('large-pointer');
  }

  // Focus destacado
  if (settings.highlightFocusArea) {
    root.classList.add('highlight-focus');
  } else {
    root.classList.remove('highlight-focus');
  }

  // Inyectar fuente Dyslexic si es necesaria
  if (settings.textStyle === 'dyslexic' && !document.getElementById('dyslexic-font')) {
    const link = document.createElement('link');
    link.id = 'dyslexic-font';
    link.href = 'https://fonts.googleapis.com/css2?family=OpenDyslexic&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
}