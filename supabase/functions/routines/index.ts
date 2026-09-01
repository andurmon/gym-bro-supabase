import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { CORS_HEADERS } from '../_shared/constants.ts';
import { response } from '../_shared/utils.ts';
import { getRoutines } from './getRoutines.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: CORS_HEADERS,
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getRoutines(supabase, req);

      default:
        return response({ error: 'Method not allowed' }, 405);
    }
  } catch (error) {
    console.error(error);
    return response({ error: 'Internal server error' }, 500);
  }
});
