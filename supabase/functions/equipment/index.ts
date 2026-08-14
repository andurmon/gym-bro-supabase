import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { CORS_HEADERS } from '../_shared/constants.ts';
import { response } from '../_shared/utils.ts';
import { getEquipmentId } from './constants.ts';

import { getEquipment } from './getEquipment.ts';
import { getEquipments } from './getEquipments.ts';
import { createEquipment } from './createEquipment.ts';
import { updateEquipment } from './updateFunction.ts';
import { deleteEquipment } from './deleteEquipment.ts';

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
    const id = getEquipmentId(req);

    switch (req.method) {
      case 'GET':
        return id
          ? await getEquipment(supabase, id)
          : await getEquipments(supabase, req);

      case 'POST':
        return await createEquipment(supabase, req);

      case 'PUT':
        if (!id) return response({ error: 'Equipment ID is required' }, 400);
        return await updateEquipment(supabase, req, id);

      case 'DELETE':
        if (!id) return response({ error: 'Equipment ID is required' }, 400);
        return await deleteEquipment(supabase, id);

      default:
        return response({ error: 'Method not allowed' }, 405);
    }
  } catch (error) {
    console.error(error);
    return response({ error: 'Internal server error' }, 500);
  }
});
