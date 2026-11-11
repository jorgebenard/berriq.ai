import { describe, expect, it } from 'vitest';
import {
  comparisonTools,
  getCandidateAppIds,
  getComparisonGroups,
  getSelectedComparisonTools,
} from '../client/src/marketing/comparisonData';

describe('comparación de herramientas existentes', () => {
  it('muestra ocho herramientas y oculta las que necesitan validación adicional', () => {
    expect(comparisonTools.filter((item) => item.visible).map((item) => item.name)).toEqual([
      'HubSpot', 'Pipedrive', 'Zoho CRM', 'Excel', 'Google Sheets', 'Trello', 'Asana', 'monday.com',
    ]);
    expect(comparisonTools.filter((item) => !item.visible).map((item) => item.name)).toEqual(['Calendly', 'Skedda', 'DocuSign']);
    expect(getSelectedComparisonTools(['calendly', 'skedda', 'docusign'])).toEqual([]);
  });

  it('parte de una selección vacía y agrupa procesos sin repetirlos', () => {
    expect(getComparisonGroups([])).toEqual([]);
    const groups = getComparisonGroups(['hubspot', 'pipedrive', 'zoho-crm', 'excel', 'google-sheets', 'trello', 'asana', 'monday']);
    expect(groups.map((group) => group.id)).toEqual(['crm', 'spreadsheets', 'tasks']);
    expect(groups.find((group) => group.id === 'spreadsheets')?.note).toBe('Según el uso que das a tus hojas de cálculo');
    expect(getCandidateAppIds(groups)).toEqual(['crm', 'activities', 'memberships', 'billing', 'inventory', 'employees']);
  });

  it('no duplica opciones, ignora valores desconocidos y respeta la deselección', () => {
    expect(getSelectedComparisonTools(['excel', 'excel', 'unknown']).map((tool) => tool.name)).toEqual(['Excel']);
    expect(getComparisonGroups(['pipedrive']).map((group) => group.id)).toEqual(['crm']);
    expect(getComparisonGroups(['pipedrive', 'trello']).map((group) => group.id)).toEqual(['crm', 'tasks']);
    expect(getComparisonGroups(['trello']).map((group) => group.id)).toEqual(['tasks']);
    expect(getCandidateAppIds([])).toEqual([]);
  });
});
