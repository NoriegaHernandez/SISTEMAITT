// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase';
// import { GraduationCap, Mail, Lock, ArrowLeft, BookOpen } from 'lucide-react';

// interface RegisterProps {
//   onBack: () => void;
// }

// interface Career {
//   id: string;
//   nombre: string;
//   codigo: string;
// }

// export default function StudentRegister({ onBack }: RegisterProps) {
//   const [loading, setLoading] = useState(false);
//   const [loadingCareers, setLoadingCareers] = useState(true);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);
//   const [careers, setCareers] = useState<Career[]>([]);
  
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     confirmPassword: '',
//     controlNumber: '',
//     firstName: '',
//     paternalSurname: '',
//     maternalSurname: '',
//     currentSemester: '1',
//     careerId: '',
//   });

//   useEffect(() => {
//     loadCareers();
//   }, []);

//   const loadCareers = async () => {
//     setLoadingCareers(true);
//     try {
//       const { data, error } = await supabase
//         .from('carreras')
//         .select('id, nombre, codigo')
//         .order('nombre');

//       if (error) throw error;

//       setCareers(data || []);
//     } catch (err) {
//       console.error('Error cargando carreras:', err);
//       setError('Error al cargar las carreras disponibles');
//     } finally {
//       setLoadingCareers(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       // Validaciones
//       if (formData.password !== formData.confirmPassword) {
//         throw new Error('Las contraseñas no coinciden');
//       }

//       if (formData.password.length < 6) {
//         throw new Error('La contraseña debe tener al menos 6 caracteres');
//       }

//       if (!formData.careerId) {
//         throw new Error('Debes seleccionar una carrera');
//       }

//       // Verificar si el número de control ya existe
//       const { data: existingStudent } = await supabase
//         .from('estudiantes')
//         .select('id')
//         .eq('numero_control', formData.controlNumber)
//         .maybeSingle();

//       if (existingStudent) {
//         throw new Error('Este número de control ya está registrado');
//       }

//       // Crear el usuario primero
//       const fullName = `${formData.firstName} ${formData.paternalSurname} ${formData.maternalSurname}`;
      
//       const { data: authData, error: signUpError } = await supabase.auth.signUp({
//         email: formData.email,
//         password: formData.password,
//         options: {
//           data: {
//             full_name: fullName,
//             role: 'student',
//           },
//           emailRedirectTo: `${window.location.origin}`,
//         },
//       });

//       if (signUpError) {
//         console.error('Error creating user:', signUpError);
//         throw new Error(`Error al crear usuario: ${signUpError.message}`);
//       }

//       if (!authData.user) {
//         throw new Error('No se pudo crear el usuario');
//       }

//       // Crear el perfil y estudiante manualmente
//       console.log('Creando perfil para usuario:', authData.user.id);

//       // 1. Crear/actualizar user_profile
//       const { error: profileError } = await supabase
//         .from('user_profiles')
//         .upsert({
//           id: authData.user.id,
//           role: 'student',
//           email: formData.email,
//           full_name: fullName,
//           is_active: true,
//         }, { onConflict: 'id' });

//       if (profileError) {
//         console.error('Error creating user_profile:', profileError);
//         throw new Error(`Error al crear perfil: ${profileError.message}`);
//       }

//       // 2. Crear estudiante con carrera
//       const { data: studentData, error: studentError } = await supabase
//         .from('estudiantes')
//         .insert({
//           numero_control: formData.controlNumber,
//           nombre: formData.firstName,
//           apellido_paterno: formData.paternalSurname,
//           apellido_materno: formData.maternalSurname,
//           semestre_actual: parseInt(formData.currentSemester),
//           carrera_id: formData.careerId,
//           user_id: authData.user.id,
//         })
//         .select()
//         .single();

//       if (studentError) {
//         console.error('Error creating student:', studentError);
//         throw new Error(`Error al crear estudiante: ${studentError.message}`);
//       }

//       // 3. Actualizar user_profile con estudiante_id
//       const { error: updateError } = await supabase
//         .from('user_profiles')
//         .update({ estudiante_id: studentData.id })
//         .eq('id', authData.user.id);

//       if (updateError) {
//         console.error('Error updating profile with student_id:', updateError);
//         // No lanzar error, esto puede actualizarse después
//       }

//       console.log('Perfil creado exitosamente');

//       setSuccess(true);
//     } catch (err: any) {
//       console.error('Error en registro:', err);
//       setError(err.message || 'Error al registrar. Intenta nuevamente.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (success) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
//         <div className="max-w-md w-full">
//           <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
//               <GraduationCap className="w-10 h-10 text-green-600" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900 mb-3">
//               ¡Registro Exitoso!
//             </h2>
//             <p className="text-gray-600 mb-6">
//               Tu cuenta ha sido creada correctamente. 
//               Hemos enviado un correo de verificación a <strong>{formData.email}</strong>
//             </p>
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//               <p className="text-sm text-blue-900">
//                 <strong>Importante:</strong> Revisa tu bandeja de entrada y haz clic en el enlace de verificación 
//                 para activar tu cuenta y poder iniciar sesión.
//               </p>
//             </div>
//             <button
//               onClick={onBack}
//               className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//             >
//               Ir a Iniciar Sesión
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
//       <div className="max-w-2xl w-full">
//         <div className="bg-white rounded-2xl shadow-2xl p-8">
//           <button
//             onClick={onBack}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Volver al inicio de sesión
//           </button>

//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
//               <GraduationCap className="w-10 h-10 text-blue-600" />
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//               Registro de Estudiante
//             </h1>
//             <p className="text-gray-600">
//               Instituto Tecnológico de Tijuana
//             </p>
//           </div>

//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//               <p className="text-sm text-red-800">{error}</p>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Número de Control *
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.controlNumber}
//                   onChange={(e) => setFormData({ ...formData, controlNumber: e.target.value })}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Ej: 20210001"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Nombre(s) *
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.firstName}
//                   onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Apellido Paterno *
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.paternalSurname}
//                   onChange={(e) => setFormData({ ...formData, paternalSurname: e.target.value })}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Apellido Materno *
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.maternalSurname}
//                   onChange={(e) => setFormData({ ...formData, maternalSurname: e.target.value })}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Carrera *
//                 </label>
//                 <div className="relative">
//                   <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <select
//                     required
//                     value={formData.careerId}
//                     onChange={(e) => setFormData({ ...formData, careerId: e.target.value })}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
//                     disabled={loadingCareers}
//                   >
//                     <option value="">
//                       {loadingCareers ? 'Cargando carreras...' : 'Selecciona tu carrera'}
//                     </option>
//                     {careers.map(career => (
//                       <option key={career.id} value={career.id}>
//                         {career.nombre}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 {careers.length === 0 && !loadingCareers && (
//                   <p className="mt-2 text-sm text-amber-600">
//                     No hay carreras disponibles. Contacta al administrador.
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Semestre Actual *
//                 </label>
//                 <select
//                   required
//                   value={formData.currentSemester}
//                   onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   {[1,2,3,4,5,6,7,8,9,10,11,12].map(sem => (
//                     <option key={sem} value={sem}>Semestre {sem}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             <div className="border-t pt-6">
//               <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos de la Cuenta</h3>
              
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Correo Institucional *
//                   </label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                       type="email"
//                       required
//                       value={formData.email}
//                       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="tu@correo.com"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Contraseña *
//                   </label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                       type="password"
//                       required
//                       value={formData.password}
//                       onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Mínimo 6 caracteres"
//                       minLength={6}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Confirmar Contraseña *
//                   </label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                       type="password"
//                       required
//                       value={formData.confirmPassword}
//                       onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Repite tu contraseña"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <button
//               type="submit"
//               disabled={loading || loadingCareers || careers.length === 0}
//               className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Registrando...' : 'Crear Cuenta'}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { GraduationCap, Mail, Lock, ArrowLeft, BookOpen, AlertCircle } from 'lucide-react';

interface RegisterProps {
  onBack: () => void;
}

interface Career {
  id: string;
  nombre: string;
  codigo: string;
}

export default function StudentRegister({ onBack }: RegisterProps) {
  const { settings, announceMessage, speakText } = useAccessibility();
  const [loading, setLoading] = useState(false);
  const [loadingCareers, setLoadingCareers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [careers, setCareers] = useState<Career[]>([]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    controlNumber: '',
    firstName: '',
    paternalSurname: '',
    maternalSurname: '',
    currentSemester: '1',
    careerId: '',
  });

  useEffect(() => {
    loadCareers();
  }, []);

  const loadCareers = async () => {
    setLoadingCareers(true);
    announceMessage('Cargando carreras disponibles', 'polite');
    
    try {
      const { data, error } = await supabase
        .from('carreras')
        .select('id, nombre, codigo')
        .order('nombre');

      if (error) throw error;

      setCareers(data || []);
      announceMessage('Carreras cargadas correctamente', 'polite');
    } catch (err) {
      console.error('Error cargando carreras:', err);
      const errorMsg = 'Error al cargar las carreras disponibles';
      setError(errorMsg);
      announceMessage(`Error: ${errorMsg}`, 'assertive');
      if (settings.readAloud) {
        speakText(errorMsg);
      }
    } finally {
      setLoadingCareers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    announceMessage('Procesando registro, por favor espere', 'polite');

    try {
      // Validaciones
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (formData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (!formData.careerId) {
        throw new Error('Debes seleccionar una carrera');
      }

      // Verificar si el número de control ya existe
      const { data: existingStudent } = await supabase
        .from('estudiantes')
        .select('id')
        .eq('numero_control', formData.controlNumber)
        .maybeSingle();

      if (existingStudent) {
        throw new Error('Este número de control ya está registrado');
      }

      // Crear el usuario primero
      const fullName = `${formData.firstName} ${formData.paternalSurname} ${formData.maternalSurname}`;
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: fullName,
            role: 'student',
          },
          emailRedirectTo: `${window.location.origin}`,
        },
      });

      if (signUpError) {
        console.error('Error creating user:', signUpError);
        throw new Error(`Error al crear usuario: ${signUpError.message}`);
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      // Crear el perfil y estudiante manualmente
      console.log('Creando perfil para usuario:', authData.user.id);

      // 1. Crear/actualizar user_profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: authData.user.id,
          role: 'student',
          email: formData.email,
          full_name: fullName,
          is_active: true,
        }, { onConflict: 'id' });

      if (profileError) {
        console.error('Error creating user_profile:', profileError);
        throw new Error(`Error al crear perfil: ${profileError.message}`);
      }

      // 2. Crear estudiante con carrera
      const { data: studentData, error: studentError } = await supabase
        .from('estudiantes')
        .insert({
          numero_control: formData.controlNumber,
          nombre: formData.firstName,
          apellido_paterno: formData.paternalSurname,
          apellido_materno: formData.maternalSurname,
          semestre_actual: parseInt(formData.currentSemester),
          carrera_id: formData.careerId,
          user_id: authData.user.id,
        })
        .select()
        .single();

      if (studentError) {
        console.error('Error creating student:', studentError);
        throw new Error(`Error al crear estudiante: ${studentError.message}`);
      }

      // 3. Actualizar user_profile con estudiante_id
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ estudiante_id: studentData.id })
        .eq('id', authData.user.id);

      if (updateError) {
        console.error('Error updating profile with student_id:', updateError);
        // No lanzar error, esto puede actualizarse después
      }

      console.log('Perfil creado exitosamente');

      setSuccess(true);
      announceMessage('Registro exitoso. Verifica tu correo electrónico', 'assertive');
      if (settings.readAloud) {
        speakText('Tu cuenta ha sido creada correctamente. Por favor revisa tu correo electrónico para verificar tu cuenta.');
      }
    } catch (err: any) {
      console.error('Error en registro:', err);
      const errorMsg = err.message || 'Error al registrar. Intenta nuevamente.';
      setError(errorMsg);
      announceMessage(`Error: ${errorMsg}`, 'assertive');
      if (settings.readAloud) {
        speakText(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div 
            className="bg-white rounded-2xl shadow-2xl p-8 text-center"
            role="alert"
            aria-live="polite"
          >
            <div 
              className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4"
              onMouseEnter={() => settings.readAloud && speakText('Registro exitoso')}
            >
              <GraduationCap className="w-10 h-10 text-green-600" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              ¡Registro Exitoso!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu cuenta ha sido creada correctamente. 
              Hemos enviado un correo de verificación a <strong>{formData.email}</strong>
            </p>
            <div 
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
              role="note"
            >
              <p className="text-sm text-blue-900">
                <strong>Importante:</strong> Revisa tu bandeja de entrada y haz clic en el enlace de verificación 
                para activar tu cuenta y poder iniciar sesión.
              </p>
            </div>
            <button
              onClick={() => {
                onBack();
                announceMessage('Regresando a la página de inicio de sesión');
              }}
              onMouseEnter={() => settings.readAloud && speakText('Ir a Iniciar Sesión')}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-4 focus:ring-blue-300"
              aria-label="Volver a la página de inicio de sesión"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <button
            onClick={() => {
              onBack();
              announceMessage('Regresando al inicio de sesión');
            }}
            onMouseEnter={() => settings.readAloud && speakText('Volver al inicio de sesión')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            aria-label="Regresar a la página de inicio de sesión"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Volver al inicio de sesión
          </button>

          <div 
            className="text-center mb-8"
            role="banner"
          >
            <div 
              className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4"
              onMouseEnter={() => settings.readAloud && speakText('Registro de Estudiante')}
            >
              <GraduationCap className="w-10 h-10 text-blue-600" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Registro de Estudiante
            </h1>
            <p className="text-gray-600">
              Instituto Tecnológico de Tijuana
            </p>
          </div>

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

          <div className="space-y-6" role="region" aria-label="Formulario de registro de estudiante">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="controlNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                  Número de Control *
                </label>
                <input
                  id="controlNumber"
                  type="text"
                  required
                  value={formData.controlNumber}
                  onChange={(e) => setFormData({ ...formData, controlNumber: e.target.value })}
                  onFocus={() => {
                    if (settings.readAloud) {
                      speakText('Campo de número de control');
                    }
                    announceMessage('Campo de número de control enfocado');
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Número de Control')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ej: 20210001"
                  aria-describedby="controlNumber-description"
                />
                <span id="controlNumber-description" className="sr-only">
                  Ingresa tu número de control estudiantil
                </span>
              </div>

              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre(s) *
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  onFocus={() => {
                    if (settings.readAloud) {
                      speakText('Campo de nombre');
                    }
                    announceMessage('Campo de nombre enfocado');
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Nombre')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label htmlFor="paternalSurname" className="block text-sm font-semibold text-gray-700 mb-2">
                  Apellido Paterno *
                </label>
                <input
                  id="paternalSurname"
                  type="text"
                  required
                  value={formData.paternalSurname}
                  onChange={(e) => setFormData({ ...formData, paternalSurname: e.target.value })}
                  onFocus={() => {
                    if (settings.readAloud) {
                      speakText('Campo de apellido paterno');
                    }
                    announceMessage('Campo de apellido paterno enfocado');
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Apellido Paterno')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label htmlFor="maternalSurname" className="block text-sm font-semibold text-gray-700 mb-2">
                  Apellido Materno *
                </label>
                <input
                  id="maternalSurname"
                  type="text"
                  required
                  value={formData.maternalSurname}
                  onChange={(e) => setFormData({ ...formData, maternalSurname: e.target.value })}
                  onFocus={() => {
                    if (settings.readAloud) {
                      speakText('Campo de apellido materno');
                    }
                    announceMessage('Campo de apellido materno enfocado');
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Apellido Materno')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label htmlFor="careerId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Carrera *
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                  <select
                    id="careerId"
                    required
                    value={formData.careerId}
                    onChange={(e) => setFormData({ ...formData, careerId: e.target.value })}
                    onFocus={() => {
                      if (settings.readAloud) {
                        speakText('Campo de selección de carrera');
                      }
                      announceMessage('Campo de carrera enfocado');
                    }}
                    onMouseEnter={() => settings.readAloud && speakText('Selecciona tu carrera')}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                    disabled={loadingCareers}
                    aria-describedby="careerId-description"
                  >
                    <option value="">
                      {loadingCareers ? 'Cargando carreras...' : 'Selecciona tu carrera'}
                    </option>
                    {careers.map(career => (
                      <option key={career.id} value={career.id}>
                        {career.nombre}
                      </option>
                    ))}
                  </select>
                  <span id="careerId-description" className="sr-only">
                    Selecciona la carrera que estás cursando
                  </span>
                </div>
                {careers.length === 0 && !loadingCareers && (
                  <p className="mt-2 text-sm text-amber-600" role="alert">
                    No hay carreras disponibles. Contacta al administrador.
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="currentSemester" className="block text-sm font-semibold text-gray-700 mb-2">
                  Semestre Actual *
                </label>
                <select
                  id="currentSemester"
                  required
                  value={formData.currentSemester}
                  onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value })}
                  onFocus={() => {
                    if (settings.readAloud) {
                      speakText('Campo de semestre actual');
                    }
                    announceMessage('Campo de semestre enfocado');
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Semestre Actual')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(sem => (
                    <option key={sem} value={sem}>Semestre {sem}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos de la Cuenta</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Correo Institucional *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => {
                        if (settings.readAloud) {
                          speakText('Campo de correo electrónico');
                        }
                        announceMessage('Campo de correo electrónico enfocado');
                      }}
                      onMouseEnter={() => settings.readAloud && speakText('Correo Institucional')}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="tu@correo.com"
                      aria-describedby="email-description"
                    />
                    <span id="email-description" className="sr-only">
                      Ingresa tu correo electrónico institucional
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <input
                      id="password"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                      aria-describedby="password-description"
                    />
                    <span id="password-description" className="sr-only">
                      Ingresa una contraseña de al menos 6 caracteres
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      onFocus={() => {
                        if (settings.readAloud) {
                          speakText('Campo de confirmar contraseña');
                        }
                        announceMessage('Campo de confirmar contraseña enfocado');
                      }}
                      onMouseEnter={() => settings.readAloud && speakText('Confirmar Contraseña')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSubmit(e as any);
                        }
                      }}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Repite tu contraseña"
                      aria-describedby="confirmPassword-description"
                    />
                    <span id="confirmPassword-description" className="sr-only">
                      Repite la contraseña para confirmar
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || loadingCareers || careers.length === 0}
              onMouseEnter={() => settings.readAloud && speakText('Botón Crear Cuenta')}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:scale-[1.02] active:scale-[0.98]"
              aria-label={loading ? 'Creando cuenta, por favor espere' : 'Crear cuenta de estudiante'}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </span>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t">
            <p 
              className="text-xs text-center text-gray-500"
              role="note"
            >
              Al registrarte, recibirás un correo de verificación para activar tu cuenta
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
          <li>Todos los campos marcados con asterisco son obligatorios</li>
        </ul>
      </div>
    </div>
  );
}