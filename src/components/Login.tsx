
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { GraduationCap, Mail, Lock, AlertCircle } from 'lucide-react';
import StudentRegister from './StudentRegister';

export default function Login() {
  const { signIn } = useAuth();
  const { settings, announceMessage, speakText } = useAccessibility();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    announceMessage('Iniciando sesión, por favor espere', 'polite');

    try {
      await signIn(email, password);
      announceMessage('Inicio de sesión exitoso', 'assertive');
    } catch (err: any) {
      const errorMsg = err.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      setError(errorMsg);
      announceMessage(`Error: ${errorMsg}`, 'assertive');
      if (settings.readAloud) {
        speakText(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (showRegister) {
    return <StudentRegister onBack={() => {
      setShowRegister(false);
      announceMessage('Volviendo al inicio de sesión');
    }} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center"
          role="banner"
        >
          <div 
            className="flex justify-center mb-4"
            onMouseEnter={() => settings.readAloud && speakText('Sistema de Análisis de Calidad Académica')}
          >
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
              <GraduationCap className="w-12 h-12" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Bienvenido</h1>
          <p className="text-blue-100 text-sm">Sistema de Análisis de Calidad Académica</p>
          <p className="text-blue-200 text-xs mt-1">Instituto Tecnológico de Tijuana</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div 
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6" role="region" aria-label="Formulario de inicio de sesión">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => {
                    if (settings.readAloud) {
                      speakText('Campo de correo electrónico');
                    }
                    announceMessage('Campo de correo electrónico enfocado');
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Correo electrónico')}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="tu@correo.com"
                  aria-describedby="email-description"
                />
                <span id="email-description" className="sr-only">
                  Ingresa tu dirección de correo electrónico institucional
                </span>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => {
                    if (settings.readAloud) {
                      speakText('Campo de contraseña');
                    }
                    announceMessage('Campo de contraseña enfocado');
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Contraseña')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit(e as any);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                  aria-describedby="password-description"
                />
                <span id="password-description" className="sr-only">
                  Ingresa tu contraseña
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              onMouseEnter={() => settings.readAloud && speakText('Botón Iniciar Sesión')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              aria-label={loading ? 'Iniciando sesión, por favor espere' : 'Iniciar sesión en el sistema'}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center border-t pt-6">
            <p className="text-sm text-gray-600 mb-2">
              ¿Eres estudiante y no tienes cuenta?
            </p>
            <button
              onClick={() => {
                setShowRegister(true);
                announceMessage('Abriendo formulario de registro de estudiantes');
                if (settings.readAloud) {
                  speakText('Abriendo registro de estudiantes');
                }
              }}
              onMouseEnter={() => settings.readAloud && speakText('Regístrate aquí')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
              aria-label="Ir al formulario de registro de estudiantes"
            >
              Regístrate aquí
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t space-y-3">
            <p 
              className="text-xs text-center text-gray-500"
              role="note"
            >
              ¿Problemas para acceder? Contacta al administrador del sistema
            </p>
            <p 
              className="text-xs text-center text-gray-400 flex items-center justify-center gap-1"
              role="contentinfo"
            >
              <Lock className="w-3 h-3" aria-hidden="true" />
              Sistema protegido con autenticación de correo electrónico
            </p>
          </div>
        </div>
      </div>

      {/* Screen Reader Only Instructions */}
      <div className="sr-only" role="complementary" aria-label="Instrucciones de accesibilidad">
        <h2>Instrucciones de accesibilidad:</h2>
        <ul>
          <li>Use Tab para navegar entre campos</li>
          <li>Presione Enter para enviar el formulario</li>
          <li>Presione Alt+A para abrir el panel de accesibilidad</li>
          <li>Los errores se anunciarán automáticamente</li>
        </ul>
      </div>
    </div>
  );
}