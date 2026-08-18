import { response } from '../_shared/utils.ts';
import { Exercise, TABLE_NAME, mapExercise } from './constants.ts';

/**
 *
 * @param supabase
 * @param req
 * @param id
 * @returns
 */
export async function updateExercise(
  supabase: any,
  req: Request,
  id: string
): Promise<Response> {
  let body: Partial<Exercise>;

  try {
    body = await req.json();
  } catch {
    return response({ error: 'Invalid JSON body' }, 400);
  }

  const updates: Partial<Exercise> = {};

  const allowedFields: (keyof Exercise)[] = [
    'name',
    'key',
    'muscleGroupId',
    'equipmentId',
    'description',
    'instructions',
    'maxWeight',
    'idealWeight',
    'imageUrl',
    'videoUrl',
    'detailsUrl',
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined && body[field] !== null) {
      updates[field] = body[field];
    }
  }

  if (updates.name !== undefined && !updates.name?.trim()) {
    return response({ error: 'name cannot be empty' }, 400);
  }

  if (updates.name) {
    updates.name = updates.name.trim();
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq('id', id)
    .select(
      `
      id,
      created_at,
      name,
      key,
      muscle_group_id,
      equipment_id,
      description,
      instructions,
      max_weight,
      ideal_weight,
      image_url,
      video_url,
      details_url
    `
    )
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return response({ error: 'Exercise not found' }, 404);
    }

    console.error(error);

    return response({ error: 'Failed to update exercise' }, 500);
  }

  return response(mapExercise(data));
}
