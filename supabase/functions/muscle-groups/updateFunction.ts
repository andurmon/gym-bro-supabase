import { response } from '../_shared/utils.ts';
import { MuscleGroup, TABLE_NAME } from './constants.ts';

export async function updateMuscleGroup(
  supabase: any,
  req: Request,
  id: string
): Promise<Response> {
  let body: Partial<MuscleGroup>;

  try {
    body = await req.json();
  } catch {
    return response({ error: 'Invalid JSON body' }, 400);
  }

  const updates: Partial<MuscleGroup> = {};

  const allowedFields: (keyof MuscleGroup)[] = ['name'];

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
      return response({ error: 'Muscle group not found' }, 404);
    }

    console.error(error);

    return response({ error: 'Failed to update muscle group' }, 500);
  }

  return response(data);
}
