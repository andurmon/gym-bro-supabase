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

interface Equipment {
  id?: string;
  name?: string;
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

function getEquipmentId(req: Request): string | null {
  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);

  // /equipment/:id
  return parts.length > 1 ? parts[parts.length - 1] : null;
}

const TABLE_NAME = 'equipment';

async function getEquipments(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const search = url.searchParams.get('search');

  let query = supabase
    .from(TABLE_NAME)
    .select('id, created_at, name')
    .order('name', { ascending: true });

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    return response({ error: 'Failed to retrieve equipment' }, 500);
  }

  return response(data);
}

async function getEquipment(id: string): Promise<Response> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('id, created_at, name')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return response({ error: 'Equipment not found' }, 404);
    }

    console.error(error);

    return response({ error: 'Failed to retrieve equipment' }, 500);
  }

  return response(data);
}

async function createEquipment(req: Request): Promise<Response> {
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

  return response(data, 201);
}

async function updateEquipment(req: Request, id: string): Promise<Response> {
  let body: Partial<Equipment>;

  try {
    body = await req.json();
  } catch {
    return response({ error: 'Invalid JSON body' }, 400);
  }

  const updates: Partial<Equipment> = {};

  const allowedFields: (keyof Equipment)[] = ['name'];

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
    .select('id, created_at, name')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return response({ error: 'Equipment not found' }, 404);
    }

    console.error(error);

    return response({ error: 'Failed to update equipment' }, 500);
  }

  return response(data);
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const id = getEquipmentId(req);

    switch (req.method) {
      case 'GET':
        return id ? await getEquipment(id) : await getEquipments(req);

      case 'POST':
        return await createEquipment(req);

      case 'PUT':
        if (!id) {
          return response({ error: 'Equipment ID is required' }, 400);
        }

        return await updateEquipment(req, id);

      default:
        return response({ error: 'Method not allowed' }, 405);
    }
  } catch (error) {
    console.error(error);

    return response({ error: 'Internal server error' }, 500);
  }
});
