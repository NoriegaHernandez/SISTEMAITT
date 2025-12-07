// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase';
// import { useAuth } from '../contexts/AuthContext';
// import { BookOpen, Users, Edit2, Save, X, AlertTriangle, Plus } from 'lucide-react';

// interface Grupo {
//   id: string;
//   nombre_grupo: string;
//   periodo_academico: string;
//   materias: { nombre: string };
//   inscritos: number;
// }

// interface EstudianteGrupo {
//   id: string;
//   inscripcion_id: string;
//   numero_control: string;
//   nombre: string;
//   apellido_paterno: string;
//   apellido_materno: string;
//   calificacion_unidad1: number | null;
//   calificacion_unidad2: number | null;
//   calificacion_unidad3: number | null;
//   calificacion_final: number | null;
//   porcentaje_asistencia: number | null;
//   estado: string;
//   registro_materia_id: string | null;
// }

// interface CalificacionForm {
//   inscripcion_id: string;
//   registro_materia_id: string | null;
//   calificacion_unidad1: string;
//   calificacion_unidad2: string;
//   calificacion_unidad3: string;
//   porcentaje_asistencia: string;
// }

// interface CategoriaRiesgo {
//   id: string;
//   nombre: string;
//   descripcion: string;
// }

// interface FactorRiesgo {
//   id: string;
//   categoria_id: string;
//   inscripcion_id: string;
//   severidad: 'baja' | 'media' | 'alta';
//   observaciones: string;
// }

// export default function TeacherGroupsView() {
//   const { profile } = useAuth();
//   const [grupos, setGrupos] = useState<Grupo[]>([]);
//   const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);
//   const [estudiantes, setEstudiantes] = useState<EstudianteGrupo[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [editingGrade, setEditingGrade] = useState<CalificacionForm | null>(null);
//   const [showRiskModal, setShowRiskModal] = useState(false);
//   const [selectedEstudiante, setSelectedEstudiante] = useState<EstudianteGrupo | null>(null);
//   const [categorias, setCategorias] = useState<CategoriaRiesgo[]>([]);
//   const [factoresRiesgo, setFactoresRiesgo] = useState<FactorRiesgo[]>([]);

//   useEffect(() => {
//     if (profile?.id) {
//       loadGrupos();
//       loadCategorias();
//     }
//   }, [profile]);

//   const loadCategorias = async () => {
//     try {
//       const { data } = await supabase
//         .from('categorias_factores_riesgo')
//         .select('*')
//         .order('nombre');
      
//       if (data) setCategorias(data);
//     } catch (error) {
//       console.error('Error cargando categorías:', error);
//     }
//   };

//   const loadGrupos = async () => {
//     if (!profile?.id) return;

//     setLoading(true);
//     try {
//       const { data: gruposData } = await supabase
//         .from('grupos_materia')
//         .select(`
//           id,
//           nombre_grupo,
//           periodo_academico,
//           esta_activo,
//           materias!materia_id (nombre)
//         `)
//         .eq('docente_id', profile.id)
//         .eq('esta_activo', true)
//         .order('creado_en', { ascending: false });

//       if (gruposData) {
//         const gruposConConteo = await Promise.all(
//           gruposData.map(async (grupo: any) => {
//             const { count } = await supabase
//               .from('inscripciones_grupo')
//               .select('id', { count: 'exact', head: true })
//               .eq('grupo_id', grupo.id)
//               .in('estado', ['activo', 'completado']);

//             return { ...grupo, inscritos: count || 0 };
//           })
//         );
//         setGrupos(gruposConConteo);
//       }
//     } catch (error) {
//       console.error('Error cargando grupos:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadEstudiantes = async (grupoId: string) => {
//     setLoading(true);
//     try {
//       // Primero obtener datos del grupo
//       const { data: grupoData } = await supabase
//         .from('grupos_materia')
//         .select('materia_id, semestre_periodo')
//         .eq('id', grupoId)
//         .single();

//       if (!grupoData) throw new Error('Grupo no encontrado');

//       // Obtener inscripciones
//       const { data, error } = await supabase
//         .from('inscripciones_grupo')
//         .select(`
//           id,
//           calificacion_final,
//           estado,
//           estudiantes!inner (
//             id,
//             numero_control,
//             nombre,
//             apellido_paterno,
//             apellido_materno
//           )
//         `)
//         .eq('grupo_id', grupoId)
//         .in('estado', ['activo', 'completado']);

//       if (error) throw error;

//       // Para cada estudiante, obtener sus calificaciones de registros_estudiante_materia
//       const estudiantesFormateados = await Promise.all(
//         (data || []).map(async (item: any) => {
//           const { data: registro } = await supabase
//             .from('registros_estudiante_materia')
//             .select('*')
//             .eq('estudiante_id', item.estudiantes.id)
//             .eq('materia_id', grupoData.materia_id)
//             .eq('semestre', grupoData.semestre_periodo)
//             .maybeSingle();

//           return {
//             id: item.estudiantes.id,
//             inscripcion_id: item.id,
//             numero_control: item.estudiantes.numero_control,
//             nombre: item.estudiantes.nombre,
//             apellido_paterno: item.estudiantes.apellido_paterno,
//             apellido_materno: item.estudiantes.apellido_materno,
//             calificacion_unidad1: registro?.calificacion_unidad1 || null,
//             calificacion_unidad2: registro?.calificacion_unidad2 || null,
//             calificacion_unidad3: registro?.calificacion_unidad3 || null,
//             calificacion_final: registro?.calificacion_final || item.calificacion_final,
//             porcentaje_asistencia: registro?.porcentaje_asistencia || null,
//             estado: registro?.estado || item.estado,
//             registro_materia_id: registro?.id || null,
//           };
//         })
//       );

//       setEstudiantes(estudiantesFormateados);
//     } catch (error) {
//       console.error('Error cargando estudiantes:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelectGrupo = (grupo: Grupo) => {
//     setSelectedGrupo(grupo);
//     loadEstudiantes(grupo.id);
//   };

//   const handleEditGrade = (estudiante: EstudianteGrupo) => {
//     setEditingGrade({
//       inscripcion_id: estudiante.inscripcion_id,
//       registro_materia_id: estudiante.registro_materia_id,
//       calificacion_unidad1: estudiante.calificacion_unidad1?.toString() || '',
//       calificacion_unidad2: estudiante.calificacion_unidad2?.toString() || '',
//       calificacion_unidad3: estudiante.calificacion_unidad3?.toString() || '',
//       porcentaje_asistencia: estudiante.porcentaje_asistencia?.toString() || '',
//     });
//   };

//   const calcularCalificacionFinal = (u1: number | null, u2: number | null, u3: number | null): number | null => {
//     const calificaciones = [u1, u2, u3].filter(c => c !== null) as number[];
//     if (calificaciones.length === 0) return null;
//     return calificaciones.reduce((sum, c) => sum + c, 0) / calificaciones.length;
//   };

//   const handleSaveGrade = async () => {
//     if (!editingGrade || !selectedGrupo) return;

//     const u1 = editingGrade.calificacion_unidad1.trim() === '' ? null : parseFloat(editingGrade.calificacion_unidad1);
//     const u2 = editingGrade.calificacion_unidad2.trim() === '' ? null : parseFloat(editingGrade.calificacion_unidad2);
//     const u3 = editingGrade.calificacion_unidad3.trim() === '' ? null : parseFloat(editingGrade.calificacion_unidad3);
//     const asistencia = editingGrade.porcentaje_asistencia.trim() === '' ? null : parseFloat(editingGrade.porcentaje_asistencia);

//     // Validar rangos
//     const calificaciones = [u1, u2, u3];
//     for (const cal of calificaciones) {
//       if (cal !== null && (cal < 0 || cal > 100)) {
//         alert('Las calificaciones deben estar entre 0 y 100');
//         return;
//       }
//     }

//     if (asistencia !== null && (asistencia < 0 || asistencia > 100)) {
//       alert('El porcentaje de asistencia debe estar entre 0 y 100');
//       return;
//     }

//     if (!profile?.id) {
//       alert('Error: No se pudo identificar el usuario');
//       return;
//     }

//     setLoading(true);
//     try {
//       // Verificar acceso del docente
//       const { data: grupoCheck, error: grupoError } = await supabase
//         .from('inscripciones_grupo')
//         .select(`
//           id,
//           grupo_id,
//           grupos_materia!inner (
//             docente_id,
//             materia_id,
//             semestre_periodo
//           )
//         `)
//         .eq('id', editingGrade.inscripcion_id)
//         .single();

//       if (grupoError) {
//         throw new Error(`No se pudo verificar el grupo: ${grupoError.message}`);
//       }

//       const docenteId = (grupoCheck as any).grupos_materia.docente_id;
//       if (docenteId !== profile.id) {
//         throw new Error('No tienes permiso para calificar este grupo');
//       }

//       const materiaId = (grupoCheck as any).grupos_materia.materia_id;
//       const semestrePeriodo = (grupoCheck as any).grupos_materia.semestre_periodo;

//       // Calcular calificación final
//       const calificacionFinal = calcularCalificacionFinal(u1, u2, u3);
      
//       // Determinar estado
//       let nuevoEstado = 'en_progreso';
//       if (calificacionFinal !== null) {
//         nuevoEstado = calificacionFinal >= 70 ? 'aprobado' : 'reprobado';
//       }

//       // Obtener estudiante_id
//       const estudiante = estudiantes.find(e => e.inscripcion_id === editingGrade.inscripcion_id);
//       if (!estudiante) throw new Error('Estudiante no encontrado');

//       // Actualizar o crear registro en registros_estudiante_materia
//       if (editingGrade.registro_materia_id) {
//         // Actualizar registro existente
//         const { error: updateError } = await supabase
//           .from('registros_estudiante_materia')
//           .update({
//             calificacion_unidad1: u1,
//             calificacion_unidad2: u2,
//             calificacion_unidad3: u3,
//             calificacion_final: calificacionFinal,
//             porcentaje_asistencia: asistencia,
//             estado: nuevoEstado,
//             actualizado_en: new Date().toISOString()
//           })
//           .eq('id', editingGrade.registro_materia_id);

//         if (updateError) throw updateError;
//       } else {
//         // Crear nuevo registro
//         const { error: insertError } = await supabase
//           .from('registros_estudiante_materia')
//           .insert({
//             estudiante_id: estudiante.id,
//             materia_id: materiaId,
//             semestre: semestrePeriodo,
//             calificacion_unidad1: u1,
//             calificacion_unidad2: u2,
//             calificacion_unidad3: u3,
//             calificacion_final: calificacionFinal,
//             porcentaje_asistencia: asistencia,
//             estado: nuevoEstado
//           });

//         if (insertError) throw insertError;
//       }

//       // Actualizar calificación final en inscripciones_grupo
//       const { error: updateInscripcionError } = await supabase
//         .from('inscripciones_grupo')
//         .update({
//           calificacion_final: calificacionFinal,
//           estado: calificacionFinal !== null ? 'completado' : 'activo'
//         })
//         .eq('id', editingGrade.inscripcion_id);

//       if (updateInscripcionError) throw updateInscripcionError;

//       alert('Calificaciones guardadas correctamente');
//       setEditingGrade(null);
      
//       if (selectedGrupo) {
//         await loadEstudiantes(selectedGrupo.id);
//       }

//     } catch (error: any) {
//       console.error('Error completo:', error);
//       alert(`${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleManageRisks = async (estudiante: EstudianteGrupo) => {
//     setSelectedEstudiante(estudiante);
    
//     try {
//       if (estudiante.registro_materia_id) {
//         const { data: factores } = await supabase
//           .from('factores_riesgo_estudiante')
//           .select(`
//             id,
//             factor_riesgo_id,
//             severidad,
//             observaciones,
//             factores_riesgo!inner (categoria_id)
//           `)
//           .eq('registro_estudiante_materia_id', estudiante.registro_materia_id);

//         if (factores) {
//           const factoresFormateados = factores.map((f: any) => ({
//             id: f.id,
//             categoria_id: f.factores_riesgo.categoria_id,
//             inscripcion_id: estudiante.inscripcion_id,
//             severidad: f.severidad as 'baja' | 'media' | 'alta',
//             observaciones: f.observaciones || '',
//           }));
//           setFactoresRiesgo(factoresFormateados);
//         }
//       }
//     } catch (error) {
//       console.error('Error cargando factores:', error);
//     }
    
//     setShowRiskModal(true);
//   };

//   const handleAddRiskFactor = async (categoriaId: string) => {
//     if (!selectedEstudiante || !selectedGrupo) return;

//     try {
//       let registroId: string;
      
//       if (selectedEstudiante.registro_materia_id) {
//         registroId = selectedEstudiante.registro_materia_id;
//       } else {
//         const { data: grupoData } = await supabase
//           .from('grupos_materia')
//           .select('materia_id, semestre_periodo')
//           .eq('id', selectedGrupo.id)
//           .single();

//         const { data: newRegistro, error: regError } = await supabase
//           .from('registros_estudiante_materia')
//           .insert({
//             estudiante_id: selectedEstudiante.id,
//             materia_id: (grupoData as any).materia_id,
//             semestre: (grupoData as any).semestre_periodo,
//             estado: 'en_progreso',
//           })
//           .select()
//           .single();

//         if (regError) throw regError;
//         registroId = newRegistro.id;
//       }

//       const { data: existingFactor } = await supabase
//         .from('factores_riesgo')
//         .select('id')
//         .eq('categoria_id', categoriaId)
//         .maybeSingle();

//       let factorId: string;
//       if (existingFactor) {
//         factorId = existingFactor.id;
//       } else {
//         const categoria = categorias.find((c: CategoriaRiesgo) => c.id === categoriaId);
//         const { data: newFactor, error: factorError } = await supabase
//           .from('factores_riesgo')
//           .insert({
//             categoria_id: categoriaId,
//             nombre: categoria?.nombre || 'Factor',
//             descripcion: categoria?.descripcion,
//           })
//           .select()
//           .single();

//         if (factorError) throw factorError;
//         factorId = newFactor.id;
//       }

//       const { error } = await supabase
//         .from('factores_riesgo_estudiante')
//         .insert({
//           registro_estudiante_materia_id: registroId,
//           factor_riesgo_id: factorId,
//           severidad: 'media',
//           observaciones: '',
//         });

//       if (error) throw error;

//       alert('Factor de riesgo agregado');
//       handleManageRisks(selectedEstudiante);
//     } catch (error: any) {
//       console.error('Error:', error);
//       alert(`Error: ${error.message}`);
//     }
//   };

//   if (loading && grupos.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-gray-500">Cargando grupos...</div>
//       </div>
//     );
//   }

//   if (grupos.length === 0) {
//     return (
//       <div className="bg-white rounded-lg shadow-lg p-6">
//         <div className="text-center py-12">
//           <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-800 mb-2">
//             No tienes grupos asignados
//           </h3>
//           <p className="text-gray-600">
//             Contacta al administrador para que te asigne grupos.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="bg-white rounded-lg shadow-lg p-6">
//         <div className="flex items-center gap-3 mb-6">
//           <BookOpen className="w-8 h-8 text-blue-600" />
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">Mis Grupos</h2>
//             <p className="text-sm text-gray-600">
//               {grupos.length} grupo{grupos.length !== 1 ? 's' : ''} asignado{grupos.length !== 1 ? 's' : ''}
//             </p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {grupos.map((grupo) => (
//             <div
//               key={grupo.id}
//               onClick={() => handleSelectGrupo(grupo)}
//               className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
//                 selectedGrupo?.id === grupo.id
//                   ? 'border-blue-500 bg-blue-50'
//                   : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
//               }`}
//             >
//               <div className="flex items-start justify-between mb-2">
//                 <div className="flex-1">
//                   <h3 className="font-semibold text-gray-800">{grupo.materias.nombre}</h3>
//                   <p className="text-sm text-gray-600">{grupo.nombre_grupo}</p>
//                 </div>
//                 <div className="flex items-center gap-1 text-blue-600">
//                   <Users className="w-4 h-4" />
//                   <span className="text-sm font-medium">{grupo.inscritos}</span>
//                 </div>
//               </div>
//               <p className="text-xs text-gray-500 mt-2">{grupo.periodo_academico}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {selectedGrupo && (
//         <div className="bg-white rounded-lg shadow-lg p-6">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h3 className="text-xl font-bold text-gray-800">
//                 Estudiantes - {selectedGrupo.nombre_grupo}
//               </h3>
//               <p className="text-sm text-gray-600">
//                 {estudiantes.length} estudiante{estudiantes.length !== 1 ? 's' : ''} inscrito{estudiantes.length !== 1 ? 's' : ''}
//               </p>
//             </div>
//             <button
//               onClick={() => {
//                 setSelectedGrupo(null);
//                 setEstudiantes([]);
//               }}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>

//           {estudiantes.length === 0 ? (
//             <div className="text-center py-12 text-gray-500">
//               No hay estudiantes inscritos en este grupo
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-gray-200">
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                       No. Control
//                     </th>
//                     <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
//                       Estudiante
//                     </th>
//                     <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
//                       Unidad 1
//                     </th>
//                     <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
//                       Unidad 2
//                     </th>
//                     <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
//                       Unidad 3
//                     </th>
//                     <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
//                       Asistencia %
//                     </th>
//                     <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
//                       Final
//                     </th>
//                     <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
//                       Estado
//                     </th>
//                     <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
//                       Acciones
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {estudiantes.map((estudiante) => {
//                     const isEditing = editingGrade?.inscripcion_id === estudiante.inscripcion_id;
                    
//                     return (
//                       <tr key={estudiante.id} className="border-b border-gray-100 hover:bg-gray-50">
//                         <td className="px-4 py-3 text-sm text-gray-900 font-medium">
//                           {estudiante.numero_control}
//                         </td>
//                         <td className="px-4 py-3 text-sm text-gray-900">
//                           {estudiante.apellido_paterno} {estudiante.apellido_materno}, {estudiante.nombre}
//                         </td>
                        
//                         {/* Unidad 1 */}
//                         <td className="px-4 py-3 text-center text-sm">
//                           {isEditing ? (
//                             <input
//                               type="number"
//                               min="0"
//                               max="100"
//                               step="0.01"
//                               value={editingGrade.calificacion_unidad1}
//                               onChange={(e) => setEditingGrade({
//                                 ...editingGrade,
//                                 calificacion_unidad1: e.target.value,
//                               })}
//                               className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
//                               placeholder="0-100"
//                             />
//                           ) : estudiante.calificacion_unidad1 !== null ? (
//                             <span className="font-semibold text-gray-700">
//                               {estudiante.calificacion_unidad1.toFixed(1)}
//                             </span>
//                           ) : (
//                             <span className="text-gray-400 italic">-</span>
//                           )}
//                         </td>

//                         {/* Unidad 2 */}
//                         <td className="px-4 py-3 text-center text-sm">
//                           {isEditing ? (
//                             <input
//                               type="number"
//                               min="0"
//                               max="100"
//                               step="0.01"
//                               value={editingGrade.calificacion_unidad2}
//                               onChange={(e) => setEditingGrade({
//                                 ...editingGrade,
//                                 calificacion_unidad2: e.target.value,
//                               })}
//                               className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
//                               placeholder="0-100"
//                             />
//                           ) : estudiante.calificacion_unidad2 !== null ? (
//                             <span className="font-semibold text-gray-700">
//                               {estudiante.calificacion_unidad2.toFixed(1)}
//                             </span>
//                           ) : (
//                             <span className="text-gray-400 italic">-</span>
//                           )}
//                         </td>

//                         {/* Unidad 3 */}
//                         <td className="px-4 py-3 text-center text-sm">
//                           {isEditing ? (
//                             <input
//                               type="number"
//                               min="0"
//                               max="100"
//                               step="0.01"
//                               value={editingGrade.calificacion_unidad3}
//                               onChange={(e) => setEditingGrade({
//                                 ...editingGrade,
//                                 calificacion_unidad3: e.target.value,
//                               })}
//                               className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
//                               placeholder="0-100"
//                             />
//                           ) : estudiante.calificacion_unidad3 !== null ? (
//                             <span className="font-semibold text-gray-700">
//                               {estudiante.calificacion_unidad3.toFixed(1)}
//                             </span>
//                           ) : (
//                             <span className="text-gray-400 italic">-</span>
//                           )}
//                         </td>

//                         {/* Asistencia */}
//                         <td className="px-4 py-3 text-center text-sm">
//                           {isEditing ? (
//                             <input
//                               type="number"
//                               min="0"
//                               max="100"
//                               step="0.01"
//                               value={editingGrade.porcentaje_asistencia}
//                               onChange={(e) => setEditingGrade({
//                                 ...editingGrade,
//                                 porcentaje_asistencia: e.target.value,
//                               })}
//                               className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
//                               placeholder="0-100"
//                             />
//                           ) : estudiante.porcentaje_asistencia !== null ? (
//                             <span className="text-gray-700">
//                               {estudiante.porcentaje_asistencia.toFixed(1)}%
//                             </span>
//                           ) : (
//                             <span className="text-gray-400 italic">-</span>
//                           )}
//                         </td>

//                         {/* Calificación Final */}
//                         <td className="px-4 py-3 text-center text-sm">
//                           {estudiante.calificacion_final !== null ? (
//                             <span className={`font-bold ${
//                               estudiante.calificacion_final >= 70 ? 'text-green-700' : 'text-red-700'
//                             }`}>
//                               {estudiante.calificacion_final.toFixed(1)}
//                             </span>
//                           ) : (
//                             <span className="text-gray-400 italic">-</span>
//                           )}
//                         </td>

//                         {/* Estado */}
//                         <td className="px-4 py-3 text-center">
//                           {estudiante.calificacion_final !== null ? (
//                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                               estudiante.calificacion_final >= 70
//                                 ? 'bg-green-100 text-green-800'
//                                 : 'bg-red-100 text-red-800'
//                             }`}>
//                               {estudiante.calificacion_final >= 70 ? 'Aprobado' : 'Reprobado'}
//                             </span>
//                           ) : (
//                             <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
//                               En progreso
//                             </span>
//                           )}
//                         </td>

//                         {/* Acciones */}
//                         <td className="px-4 py-3">
//                           <div className="flex items-center justify-center gap-2">
//                             {isEditing ? (
//                               <>
//                                 <button
//                                   onClick={handleSaveGrade}
//                                   disabled={loading}
//                                   className="text-green-600 hover:text-green-800 p-1"
//                                   title="Guardar"
//                                 >
//                                   <Save className="w-4 h-4" />
//                                 </button>
//                                 <button
//                                   onClick={() => setEditingGrade(null)}
//                                   className="text-gray-600 hover:text-gray-800 p-1"
//                                   title="Cancelar"
//                                 >
//                                   <X className="w-4 h-4" />
//                                 </button>
//                               </>
//                             ) : (
//                               <>
//                                 <button
//                                   onClick={() => handleEditGrade(estudiante)}
//                                   className="text-blue-600 hover:text-blue-800 p-1"
//                                   title="Editar calificaciones"
//                                 >
//                                   <Edit2 className="w-4 h-4" />
//                                 </button>
//                                 <button
//                                   onClick={() => handleManageRisks(estudiante)}
//                                   className="text-orange-600 hover:text-orange-800 p-1"
//                                   title="Factores de riesgo"
//                                 >
//                                   <AlertTriangle className="w-4 h-4" />
//                                 </button>
//                               </>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}

//           <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//             <h4 className="font-semibold text-blue-900 mb-2">Instrucciones</h4>
//             <ul className="text-sm text-blue-800 space-y-1">
//               <li>• Haz clic en el ícono de editar para calificar a un estudiante</li>
//               <li>• Ingresa las calificaciones de cada unidad (0-100) y el porcentaje de asistencia</li>
//               <li>• La calificación final se calcula automáticamente como el promedio de las unidades calificadas</li>
//               <li>• Calificación final ≥ 70 es aprobatoria</li>
//               <li>• Puedes dejar campos vacíos si aún no tienes esas calificaciones</li>
//               <li>• Usa el ícono de alerta para gestionar factores de riesgo</li>
//             </ul>
//           </div>
//         </div>
//       )}

//       {showRiskModal && selectedEstudiante && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
//             <div className="flex justify-between items-center mb-4">
//               <div>
//                 <h3 className="text-xl font-bold text-gray-800">Factores de Riesgo</h3>
//                 <p className="text-sm text-gray-600">
//                   {selectedEstudiante.apellido_paterno} {selectedEstudiante.apellido_materno}, {selectedEstudiante.nombre}
//                 </p>
//               </div>
//               <button onClick={() => setShowRiskModal(false)} className="text-gray-500">
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <div className="space-y-4">
//               {factoresRiesgo.length > 0 && (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//                   <h4 className="font-semibold text-yellow-900 mb-2">
//                     Factores Identificados ({factoresRiesgo.length})
//                   </h4>
//                   <div className="space-y-2">
//                     {factoresRiesgo.map((factor) => {
//                       const categoria = categorias.find(c => c.id === factor.categoria_id);
//                       return (
//                         <div key={factor.id} className="bg-white px-3 py-2 rounded flex justify-between items-center">
//                           <span className="text-sm text-gray-700">{categoria?.nombre}</span>
//                           <span className={`px-2 py-1 rounded text-xs ${
//                             factor.severidad === 'alta' ? 'bg-red-100 text-red-800' :
//                             factor.severidad === 'media' ? 'bg-yellow-100 text-yellow-800' :
//                             'bg-green-100 text-green-800'
//                           }`}>
//                             {factor.severidad}
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               <div>
//                 <h4 className="font-semibold text-gray-800 mb-2">Agregar Factor de Riesgo</h4>
//                 <div className="space-y-2">
//                   {categorias.map((categoria) => (
//                     <button
//                       key={categoria.id}
//                       onClick={() => handleAddRiskFactor(categoria.id)}
//                       disabled={factoresRiesgo.some(f => f.categoria_id === categoria.id)}
//                       className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
//                     >
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <p className="font-medium text-gray-800">{categoria.nombre}</p>
//                           {categoria.descripcion && (
//                             <p className="text-xs text-gray-600">{categoria.descripcion}</p>
//                           )}
//                         </div>
//                         {!factoresRiesgo.some(f => f.categoria_id === categoria.id) && (
//                           <Plus className="w-5 h-5 text-blue-600" />
//                         )}
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div className="mt-6 pt-4 border-t">
//               <button
//                 onClick={() => setShowRiskModal(false)}
//                 className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 Cerrar
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { BookOpen, Users, Edit2, Save, X, AlertTriangle, Plus } from 'lucide-react';

interface Grupo {
  id: string;
  nombre_grupo: string;
  periodo_academico: string;
  materias: { nombre: string };
  inscritos: number;
}

interface EstudianteGrupo {
  id: string;
  inscripcion_id: string;
  numero_control: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  calificacion_unidad1: number | null;
  calificacion_unidad2: number | null;
  calificacion_unidad3: number | null;
  calificacion_final: number | null;
  porcentaje_asistencia: number | null;
  estado: string;
  registro_materia_id: string | null;
}

interface CalificacionForm {
  inscripcion_id: string;
  registro_materia_id: string | null;
  calificacion_unidad1: string;
  calificacion_unidad2: string;
  calificacion_unidad3: string;
  porcentaje_asistencia: string;
}

interface CategoriaRiesgo {
  id: string;
  nombre: string;
  descripcion: string;
}

interface FactorRiesgo {
  id: string;
  categoria_id: string;
  inscripcion_id: string;
  severidad: 'baja' | 'media' | 'alta';
  observaciones: string;
}

export default function TeacherGroupsView() {
  const { profile } = useAuth();
  const { settings, announceMessage, speakText } = useAccessibility();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);
  const [estudiantes, setEstudiantes] = useState<EstudianteGrupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGrade, setEditingGrade] = useState<CalificacionForm | null>(null);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<EstudianteGrupo | null>(null);
  const [categorias, setCategorias] = useState<CategoriaRiesgo[]>([]);
  const [factoresRiesgo, setFactoresRiesgo] = useState<FactorRiesgo[]>([]);

  useEffect(() => {
    if (profile?.id) {
      loadGrupos();
      loadCategorias();
    }
  }, [profile]);

  const loadCategorias = async () => {
    try {
      const { data } = await supabase
        .from('categorias_factores_riesgo')
        .select('*')
        .order('nombre');
      
      if (data) {
        setCategorias(data);
        announceMessage(`${data.length} categorías de factores de riesgo cargadas`, 'polite');
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      announceMessage('Error al cargar categorías de riesgo', 'assertive');
    }
  };

  const loadGrupos = async () => {
    if (!profile?.id) return;

    setLoading(true);
    announceMessage('Cargando grupos, por favor espere', 'polite');
    
    try {
      const { data: gruposData } = await supabase
        .from('grupos_materia')
        .select(`
          id,
          nombre_grupo,
          periodo_academico,
          esta_activo,
          materias!materia_id (nombre)
        `)
        .eq('docente_id', profile.id)
        .eq('esta_activo', true)
        .order('creado_en', { ascending: false });

      if (gruposData) {
        const gruposConConteo = await Promise.all(
          gruposData.map(async (grupo: any) => {
            const { count } = await supabase
              .from('inscripciones_grupo')
              .select('id', { count: 'exact', head: true })
              .eq('grupo_id', grupo.id)
              .in('estado', ['activo', 'completado']);

            return { ...grupo, inscritos: count || 0 };
          })
        );
        setGrupos(gruposConConteo);
        announceMessage(`${gruposConConteo.length} grupos cargados correctamente`, 'polite');
        if (settings.readAloud) {
          speakText(`Tienes ${gruposConConteo.length} grupo${gruposConConteo.length !== 1 ? 's' : ''} asignado${gruposConConteo.length !== 1 ? 's' : ''}`);
        }
      }
    } catch (error) {
      console.error('Error cargando grupos:', error);
      announceMessage('Error al cargar grupos', 'assertive');
      if (settings.readAloud) {
        speakText('Error al cargar grupos');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadEstudiantes = async (grupoId: string) => {
    setLoading(true);
    announceMessage('Cargando estudiantes del grupo', 'polite');
    
    try {
      // Primero obtener datos del grupo
      const { data: grupoData } = await supabase
        .from('grupos_materia')
        .select('materia_id, semestre_periodo')
        .eq('id', grupoId)
        .single();

      if (!grupoData) throw new Error('Grupo no encontrado');

      // Obtener inscripciones
      const { data, error } = await supabase
        .from('inscripciones_grupo')
        .select(`
          id,
          calificacion_final,
          estado,
          estudiantes!inner (
            id,
            numero_control,
            nombre,
            apellido_paterno,
            apellido_materno
          )
        `)
        .eq('grupo_id', grupoId)
        .in('estado', ['activo', 'completado']);

      if (error) throw error;

      // Para cada estudiante, obtener sus calificaciones de registros_estudiante_materia
      const estudiantesFormateados = await Promise.all(
        (data || []).map(async (item: any) => {
          const { data: registro } = await supabase
            .from('registros_estudiante_materia')
            .select('*')
            .eq('estudiante_id', item.estudiantes.id)
            .eq('materia_id', grupoData.materia_id)
            .eq('semestre', grupoData.semestre_periodo)
            .maybeSingle();

          return {
            id: item.estudiantes.id,
            inscripcion_id: item.id,
            numero_control: item.estudiantes.numero_control,
            nombre: item.estudiantes.nombre,
            apellido_paterno: item.estudiantes.apellido_paterno,
            apellido_materno: item.estudiantes.apellido_materno,
            calificacion_unidad1: registro?.calificacion_unidad1 || null,
            calificacion_unidad2: registro?.calificacion_unidad2 || null,
            calificacion_unidad3: registro?.calificacion_unidad3 || null,
            calificacion_final: registro?.calificacion_final || item.calificacion_final,
            porcentaje_asistencia: registro?.porcentaje_asistencia || null,
            estado: registro?.estado || item.estado,
            registro_materia_id: registro?.id || null,
          };
        })
      );

      setEstudiantes(estudiantesFormateados);
      announceMessage(`${estudiantesFormateados.length} estudiantes cargados`, 'polite');
      if (settings.readAloud) {
        speakText(`${estudiantesFormateados.length} estudiante${estudiantesFormateados.length !== 1 ? 's' : ''} inscrito${estudiantesFormateados.length !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
      announceMessage('Error al cargar estudiantes', 'assertive');
      if (settings.readAloud) {
        speakText('Error al cargar estudiantes');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGrupo = (grupo: Grupo) => {
    setSelectedGrupo(grupo);
    loadEstudiantes(grupo.id);
    announceMessage(`Grupo seleccionado: ${grupo.materias.nombre}, ${grupo.nombre_grupo}`, 'polite');
    if (settings.readAloud) {
      speakText(`Grupo ${grupo.nombre_grupo} seleccionado`);
    }
  };

  const handleEditGrade = (estudiante: EstudianteGrupo) => {
    setEditingGrade({
      inscripcion_id: estudiante.inscripcion_id,
      registro_materia_id: estudiante.registro_materia_id,
      calificacion_unidad1: estudiante.calificacion_unidad1?.toString() || '',
      calificacion_unidad2: estudiante.calificacion_unidad2?.toString() || '',
      calificacion_unidad3: estudiante.calificacion_unidad3?.toString() || '',
      porcentaje_asistencia: estudiante.porcentaje_asistencia?.toString() || '',
    });
    announceMessage(`Editando calificaciones de ${estudiante.nombre} ${estudiante.apellido_paterno}`, 'polite');
    if (settings.readAloud) {
      speakText(`Editando calificaciones de ${estudiante.nombre} ${estudiante.apellido_paterno}`);
    }
  };

  const calcularCalificacionFinal = (u1: number | null, u2: number | null, u3: number | null): number | null => {
    const calificaciones = [u1, u2, u3].filter(c => c !== null) as number[];
    if (calificaciones.length === 0) return null;
    return calificaciones.reduce((sum, c) => sum + c, 0) / calificaciones.length;
  };

  const handleSaveGrade = async () => {
    if (!editingGrade || !selectedGrupo) return;

    const u1 = editingGrade.calificacion_unidad1.trim() === '' ? null : parseFloat(editingGrade.calificacion_unidad1);
    const u2 = editingGrade.calificacion_unidad2.trim() === '' ? null : parseFloat(editingGrade.calificacion_unidad2);
    const u3 = editingGrade.calificacion_unidad3.trim() === '' ? null : parseFloat(editingGrade.calificacion_unidad3);
    const asistencia = editingGrade.porcentaje_asistencia.trim() === '' ? null : parseFloat(editingGrade.porcentaje_asistencia);

    // Validar rangos
    const calificaciones = [u1, u2, u3];
    for (const cal of calificaciones) {
      if (cal !== null && (cal < 0 || cal > 100)) {
        const errorMsg = 'Las calificaciones deben estar entre 0 y 100';
        alert(errorMsg);
        announceMessage(errorMsg, 'assertive');
        if (settings.readAloud) {
          speakText(errorMsg);
        }
        return;
      }
    }

    if (asistencia !== null && (asistencia < 0 || asistencia > 100)) {
      const errorMsg = 'El porcentaje de asistencia debe estar entre 0 y 100';
      alert(errorMsg);
      announceMessage(errorMsg, 'assertive');
      if (settings.readAloud) {
        speakText(errorMsg);
      }
      return;
    }

    if (!profile?.id) {
      const errorMsg = 'Error: No se pudo identificar el usuario';
      alert(errorMsg);
      announceMessage(errorMsg, 'assertive');
      return;
    }

    setLoading(true);
    announceMessage('Guardando calificaciones, por favor espere', 'polite');
    
    try {
      // Verificar acceso del docente
      const { data: grupoCheck, error: grupoError } = await supabase
        .from('inscripciones_grupo')
        .select(`
          id,
          grupo_id,
          grupos_materia!inner (
            docente_id,
            materia_id,
            semestre_periodo
          )
        `)
        .eq('id', editingGrade.inscripcion_id)
        .single();

      if (grupoError) {
        throw new Error(`No se pudo verificar el grupo: ${grupoError.message}`);
      }

      const docenteId = (grupoCheck as any).grupos_materia.docente_id;
      if (docenteId !== profile.id) {
        throw new Error('No tienes permiso para calificar este grupo');
      }

      const materiaId = (grupoCheck as any).grupos_materia.materia_id;
      const semestrePeriodo = (grupoCheck as any).grupos_materia.semestre_periodo;

      // Calcular calificación final
      const calificacionFinal = calcularCalificacionFinal(u1, u2, u3);
      
      // Determinar estado
      let nuevoEstado = 'en_progreso';
      if (calificacionFinal !== null) {
        nuevoEstado = calificacionFinal >= 70 ? 'aprobado' : 'reprobado';
      }

      // Obtener estudiante_id
      const estudiante = estudiantes.find(e => e.inscripcion_id === editingGrade.inscripcion_id);
      if (!estudiante) throw new Error('Estudiante no encontrado');

      // Actualizar o crear registro en registros_estudiante_materia
      if (editingGrade.registro_materia_id) {
        // Actualizar registro existente
        const { error: updateError } = await supabase
          .from('registros_estudiante_materia')
          .update({
            calificacion_unidad1: u1,
            calificacion_unidad2: u2,
            calificacion_unidad3: u3,
            calificacion_final: calificacionFinal,
            porcentaje_asistencia: asistencia,
            estado: nuevoEstado,
            actualizado_en: new Date().toISOString()
          })
          .eq('id', editingGrade.registro_materia_id);

        if (updateError) throw updateError;
      } else {
        // Crear nuevo registro
        const { error: insertError } = await supabase
          .from('registros_estudiante_materia')
          .insert({
            estudiante_id: estudiante.id,
            materia_id: materiaId,
            semestre: semestrePeriodo,
            calificacion_unidad1: u1,
            calificacion_unidad2: u2,
            calificacion_unidad3: u3,
            calificacion_final: calificacionFinal,
            porcentaje_asistencia: asistencia,
            estado: nuevoEstado
          });

        if (insertError) throw insertError;
      }

      // Actualizar calificación final en inscripciones_grupo
      const { error: updateInscripcionError } = await supabase
        .from('inscripciones_grupo')
        .update({
          calificacion_final: calificacionFinal,
          estado: calificacionFinal !== null ? 'completado' : 'activo'
        })
        .eq('id', editingGrade.inscripcion_id);

      if (updateInscripcionError) throw updateInscripcionError;

      const successMsg = 'Calificaciones guardadas correctamente';
      alert(successMsg);
      announceMessage(successMsg, 'assertive');
      if (settings.readAloud) {
        speakText(successMsg);
      }
      setEditingGrade(null);
      
      if (selectedGrupo) {
        await loadEstudiantes(selectedGrupo.id);
      }

    } catch (error: any) {
      console.error('Error completo:', error);
      const errorMsg = error.message;
      alert(errorMsg);
      announceMessage(`Error: ${errorMsg}`, 'assertive');
      if (settings.readAloud) {
        speakText(`Error: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManageRisks = async (estudiante: EstudianteGrupo) => {
    setSelectedEstudiante(estudiante);
    announceMessage(`Abriendo gestión de factores de riesgo para ${estudiante.nombre} ${estudiante.apellido_paterno}`, 'polite');
    if (settings.readAloud) {
      speakText(`Factores de riesgo de ${estudiante.nombre} ${estudiante.apellido_paterno}`);
    }
    
    try {
      if (estudiante.registro_materia_id) {
        const { data: factores } = await supabase
          .from('factores_riesgo_estudiante')
          .select(`
            id,
            factor_riesgo_id,
            severidad,
            observaciones,
            factores_riesgo!inner (categoria_id)
          `)
          .eq('registro_estudiante_materia_id', estudiante.registro_materia_id);

        if (factores) {
          const factoresFormateados = factores.map((f: any) => ({
            id: f.id,
            categoria_id: f.factores_riesgo.categoria_id,
            inscripcion_id: estudiante.inscripcion_id,
            severidad: f.severidad as 'baja' | 'media' | 'alta',
            observaciones: f.observaciones || '',
          }));
          setFactoresRiesgo(factoresFormateados);
          announceMessage(`${factoresFormateados.length} factores de riesgo identificados`, 'polite');
        }
      }
    } catch (error) {
      console.error('Error cargando factores:', error);
      announceMessage('Error al cargar factores de riesgo', 'assertive');
    }
    
    setShowRiskModal(true);
  };

  const handleAddRiskFactor = async (categoriaId: string) => {
    if (!selectedEstudiante || !selectedGrupo) return;

    announceMessage('Agregando factor de riesgo', 'polite');
    
    try {
      let registroId: string;
      
      if (selectedEstudiante.registro_materia_id) {
        registroId = selectedEstudiante.registro_materia_id;
      } else {
        const { data: grupoData } = await supabase
          .from('grupos_materia')
          .select('materia_id, semestre_periodo')
          .eq('id', selectedGrupo.id)
          .single();

        const { data: newRegistro, error: regError } = await supabase
          .from('registros_estudiante_materia')
          .insert({
            estudiante_id: selectedEstudiante.id,
            materia_id: (grupoData as any).materia_id,
            semestre: (grupoData as any).semestre_periodo,
            estado: 'en_progreso',
          })
          .select()
          .single();

        if (regError) throw regError;
        registroId = newRegistro.id;
      }

      const { data: existingFactor } = await supabase
        .from('factores_riesgo')
        .select('id')
        .eq('categoria_id', categoriaId)
        .maybeSingle();

      let factorId: string;
      if (existingFactor) {
        factorId = existingFactor.id;
      } else {
        const categoria = categorias.find((c: CategoriaRiesgo) => c.id === categoriaId);
        const { data: newFactor, error: factorError } = await supabase
          .from('factores_riesgo')
          .insert({
            categoria_id: categoriaId,
            nombre: categoria?.nombre || 'Factor',
            descripcion: categoria?.descripcion,
          })
          .select()
          .single();

        if (factorError) throw factorError;
        factorId = newFactor.id;
      }

      const { error } = await supabase
        .from('factores_riesgo_estudiante')
        .insert({
          registro_estudiante_materia_id: registroId,
          factor_riesgo_id: factorId,
          severidad: 'media',
          observaciones: '',
        });

      if (error) throw error;

      const successMsg = 'Factor de riesgo agregado';
      alert(successMsg);
      announceMessage(successMsg, 'assertive');
      if (settings.readAloud) {
        speakText(successMsg);
      }
      handleManageRisks(selectedEstudiante);
    } catch (error: any) {
      console.error('Error:', error);
      const errorMsg = `Error: ${error.message}`;
      alert(errorMsg);
      announceMessage(errorMsg, 'assertive');
      if (settings.readAloud) {
        speakText(errorMsg);
      }
    }
  };

  if (loading && grupos.length === 0) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite">
        <div className="text-gray-500">Cargando grupos...</div>
      </div>
    );
  }

  if (grupos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6" role="region" aria-label="Sin grupos asignados">
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No tienes grupos asignados
          </h3>
          <p className="text-gray-600">
            Contacta al administrador para que te asigne grupos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6" role="region" aria-label="Lista de grupos">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen 
            className="w-8 h-8 text-blue-600" 
            aria-hidden="true"
            onMouseEnter={() => settings.readAloud && speakText('Mis Grupos')}
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Mis Grupos</h2>
            <p className="text-sm text-gray-600">
              {grupos.length} grupo{grupos.length !== 1 ? 's' : ''} asignado{grupos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
          {grupos.map((grupo) => (
            <div
              key={grupo.id}
              role="listitem"
              onClick={() => handleSelectGrupo(grupo)}
              onMouseEnter={() => settings.readAloud && speakText(`Grupo ${grupo.nombre_grupo}, ${grupo.materias.nombre}, ${grupo.inscritos} estudiantes`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectGrupo(grupo);
                }
              }}
              tabIndex={0}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                selectedGrupo?.id === grupo.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
              aria-label={`${grupo.materias.nombre}, grupo ${grupo.nombre_grupo}, ${grupo.inscritos} estudiantes inscritos${selectedGrupo?.id === grupo.id ? ', seleccionado' : ''}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{grupo.materias.nombre}</h3>
                  <p className="text-sm text-gray-600">{grupo.nombre_grupo}</p>
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <Users className="w-4 h-4" aria-hidden="true" />
                  <span className="text-sm font-medium">{grupo.inscritos}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{grupo.periodo_academico}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedGrupo && (
        <div className="bg-white rounded-lg shadow-lg p-6" role="region" aria-label="Estudiantes del grupo">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Estudiantes - {selectedGrupo.nombre_grupo}
              </h3>
              <p className="text-sm text-gray-600">
                {estudiantes.length} estudiante{estudiantes.length !== 1 ? 's' : ''} inscrito{estudiantes.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedGrupo(null);
                setEstudiantes([]);
                announceMessage('Cerrando lista de estudiantes', 'polite');
              }}
              onMouseEnter={() => settings.readAloud && speakText('Cerrar lista de estudiantes')}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded p-1"
              aria-label="Cerrar lista de estudiantes"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {estudiantes.length === 0 ? (
            <div className="text-center py-12 text-gray-500" role="status">
              No hay estudiantes inscritos en este grupo
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" role="table" aria-label="Tabla de calificaciones de estudiantes">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      No. Control
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Estudiante
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Unidad 1
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Unidad 2
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Unidad 3
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Asistencia %
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Final
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Estado
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantes.map((estudiante) => {
                    const isEditing = editingGrade?.inscripcion_id === estudiante.inscripcion_id;
                    const nombreCompleto = `${estudiante.apellido_paterno} ${estudiante.apellido_materno}, ${estudiante.nombre}`;
                    
                    return (
                      <tr 
                        key={estudiante.id} 
                        className="border-b border-gray-100 hover:bg-gray-50"
                        role="row"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {estudiante.numero_control}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {nombreCompleto}
                        </td>
                        
                        {/* Unidad 1 */}
                        <td className="px-4 py-3 text-center text-sm">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={editingGrade.calificacion_unidad1}
                              onChange={(e) => setEditingGrade({
                                ...editingGrade,
                                calificacion_unidad1: e.target.value,
                              })}
                              onFocus={() => {
                                announceMessage('Campo de calificación Unidad 1', 'polite');
                                if (settings.readAloud) {
                                  speakText('Calificación Unidad 1');
                                }
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
                              placeholder="0-100"
                              aria-label="Calificación Unidad 1"
                            />
                          ) : estudiante.calificacion_unidad1 !== null ? (
                            <span className="font-semibold text-gray-700">
                              {estudiante.calificacion_unidad1.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </td>

                        {/* Unidad 2 */}
                        <td className="px-4 py-3 text-center text-sm">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={editingGrade.calificacion_unidad2}
                              onChange={(e) => setEditingGrade({
                                ...editingGrade,
                                calificacion_unidad2: e.target.value,
                              })}
                              onFocus={() => {
                                announceMessage('Campo de calificación Unidad 2', 'polite');
                                if (settings.readAloud) {
                                  speakText('Calificación Unidad 2');
                                }
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
                              placeholder="0-100"
                              aria-label="Calificación Unidad 2"
                            />
                          ) : estudiante.calificacion_unidad2 !== null ? (
                            <span className="font-semibold text-gray-700">
                              {estudiante.calificacion_unidad2.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </td>

                        {/* Unidad 3 */}
                        <td className="px-4 py-3 text-center text-sm">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={editingGrade.calificacion_unidad3}
                              onChange={(e) => setEditingGrade({
                                ...editingGrade,
                                calificacion_unidad3: e.target.value,
                              })}
                              onFocus={() => {
                                announceMessage('Campo de calificación Unidad 3', 'polite');
                                if (settings.readAloud) {
                                  speakText('Calificación Unidad 3');
                                }
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
                              placeholder="0-100"
                              aria-label="Calificación Unidad 3"
                            />
                          ) : estudiante.calificacion_unidad3 !== null ? (
                            <span className="font-semibold text-gray-700">
                              {estudiante.calificacion_unidad3.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </td>

                        {/* Asistencia */}
                        <td className="px-4 py-3 text-center text-sm">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              value={editingGrade.porcentaje_asistencia}
                              onChange={(e) => setEditingGrade({
                                ...editingGrade,
                                porcentaje_asistencia: e.target.value,
                              })}
                              onFocus={() => {
                                announceMessage('Campo de porcentaje de asistencia', 'polite');
                                if (settings.readAloud) {
                                  speakText('Porcentaje de asistencia');
                                }
                              }}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
                              placeholder="0-100"
                              aria-label="Porcentaje de asistencia"
                            />
                          ) : estudiante.porcentaje_asistencia !== null ? (
                            <span className="text-gray-700">
                              {estudiante.porcentaje_asistencia.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </td>

                        {/* Calificación Final */}
                        <td className="px-4 py-3 text-center text-sm">
                          {estudiante.calificacion_final !== null ? (
                            <span 
                              className={`font-bold ${
                                estudiante.calificacion_final >= 70 ? 'text-green-700' : 'text-red-700'
                              }`}
                              aria-label={`Calificación final: ${estudiante.calificacion_final.toFixed(1)}`}
                            >
                              {estudiante.calificacion_final.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3 text-center">
                          {estudiante.calificacion_final !== null ? (
                            <span 
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                estudiante.calificacion_final >= 70
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                              role="status"
                              aria-label={estudiante.calificacion_final >= 70 ? 'Estado: Aprobado' : 'Estado: Reprobado'}
                            >
                              {estudiante.calificacion_final >= 70 ? 'Aprobado' : 'Reprobado'}
                            </span>
                          ) : (
                            <span 
                              className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              role="status"
                              aria-label="Estado: En progreso"
                            >
                              En progreso
                            </span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2" role="group" aria-label="Acciones del estudiante">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={handleSaveGrade}
                                  disabled={loading}
                                  onMouseEnter={() => settings.readAloud && speakText('Guardar calificaciones')}
                                  className="text-green-600 hover:text-green-800 p-1 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                                  aria-label="Guardar calificaciones"
                                >
                                  <Save className="w-4 h-4" aria-hidden="true" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingGrade(null);
                                    announceMessage('Edición cancelada', 'polite');
                                  }}
                                  onMouseEnter={() => settings.readAloud && speakText('Cancelar edición')}
                                  className="text-gray-600 hover:text-gray-800 p-1 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
                                  aria-label="Cancelar edición"
                                >
                                  <X className="w-4 h-4" aria-hidden="true" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditGrade(estudiante)}
                                  onMouseEnter={() => settings.readAloud && speakText(`Editar calificaciones de ${nombreCompleto}`)}
                                  className="text-blue-600 hover:text-blue-800 p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                  aria-label={`Editar calificaciones de ${nombreCompleto}`}
                                >
                                  <Edit2 className="w-4 h-4" aria-hidden="true" />
                                </button>
                                <button
                                  onClick={() => handleManageRisks(estudiante)}
                                  onMouseEnter={() => settings.readAloud && speakText(`Gestionar factores de riesgo de ${nombreCompleto}`)}
                                  className="text-orange-600 hover:text-orange-800 p-1 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
                                  aria-label={`Gestionar factores de riesgo de ${nombreCompleto}`}
                                >
                                  <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg" role="complementary" aria-label="Instrucciones">
            <h4 className="font-semibold text-blue-900 mb-2">Instrucciones</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Haz clic en el ícono de editar para calificar a un estudiante</li>
              <li>• Ingresa las calificaciones de cada unidad (0-100) y el porcentaje de asistencia</li>
              <li>• La calificación final se calcula automáticamente como el promedio de las unidades calificadas</li>
              <li>• Calificación final ≥ 70 es aprobatoria</li>
              <li>• Puedes dejar campos vacíos si aún no tienes esas calificaciones</li>
              <li>• Usa el ícono de alerta para gestionar factores de riesgo</li>
            </ul>
          </div>
        </div>
      )}

      {showRiskModal && selectedEstudiante && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="risk-modal-title"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 id="risk-modal-title" className="text-xl font-bold text-gray-800">Factores de Riesgo</h3>
                <p className="text-sm text-gray-600">
                  {selectedEstudiante.apellido_paterno} {selectedEstudiante.apellido_materno}, {selectedEstudiante.nombre}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowRiskModal(false);
                  announceMessage('Modal de factores de riesgo cerrado', 'polite');
                }}
                onMouseEnter={() => settings.readAloud && speakText('Cerrar modal')}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded p-1"
                aria-label="Cerrar modal de factores de riesgo"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4">
              {factoresRiesgo.length > 0 && (
                <div 
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                  role="region"
                  aria-label="Factores identificados"
                >
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    Factores Identificados ({factoresRiesgo.length})
                  </h4>
                  <div className="space-y-2" role="list">
                    {factoresRiesgo.map((factor) => {
                      const categoria = categorias.find(c => c.id === factor.categoria_id);
                      return (
                        <div 
                          key={factor.id} 
                          className="bg-white px-3 py-2 rounded flex justify-between items-center"
                          role="listitem"
                        >
                          <span className="text-sm text-gray-700">{categoria?.nombre}</span>
                          <span 
                            className={`px-2 py-1 rounded text-xs ${
                              factor.severidad === 'alta' ? 'bg-red-100 text-red-800' :
                              factor.severidad === 'media' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}
                            role="status"
                            aria-label={`Severidad: ${factor.severidad}`}
                          >
                            {factor.severidad}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Agregar Factor de Riesgo</h4>
                <div className="space-y-2" role="list">
                  {categorias.map((categoria) => {
                    const yaAgregado = factoresRiesgo.some(f => f.categoria_id === categoria.id);
                    return (
                      <button
                        key={categoria.id}
                        onClick={() => handleAddRiskFactor(categoria.id)}
                        disabled={yaAgregado}
                        onMouseEnter={() => !yaAgregado && settings.readAloud && speakText(`Agregar ${categoria.nombre}`)}
                        className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={`${yaAgregado ? 'Ya agregado:' : 'Agregar:'} ${categoria.nombre}. ${categoria.descripcion || ''}`}
                        role="listitem"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">{categoria.nombre}</p>
                            {categoria.descripcion && (
                              <p className="text-xs text-gray-600">{categoria.descripcion}</p>
                            )}
                          </div>
                          {!yaAgregado && (
                            <Plus className="w-5 h-5 text-blue-600" aria-hidden="true" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowRiskModal(false);
                  announceMessage('Modal cerrado', 'polite');
                }}
                onMouseEnter={() => settings.readAloud && speakText('Cerrar')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
                aria-label="Cerrar modal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen Reader Only Instructions */}
      <div className="sr-only" role="complementary" aria-label="Instrucciones de navegación">
        <h2>Instrucciones de navegación:</h2>
        <ul>
          <li>Use Tab para navegar entre elementos</li>
          <li>Presione Enter o Espacio para seleccionar grupos</li>
          <li>Use las teclas de flecha para navegar en tablas</li>
          <li>Los cambios y errores se anunciarán automáticamente</li>
        </ul>
      </div>
    </div>
  );
}