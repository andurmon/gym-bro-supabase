export function getMuscleGroupId(req: Request): string | null {
  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);

  return parts.length > 1 ? parts[parts.length - 1] : null;
}

export interface MuscleGroup {
  id?: string;
  name: string;
  key: string;
}

export const TABLE_NAME = 'muscle_groups';
