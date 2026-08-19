import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { CORS_HEADERS } from '../_shared/constants.ts';
import { response } from '../_shared/utils.ts';
import { getExerciseId } from './constants.ts';

import { getExercise } from './getExercise.ts';
import { getExercises } from './getExercises.ts';
import { createExercise } from './createExercise.ts';
import { updateExercise } from './updateExercise.ts';
import { deleteExercise } from './deleteExercise.ts';

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
    const id = getExerciseId(req);

    switch (req.method) {
      case 'GET':
        return id
          ? await getExercise(supabase, id)
          : await getExercises(supabase, req);

      case 'POST':
        return await createExercise(supabase, req);

      case 'PUT':
        if (!id) return response({ error: 'Exercise ID is required' }, 400);
        return await updateExercise(supabase, req, id);

      case 'DELETE':
        if (!id) return response({ error: 'Exercise ID is required' }, 400);
        return await deleteExercise(supabase, id);

      default:
        return response({ error: 'Method not allowed' }, 405);
    }
  } catch (error) {
    console.error(error);
    return response({ error: 'Internal server error' }, 500);
  }
});
