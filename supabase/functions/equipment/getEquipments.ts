import { response } from '../_shared/utils.ts';
import { TABLE_NAME, mapEquipments } from './constants.ts';

export async function getEquipments(
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
    return response({ error: 'Failed to retrieve equipment' }, 500);
  }

  return response(mapEquipments(data));
}
