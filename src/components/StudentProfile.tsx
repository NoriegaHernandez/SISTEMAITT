// // src/components/StudentProfile.tsx
// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase';
// import { useAuth } from '../contexts/AuthContext';
// import { User, Save, Mail, GraduationCap } from 'lucide-react';

// interface Major {
//   id: string;
//   name: string;
// }

// interface StudentData {
//   id: string;
//   control_number: string;
//   first_name: string;
//   paternal_surname: string;
//   maternal_surname: string;
//   major_id: string | null;
//   current_semester: number;
// }

// export default function StudentProfile() {
//   const { profile, user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [studentData, setStudentData] = useState<StudentData | null>(null);
//   const [majors, setMajors] = useState<Major[]>([]);
//   const [formData, setFormData] = useState({
//     first_name: '',
//     paternal_surname: '',
//     maternal_surname: '',
//     major_id: '',
//     current_semester: 1,
//   });

//   useEffect(() => {
//     loadData();
//   }, [profile]);

//   const loadData = async () => {
//     if (!profile?.estudiante_id) {
//       setLoading(false);
//       return;
//     }

//     try {
//       // Load student data
//       const { data: student, error: studentError } = await supabase
//         .from('students')
//         .select('*')
//         .eq('id', profile.estudiante_id)
//         .single();

//       if (studentError) throw studentError;

//       setStudentData(student);
//       setFormData({
//         first_name: student.first_name,
//         paternal_surname: student.paternal_surname,
//         maternal_surname: student.maternal_surname,
//         major_id: student.major_id || '',
//         current_semester: student.current_semester,
//       });

//       // Load majors
//       const { data: majorsData } = await supabase
//         .from('majors')
//         .select('id, name')
//         .order('name');

//       if (majorsData) setMajors(majorsData);
//     } catch (error) {
//       console.error('Error loading data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!studentData) return;

//     setSaving(true);
//     try {
//       const { error } = await supabase
//         .from('students')
//         .update({
//           first_name: formData.first_name,
//           paternal_surname: formData.paternal_surname,
//           maternal_surname: formData.maternal_surname,
//           major_id: formData.major_id || null,
//           current_semester: formData.current_semester,
//         })
//         .eq('id', studentData.id);

//       if (error) throw error;

//       alert('Información actualizada correctamente');
//       loadData();
//     } catch (error: any) {
//       console.error('Error updating profile:', error);
//       alert(`Error al actualizar: ${error.message}`);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-gray-500">Cargando perfil...</div>
//       </div>
//     );
//   }

//   if (!studentData) {
//     return (
//       <div className="bg-white rounded-lg shadow-lg p-6">
//         <div className="text-center py-12">
//           <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//           <p className="text-gray-600 mb-4">
//             No se encontró información de estudiante para este usuario.
//           </p>
//           <p className="text-sm text-gray-500">
//             Contacta al administrador del sistema.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Profile Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
//         <div className="flex items-center gap-4">
//           <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
//             <User className="w-10 h-10" />
//           </div>
//           <div>
//             <h2 className="text-2xl font-bold">
//               {studentData.paternal_surname} {studentData.maternal_surname}, {studentData.first_name}
//             </h2>
//             <p className="text-blue-100 mt-1">
//               Número de Control: {studentData.control_number}
//             </p>
//             <div className="flex items-center gap-2 mt-2 text-blue-100">
//               <Mail className="w-4 h-4" />
//               <span className="text-sm">{user?.email}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Edit Form */}
//       <div className="bg-white rounded-lg shadow-lg p-6">
//         <div className="flex items-center gap-3 mb-6">
//           <GraduationCap className="w-6 h-6 text-blue-600" />
//           <h3 className="text-xl font-bold text-gray-800">Información Académica</h3>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Nombre(s) *
//               </label>
//               <input
//                 type="text"
//                 required
//                 value={formData.first_name}
//                 onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Apellido Paterno *
//               </label>
//               <input
//                 type="text"
//                 required
//                 value={formData.paternal_surname}
//                 onChange={(e) => setFormData({ ...formData, paternal_surname: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Apellido Materno *
//               </label>
//               <input
//                 type="text"
//                 required
//                 value={formData.maternal_surname}
//                 onChange={(e) => setFormData({ ...formData, maternal_surname: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Carrera
//               </label>
//               <select
//                 value={formData.major_id}
//                 onChange={(e) => setFormData({ ...formData, major_id: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">Seleccionar carrera</option>
//                 {majors.map((major) => (
//                   <option key={major.id} value={major.id}>
//                     {major.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Semestre Actual *
//               </label>
//               <input
//                 type="number"
//                 required
//                 min="1"
//                 max="12"
//                 value={formData.current_semester}
//                 onChange={(e) => setFormData({ ...formData, current_semester: parseInt(e.target.value) })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Número de Control
//               </label>
//               <input
//                 type="text"
//                 value={studentData.control_number}
//                 disabled
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 Este campo no se puede modificar
//               </p>
//             </div>
//           </div>

//           <div className="flex justify-end pt-4 border-t">
//             <button
//               type="submit"
//               disabled={saving}
//               className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
//             >
//               <Save className="w-4 h-4" />
//               {saving ? 'Guardando...' : 'Guardar Cambios'}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Information Note */}
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//         <p className="text-sm text-blue-900">
//           <strong>Nota:</strong> Solo puedes modificar tu información personal y académica.
//           Las calificaciones son asignadas únicamente por los docentes.
//           Si encuentras algún error en tus calificaciones, contacta a tu maestro o al coordinador académico.
//         </p>
//       </div>
//     </div>
//   );
// }

// src/components/StudentProfile.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { User, Save, Mail, GraduationCap, AlertCircle } from 'lucide-react';

interface Major {
  id: string;
  name: string;
}

interface StudentData {
  id: string;
  control_number: string;
  first_name: string;
  paternal_surname: string;
  maternal_surname: string;
  major_id: string | null;
  current_semester: number;
}

export default function StudentProfile() {
  const { profile, user } = useAuth();
  const { settings, announceMessage, speakText } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [majors, setMajors] = useState<Major[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    paternal_surname: '',
    maternal_surname: '',
    major_id: '',
    current_semester: 1,
  });

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile?.estudiante_id) {
      setLoading(false);
      return;
    }

    announceMessage('Cargando información del perfil', 'polite');

    try {
      // Load student data
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', profile.estudiante_id)
        .single();

      if (studentError) throw studentError;

      setStudentData(student);
      setFormData({
        first_name: student.first_name,
        paternal_surname: student.paternal_surname,
        maternal_surname: student.maternal_surname,
        major_id: student.major_id || '',
        current_semester: student.current_semester,
      });

      // Load majors
      const { data: majorsData } = await supabase
        .from('majors')
        .select('id, name')
        .order('name');

      if (majorsData) setMajors(majorsData);
      
      announceMessage('Perfil cargado correctamente', 'polite');
    } catch (error) {
      console.error('Error loading data:', error);
      const errorMsg = 'Error al cargar la información del perfil';
      setError(errorMsg);
      announceMessage(`Error: ${errorMsg}`, 'assertive');
      if (settings.readAloud) {
        speakText(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentData) return;

    setSaving(true);
    setError('');
    setSuccess(false);
    announceMessage('Guardando cambios, por favor espere', 'polite');

    try {
      const { error } = await supabase
        .from('students')
        .update({
          first_name: formData.first_name,
          paternal_surname: formData.paternal_surname,
          maternal_surname: formData.maternal_surname,
          major_id: formData.major_id || null,
          current_semester: formData.current_semester,
        })
        .eq('id', studentData.id);

      if (error) throw error;

      setSuccess(true);
      announceMessage('Información actualizada correctamente', 'assertive');
      if (settings.readAloud) {
        speakText('Los cambios se han guardado exitosamente');
      }
      loadData();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMsg = `Error al actualizar: ${error.message}`;
      setError(errorMsg);
      announceMessage(`Error: ${errorMsg}`, 'assertive');
      if (settings.readAloud) {
        speakText(errorMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite">
        <div className="text-gray-500">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Cargando perfil...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12" role="alert">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-600 mb-4">
            No se encontró información de estudiante para este usuario.
          </p>
          <p className="text-sm text-gray-500">
            Contacta al administrador del sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div 
        className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white"
        role="banner"
        onMouseEnter={() => settings.readAloud && speakText(`Perfil de ${studentData.first_name} ${studentData.paternal_surname} ${studentData.maternal_surname}`)}
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User className="w-10 h-10" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {studentData.paternal_surname} {studentData.maternal_surname}, {studentData.first_name}
            </h2>
            <p className="text-blue-100 mt-1">
              Número de Control: {studentData.control_number}
            </p>
            <div className="flex items-center gap-2 mt-2 text-blue-100">
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span className="text-sm">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div 
          className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-700 font-medium">
              ¡Información actualizada correctamente!
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div 
          className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div 
          className="flex items-center gap-3 mb-6"
          onMouseEnter={() => settings.readAloud && speakText('Información Académica')}
        >
          <GraduationCap className="w-6 h-6 text-blue-600" aria-hidden="true" />
          <h3 className="text-xl font-bold text-gray-800">Información Académica</h3>
        </div>

        <div className="space-y-6" role="region" aria-label="Formulario de edición de perfil">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre(s) *
              </label>
              <input
                id="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                onFocus={() => {
                  if (settings.readAloud) {
                    speakText('Campo de nombre');
                  }
                  announceMessage('Campo de nombre enfocado');
                }}
                onMouseEnter={() => settings.readAloud && speakText('Nombre')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                aria-describedby="first_name-description"
              />
              <span id="first_name-description" className="sr-only">
                Ingresa tu nombre o nombres
              </span>
            </div>

            <div>
              <label htmlFor="paternal_surname" className="block text-sm font-semibold text-gray-700 mb-2">
                Apellido Paterno *
              </label>
              <input
                id="paternal_surname"
                type="text"
                required
                value={formData.paternal_surname}
                onChange={(e) => setFormData({ ...formData, paternal_surname: e.target.value })}
                onFocus={() => {
                  if (settings.readAloud) {
                    speakText('Campo de apellido paterno');
                  }
                  announceMessage('Campo de apellido paterno enfocado');
                }}
                onMouseEnter={() => settings.readAloud && speakText('Apellido Paterno')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                aria-describedby="paternal_surname-description"
              />
              <span id="paternal_surname-description" className="sr-only">
                Ingresa tu apellido paterno
              </span>
            </div>

            <div>
              <label htmlFor="maternal_surname" className="block text-sm font-semibold text-gray-700 mb-2">
                Apellido Materno *
              </label>
              <input
                id="maternal_surname"
                type="text"
                required
                value={formData.maternal_surname}
                onChange={(e) => setFormData({ ...formData, maternal_surname: e.target.value })}
                onFocus={() => {
                  if (settings.readAloud) {
                    speakText('Campo de apellido materno');
                  }
                  announceMessage('Campo de apellido materno enfocado');
                }}
                onMouseEnter={() => settings.readAloud && speakText('Apellido Materno')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                aria-describedby="maternal_surname-description"
              />
              <span id="maternal_surname-description" className="sr-only">
                Ingresa tu apellido materno
              </span>
            </div>

            <div>
              <label htmlFor="major_id" className="block text-sm font-semibold text-gray-700 mb-2">
                Carrera
              </label>
              <select
                id="major_id"
                value={formData.major_id}
                onChange={(e) => setFormData({ ...formData, major_id: e.target.value })}
                onFocus={() => {
                  if (settings.readAloud) {
                    speakText('Campo de selección de carrera');
                  }
                  announceMessage('Campo de carrera enfocado');
                }}
                onMouseEnter={() => settings.readAloud && speakText('Carrera')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                aria-describedby="major_id-description"
              >
                <option value="">Seleccionar carrera</option>
                {majors.map((major) => (
                  <option key={major.id} value={major.id}>
                    {major.name}
                  </option>
                ))}
              </select>
              <span id="major_id-description" className="sr-only">
                Selecciona tu carrera actual
              </span>
            </div>

            <div>
              <label htmlFor="current_semester" className="block text-sm font-semibold text-gray-700 mb-2">
                Semestre Actual *
              </label>
              <input
                id="current_semester"
                type="number"
                required
                min="1"
                max="12"
                value={formData.current_semester}
                onChange={(e) => setFormData({ ...formData, current_semester: parseInt(e.target.value) })}
                onFocus={() => {
                  if (settings.readAloud) {
                    speakText('Campo de semestre actual');
                  }
                  announceMessage('Campo de semestre enfocado');
                }}
                onMouseEnter={() => settings.readAloud && speakText('Semestre Actual')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                aria-describedby="current_semester-description"
              />
              <span id="current_semester-description" className="sr-only">
                Ingresa el número del semestre que cursas actualmente, del 1 al 12
              </span>
            </div>

            <div>
              <label htmlFor="control_number" className="block text-sm font-semibold text-gray-700 mb-2">
                Número de Control
              </label>
              <input
                id="control_number"
                type="text"
                value={studentData.control_number}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                aria-describedby="control_number-description"
              />
              <p id="control_number-description" className="text-xs text-gray-500 mt-1">
                Este campo no se puede modificar
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              onMouseEnter={() => settings.readAloud && speakText('Botón Guardar Cambios')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:scale-[1.02] active:scale-[0.98]"
              aria-label={saving ? 'Guardando cambios, por favor espere' : 'Guardar los cambios realizados en el perfil'}
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" aria-hidden="true" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Information Note */}
      <div 
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        role="note"
      >
        <p className="text-sm text-blue-900">
          <strong>Nota:</strong> Solo puedes modificar tu información personal y académica.
          Las calificaciones son asignadas únicamente por los docentes.
          Si encuentras algún error en tus calificaciones, contacta a tu maestro o al coordinador académico.
        </p>
      </div>

      {/* Screen Reader Only Instructions */}
      <div className="sr-only" role="complementary" aria-label="Instrucciones de accesibilidad">
        <h2>Instrucciones de accesibilidad:</h2>
        <ul>
          <li>Use Tab para navegar entre campos del formulario</li>
          <li>Presione Alt+A para abrir el panel de accesibilidad</li>
          <li>Los campos obligatorios están marcados con asterisco</li>
          <li>El número de control no se puede modificar</li>
          <li>Los mensajes de éxito y error se anunciarán automáticamente</li>
        </ul>
      </div>
    </div>
  );
}