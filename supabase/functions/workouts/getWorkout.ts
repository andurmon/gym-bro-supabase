import { response } from '../_shared/utils.ts';

const TABLE_NAME = 'workouts';
/**
 *
 * @param supabase
 * @param id
 * @returns
 */
export async function getWorkout(supabase: any, id: string): Promise<Response> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(`id, created_at, name, description, category, type_of_training`)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return response({ error: 'Workout not found' }, 404);
    }

    console.error(error);

    return response({ error: 'Failed to retrieve workout' }, 500);
  }

  return response(data);
}
