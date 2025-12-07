// import { useState, useEffect } from 'react';
// import { supabase, RiskFactorCategory, RiskFactor, StudentRiskFactor } from '../lib/supabase';
// import { AlertTriangle, X, Save } from 'lucide-react';

// interface RiskFactorFormProps {
//   recordId: string;
//   studentName: string;
//   onSuccess: () => void;
//   onCancel: () => void;
// }

// export default function RiskFactorForm({ recordId, studentName, onSuccess, onCancel }: RiskFactorFormProps) {
//   const [categories, setCategories] = useState<RiskFactorCategory[]>([]);
//   const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     category_id: '',
//     severity: 'medium' as 'low' | 'medium' | 'high',
//     notes: '',
//   });

//   useEffect(() => {
//     loadData();
//   }, [recordId]);

//   const loadData = async () => {
//     const { data: cats } = await supabase
//       .from('risk_factor_categories')
//       .select('*')
//       .order('name');

//     const { data: existing } = await supabase
//       .from('student_risk_factors')
//       .select(`
//         risk_factor_id,
//         risk_factors!inner (category_id)
//       `)
//       .eq('student_subject_record_id', recordId);

//     if (cats) setCategories(cats);
//     if (existing) {
//       const categoryIds = existing.map((e: any) => e.risk_factors.category_id);
//       setSelectedCategories([...new Set(categoryIds)]);
//     }
//   };

//   const handleAddFactor = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.category_id) return;

//     setLoading(true);
//     try {
//       const { data: existingFactor } = await supabase
//         .from('risk_factors')
//         .select('id')
//         .eq('category_id', formData.category_id)
//         .maybeSingle();

//       let factorId: string;

//       if (existingFactor) {
//         factorId = existingFactor.id;
//       } else {
//         const category = categories.find(c => c.id === formData.category_id);
//         const { data: newFactor, error } = await supabase
//           .from('risk_factors')
//           .insert({
//             category_id: formData.category_id,
//             name: category?.name || 'Factor',
//             description: category?.description,
//           })
//           .select()
//           .single();

//         if (error) throw error;
//         factorId = newFactor.id;
//       }

//       const { error: insertError } = await supabase.from('student_risk_factors').insert({
//         student_subject_record_id: recordId,
//         risk_factor_id: factorId,
//         severity: formData.severity,
//         notes: formData.notes || null,
//       });

//       if (insertError) throw insertError;

//       setSelectedCategories([...selectedCategories, formData.category_id]);
//       setFormData({ category_id: '', severity: 'medium', notes: '' });
//     } catch (error) {
//       console.error('Error adding risk factor:', error);
//       alert('Error al agregar factor de riesgo');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRemoveFactor = async (categoryId: string) => {
//     try {
//       const { data: factorData } = await supabase
//         .from('risk_factors')
//         .select('id')
//         .eq('category_id', categoryId);

//       if (factorData && factorData.length > 0) {
//         const factorIds = factorData.map(f => f.id);
//         await supabase
//           .from('student_risk_factors')
//           .delete()
//           .eq('student_subject_record_id', recordId)
//           .in('risk_factor_id', factorIds);
//       }

//       setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
//     } catch (error) {
//       console.error('Error removing risk factor:', error);
//     }
//   };

//   const getCategoryName = (categoryId: string) => {
//     return categories.find(c => c.id === categoryId)?.name || '';
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-800">Factores de Riesgo</h2>
//             <p className="text-sm text-gray-600 mt-1">{studentName}</p>
//           </div>
//           <button
//             onClick={onCancel}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         <div className="p-6 space-y-6">
//           {selectedCategories.length > 0 && (
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//               <div className="flex items-start gap-3">
//                 <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
//                 <div className="flex-1">
//                   <h3 className="font-semibold text-yellow-900 mb-2">
//                     Factores de Riesgo Identificados ({selectedCategories.length})
//                   </h3>
//                   <div className="space-y-2">
//                     {selectedCategories.map(categoryId => (
//                       <div key={categoryId} className="flex justify-between items-center bg-white px-3 py-2 rounded">
//                         <span className="text-sm text-gray-700">{getCategoryName(categoryId)}</span>
//                         <button
//                           onClick={() => handleRemoveFactor(categoryId)}
//                           className="text-red-600 hover:text-red-800 text-sm"
//                         >
//                           Eliminar
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           <form onSubmit={handleAddFactor} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Categoría de Riesgo *
//               </label>
//               <select
//                 required
//                 value={formData.category_id}
//                 onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="">Seleccionar categoría de riesgo</option>
//                 {categories.map(category => (
//                   <option
//                     key={category.id}
//                     value={category.id}
//                     disabled={selectedCategories.includes(category.id)}
//                   >
//                     {category.name} {selectedCategories.includes(category.id) ? '(Ya agregado)' : ''}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Severidad *
//               </label>
//               <div className="flex gap-4">
//                 {(['low', 'medium', 'high'] as const).map((severity) => (
//                   <label key={severity} className="flex items-center gap-2 cursor-pointer">
//                     <input
//                       type="radio"
//                       name="severity"
//                       value={severity}
//                       checked={formData.severity === severity}
//                       onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
//                       className="w-4 h-4 text-blue-600"
//                     />
//                     <span className="text-sm text-gray-700 capitalize">
//                       {severity === 'low' ? 'Baja' : severity === 'medium' ? 'Media' : 'Alta'}
//                     </span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Notas adicionales
//               </label>
//               <textarea
//                 value={formData.notes}
//                 onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//                 rows={3}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Información adicional sobre este factor de riesgo..."
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={loading || !formData.category_id}
//               className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
//             >
//               <Save className="w-4 h-4" />
//               {loading ? 'Agregando...' : 'Agregar Factor'}
//             </button>
//           </form>

//           <div className="pt-4 border-t">
//             <button
//               onClick={onSuccess}
//               className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//             >
//               Finalizar
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { supabase, RiskFactorCategory, RiskFactor, StudentRiskFactor } from '../lib/supabase';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { AlertTriangle, X, Save } from 'lucide-react';

interface RiskFactorFormProps {
  recordId: string;
  studentName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RiskFactorForm({ recordId, studentName, onSuccess, onCancel }: RiskFactorFormProps) {
  const { settings, announceMessage, speakText } = useAccessibility();
  const [categories, setCategories] = useState<RiskFactorCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    notes: '',
  });

  useEffect(() => {
    loadData();
    announceMessage(`Formulario de factores de riesgo abierto para ${studentName}`, 'polite');
  }, [recordId]);

  const loadData = async () => {
    announceMessage('Cargando categorías de riesgo', 'polite');
    
    const { data: cats } = await supabase
      .from('risk_factor_categories')
      .select('*')
      .order('name');

    const { data: existing } = await supabase
      .from('student_risk_factors')
      .select(`
        risk_factor_id,
        risk_factors!inner (category_id)
      `)
      .eq('student_subject_record_id', recordId);

    if (cats) {
      setCategories(cats);
      announceMessage(`${cats.length} categorías disponibles`, 'polite');
    }
    
    if (existing) {
      const categoryIds = existing.map((e: any) => e.risk_factors.category_id);
      const uniqueCategories = [...new Set(categoryIds)];
      setSelectedCategories(uniqueCategories);
      if (uniqueCategories.length > 0) {
        announceMessage(`${uniqueCategories.length} factor${uniqueCategories.length !== 1 ? 'es' : ''} de riesgo ya identificado${uniqueCategories.length !== 1 ? 's' : ''}`, 'polite');
      }
    }
  };

  const handleAddFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) return;

    setLoading(true);
    announceMessage('Agregando factor de riesgo, por favor espere', 'polite');
    
    try {
      const { data: existingFactor } = await supabase
        .from('risk_factors')
        .select('id')
        .eq('category_id', formData.category_id)
        .maybeSingle();

      let factorId: string;

      if (existingFactor) {
        factorId = existingFactor.id;
      } else {
        const category = categories.find(c => c.id === formData.category_id);
        const { data: newFactor, error } = await supabase
          .from('risk_factors')
          .insert({
            category_id: formData.category_id,
            name: category?.name || 'Factor',
            description: category?.description,
          })
          .select()
          .single();

        if (error) throw error;
        factorId = newFactor.id;
      }

      const { error: insertError } = await supabase.from('student_risk_factors').insert({
        student_subject_record_id: recordId,
        risk_factor_id: factorId,
        severity: formData.severity,
        notes: formData.notes || null,
      });

      if (insertError) throw insertError;

      const categoryName = getCategoryName(formData.category_id);
      setSelectedCategories([...selectedCategories, formData.category_id]);
      setFormData({ category_id: '', severity: 'medium', notes: '' });
      
      const successMsg = `Factor de riesgo ${categoryName} agregado correctamente`;
      announceMessage(successMsg, 'assertive');
      if (settings.readAloud) {
        speakText(successMsg);
      }
    } catch (error) {
      console.error('Error adding risk factor:', error);
      const errorMsg = 'Error al agregar factor de riesgo';
      alert(errorMsg);
      announceMessage(errorMsg, 'assertive');
      if (settings.readAloud) {
        speakText(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFactor = async (categoryId: string) => {
    const categoryName = getCategoryName(categoryId);
    announceMessage(`Eliminando factor ${categoryName}`, 'polite');
    
    try {
      const { data: factorData } = await supabase
        .from('risk_factors')
        .select('id')
        .eq('category_id', categoryId);

      if (factorData && factorData.length > 0) {
        const factorIds = factorData.map(f => f.id);
        await supabase
          .from('student_risk_factors')
          .delete()
          .eq('student_subject_record_id', recordId)
          .in('risk_factor_id', factorIds);
      }

      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
      
      const successMsg = `Factor ${categoryName} eliminado`;
      announceMessage(successMsg, 'assertive');
      if (settings.readAloud) {
        speakText(successMsg);
      }
    } catch (error) {
      console.error('Error removing risk factor:', error);
      const errorMsg = 'Error al eliminar factor de riesgo';
      announceMessage(errorMsg, 'assertive');
      if (settings.readAloud) {
        speakText(errorMsg);
      }
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || '';
  };

  const handleCancel = () => {
    announceMessage('Cerrando formulario de factores de riesgo', 'polite');
    onCancel();
  };

  const handleFinish = () => {
    announceMessage('Factores de riesgo guardados correctamente', 'assertive');
    if (settings.readAloud) {
      speakText('Factores guardados');
    }
    onSuccess();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="risk-form-title"
      aria-describedby="risk-form-description"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 
              id="risk-form-title" 
              className="text-2xl font-bold text-gray-800"
            >
              Factores de Riesgo
            </h2>
            <p 
              id="risk-form-description" 
              className="text-sm text-gray-600 mt-1"
            >
              {studentName}
            </p>
          </div>
          <button
            onClick={handleCancel}
            onMouseEnter={() => settings.readAloud && speakText('Cerrar formulario')}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded p-1"
            aria-label="Cerrar formulario de factores de riesgo"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {selectedCategories.length > 0 && (
            <div 
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
              role="region"
              aria-label="Factores de riesgo identificados"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    Factores de Riesgo Identificados ({selectedCategories.length})
                  </h3>
                  <ul 
                    className="space-y-2"
                    role="list"
                    aria-label="Lista de factores de riesgo actuales"
                  >
                    {selectedCategories.map(categoryId => {
                      const categoryName = getCategoryName(categoryId);
                      return (
                        <li 
                          key={categoryId} 
                          className="flex justify-between items-center bg-white px-3 py-2 rounded"
                        >
                          <span className="text-sm text-gray-700">{categoryName}</span>
                          <button
                            onClick={() => handleRemoveFactor(categoryId)}
                            onMouseEnter={() => settings.readAloud && speakText(`Eliminar ${categoryName}`)}
                            className="text-red-600 hover:text-red-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
                            aria-label={`Eliminar factor de riesgo ${categoryName}`}
                          >
                            Eliminar
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form 
            onSubmit={handleAddFactor} 
            className="space-y-4"
            aria-label="Formulario para agregar factores de riesgo"
          >
            <div>
              <label 
                htmlFor="risk-category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Categoría de Riesgo *
              </label>
              <select
                id="risk-category"
                required
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                onFocus={() => {
                  announceMessage('Selector de categoría de riesgo enfocado');
                  if (settings.readAloud) {
                    speakText('Seleccionar categoría de riesgo');
                  }
                }}
                onMouseEnter={() => settings.readAloud && speakText('Categoría de riesgo')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-describedby="risk-category-description"
              >
                <option value="">Seleccionar categoría de riesgo</option>
                {categories.map(category => (
                  <option
                    key={category.id}
                    value={category.id}
                    disabled={selectedCategories.includes(category.id)}
                  >
                    {category.name} {selectedCategories.includes(category.id) ? '(Ya agregado)' : ''}
                  </option>
                ))}
              </select>
              <span id="risk-category-description" className="sr-only">
                Selecciona una categoría de factor de riesgo. Las categorías ya agregadas aparecen deshabilitadas.
              </span>
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">
                Severidad *
              </legend>
              <div 
                className="flex gap-4"
                role="radiogroup"
                aria-label="Nivel de severidad del factor de riesgo"
              >
                {(['low', 'medium', 'high'] as const).map((severity) => {
                  const severityLabel = severity === 'low' ? 'Baja' : severity === 'medium' ? 'Media' : 'Alta';
                  return (
                    <label 
                      key={severity} 
                      className="flex items-center gap-2 cursor-pointer"
                      onMouseEnter={() => settings.readAloud && speakText(`Severidad ${severityLabel}`)}
                    >
                      <input
                        type="radio"
                        name="severity"
                        value={severity}
                        checked={formData.severity === severity}
                        onChange={(e) => {
                          setFormData({ ...formData, severity: e.target.value as any });
                          announceMessage(`Severidad seleccionada: ${severityLabel}`, 'polite');
                        }}
                        onFocus={() => {
                          if (settings.readAloud) {
                            speakText(`Severidad ${severityLabel}`);
                          }
                        }}
                        className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        aria-label={`Severidad ${severityLabel}`}
                      />
                      <span className="text-sm text-gray-700">
                        {severityLabel}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label 
                htmlFor="risk-notes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notas adicionales
              </label>
              <textarea
                id="risk-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                onFocus={() => {
                  announceMessage('Campo de notas adicionales enfocado');
                  if (settings.readAloud) {
                    speakText('Campo de notas adicionales');
                  }
                }}
                onMouseEnter={() => settings.readAloud && speakText('Notas adicionales')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Información adicional sobre este factor de riesgo..."
                aria-describedby="risk-notes-description"
              />
              <span id="risk-notes-description" className="sr-only">
                Campo opcional para agregar información adicional sobre el factor de riesgo
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.category_id}
              onMouseEnter={() => !loading && formData.category_id && settings.readAloud && speakText('Agregar factor de riesgo')}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-300"
              aria-label={loading ? 'Agregando factor de riesgo, por favor espere' : 'Agregar factor de riesgo seleccionado'}
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              {loading ? 'Agregando...' : 'Agregar Factor'}
            </button>
          </form>

          <div className="pt-4 border-t">
            <button
              onClick={handleFinish}
              onMouseEnter={() => settings.readAloud && speakText('Finalizar y guardar cambios')}
              className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-4 focus:ring-green-300"
              aria-label="Finalizar gestión de factores de riesgo y guardar cambios"
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>

      {/* Screen Reader Only Instructions */}
      <div className="sr-only" role="complementary" aria-label="Instrucciones de navegación">
        <h2>Instrucciones del formulario:</h2>
        <ul>
          <li>Use Tab para navegar entre campos</li>
          <li>Seleccione una categoría de riesgo del menú desplegable</li>
          <li>Elija el nivel de severidad usando los botones de radio</li>
          <li>Agregue notas adicionales si lo desea</li>
          <li>Presione Agregar Factor para añadir el factor de riesgo</li>
          <li>Use el botón Eliminar para quitar factores existentes</li>
          <li>Presione Finalizar cuando termine de gestionar los factores</li>
        </ul>
      </div>
    </div>
  );
}