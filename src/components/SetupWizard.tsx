
// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase';
// import { Settings, Plus, Trash2, Save, BookOpen, GraduationCap } from 'lucide-react';

// interface Carrera {
//   id: string;
//   nombre: string;
//   codigo: string | null;
//   creado_en: string;
// }

// interface Materia {
//   id: string;
//   nombre: string;
//   codigo: string | null;
//   semestre: number;
//   carrera_id: string | null;
//   carreras?: { nombre: string } | null;
//   creado_en: string;
// }

// interface SetupWizardProps {
//   onComplete: () => void;
// }

// export default function SetupWizard({ onComplete }: SetupWizardProps) {
//   const [carreras, setCarreras] = useState<Carrera[]>([]);
//   const [materias, setMaterias] = useState<Materia[]>([]);
//   const [activeTab, setActiveTab] = useState<'carreras' | 'materias'>('carreras');
//   const [loading, setLoading] = useState(false);

//   const [newCarrera, setNewCarrera] = useState({ nombre: '', codigo: '' });
//   const [newMateria, setNewMateria] = useState({ 
//     nombre: '', 
//     codigo: '', 
//     semestre: 1, 
//     carrera_id: '' 
//   });

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       // Cargar carreras
//       const { data: carrerasData, error: carrerasError } = await supabase
//         .from('carreras')
//         .select('*')
//         .order('nombre');

//       if (carrerasError) {
//         console.error('Error loading carreras:', carrerasError);
//       } else {
//         setCarreras(carrerasData || []);
//       }

//       // Cargar materias con sus carreras
//       const { data: materiasData, error: materiasError } = await supabase
//         .from('materias')
//         .select(`
//           *,
//           carreras (nombre)
//         `)
//         .order('nombre');

//       if (materiasError) {
//         console.error('Error loading materias:', materiasError);
//       } else {
//         setMaterias(materiasData || []);
//       }
//     } catch (error) {
//       console.error('Error in loadData:', error);
//     }
//   };

//   const addCarrera = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!newCarrera.nombre.trim()) {
//       alert('El nombre de la carrera es obligatorio');
//       return;
//     }

//     setLoading(true);
//     try {
//       const { error } = await supabase.from('carreras').insert({
//         nombre: newCarrera.nombre.trim(),
//         codigo: newCarrera.codigo.trim() || null,
//       });

//       if (error) {
//         console.error('Error adding carrera:', error);
//         alert(`Error al agregar carrera: ${error.message}`);
//         return;
//       }

//       alert('Carrera agregada correctamente');
//       setNewCarrera({ nombre: '', codigo: '' });
//       loadData();
//     } catch (error: any) {
//       console.error('Error adding carrera:', error);
//       alert(`Error al agregar carrera: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteCarrera = async (id: string) => {
//     if (!confirm('¿Estás seguro de eliminar esta carrera? Esto puede afectar a estudiantes y materias asociadas.')) {
//       return;
//     }

//     setLoading(true);
//     try {
//       const { error } = await supabase.from('carreras').delete().eq('id', id);

//       if (error) {
//         console.error('Error deleting carrera:', error);
//         alert(`Error al eliminar: ${error.message}`);
//         return;
//       }

//       alert('Carrera eliminada');
//       loadData();
//     } catch (error: any) {
//       console.error('Error deleting carrera:', error);
//       alert(`Error: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const addMateria = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!newMateria.nombre.trim()) {
//       alert('El nombre de la materia es obligatorio');
//       return;
//     }

//     setLoading(true);
//     try {
//       const { error } = await supabase.from('materias').insert({
//         nombre: newMateria.nombre.trim(),
//         codigo: newMateria.codigo.trim() || null,
//         semestre: newMateria.semestre,
//         carrera_id: newMateria.carrera_id || null,
//       });

//       if (error) {
//         console.error('Error adding materia:', error);
//         alert(`Error al agregar materia: ${error.message}`);
//         return;
//       }

//       alert('Materia agregada correctamente');
//       setNewMateria({ nombre: '', codigo: '', semestre: 1, carrera_id: '' });
//       loadData();
//     } catch (error: any) {
//       console.error('Error adding materia:', error);
//       alert(`Error al agregar materia: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const deleteMateria = async (id: string) => {
//     if (!confirm('¿Estás seguro de eliminar esta materia? Esto puede afectar a grupos y registros académicos.')) {
//       return;
//     }

//     setLoading(true);
//     try {
//       const { error } = await supabase.from('materias').delete().eq('id', id);

//       if (error) {
//         console.error('Error deleting materia:', error);
//         alert(`Error al eliminar: ${error.message}`);
//         return;
//       }

//       alert('Materia eliminada');
//       loadData();
//     } catch (error: any) {
//       console.error('Error deleting materia:', error);
//       alert(`Error: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
//       <div className="flex items-center gap-3 mb-6">
//         <Settings className="w-8 h-8 text-blue-600" />
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">Configuración del Sistema</h2>
//           <p className="text-sm text-gray-600">
//             Administra carreras y materias del Instituto Tecnológico de Tijuana
//           </p>
//         </div>
//       </div>

//       <div className="flex gap-2 mb-6 border-b border-gray-200">
//         <button
//           onClick={() => setActiveTab('carreras')}
//           className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
//             activeTab === 'carreras'
//               ? 'border-blue-600 text-blue-600'
//               : 'border-transparent text-gray-600 hover:text-gray-800'
//           }`}
//         >
//           <GraduationCap className="w-4 h-4" />
//           Carreras ({carreras.length})
//         </button>
//         <button
//           onClick={() => setActiveTab('materias')}
//           className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
//             activeTab === 'materias'
//               ? 'border-blue-600 text-blue-600'
//               : 'border-transparent text-gray-600 hover:text-gray-800'
//           }`}
//         >
//           <BookOpen className="w-4 h-4" />
//           Materias ({materias.length})
//         </button>
//       </div>

//       {activeTab === 'carreras' && (
//         <div className="space-y-6">
//           <form onSubmit={addCarrera} className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-4">
//             <h3 className="font-semibold text-blue-900 flex items-center gap-2">
//               <Plus className="w-5 h-5" />
//               Agregar Nueva Carrera
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Nombre de la Carrera *
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="Ej: Ingeniería en Sistemas Computacionales"
//                   value={newCarrera.nombre}
//                   onChange={(e) => setNewCarrera({ ...newCarrera, nombre: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Código (opcional)
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Ej: ISC"
//                   value={newCarrera.codigo}
//                   onChange={(e) => setNewCarrera({ ...newCarrera, codigo: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
//             >
//               <Plus className="w-4 h-4" />
//               {loading ? 'Agregando...' : 'Agregar Carrera'}
//             </button>
//           </form>

//           <div className="space-y-2">
//             <h4 className="font-semibold text-gray-700 mb-3">
//               Carreras Registradas ({carreras.length})
//             </h4>
//             {carreras.length === 0 ? (
//               <div className="text-center py-12 bg-gray-50 rounded-lg">
//                 <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-3" />
//                 <p className="text-gray-500">No hay carreras registradas</p>
//                 <p className="text-sm text-gray-400">Agrega la primera carrera usando el formulario</p>
//               </div>
//             ) : (
//               carreras.map((carrera) => (
//                 <div key={carrera.id} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors">
//                   <div className="flex items-center gap-3">
//                     <GraduationCap className="w-5 h-5 text-blue-600" />
//                     <div>
//                       <p className="font-medium text-gray-800">{carrera.nombre}</p>
//                       {carrera.codigo && (
//                         <p className="text-sm text-gray-600">Código: {carrera.codigo}</p>
//                       )}
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => deleteCarrera(carrera.id)}
//                     disabled={loading}
//                     className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
//                     title="Eliminar carrera"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </button>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}

//       {activeTab === 'materias' && (
//         <div className="space-y-6">
//           <form onSubmit={addMateria} className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-4">
//             <h3 className="font-semibold text-green-900 flex items-center gap-2">
//               <Plus className="w-5 h-5" />
//               Agregar Nueva Materia
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Nombre de la Materia *
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="Ej: Programación Orientada a Objetos"
//                   value={newMateria.nombre}
//                   onChange={(e) => setNewMateria({ ...newMateria, nombre: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Código (opcional)
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Ej: AED-1286"
//                   value={newMateria.codigo}
//                   onChange={(e) => setNewMateria({ ...newMateria, codigo: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Semestre *
//                 </label>
//                 <input
//                   type="number"
//                   required
//                   min="1"
//                   max="12"
//                   placeholder="1-12"
//                   value={newMateria.semestre}
//                   onChange={(e) => setNewMateria({ ...newMateria, semestre: parseInt(e.target.value) || 1 })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Carrera
//                 </label>
//                 <select
//                   value={newMateria.carrera_id}
//                   onChange={(e) => setNewMateria({ ...newMateria, carrera_id: e.target.value })}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                 >
//                   <option value="">General (Todas las carreras)</option>
//                   {carreras.map((carrera) => (
//                     <option key={carrera.id} value={carrera.id}>
//                       {carrera.nombre}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
//             >
//               <Plus className="w-4 h-4" />
//               {loading ? 'Agregando...' : 'Agregar Materia'}
//             </button>
//           </form>

//           <div className="space-y-2">
//             <h4 className="font-semibold text-gray-700 mb-3">
//               Materias Registradas ({materias.length})
//             </h4>
//             {materias.length === 0 ? (
//               <div className="text-center py-12 bg-gray-50 rounded-lg">
//                 <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-3" />
//                 <p className="text-gray-500">No hay materias registradas</p>
//                 <p className="text-sm text-gray-400">Agrega la primera materia usando el formulario</p>
//               </div>
//             ) : (
//               materias.map((materia) => (
//                 <div key={materia.id} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors">
//                   <div className="flex items-center gap-3">
//                     <BookOpen className="w-5 h-5 text-green-600" />
//                     <div>
//                       <p className="font-medium text-gray-800">{materia.nombre}</p>
//                       <p className="text-sm text-gray-600">
//                         Semestre {materia.semestre}
//                         {materia.codigo && ` • Código: ${materia.codigo}`}
//                         {materia.carreras && (
//                           <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
//                             {materia.carreras.nombre}
//                           </span>
//                         )}
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => deleteMateria(materia.id)}
//                     disabled={loading}
//                     className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
//                     title="Eliminar materia"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </button>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}

//       <div className="mt-8 pt-6 border-t">
//         <button
//           onClick={onComplete}
//           className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//         >
//           <Save className="w-5 h-5" />
//           Guardar Configuración y Continuar
//         </button>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Settings, Plus, Trash2, Save, BookOpen, GraduationCap, AlertCircle } from 'lucide-react';

interface Carrera {
  id: string;
  nombre: string;
  codigo: string | null;
  creado_en: string;
}

interface Materia {
  id: string;
  nombre: string;
  codigo: string | null;
  semestre: number;
  carrera_id: string | null;
  carreras?: { nombre: string } | null;
  creado_en: string;
}

interface SetupWizardProps {
  onComplete: () => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const { settings, announceMessage, speakText } = useAccessibility();
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [activeTab, setActiveTab] = useState<'carreras' | 'materias'>('carreras');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [newCarrera, setNewCarrera] = useState({ nombre: '', codigo: '' });
  const [newMateria, setNewMateria] = useState({ 
    nombre: '', 
    codigo: '', 
    semestre: 1, 
    carrera_id: '' 
  });

  useEffect(() => {
    loadData();
    announceMessage('Configuración del sistema cargada', 'polite');
  }, []);

  const loadData = async () => {
    try {
      // Cargar carreras
      const { data: carrerasData, error: carrerasError } = await supabase
        .from('carreras')
        .select('*')
        .order('nombre');

      if (carrerasError) {
        console.error('Error loading carreras:', carrerasError);
      } else {
        setCarreras(carrerasData || []);
      }

      // Cargar materias con sus carreras
      const { data: materiasData, error: materiasError } = await supabase
        .from('materias')
        .select(`
          *,
          carreras (nombre)
        `)
        .order('nombre');

      if (materiasError) {
        console.error('Error loading materias:', materiasError);
      } else {
        setMaterias(materiasData || []);
      }
    } catch (error) {
      console.error('Error in loadData:', error);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    announceMessage(message, 'assertive');
    if (settings.readAloud) {
      speakText(message);
    }
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const showError = (message: string) => {
    setError(message);
    announceMessage(`Error: ${message}`, 'assertive');
    if (settings.readAloud) {
      speakText(`Error: ${message}`);
    }
    setTimeout(() => setError(''), 5000);
  };

  const addCarrera = async () => {
    if (!newCarrera.nombre.trim()) {
      showError('El nombre de la carrera es obligatorio');
      return;
    }

    setLoading(true);
    announceMessage('Agregando carrera, por favor espere', 'polite');
    
    try {
      const { error } = await supabase.from('carreras').insert({
        nombre: newCarrera.nombre.trim(),
        codigo: newCarrera.codigo.trim() || null,
      });

      if (error) {
        console.error('Error adding carrera:', error);
        showError(`Error al agregar carrera: ${error.message}`);
        return;
      }

      showSuccess('Carrera agregada correctamente');
      setNewCarrera({ nombre: '', codigo: '' });
      loadData();
    } catch (error: any) {
      console.error('Error adding carrera:', error);
      showError(`Error al agregar carrera: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteCarrera = async (id: string, nombre: string) => {
    if (!confirm('¿Estás seguro de eliminar esta carrera? Esto puede afectar a estudiantes y materias asociadas.')) {
      return;
    }

    setLoading(true);
    announceMessage(`Eliminando carrera ${nombre}`, 'polite');
    
    try {
      const { error } = await supabase.from('carreras').delete().eq('id', id);

      if (error) {
        console.error('Error deleting carrera:', error);
        showError(`Error al eliminar: ${error.message}`);
        return;
      }

      showSuccess(`Carrera ${nombre} eliminada`);
      loadData();
    } catch (error: any) {
      console.error('Error deleting carrera:', error);
      showError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addMateria = async () => {
    if (!newMateria.nombre.trim()) {
      showError('El nombre de la materia es obligatorio');
      return;
    }

    setLoading(true);
    announceMessage('Agregando materia, por favor espere', 'polite');
    
    try {
      const { error } = await supabase.from('materias').insert({
        nombre: newMateria.nombre.trim(),
        codigo: newMateria.codigo.trim() || null,
        semestre: newMateria.semestre,
        carrera_id: newMateria.carrera_id || null,
      });

      if (error) {
        console.error('Error adding materia:', error);
        showError(`Error al agregar materia: ${error.message}`);
        return;
      }

      showSuccess('Materia agregada correctamente');
      setNewMateria({ nombre: '', codigo: '', semestre: 1, carrera_id: '' });
      loadData();
    } catch (error: any) {
      console.error('Error adding materia:', error);
      showError(`Error al agregar materia: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteMateria = async (id: string, nombre: string) => {
    if (!confirm('¿Estás seguro de eliminar esta materia? Esto puede afectar a grupos y registros académicos.')) {
      return;
    }

    setLoading(true);
    announceMessage(`Eliminando materia ${nombre}`, 'polite');
    
    try {
      const { error } = await supabase.from('materias').delete().eq('id', id);

      if (error) {
        console.error('Error deleting materia:', error);
        showError(`Error al eliminar: ${error.message}`);
        return;
      }

      showSuccess(`Materia ${nombre} eliminada`);
      loadData();
    } catch (error: any) {
      console.error('Error deleting materia:', error);
      showError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'carreras' | 'materias') => {
    setActiveTab(tab);
    const message = tab === 'carreras' 
      ? `Pestaña de carreras seleccionada. ${carreras.length} carreras registradas`
      : `Pestaña de materias seleccionada. ${materias.length} materias registradas`;
    announceMessage(message, 'polite');
    if (settings.readAloud) {
      speakText(message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div 
        className="flex items-center gap-3 mb-6"
        role="banner"
      >
        <Settings 
          className="w-8 h-8 text-blue-600" 
          aria-hidden="true"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Configuración del Sistema</h1>
          <p className="text-sm text-gray-600">
            Administra carreras y materias del Instituto Tecnológico de Tijuana
          </p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div 
          className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
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

      {/* Tabs */}
      <div 
        className="flex gap-2 mb-6 border-b border-gray-200"
        role="tablist"
        aria-label="Secciones de configuración"
      >
        <button
          role="tab"
          aria-selected={activeTab === 'carreras'}
          aria-controls="carreras-panel"
          id="carreras-tab"
          onClick={() => handleTabChange('carreras')}
          onMouseEnter={() => settings.readAloud && speakText(`Pestaña Carreras, ${carreras.length} registradas`)}
          onFocus={() => announceMessage('Pestaña de carreras enfocada')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'carreras'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" aria-hidden="true" />
          Carreras ({carreras.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'materias'}
          aria-controls="materias-panel"
          id="materias-tab"
          onClick={() => handleTabChange('materias')}
          onMouseEnter={() => settings.readAloud && speakText(`Pestaña Materias, ${materias.length} registradas`)}
          onFocus={() => announceMessage('Pestaña de materias enfocada')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'materias'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-800'
          }`}
        >
          <BookOpen className="w-4 h-4" aria-hidden="true" />
          Materias ({materias.length})
        </button>
      </div>

      {/* Carreras Panel */}
      {activeTab === 'carreras' && (
        <div 
          id="carreras-panel"
          role="tabpanel"
          aria-labelledby="carreras-tab"
          className="space-y-6"
        >
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-4">
            <h2 className="font-semibold text-blue-900 flex items-center gap-2">
              <Plus className="w-5 h-5" aria-hidden="true" />
              Agregar Nueva Carrera
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label 
                  htmlFor="carrera-nombre"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre de la Carrera *
                </label>
                <input
                  id="carrera-nombre"
                  type="text"
                  required
                  placeholder="Ej: Ingeniería en Sistemas Computacionales"
                  value={newCarrera.nombre}
                  onChange={(e) => setNewCarrera({ ...newCarrera, nombre: e.target.value })}
                  onFocus={() => {
                    announceMessage('Campo de nombre de carrera enfocado');
                    if (settings.readAloud) {
                      speakText('Campo de nombre de la carrera');
                    }
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Nombre de la carrera')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addCarrera();
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-describedby="carrera-nombre-description"
                />
                <span id="carrera-nombre-description" className="sr-only">
                  Ingresa el nombre completo de la carrera
                </span>
              </div>
              <div>
                <label 
                  htmlFor="carrera-codigo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Código (opcional)
                </label>
                <input
                  id="carrera-codigo"
                  type="text"
                  placeholder="Ej: ISC"
                  value={newCarrera.codigo}
                  onChange={(e) => setNewCarrera({ ...newCarrera, codigo: e.target.value })}
                  onFocus={() => {
                    announceMessage('Campo de código de carrera enfocado');
                    if (settings.readAloud) {
                      speakText('Campo de código de la carrera');
                    }
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Código de la carrera')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addCarrera();
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-describedby="carrera-codigo-description"
                />
                <span id="carrera-codigo-description" className="sr-only">
                  Código abreviado de la carrera, opcional
                </span>
              </div>
            </div>
            <button
              onClick={addCarrera}
              disabled={loading}
              onMouseEnter={() => settings.readAloud && speakText('Botón Agregar Carrera')}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-300"
              aria-label={loading ? 'Agregando carrera, por favor espere' : 'Agregar nueva carrera'}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              {loading ? 'Agregando...' : 'Agregar Carrera'}
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 mb-3">
              Carreras Registradas ({carreras.length})
            </h3>
            {carreras.length === 0 ? (
              <div 
                className="text-center py-12 bg-gray-50 rounded-lg"
                role="status"
                aria-label="No hay carreras registradas"
              >
                <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-3" aria-hidden="true" />
                <p className="text-gray-500">No hay carreras registradas</p>
                <p className="text-sm text-gray-400">Agrega la primera carrera usando el formulario</p>
              </div>
            ) : (
              <ul 
                className="space-y-2"
                role="list"
                aria-label="Lista de carreras registradas"
              >
                {carreras.map((carrera) => (
                  <li 
                    key={carrera.id} 
                    className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-blue-600" aria-hidden="true" />
                      <div>
                        <p className="font-medium text-gray-800">{carrera.nombre}</p>
                        {carrera.codigo && (
                          <p className="text-sm text-gray-600">Código: {carrera.codigo}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCarrera(carrera.id, carrera.nombre)}
                      disabled={loading}
                      onMouseEnter={() => settings.readAloud && speakText(`Eliminar carrera ${carrera.nombre}`)}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Eliminar carrera ${carrera.nombre}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Materias Panel */}
      {activeTab === 'materias' && (
        <div 
          id="materias-panel"
          role="tabpanel"
          aria-labelledby="materias-tab"
          className="space-y-6"
        >
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-4">
            <h2 className="font-semibold text-green-900 flex items-center gap-2">
              <Plus className="w-5 h-5" aria-hidden="true" />
              Agregar Nueva Materia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label 
                  htmlFor="materia-nombre"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre de la Materia *
                </label>
                <input
                  id="materia-nombre"
                  type="text"
                  required
                  placeholder="Ej: Programación Orientada a Objetos"
                  value={newMateria.nombre}
                  onChange={(e) => setNewMateria({ ...newMateria, nombre: e.target.value })}
                  onFocus={() => {
                    announceMessage('Campo de nombre de materia enfocado');
                    if (settings.readAloud) {
                      speakText('Campo de nombre de la materia');
                    }
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Nombre de la materia')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addMateria();
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  aria-describedby="materia-nombre-description"
                />
                <span id="materia-nombre-description" className="sr-only">
                  Ingresa el nombre completo de la materia
                </span>
              </div>
              <div>
                <label 
                  htmlFor="materia-codigo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Código (opcional)
                </label>
                <input
                  id="materia-codigo"
                  type="text"
                  placeholder="Ej: AED-1286"
                  value={newMateria.codigo}
                  onChange={(e) => setNewMateria({ ...newMateria, codigo: e.target.value })}
                  onFocus={() => {
                    announceMessage('Campo de código de materia enfocado');
                    if (settings.readAloud) {
                      speakText('Campo de código de la materia');
                    }
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Código de la materia')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  aria-describedby="materia-codigo-description"
                />
                <span id="materia-codigo-description" className="sr-only">
                  Código de la materia, opcional
                </span>
              </div>
              <div>
                <label 
                  htmlFor="materia-semestre"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Semestre *
                </label>
                <input
                  id="materia-semestre"
                  type="number"
                  required
                  min="1"
                  max="12"
                  placeholder="1-12"
                  value={newMateria.semestre}
                  onChange={(e) => setNewMateria({ ...newMateria, semestre: parseInt(e.target.value) || 1 })}
                  onFocus={() => {
                    announceMessage('Campo de semestre enfocado');
                    if (settings.readAloud) {
                      speakText('Campo de semestre');
                    }
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Semestre')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  aria-describedby="materia-semestre-description"
                />
                <span id="materia-semestre-description" className="sr-only">
                  Selecciona el semestre de la materia, del 1 al 12
                </span>
              </div>
              <div>
                <label 
                  htmlFor="materia-carrera"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Carrera
                </label>
                <select
                  id="materia-carrera"
                  value={newMateria.carrera_id}
                  onChange={(e) => setNewMateria({ ...newMateria, carrera_id: e.target.value })}
                  onFocus={() => {
                    announceMessage('Selector de carrera enfocado');
                    if (settings.readAloud) {
                      speakText('Selector de carrera');
                    }
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Carrera')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  aria-describedby="materia-carrera-description"
                >
                  <option value="">General (Todas las carreras)</option>
                  {carreras.map((carrera) => (
                    <option key={carrera.id} value={carrera.id}>
                      {carrera.nombre}
                    </option>
                  ))}
                </select>
                <span id="materia-carrera-description" className="sr-only">
                  Selecciona la carrera a la que pertenece la materia, o déjala como general
                </span>
              </div>
            </div>
            <button
              onClick={addMateria}
              disabled={loading}
              onMouseEnter={() => settings.readAloud && speakText('Botón Agregar Materia')}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-green-300"
              aria-label={loading ? 'Agregando materia, por favor espere' : 'Agregar nueva materia'}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              {loading ? 'Agregando...' : 'Agregar Materia'}
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 mb-3">
              Materias Registradas ({materias.length})
            </h3>
            {materias.length === 0 ? (
              <div 
                className="text-center py-12 bg-gray-50 rounded-lg"
                role="status"
                aria-label="No hay materias registradas"
              >
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-3" aria-hidden="true" />
                <p className="text-gray-500">No hay materias registradas</p>
                <p className="text-sm text-gray-400">Agrega la primera materia usando el formulario</p>
              </div>
            ) : (
              <ul 
                className="space-y-2"
                role="list"
                aria-label="Lista de materias registradas"
              >
                {materias.map((materia) => (
                  <li 
                    key={materia.id} 
                    className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-green-600" aria-hidden="true" />
                      <div>
                        <p className="font-medium text-gray-800">{materia.nombre}</p>
                        <p className="text-sm text-gray-600">
                          Semestre {materia.semestre}
                          {materia.codigo && ` • Código: ${materia.codigo}`}
                          {materia.carreras && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                              {materia.carreras.nombre}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMateria(materia.id, materia.nombre)}
                      disabled={loading}
                      onMouseEnter={() => settings.readAloud && speakText(`Eliminar materia ${materia.nombre}`)}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Eliminar materia ${materia.nombre}`}
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 pt-6 border-t">
        <button
          onClick={() => {
            announceMessage('Guardando configuración');
            if (settings.readAloud) {
              speakText('Guardando configuración y continuando');
            }
            onComplete();
          }}
          onMouseEnter={() => settings.readAloud && speakText('Guardar configuración y continuar')}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-label="Guardar configuración y continuar al sistema"
        >
          <Save className="w-5 h-5" aria-hidden="true" />
          Guardar Configuración y Continuar
        </button>
      </div>

      {/* Screen Reader Only Instructions */}
      <div className="sr-only" role="complementary" aria-label="Instrucciones de accesibilidad">
        <h2>Instrucciones de accesibilidad:</h2>
        <ul>
          <li>Use Tab para navegar entre campos y botones</li>
          <li>Use las flechas para cambiar entre pestañas</li>
          <li>Presione Enter en los campos para agregar elementos</li>
          <li>Presione Alt+A para abrir el panel de accesibilidad</li>
          <li>Los mensajes de éxito y error se anunciarán automáticamente</li>
        </ul>
      </div>
    </div>
  );
}