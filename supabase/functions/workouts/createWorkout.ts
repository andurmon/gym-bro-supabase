import { response } from '../_shared/utils';
import {
  TABLE_NAME,
  TypeOfTraining,
  Workout,
  WorkoutCategory,
} from './constants';

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

  const workout = {
    name: body.name.trim(),
    description: body.description ?? null,
    category: body.category ?? null,
    type_of_training: body.typeOfTraining ?? null,
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(workout)
    .select(`id, created_at, name, description, category, type_of_training`)
    .single();

  if (error) {
    console.error(error);
    return response({ error: 'Failed to create workout' }, 500);
  }

  return response(data, 201);
}
