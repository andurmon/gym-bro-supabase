import { response } from '../_shared/utils.ts';
import { TABLE_NAME } from './constants.ts';

/**
 *
 * @param supabase
 * @param id
 * @returns
 */
export async function deleteWorkout(
  supabase: any,
  id: string
): Promise<Response> {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  if (error) {
    console.error(error);
    return response({ error: 'Failed to delete workout' }, 500);
  }

  return response({
    message: 'Workout deleted successfully',
  });
}
