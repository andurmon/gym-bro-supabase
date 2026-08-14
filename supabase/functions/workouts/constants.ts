export function getWorkoutId(req: Request): string | null {
  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);

  return parts.length > 1 ? parts[parts.length - 1] : null;
}

export interface Workout {
  id?: string;
  name: string;
  description?: string | null;
  category?: string | null;
  typeOfTraining?: string | null;
}

export enum WorkoutCategory {
  Strength = 'strength',
  Cardio = 'cardio',
  Flexibility = 'flexibility',
  Balance = 'balance',
  Mobility = 'mobility',
}

export enum TypeOfTraining {
  FullBody = 'full_body',
  UpperBody = 'upper_body',
  LowerBody = 'lower_body',
}

export const TABLE_NAME = 'workouts';
