export function getEquipmentId(req: Request): string | null {
  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);

  return parts.length > 1 ? parts[parts.length - 1] : null;
}

export interface Equipment {
  id?: string;
  name?: string;
}

export const TABLE_NAME = 'equipment';

export const mapEquipment = (equipment: any): Equipment => ({
  id: equipment?.id,
  name: equipment?.name,
});

export const mapEquipments = (equipments: any[]): Equipment[] =>
  equipments.map(mapEquipment);
