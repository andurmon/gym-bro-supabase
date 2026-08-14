import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface Workout {
  id?: string;
  name: string;
  description?: string | null;
  category?: string | null;
  typeOfTraining?: string | null;
}

enum WorkoutCategory {
  Strength = 'strength',
  Cardio = 'cardio',
  Flexibility = 'flexibility',
  Balance = 'balance',
  Mobility = 'mobility',
}

enum TypeOfTraining {
  FullBody = 'full_body',
  UpperBody = 'upper_body',
  LowerBody = 'lower_body',
}

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function getWorkoutId(req: Request): string | null {
  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);

  return parts.length > 1 ? parts[parts.length - 1] : null;
}

const TABLE_NAME = 'workouts';

async function getWorkouts(req: Request): Promise<Response> {
  const url = new URL(req.url);

  const search = url.searchParams.get('search');
  const category = url.searchParams.get('category');
  const typeOfTraining = url.searchParams.get('type_of_training');

  let query = supabase
    .from(TABLE_NAME)
    .select(
      `
      id,
      created_at,
      name,
      description,
      exercises_json,
      category,
      type_of_training
    `
    )
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

async function getWorkout(id: string): Promise<Response> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(
      `
      id,
      created_at,
      name,
      description,
      exercises_json,
      category,
      type_of_training
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return response({ error: 'Workout not found' }, 404);
    }

    console.error(error);

    return response({ error: 'Failed to retrieve workout' }, 500);
  }

  return response(data);
}

async function createWorkout(req: Request): Promise<Response> {
  let body: Workout;

  try {
    body = await req.json();
  } catch {
    return response({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.name?.trim()) return response({ error: 'name is required' }, 400);

  if (
    body.category &&
    !Object.values(WorkoutCategory).includes(body.category as WorkoutCategory)
  ) {
    return response({ error: 'Invalid category' }, 400);
  }

  if (
    body.typeOfTraining &&
    !Object.values(TypeOfTraining).includes(
      body.typeOfTraining as TypeOfTraining
    )
  ) {
    return response({ error: 'Invalid type of training' }, 400);
  }

  const workout = {
    name: body.name.trim(),
    description: body.description ?? null,
    category: body.category ?? null,
    type_of_training: body.typeOfTraining ?? null,
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(workout)
    .select(
      `
        id,
        created_at,
        name,
        description,
        exercises_json,
        category,
        type_of_training
        `
    )
    .single();

  if (error) {
    console.error(error);
    return response({ error: 'Failed to create workout' }, 500);
  }

  return response(data, 201);
}

async function updateWorkout(req: Request, id: string): Promise<Response> {
  let body: Partial<Workout>;

  try {
    body = await req.json();
  } catch {
    return response({ error: 'Invalid JSON body' }, 400);
  }

  const updates: Partial<Workout> = {};

  const allowedFields: (keyof Workout)[] = [
    'name',
    'description',
    'category',
    'typeOfTraining',
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined && body[field] !== null) {
      updates[field] = body[field];
    }
  }

  if (updates.name !== undefined && !updates.name?.trim()) {
    return response({ error: 'name cannot be empty' }, 400);
  }

  if (
    body.category &&
    !Object.values(WorkoutCategory).includes(body.category as WorkoutCategory)
  ) {
    return response({ error: 'Invalid category' }, 400);
  }

  if (
    body.typeOfTraining &&
    !Object.values(TypeOfTraining).includes(
      body.typeOfTraining as TypeOfTraining
    )
  ) {
    return response({ error: 'Invalid type of training' }, 400);
  }

  if (updates.name) {
    updates.name = updates.name.trim();
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updates)
    .eq('id', id)
    .select(
      `id, created_at, name, description, exercises_json, category, type_of_training`
    )
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return response({ error: 'Workout not found' }, 404);
    }

    console.error(error);

    return response({ error: 'Failed to update workout' }, 500);
  }

  return response(data);
}

async function deleteWorkout(id: string): Promise<Response> {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  if (error) {
    console.error(error);
    return response({ error: 'Failed to delete workout' }, 500);
  }

  return response({
    message: 'Workout deleted successfully',
  });
}

Deno.serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    const id = getWorkoutId(req);

    switch (req.method) {
      case 'GET':
        return id ? await getWorkout(id) : await getWorkouts(req);

      case 'POST':
        return await createWorkout(req);

      case 'PUT':
        if (!id) {
          return response({ error: 'Workout ID is required' }, 400);
        }

        return await updateWorkout(req, id);

      case 'DELETE':
        if (!id) {
          return response({ error: 'Workout ID is required' }, 400);
        }

        return await deleteWorkout(id);

      default:
        return response({ error: 'Method not allowed' }, 405);
    }
  } catch (error) {
    console.error(error);

    return response({ error: 'Internal server error' }, 500);
  }
});
