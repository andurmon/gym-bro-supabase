import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 *
 * @param id
 * @param imagePath
 * @returns
 */
export async function updateExercise(
  id: string,
  imagePath: string
): Promise<any> {
  console.log('UPDATE EXERCISE id: ', id);
  console.log('UPDATE EXERCISE imagePath: ', imagePath);
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const exercise_update = {
    image_url: imagePath ?? null,
  };

  const { data, error } = await supabase
    .from('exercises')
    .update(exercise_update)
    .eq('id', id);

  if (error) {
    if (error.code === 'PGRST116') {
      return { error: 'Exercise not found', status: 404 };
    }

    console.error(error);

    return { error: 'Failed to update exercise', status: 500 };
  }

  return data;
}
