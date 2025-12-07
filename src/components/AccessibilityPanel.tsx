// src/components/AccessibilityPanel.tsx
import { useState, useRef, useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { 
  Settings, X, Download, Upload, RotateCcw, Eye, Volume2, Mouse, Brain,
  Type, Maximize2, Contrast, Moon, Keyboard, Mic, Info, MessageSquare,
  AlignLeft, Space, Minus, Plus
} from 'lucide-react';

export default function AccessibilityPanel() {
  const { settings, updateSettings, resetSettings, exportSettings, importSettings, announceMessage, speakText } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'audio' | 'motor' | 'cognitive'>('visual');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejar teclas de acceso rápido
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        announceMessage(isOpen ? 'Panel de accesibilidad cerrado' : 'Panel de accesibilidad abierto');
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, announceMessage]);

  const handleExport = () => {
    const json = exportSettings();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accessibility-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    announceMessage('Configuración de accesibilidad exportada');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = event.target?.result as string;
          importSettings(json);
          announceMessage('Configuración de accesibilidad importada');
        } catch (error) {
          announceMessage('Error al importar configuración', 'assertive');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de que deseas restablecer todas las configuraciones de accesibilidad?')) {
      resetSettings();
      announceMessage('Configuraciones de accesibilidad restablecidas');
    }
  };

  const readPanelContent = () => {
    const tabs = ['Visuales', 'Auditivas', 'Motoras', 'Cognitivas'];
    speakText(`Panel de accesibilidad. Pestaña activa: ${tabs[['visual', 'audio', 'motor', 'cognitive'].indexOf(activeTab)]}`);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          announceMessage('Panel de accesibilidad abierto');
        }}
        onMouseEnter={() => settings.readAloud && speakText('Abrir panel de accesibilidad')}
        className="fixed bottom-4 right-4 z-40 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-300"
        aria-label="Abrir panel de accesibilidad (Alt+A)"
        title="Accesibilidad (Alt+A)"
      >
        <Settings className="w-6 h-6" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 w-full max-w-md bg-white rounded-lg shadow-2xl border-2 border-blue-600"
      role="dialog"
      aria-labelledby="accessibility-panel-title"
      aria-describedby="accessibility-panel-description"
    >
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg">
        <h2 id="accessibility-panel-title" className="text-lg font-bold flex items-center gap-2">
          <Settings className="w-5 h-5" aria-hidden="true" />
          Accesibilidad
        </h2>
        <div className="flex gap-2">
          <button
            onClick={readPanelContent}
            className="p-2 hover:bg-blue-700 rounded transition-colors"
            aria-label="Leer contenido del panel"
            title="Leer panel (Alt+R)"
          >
            <Volume2 className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              announceMessage('Panel de accesibilidad cerrado');
            }}
            className="p-2 hover:bg-blue-700 rounded transition-colors"
            aria-label="Cerrar panel (Alt+A)"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <p id="accessibility-panel-description" className="sr-only">
        Panel de configuración de accesibilidad con opciones visuales, auditivas, motoras y cognitivas.
        Use las teclas de flecha para navegar entre pestañas.
      </p>

      {/* Ayuda de atajos */}
      <div className="bg-blue-50 px-4 py-2 text-xs text-gray-700 border-b">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4" aria-hidden="true" />
          <span>
            <strong>Atajos:</strong> Alt+A (Abrir/Cerrar) | Alt+1-5 (Tamaño texto) | Alt+C (Contraste) | Alt+R (Leer selección)
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" role="tablist" aria-label="Categorías de accesibilidad">
        {[
          { id: 'visual', label: 'Visuales', icon: Eye },
          { id: 'motor', label: 'Motoras', icon: Mouse },
          { id: 'cognitive', label: 'Cognitivas', icon: Brain },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id as any);
              announceMessage(`Pestaña ${label} seleccionada`);
            }}
            onMouseEnter={() => settings.readAloud && speakText(`Pestaña ${label}`)}
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`${id}-panel`}
            className={`flex-1 p-3 border-b-2 flex items-center justify-center gap-2 transition-colors ${
              activeTab === id
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div 
        id={`${activeTab}-panel`}
        role="tabpanel"
        className="p-4 max-h-96 overflow-y-auto"
        aria-labelledby={`${activeTab}-tab`}
      >
        {activeTab === 'visual' && (
          <div className="space-y-4">
            {/* Contraste y Daltonismo */}
            <div>
              <label htmlFor="contrast-mode" className="text-gray-900 block text-sm font-semibold mb-2 flex items-center gap-2">
                <Contrast className="w-4 h-4" aria-hidden="true" />
                Modo de Contraste y Visión Cromática
              </label>
              <select
                id="contrast-mode"
                value={settings.contrastMode}
                onChange={(e) => {
                  updateSettings({ contrastMode: e.target.value as any });
                  announceMessage(`Modo cambiado a ${e.target.value}`);
                }}
                onFocus={() => settings.readAloud && speakText('Modo de contraste')}
                className="text-gray-900 w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="high">Alto Contraste</option>
                <option value="inverted">Colores Invertidos</option>
                <option value="deuteranopia">Daltonismo - Deuteranopaía (Rojo-Verde)</option>
                <option value="protanopia">Daltonismo - Protanopaía (Rojo)</option>
                <option value="tritanopia">Daltonismo - Tritanopaía (Azul-Amarillo)</option>
              </select>
              <small className="text-gray-600 text-xs mt-1 block">
                Selecciona el modo que mejor se adapte a tu tipo de visión
              </small>
            </div>

            {/* Tamaño de texto con controles más accesibles */}
            <div>
              <label className="text-gray-900 block text-sm font-semibold mb-2 flex items-center gap-2">
                <Type className="w-4 h-4" aria-hidden="true" />
                Tamaño de Texto
                <span className="ml-auto text-xs font-normal text-gray-600">(Alt+1 a Alt+5)</span>
              </label>
              <div className="text-gray-900 grid grid-cols-5 gap-2">
                {[
                  { size: 'small', label: 'Pequeño', fontSize: '12px' },
                  { size: 'normal', label: 'Normal', fontSize: '16px' },
                  { size: 'large', label: 'Grande', fontSize: '18px' },
                  { size: 'xlarge', label: 'Muy grande', fontSize: '20px' },
                  { size: 'xxlarge', label: 'Extra grande', fontSize: '24px' },
                ].map(({ size, label, fontSize }) => (
                  <button
                    key={size}
                    onClick={() => {
                      updateSettings({ textSize: size as any });
                      announceMessage(`Tamaño de texto: ${label}`);
                    }}
                    onMouseEnter={() => settings.readAloud && speakText(label)}
                    className={`px-2 py-2 rounded border-2 transition-colors ${
                      settings.textSize === size
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:border-blue-600'
                    }`}
                    style={{ fontSize }}
                    aria-label={label}
                    aria-pressed={settings.textSize === size}
                  >
                    A
                  </button>
                ))}
              </div>
            </div>

            {/* Espaciado de letras */}
            <div>
              <label htmlFor="letter-spacing" className="text-gray-900 block text-sm font-semibold mb-2 flex items-center gap-2">
                <AlignLeft className="text-gray-900 w-4 h-4" aria-hidden="true" />
                Espaciado entre Letras: {settings.letterSpacing}px
              </label>
              <input
                id="letter-spacing"
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={settings.letterSpacing}
                onChange={(e) => updateSettings({ letterSpacing: Number(e.target.value) })}
                onFocus={() => settings.readAloud && speakText('Control de espaciado entre letras')}
                className="w-full"
                aria-valuemin={0}
                aria-valuemax={5}
                aria-valuenow={settings.letterSpacing}
                aria-valuetext={`${settings.letterSpacing} píxeles`}
              />
            </div>

            {/* Altura de línea */}
            <div>
              <label htmlFor="line-height" className="text-gray-900 block text-sm font-semibold mb-2 flex items-center gap-2">
                <Space className="w-4 h-4" aria-hidden="true" />
                Altura de Línea: {settings.lineHeight.toFixed(1)}
              </label>
              <input
                id="line-height"
                type="range"
                min="1.0"
                max="2.5"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => updateSettings({ lineHeight: Number(e.target.value) })}
                onFocus={() => settings.readAloud && speakText('Control de altura de línea')}
                className="w-full"
                aria-valuemin={1.0}
                aria-valuemax={2.5}
                aria-valuenow={settings.lineHeight}
              />
            </div>

            {/* Espaciado de palabras */}
            <div>
              <label htmlFor="word-spacing" className="text-gray-900 block text-sm font-semibold mb-2 flex items-center gap-2">
                <Minus className="w-4 h-4" aria-hidden="true" />
                Espaciado entre Palabras: {settings.wordSpacing}px
              </label>
              <input
                id="word-spacing"
                type="range"
                min="0"
                max="10"
                step="1"
                value={settings.wordSpacing}
                onChange={(e) => updateSettings({ wordSpacing: Number(e.target.value) })}
                onFocus={() => settings.readAloud && speakText('Control de espaciado entre palabras')}
                className="w-full"
                aria-valuemin={0}
                aria-valuemax={10}
                aria-valuenow={settings.wordSpacing}
              />
            </div>

            {/* Tipo de fuente */}
            <div>
              <label htmlFor="font-style" className="text-gray-900 block text-sm font-semibold mb-2">Tipo de Fuente</label>
              <select
                id="font-style"
                value={settings.textStyle}
                onChange={(e) => updateSettings({ textStyle: e.target.value as any })}
                onFocus={() => settings.readAloud && speakText('Selector de tipo de fuente')}
                className="text-gray-900 w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">Predeterminada</option>
                <option value="dyslexic">OpenDyslexic (Dislexia)</option>
                <option value="sans-serif">Sans Serif (Clara)</option>
                <option value="serif">Serif (Tradicional)</option>
              </select>
              <small className="text-gray-600 text-xs mt-1 block">
                OpenDyslexic está diseñada específicamente para personas con dislexia
              </small>
            </div>

          

            {/* Zoom */}
            <div>
              <label htmlFor="zoom-level" className="text-gray-900 block text-sm font-semibold mb-2 flex items-center gap-2">
                <Maximize2 className="w-4 h-4" aria-hidden="true" />
                Nivel de Zoom: {settings.screenMagnification}%
              </label>
              <input
                id="zoom-level"
                type="range"
                min="100"
                max="300"
                step="25"
                value={settings.screenMagnification}
                onChange={(e) => updateSettings({ screenMagnification: Number(e.target.value) })}
                onFocus={() => settings.readAloud && speakText('Control de nivel de zoom')}
                className="w-full"
                aria-valuemin={100}
                aria-valuemax={300}
                aria-valuenow={settings.screenMagnification}
                aria-valuetext={`${settings.screenMagnification} por ciento`}
              />
            </div>

            {/* Opciones de toggle */}
            <fieldset className="text-gray-900 space-y-2 border-t pt-3">
              <legend className="text-sm font-semibold mb-2">Opciones Adicionales</legend>
              
              <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                  className="w-4 h-4"
                  aria-describedby="reduced-motion-desc"
                />
                <span className="text-sm flex-1">Reducir movimiento y animaciones</span>
              </label>
              <span id="reduced-motion-desc" className="sr-only">
                Desactiva animaciones y movimientos para personas sensibles al movimiento
              </span>
              
              <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={settings.flashingDisabled}
                  onChange={(e) => updateSettings({ flashingDisabled: e.target.checked })}
                  className="w-4 h-4"
                  aria-describedby="flashing-desc"
                />
                <span className="text-sm flex-1">Desactivar parpadeos (fotosensibilidad)</span>
              </label>
              <span id="flashing-desc" className="sr-only">
                Importante para personas con epilepsia fotosensible
              </span>

              <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={settings.showTextOutlines}
                  onChange={(e) => updateSettings({ showTextOutlines: e.target.checked })}
                  className="w-4 h-4"
                  aria-describedby="text-outline-desc"
                />
                <span className="text-sm flex-1">Mostrar contornos de texto</span>
              </label>
              <span id="text-outline-desc" className="sr-only">
                Añade un contorno al texto para mejorar la legibilidad
              </span>
            </fieldset>
          </div>
        )}

        
        {activeTab === 'motor' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-700 flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>
                  Estas opciones ayudan a personas con limitaciones motoras, parálisis o que usan dispositivos de asistencia.
                </span>
              </p>
            </div>

            <fieldset className="text-gray-900 space-y-3">
              <legend className="text-sm font-semibold mb-2">Controles de Entrada</legend>
              
              <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded border">
                <input
                  type="checkbox"
                  checked={settings.largePointer}
                  onChange={(e) => updateSettings({ largePointer: e.target.checked })}
                  className="w-5 h-5 mt-0.5"
                  aria-describedby="large-pointer-desc"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium block flex items-center gap-2">
                    <Mouse className="w-4 h-4" aria-hidden="true" />
                    Puntero del ratón grande
                  </span>
                  <span id="large-pointer-desc" className="text-xs text-gray-600">
                    Aumenta el tamaño del cursor para mejor visibilidad
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded border">
                <input
                  type="checkbox"
                  checked={settings.clickAssist}
                  onChange={(e) => updateSettings({ clickAssist: e.target.checked })}
                  className="w-5 h-5 mt-0.5"
                  aria-describedby="click-assist-desc"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium block">Asistencia de clic</span>
                  <span id="click-assist-desc" className="text-xs text-gray-600">
                    Pausa en elementos al pasar el mouse para facilitar clics precisos
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded border">
                <input
                  type="checkbox"
                  checked={settings.keyboardNavigationOnly}
                  onChange={(e) => updateSettings({ keyboardNavigationOnly: e.target.checked })}
                  className="w-5 h-5 mt-0.5"
                  aria-describedby="keyboard-nav-desc"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium block flex items-center gap-2">
                    <Keyboard className="w-4 h-4" aria-hidden="true" />
                    Navegación solo con teclado
                  </span>
                  <span id="keyboard-nav-desc" className="text-xs text-gray-600">
                    Optimiza la interfaz para navegación completa con teclado
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded border">
                <input
                  type="checkbox"
                  checked={settings.onScreenKeyboard}
                  onChange={(e) => updateSettings({ onScreenKeyboard: e.target.checked })}
                  className="w-5 h-5 mt-0.5"
                  aria-describedby="onscreen-keyboard-desc"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium block">Teclado virtual en pantalla</span>
                  <span id="onscreen-keyboard-desc" className="text-xs text-gray-600">
                    Muestra un teclado virtual para entrada de texto
                  </span>
                </div>
              </label>
            </fieldset>
          </div>
        )}

        {activeTab === 'cognitive' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-700 flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>
                  Estas opciones ayudan a personas con TDAH, autismo, dislexia o dificultades cognitivas.
                </span>
              </p>
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold mb-2">Asistencia Cognitiva</legend>
              
              <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded border">
                <input
                  type="checkbox"
                  checked={settings.readAloud}
                  onChange={(e) => updateSettings({ readAloud: e.target.checked })}
                  className="w-5 h-5 mt-0.5"
                  aria-describedby="read-aloud-desc"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium block flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                    Lectura en voz alta (Alt+R para texto seleccionado)
                  </span>
                  <span id="read-aloud-desc" className="text-xs text-gray-600">
                    Lee el contenido de la página en voz alta
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded border">
                <input
                  type="checkbox"
                  checked={settings.simplifiedMenus}
                  onChange={(e) => updateSettings({ simplifiedMenus: e.target.checked })}
                  className="w-5 h-5 mt-0.5"
                  aria-describedby="simplified-menus-desc"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium block">Menús simplificados</span>
                  <span id="simplified-menus-desc" className="text-xs text-gray-600">
                    Reduce la complejidad visual y opciones en menús
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded border">
                <input
                  type="checkbox"
                  checked={settings.highlightFocusArea}
                  onChange={(e) => updateSettings({ highlightFocusArea: e.target.checked })}
                  className="w-5 h-5 mt-0.5"
                  aria-describedby="highlight-focus-desc"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium block">Destacar área de enfoque</span>
                  <span id="highlight-focus-desc" className="text-xs text-gray-600">
                    Resalta claramente el elemento activo o enfocado
                  </span>
                </div>
              </label>
            </fieldset>

            <div>
              <label htmlFor="reading-mode" className="block text-sm font-semibold mb-2">
                Modo de Lectura
              </label>
              <select
                id="reading-mode"
                value={settings.focusedMode}
                onChange={(e) => updateSettings({ focusedMode: e.target.value as any })}
                onFocus={() => settings.readAloud && speakText('Selector de modo de lectura')}
                className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-describedby="reading-mode-desc"
              >
                <option value="normal">Normal</option>
                <option value="focused">Enfocado (menos distracciones)</option>
                <option value="simplified">Simplificado (contenido esencial)</option>
              </select>
              <span id="reading-mode-desc" className="text-xs text-gray-600 mt-1 block">
                Controla cuánta información se muestra simultáneamente
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t p-4 bg-gray-50">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <button
            onClick={handleExport}
            onMouseEnter={() => settings.readAloud && speakText('Exportar configuración')}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm font-medium focus:ring-2 focus:ring-green-500"
            aria-label="Exportar configuración de accesibilidad"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Exportar</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            onMouseEnter={() => settings.readAloud && speakText('Importar configuración')}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium focus:ring-2 focus:ring-blue-500"
            aria-label="Importar configuración de accesibilidad"
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span>Importar</span>
          </button>

          <button
            onClick={handleReset}
            onMouseEnter={() => settings.readAloud && speakText('Restablecer configuración')}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium focus:ring-2 focus:ring-gray-500"
            aria-label="Restablecer configuración a valores predeterminados"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Restablecer</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="sr-only"
          aria-label="Archivo de configuración"
        />

        <p className="text-xs text-center text-gray-600 mt-2">
          Configuración se guarda automáticamente
        </p>
      </div>
    </div>
  );
}