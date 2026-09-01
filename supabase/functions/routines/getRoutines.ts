import { response } from '../_shared/utils.ts';

const TABLE_NAME = 'routine';

/**
 * @param supabase
 * @param req
 * @returns
 */
export async function getRoutines(
  supabase: any,
  req: Request
): Promise<Response> {
  const url = new URL(req.url);
  const search = url.searchParams.get('search');

  let routinesQuery = supabase
    .from(TABLE_NAME)
    .select(
      `id,
        created_at,
        name,
        monday(id, name, category, type_of_training),
        tuesday(id, name, category, type_of_training),
        wednesday(id, name, category, type_of_training),
        thursday(id, name, category, type_of_training),
        friday(id, name, category, type_of_training),
        saturday(id, name, category, type_of_training),
        sunday(id, name, category, type_of_training),
        key`
    )
    .order('name', { ascending: true });

  if (search) {
    routinesQuery = routinesQuery.ilike('name', `%${search}%`);
  }

  const { data, error } = await routinesQuery;

  if (error) {
    console.error(error);
    return response({ error: 'Failed to retrieve routines' }, 500);
  }

  return response(data);
}
