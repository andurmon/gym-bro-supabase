import { response } from '../_shared/utils.ts';
import { Exercise, TABLE_NAME, mapExercise } from './constants.ts';

/**
 *
 * @param supabase
 * @param req
 * @returns
 */
export async function createExercise(
  supabase: any,
  req: Request
): Promise<Response> {
  let body: Exercise;

  try {
    body = await req.json();
  } catch {
    return response({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.name?.trim()) {
    return response({ error: 'name is required' }, 400);
  }

  const exercise = {
    name: body.name.trim(),
    key: body.key.trim(),
    muscle_group_id: body.muscleGroupId ?? null,
    equipment_id: body.equipmentId ?? null,
    description: body.description ?? null,
    instructions: body.instructions ?? null,
    max_weight: body.maxWeight ?? null,
    ideal_weight: body.idealWeight ?? null,
    image_url: body.imageUrl ?? null,
    video_url: body.videoUrl ?? null,
    details_url: body.detailsUrl ?? null,
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(exercise)
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
    console.error(error);

    return response({ error: 'Failed to create exercise' }, 500);
  }

  return response(mapExercise(data), 201);
}
