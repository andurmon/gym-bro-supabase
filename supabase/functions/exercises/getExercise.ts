import { response } from '../_shared/utils.ts';
import { TABLE_NAME, mapExercise } from './constants.ts';

/**
 *
 * @param supabase
 * @param id
 * @returns
 */
export async function getExercise(
  supabase: any,
  id: string
): Promise<Response> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
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
      details_url,
      muscle_groups (
        id,
        name
      ),
      equipment (
        id,
        name
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return response({ error: 'Exercise not found' }, 404);
    }

    console.error(error);

    return response({ error: 'Failed to retrieve exercise' }, 500);
  }

  return response(mapExercise(data));
}
