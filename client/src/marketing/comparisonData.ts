export type ComparisonCategoryId =
  | 'clients-sales'
  | 'tasks-coordination'
  | 'sheets-records'
  | 'appointments-bookings'
  | 'memberships-subscriptions'
  | 'commerce-inventory'
  | 'staff-recruitment'
  | 'invoicing-expenses'
  | 'contracts-signature';

export interface VerifiedToolProcess {
  processId: string;
  verified: boolean;
  evidence: string;
  /** Uso específico revisado, apto para «Si utilizas [herramienta] [usage]...». */
  usage: string;
}

export interface ComparisonTool {
  id: string;
  name: string;
  category: ComparisonCategoryId;
  label: string;
  /** Ruta local de la imagen; null utiliza un distintivo genérico. */
  logo: string | null;
  /** Clasificación del archivo, independiente de las capacidades del producto. */
  logoKind?: 'official' | 'reference' | 'illustration';
  /** Relaciones propuestas internamente; no demuestran disponibilidad en berriq. */
  processIds: readonly string[];
  /** Evidencia independiente de cada pareja herramienta-proceso. */
  verifiedProcesses?: readonly VerifiedToolProcess[];
  /** Autoriza la tarjeta informativa, sin implicar ninguna función verificada. */
  referenceVisible: boolean;
}

export interface ComparisonProcess {
  id: string;
  label: string;
  description: string;
  appId: string;
  appName: string;
  verified: boolean;
  evidence: string | null;
}

export interface ComparisonResult {
  id: string;
  label: string;
  description: string;
  appId: string;
  appName: string;
  relatedToolNames: string[];
  relatedUsages: { toolName: string; usage: string }[];
}

export const comparisonCategories: readonly { id: ComparisonCategoryId; label: string }[] = [
  { id: 'clients-sales', label: 'Clientes y ventas' },
  { id: 'tasks-coordination', label: 'Tareas y coordinación' },
  { id: 'sheets-records', label: 'Hojas y registros' },
  { id: 'appointments-bookings', label: 'Citas y reservas' },
  { id: 'memberships-subscriptions', label: 'Membresías y suscripciones' },
  { id: 'commerce-inventory', label: 'Comercio e inventario' },
  { id: 'staff-recruitment', label: 'Personal y reclutamiento' },
  { id: 'invoicing-expenses', label: 'Facturación y gastos' },
  { id: 'contracts-signature', label: 'Contratos y firma' },
];

/**
 * Catálogo de referencias, no una lista de productos reemplazados ni de funciones
 * confirmadas. Las primeras 16 opciones visibles son el orden editorial solicitado.
 */
export const comparisonTools: readonly ComparisonTool[] = [
  { id: 'hubspot', name: 'HubSpot', category: 'clients-sales', label: 'Clientes y ventas', logo: '/brand/tools/reference-hubspot.svg', logoKind: 'reference', processIds: ['sales-follow-up'], referenceVisible: true },
  { id: 'salesforce', name: 'Salesforce', category: 'clients-sales', label: 'Seguimiento comercial', logo: '/brand/tools/site-salesforce.png', logoKind: 'reference', processIds: ['sales-follow-up'], referenceVisible: true },
  { id: 'pipedrive', name: 'Pipedrive', category: 'clients-sales', label: 'Seguimiento comercial', logo: '/brand/tools/reference-pipedrive.svg', logoKind: 'illustration', processIds: ['sales-follow-up'], referenceVisible: true },
  { id: 'zoho-crm', name: 'Zoho CRM', category: 'clients-sales', label: 'Gestión de clientes', logo: '/brand/tools/zoho-crm.png', logoKind: 'official', processIds: ['sales-follow-up'], referenceVisible: true },
  { id: 'freshsales', name: 'Freshsales', category: 'clients-sales', label: 'Seguimiento comercial', logo: '/brand/tools/reference-freshsales.svg', logoKind: 'illustration', processIds: ['sales-follow-up'], referenceVisible: true },
  { id: 'monday-sales-crm', name: 'monday sales CRM', category: 'clients-sales', label: 'Seguimiento comercial', logo: '/brand/tools/monday.png', logoKind: 'reference', processIds: ['sales-follow-up'], referenceVisible: true },

  { id: 'trello', name: 'Trello', category: 'tasks-coordination', label: 'Tareas y pendientes', logo: '/brand/tools/trello-icon.svg', logoKind: 'official', processIds: ['task-coordination'], referenceVisible: true },
  { id: 'asana', name: 'Asana', category: 'tasks-coordination', label: 'Coordinación del equipo', logo: '/brand/tools/asana.webp', logoKind: 'official', processIds: ['task-coordination'], referenceVisible: true },
  { id: 'monday-work-management', name: 'monday work management', category: 'tasks-coordination', label: 'Tareas y coordinación', logo: '/brand/tools/monday.png', logoKind: 'reference', processIds: ['task-coordination'], referenceVisible: true },
  { id: 'clickup', name: 'ClickUp', category: 'tasks-coordination', label: 'Tareas y coordinación', logo: '/brand/tools/reference-clickup.svg', logoKind: 'reference', processIds: ['task-coordination'], referenceVisible: true },
  { id: 'todoist', name: 'Todoist', category: 'tasks-coordination', label: 'Tareas y pendientes', logo: '/brand/tools/todoist-icon.svg', logoKind: 'official', processIds: ['task-coordination'], referenceVisible: true },
  { id: 'notion', name: 'Notion', category: 'tasks-coordination', label: 'Seguimiento de tareas', logo: '/brand/tools/reference-notion.svg', logoKind: 'reference', processIds: ['task-coordination'], referenceVisible: true },

  { id: 'excel', name: 'Microsoft Excel', category: 'sheets-records', label: 'Control de cobros', logo: '/brand/tools/reference-excel.svg', logoKind: 'illustration', processIds: ['payment-follow-up'], referenceVisible: true },
  { id: 'google-sheets', name: 'Google Sheets', category: 'sheets-records', label: 'Control de cobros', logo: '/brand/tools/reference-google-sheets.svg', logoKind: 'reference', processIds: ['payment-follow-up'], referenceVisible: true },
  { id: 'airtable', name: 'Airtable', category: 'sheets-records', label: 'Seguimiento de tareas', logo: '/brand/tools/reference-airtable.svg', logoKind: 'reference', processIds: ['task-coordination'], referenceVisible: true },

  { id: 'mindbody', name: 'Mindbody', category: 'memberships-subscriptions', label: 'Membresías y reservas', logo: '/brand/tools/reference-mindbody.svg', logoKind: 'illustration', processIds: ['memberships', 'booking'], referenceVisible: true },

  { id: 'calendly', name: 'Calendly', category: 'appointments-bookings', label: 'Citas y disponibilidad', logo: '/brand/tools/reference-calendly.svg', logoKind: 'reference', processIds: ['booking'], referenceVisible: true },
  { id: 'acuity-scheduling', name: 'Acuity Scheduling', category: 'appointments-bookings', label: 'Citas y reservas', logo: '/brand/tools/site-acuity-scheduling.png', logoKind: 'reference', processIds: ['booking'], referenceVisible: true },
  { id: 'simplybook-me', name: 'SimplyBook.me', category: 'appointments-bookings', label: 'Citas y reservas', logo: '/brand/tools/site-simplybook-me.png', logoKind: 'reference', processIds: ['booking'], referenceVisible: true },
  { id: 'zoho-bookings', name: 'Zoho Bookings', category: 'appointments-bookings', label: 'Citas y reservas', logo: '/brand/tools/zoho-bookings.png', logoKind: 'official', processIds: ['booking'], referenceVisible: true },
  { id: 'skedda', name: 'Skedda', category: 'appointments-bookings', label: 'Reservas de espacios', logo: '/brand/tools/site-skedda.png', logoKind: 'reference', processIds: ['booking'], referenceVisible: true },

  { id: 'glofox', name: 'Glofox', category: 'memberships-subscriptions', label: 'Membresías y reservas', logo: '/brand/tools/site-glofox.png', logoKind: 'reference', processIds: ['memberships', 'booking'], referenceVisible: true },
  { id: 'gymdesk', name: 'Gymdesk', category: 'memberships-subscriptions', label: 'Membresías', logo: '/brand/tools/reference-gymdesk.svg', logoKind: 'illustration', processIds: ['memberships'], referenceVisible: true },
  { id: 'wildapricot', name: 'WildApricot', category: 'memberships-subscriptions', label: 'Membresías', logo: '/brand/tools/reference-wildapricot.svg', logoKind: 'illustration', processIds: ['memberships'], referenceVisible: true },
  { id: 'zoho-billing', name: 'Zoho Billing', category: 'memberships-subscriptions', label: 'Suscripciones y cobros', logo: '/brand/tools/zoho-billing.png', logoKind: 'reference', processIds: ['memberships', 'payment-follow-up'], referenceVisible: true },

  { id: 'shopify', name: 'Shopify', category: 'commerce-inventory', label: 'Catálogo y pedidos', logo: '/brand/tools/reference-shopify.svg', logoKind: 'reference', processIds: ['catalog-orders', 'inventory'], referenceVisible: true },
  { id: 'woocommerce', name: 'WooCommerce', category: 'commerce-inventory', label: 'Catálogo y pedidos', logo: '/brand/tools/reference-woocommerce.svg', logoKind: 'reference', processIds: ['catalog-orders', 'inventory'], referenceVisible: true },
  { id: 'zoho-inventory', name: 'Zoho Inventory', category: 'commerce-inventory', label: 'Inventario', logo: '/brand/tools/zoho-inventory.png', logoKind: 'official', processIds: ['inventory'], referenceVisible: true },
  { id: 'inflow-inventory', name: 'inFlow Inventory', category: 'commerce-inventory', label: 'Inventario', logo: '/brand/tools/site-inflow-inventory.png', logoKind: 'reference', processIds: ['inventory'], referenceVisible: true },

  { id: 'factorial', name: 'Factorial', category: 'staff-recruitment', label: 'Gestión de personal', logo: '/brand/tools/reference-factorial.svg', logoKind: 'illustration', processIds: ['employee-records'], referenceVisible: true },
  { id: 'bamboohr', name: 'BambooHR', category: 'staff-recruitment', label: 'Gestión de personal', logo: '/brand/tools/site-bamboohr.png', logoKind: 'reference', processIds: ['employee-records'], referenceVisible: true },
  { id: 'zoho-people', name: 'Zoho People', category: 'staff-recruitment', label: 'Gestión de personal', logo: '/brand/tools/zoho-people.png', logoKind: 'official', processIds: ['employee-records'], referenceVisible: true },
  { id: 'zoho-recruit', name: 'Zoho Recruit', category: 'staff-recruitment', label: 'Reclutamiento', logo: '/brand/tools/zoho-recruit.png', logoKind: 'official', processIds: ['recruitment'], referenceVisible: true },
  { id: 'workable', name: 'Workable', category: 'staff-recruitment', label: 'Reclutamiento', logo: '/brand/tools/site-workable.png', logoKind: 'reference', processIds: ['recruitment'], referenceVisible: true },

  { id: 'zoho-invoice', name: 'Zoho Invoice', category: 'invoicing-expenses', label: 'Facturación y cobros', logo: '/brand/tools/zoho-invoice.png', logoKind: 'official', processIds: ['payment-follow-up'], referenceVisible: true },
  { id: 'freshbooks', name: 'FreshBooks', category: 'invoicing-expenses', label: 'Facturación y cobros', logo: '/brand/tools/site-freshbooks.png', logoKind: 'reference', processIds: ['payment-follow-up'], referenceVisible: true },
  { id: 'expensify', name: 'Expensify', category: 'invoicing-expenses', label: 'Gastos', logo: '/brand/tools/reference-expensify.svg', logoKind: 'reference', processIds: [], referenceVisible: true },

  // Solo una comprobación específica de firma electrónica puede habilitar estas
  // referencias; guardar o generar contratos no es equivalente a firmarlos.
  { id: 'docusign', name: 'DocuSign', category: 'contracts-signature', label: 'Firma electrónica', logo: '/brand/tools/site-docusign.png', logoKind: 'reference', processIds: ['electronic-signature'], referenceVisible: false },
  { id: 'dropbox-sign', name: 'Dropbox Sign', category: 'contracts-signature', label: 'Firma electrónica', logo: '/brand/tools/reference-dropbox-sign.svg', logoKind: 'illustration', processIds: ['electronic-signature'], referenceVisible: false },
  { id: 'pandadoc', name: 'PandaDoc', category: 'contracts-signature', label: 'Firma electrónica', logo: '/brand/tools/reference-pandadoc.svg', logoKind: 'illustration', processIds: ['electronic-signature'], referenceVisible: false },
];

/**
 * Posibles mapeos para evaluar, no capacidades de berriq. Ninguno cuenta con
 * evidencia verificada; por tanto no pueden producir resultados de comparación.
 */
export const comparisonProcesses: readonly ComparisonProcess[] = [
  { id: 'sales-follow-up', label: 'Seguimiento comercial', description: 'Contactos, oportunidades y actividades de venta.', appId: 'crm', appName: 'CRM y oportunidades', verified: false, evidence: null },
  { id: 'task-coordination', label: 'Tareas y seguimiento', description: 'Tareas, pendientes y seguimiento del equipo.', appId: 'activities', appName: 'Actividades y seguimiento', verified: false, evidence: null },
  { id: 'payment-follow-up', label: 'Seguimiento de cobros', description: 'Información de facturación y seguimiento de cobros.', appId: 'billing', appName: 'Facturación y cobros', verified: false, evidence: null },
  { id: 'booking', label: 'Reservas y espacios', description: 'Organización de reservas y espacios.', appId: 'booking', appName: 'Reservas y espacios', verified: false, evidence: null },
  { id: 'memberships', label: 'Planes y membresías', description: 'Información de planes y membresías de clientes.', appId: 'memberships', appName: 'Planes y membresías', verified: false, evidence: null },
  { id: 'catalog-orders', label: 'Catálogo y pedidos', description: 'Productos del catálogo y pedidos de clientes.', appId: 'catalog-orders', appName: 'Catálogo y pedidos', verified: false, evidence: null },
  { id: 'inventory', label: 'Inventario', description: 'Información de productos y existencias.', appId: 'inventory', appName: 'Inventario', verified: false, evidence: null },
  { id: 'employee-records', label: 'Información del equipo', description: 'Información de empleados y asistencia.', appId: 'employees', appName: 'Empleados y asistencia', verified: false, evidence: null },
  { id: 'recruitment', label: 'Reclutamiento', description: 'Información de procesos de reclutamiento.', appId: 'talent', appName: 'Reclutamiento y capacitación', verified: false, evidence: null },
  { id: 'electronic-signature', label: 'Firma electrónica', description: 'Firma electrónica de documentos y seguimiento de solicitudes de firma.', appId: 'electronic-signature', appName: 'Firma electrónica', verified: false, evidence: null },
];

/** Una cadena con contenido, no solo espacios. */
function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Devuelve únicamente procesos vinculados a herramientas seleccionadas y con
 * evidencia y campos esenciales completos. Cada relación requiere además su
 * propia verificación, evidencia y uso específico revisado. Las relaciones se
 * deduplican por ID de proceso y nombre, en orden editorial de los datos.
 * Los parámetros de datos opcionales también permiten probar mapeos sintéticos.
 */
export function getVerifiedGroups(
  ids: readonly string[],
  tools: readonly ComparisonTool[] = comparisonTools,
  processes: readonly ComparisonProcess[] = comparisonProcesses,
): ComparisonResult[] {
  const selectedIds = new Set(ids);
  const seenToolIds = new Set<string>();
  const selectedTools = tools.filter((tool) => {
    if (!hasText(tool.id) || !hasText(tool.name) || !selectedIds.has(tool.id)
      || seenToolIds.has(tool.id) || !Array.isArray(tool.processIds)) return false;
    seenToolIds.add(tool.id);
    return true;
  });
  const seenProcessIds = new Set<string>();
  const results: ComparisonResult[] = [];

  for (const process of processes) {
    if (process.verified !== true || !hasText(process.evidence) || !hasText(process.id)
      || !hasText(process.label) || !hasText(process.description) || !hasText(process.appId)
      || !hasText(process.appName)) continue;

    const id = process.id.trim();
    if (seenProcessIds.has(id)) continue;
    const seenToolNames = new Set<string>();
    const relatedUsages: ComparisonResult['relatedUsages'] = [];
    for (const tool of selectedTools) {
      if (!tool.processIds.includes(process.id) || !Array.isArray(tool.verifiedProcesses)) continue;
      const relation = tool.verifiedProcesses.find((entry) => entry != null
        && entry.processId === process.id && entry.verified === true
        && hasText(entry.evidence) && hasText(entry.usage));
      const toolName = tool.name.trim();
      if (!relation || seenToolNames.has(toolName)) continue;
      seenToolNames.add(toolName);
      relatedUsages.push({ toolName, usage: relation.usage.trim() });
    }
    if (relatedUsages.length === 0) continue;

    seenProcessIds.add(id);
    results.push({
      id,
      label: process.label.trim(),
      description: process.description.trim(),
      appId: process.appId.trim(),
      appName: process.appName.trim(),
      relatedToolNames: relatedUsages.map(({ toolName }) => toolName),
      relatedUsages,
    });
  }
  return results;
}

const electronicSignatureToolIds = new Set(['docusign', 'dropbox-sign', 'pandadoc']);

/**
 * Las tarjetas normales son referencias informativas, no pruebas de capacidades.
 * Las tres herramientas de firma requieren evidencia específica tanto del proceso
 * electronic-signature como de su relación individual, incluso si su indicador de
 * referencia se activa por error. Los datos opcionales permiten pruebas sintéticas.
 */
export function getVisibleComparisonTools(
  tools: readonly ComparisonTool[] = comparisonTools,
  processes: readonly ComparisonProcess[] = comparisonProcesses,
): ComparisonTool[] {
  return tools.filter((tool) => electronicSignatureToolIds.has(tool.id)
    ? getVerifiedGroups([tool.id], tools, processes).some((group) => group.id === 'electronic-signature')
    : tool.referenceVisible);
}

/** Conserva el orden editorial y omite IDs desconocidos, ocultos o repetidos. */
export function getSelectedComparisonTools(
  ids: readonly string[],
  tools: readonly ComparisonTool[] = comparisonTools,
  processes: readonly ComparisonProcess[] = comparisonProcesses,
): ComparisonTool[] {
  const selectedIds = new Set(ids);
  return getVisibleComparisonTools(tools, processes).filter((tool) => selectedIds.has(tool.id));
}

/** IDs de las aplicaciones vinculadas a los resultados verificados, sin duplicados. */
export function getCandidateAppIds(groups: readonly ComparisonResult[]): string[] {
  return [...new Set(groups.map((group) => group.appId).filter(hasText).map((id) => id.trim()))];
}

/** Los eventos solo pueden señalar aplicaciones deducidas de relaciones verificadas. */
export function getVerifiedComparisonAppIds(
  detail: unknown,
  tools: readonly ComparisonTool[] = comparisonTools,
  processes: readonly ComparisonProcess[] = comparisonProcesses,
): string[] | null {
  if (!detail || typeof detail !== 'object') return null;
  const { toolIds, processId } = detail as { toolIds?: unknown; processId?: unknown };
  if (!Array.isArray(toolIds) || !toolIds.every((id) => typeof id === 'string')
    || (processId !== undefined && typeof processId !== 'string')) return null;
  const groups = getVerifiedGroups(toolIds, tools, processes);
  return getCandidateAppIds(processId === undefined ? groups : groups.filter((group) => group.id === processId));
}
