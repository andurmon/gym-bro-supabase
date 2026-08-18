/**
 *
 * @param req
 * @returns
 */
export function getExerciseId(req: Request): string | null {
  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);

  return parts.length > 1 ? parts[parts.length - 1] : null;
}

export interface Exercise {
  id?: string;
  name: string;
  key: string;
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

export const TABLE_NAME = 'exercises';

export const mapExercise = (exercise: any): Exercise => ({
  id: exercise?.id,
  name: exercise?.name,
  key: exercise?.key,
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

export const mapExercises = (exercises: any[]): Exercise[] =>
  exercises.map(mapExercise);
