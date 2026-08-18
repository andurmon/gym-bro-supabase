import { response } from '../_shared/utils.ts';

const TABLE_NAME = 'muscle_groups';

/**
 *
 * @param supabase
 * @param req
 * @returns
 */
export async function getMuscleGroups(
  supabase: any,
  req: Request
): Promise<Response> {
  const url = new URL(req.url);
  const search = url.searchParams.get('search');

  let query = supabase
    .from(TABLE_NAME)
    .select('id, created_at, name, key')
    .order('name', { ascending: true });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return response({ error: 'Failed to retrieve muscle groups' }, 500);
  }

  return response(data);
}
