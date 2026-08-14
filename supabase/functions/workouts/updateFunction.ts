import { response } from '../_shared/utils.ts';
import {
  TABLE_NAME,
  TypeOfTraining,
  Workout,
  WorkoutCategory,
} from './constants.ts';

export async function updateWorkout(
  supabase: any,
  req: Request,
  id: string
): Promise<Response> {
  let body: Partial<Workout>;

  try {
    body = await req.json();
  } catch {
    return response({ error: 'Invalid JSON body' }, 400);
  }

  const updates: Partial<Workout> = {};

  const allowedFields: (keyof Workout)[] = [
    'name',
    'description',
    'category',
    'typeOfTraining',
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined && body[field] !== null) {
      updates[field] = body[field];
    }
  }

  if (updates.name !== undefined && !updates.name?.trim()) {
    return response({ error: 'name cannot be empty' }, 400);
  }

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

  if (updates.name) {
    updates.name = updates.name.trim();
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq('id', id)
    .select(`id, created_at, name, description, category, type_of_training`)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return response({ error: 'Workout not found' }, 404);
    }

    console.error(error);

    return response({ error: 'Failed to update workout' }, 500);
  }

  return response(data);
}
