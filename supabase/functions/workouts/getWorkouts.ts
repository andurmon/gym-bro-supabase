import { response } from '../_shared/utils.ts';

const TABLE_NAME = 'workouts';

/**
 * @param supabase
 * @param req
 * @returns
 */
export async function getWorkouts(
  supabase: any,
  req: Request
): Promise<Response> {
  const url = new URL(req.url);

  const search = url.searchParams.get('search');
  const category = url.searchParams.get('category');
  const typeOfTraining = url.searchParams.get('typeOfTraining');

  let query = supabase
    .from(TABLE_NAME)
    .select(`id, created_at, name, description, category, type_of_training`)
    .order('name', { ascending: true });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (typeOfTraining) {
    query = query.eq('type_of_training', typeOfTraining);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return response({ error: 'Failed to retrieve workouts' }, 500);
  }

  return response(data);
}
