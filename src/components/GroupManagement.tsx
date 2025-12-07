import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Users, Plus, Edit, Trash2, BookOpen, UserPlus, Calendar, X, RefreshCw } from 'lucide-react';

interface Materia {
  id: string;
  nombre: string;
  semestre: number;
}

interface Docente {
  id: string;
  full_name: string;
  email: string;
}

interface GrupoMateria {
  id: string;
  materia_id: string;
  docente_id: string | null;
  nombre_grupo: string;
  semestre_periodo: number;
  periodo_academico: string;
  cupo_maximo: number;
  horario: string | null;
  esta_activo: boolean;
  materias: { nombre: string };
  user_profiles: { full_name: string } | null;
  inscritos: number;
}

interface Estudiante {
  id: string;
  numero_control: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  ya_inscrito?: boolean;
}

export default function GroupManagement() {
  const { settings, announceMessage, speakText } = useAccessibility();
  const [grupos, setGrupos] = useState<GrupoMateria[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GrupoMateria | null>(null);
  const [editingGroup, setEditingGroup] = useState<GrupoMateria | null>(null);

  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    materia_id: '',
    docente_id: '',
    nombre_grupo: '',
    semestre_periodo: 1,
    periodo_academico: `${currentYear}`,
    cupo_maximo: 40,
    horario: '',
  });

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    announceMessage('Cargando datos de grupos', 'polite');
    
    try {
      const { data: materiasData } = await supabase
        .from('materias')
        .select('id, nombre, semestre')
        .order('nombre');

      const { data: docentesData } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .eq('role', 'teacher')
        .eq('is_active', true)
        .order('full_name');

      const { data: gruposData } = await supabase
        .from('grupos_materia')
        .select(`
          *,
          materias!materia_id (nombre),
          user_profiles!docente_id (full_name)
        `)
        .order('creado_en', { ascending: false });

      if (materiasData) setMaterias(materiasData);
      if (docentesData) setDocentes(docentesData);

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
        
        announceMessage(`${gruposConConteo.length} grupos cargados`, 'assertive');
        if (settings.readAloud) {
          speakText(`Se cargaron ${gruposConConteo.length} grupos`);
        }
      }

      const { data: estudiantesData } = await supabase
        .from('estudiantes')
        .select('id, numero_control, nombre, apellido_paterno, apellido_materno')
        .order('apellido_paterno');

      if (estudiantesData) setEstudiantes(estudiantesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      const errorMsg = 'Error al cargar los datos';
      announceMessage(errorMsg, 'assertive');
      if (settings.readAloud) {
        speakText(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableStudents = async (grupoId: string) => {
    try {
      const { data: inscritosData } = await supabase
        .from('inscripciones_grupo')
        .select('estudiante_id')
        .eq('grupo_id', grupoId)
        .in('estado', ['activo', 'completado']);

      const estudiantesInscritos = new Set(inscritosData?.map(i => i.estudiante_id) || []);

      const estudiantesDisponibles = estudiantes.map(est => ({
        ...est,
        ya_inscrito: estudiantesInscritos.has(est.id)
      }));

      return estudiantesDisponibles;
    } catch (error) {
      console.error('Error cargando estudiantes disponibles:', error);
      return estudiantes;
    }
  };

  const handleSaveGroup = async () => {
    if (!formData.materia_id || !formData.nombre_grupo) {
      const errorMsg = 'Por favor completa los campos requeridos';
      announceMessage(errorMsg, 'assertive');
      if (settings.readAloud) {
        speakText(errorMsg);
      }
      alert(errorMsg);
      return;
    }

    setLoading(true);
    announceMessage('Guardando grupo', 'polite');
    
    try {
      if (editingGroup) {
        const { error } = await supabase
          .from('grupos_materia')
          .update({
            materia_id: formData.materia_id,
            docente_id: formData.docente_id || null,
            nombre_grupo: formData.nombre_grupo,
            semestre_periodo: formData.semestre_periodo,
            periodo_academico: formData.periodo_academico,
            cupo_maximo: formData.cupo_maximo,
            horario: formData.horario || null,
            actualizado_en: new Date().toISOString(),
          })
          .eq('id', editingGroup.id);

        if (error) throw error;
        
        const successMsg = 'Grupo actualizado correctamente';
        announceMessage(successMsg, 'assertive');
        if (settings.readAloud) {
          speakText(successMsg);
        }
        alert(successMsg);
      } else {
        const { error } = await supabase
          .from('grupos_materia')
          .insert({
            materia_id: formData.materia_id,
            docente_id: formData.docente_id || null,
            nombre_grupo: formData.nombre_grupo,
            semestre_periodo: formData.semestre_periodo,
            periodo_academico: formData.periodo_academico,
            cupo_maximo: formData.cupo_maximo,
            horario: formData.horario || null,
          });

        if (error) throw error;
        
        const successMsg = 'Grupo creado correctamente';
        announceMessage(successMsg, 'assertive');
        if (settings.readAloud) {
          speakText(successMsg);
        }
        alert(successMsg);
      }

      setShowForm(false);
      setEditingGroup(null);
      resetForm();
      await loadData();
    } catch (error: any) {
      console.error('Error:', error);
      const errorMsg = `Error: ${error.message}`;
      announceMessage(errorMsg, 'assertive');
      if (settings.readAloud) {
        speakText('Error al guardar el grupo');
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (grupo: GrupoMateria) => {
    setEditingGroup(grupo);
    setFormData({
      materia_id: grupo.materia_id,
      docente_id: grupo.docente_id || '',
      nombre_grupo: grupo.nombre_grupo,
      semestre_periodo: grupo.semestre_periodo,
      periodo_academico: grupo.periodo_academico,
      cupo_maximo: grupo.cupo_maximo,
      horario: grupo.horario || '',
    });
    setShowForm(true);
    
    announceMessage(`Editando grupo ${grupo.nombre_grupo}`, 'polite');
    if (settings.readAloud) {
      speakText(`Formulario de edición abierto para grupo ${grupo.nombre_grupo}`);
    }
  };

  const handleDelete = async (grupoId: string) => {
    const grupo = grupos.find(g => g.id === grupoId);
    if (!confirm('¿Eliminar este grupo? Se eliminarán todas las inscripciones y calificaciones asociadas.')) {
      return;
    }

    setLoading(true);
    announceMessage('Eliminando grupo', 'polite');
    
    try {
      const { error } = await supabase
        .from('grupos_materia')
        .delete()
        .eq('id', grupoId);

      if (error) throw error;
      
      const successMsg = 'Grupo eliminado correctamente';
      announceMessage(successMsg, 'assertive');
      if (settings.readAloud) {
        speakText(successMsg);
      }
      alert(successMsg);
      await loadData();
    } catch (error: any) {
      console.error('Error:', error);
      const errorMsg = `Error al eliminar: ${error.message}`;
      announceMessage(errorMsg, 'assertive');
      if (settings.readAloud) {
        speakText('Error al eliminar el grupo');
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleGroupStatus = async (grupo: GrupoMateria) => {
    setLoading(true);
    const newStatus = !grupo.esta_activo;
    announceMessage(`Cambiando estado del grupo a ${newStatus ? 'activo' : 'inactivo'}`, 'polite');
    
    try {
      const { error } = await supabase
        .from('grupos_materia')
        .update({ esta_activo: newStatus })
        .eq('id', grupo.id);

      if (error) throw error;
      
      const successMsg = `Grupo ${newStatus ? 'activado' : 'desactivado'}`;
      announceMessage(successMsg, 'assertive');
      if (settings.readAloud) {
        speakText(successMsg);
      }
      await loadData();
    } catch (error: any) {
      console.error('Error:', error);
      const errorMsg = `Error: ${error.message}`;
      announceMessage(errorMsg, 'assertive');
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEnrollForm = async (grupo: GrupoMateria) => {
    setSelectedGroup(grupo);
    const estudiantesDisponibles = await loadAvailableStudents(grupo.id);
    setEstudiantes(estudiantesDisponibles);
    setShowEnrollForm(true);
    
    announceMessage(`Abriendo formulario de inscripción para grupo ${grupo.nombre_grupo}`, 'polite');
    if (settings.readAloud) {
      speakText(`Formulario de inscripción abierto. ${grupo.cupo_maximo - grupo.inscritos} lugares disponibles`);
    }
  };

  const handleEnrollStudents = async () => {
    if (!selectedGroup || selectedStudents.length === 0) return;

    const cupoDisponible = selectedGroup.cupo_maximo - selectedGroup.inscritos;
    if (selectedStudents.length > cupoDisponible) {
      const errorMsg = `Solo hay ${cupoDisponible} lugares disponibles. Has seleccionado ${selectedStudents.length} estudiantes.`;
      announceMessage(errorMsg, 'assertive');
      if (settings.readAloud) {
        speakText(errorMsg);
      }
      alert(errorMsg);
      return;
    }

    setLoading(true);
    announceMessage('Inscribiendo estudiantes', 'polite');
    
    try {
      const { data: existentes } = await supabase
        .from('inscripciones_grupo')
        .select('estudiante_id')
        .eq('grupo_id', selectedGroup.id)
        .in('estudiante_id', selectedStudents);

      const yaInscritos = new Set(existentes?.map(e => e.estudiante_id) || []);
      const nuevosEstudiantes = selectedStudents.filter(id => !yaInscritos.has(id));

      if (nuevosEstudiantes.length === 0) {
        const errorMsg = 'Todos los estudiantes seleccionados ya están inscritos en este grupo';
        announceMessage(errorMsg, 'assertive');
        if (settings.readAloud) {
          speakText(errorMsg);
        }
        alert(errorMsg);
        return;
      }

      const inscripciones = nuevosEstudiantes.map(estudianteId => ({
        grupo_id: selectedGroup.id,
        estudiante_id: estudianteId,
        estado: 'activo',
      }));

      const { error } = await supabase
        .from('inscripciones_grupo')
        .insert(inscripciones);

      if (error) throw error;

      const successMsg = `${nuevosEstudiantes.length} estudiante(s) inscrito(s) correctamente`;
      announceMessage(successMsg, 'assertive');
      if (settings.readAloud) {
        speakText(successMsg);
      }
      alert(successMsg);
      
      if (yaInscritos.size > 0) {
        alert(`ℹ️ ${yaInscritos.size} estudiante(s) ya estaban inscritos`);
      }

      setShowEnrollForm(false);
      setSelectedGroup(null);
      setSelectedStudents([]);
      
      await loadData();
    } catch (error: any) {
      console.error('Error:', error);
      const errorMsg = `Error al inscribir: ${error.message}`;
      announceMessage(errorMsg, 'assertive');
      if (settings.readAloud) {
        speakText('Error al inscribir estudiantes');
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      materia_id: '',
      docente_id: '',
      nombre_grupo: '',
      semestre_periodo: 1,
      periodo_academico: `${currentYear}`,
      cupo_maximo: 40,
      horario: '',
    });
  };

  return (
    <div className="space-y-6" role="main" aria-label="Gestión de grupos">
      {/* Screen Reader Only Instructions */}
      <div className="sr-only" role="complementary" aria-label="Instrucciones de navegación">
        <h2>Instrucciones de navegación de gestión de grupos:</h2>
        <ul>
          <li>Use Tab para navegar entre controles y filas de la tabla</li>
          <li>Presione Enter o Espacio para activar botones</li>
          <li>Los formularios modales se pueden cerrar con Escape</li>
          <li>Presione Alt+A para abrir el panel de accesibilidad</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div 
            className="flex items-center gap-3"
            onMouseEnter={() => settings.readAloud && speakText(`Gestión de Grupos. ${grupos.length} grupos registrados`)}
          >
            <BookOpen className="w-8 h-8 text-blue-600" aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Gestión de Grupos</h2>
              <p className="text-sm text-gray-600">
                {grupos.length} grupo{grupos.length !== 1 ? 's' : ''} registrado{grupos.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              onMouseEnter={() => settings.readAloud && speakText('Actualizar lista de grupos')}
              onFocus={() => announceMessage('Botón Actualizar enfocado')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-gray-300"
              title="Actualizar"
              aria-label="Actualizar lista de grupos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              Actualizar
            </button>
            <button
              onClick={() => {
                setEditingGroup(null);
                resetForm();
                setShowForm(true);
                announceMessage('Abriendo formulario para crear nuevo grupo', 'polite');
                if (settings.readAloud) {
                  speakText('Formulario de nuevo grupo abierto');
                }
              }}
              onMouseEnter={() => settings.readAloud && speakText('Crear nuevo grupo')}
              onFocus={() => announceMessage('Botón Nuevo Grupo enfocado')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
              aria-label="Crear nuevo grupo"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Nuevo Grupo
            </button>
          </div>
        </div>

        {loading && grupos.length === 0 ? (
          <div className="text-center py-12 text-gray-500" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" aria-hidden="true"></div>
            Cargando grupos...
          </div>
        ) : grupos.length === 0 ? (
          <div className="text-center py-12" role="status">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" aria-hidden="true" />
            <p className="text-gray-500 mb-2">No hay grupos registrados</p>
            <p className="text-sm text-gray-400">Crea el primer grupo para comenzar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" role="table" aria-label="Tabla de grupos">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700" scope="col">Materia</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700" scope="col">Grupo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700" scope="col">Docente</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700" scope="col">Periodo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700" scope="col">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700" scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {grupos.map((grupo) => (
                  <tr 
                    key={grupo.id} 
                    className="border-b border-gray-100 hover:bg-gray-50"
                    onMouseEnter={() => settings.readAloud && speakText(`Grupo ${grupo.nombre_grupo}, materia ${grupo.materias.nombre}, docente ${grupo.user_profiles?.full_name || 'sin asignar'}, periodo ${grupo.periodo_academico}, estado ${grupo.esta_activo ? 'activo' : 'inactivo'}`)}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{grupo.materias.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{grupo.nombre_grupo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {grupo.user_profiles?.full_name || <span className="text-gray-400 italic">Sin asignar</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" aria-hidden="true" />
                        {grupo.periodo_academico}
                      </div>
                    </td>
                   
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleGroupStatus(grupo)}
                        disabled={loading}
                        onMouseEnter={() => settings.readAloud && speakText(`Estado: ${grupo.esta_activo ? 'Activo' : 'Inactivo'}. Click para cambiar`)}
                        onFocus={() => announceMessage(`Botón de estado enfocado: ${grupo.esta_activo ? 'Activo' : 'Inactivo'}`)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors focus:outline-none focus:ring-4 ${
                          grupo.esta_activo 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-300' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300'
                        }`}
                        aria-label={`Estado del grupo: ${grupo.esta_activo ? 'Activo' : 'Inactivo'}. Presionar para cambiar`}
                        aria-pressed={grupo.esta_activo}
                      >
                        {grupo.esta_activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" role="group" aria-label="Acciones del grupo">
                        <button
                          onClick={() => handleOpenEnrollForm(grupo)}
                          disabled={grupo.inscritos >= grupo.cupo_maximo}
                          onMouseEnter={() => settings.readAloud && speakText(grupo.inscritos >= grupo.cupo_maximo ? 'Grupo lleno' : 'Inscribir estudiantes')}
                          onFocus={() => announceMessage('Botón Inscribir estudiantes enfocado')}
                          className="text-green-600 hover:text-green-800 p-1 disabled:text-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-green-300 rounded"
                          title={grupo.inscritos >= grupo.cupo_maximo ? 'Grupo lleno' : 'Inscribir estudiantes'}
                          aria-label={`Inscribir estudiantes en ${grupo.nombre_grupo}. ${grupo.inscritos >= grupo.cupo_maximo ? 'Grupo lleno' : `${grupo.cupo_maximo - grupo.inscritos} lugares disponibles`}`}
                        >
                          <UserPlus className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleEdit(grupo)}
                          onMouseEnter={() => settings.readAloud && speakText('Editar grupo')}
                          onFocus={() => announceMessage('Botón Editar enfocado')}
                          className="text-blue-600 hover:text-blue-800 p-1 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded"
                          title="Editar"
                          aria-label={`Editar grupo ${grupo.nombre_grupo}`}
                        >
                          <Edit className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDelete(grupo.id)}
                          onMouseEnter={() => settings.readAloud && speakText('Eliminar grupo')}
                          onFocus={() => announceMessage('Botón Eliminar enfocado')}
                          className="text-red-600 hover:text-red-800 p-1 focus:outline-none focus:ring-4 focus:ring-red-300 rounded"
                          title="Eliminar"
                          aria-label={`Eliminar grupo ${grupo.nombre_grupo}`}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-labelledby="form-title"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 id="form-title" className="text-xl font-bold text-gray-800">
                {editingGroup ? 'Editar Grupo' : 'Nuevo Grupo'}
              </h3>
              <button 
                onClick={() => { 
                  setShowForm(false); 
                  setEditingGroup(null);
                  announceMessage('Formulario cerrado', 'polite');
                }} 
                onMouseEnter={() => settings.readAloud && speakText('Cerrar formulario')}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 rounded"
                aria-label="Cerrar formulario"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="materia" className="block text-sm font-medium text-gray-700 mb-2">
                    Materia *
                  </label>
                  <select
                    id="materia"
                    value={formData.materia_id}
                    onChange={(e) => setFormData({ ...formData, materia_id: e.target.value })}
                    onFocus={() => announceMessage('Campo Materia enfocado')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    aria-required="true"
                  >
                    <option value="">Seleccionar materia</option>
                    {materias.map((m) => (
                      <option key={m.id} value={m.id}>{m.nombre} (Sem. {m.semestre})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="docente" className="block text-sm font-medium text-gray-700 mb-2">
                    Docente
                  </label>
                  <select
                    id="docente"
                    value={formData.docente_id}
                    onChange={(e) => setFormData({ ...formData, docente_id: e.target.value })}
                    onFocus={() => announceMessage('Campo Docente enfocado')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sin asignar</option>
                    {docentes.map((d) => (
                      <option key={d.id} value={d.id}>{d.full_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="nombre_grupo" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Grupo *
                  </label>
                  <input
                    id="nombre_grupo"
                    type="text"
                    required
                    value={formData.nombre_grupo}
                    onChange={(e) => setFormData({ ...formData, nombre_grupo: e.target.value })}
                    onFocus={() => announceMessage('Campo Nombre del Grupo enfocado')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Grupo A, 101"
                    aria-required="true"
                  />
                </div>

                <div>
                  <label htmlFor="periodo" className="block text-sm font-medium text-gray-700 mb-2">
                    Periodo Académico *
                  </label>
                  <input
                    id="periodo"
                    type="text"
                    required
                    value={formData.periodo_academico}
                    onChange={(e) => setFormData({ ...formData, periodo_academico: e.target.value })}
                    onFocus={() => announceMessage('Campo Periodo Académico enfocado')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Ene-Jun 2025"
                    aria-required="true"
                  />
                </div>

                <div>
                  <label htmlFor="semestre" className="block text-sm font-medium text-gray-700 mb-2">
                    Semestre *
                  </label>
                  <input
                    id="semestre"
                    type="number"
                    required
                    min="1"
                    max="12"
                    value={formData.semestre_periodo}
                    onChange={(e) => setFormData({ ...formData, semestre_periodo: parseInt(e.target.value) || 1 })}
                    onFocus={() => announceMessage('Campo Semestre enfocado')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-required="true"
                  />
                </div>

                <div>
                  <label htmlFor="cupo" className="block text-sm font-medium text-gray-700 mb-2">
                    Cupo Máximo *
                  </label>
                  <input
                    id="cupo"
                    type="number"
                    required
                    min="1"
                    value={formData.cupo_maximo}
                    onChange={(e) => setFormData({ ...formData, cupo_maximo: parseInt(e.target.value) || 40 })}
                    onFocus={() => announceMessage('Campo Cupo Máximo enfocado')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-required="true"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="horario" className="block text-sm font-medium text-gray-700 mb-2">
                    Horario
                  </label>
                  <input
                    id="horario"
                    type="text"
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    onFocus={() => announceMessage('Campo Horario enfocado')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Lun-Mie-Vie 7:00-9:00"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { 
                    setShowForm(false); 
                    setEditingGroup(null);
                    announceMessage('Formulario cancelado', 'polite');
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Cancelar')}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300"
                  aria-label="Cancelar y cerrar formulario"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveGroup}
                  disabled={loading}
                  onMouseEnter={() => settings.readAloud && speakText(editingGroup ? 'Actualizar grupo' : 'Crear grupo')}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  aria-label={loading ? 'Guardando...' : editingGroup ? 'Actualizar grupo' : 'Crear nuevo grupo'}
                >
                  {loading ? 'Guardando...' : editingGroup ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de inscripción */}
      {showEnrollForm && selectedGroup && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-labelledby="enroll-title"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 id="enroll-title" className="text-xl font-bold text-gray-800">
                Inscribir Estudiantes - {selectedGroup.nombre_grupo}
              </h3>
              <button 
                onClick={() => { 
                  setShowEnrollForm(false); 
                  setSelectedGroup(null); 
                  setSelectedStudents([]);
                  announceMessage('Formulario de inscripción cerrado', 'polite');
                }} 
                onMouseEnter={() => settings.readAloud && speakText('Cerrar formulario')}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 rounded"
                aria-label="Cerrar formulario de inscripción"
              >
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            <div 
              className="space-y-2 max-h-96 overflow-y-auto mb-4"
              role="group"
              aria-label="Lista de estudiantes disponibles"
            >
              {estudiantes.map((est) => (
                <label 
                  key={est.id} 
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    est.ya_inscrito 
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60' 
                      : selectedStudents.includes(est.id)
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                  onMouseEnter={() => settings.readAloud && !est.ya_inscrito && speakText(`${est.apellido_paterno} ${est.apellido_materno}, ${est.nombre}. Número de control: ${est.numero_control}`)}
                >
                  <input
                    type="checkbox"
                    disabled={est.ya_inscrito}
                    checked={selectedStudents.includes(est.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...selectedStudents, est.id]);
                        announceMessage(`Estudiante ${est.nombre} ${est.apellido_paterno} seleccionado`);
                      } else {
                        setSelectedStudents(selectedStudents.filter(id => id !== est.id));
                        announceMessage(`Estudiante ${est.nombre} ${est.apellido_paterno} deseleccionado`);
                      }
                    }}
                    className="w-4 h-4 text-blue-600 disabled:cursor-not-allowed focus:ring-4 focus:ring-blue-300"
                    aria-label={`${est.ya_inscrito ? 'Ya inscrito: ' : ''}${est.apellido_paterno} ${est.apellido_materno}, ${est.nombre}. Número de control: ${est.numero_control}`}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{est.apellido_paterno} {est.apellido_materno}, {est.nombre}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600">{est.numero_control}</p>
                      {est.ya_inscrito && (
                        <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                          Ya inscrito
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => { 
                  setShowEnrollForm(false); 
                  setSelectedGroup(null); 
                  setSelectedStudents([]);
                  announceMessage('Inscripción cancelada', 'polite');
                }}
                onMouseEnter={() => settings.readAloud && speakText('Cancelar')}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300"
                aria-label="Cancelar inscripción"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnrollStudents}
                disabled={loading || selectedStudents.length === 0}
                onMouseEnter={() => settings.readAloud && speakText(`Inscribir ${selectedStudents.length} estudiantes`)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-green-300"
                aria-label={`Inscribir ${selectedStudents.length} estudiante${selectedStudents.length !== 1 ? 's' : ''} seleccionado${selectedStudents.length !== 1 ? 's' : ''}`}
              >
                {loading ? 'Inscribiendo...' : `Inscribir ${selectedStudents.length} estudiante${selectedStudents.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}