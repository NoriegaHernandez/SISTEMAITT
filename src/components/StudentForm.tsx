import { useState, useEffect } from 'react';
import { supabase, Major, Subject, Student, StudentSubjectRecord } from '../lib/supabase';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Save, X, AlertCircle } from 'lucide-react';

interface StudentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StudentForm({ onSuccess, onCancel }: StudentFormProps) {
  const { settings, announceMessage, speakText } = useAccessibility();
  const [majors, setMajors] = useState<Major[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    control_number: '',
    first_name: '',
    paternal_surname: '',
    maternal_surname: '',
    major_id: '',
    current_semester: 1,
    subject_id: '',
    subject_semester: 1,
    unit1_grade: '',
    unit2_grade: '',
    unit3_grade: '',
    attendance_percentage: '',
  });

  useEffect(() => {
    loadMajors();
    loadSubjects();
    announceMessage('Formulario de registro de estudiante abierto', 'polite');
  }, []);

  const loadMajors = async () => {
    const { data } = await supabase.from('majors').select('*').order('name');
    if (data) setMajors(data);
  };

  const loadSubjects = async () => {
    const { data } = await supabase.from('subjects').select('*').order('name');
    if (data) setSubjects(data);
  };

  const calculateFinalGrade = () => {
    const u1 = parseFloat(formData.unit1_grade) || 0;
    const u2 = parseFloat(formData.unit2_grade) || 0;
    const u3 = parseFloat(formData.unit3_grade) || 0;
    return ((u1 + u2 + u3) / 3).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    announceMessage('Guardando información del estudiante', 'polite');

    try {
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('control_number', formData.control_number)
        .maybeSingle();

      let studentId: string;

      if (existingStudent) {
        studentId = existingStudent.id;
        await supabase
          .from('students')
          .update({
            first_name: formData.first_name,
            paternal_surname: formData.paternal_surname,
            maternal_surname: formData.maternal_surname,
            major_id: formData.major_id || null,
            current_semester: formData.current_semester,
            updated_at: new Date().toISOString(),
          })
          .eq('id', studentId);
      } else {
        const { data: newStudent, error } = await supabase
          .from('students')
          .insert({
            control_number: formData.control_number,
            first_name: formData.first_name,
            paternal_surname: formData.paternal_surname,
            maternal_surname: formData.maternal_surname,
            major_id: formData.major_id || null,
            current_semester: formData.current_semester,
          })
          .select()
          .single();

        if (error) throw error;
        studentId = newStudent.id;
      }

      const finalGrade = parseFloat(calculateFinalGrade());
      const status = finalGrade >= 70 ? 'approved' : 'failed';

      await supabase.from('student_subject_records').insert({
        student_id: studentId,
        subject_id: formData.subject_id,
        semester: formData.subject_semester,
        unit1_grade: parseFloat(formData.unit1_grade) || null,
        unit2_grade: parseFloat(formData.unit2_grade) || null,
        unit3_grade: parseFloat(formData.unit3_grade) || null,
        final_grade: finalGrade,
        attendance_percentage: parseFloat(formData.attendance_percentage) || null,
        status,
      });

      announceMessage('Estudiante guardado correctamente', 'assertive');
      if (settings.readAloud) {
        speakText('El estudiante se ha registrado exitosamente');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving student:', error);
      const errorMsg = 'Error al guardar el estudiante';
      setError(errorMsg);
      announceMessage(`Error: ${errorMsg}`, 'assertive');
      if (settings.readAloud) {
        speakText(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    announceMessage('Registro de estudiante cancelado', 'polite');
    onCancel();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="form-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 
            id="form-title" 
            className="text-2xl font-bold text-gray-800"
            onMouseEnter={() => settings.readAloud && speakText('Registro de Estudiante')}
          >
            Registro de Estudiante
          </h2>
          <button
            onClick={handleCancel}
            onMouseEnter={() => settings.readAloud && speakText('Cerrar formulario')}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded p-1"
            aria-label="Cerrar formulario"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <div 
            className="mx-6 mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6" role="region" aria-label="Formulario de registro">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="control_number" className="block text-sm font-semibold text-gray-700 mb-2">
                Número de Control *
              </label>
              <input
                id="control_number"
                type="text"
                required
                value={formData.control_number}
                onChange={(e) => setFormData({ ...formData, control_number: e.target.value })}
                onFocus={() => {
                  if (settings.readAloud) {
                    speakText('Campo de número de control');
                  }
                  announceMessage('Campo de número de control enfocado');
                }}
                onMouseEnter={() => settings.readAloud && speakText('Número de Control')}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Ej: 20210001"
                aria-describedby="control_number-description"
              />
              <span id="control_number-description" className="sr-only">
                Ingresa el número de control del estudiante
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
              />
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
              />
            </div>

            <div className="md:col-span-2">
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
              />
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
                Selecciona la carrera del estudiante
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
                Ingresa el semestre actual del estudiante, del 1 al 12
              </span>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 
              className="text-lg font-semibold text-gray-800 mb-4"
              onMouseEnter={() => settings.readAloud && speakText('Registro de Materia')}
            >
              Registro de Materia
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="subject_id" className="block text-sm font-semibold text-gray-700 mb-2">
                  Materia *
                </label>
                <select
                  id="subject_id"
                  required
                  value={formData.subject_id}
                  onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                  onFocus={() => {
                    if (settings.readAloud) {
                      speakText('Campo de selección de materia');
                    }
                    announceMessage('Campo de materia enfocado');
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Materia')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white"
                  aria-describedby="subject_id-description"
                >
                  <option value="">Seleccionar materia</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <span id="subject_id-description" className="sr-only">
                  Selecciona la materia a registrar
                </span>
              </div>

              <div>
                <label htmlFor="subject_semester" className="block text-sm font-semibold text-gray-700 mb-2">
                  Semestre Cursado *
                </label>
                <input
                  id="subject_semester"
                  type="number"
                  required
                  min="1"
                  max="12"
                  value={formData.subject_semester}
                  onChange={(e) => setFormData({ ...formData, subject_semester: parseInt(e.target.value) })}
                  onFocus={() => {
                    if (settings.readAloud) {
                      speakText('Campo de semestre cursado');
                    }
                    announceMessage('Campo de semestre cursado enfocado');
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Semestre Cursado')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label htmlFor="unit1_grade" className="block text-sm font-semibold text-gray-700 mb-2">
                  Calificación Unidad 1
                </label>
                <input
                  id="unit1_grade"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.unit1_grade}
                  onChange={(e) => setFormData({ ...formData, unit1_grade: e.target.value })}
                  onFocus={() => {
                    if (settings.readAloud) {
                      speakText('Campo de calificación unidad 1');
                    }
                    announceMessage('Campo de calificación unidad 1 enfocado');
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Calificación Unidad 1')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  aria-describedby="unit1_grade-description"
                />
                <span id="unit1_grade-description" className="sr-only">
                  Ingresa la calificación de la unidad 1, de 0 a 100
                </span>
              </div>

              <div>
                <label htmlFor="unit2_grade" className="block text-sm font-semibold text-gray-700 mb-2">
                  Calificación Unidad 2
                </label>
                <input
                  id="unit2_grade"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.unit2_grade}
                  onChange={(e) => setFormData({ ...formData, unit2_grade: e.target.value })}
                  onFocus={() => {
                    if (settings.readAloud) {
                      speakText('Campo de calificación unidad 2');
                    }
                    announceMessage('Campo de calificación unidad 2 enfocado');
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Calificación Unidad 2')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  aria-describedby="unit2_grade-description"
                />
                <span id="unit2_grade-description" className="sr-only">
                  Ingresa la calificación de la unidad 2, de 0 a 100
                </span>
              </div>

              <div>
                <label htmlFor="unit3_grade" className="block text-sm font-semibold text-gray-700 mb-2">
                  Calificación Unidad 3
                </label>
                <input
                  id="unit3_grade"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.unit3_grade}
                  onChange={(e) => setFormData({ ...formData, unit3_grade: e.target.value })}
                  onFocus={() => {
                    if (settings.readAloud) {
                      speakText('Campo de calificación unidad 3');
                    }
                    announceMessage('Campo de calificación unidad 3 enfocado');
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Calificación Unidad 3')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  aria-describedby="unit3_grade-description"
                />
                <span id="unit3_grade-description" className="sr-only">
                  Ingresa la calificación de la unidad 3, de 0 a 100
                </span>
              </div>

              <div>
                <label htmlFor="attendance_percentage" className="block text-sm font-semibold text-gray-700 mb-2">
                  Asistencia (%)
                </label>
                <input
                  id="attendance_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.attendance_percentage}
                  onChange={(e) => setFormData({ ...formData, attendance_percentage: e.target.value })}
                  onFocus={() => {
                    if (settings.readAloud) {
                      speakText('Campo de porcentaje de asistencia');
                    }
                    announceMessage('Campo de asistencia enfocado');
                  }}
                  onMouseEnter={() => settings.readAloud && speakText('Asistencia')}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  aria-describedby="attendance_percentage-description"
                />
                <span id="attendance_percentage-description" className="sr-only">
                  Ingresa el porcentaje de asistencia, de 0 a 100
                </span>
              </div>

              {formData.unit1_grade && formData.unit2_grade && formData.unit3_grade && (
                <div className="md:col-span-2">
                  <div 
                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                    role="status"
                    aria-live="polite"
                  >
                    <p className="text-sm font-medium text-blue-900">
                      Calificación Final: <span className="text-xl" aria-label={`Calificación final calculada: ${calculateFinalGrade()} puntos`}>{calculateFinalGrade()}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              onMouseEnter={() => settings.readAloud && speakText('Botón Cancelar')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              aria-label="Cancelar y cerrar el formulario"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              onMouseEnter={() => settings.readAloud && speakText('Botón Guardar')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[1.02] active:scale-[0.98]"
              aria-label={loading ? 'Guardando información, por favor espere' : 'Guardar información del estudiante'}
            >
              {loading ? (
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
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Screen Reader Only Instructions */}
      <div className="sr-only" role="complementary" aria-label="Instrucciones de accesibilidad">
        <h2>Instrucciones del formulario:</h2>
        <ul>
          <li>Use Tab para navegar entre los campos del formulario</li>
          <li>Los campos marcados con asterisco son obligatorios</li>
          <li>La calificación final se calculará automáticamente al ingresar las tres unidades</li>
          <li>Presione Escape para cerrar el formulario</li>
          <li>Los anuncios y errores se leerán automáticamente</li>
        </ul>
      </div>
    </div>
  );
}