import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Users, Edit2, Save, X } from 'lucide-react';

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
  calificacion_final: number | null;
}

interface CalificacionForm {
  inscripcion_id: string;
  calificacion_final: number | null;
}

export default function TeacherGroupsView() {
  const { profile } = useAuth();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);
  const [estudiantes, setEstudiantes] = useState<EstudianteGrupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGrade, setEditingGrade] = useState<CalificacionForm | null>(null);

  useEffect(() => {
    if (profile?.id) {
      loadGrupos();
    }
  }, [profile]);

  const loadGrupos = async () => {
    if (!profile?.id) return;

    setLoading(true);
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
              .eq('estado', 'activo');

            return { ...grupo, inscritos: count || 0 };
          })
        );
        setGrupos(gruposConConteo);
      }
    } catch (error) {
      console.error('Error cargando grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEstudiantes = async (grupoId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inscripciones_grupo')
        .select(`
          id,
          calificacion_final,
          estudiantes!inner (
            id,
            numero_control,
            nombre,
            apellido_paterno,
            apellido_materno
          )
        `)
        .eq('grupo_id', grupoId)
        .eq('estado', 'activo');

      if (error) throw error;

      const estudiantesFormateados = data?.map((item: any) => ({
        id: item.estudiantes.id,
        inscripcion_id: item.id,
        numero_control: item.estudiantes.numero_control,
        nombre: item.estudiantes.nombre,
        apellido_paterno: item.estudiantes.apellido_paterno,
        apellido_materno: item.estudiantes.apellido_materno,
        calificacion_final: item.calificacion_final,
      })) || [];

      setEstudiantes(estudiantesFormateados);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGrupo = (grupo: Grupo) => {
    setSelectedGrupo(grupo);
    loadEstudiantes(grupo.id);
  };

  const handleEditGrade = (estudiante: EstudianteGrupo) => {
    setEditingGrade({
      inscripcion_id: estudiante.inscripcion_id,
      calificacion_final: estudiante.calificacion_final,
    });
  };

  const handleSaveGrade = async () => {
    if (!editingGrade) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('inscripciones_grupo')
        .update({
          calificacion_final: editingGrade.calificacion_final,
          estado: editingGrade.calificacion_final && editingGrade.calificacion_final >= 70 
            ? 'completado' 
            : editingGrade.calificacion_final !== null 
              ? 'completado' 
              : 'activo'
        })
        .eq('id', editingGrade.inscripcion_id);

      if (error) throw error;

      alert('Calificación guardada correctamente');
      setEditingGrade(null);
      if (selectedGrupo) {
        loadEstudiantes(selectedGrupo.id);
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && grupos.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Cargando grupos...</div>
      </div>
    );
  }

  if (grupos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
      {/* Grupos List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Mis Grupos</h2>
            <p className="text-sm text-gray-600">
              {grupos.length} grupo{grupos.length !== 1 ? 's' : ''} asignado{grupos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grupos.map((grupo) => (
            <div
              key={grupo.id}
              onClick={() => handleSelectGrupo(grupo)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedGrupo?.id === grupo.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{grupo.materias.nombre}</h3>
                  <p className="text-sm text-gray-600">{grupo.nombre_grupo}</p>
                </div>
                <div className="flex items-center gap-1 text-blue-600">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">{grupo.inscritos}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{grupo.periodo_academico}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Estudiantes List */}
      {selectedGrupo && (
        <div className="bg-white rounded-lg shadow-lg p-6">
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
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {estudiantes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay estudiantes inscritos en este grupo
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Número de Control
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Estudiante
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Calificación Final
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantes.map((estudiante) => (
                    <tr key={estudiante.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {estudiante.numero_control}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {estudiante.apellido_paterno} {estudiante.apellido_materno}, {estudiante.nombre}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {editingGrade?.inscripcion_id === estudiante.inscripcion_id ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={editingGrade.calificacion_final || ''}
                            onChange={(e) => setEditingGrade({
                              ...editingGrade,
                              calificacion_final: e.target.value ? parseFloat(e.target.value) : null,
                            })}
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        ) : estudiante.calificacion_final !== null ? (
                          <span className={`font-semibold ${
                            estudiante.calificacion_final >= 70 ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {estudiante.calificacion_final.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Sin calificar</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {estudiante.calificacion_final !== null ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            estudiante.calificacion_final >= 70
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {estudiante.calificacion_final >= 70 ? 'Aprobado' : 'Reprobado'}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            En progreso
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingGrade?.inscripcion_id === estudiante.inscripcion_id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleSaveGrade}
                              disabled={loading}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Guardar"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingGrade(null)}
                              className="text-gray-600 hover:text-gray-800 p-1"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditGrade(estudiante)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Editar calificación"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Instrucciones</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Haz clic en el ícono de editar para calificar a un estudiante</li>
              <li>• Ingresa la calificación final (0-100)</li>
              <li>• Calificación ≥ 70 es aprobatoria</li>
              <li>• Los cambios se guardan automáticamente</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}