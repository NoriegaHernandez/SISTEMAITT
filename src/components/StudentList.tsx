// src/components/StudentList.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Users, AlertTriangle, Edit, BookOpen } from 'lucide-react';
import RiskFactorForm from './RiskFactorForm';
import GradeAssignment from './GradeAssignment';

interface StudentRecord {
  id: string;
  student_id: string;
  subject_id: string;
  semester: number;
  unit1_grade: number | null;
  unit2_grade: number | null;
  unit3_grade: number | null;
  final_grade: number | null;
  attendance_percentage: number | null;
  status: string;
  student: {
    control_number: string;
    first_name: string;
    paternal_surname: string;
    maternal_surname: string;
  };
  subject: {
    name: string;
  };
  risk_count: number;
}

export default function StudentList() {
  const { profile } = useAuth();
  const { settings, announceMessage, speakText } = useAccessibility();
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<StudentRecord | null>(null);
  const [showRiskForm, setShowRiskForm] = useState(false);
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StudentRecord | null>(null);
  const [filter, setFilter] = useState<'all' | 'failed' | 'dropout'>('all');

  useEffect(() => {
    loadRecords();
  }, [filter]);

  const loadRecords = async () => {
    setLoading(true);
    announceMessage('Cargando registros académicos, por favor espere', 'polite');
    
    try {
      let query = supabase
        .from('student_subject_records')
        .select(`
          id,
          student_id,
          subject_id,
          semester,
          unit1_grade,
          unit2_grade,
          unit3_grade,
          final_grade,
          attendance_percentage,
          status,
          students!inner (
            control_number,
            first_name,
            paternal_surname,
            maternal_surname
          ),
          subjects!inner (
            name
          )
        `)
        .order('created_at', { ascending: false });

      // If student, only show their own records
      if (profile?.role === 'student' && profile?.estudiante_id) {
        query = query.eq('student_id', profile.estudiante_id);
      }

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const recordsWithRiskCount = await Promise.all(
        (data || []).map(async (record: any) => {
          const { count } = await supabase
            .from('student_risk_factors')
            .select('id', { count: 'exact', head: true })
            .eq('student_subject_record_id', record.id);

          return {
            id: record.id,
            student_id: record.student_id,
            subject_id: record.subject_id,
            semester: record.semester,
            unit1_grade: record.unit1_grade,
            unit2_grade: record.unit2_grade,
            unit3_grade: record.unit3_grade,
            final_grade: record.final_grade,
            attendance_percentage: record.attendance_percentage,
            status: record.status,
            student: record.students,
            subject: record.subjects,
            risk_count: count || 0,
          };
        })
      );

      setRecords(recordsWithRiskCount);
      announceMessage(`${recordsWithRiskCount.length} registros cargados correctamente`, 'polite');
      if (settings.readAloud) {
        speakText(`Se encontraron ${recordsWithRiskCount.length} registro${recordsWithRiskCount.length !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Error loading records:', error);
      announceMessage('Error al cargar registros académicos', 'assertive');
      if (settings.readAloud) {
        speakText('Error al cargar registros');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      dropout: 'bg-red-100 text-red-800 border-red-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    const labels = {
      approved: 'Aprobado',
      failed: 'Reprobado',
      dropout: 'Deserción',
      in_progress: 'En progreso',
    };

    const label = labels[status as keyof typeof labels] || status;

    return (
      <span 
        className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}
        role="status"
        aria-label={`Estado: ${label}`}
      >
        {label}
      </span>
    );
  };

  const handleEditGrades = (record: StudentRecord) => {
    setEditingRecord(record);
    setShowGradeForm(true);
    const studentName = `${record.student.paternal_surname} ${record.student.maternal_surname}, ${record.student.first_name}`;
    announceMessage(`Abriendo formulario de calificaciones para ${studentName}`, 'polite');
    if (settings.readAloud) {
      speakText(`Editando calificaciones de ${studentName}`);
    }
  };

  const handleManageRisks = (record: StudentRecord) => {
    setSelectedRecord(record);
    setShowRiskForm(true);
    const studentName = `${record.student.paternal_surname} ${record.student.maternal_surname}, ${record.student.first_name}`;
    announceMessage(`Abriendo gestión de factores de riesgo para ${studentName}`, 'polite');
    if (settings.readAloud) {
      speakText(`Gestionando riesgos de ${studentName}`);
    }
  };

  const handleFilterChange = (newFilter: 'all' | 'failed' | 'dropout') => {
    setFilter(newFilter);
    const filterLabels = {
      all: 'Todos los registros',
      failed: 'Estudiantes reprobados',
      dropout: 'Casos de deserción'
    };
    announceMessage(`Filtro cambiado a: ${filterLabels[newFilter]}`, 'polite');
    if (settings.readAloud) {
      speakText(filterLabels[newFilter]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96" role="status" aria-live="polite">
        <div className="text-gray-500">Cargando registros...</div>
      </div>
    );
  }

  const canEditGrades = profile?.role === 'teacher' || profile?.role === 'admin';
  const canManageRisks = profile?.role === 'teacher' || profile?.role === 'admin';

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6" role="region" aria-label="Lista de registros académicos">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users 
              className="w-8 h-8 text-blue-600" 
              aria-hidden="true"
              onMouseEnter={() => settings.readAloud && speakText('Registros de estudiantes')}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {profile?.role === 'student' ? 'Mis Registros Académicos' : 'Registros de Estudiantes'}
              </h2>
              <p className="text-sm text-gray-600">
                {records.length} registro{records.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {profile?.role !== 'student' && (
            <div className="flex gap-2" role="group" aria-label="Filtros de registros">
              <button
                onClick={() => handleFilterChange('all')}
                onMouseEnter={() => settings.readAloud && speakText('Mostrar todos los registros')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white focus:ring-blue-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
                }`}
                aria-pressed={filter === 'all'}
                aria-label="Filtrar: Todos los registros"
              >
                Todos
              </button>
              <button
                onClick={() => handleFilterChange('failed')}
                onMouseEnter={() => settings.readAloud && speakText('Mostrar estudiantes reprobados')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  filter === 'failed'
                    ? 'bg-yellow-600 text-white focus:ring-yellow-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
                }`}
                aria-pressed={filter === 'failed'}
                aria-label="Filtrar: Estudiantes reprobados"
              >
                Reprobados
              </button>
              <button
                onClick={() => handleFilterChange('dropout')}
                onMouseEnter={() => settings.readAloud && speakText('Mostrar casos de deserción')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  filter === 'dropout'
                    ? 'bg-red-600 text-white focus:ring-red-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
                }`}
                aria-pressed={filter === 'dropout'}
                aria-label="Filtrar: Casos de deserción"
              >
                Deserción
              </button>
            </div>
          )}
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12 text-gray-500" role="status">
            No hay registros para mostrar
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" role="table" aria-label="Tabla de registros académicos">
              <thead>
                <tr className="border-b border-gray-200">
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Número de Control
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Estudiante
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Materia
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Semestre
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Calificación
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Estado
                  </th>
                  {canManageRisks && (
                    <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Riesgos
                    </th>
                  )}
                  <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => {
                  const studentName = `${record.student.paternal_surname} ${record.student.maternal_surname}, ${record.student.first_name}`;
                  const gradeDisplay = record.final_grade !== null 
                    ? `${record.final_grade.toFixed(2)}${record.final_grade >= 70 ? ' aprobado' : ' reprobado'}`
                    : 'Sin calificación';
                  
                  return (
                    <tr 
                      key={record.id} 
                      className="border-b border-gray-100 hover:bg-gray-50"
                      role="row"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {record.student.control_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {studentName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {record.subject.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {record.semester}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {record.final_grade !== null ? (
                          <span 
                            className={record.final_grade >= 70 ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}
                            aria-label={gradeDisplay}
                          >
                            {record.final_grade.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-400" aria-label="Sin calificación">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(record.status)}
                      </td>
                      {canManageRisks && (
                        <td className="px-4 py-3">
                          {record.risk_count > 0 ? (
                            <span 
                              className="flex items-center gap-1 text-orange-600 text-sm font-medium"
                              role="status"
                              aria-label={`${record.risk_count} factor${record.risk_count !== 1 ? 'es' : ''} de riesgo identificado${record.risk_count !== 1 ? 's' : ''}`}
                            >
                              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                              {record.risk_count}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm" aria-label="Sin factores de riesgo">Ninguno</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2" role="group" aria-label="Acciones del registro">
                          {canEditGrades && (
                            <button
                              onClick={() => handleEditGrades(record)}
                              onMouseEnter={() => settings.readAloud && speakText(`Calificar a ${studentName}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                              aria-label={`Editar calificaciones de ${studentName}`}
                            >
                              <BookOpen className="w-4 h-4" aria-hidden="true" />
                              Calificar
                            </button>
                          )}
                          {canManageRisks && (
                            <button
                              onClick={() => handleManageRisks(record)}
                              onMouseEnter={() => settings.readAloud && speakText(`Gestionar riesgos de ${studentName}`)}
                              className="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2 py-1"
                              aria-label={`Gestionar factores de riesgo de ${studentName}`}
                            >
                              <Edit className="w-4 h-4" aria-hidden="true" />
                              Riesgos
                            </button>
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
      </div>

      {showRiskForm && selectedRecord && (
        <RiskFactorForm
          recordId={selectedRecord.id}
          studentName={`${selectedRecord.student.paternal_surname} ${selectedRecord.student.maternal_surname}, ${selectedRecord.student.first_name}`}
          onSuccess={() => {
            setShowRiskForm(false);
            setSelectedRecord(null);
            loadRecords();
            announceMessage('Factores de riesgo actualizados correctamente', 'assertive');
            if (settings.readAloud) {
              speakText('Factores de riesgo guardados');
            }
          }}
          onCancel={() => {
            setShowRiskForm(false);
            setSelectedRecord(null);
            announceMessage('Gestión de riesgos cancelada', 'polite');
          }}
        />
      )}

      {showGradeForm && editingRecord && (
        <GradeAssignment
          existingRecord={editingRecord}
          onSuccess={() => {
            setShowGradeForm(false);
            setEditingRecord(null);
            loadRecords();
            announceMessage('Calificaciones guardadas correctamente', 'assertive');
            if (settings.readAloud) {
              speakText('Calificaciones actualizadas');
            }
          }}
          onCancel={() => {
            setShowGradeForm(false);
            setEditingRecord(null);
            announceMessage('Edición de calificaciones cancelada', 'polite');
          }}
        />
      )}

      {/* Screen Reader Only Instructions */}
      <div className="sr-only" role="complementary" aria-label="Instrucciones de navegación">
        <h2>Instrucciones de navegación:</h2>
        <ul>
          <li>Use Tab para navegar entre elementos interactivos</li>
          <li>Use las teclas de flecha para navegar en la tabla</li>
          <li>Presione Enter o Espacio para activar botones</li>
          {profile?.role !== 'student' && (
            <li>Use los botones de filtro para mostrar diferentes tipos de registros</li>
          )}
          <li>Los cambios y actualizaciones se anunciarán automáticamente</li>
        </ul>
      </div>
    </>
  );
}