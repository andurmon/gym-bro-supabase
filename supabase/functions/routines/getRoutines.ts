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
        monday, 
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        sunday,
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
