import { response } from '../_shared/utils.ts';
import {
  TABLE_NAME,
  TypeOfTraining,
  Workout,
  WorkoutCategory,
} from './constants.ts';

/**
 *
 * @param supabase
 * @param req
 * @returns
 */
export async function createWorkout(
  supabase: any,
  req: Request
): Promise<Response> {
  let body: Workout;

  //1. Validates Request
  try {
    body = await req.json();
  } catch {
    return response({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.name?.trim()) return response({ error: 'name is required' }, 400);

  if (
    body.category &&
    !Object.values(WorkoutCategory).includes(body.category as WorkoutCategory)
  ) {
    return response({ error: 'Invalid category' }, 400);
  }

  if (
    body.typeOfTraining &&
    !Object.values(TypeOfTraining).includes(
      body.typeOfTraining as TypeOfTraining
    )
  ) {
    return response({ error: 'Invalid type of training' }, 400);
  }

  const exercises = body?.exercises ?? [];
  if (!!exercises && !Array.isArray(exercises)) {
    return response({ error: 'Exercises must be an array' }, 400);
  }
  const isValidStructure = exercises.every(
    item => item !== null && typeof item === 'object' && !!item?.id
  );

  if (!isValidStructure)
    return response({ error: "Exercises must have an 'id'" }, 400);

  //2. Creates Workout
  const workout = {
    name: body.name.trim(),
    key: body.key.trim(),
    description: body.description ?? null,
    category: body.category ?? null,
    type_of_training: body.typeOfTraining ?? null,
  };

  // 3. Creates Workout-Exercise relationship
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(workout)
    .select(
      `id, created_at, name, key, description, category, type_of_training`
    )
    .single();
  console.log('data: ', data);

  if (!data?.id || error) {
    console.error(error ? error : { data });
    return response({ error: 'Failed to create workout' }, 500);
  }

  if (exercises?.length > 0) {
    const relation = exercises.map((exercise, index) => ({
      exercise_id: exercise.id,
      workout_id: data.id,
      workout_sequence_id: index,
      sets: exercise.sets,
      reps: exercise.reps,
    }));

    const joinTableResult = await supabase
      .from('workout_exercise')
      .insert(relation);
    console.log('joinTableResult: ', joinTableResult);
  }

  return response(data, 201);
}
