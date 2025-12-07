// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase';
// import { useAuth } from '../contexts/AuthContext';
// import { Filter, X, BarChart3 } from 'lucide-react';
// import ParetoChart from './ParetoChart';

// interface Grupo {
//   id: string;
//   nombre_grupo: string;
//   periodo_academico: string;
//   materia_nombre: string;
//   inscritos: number;
// }

// export default function ParetoAnalysisView() {
//   const { profile } = useAuth();
//   const [grupos, setGrupos] = useState<Grupo[]>([]);
//   const [selectedGrupo, setSelectedGrupo] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [showFilter, setShowFilter] = useState(false);

//   useEffect(() => {
//     if (profile?.id) {
//       loadGrupos();
//     }
//   }, [profile]);

//   const loadGrupos = async () => {
//     setLoading(true);
//     try {
//       // Si es docente, cargar solo sus grupos
//       let query = supabase
//         .from('grupos_materia')
//         .select(`
//           id,
//           nombre_grupo,
//           periodo_academico,
//           esta_activo,
//           materias!materia_id (nombre)
//         `)
//         .eq('esta_activo', true)
//         .order('creado_en', { ascending: false });

//       // Si es docente, filtrar por sus grupos
//       if (profile?.role === 'teacher') {
//         query = query.eq('docente_id', profile.id);
//       }

//       const { data: gruposData, error } = await query;

//       if (error) throw error;

//       if (gruposData) {
//         // Obtener conteo de inscritos para cada grupo
//         const gruposConConteo = await Promise.all(
//           gruposData.map(async (grupo: any) => {
//             const { count } = await supabase
//               .from('inscripciones_grupo')
//               .select('id', { count: 'exact', head: true })
//               .eq('grupo_id', grupo.id)
//               .in('estado', ['activo', 'completado']);

//             return {
//               id: grupo.id,
//               nombre_grupo: grupo.nombre_grupo,
//               periodo_academico: grupo.periodo_academico,
//               materia_nombre: grupo.materias?.nombre || 'Materia',
//               inscritos: count || 0
//             };
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

//   const handleSelectGrupo = (grupoId: string) => {
//     setSelectedGrupo(grupoId === selectedGrupo ? null : grupoId);
//   };

//   const handleClearFilter = () => {
//     setSelectedGrupo(null);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header con botón de filtro */}
//       <div className="bg-white rounded-lg shadow-lg p-6">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <BarChart3 className="w-8 h-8 text-blue-600" />
//             <div>
//               <h2 className="text-2xl font-bold text-gray-800">Análisis de Pareto</h2>
//               <p className="text-sm text-gray-600">
//                 Factores de riesgo más frecuentes - Principio 80/20
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={() => setShowFilter(!showFilter)}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
//               showFilter || selectedGrupo
//                 ? 'bg-blue-600 text-white hover:bg-blue-700'
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             <Filter className="w-5 h-5" />
//             {selectedGrupo ? 'Filtro activo' : 'Filtrar por grupo'}
//           </button>
//         </div>
//       </div>

//       {/* Panel de selección de grupos */}
//       {showFilter && (
//         <div className="bg-white rounded-lg shadow-lg p-6 animate-in slide-in-from-top">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-3">
//               <Filter className="w-6 h-6 text-blue-600" />
//               <div>
//                 <h3 className="text-lg font-bold text-gray-800">Filtrar por Grupo</h3>
//                 <p className="text-sm text-gray-600">
//                   Selecciona un grupo para analizar sus factores de riesgo específicos
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               {selectedGrupo && (
//                 <button
//                   onClick={handleClearFilter}
//                   className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
//                 >
//                   <X className="w-4 h-4" />
//                   Limpiar filtro
//                 </button>
//               )}
//               <button
//                 onClick={() => setShowFilter(false)}
//                 className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//           </div>

//           {loading ? (
//             <div className="text-center py-8 text-gray-500">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
//               Cargando grupos...
//             </div>
//           ) : grupos.length === 0 ? (
//             <div className="text-center py-8">
//               <Filter className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//               <p className="text-gray-500 mb-2">No hay grupos disponibles</p>
//               <p className="text-sm text-gray-400">
//                 {profile?.role === 'teacher' 
//                   ? 'No tienes grupos asignados'
//                   : 'No hay grupos activos en el sistema'}
//               </p>
//             </div>
//           ) : (
//             <>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
//                 {grupos.map((grupo) => (
//                   <button
//                     key={grupo.id}
//                     onClick={() => handleSelectGrupo(grupo.id)}
//                     className={`p-4 border-2 rounded-lg text-left transition-all ${
//                       selectedGrupo === grupo.id
//                         ? 'border-blue-500 bg-blue-50 shadow-md'
//                         : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
//                     }`}
//                   >
//                     <div className="flex items-start justify-between mb-2">
//                       <div className="flex-1">
//                         <div className="font-semibold text-gray-800">{grupo.materia_nombre}</div>
//                         <div className="text-sm text-gray-600 mt-1">
//                           Grupo {grupo.nombre_grupo}
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-1 text-blue-600 text-sm">
//                         <span className="font-medium">{grupo.inscritos}</span>
//                         <span className="text-xs text-gray-500">estudiantes</span>
//                       </div>
//                     </div>
//                     <div className="text-xs text-gray-500 mt-2">{grupo.periodo_academico}</div>
//                     {selectedGrupo === grupo.id && (
//                       <div className="mt-3 flex items-center gap-1 text-xs font-medium text-blue-600">
//                         <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
//                         Seleccionado
//                       </div>
//                     )}
//                   </button>
//                 ))}
//               </div>

//               {selectedGrupo && (
//                 <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                   <div className="flex items-start gap-2">
//                     <div className="flex-1">
//                       <p className="text-sm text-blue-900 font-medium mb-1">
//                         Filtro activo
//                       </p>
//                       <p className="text-sm text-blue-800">
//                         Mostrando factores de riesgo de{' '}
//                         <span className="font-semibold">
//                           {grupos.find(g => g.id === selectedGrupo)?.materia_nombre} -{' '}
//                           Grupo {grupos.find(g => g.id === selectedGrupo)?.nombre_grupo}
//                         </span>
//                         {' '}({grupos.find(g => g.id === selectedGrupo)?.inscritos} estudiantes)
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       )}

//       {/* Badge de filtro activo cuando el panel está cerrado */}
//       {!showFilter && selectedGrupo && (
//         <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
//                 <Filter className="w-5 h-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-blue-900">Filtro activo por grupo</p>
//                 <p className="text-sm text-blue-700">
//                   {grupos.find(g => g.id === selectedGrupo)?.materia_nombre} -{' '}
//                   Grupo {grupos.find(g => g.id === selectedGrupo)?.nombre_grupo}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setShowFilter(true)}
//                 className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Cambiar
//               </button>
//               <button
//                 onClick={handleClearFilter}
//                 className="flex items-center gap-1 px-3 py-2 text-sm bg-white text-gray-700 rounded-lg hover:bg-gray-50 border border-gray-300"
//               >
//                 <X className="w-4 h-4" />
//                 Quitar filtro
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Componente de Pareto */}
//       <ParetoChart filters={{ grupoId: selectedGrupo || undefined }} />

//       {/* Instrucciones de uso */}
//       <div className="bg-white rounded-lg shadow-lg p-6">
//         <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//           <span className="text-xl">📖</span>
//           Cómo usar el análisis por grupos
//         </h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <div className="flex items-start gap-3">
//               <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex-shrink-0">
//                 1
//               </div>
//               <p className="text-sm text-gray-700">
//                 Haz clic en <strong>"Filtrar por grupo"</strong> para ver la lista de grupos disponibles
//               </p>
//             </div>
//             <div className="flex items-start gap-3">
//               <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex-shrink-0">
//                 2
//               </div>
//               <p className="text-sm text-gray-700">
//                 Selecciona un grupo para analizar los factores de riesgo específicos de sus estudiantes
//               </p>
//             </div>
//             <div className="flex items-start gap-3">
//               <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex-shrink-0">
//                 3
//               </div>
//               <p className="text-sm text-gray-700">
//                 El gráfico se actualizará automáticamente mostrando solo los datos del grupo seleccionado
//               </p>
//             </div>
//           </div>
//           <div className="space-y-2">
//             <div className="flex items-start gap-3">
//               <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex-shrink-0">
//                 4
//               </div>
//               <p className="text-sm text-gray-700">
//                 Usa <strong>"Limpiar filtro"</strong> para volver a ver el análisis general de todos los grupos
//               </p>
//             </div>
//             <div className="flex items-start gap-3">
//               <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex-shrink-0">
//                 5
//               </div>
//               <p className="text-sm text-gray-700">
//                 Compara diferentes grupos cambiando la selección para identificar patrones específicos
//               </p>
//             </div>
//             <div className="flex items-start gap-3">
//               <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex-shrink-0">
//                 💡
//               </div>
//               <p className="text-sm text-gray-700">
//                 Los factores de riesgo se asignan desde la <strong>vista de grupos</strong> al gestionar estudiantes
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { BarChart3, AlertCircle, Download } from 'lucide-react';

interface RiskFactorData {
  nombre_factor: string;
  categoria: string;
  count: number;
  percentage: number;
  cumulative_percentage: number;
}

interface ParetoChartProps {
  filters?: {
    semester?: number;
    majorId?: string;
    grupoId?: string;
  };
}

export default function ParetoChart({ filters }: ParetoChartProps) {
  const { settings, announceMessage, speakText } = useAccessibility();
  const [data, setData] = useState<RiskFactorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadParetoData();
  }, [filters]);

  const loadParetoData = async () => {
    setLoading(true);
    setError('');
    announceMessage('Cargando análisis de Pareto', 'polite');

    try {
      // Si hay filtro por grupo, usar una consulta específica
      if (filters?.grupoId) {
        // Obtener datos del grupo
        const { data: grupoData, error: grupoError } = await supabase
          .from('grupos_materia')
          .select('materia_id, semestre_periodo')
          .eq('id', filters.grupoId)
          .single();

        if (grupoError) throw grupoError;

        // Obtener estudiantes del grupo
        const { data: inscripciones, error: inscError } = await supabase
          .from('inscripciones_grupo')
          .select('estudiante_id')
          .eq('grupo_id', filters.grupoId)
          .in('estado', ['activo', 'completado']);

        if (inscError) throw inscError;

        const estudianteIds = inscripciones.map((i: any) => i.estudiante_id);

        if (estudianteIds.length === 0) {
          setData([]);
          setLoading(false);
          announceMessage('No hay estudiantes en el grupo', 'polite');
          return;
        }

        // Obtener registros de estudiante_materia para estos estudiantes
        const { data: registros, error: regError } = await supabase
          .from('registros_estudiante_materia')
          .select('id')
          .in('estudiante_id', estudianteIds)
          .eq('materia_id', grupoData.materia_id)
          .eq('semestre', grupoData.semestre_periodo);

        if (regError) throw regError;

        if (!registros || registros.length === 0) {
          setData([]);
          setLoading(false);
          announceMessage('No hay registros disponibles para este grupo', 'polite');
          return;
        }

        const registroIds = registros.map(r => r.id);

        // Obtener factores de riesgo
        const { data: riskFactorData, error: factorError } = await supabase
          .from('factores_riesgo_estudiante')
          .select(`
            id,
            factor_riesgo_id,
            factores_riesgo!inner (
              nombre,
              categorias_factores_riesgo!inner (
                nombre
              )
            )
          `)
          .in('registro_estudiante_materia_id', registroIds);

        if (factorError) throw factorError;

        if (!riskFactorData || riskFactorData.length === 0) {
          setData([]);
          setLoading(false);
          announceMessage('No hay factores de riesgo registrados para este grupo', 'polite');
          return;
        }

        // Procesar datos
        const factorCounts = new Map<string, { 
          name: string; 
          categoria: string; 
          count: number 
        }>();

        riskFactorData.forEach((item: any) => {
          const factorId = item.factor_riesgo_id;
          const factorName = item.factores_riesgo.nombre || 'Factor Desconocido';
          const categoria = item.factores_riesgo.categorias_factores_riesgo?.nombre || 'Sin Categoría';

          if (factorCounts.has(factorId)) {
            factorCounts.get(factorId)!.count++;
          } else {
            factorCounts.set(factorId, { 
              name: factorName, 
              categoria: categoria.toLowerCase(), 
              count: 1 
            });
          }
        });

        // Ordenar y calcular porcentajes
        const sortedFactors = Array.from(factorCounts.values())
          .sort((a, b) => b.count - a.count);

        const totalCount = sortedFactors.reduce((sum, factor) => sum + factor.count, 0);

        let cumulativeCount = 0;
        const paretoData: RiskFactorData[] = sortedFactors.map(factor => {
          const percentage = (factor.count / totalCount) * 100;
          cumulativeCount += factor.count;
          const cumulative_percentage = (cumulativeCount / totalCount) * 100;

          return {
            nombre_factor: factor.name,
            categoria: factor.categoria,
            count: factor.count,
            percentage,
            cumulative_percentage
          };
        });

        setData(paretoData);
        announceMessage(`Análisis de Pareto cargado. ${paretoData.length} factores identificados`, 'assertive');
        
        if (settings.readAloud && paretoData.length > 0) {
          speakText(`Análisis cargado. Factor más común: ${paretoData[0].nombre_factor} con ${paretoData[0].count} casos`);
        }
        
        setLoading(false);
        return;
      }

      // Query original para cuando no hay filtro de grupo
      let query = supabase
        .from('factores_riesgo_estudiante')
        .select(`
          id,
          factor_riesgo_id,
          factores_riesgo!inner (
            nombre,
            categorias_factores_riesgo!inner (
              nombre
            )
          ),
          registro_estudiante_materia_id,
          registros_estudiante_materia!inner (
            semestre,
            estudiantes!inner (
              carrera_id
            )
          )
        `);

      const { data: riskFactorData, error: queryError } = await query;

      if (queryError) {
        console.error('Error en query:', queryError);
        throw queryError;
      }

      if (!riskFactorData || riskFactorData.length === 0) {
        setData([]);
        setLoading(false);
        announceMessage('No hay datos de factores de riesgo disponibles', 'polite');
        return;
      }

      // Procesar los datos aplicando filtros
      const factorCounts = new Map<string, { 
        name: string; 
        categoria: string; 
        count: number 
      }>();

      riskFactorData.forEach((item: any) => {
        // Aplicar filtros si existen
        if (filters?.semester && item.registros_estudiante_materia.semestre !== filters.semester) {
          return;
        }
        if (filters?.majorId && item.registros_estudiante_materia.estudiantes.carrera_id !== filters.majorId) {
          return;
        }

        const factorId = item.factor_riesgo_id;
        const factorName = item.factores_riesgo.nombre || 'Factor Desconocido';
        const categoria = item.factores_riesgo.categorias_factores_riesgo?.nombre || 'Sin Categoría';

        if (factorCounts.has(factorId)) {
          factorCounts.get(factorId)!.count++;
        } else {
          factorCounts.set(factorId, { 
            name: factorName, 
            categoria: categoria.toLowerCase(), 
            count: 1 
          });
        }
      });

      if (factorCounts.size === 0) {
        setData([]);
        setLoading(false);
        announceMessage('No se encontraron factores con los filtros aplicados', 'polite');
        return;
      }

      // Ordenar por frecuencia descendente
      const sortedFactors = Array.from(factorCounts.values())
        .sort((a, b) => b.count - a.count);

      const totalCount = sortedFactors.reduce((sum, factor) => sum + factor.count, 0);

      // Calcular porcentajes y acumulados
      let cumulativeCount = 0;
      const paretoData: RiskFactorData[] = sortedFactors.map(factor => {
        const percentage = (factor.count / totalCount) * 100;
        cumulativeCount += factor.count;
        const cumulative_percentage = (cumulativeCount / totalCount) * 100;

        return {
          nombre_factor: factor.name,
          categoria: factor.categoria,
          count: factor.count,
          percentage,
          cumulative_percentage
        };
      });

      setData(paretoData);
      announceMessage(`Análisis de Pareto cargado exitosamente. ${paretoData.length} factores identificados`, 'assertive');
      
      if (settings.readAloud && paretoData.length > 0) {
        speakText(`Análisis completado. Total de ${totalCount} casos. Factor más común: ${paretoData[0].nombre_factor} con ${paretoData[0].count} casos, representando el ${paretoData[0].percentage.toFixed(1)} por ciento`);
      }
    } catch (err: any) {
      console.error('Error completo:', err);
      const errorMsg = err.message || 'Error al cargar datos del análisis de Pareto';
      setError(errorMsg);
      announceMessage(`Error: ${errorMsg}`, 'assertive');
      
      if (settings.readAloud) {
        speakText(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (data.length === 0) return;

    announceMessage('Generando archivo CSV', 'polite');
    if (settings.readAloud) {
      speakText('Generando y descargando archivo CSV');
    }

    const headers = ['Factor de Riesgo', 'Categoría', 'Frecuencia', 'Porcentaje (%)', 'Acumulado (%)'];
    const rows = data.map(d => [
      d.nombre_factor,
      d.categoria,
      d.count,
      d.percentage.toFixed(2),
      d.cumulative_percentage.toFixed(2),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = `analisis-pareto-${new Date().toISOString().split('T')[0]}.csv`;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);

    announceMessage('Archivo CSV descargado exitosamente', 'assertive');
    if (settings.readAloud) {
      speakText(`Archivo ${fileName} descargado`);
    }
  };

  const maxCount = data.length > 0 ? Math.max(...data.map(d => d.count)) : 0;

  const getCategoryColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'académico': '#3b82f6',
      'academico': '#3b82f6',
      'psicológico': '#8b5cf6',
      'psicologico': '#8b5cf6',
      'económico': '#10b981',
      'economico': '#10b981',
      'institucional': '#f59e0b',
      'tecnológico': '#06b6d4',
      'tecnologico': '#06b6d4',
      'contextual': '#ef4444',
      'social': '#ec4899',
      'familiar': '#f97316',
    };
    return colors[categoria.toLowerCase()] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" aria-hidden="true"></div>
            <p className="text-gray-500">Cargando análisis de Pareto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="assertive">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-medium text-red-900">Error al cargar datos</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div 
            className="flex items-center gap-3"
            onMouseEnter={() => settings.readAloud && speakText('Análisis de Pareto - Factores de riesgo más frecuentes')}
          >
            <BarChart3 className="w-8 h-8 text-blue-600" aria-hidden="true" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Análisis de Pareto</h2>
              <p className="text-sm text-gray-600">Factores de riesgo más frecuentes</p>
            </div>
          </div>
        </div>
        <div className="text-center py-12" role="status">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" aria-hidden="true" />
          <p className="text-gray-500 mb-2">No hay datos de factores de riesgo disponibles</p>
          <p className="text-sm text-gray-400">
            {filters?.grupoId 
              ? 'No se han asignado factores de riesgo a los estudiantes de este grupo'
              : 'Los docentes deben asignar factores de riesgo desde la vista de grupos'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6" role="main" aria-label="Análisis de Pareto de factores de riesgo">
      {/* Screen Reader Only Instructions */}
      <div className="sr-only" role="complementary" aria-label="Instrucciones de navegación">
        <h2>Instrucciones de navegación del análisis de Pareto:</h2>
        <ul>
          <li>Use Tab para navegar entre elementos interactivos</li>
          <li>Los datos de cada factor se anunciarán al enfocar</li>
          <li>La gráfica presenta factores ordenados por frecuencia</li>
          <li>Presione Alt+A para abrir el panel de accesibilidad</li>
        </ul>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div 
          className="flex items-center gap-3"
          onMouseEnter={() => settings.readAloud && speakText('Análisis de Pareto - Factores de riesgo más frecuentes')}
        >
          <BarChart3 className="w-8 h-8 text-blue-600" aria-hidden="true" />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Análisis de Pareto</h2>
            <p className="text-sm text-gray-600">
              Factores de riesgo más frecuentes
              {filters?.grupoId && ' - Vista por grupo'}
            </p>
          </div>
        </div>
        <button
          onClick={exportToCSV}
          onMouseEnter={() => settings.readAloud && speakText('Botón Exportar CSV')}
          onFocus={() => announceMessage('Botón Exportar CSV enfocado')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-4 focus:ring-green-300"
          aria-label="Exportar datos del análisis de Pareto en formato CSV"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          Exportar CSV
        </button>
      </div>

      <div className="space-y-6">
        {/* Gráfica de Pareto */}
        <div 
          className="relative bg-gray-50 rounded-lg p-6"
          role="img"
          aria-label={`Gráfica de Pareto mostrando ${data.length} factores de riesgo. El factor más común es ${data[0]?.nombre_factor} con ${data[0]?.count} casos`}
        >
          <div className="relative h-96 border-l-2 border-b-2 border-gray-300 p-4">
            {/* Eje Y izquierdo (Frecuencia) */}
            <div className="absolute left-0 top-0 bottom-12 w-12 flex flex-col justify-between text-xs text-gray-600" aria-label="Eje de frecuencia">
              <span className="text-right pr-2">{maxCount}</span>
              <span className="text-right pr-2">{Math.round(maxCount * 0.75)}</span>
              <span className="text-right pr-2">{Math.round(maxCount * 0.5)}</span>
              <span className="text-right pr-2">{Math.round(maxCount * 0.25)}</span>
              <span className="text-right pr-2">0</span>
            </div>

            {/* Eje Y derecho (Porcentaje) */}
            <div className="absolute right-0 top-0 bottom-12 w-12 flex flex-col justify-between text-xs text-gray-600" aria-label="Eje de porcentaje acumulado">
              <span className="pl-2">100%</span>
              <span className="pl-2">75%</span>
              <span className="pl-2">50%</span>
              <span className="pl-2">25%</span>
              <span className="pl-2">0%</span>
            </div>

            {/* Área de gráfica */}
            <div className="h-full ml-14 mr-14 flex items-end gap-1 relative">
              {/* Línea acumulativa */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }} aria-hidden="true">
                <polyline
                  points={data.map((d, i) => {
                    const x = ((i + 0.5) / data.length) * 100;
                    const y = 100 - d.cumulative_percentage;
                    return `${x}%,${y}%`;
                  }).join(' ')}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {data.map((d, i) => {
                  const x = ((i + 0.5) / data.length) * 100;
                  const y = 100 - d.cumulative_percentage;
                  return (
                    <circle
                      key={i}
                      cx={`${x}%`}
                      cy={`${y}%`}
                      r="4"
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>

              {/* Barras */}
              {data.map((item, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center relative group"
                  style={{ height: '100%' }}
                  tabIndex={0}
                  role="graphics-symbol"
                  aria-label={`Factor ${index + 1}: ${item.nombre_factor}. ${item.count} casos, ${item.percentage.toFixed(1)}% del total. Acumulado: ${item.cumulative_percentage.toFixed(1)}%`}
                  onMouseEnter={() => settings.readAloud && speakText(`${item.nombre_factor}: ${item.count} casos, ${item.percentage.toFixed(1)} por ciento`)}
                  onFocus={() => announceMessage(`Factor ${index + 1}: ${item.nombre_factor}. ${item.count} casos`)}
                >
                  <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                    <div
                      className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer shadow-sm"
                      style={{
                        height: `${(item.count / maxCount) * 100}%`,
                        backgroundColor: getCategoryColor(item.categoria),
                        minHeight: '2px'
                      }}
                      title={`${item.nombre_factor}: ${item.count} ocurrencias (${item.percentage.toFixed(1)}%)`}
                    />
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                      <div className="font-semibold">{item.nombre_factor}</div>
                      <div className="text-gray-300">{item.count} casos ({item.percentage.toFixed(1)}%)</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Línea del 80% */}
            <div className="absolute left-14 right-14 h-px bg-orange-400" style={{ bottom: `calc(12px + 80%)` }} aria-hidden="true">
              <span className="absolute right-0 -top-5 text-xs text-orange-600 font-medium bg-white px-1 rounded">
                80% Acumulado
              </span>
            </div>
          </div>

          {/* Leyenda de la línea acumulativa */}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm" role="legend">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-red-500 rounded" aria-hidden="true"></div>
              <span className="text-gray-700">Porcentaje Acumulado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-orange-400 rounded" aria-hidden="true"></div>
              <span className="text-gray-700">Línea 80% (Principio de Pareto)</span>
            </div>
          </div>
        </div>

        {/* Lista detallada de factores */}
        <div className="space-y-2" role="region" aria-label="Detalle de factores de riesgo">
          <h3 className="font-semibold text-gray-800 mb-3 text-lg">Detalle de Factores de Riesgo</h3>
          {data.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              tabIndex={0}
              role="article"
              aria-label={`Factor de riesgo ${index + 1}: ${item.nombre_factor}. Categoría: ${item.categoria}. ${item.count} casos, ${item.percentage.toFixed(1)}% del total, acumulado ${item.cumulative_percentage.toFixed(1)}%`}
              onMouseEnter={() => settings.readAloud && speakText(`${index + 1}. ${item.nombre_factor}, categoría ${item.categoria}. ${item.count} casos, ${item.percentage.toFixed(1)} por ciento`)}
              onFocus={() => announceMessage(`Factor ${index + 1}: ${item.nombre_factor} enfocado`)}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-sm font-semibold text-gray-700 shadow-sm" aria-hidden="true">
                {index + 1}
              </div>
              <div
                className="w-4 h-4 rounded shadow-sm"
                style={{ backgroundColor: getCategoryColor(item.categoria) }}
                aria-hidden="true"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800">{item.nombre_factor}</div>
                <div className="text-sm text-gray-600 capitalize">{item.categoria}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-800">{item.count} casos</div>
                <div className="text-sm text-gray-600">
                  {item.percentage.toFixed(1)}% | ↗ {item.cumulative_percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Información y análisis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="region" aria-label="Estadísticas y análisis">
          <div 
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
            tabIndex={0}
            role="article"
            aria-label={`Estadísticas generales: Total de ${data.reduce((sum, d) => sum + d.count, 0)} casos. ${data.length} factores distintos. Factor más común: ${data[0]?.nombre_factor} con ${data[0]?.count} casos`}
            onMouseEnter={() => settings.readAloud && speakText(`Estadísticas generales: Total de ${data.reduce((sum, d) => sum + d.count, 0)} casos`)}
          >
            <h4 className="font-semibold text-blue-900 mb-2">📊 Estadísticas Generales</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Total de casos:</strong> {data.reduce((sum, d) => sum + d.count, 0)}</li>
              <li>• <strong>Factores distintos:</strong> {data.length}</li>
              <li>• <strong>Factor más común:</strong> {data[0]?.nombre_factor} ({data[0]?.count} casos)</li>
            </ul>
          </div>

          <div 
            className="p-4 bg-green-50 border border-green-200 rounded-lg"
            tabIndex={0}
            role="article"
            aria-label={`Análisis de Pareto: ${data.filter(d => d.cumulative_percentage <= 80).length} de ${data.length} factores representan el 80% de los casos`}
            onMouseEnter={() => settings.readAloud && speakText(`Análisis de Pareto: ${data.filter(d => d.cumulative_percentage <= 80).length} factores vitales de ${data.length} totales`)}
          >
            <h4 className="font-semibold text-green-900 mb-2">🎯 Análisis de Pareto (80/20)</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>
                • <strong>Factores vitales (80%):</strong>{' '}
                {data.filter(d => d.cumulative_percentage <= 80).length} de {data.length}
              </li>
              <li>
                • <strong>Recomendación:</strong> Enfocarse en los primeros{' '}
                {data.filter(d => d.cumulative_percentage <= 80).length} factores para 
                maximizar el impacto de las intervenciones.
              </li>
            </ul>
          </div>
        </div>

        {/* Interpretación del Principio de Pareto */}
        <div 
          className="p-4 bg-purple-50 border border-purple-200 rounded-lg"
          role="region"
          aria-label="Interpretación del análisis de Pareto"
          tabIndex={0}
          onMouseEnter={() => settings.readAloud && speakText('Interpretación del análisis: El principio de Pareto sugiere que el 80 por ciento de los efectos provienen del 20 por ciento de las causas')}
        >
          <h4 className="font-semibold text-purple-900 mb-2">💡 Interpretación del Análisis</h4>
          <p className="text-sm text-purple-800">
            El principio de Pareto (regla 80/20) sugiere que aproximadamente el 80% de los efectos 
            provienen del 20% de las causas. En este contexto, los factores en la parte superior de 
            la gráfica son los que tienen mayor impacto en el fracaso y deserción estudiantil. 
            Priorizar intervenciones en estos factores puede maximizar los resultados con recursos limitados.
          </p>
        </div>
      </div>
    </div>
  );
}