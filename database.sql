-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.muscle-groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  CONSTRAINT muscle-groups_pkey PRIMARY KEY (id)
);
CREATE TABLE public.equipment (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  CONSTRAINT equipment_pkey PRIMARY KEY (id)
);
CREATE TABLE public.exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  muscle_group uuid,
  equipment uuid,
  description text,
  instructions text,
  max_weight bigint,
  ideal_weight bigint,
  imageUrl character varying,
  videoUrl character varying,
  detailsUrl character varying,
  CONSTRAINT exercises_pkey PRIMARY KEY (id),
  CONSTRAINT exercises_equipment_fkey FOREIGN KEY (equipment) REFERENCES public.equipment(id),
  CONSTRAINT exercises_muscle_group_fkey FOREIGN KEY (muscle_group) REFERENCES public.muscle-groups(id)
);
CREATE TABLE public.workout-exercise (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  exercise uuid,
  sets bigint,
  reps bigint,
  CONSTRAINT workout-exercise_pkey PRIMARY KEY (id),
  CONSTRAINT workout-exercise_exercise_fkey FOREIGN KEY (exercise) REFERENCES public.exercises(id)
);
CREATE TABLE public.workouts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name character varying,
  description text,
  exercises uuid,
  exercises_json json,
  category character varying,
  type_of_training character varying,
  CONSTRAINT workouts_pkey PRIMARY KEY (id),
  CONSTRAINT workouts_exercises_fkey FOREIGN KEY (exercises) REFERENCES public.workout-exercise(id)
);
CREATE TABLE public.routine (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name character varying,
  monday uuid,
  tuesday uuid,
  wednesday uuid,
  thursday uuid,
  friday uuid,
  saturday uuid,
  sunday uuid,
  CONSTRAINT routine_pkey PRIMARY KEY (id),
  CONSTRAINT fk_routine_monday FOREIGN KEY (monday) REFERENCES public.workouts(id),
  CONSTRAINT fk_routine_tuesday FOREIGN KEY (tuesday) REFERENCES public.workouts(id),
  CONSTRAINT fk_routine_wednesday FOREIGN KEY (wednesday) REFERENCES public.workouts(id),
  CONSTRAINT fk_routine_thursday FOREIGN KEY (thursday) REFERENCES public.workouts(id),
  CONSTRAINT fk_routine_friday FOREIGN KEY (friday) REFERENCES public.workouts(id),
  CONSTRAINT fk_routine_saturday FOREIGN KEY (saturday) REFERENCES public.workouts(id),
  CONSTRAINT fk_routine_sunday FOREIGN KEY (sunday) REFERENCES public.workouts(id)
);