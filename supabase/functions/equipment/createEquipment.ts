import { response } from '../_shared/utils.ts';
import { Equipment, TABLE_NAME, mapEquipment } from './constants.ts';

export async function createEquipment(
  supabase: any,
  req: Request
): Promise<Response> {
  let body: Equipment;

  try {
    body = await req.json();
  } catch {
    return response({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.name?.trim()) {
    return response({ error: 'name is required' }, 400);
  }

  const equipment = {
    name: body.name.trim(),
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(equipment)
    .select('id, created_at, name')
    .single();

  if (error) {
    console.error(error);

    return response({ error: 'Failed to create equipment' }, 500);
  }

  return response(mapEquipment(data), 201);
}
