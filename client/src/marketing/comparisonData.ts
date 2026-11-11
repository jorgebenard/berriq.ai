export type ComparisonGroupId = 'crm' | 'spreadsheets' | 'tasks';
export type CandidateAppId = 'crm' | 'activities' | 'memberships' | 'billing' | 'inventory' | 'employees';

export interface ComparisonTool {
  id: string;
  name: string;
  label: string;
  /** Solo archivos de marca oficiales o proporcionados; null muestra el nombre. */
  logo: string | null;
  group: ComparisonGroupId | null;
  visible: boolean;
}

export interface ComparisonGroup {
  id: ComparisonGroupId;
  label: string;
  note?: string;
  appIds: readonly CandidateAppId[];
}

/** Las opciones ocultas no se publican hasta validar el alcance correspondiente. */
export const comparisonTools: readonly ComparisonTool[] = [
  { id: 'hubspot', name: 'HubSpot', label: 'Clientes y ventas', logo: null, group: 'crm', visible: true },
  { id: 'pipedrive', name: 'Pipedrive', label: 'Seguimiento comercial', logo: null, group: 'crm', visible: true },
  { id: 'zoho-crm', name: 'Zoho CRM', label: 'Gestión de clientes', logo: '/brand/tools/zoho-crm.png', group: 'crm', visible: true },
  { id: 'excel', name: 'Excel', label: 'Control administrativo', logo: null, group: 'spreadsheets', visible: true },
  { id: 'google-sheets', name: 'Google Sheets', label: 'Hojas compartidas', logo: null, group: 'spreadsheets', visible: true },
  { id: 'trello', name: 'Trello', label: 'Tareas y pendientes', logo: '/brand/tools/trello.svg', group: 'tasks', visible: true },
  { id: 'asana', name: 'Asana', label: 'Coordinación del equipo', logo: '/brand/tools/asana.webp', group: 'tasks', visible: true },
  { id: 'monday', name: 'monday.com', label: 'Gestión del trabajo', logo: '/brand/tools/monday.png', group: 'tasks', visible: true },
  { id: 'calendly', name: 'Calendly', label: 'Citas y disponibilidad', logo: null, group: null, visible: false },
  { id: 'skedda', name: 'Skedda', label: 'Reservas de espacios', logo: null, group: null, visible: false },
  { id: 'docusign', name: 'DocuSign', label: 'Firma electrónica', logo: null, group: null, visible: false },
];

/** Procesos de las herramientas elegidas, no afirmaciones de disponibilidad en berriq. */
export const comparisonGroups: readonly ComparisonGroup[] = [
  {
    id: 'crm',
    label: 'Clientes, oportunidades y seguimiento comercial',
    appIds: ['crm', 'activities'],
  },
  {
    id: 'spreadsheets',
    label: 'Registros de clientes, vigencias, cobros e inventario',
    note: 'Según el uso que das a tus hojas de cálculo',
    appIds: ['crm', 'memberships', 'billing', 'inventory'],
  },
  {
    id: 'tasks',
    label: 'Tareas, pendientes y responsables',
    appIds: ['activities', 'employees'],
  },
];

/** Orden editorial estable; omite IDs desconocidos, ocultos o repetidos. */
export function getSelectedComparisonTools(selectedIds: readonly string[]): ComparisonTool[] {
  const selected = new Set(selectedIds);
  return comparisonTools.filter((tool) => tool.visible && selected.has(tool.id));
}

/** Devuelve cada grupo una sola vez y en el orden definido en comparisonGroups. */
export function getComparisonGroups(selectedIds: readonly string[]): ComparisonGroup[] {
  const groupIds = new Set(getSelectedComparisonTools(selectedIds).map((tool) => tool.group));
  return comparisonGroups.filter((group) => groupIds.has(group.id));
}

/** IDs candidatos, no una garantía de funciones disponibles, sin duplicados y en orden estable. */
export function getCandidateAppIds(groups: readonly ComparisonGroup[]): CandidateAppId[] {
  const selectedGroups = new Set(groups.map((group) => group.id));
  const appIds = new Set<CandidateAppId>();
  for (const group of comparisonGroups) {
    if (selectedGroups.has(group.id)) {
      for (const id of group.appIds) appIds.add(id);
    }
  }
  return [...appIds];
}
