// src/components/VirtualKeyboard.tsx
import { useEffect, useState, useRef } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { X, Delete, ArrowLeft, ArrowRight, Space } from 'lucide-react';

interface VirtualKeyboardProps {
  onClose?: () => void;
}

export default function VirtualKeyboard({ onClose }: VirtualKeyboardProps) {
  const { settings, announceMessage } = useAccessibility();
  const [activeInput, setActiveInput] = useState<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const [capsLock, setCapsLock] = useState(false);
  const [shift, setShift] = useState(false);
  const [currentLayout, setCurrentLayout] = useState<'letters' | 'numbers' | 'symbols'>('letters');
  const keyboardRef = useRef<HTMLDivElement>(null);

  // Layouts del teclado
  const layouts = {
    letters: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '-'],
    ],
    numbers: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['@', '#', '$', '%', '&', '*', '(', ')', '-', '+'],
      ['=', '/', '\\', '[', ']', '{', '}', '|', ':', ';'],
    ],
    symbols: [
      ['!', '¡', '?', '¿', '\'', '"', '`', '~', '^', '°'],
      ['<', '>', '€', '£', '¥', '§', '¶', '©', '®', '™'],
      ['±', '×', '÷', '≠', '≤', '≥', '∞', '√', '∑', 'π'],
    ],
  };

  // Detectar input activo
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        if (
          target.type !== 'file' &&
          target.type !== 'checkbox' &&
          target.type !== 'radio' &&
          target.type !== 'submit' &&
          target.type !== 'button' &&
          !target.readOnly &&
          !target.disabled
        ) {
          setActiveInput(target);
          announceMessage('Teclado virtual activado', 'polite');
        }
      }
    };

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      const relatedTarget = e.relatedTarget as HTMLElement;
      
      // No cerrar si el foco se mueve al teclado virtual
      if (
        relatedTarget &&
        keyboardRef.current &&
        keyboardRef.current.contains(relatedTarget)
      ) {
        return;
      }
      
      // Mantener el input activo si está dentro del teclado
      if (
        !(relatedTarget && keyboardRef.current && keyboardRef.current.contains(relatedTarget))
      ) {
        // setActiveInput(null); // Comentado para mantener el teclado visible
      }
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, [announceMessage]);

  // Insertar carácter
  const insertChar = (char: string) => {
    if (!activeInput) {
      announceMessage('Por favor, selecciona un campo de texto primero', 'assertive');
      return;
    }

    const start = activeInput.selectionStart || 0;
    const end = activeInput.selectionEnd || 0;
    const value = activeInput.value;
    const newValue = value.substring(0, start) + char + value.substring(end);

    activeInput.value = newValue;
    activeInput.setSelectionRange(start + 1, start + 1);

    // Disparar evento de input para que React detecte el cambio
    const event = new Event('input', { bubbles: true });
    activeInput.dispatchEvent(event);

    // Desactivar shift después de escribir
    if (shift && !capsLock) {
      setShift(false);
    }

    activeInput.focus();
    
    if (settings.readAloud) {
      announceMessage(char, 'polite');
    }
  };

  // Manejar teclas especiales
  const handleBackspace = () => {
    if (!activeInput) return;

    const start = activeInput.selectionStart || 0;
    const end = activeInput.selectionEnd || 0;
    const value = activeInput.value;

    if (start === end && start > 0) {
      // Borrar un carácter
      activeInput.value = value.substring(0, start - 1) + value.substring(end);
      activeInput.setSelectionRange(start - 1, start - 1);
    } else {
      // Borrar selección
      activeInput.value = value.substring(0, start) + value.substring(end);
      activeInput.setSelectionRange(start, start);
    }

    const event = new Event('input', { bubbles: true });
    activeInput.dispatchEvent(event);
    activeInput.focus();
    announceMessage('Borrar', 'polite');
  };

  const handleSpace = () => {
    insertChar(' ');
    announceMessage('Espacio', 'polite');
  };

  const handleEnter = () => {
    if (!activeInput) return;

    if (activeInput instanceof HTMLTextAreaElement) {
      insertChar('\n');
      announceMessage('Nueva línea', 'polite');
    } else {
      // Para inputs, simular submit del formulario si existe
      const form = activeInput.closest('form');
      if (form) {
        form.requestSubmit();
      }
      announceMessage('Enter', 'polite');
    }
  };

  const handleTab = () => {
    if (!activeInput) return;

    // Encontrar el siguiente input
    const inputs = Array.from(
      document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        'input:not([type="hidden"]):not([disabled]), textarea:not([disabled])'
      )
    );
    const currentIndex = inputs.indexOf(activeInput);
    const nextInput = inputs[currentIndex + 1] || inputs[0];

    if (nextInput) {
      nextInput.focus();
      setActiveInput(nextInput);
      announceMessage('Siguiente campo', 'polite');
    }
  };

  const handleArrowLeft = () => {
    if (!activeInput) return;
    const pos = activeInput.selectionStart || 0;
    activeInput.setSelectionRange(pos - 1, pos - 1);
    activeInput.focus();
  };

  const handleArrowRight = () => {
    if (!activeInput) return;
    const pos = activeInput.selectionStart || 0;
    activeInput.setSelectionRange(pos + 1, pos + 1);
    activeInput.focus();
  };

  const toggleCapsLock = () => {
    setCapsLock(!capsLock);
    setShift(false);
    announceMessage(capsLock ? 'Mayúsculas desactivadas' : 'Mayúsculas activadas', 'polite');
  };

  const toggleShift = () => {
    setShift(!shift);
    announceMessage(shift ? 'Shift desactivado' : 'Shift activado', 'polite');
  };

  const getDisplayChar = (char: string) => {
    if (currentLayout !== 'letters') return char;
    if (capsLock || shift) return char.toUpperCase();
    return char;
  };

  return (
    <div
      ref={keyboardRef}
      className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-blue-600 shadow-2xl z-[99999] p-4"
      role="application"
      aria-label="Teclado virtual"
      style={{ maxHeight: '400px' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-800">⌨️ Teclado Virtual</h3>
          {activeInput && (
            <span className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded">
              Campo activo: {activeInput.name || activeInput.placeholder || 'Input'}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Cerrar teclado virtual"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Selector de layout */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setCurrentLayout('letters')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            currentLayout === 'letters'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-pressed={currentLayout === 'letters'}
        >
          ABC
        </button>
        <button
          onClick={() => setCurrentLayout('numbers')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            currentLayout === 'numbers'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-pressed={currentLayout === 'numbers'}
        >
          123
        </button>
        <button
          onClick={() => setCurrentLayout('symbols')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            currentLayout === 'symbols'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          aria-pressed={currentLayout === 'symbols'}
        >
          #+=
        </button>
      </div>

      {/* Teclado */}
      <div className="space-y-2">
        {layouts[currentLayout].map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => insertChar(getDisplayChar(key))}
                className="min-w-[40px] h-12 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded font-medium text-lg transition-colors border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                aria-label={`Tecla ${key}`}
              >
                {getDisplayChar(key)}
              </button>
            ))}
          </div>
        ))}

        {/* Fila de teclas especiales */}
        <div className="flex justify-center gap-1 mt-3">
          <button
            onClick={toggleCapsLock}
            className={`px-4 h-12 rounded font-medium transition-colors border-2 ${
              capsLock
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
            }`}
            aria-pressed={capsLock}
            aria-label="Bloqueo de mayúsculas"
          >
            Caps
          </button>
          
          <button
            onClick={toggleShift}
            className={`px-4 h-12 rounded font-medium transition-colors border-2 ${
              shift
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
            }`}
            aria-pressed={shift}
            aria-label="Shift"
          >
            ⇧ Shift
          </button>

          <button
            onClick={handleSpace}
            className="flex-1 h-12 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded font-medium transition-colors border-2 border-gray-300"
            aria-label="Espacio"
          >
            <Space className="w-6 h-6 mx-auto" />
          </button>

          <button
            onClick={handleBackspace}
            className="px-4 h-12 bg-red-100 hover:bg-red-200 active:bg-red-300 rounded transition-colors border-2 border-red-300"
            aria-label="Borrar"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Fila de controles adicionales */}
        <div className="flex justify-center gap-1">
          <button
            onClick={handleArrowLeft}
            className="px-4 h-10 bg-gray-100 hover:bg-gray-200 rounded transition-colors border-2 border-gray-300"
            aria-label="Flecha izquierda"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleArrowRight}
            className="px-4 h-10 bg-gray-100 hover:bg-gray-200 rounded transition-colors border-2 border-gray-300"
            aria-label="Flecha derecha"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleTab}
            className="px-6 h-10 bg-gray-100 hover:bg-gray-200 rounded font-medium transition-colors border-2 border-gray-300"
            aria-label="Siguiente campo"
          >
            Tab ↹
          </button>

          <button
            onClick={handleEnter}
            className="px-6 h-10 bg-green-100 hover:bg-green-200 rounded font-medium transition-colors border-2 border-green-300"
            aria-label="Enter"
          >
            ↵ Enter
          </button>
        </div>
      </div>

      {/* Información del estado */}
      <div className="mt-3 text-sm text-gray-600 text-center">
        {!activeInput && (
          <p className="text-yellow-700 bg-yellow-50 py-2 px-4 rounded">
            ⚠️ Haz clic en un campo de texto para empezar a escribir
          </p>
        )}
        {capsLock && <span className="mr-3 text-blue-700 font-medium">🔒 MAYÚSCULAS</span>}
        {shift && <span className="text-blue-700 font-medium">⇧ SHIFT</span>}
      </div>
    </div>
  );
}