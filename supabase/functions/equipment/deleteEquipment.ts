import { response } from '../_shared/utils.ts';
import { TABLE_NAME } from './constants.ts';

export async function deleteEquipment(
  supabase: any,
  id: string
): Promise<Response> {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  if (error) {
    console.error(error);

    return response({ error: 'Failed to delete equipment' }, 500);
  }

  return response({
    message: 'Equipment deleted successfully',
  });
}
