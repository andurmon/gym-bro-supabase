import { response } from '../_shared/utils.ts';
import { TABLE_NAME } from './constants.ts';

/**
 *
 * @param supabase
 * @param id
 * @returns
 */
export async function deleteExercise(
  supabase: any,
  id: string
): Promise<Response> {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  if (error) {
    console.error(error);

    return response({ error: 'Failed to delete exercise' }, 500);
  }

  return response({
    message: 'Exercise deleted successfully',
  });
}
