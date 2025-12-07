import { useState } from 'react';
import { BarChart3, Upload, FileText, Settings, LogOut, BookOpen } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useAccessibility } from './contexts/AccessibilityContext';
import Login from './components/Login';
import ExcelImport from './components/ExcelImport';
import ParetoAnalysisView from './components/ParetoAnalysisView';
import Reports from './components/Reports';
import SetupWizard from './components/SetupWizard';
import UserManagement from './components/UserManagement';
import GroupManagement from './components/GroupManagement';
import TeacherGroupsView from './components/TeacherGroupsView';
import StudentDashboard from './components/StudentDashboard';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import AccessibilityPanel from './components/AccessibilityPanel';
import ColorblindFilters from './components/ColorblindFilters';
import LargePointerTracker from './components/LargePointerTracker';
import VirtualKeyboardWrapper from './components/Virtualkeyboardwrapper';
import FocusedModeOverlay from './components/FocusedModeOverlay';

type View = 'dashboard' | 'my-groups' | 'analysis' | 'reports' | 'import' | 'setup' | 'users' | 'groups';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const { settings, announceMessage, speakText } = useAccessibility();
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const handleViewChange = (view: View, viewLabel: string) => {
    setCurrentView(view);
    announceMessage(`Navegando a ${viewLabel}`, 'polite');
    if (settings.readAloud) {
      speakText(viewLabel);
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100"
        role="status"
        aria-live="polite"
        aria-label="Cargando aplicación"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" aria-hidden="true"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  const handleSignOut = async () => {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      announceMessage('Cerrando sesión', 'polite');
      await signOut();
    }
  };

  const renderView = () => {
    // Student views
    if (profile.role === 'student') {
      return <StudentDashboard />;
    }

    // Teacher views
    if (profile.role === 'teacher') {
      switch (currentView) {
        case 'my-groups':
        case 'dashboard':
          return <TeacherGroupsView />;
        case 'analysis':
          return <ParetoAnalysisView />; 
        case 'reports':
          return <Reports />;
        case 'import': 
          return <ExcelImport onSuccess={() => handleViewChange('dashboard', 'Mis Grupos')} />;
        default:
          return <TeacherGroupsView />;
      }
    }

    // Admin views
    switch (currentView) {
      case 'analysis':
        return <ParetoAnalysisView />;
      case 'import':
        return <ExcelImport onSuccess={() => handleViewChange('groups', 'Gestión de Grupos')} />;
      case 'reports':
        return <Reports />;
      case 'setup':
        return <SetupWizard onComplete={() => handleViewChange('dashboard', 'Panel Principal')} />;
      case 'users':
        return <UserManagement />;
      case 'groups':
        return <GroupManagement />;
      default:
        return (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="region"
            aria-label="Panel de control principal"
          >
            <div 
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" 
              onClick={() => handleViewChange('groups', 'Gestión de Grupos')}
              onMouseEnter={() => settings.readAloud && speakText('Gestión de Grupos, Materias y docentes')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleViewChange('groups', 'Gestión de Grupos');
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Ir a Gestión de Grupos: Crea grupos de materias, asigna docentes e inscribe estudiantes"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <BookOpen className="w-8 h-8 text-indigo-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Gestión de Grupos</h3>
                  <p className="text-sm text-gray-600">Materias y docentes</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                Crea grupos de materias, asigna docentes e inscribe estudiantes.
              </p>
            </div>

            <div 
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" 
              onClick={() => handleViewChange('setup', 'Configuración del Sistema')}
              onMouseEnter={() => settings.readAloud && speakText('Configuración, Carreras y materias')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleViewChange('setup', 'Configuración del Sistema');
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Ir a Configuración: Administra el catálogo de carreras y materias del instituto"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                  <Settings className="w-8 h-8 text-slate-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Configuración</h3>
                  <p className="text-sm text-gray-600">Carreras y materias</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                Administra el catálogo de carreras y materias del instituto.
              </p>
            </div>

            <div 
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" 
              onClick={() => handleViewChange('users', 'Gestión de Usuarios')}
              onMouseEnter={() => settings.readAloud && speakText('Gestión de Usuarios, Administradores, docentes y alumnos')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleViewChange('users', 'Gestión de Usuarios');
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Ir a Gestión de Usuarios: Crea y administra cuentas de usuarios del sistema con diferentes roles"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Settings className="w-8 h-8 text-purple-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Gestión de Usuarios</h3>
                  <p className="text-sm text-gray-600">Admin, docentes y alumnos</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">
                Crea y administra cuentas de usuarios del sistema con diferentes roles.
              </p>
            </div>
          </div>
        );
    }
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrador',
      teacher: 'Docente',
      student: 'Estudiante',
    };
    return labels[role as keyof typeof labels] || role;
  };

  // Menú de navegación para docentes
  const teacherMenu = (
    <nav 
      className="flex items-center gap-2"
      role="navigation"
      aria-label="Menú de navegación del docente"
    >
      <button
        onClick={() => handleViewChange('dashboard', 'Mis Grupos')}
        onMouseEnter={() => settings.readAloud && speakText('Mis Grupos')}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          currentView === 'dashboard' || currentView === 'my-groups'
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        aria-current={currentView === 'dashboard' || currentView === 'my-groups' ? 'page' : undefined}
        aria-label="Ir a Mis Grupos"
      >
        Mis Grupos
      </button>
      <button
        onClick={() => handleViewChange('analysis', 'Análisis de Pareto')}
        onMouseEnter={() => settings.readAloud && speakText('Análisis de Pareto')}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          currentView === 'analysis'
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        aria-current={currentView === 'analysis' ? 'page' : undefined}
        aria-label="Ir a Análisis de Pareto"
      >
        Análisis de Pareto
      </button>
      <button
        onClick={() => handleViewChange('reports', 'Reportes')}
        onMouseEnter={() => settings.readAloud && speakText('Reportes')}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          currentView === 'reports'
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        aria-current={currentView === 'reports' ? 'page' : undefined}
        aria-label="Ir a Reportes"
      >
        Reportes
      </button>
      <button
        onClick={() => handleViewChange('import', 'Importar Datos')}
        onMouseEnter={() => settings.readAloud && speakText('Importar Datos')}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          currentView === 'import'
            ? 'bg-blue-100 text-blue-700'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        aria-current={currentView === 'import' ? 'page' : undefined}
        aria-label="Ir a Importar Datos"
      >
        Importar
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header con logos */}
      <header 
        className="flex justify-center items-center gap-6 py-4 bg-white shadow-sm"
        role="banner"
      >
       <img
  src="/src/Images/educacionnuevo.jpg"
  alt="Logo de la Secretaría de Educación Pública de México"
  className="w-60 h-60 object-contain"
/>
<img
  src="/src/Images/logo-tecnm.svg"
  alt="Logo del Tecnológico Nacional de México"
  className="w-60 h-60 object-contain"
/>
<img
  src="/src/Images/logo_TECT.jpg"
  alt="Escudo del Instituto Tecnológico de Tijuana"
  className="w-40 h-40 object-contain"
/>
      </header>
      
      {/* Barra de navegación */}
      <nav 
        className="bg-white shadow-md border-b border-gray-200"
        role="navigation"
        aria-label="Navegación principal"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <BookOpen 
                className="w-8 h-8 text-blue-600" 
                aria-hidden="true"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Sistema de Análisis de Calidad Académica
                </h1>
                <p className="text-xs text-gray-600">
                  Instituto Tecnológico de Tijuana
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {profile.role === 'teacher' && teacherMenu}
              
              <div 
                className="text-right"
                role="status"
                aria-label={`Usuario: ${profile.full_name}, Rol: ${getRoleLabel(profile.role)}`}
              >
                <p className="text-sm font-medium text-gray-800">{profile.full_name}</p>
                <p className="text-xs text-gray-600">{getRoleLabel(profile.role)}</p>
              </div>
              
              {currentView !== 'dashboard' && profile.role === 'admin' && (
                <button
                  onClick={() => handleViewChange('dashboard', 'Panel Principal')}
                  onMouseEnter={() => settings.readAloud && speakText('Ir al Panel Principal')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  aria-label="Volver al panel principal"
                >
                  Inicio
                </button>
              )}
              
              <button
                onClick={handleSignOut}
                onMouseEnter={() => settings.readAloud && speakText('Cerrar Sesión')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                aria-label="Cerrar sesión y salir del sistema"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        role="main"
        aria-label="Contenido principal"
      >
        {renderView()}
      </main>

      {/* Screen Reader Only Instructions */}
      <div className="sr-only" role="complementary" aria-label="Instrucciones de navegación global">
        <h2>Instrucciones de navegación:</h2>
        <ul>
          <li>Use Tab para navegar entre elementos interactivos</li>
          <li>Presione Enter o Espacio para activar botones y enlaces</li>
          <li>Use el menú de navegación para cambiar entre secciones</li>
          {profile.role === 'admin' && (
            <li>En el panel principal, use Tab para navegar entre las tarjetas de gestión</li>
          )}
          <li>Presione Alt+A para abrir el panel de accesibilidad</li>
          <li>Presione Alt+P para activar/desactivar el puntero grande</li>
          <li>Los cambios de sección se anunciarán automáticamente</li>
        </ul>
      </div>
    </div>
  );
}

function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <ColorblindFilters/>
        <FocusedModeOverlay />
        <LargePointerTracker />
        <VirtualKeyboardWrapper />
        <AppContent />
        <AccessibilityPanel />
      </AuthProvider>
    </AccessibilityProvider>
  );
}

export default App;