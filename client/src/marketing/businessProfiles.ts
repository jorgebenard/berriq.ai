// Las fichas y recorridos solo se activan con capacidades verificadas por berriq.
// No cargar aquí hipótesis ni ejemplos como si fueran funciones confirmadas.
export type BusinessSelection = { industryId: string; businessName: string };
export type JourneyId = 'servicios' | 'membresias' | 'productos' | 'sedes';
export type BusinessStep = {
  label: string;
  title: string;
  description: string;
  fields: [string, string][];
  next: string;
};
export type VerifiedBusinessProfile = BusinessSelection & {
  headline: string;
  description: string;
  exampleButtonLabel: string;
  tasks: string[];
  journeyId: JourneyId;
  steps: BusinessStep[];
  verificationSource: string;
};

// Sin evidencia de producto, ninguna ficha se marca como verificada.
export const verifiedBusinessProfiles: VerifiedBusinessProfile[] = [];

export function getVerifiedBusinessProfile(selection: BusinessSelection | null): VerifiedBusinessProfile | undefined {
  if (!selection) return undefined;
  return verifiedBusinessProfiles.find((item) =>
    item.industryId === selection.industryId &&
    item.businessName === selection.businessName &&
    item.verificationSource.trim().length > 0 &&
    item.headline.trim().length > 0 &&
    item.description.trim().length > 0 &&
    item.exampleButtonLabel.trim().length > 0 &&
    item.tasks.length >= 3 && item.tasks.length <= 4 && item.tasks.every((task) => task.trim().length > 0) &&
    item.steps.length === 4 && item.steps.every((step) => step.label.trim().length > 0 && step.title.trim().length > 0 && step.description.trim().length > 0),
  );
}

// Preguntas sobre la operación del visitante, no declaraciones de capacidades de berriq.
export const industryConversation: Record<string, string> = {
  health: '¿Cómo coordinas la atención administrativa, las citas y los cobros en tu centro?',
  fitness: '¿Qué papel tienen las clases, las membresías y las rutinas en tu operación?',
  beauty: '¿Cómo organizas las citas, los servicios y el seguimiento de tu clientela?',
  education: '¿Cómo organizas las inscripciones, la oferta y las actividades de tu centro educativo?',
  hospitality: '¿Cómo coordinas las solicitudes, las reservas y la atención a tus huéspedes?',
  retail: '¿Cómo organizas el surtido, el inventario, la venta y la reposición?',
  marketplaces: '¿Cómo coordinas la oferta y la relación entre quienes participan en tu plataforma?',
  property: '¿Cómo organizas la atención a clientes y el uso de tus espacios o propiedades?',
  food: '¿Cómo coordinas las compras, la cocina y el servicio en tu operación?',
  professional: '¿Cómo organizas tus clientes, proyectos y entregables?',
  sports: '¿Cómo coordinas tus actividades, horarios y espacios para atender a tus participantes?',
  events: '¿Cómo coordinas la planeación, la producción y los espacios de tus proyectos?',
  pets: '¿Cómo organizas la atención, las citas y los servicios para mascotas?',
  technical: '¿Cómo coordinas las solicitudes, visitas y seguimiento de tus servicios?',
  logistics: '¿Cómo coordinas el almacenamiento, el movimiento y la distribución en tu operación?',
  franchises: '¿Cómo coordinas a tus equipos y ubicaciones dentro de la organización?',
};
