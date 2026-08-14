import { response } from '../_shared/utils.ts';

const TABLE_NAME = 'muscle_groups';

export async function getMuscleGroup(
  supabase: any,
  id: string
): Promise<Response> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('id, created_at, name')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return response({ error: 'Muscle group not found' }, 404);
    }

    console.error(error);

    return response({ error: 'Failed to retrieve muscle group' }, 500);
  }

  return response(data);
}
