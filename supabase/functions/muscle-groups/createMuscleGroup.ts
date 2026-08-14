import { response } from '../_shared/utils.ts';
import { MuscleGroup, TABLE_NAME } from './constants.ts';

export async function createMuscleGroup(
  supabase: any,
  req: Request
): Promise<Response> {
  let body: MuscleGroup;

  try {
    body = await req.json();
  } catch {
    return response({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.name?.trim()) {
    return response({ error: 'name is required' }, 400);
  }

  const muscleGroup = {
    name: body.name.trim(),
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(muscleGroup)
    .select('id, created_at, name')
    .single();

  if (error) {
    console.error(error);
    return response({ error: 'Failed to create muscle group' }, 500);
  }

  return response(data, 201);
}
