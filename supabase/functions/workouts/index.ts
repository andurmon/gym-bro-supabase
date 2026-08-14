import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { CORS_HEADERS } from '../_shared/constants.ts';
import { response } from '../_shared/utils.ts';
import { getWorkoutId } from './constants.ts';

import { getWorkout } from './getWorkout.ts';
import { getWorkouts } from './getWorkouts.ts';
import { createWorkout } from './createWorkout.ts';
import { updateWorkout } from './updateFunction.ts';
import { deleteWorkout } from './deleteWorkout.ts';

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
