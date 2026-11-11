export type PlanId = 'start' | 'grow' | 'enterprise';
export type PlanAction = 'trial' | 'contact';

export interface CommercialPlan {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  includedUsers: number;
  includedLocations: number;
  message: string;
  actionLabel: string;
  action: PlanAction;
  recommended?: boolean;
}

/** Valores y condiciones proporcionados en el brief comercial. */
export const COMMERCIAL_CONFIG = {
  currency: 'MXN',
  additionalUsers: { quantity: 5, monthlyPrice: 490 },
  additionalLocation: { monthlyPrice: 790 },
  customMessage: 'Multiempresa, redes de franquicias e integraciones especiales: berriq a medida.',
  conditions: [
    'Sede adicional no incluye usuarios.',
    'Clientes del portal no equivalen a usuarios administrativos.',
    'Aplican capacidades y condiciones del plan.',
    'Servicios externos y consumos adicionales se informan por separado.',
  ],
} as const;

export const COMMERCIAL_PLANS: readonly CommercialPlan[] = [
  {
    id: 'start',
    name: 'berriq start',
    monthlyPrice: 1490,
    includedUsers: 5,
    includedLocations: 1,
    message: 'Organiza tu negocio desde un solo lugar.',
    actionLabel: 'Probar start',
    action: 'trial',
  },
  {
    id: 'grow',
    name: 'berriq grow',
    monthlyPrice: 2990,
    includedUsers: 15,
    includedLocations: 3,
    message: 'Conecta a tu equipo y coordina tu operación.',
    actionLabel: 'Probar grow',
    action: 'trial',
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'berriq enterprise',
    monthlyPrice: 5990,
    includedUsers: 30,
    includedLocations: 5,
    message: 'Dirige tus sedes con visibilidad y control.',
    actionLabel: 'Solicitar demostración',
    action: 'contact',
  },
];

export interface CapacityNeeds {
  users: number;
  locations: number;
  multiCompany?: boolean;
  advancedControl?: boolean;
}

export interface CapacityOption {
  plan: CommercialPlan;
  additionalUserBlocks: number;
  additionalUsers: number;
  additionalUsersPrice: number;
  additionalLocations: number;
  additionalLocationsPrice: number;
  total: number;
}

export interface CapacityQuote {
  options: CapacityOption[];
  /** Incluye todos los empates, sin favorecer el plan recomendado. */
  cheapestOptions: CapacityOption[];
  requiresCustomEvaluation: boolean;
  advancedControlPending: boolean;
}

/**
 * Calcula las tres alternativas por capacidad, sin IVA. No determina el alcance
 * funcional: multiempresa requiere evaluación y el control avanzado debe validarse.
 * Usuarios y sedes deben ser enteros positivos y los importes, enteros seguros.
 */
export function calculateCapacityQuote({
  users,
  locations,
  multiCompany = false,
  advancedControl = false,
}: CapacityNeeds): CapacityQuote {
  if (!Number.isSafeInteger(users) || users < 1 || !Number.isSafeInteger(locations) || locations < 1) {
    throw new RangeError('Introduce cantidades enteras positivas de usuarios y sedes.');
  }

  const options = COMMERCIAL_PLANS.map((plan): CapacityOption => {
    const additionalUserBlocks = Math.ceil(
      Math.max(0, users - plan.includedUsers) / COMMERCIAL_CONFIG.additionalUsers.quantity,
    );
    const additionalUsers = additionalUserBlocks * COMMERCIAL_CONFIG.additionalUsers.quantity;
    const additionalUsersPrice = additionalUserBlocks * COMMERCIAL_CONFIG.additionalUsers.monthlyPrice;
    const additionalLocations = Math.max(0, locations - plan.includedLocations);
    const additionalLocationsPrice = additionalLocations * COMMERCIAL_CONFIG.additionalLocation.monthlyPrice;
    const total = plan.monthlyPrice + additionalUsersPrice + additionalLocationsPrice;
    if (!Number.isSafeInteger(additionalUsers) || !Number.isSafeInteger(total)) {
      throw new RangeError('Las cantidades son demasiado grandes para calcular una estimación.');
    }
    return {
      plan,
      additionalUserBlocks,
      additionalUsers,
      additionalUsersPrice,
      additionalLocations,
      additionalLocationsPrice,
      total,
    };
  });
  const lowestTotal = Math.min(...options.map((option) => option.total));

  return {
    options,
    cheapestOptions: options.filter((option) => option.total === lowestTotal),
    requiresCustomEvaluation: multiCompany,
    advancedControlPending: advancedControl,
  };
}

export function formatCommercialPrice(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: COMMERCIAL_CONFIG.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
