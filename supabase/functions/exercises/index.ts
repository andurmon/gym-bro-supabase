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

interface Exercise {
  id?: string;
  name: string;
  muscleGroupId?: string | null;
  muscleGroups?: any;
  equipmentId?: string | null;
  equipment?: any;
  description?: string | null;
  instructions?: string | null;
  maxWeight?: number | null;
  idealWeight?: number | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  detailsUrl?: string | null;
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

function getExerciseId(req: Request): string | null {
  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);

  // /exercises/:id
  return parts.length > 1 ? parts[parts.length - 1] : null;
}

const TABLE_NAME = 'exercises';

const mapExercise = (exercise: any): Exercise => ({
  id: exercise?.id,
  name: exercise?.name,
  muscleGroupId: exercise?.muscle_group_id,
  muscleGroups: exercise?.muscle_groups,
  equipmentId: exercise?.equipment_id,
  equipment: exercise?.equipment,
  description: exercise?.description,
  instructions: exercise?.instructions,
  maxWeight: exercise?.max_weight,
  idealWeight: exercise?.ideal_weight,
  imageUrl: exercise?.image_url,
  videoUrl: exercise?.video_url,
  detailsUrl: exercise?.details_url,
});

const mapExercises = (exercises: any[]): Exercise[] =>
  exercises.map(mapExercise);

async function getExercises(req: Request): Promise<Response> {
  const url = new URL(req.url);

  const search = url.searchParams.get('search');
  const muscleGroupId = url.searchParams.get('muscleGroupId');
  const equipmentId = url.searchParams.get('equipmentId');

  let query = supabase
    .from(TABLE_NAME)
    .select(
      `
        id,
        created_at,
        name,
        muscle_group_id,
        equipment_id,
        description,
        instructions,
        max_weight,
        ideal_weight,
        image_url,
        video_url,
        details_url,
        muscle_groups (
            id,
            name
        ),
        equipment (
            id,
            name
        )
    `
    )
    .order('name', { ascending: true });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (muscleGroupId) {
    query = query.eq('muscle_group_id', muscleGroupId);
  }

  if (equipmentId) {
    query = query.eq('equipment_id', equipmentId);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return response({ error: 'Failed to retrieve exercises' }, 500);
  }

  return response(mapExercises(data));
}

async function getExercise(id: string): Promise<Response> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(
      `
      id,
      created_at,
      name,
      muscle_group_id,
      equipment_id,
      description,
      instructions,
      max_weight,
      ideal_weight,
      image_url,
      video_url,
      details_url,
      muscle_groups (
        id,
        name
      ),
      equipment (
        id,
        name
      )
    `
    )
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return response({ error: 'Exercise not found' }, 404);
    }

    console.error(error);

    return response({ error: 'Failed to retrieve exercise' }, 500);
  }

  return response(mapExercise(data));
}

async function createExercise(req: Request): Promise<Response> {
  let body: Exercise;

  try {
    body = await req.json();
  } catch {
    return response({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.name?.trim()) {
    return response({ error: 'name is required' }, 400);
  }

  const exercise = {
    name: body.name.trim(),
    muscle_group_id: body.muscleGroupId ?? null,
    equipment_id: body.equipmentId ?? null,
    description: body.description ?? null,
    instructions: body.instructions ?? null,
    max_weight: body.maxWeight ?? null,
    ideal_weight: body.idealWeight ?? null,
    image_url: body.imageUrl ?? null,
    video_url: body.videoUrl ?? null,
    details_url: body.detailsUrl ?? null,
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(exercise)
    .select(
      `
      id,
      created_at,
      name,
      muscle_group_id,
      equipment_id,
      description,
      instructions,
      max_weight,
      ideal_weight,
      image_url,
      video_url,
      details_url
    `
    )
    .single();

  if (error) {
    console.error(error);

    return response({ error: 'Failed to create exercise' }, 500);
  }

  return response(mapExercise(data), 201);
}

async function updateExercise(req: Request, id: string): Promise<Response> {
  let body: Partial<Exercise>;

  try {
    body = await req.json();
  } catch {
    return response({ error: 'Invalid JSON body' }, 400);
  }

  const updates: Partial<Exercise> = {};

  const allowedFields: (keyof Exercise)[] = [
    'name',
    'muscleGroupId',
    'equipmentId',
    'description',
    'instructions',
    'maxWeight',
    'idealWeight',
    'imageUrl',
    'videoUrl',
    'detailsUrl',
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
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
    .select(
      `
      id,
      created_at,
      name,
      muscle_group_id,
      equipment_id,
      description,
      instructions,
      max_weight,
      ideal_weight,
      image_url,
      video_url,
      details_url
    `
    )
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return response({ error: 'Exercise not found' }, 404);
    }

    console.error(error);

    return response({ error: 'Failed to update exercise' }, 500);
  }

  return response(mapExercise(data));
}

async function deleteExercise(id: string): Promise<Response> {
  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

  if (error) {
    console.error(error);

    return response({ error: 'Failed to delete exercise' }, 500);
  }

  return response({
    message: 'Exercise deleted successfully',
  });
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const id = getExerciseId(req);

    switch (req.method) {
      case 'GET':
        return id ? await getExercise(id) : await getExercises(req);

      case 'POST':
        return await createExercise(req);

      case 'PUT':
        if (!id) {
          return response({ error: 'Exercise ID is required' }, 400);
        }

        return await updateExercise(req, id);

      case 'DELETE':
        if (!id) {
          return response({ error: 'Exercise ID is required' }, 400);
        }

        return await deleteExercise(id);

      default:
        return response({ error: 'Method not allowed' }, 405);
    }
  } catch (error) {
    console.error(error);

    return response({ error: 'Internal server error' }, 500);
  }
});
