import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 *
 * @param supabase
 * @param req
 * @param id
 * @returns
 */
export async function updateExercise(
    id: string,
    imagePath: string,
): Promise<any> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const exercise_update = {
    image_url: imagePath ?? null,
  };

  const { data, error } = await supabase
    .from("exercises")
    .update(exercise_update)
    .eq('id', id)
    .select(
      `
      id,
      created_at,
      name,
      key,
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
      return {{ error: 'Exercise not found' }, status: 404};
    }

    console.error(error);

    return {{ error: 'Failed to update exercise' }, status: 500};
  }

  return data;
}
