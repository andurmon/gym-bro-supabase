import { response } from '../_shared/utils.ts';
import { Equipment, TABLE_NAME, mapEquipment } from './constants.ts';

export async function updateEquipment(
  supabase: any,
  req: Request,
  id: string
): Promise<Response> {
  let body: Partial<Equipment>;

  try {
    body = await req.json();
  } catch {
    return response({ error: 'Invalid JSON body' }, 400);
  }

  const updates: Partial<Equipment> = {};

  const allowedFields: (keyof Equipment)[] = ['name'];

  for (const field of allowedFields) {
    if (body[field] !== undefined && body[field] !== null) {
      updates[field] = body[field];
    }
  }

  if (updates.name !== undefined && !updates.name?.trim()) {
    return response({ error: 'name cannot be empty' }, 400);
  }

  if (updates.name) {
    updates.name = updates.name.trim();
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq('id', id)
    .select('id, created_at, name')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return response({ error: 'Equipment not found' }, 404);
    }

    console.error(error);

    return response({ error: 'Failed to update equipment' }, 500);
  }

  return response(mapEquipment(data));
}
