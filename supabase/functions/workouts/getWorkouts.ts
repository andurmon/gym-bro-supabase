import { response } from '../_shared/utils.ts';

const TABLE_NAME = 'workouts';

/**
 * @param supabase
 * @param req
 * @returns
 */
export async function getWorkouts(
  supabase: any,
  req: Request
): Promise<Response> {
  const url = new URL(req.url);

  const search = url.searchParams.get('search');
  const category = url.searchParams.get('category');
  const typeOfTraining = url.searchParams.get('typeOfTraining');
  const expand = url.searchParams.get('expand');

  let workoutsQuery = expand
    ? supabase
        .from(TABLE_NAME)
        .select(
          ` id,
            name,
            description,
            category,
            type_of_training,
            key,
            created_at,
            workout_exercise (
                id,
                sets,
                reps,
                workout_sequence_id,
                exercises (
                    id,
                    name,
                    description,
                    image_url,
                    muscle_group_id,
                    equipment_id
                )
            )`
        )
        .order('name', { ascending: true })
    : supabase
        .from(TABLE_NAME)
        .select(`id, created_at, name, description, category, type_of_training`)
        .order('name', { ascending: true });

  if (search) {
    workoutsQuery = workoutsQuery.ilike('name', `%${search}%`);
  }

  if (category) {
    workoutsQuery = workoutsQuery.eq('category', category);
  }

  if (typeOfTraining) {
    workoutsQuery = workoutsQuery.eq('type_of_training', typeOfTraining);
  }

  const { data, error } = await workoutsQuery;
  if (error) {
    console.error(error);
    return response({ error: 'Failed to retrieve workouts' }, 500);
  }

  return response(data);
}
