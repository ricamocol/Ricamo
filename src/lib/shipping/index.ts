export interface CourierResult {
  courier: "Coordinadora" | "Interrapidísimo";
  cost: number;
}

// Ciudades con cobertura Coordinadora — editable desde admin/configuracion en Fase 2
const CIUDADES_COORDINADORA = new Set([
  "bogota", "medellin", "cali", "barranquilla", "cartagena",
  "bucaramanga", "pereira", "manizales", "ibague", "villavicencio",
  "santa marta", "monteria", "cucuta", "pasto", "armenia", "neiva",
]);

export const COSTO_COORDINADORA = 17_000;
export const COSTO_INTERRAPIDISIMO = 20_000;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function getCourier(city: string): CourierResult {
  if (CIUDADES_COORDINADORA.has(normalize(city))) {
    return { courier: "Coordinadora", cost: COSTO_COORDINADORA };
  }
  return { courier: "Interrapidísimo", cost: COSTO_INTERRAPIDISIMO };
}
