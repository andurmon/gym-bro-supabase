import { response } from '../_shared/utils.ts';
import { TABLE_NAME, mapExercises } from './constants.ts';

/**
 *
 * @param supabase
 * @param req
 * @returns
 */
export async function getExercises(
  supabase: any,
  req: Request
): Promise<Response> {
  const url = new URL(req.url);

  const search = url.searchParams.get('search');
  const muscleGroupId = url.searchParams.get('muscleGroupId');
  const equipmentId = url.searchParams.get('equipmentId');

  let query = supabase
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
            name, 
            key
        ),
        equipment (
            id,
            name, 
            key
        )
    `
    )
    .order('name', { ascending: true });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (muscleGroupId) {
    query = query.eq('muscle_group_id', muscleGroupId);
  }

  if (equipmentId) {
    query = query.eq('equipment_id', equipmentId);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return response({ error: 'Failed to retrieve exercises' }, 500);
  }

  return response(mapExercises(data));
}
