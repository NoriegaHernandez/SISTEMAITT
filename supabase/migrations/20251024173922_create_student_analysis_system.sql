-- Crear tabla estudiantes
CREATE TABLE estudiantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id_number text UNIQUE NOT NULL CHECK (estudiante_id_number <> ''),
  apellido_paterno text NOT NULL CHECK (apellido_paterno <> ''),
  apellido_materno text NOT NULL CHECK (apellido_materno <> ''),
  nombres text NOT NULL CHECK (nombres <> ''),
  materia text NOT NULL CHECK (materia <> ''),
  semestre integer NOT NULL CHECK (semestre > 0),
  carrera text NOT NULL CHECK (carrera <> ''),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla calificaciones_estudiantes
CREATE TABLE calificaciones_estudiantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id uuid NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  nombre_unidad text NOT NULL CHECK (nombre_unidad <> ''),
  calificacion numeric NOT NULL CHECK (calificacion >= 0 AND calificacion <= 100),
  porcentaje_asistencia numeric NOT NULL CHECK (porcentaje_asistencia >= 0 AND porcentaje_asistencia <= 100),
  created_at timestamptz DEFAULT now()
);

-- Crear tabla factores_riesgo
CREATE TABLE  factores_riesgo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria text NOT NULL CHECK (categoria IN ('academico', 'psicologico', 'economico', 'institucional', 'tecnologico', 'contextual')),
  nombre_factor text NOT NULL CHECK (nombre_factor <> ''),
  descripcion text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de unión factores_riesgo_estudiantes
CREATE TABLE  factores_riesgo_estudiantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id uuid NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  factor_riesgo_id uuid NOT NULL REFERENCES factores_riesgo(id) ON DELETE CASCADE,
  gravedad text DEFAULT 'medio' CHECK (gravedad IN ('bajo', 'medio', 'alto')),
  notas text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(estudiante_id, factor_riesgo_id)
);

-- Crear índices para mejor rendimiento de consultas
CREATE INDEX idx_calificaciones_estudiantes_estudiante_id ON calificaciones_estudiantes(estudiante_id);
CREATE INDEX idx_factores_riesgo_estudiantes_estudiante_id ON factores_riesgo_estudiantes(estudiante_id);
CREATE INDEX idx_factores_riesgo_estudiantes_estudiante_id ON factores_riesgo_estudiantes(estudiante_id);
CREATE INDEX idx_factores_riesgo_estudiantes_factor_riesgo_id ON factores_riesgo_estudiantes(factor_riesgo_id);
CREATE INDEX idx_factores_riesgo_categoria ON factores_riesgo(categoria);

-- Habilitar Row Level Security
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calificaciones_estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE factores_riesgo ENABLE ROW LEVEL SECURITY;
ALTER TABLE factores_riesgo_estudiantes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tabla estudiantes (acceso público)
CREATE POLICY "Allow public read access to estudiantes"
  ON estudiantes FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to estudiantes"
  ON estudiantes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to estudiantes"
  ON estudiantes FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to estudiantes"
  ON estudiantes FOR DELETE
  USING (true);

-- Políticas RLS para tabla calificaciones_estudiantes (acceso público)
CREATE POLICY "Allow public read access to calificaciones_estudiantes"
  ON calificaciones_estudiantes FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to calificaciones_estudiantes"
  ON calificaciones_estudiantes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to calificaciones_estudiantes"
  ON calificaciones_estudiantes FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to calificaciones_estudiantes"
  ON calificaciones_estudiantes FOR DELETE
  USING (true);

-- Políticas RLS para tabla factores_riesgo (acceso público)
CREATE POLICY "Allow public read access to factores_riesgo"
  ON factores_riesgo FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to factores_riesgo"
  ON factores_riesgo FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to factores_riesgo"
  ON factores_riesgo FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to factores_riesgo"
  ON factores_riesgo FOR DELETE
  USING (true);

-- Políticas RLS para tabla factores_riesgo_estudiantes (acceso público)
CREATE POLICY "Allow public read access to factores_riesgo_estudiantes"
  ON factores_riesgo_estudiantes FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to factores_riesgo_estudiantes"
  ON factores_riesgo_estudiantes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to factores_riesgo_estudiantes"
  ON factores_riesgo_estudiantes FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to factores_riesgo_estudiantes"
  ON factores_riesgo_estudiantes FOR DELETE
  USING (true);

-- Insertar factores de riesgo predeterminados para cada categoría
INSERT INTO factores_riesgo (categoria, nombre_factor, descripcion) VALUES
  -- Factores académicos
  ('academico', 'Bajo rendimiento académico', 'El estudiante tiene calificaciones consistentemente bajas'),
  ('academico', 'Materias reprobadas', 'El estudiante ha reprobado una o más materias'),
  
  -- Factores psicológicos
  ('psicologico', 'Baja motivación', 'El estudiante muestra falta de interés o motivación en sus estudios'),
  ('psicologico', 'Estrés y ansiedad', 'El estudiante experimenta altos niveles de estrés o ansiedad'),

  
  -- Factores económicos
  ('economico', 'Dificultades financieras', 'El estudiante enfrenta limitaciones económicas'),
  ('economico', 'Necesidad de trabajar', 'El estudiante debe trabajar para mantenerse a sí mismo o a su familia'),
  
  -- Factores institucionales
  ('institucional', 'Tutoría inadecuada', 'El estudiante recibe apoyo académico insuficiente'),
  ('institucional', 'Diseño curricular deficiente', 'La estructura del curso no satisface las necesidades del estudiante'),
  
  -- Factores tecnológicos
  ('tecnologico', 'Falta de habilidades tecnológicas', 'El estudiante tiene competencia digital insuficiente'),
  ('tecnologico', 'Sin acceso a internet', 'El estudiante carece de conectividad a internet confiable'),
  
  -- Factores contextuales
  ('contextual', 'Problemas de transporte', 'El estudiante enfrenta dificultades para llegar al campus'),
  ('contextual', 'Problemas de salud', 'El estudiante tiene problemas de salud que afectan sus estudios'),
ON CONFLICT DO NOTHING;