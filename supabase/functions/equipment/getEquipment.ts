import { response } from '../_shared/utils.ts';
import { TABLE_NAME, mapEquipment } from './constants.ts';

export async function getEquipment(
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
      return response({ error: 'Equipment not found' }, 404);
    }

    console.error(error);

    return response({ error: 'Failed to retrieve equipment' }, 500);
  }

  return response(mapEquipment(data));
}
