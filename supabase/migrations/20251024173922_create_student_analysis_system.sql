-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.asignaciones_docente_materia (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  docente_id uuid NOT NULL,
  materia_id uuid NOT NULL,
  asignado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT asignaciones_docente_materia_pkey PRIMARY KEY (id),
  CONSTRAINT asignaciones_docente_materia_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES auth.users(id),
  CONSTRAINT asignaciones_docente_materia_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias(id)
);
CREATE TABLE public.calificaciones_detalladas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  inscripcion_id uuid NOT NULL,
  tipo_evaluacion_id uuid NOT NULL,
  puntuacion numeric CHECK (puntuacion >= 0::numeric),
  comentarios text,
  calificado_por uuid,
  calificado_en timestamp with time zone DEFAULT now(),
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT calificaciones_detalladas_pkey PRIMARY KEY (id),
  CONSTRAINT calificaciones_detalladas_inscripcion_id_fkey FOREIGN KEY (inscripcion_id) REFERENCES public.inscripciones_grupo(id),
  CONSTRAINT calificaciones_detalladas_tipo_evaluacion_id_fkey FOREIGN KEY (tipo_evaluacion_id) REFERENCES public.tipos_evaluacion(id),
  CONSTRAINT calificaciones_detalladas_calificado_por_fkey FOREIGN KEY (calificado_por) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.calificaciones_estudiantes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  estudiante_id uuid NOT NULL,
  nombre_unidad text NOT NULL CHECK (nombre_unidad <> ''::text),
  calificacion numeric NOT NULL CHECK (calificacion >= 0::numeric AND calificacion <= 100::numeric),
  porcentaje_asistencia numeric NOT NULL CHECK (porcentaje_asistencia >= 0::numeric AND porcentaje_asistencia <= 100::numeric),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT calificaciones_estudiantes_pkey PRIMARY KEY (id),
  CONSTRAINT calificaciones_estudiantes_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id)
);
CREATE TABLE public.carreras (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  codigo text UNIQUE,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT carreras_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categorias_factores_riesgo (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  descripcion text,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT categorias_factores_riesgo_pkey PRIMARY KEY (id)
);
CREATE TABLE public.estudiantes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  numero_control text NOT NULL UNIQUE,
  nombre text NOT NULL,
  apellido_paterno text NOT NULL,
  apellido_materno text NOT NULL,
  carrera_id uuid,
  semestre_actual integer NOT NULL CHECK (semestre_actual > 0),
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  user_id uuid,
  CONSTRAINT estudiantes_pkey PRIMARY KEY (id),
  CONSTRAINT estudiantes_carrera_id_fkey FOREIGN KEY (carrera_id) REFERENCES public.carreras(id),
  CONSTRAINT estudiantes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.factores_riesgo (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  categoria_id uuid NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT factores_riesgo_pkey PRIMARY KEY (id),
  CONSTRAINT factores_riesgo_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias_factores_riesgo(id)
);
CREATE TABLE public.factores_riesgo_estudiante (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  registro_estudiante_materia_id uuid NOT NULL,
  factor_riesgo_id uuid NOT NULL,
  severidad text DEFAULT 'media'::text CHECK (severidad = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text])),
  observaciones text,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT factores_riesgo_estudiante_pkey PRIMARY KEY (id),
  CONSTRAINT factores_riesgo_estudiante_factor_riesgo_id_fkey FOREIGN KEY (factor_riesgo_id) REFERENCES public.factores_riesgo(id),
  CONSTRAINT factores_riesgo_estudiante_registro_estudiante_materia_id_fkey FOREIGN KEY (registro_estudiante_materia_id) REFERENCES public.registros_estudiante_materia(id)
);
CREATE TABLE public.grupos_materia (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  materia_id uuid NOT NULL,
  docente_id uuid,
  nombre_grupo text NOT NULL,
  semestre_periodo integer NOT NULL CHECK (semestre_periodo > 0),
  periodo_academico text NOT NULL,
  cupo_maximo integer DEFAULT 40,
  horario text,
  esta_activo boolean DEFAULT true,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT grupos_materia_pkey PRIMARY KEY (id),
  CONSTRAINT grupos_materia_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias(id),
  CONSTRAINT grupos_materia_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.inscripciones_estudiante (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  estudiante_id uuid NOT NULL,
  materia_id uuid NOT NULL,
  inscrito_en timestamp with time zone DEFAULT now(),
  estado text DEFAULT 'activo'::text CHECK (estado = ANY (ARRAY['activo'::text, 'baja'::text, 'completado'::text])),
  CONSTRAINT inscripciones_estudiante_pkey PRIMARY KEY (id),
  CONSTRAINT inscripciones_estudiante_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id),
  CONSTRAINT inscripciones_estudiante_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias(id)
);
CREATE TABLE public.inscripciones_grupo (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  grupo_id uuid NOT NULL,
  estudiante_id uuid NOT NULL,
  fecha_inscripcion timestamp with time zone DEFAULT now(),
  estado text DEFAULT 'activo'::text CHECK (estado = ANY (ARRAY['activo'::text, 'baja'::text, 'completado'::text])),
  calificacion_final numeric CHECK (calificacion_final >= 0::numeric AND calificacion_final <= 100::numeric),
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT inscripciones_grupo_pkey PRIMARY KEY (id),
  CONSTRAINT inscripciones_grupo_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos_materia(id),
  CONSTRAINT inscripciones_grupo_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id)
);
CREATE TABLE public.materias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  codigo text,
  semestre integer NOT NULL CHECK (semestre > 0),
  carrera_id uuid,
  creado_en timestamp with time zone DEFAULT now(),
  docente_id uuid,
  CONSTRAINT materias_pkey PRIMARY KEY (id),
  CONSTRAINT materias_carrera_id_fkey FOREIGN KEY (carrera_id) REFERENCES public.carreras(id),
  CONSTRAINT materias_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES auth.users(id)
);
CREATE TABLE public.registros_estudiante_materia (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  estudiante_id uuid NOT NULL,
  materia_id uuid NOT NULL,
  semestre integer NOT NULL CHECK (semestre > 0),
  calificacion_unidad1 numeric CHECK (calificacion_unidad1 >= 0::numeric AND calificacion_unidad1 <= 100::numeric),
  calificacion_unidad2 numeric CHECK (calificacion_unidad2 >= 0::numeric AND calificacion_unidad2 <= 100::numeric),
  calificacion_unidad3 numeric CHECK (calificacion_unidad3 >= 0::numeric AND calificacion_unidad3 <= 100::numeric),
  calificacion_final numeric CHECK (calificacion_final >= 0::numeric AND calificacion_final <= 100::numeric),
  porcentaje_asistencia numeric CHECK (porcentaje_asistencia >= 0::numeric AND porcentaje_asistencia <= 100::numeric),
  estado text DEFAULT 'en_progreso'::text CHECK (estado = ANY (ARRAY['en_progreso'::text, 'aprobado'::text, 'reprobado'::text, 'baja'::text])),
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT registros_estudiante_materia_pkey PRIMARY KEY (id),
  CONSTRAINT registros_estudiante_materia_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id),
  CONSTRAINT registros_estudiante_materia_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias(id)
);
CREATE TABLE public.reportes_analisis (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  tipo_analisis text NOT NULL CHECK (tipo_analisis = ANY (ARRAY['pareto'::text, 'histograma'::text, 'dispersión'::text, 'gráfico_control'::text, 'estratificación'::text])),
  filtros jsonb DEFAULT '{}'::jsonb,
  resultados jsonb DEFAULT '{}'::jsonb,
  creado_por uuid,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT reportes_analisis_pkey PRIMARY KEY (id)
);
CREATE TABLE public.roles_usuario (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL UNIQUE,
  rol text NOT NULL CHECK (rol = ANY (ARRAY['admin'::text, 'teacher'::text, 'student'::text])),
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT roles_usuario_pkey PRIMARY KEY (id),
  CONSTRAINT roles_usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id)
);
CREATE TABLE public.tipos_evaluacion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  grupo_id uuid NOT NULL,
  nombre text NOT NULL,
  peso numeric NOT NULL CHECK (peso >= 0::numeric AND peso <= 100::numeric),
  puntos_maximos numeric DEFAULT 100,
  fecha_limite timestamp with time zone,
  descripcion text,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT tipos_evaluacion_pkey PRIMARY KEY (id),
  CONSTRAINT tipos_evaluacion_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos_materia(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'student'::user_role,
  estudiante_id uuid,
  email text NOT NULL,
  full_name text DEFAULT ''::text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT user_profiles_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.estudiantes(id)
);