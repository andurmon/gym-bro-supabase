import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { CORS_HEADERS } from '../_shared/constants.ts';
import { response } from '../_shared/utils.ts';
import { getMuscleGroupId } from './constants.ts';

import { getMuscleGroup } from './getMuscleGroup.ts';
import { getMuscleGroups } from './getMuscleGroups.ts';
import { createMuscleGroup } from './createMuscleGroup.ts';
import { updateMuscleGroup } from './updateFunction.ts';
import { deleteMuscleGroup } from './deleteMuscleGroup.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: CORS_HEADERS,
    });
  }

  try {
    const id = getMuscleGroupId(req);

    switch (req.method) {
      case 'GET':
        return id
          ? await getMuscleGroup(supabase, id)
          : await getMuscleGroups(supabase, req);

      case 'POST':
        return await createMuscleGroup(supabase, req);

      case 'PUT':
        if (!id) return response({ error: 'Muscle group ID is required' }, 400);
        return await updateMuscleGroup(supabase, req, id);

      case 'DELETE':
        if (!id) return response({ error: 'Muscle group ID is required' }, 400);
        return await deleteMuscleGroup(supabase, id);

      default:
        return response({ error: 'Method not allowed' }, 405);
    }
  } catch (error) {
    console.error(error);
    return response({ error: 'Internal server error' }, 500);
  }
});
