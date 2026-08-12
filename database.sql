-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.muscle_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  CONSTRAINT muscle_groups_pkey PRIMARY KEY (id)
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
  muscle_group_id uuid,
  equipment_id uuid,
  description text,
  instructions text,
  max_weight bigint,
  ideal_weight bigint,
  image_url character varying,
  video_url character varying,
  details_url character varying,
  CONSTRAINT exercises_pkey PRIMARY KEY (id),
  CONSTRAINT exercises_equipment_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id),
  CONSTRAINT exercises_muscle_group_fkey FOREIGN KEY (muscle_group_id) REFERENCES public.muscle_groups(id)
);

CREATE TABLE public.workouts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name character varying,
  description text,
  category character varying,
  type_of_training character varying,
  CONSTRAINT workouts_pkey PRIMARY KEY (id)
);

CREATE TABLE public.workout_exercise (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  exercise_id uuid,
  sets bigint,
  reps bigint,
  workout_id uuid,
  workout_sequence_id bigint,
  CONSTRAINT workout_exercise_pkey PRIMARY KEY (id),
  CONSTRAINT workout_exercise_exercise_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id),
  CONSTRAINT workout_exercise_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id)
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


INSERT INTO public.equipment (name) VALUES ('body-weight');
INSERT INTO public.equipment (name) VALUES ('dumbells');
INSERT INTO public.equipment (name) VALUES ('machine');
INSERT INTO public.equipment (name) VALUES ('bands');

INSERT INTO public.muscle_groups (name) VALUES ('chest');
INSERT INTO public.muscle_groups (name) VALUES ('back');
INSERT INTO public.muscle_groups (name) VALUES ('shoulder');
INSERT INTO public.muscle_groups (name) VALUES ('legs');
INSERT INTO public.muscle_groups (name) VALUES ('glutes');
INSERT INTO public.muscle_groups (name) VALUES ('biceps');
INSERT INTO public.muscle_groups (name) VALUES ('tricpes');
INSERT INTO public.muscle_groups (name) VALUES ('forearms');
INSERT INTO public.muscle_groups (name) VALUES ('abs');