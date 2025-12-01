// src/components/AccessibilityPanel.tsx
import { useState, useRef, useEffect } from 'react';
import { useAccessibility } from '../contexts/AccesibilityContext';
import { 
  Settings, X, Download, Upload, RotateCcw, Eye, Volume2, Mouse, Brain,
  Type, Maximize2, Contrast, Moon, Zap, Keyboard, Mic, Hand, Minimize2
} from 'lucide-react';

export default function AccessibilityPanel() {
  const { settings, updateSettings, resetSettings, exportSettings, importSettings, announceMessage } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'audio' | 'motor' | 'cognitive'>('visual');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          announceMessage('Panel de accesibilidad abierto');
        }}
        className="fixed bottom-4 right-4 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Abrir panel de accesibilidad"
        title="Accesibilidad (Alt+A)"
      >
        <Settings className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-white rounded-lg shadow-2xl border-2 border-blue-600">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Accesibilidad
        </h2>
        <button
          onClick={() => {
            setIsOpen(false);
            announceMessage('Panel de accesibilidad cerrado');
          }}
          className="p-1 hover:bg-blue-700 rounded transition-colors"
          aria-label="Cerrar panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {[
          { id: 'visual', label: 'Visuales', icon: Eye },
          { id: 'audio', label: 'Auditivas', icon: Volume2 },
          { id: 'motor', label: 'Motoras', icon: Mouse },
          { id: 'cognitive', label: 'Cognitivas', icon: Brain },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 p-3 border-b-2 flex items-center justify-center gap-1 transition-colors ${
              activeTab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-blue-600'
            }`}
            aria-label={`Opciones ${label.toLowerCase()}`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'visual' && (
          <div className="space-y-4">
            {/* Contraste */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Contrast className="w-4 h-4" />
                Contraste
              </label>
              <select
                value={settings.contrastMode}
                onChange={(e) => updateSettings({ contrastMode: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Modo de contraste"
              >
                <option value="normal">Normal</option>
                <option value="high">Alto Contraste</option>
                <option value="inverted">Colores Invertidos</option>
                <option value="deuteranopia">Daltonismo - Deuteranopaía</option>
                <option value="protanopia">Daltonismo - Protanopaía</option>
                <option value="tritanopia">Daltonismo - Tritanopaía</option>
              </select>
              <small className="text-gray-600">Selecciona tu tipo de visión cromática</small>
            </div>

            {/* Tamaño de texto */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Type className="w-4 h-4" />
                Tamaño de Texto
              </label>
              <div className="flex gap-2">
                {['small', 'normal', 'large', 'xlarge', 'xxlarge'].map((size) => (
                  <button
                    key={size}
                    onClick={() => updateSettings({ textSize: size as any })}
                    className={`px-3 py-1 rounded border-2 transition-colors ${
                      settings.textSize === size
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:border-blue-600'
                    }`}
                    style={{ fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : size === 'xlarge' ? '18px' : '14px' }}
                    aria-label={`Tamaño ${size}`}
                  >
                    A
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo de fuente */}
            <div>
              <label className="block text-sm font-semibold mb-2">Tipo de Fuente</label>
              <select
                value={settings.textStyle}
                onChange={(e) => updateSettings({ textStyle: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Tipo de fuente"
              >
                <option value="default">Defecto</option>
                <option value="dyslexic">OpenDyslexic (Dislexia)</option>
                <option value="sans-serif">Sans Serif</option>
                <option value="serif">Serif</option>
              </select>
              <small className="text-gray-600">OpenDyslexic es útil para personas con dislexia</small>
            </div>

            {/* Tema */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Moon className="w-4 h-4" />
                Tema
              </label>
              <div className="flex gap-2">
                {['light', 'dark', 'night'].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => updateSettings({ theme: theme as any })}
                    className={`flex-1 px-3 py-2 rounded border-2 transition-colors ${
                      settings.theme === theme
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:border-blue-600'
                    }`}
                    aria-label={`Tema ${theme}`}
                  >
                    {theme === 'light' && '☀️'}
                    {theme === 'dark' && '🌙'}
                    {theme === 'night' && '🌃'}
                  </button>
                ))}
              </div>
            </div>

            {/* Zoom */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Maximize2 className="w-4 h-4" />
                Zoom: {settings.screenMagnification}%
              </label>
              <input
                type="range"
                min="100"
                max="300"
                step="25"
                value={settings.screenMagnification}
                onChange={(e) => updateSettings({ screenMagnification: Number(e.target.value) })}
                className="w-full"
                aria-label="Nivel de zoom"
              />
            </div>

            {/* Opciones toggleables */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                  aria-label="Reducir movimiento"
                />
                <span className="text-sm">Reducir movimiento y animaciones</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.flashingDisabled}
                  onChange={(e) => updateSettings({ flashingDisabled: e.target.checked })}
                  aria-label="Desactivar parpadeos"
                />
                <span className="text-sm">Desactivar parpadeos (fotosensibilidad)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showTextOutlines}
                  onChange={(e) => updateSettings({ showTextOutlines: e.target.checked })}
                  aria-label="Mostrar contornos de texto"
                />
                <span className="text-sm">Mostrar contornos de texto</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.captions}
                onChange={(e) => updateSettings({ captions: e.target.checked })}
                aria-label="Subtítulos"
              />
              <span className="text-sm">Subtítulos para videos</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.visualNotifications}
                onChange={(e) => updateSettings({ visualNotifications: e.target.checked })}
                aria-label="Notificaciones visuales"
              />
              <span className="text-sm">Notificaciones visuales en lugar de sonidos</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.transcriptionEnabled}
                onChange={(e) => updateSettings({ transcriptionEnabled: e.target.checked })}
                aria-label="Transcripción"
              />
              <span className="text-sm">Transcripción en tiempo real</span>
            </label>

            <div className="p-3 bg-blue-50 rounded text-sm text-gray-700">
              💡 Las notificaciones visuales ayudan a personas sordas o con pérdida auditiva
            </div>
          </div>
        )}

        {activeTab === 'motor' && (
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.largePointer}
                onChange={(e) => updateSettings({ largePointer: e.target.checked })}
                aria-label="Puntero grande"
              />
              <span className="text-sm">Puntero del ratón grande</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.keyboardNavigationOnly}
                onChange={(e) => updateSettings({ keyboardNavigationOnly: e.target.checked })}
                aria-label="Navegación solo con teclado"
              />
              <span className="text-sm">Navegación solo con teclado</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.slowKeyRepeat}
                onChange={(e) => updateSettings({ slowKeyRepeat: e.target.checked })}
                aria-label="Repetición lenta de teclas"
              />
              <span className="text-sm">Pulsación lenta o filtrado de teclas</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.voiceControl}
                onChange={(e) => updateSettings({ voiceControl: e.target.checked })}
                aria-label="Control por voz"
              />
              <span className="text-sm flex items-center gap-1">
                <Mic className="w-4 h-4" />
                Control por voz
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.onScreenKeyboard}
                onChange={(e) => updateSettings({ onScreenKeyboard: e.target.checked })}
                aria-label="Teclado en pantalla"
              />
              <span className="text-sm">Teclado virtual en pantalla</span>
            </label>

            <div className="p-3 bg-blue-50 rounded text-sm text-gray-700">
              ♿ Estas opciones ayudan a personas con dificultades motoras o parálisis
            </div>
          </div>
        )}

        {activeTab === 'cognitive' && (
          <div className="space-y-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.readAloud}
                onChange={(e) => updateSettings({ readAloud: e.target.checked })}
                aria-label="Lectura en voz alta"
              />
              <span className="text-sm">Lectura en voz alta de contenido</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.simplifiedMenus}
                onChange={(e) => updateSettings({ simplifiedMenus: e.target.checked })}
                aria-label="Menús simplificados"
              />
              <span className="text-sm">Menús y controles simplificados</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.highlightFocusArea}
                onChange={(e) => updateSettings({ highlightFocusArea: e.target.checked })}
                aria-label="Destacar área de enfoque"
              />
              <span className="text-sm">Destacar área de enfoque</span>
            </label>

            <div>
              <label className="block text-sm font-semibold mb-2">Modo de Lectura</label>
              <select
                value={settings.focusedMode}
                onChange={(e) => updateSettings({ focusedMode: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Modo de lectura"
              >
                <option value="normal">Normal</option>
                <option value="focused">Enfocado (ocultar distracciones)</option>
                <option value="simplified">Simplificado</option>
              </select>
            </div>

            <div className="p-3 bg-blue-50 rounded text-sm text-gray-700">
              🧠 Estas opciones ayudan a personas con TDAH, autismo o discapacidades cognitivas
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t p-4 flex gap-2">
        <button
          onClick={handleExport}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
          aria-label="Exportar configuración"
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          aria-label="Importar configuración"
        >
          <Upload className="w-4 h-4" />
          Importar
        </button>

        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
          aria-label="Restablecer configuración"
        >
          <RotateCcw className="w-4 h-4" />
          Restablecer
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>
    </div>
  );
}