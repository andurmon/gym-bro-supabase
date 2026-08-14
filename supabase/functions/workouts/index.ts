import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getWorkouts } from './getWorkouts.ts';

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

async function getWorkout(supabase: any, id: string): Promise<Response> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(`id, created_at, name, description, category, type_of_training`)
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

async function createWorkout(supabase: any, req: Request): Promise<Response> {
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
    .select(`id, created_at, name, description, category, type_of_training`)
    .single();

  if (error) {
    console.error(error);
    return response({ error: 'Failed to create workout' }, 500);
  }

  return response(data, 201);
}

async function updateWorkout(
  supabase: any,
  req: Request,
  id: string
): Promise<Response> {
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
    .select(`id, created_at, name, description, category, type_of_training`)
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

async function deleteWorkout(supabase: any, id: string): Promise<Response> {
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
        return id
          ? await getWorkout(supabase, id)
          : await getWorkouts(supabase, req);

      case 'POST':
        return await createWorkout(supabase, req);

      case 'PUT':
        if (!id) return response({ error: 'Workout ID is required' }, 400);
        return await updateWorkout(supabase, req, id);

      case 'DELETE':
        if (!id) return response({ error: 'Workout ID is required' }, 400);
        return await deleteWorkout(supabase, id);

      default:
        return response({ error: 'Method not allowed' }, 405);
    }
  } catch (error) {
    console.error(error);
    return response({ error: 'Internal server error' }, 500);
  }
});
