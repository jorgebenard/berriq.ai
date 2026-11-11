import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  comparisonCategories,
  comparisonProcesses,
  comparisonTools,
  getCandidateAppIds,
  getSelectedComparisonTools,
  getVerifiedComparisonAppIds,
  getVerifiedGroups,
  getVisibleComparisonTools,
  type ComparisonCategoryId,
  type ComparisonProcess,
  type ComparisonResult,
  type ComparisonTool,
  type VerifiedToolProcess,
} from '../client/src/marketing/comparisonData';

const expectedCatalog: { id: ComparisonCategoryId; label: string; names: string[] }[] = [
  { id: 'clients-sales', label: 'Clientes y ventas', names: ['HubSpot', 'Salesforce', 'Pipedrive', 'Zoho CRM', 'Freshsales', 'monday sales CRM'] },
  { id: 'tasks-coordination', label: 'Tareas y coordinación', names: ['Trello', 'Asana', 'monday work management', 'ClickUp', 'Todoist', 'Notion'] },
  { id: 'sheets-records', label: 'Hojas y registros', names: ['Microsoft Excel', 'Google Sheets', 'Airtable'] },
  { id: 'appointments-bookings', label: 'Citas y reservas', names: ['Calendly', 'Acuity Scheduling', 'SimplyBook.me', 'Zoho Bookings', 'Skedda'] },
  { id: 'memberships-subscriptions', label: 'Membresías y suscripciones', names: ['Mindbody', 'Glofox', 'Gymdesk', 'WildApricot', 'Zoho Billing'] },
  { id: 'commerce-inventory', label: 'Comercio e inventario', names: ['Shopify', 'WooCommerce', 'Zoho Inventory', 'inFlow Inventory'] },
  { id: 'staff-recruitment', label: 'Personal y reclutamiento', names: ['Factorial', 'BambooHR', 'Zoho People', 'Zoho Recruit', 'Workable'] },
  { id: 'invoicing-expenses', label: 'Facturación y gastos', names: ['Zoho Invoice', 'FreshBooks', 'Expensify'] },
  { id: 'contracts-signature', label: 'Contratos y firma', names: ['DocuSign', 'Dropbox Sign', 'PandaDoc'] },
];

const firstReferenceNames = [
  'HubSpot', 'Salesforce', 'Pipedrive', 'Zoho CRM', 'Freshsales', 'monday sales CRM',
  'Trello', 'Asana', 'monday work management', 'ClickUp', 'Todoist', 'Notion',
  'Microsoft Excel', 'Google Sheets', 'Airtable', 'Mindbody',
];

const signatureIds = ['docusign', 'dropbox-sign', 'pandadoc'];

function syntheticRelation(processId: string, usage: string, overrides: Partial<VerifiedToolProcess> = {}): VerifiedToolProcess {
  return { processId, verified: true, evidence: 'Evidencia sintética de la relación', usage, ...overrides };
}

function syntheticTool(
  id: string, name: string, processIds: readonly string[], verifiedProcesses?: readonly VerifiedToolProcess[],
): ComparisonTool {
  return { id, name, category: 'clients-sales', label: 'Prueba', logo: null, processIds, verifiedProcesses, referenceVisible: true };
}

function syntheticProcess(id: string, overrides: Partial<ComparisonProcess> = {}): ComparisonProcess {
  return {
    id, label: `Proceso ${id}`, description: `Alcance de ${id}`,
    appId: 'app-a', appName: 'Aplicación A', verified: true, evidence: 'Fuente de prueba',
    ...overrides,
  };
}

describe('catálogo de referencias de comparación', () => {
  it('contiene exactamente las nueve categorías y las 40 herramientas solicitadas', () => {
    expect(comparisonCategories).toEqual(expectedCatalog.map(({ id, label }) => ({ id, label })));
    for (const { id, names } of expectedCatalog) {
      expect(comparisonTools.filter((tool) => tool.category === id).map((tool) => tool.name)).toEqual(names);
    }
    expect(comparisonTools).toHaveLength(40);
    expect(new Set(comparisonTools.map((tool) => tool.id)).size).toBe(40);
    expect(new Set(comparisonTools.map((tool) => tool.name)).size).toBe(40);
    expect(new Set(comparisonProcesses.map((process) => process.id)).size).toBe(comparisonProcesses.length);
    const processIds = new Set(comparisonProcesses.map((process) => process.id));
    for (const tool of comparisonTools) {
      expect(tool.label.trim()).not.toBe('');
      expect(expectedCatalog.some((category) => category.id === tool.category)).toBe(true);
      expect(new Set(tool.processIds).size).toBe(tool.processIds.length);
      expect(tool.processIds.every((id) => processIds.has(id))).toBe(true);
    }
  });

  it('mantiene los dos productos monday distintos, con sus procesos correspondientes', () => {
    const sales = comparisonTools.find((tool) => tool.name === 'monday sales CRM')!;
    const work = comparisonTools.find((tool) => tool.name === 'monday work management')!;
    expect(sales.id).not.toBe(work.id);
    expect(sales.category).toBe('clients-sales');
    expect(sales.processIds).toEqual(['sales-follow-up']);
    expect(work.category).toBe('tasks-coordination');
    expect(work.processIds).toEqual(['task-coordination']);
  });

  it('conecta un recurso local y documentado a cada herramienta sin alterar los originales', () => {
    const expectedLogos: Record<string, string> = {
      'Zoho CRM': '/brand/tools/zoho-crm.png',
      'Trello': '/brand/tools/trello-icon.svg',
      'Asana': '/brand/tools/asana.webp',
      'Todoist': '/brand/tools/todoist-icon.svg',
      'monday sales CRM': '/brand/tools/monday.png',
      'monday work management': '/brand/tools/monday.png',
    };
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), 'client/public/brand/tools/logo-manifest.json'), 'utf8')) as {
      id: string; path: string; kind: 'official' | 'reference' | 'illustration'; source: string; note: string;
    }[];
    expect(manifest).toHaveLength(40);
    expect(new Set(manifest.map((entry) => entry.id)).size).toBe(40);
    for (const tool of comparisonTools) {
      const entry = manifest.find((item) => item.id === tool.id);
      expect(entry).toBeDefined();
      expect(tool.logo).toBe(entry!.path);
      expect(tool.logoKind).toBe(entry!.kind);
      expect(entry!.source.trim()).not.toBe('');
      expect(entry!.note.trim()).not.toBe('');
      expect(entry!.path).toMatch(/^\/brand\/tools\/[a-z0-9-]+\.(png|webp|svg)$/);
      const bytes = readFileSync(resolve(process.cwd(), `client/public${entry!.path}`));
      expect(bytes.length).toBeGreaterThan(0);
      if (entry!.path.endsWith('.svg')) {
        const svg = bytes.toString('utf8');
        expect(svg).toMatch(/<svg[\s>]/i);
        expect(svg).not.toMatch(/<script\b|<!DOCTYPE|\bon\w+\s*=|(?:href|src)\s*=\s*['"](?:https?:|\/\/)|url\(\s*['"]?(?:https?:|\/\/)/i);
      }
    }
    for (const [name, path] of Object.entries(expectedLogos)) {
      expect(comparisonTools.find((tool) => tool.name === name)?.logo).toBe(path);
    }

    const sha256: Record<string, string> = {
      'zoho-crm.png': '1d5aebed95e3a862258a58093d0204f506f8a0f6b8c92cdce7c7b45550ac1cc4',
      'trello.svg': '3ce64063e11e8a566d4ba366d43b740c5ae45ecf8b9218e7e48716b5641f3ba2',
      'trello-icon.svg': '596206dcf37504777ff2946a9b7d148bf5fdfba2ae134c64507092b9055fa77b',
      'todoist-icon.svg': '9adff05124fc2e773bcf4c7fff454ce341899d1806782dee543405bd77d53383',
      'asana.webp': '8b274b3a2ae574202623c59e9225d5471e6e372627e7772c5205b5e604117812',
      'monday.png': '5c4b9f19d3097ad6eddbebb364992a0349e59ac0156695447b922fb67e2030cc',
    };
    for (const [file, expectedHash] of Object.entries(sha256)) {
      const bytes = readFileSync(resolve(process.cwd(), 'client/public/brand/tools', file));
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(expectedHash);
    }
  });

  it('muestra 37 referencias informativas, incluidas Calendly y Skedda, y conserva el orden inicial', () => {
    const visible = getVisibleComparisonTools();
    expect(visible).toHaveLength(37);
    expect(visible.slice(0, 16).map((tool) => tool.name)).toEqual(firstReferenceNames);
    expect(visible.map((tool) => tool.id)).toEqual(comparisonTools
      .filter((tool) => !signatureIds.includes(tool.id)).map((tool) => tool.id));
    expect(comparisonTools.filter((tool) => !tool.referenceVisible).map((tool) => tool.id)).toEqual(signatureIds);
    expect(getSelectedComparisonTools(['calendly', 'skedda', ...signatureIds]).map((tool) => tool.name)).toEqual([
      'Calendly', 'Skedda',
    ]);
    expect(getSelectedComparisonTools(['notion', 'hubspot', 'notion', 'unknown', 'monday-sales-crm']).map((tool) => tool.name)).toEqual([
      'HubSpot', 'monday sales CRM', 'Notion',
    ]);
    expect(getSelectedComparisonTools([])).toEqual([]);
  });

  it('mantiene la misma lista de referencias en cualquier entorno', () => {
    const expected = comparisonTools.filter((tool) => !signatureIds.includes(tool.id)).map((tool) => tool.id);
    try {
      for (const mode of ['development', 'production', 'test']) {
        vi.stubEnv('NODE_ENV', mode);
        vi.stubEnv('MODE', mode);
        expect(getVisibleComparisonTools().map((tool) => tool.id)).toEqual(expected);
        expect(getSelectedComparisonTools(comparisonTools.map((tool) => tool.id)).map((tool) => tool.id)).toEqual(expected);
      }
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('mostrar referencias sin evidencia no verifica procesos, relaciones ni aplicaciones', () => {
    expect(comparisonProcesses.every((process) => process.verified === false && process.evidence === null)).toBe(true);
    expect(comparisonTools.every((tool) => !tool.verifiedProcesses?.some((relation) => relation.verified === true))).toBe(true);
    expect(getVisibleComparisonTools()).toHaveLength(37);
    const allIds = comparisonTools.map((tool) => tool.id);
    expect(getSelectedComparisonTools(allIds)).toHaveLength(37);
    expect(getVerifiedGroups(allIds)).toEqual([]);
    expect(getCandidateAppIds(getVerifiedGroups(allIds))).toEqual([]);
    expect(getVerifiedComparisonAppIds({ toolIds: allIds })).toEqual([]);
  });
});

describe('visibilidad sintética de referencias y firma electrónica', () => {
  const signatureProcess = () => syntheticProcess('electronic-signature', { label: 'Firma electrónica' });
  const contractProcesses = () => [
    syntheticProcess('contract-storage', { label: 'Almacenamiento de contratos' }),
    syntheticProcess('contract-generation', { label: 'Generación de contratos' }),
  ];
  const signatureTools = () => comparisonTools.filter((tool) => signatureIds.includes(tool.id)).map((tool) => ({
    ...tool,
    // La excepción de seguridad también debe actuar ante un indicador erróneamente activado.
    referenceVisible: true,
    processIds: [...tool.processIds, 'contract-storage', 'contract-generation'],
    verifiedProcesses: [
      syntheticRelation('contract-storage', 'para almacenar contratos'),
      syntheticRelation('contract-generation', 'para generar contratos'),
    ],
  }));

  it('respeta el indicador informativo sin convertirlo en evidencia', () => {
    const visible = syntheticTool('visible', 'Referencia visible', ['process']);
    const hidden = { ...syntheticTool('hidden', 'Referencia oculta', ['process'], [
      syntheticRelation('process', 'para seguimiento'),
    ]), referenceVisible: false };
    const tools = [visible, hidden];
    const processes = [syntheticProcess('process')];
    expect(getVisibleComparisonTools(tools, processes)).toEqual([visible]);
    expect(getSelectedComparisonTools(['hidden', 'visible', 'visible'], tools, processes)).toEqual([visible]);
    expect(getVerifiedGroups(['visible'], tools, processes)).toEqual([]);
    expect(getVerifiedGroups(['hidden'], tools, processes)).toHaveLength(1);
  });

  it.each(signatureIds)('mantiene %s oculta sin prueba electrónica específica de su propia relación', (id) => {
    const tools = signatureTools();
    const contracts = contractProcesses();
    // Hasta dos procesos de contrato verificados y vinculados no equivalen a firma.
    expect(getVerifiedGroups([id], tools, contracts).map((group) => group.id)).toEqual([
      'contract-storage', 'contract-generation',
    ]);
    expect(getVisibleComparisonTools(tools, contracts)).toEqual([]);
    expect(getVisibleComparisonTools(tools, [...contracts, signatureProcess()])).toEqual([]);

    const withOwnLink = tools.map((tool) => tool.id === id ? {
      ...tool, verifiedProcesses: [...tool.verifiedProcesses,
        syntheticRelation('electronic-signature', 'para solicitar firmas electrónicas')],
    } : tool);
    expect(getVisibleComparisonTools(withOwnLink, contracts)).toEqual([]);
    expect(getVisibleComparisonTools(withOwnLink, [signatureProcess(), ...contracts]).map((tool) => tool.id)).toEqual([id]);
    expect(getSelectedComparisonTools([...signatureIds, id, 'unknown'], withOwnLink, [signatureProcess()]).map((tool) => tool.id)).toEqual([id]);

    for (const invalidProcess of [
      syntheticProcess('electronic-signature', { verified: false }),
      syntheticProcess('electronic-signature', { evidence: null }),
      syntheticProcess('electronic-signature', { evidence: '  ' }),
      syntheticProcess('electronic-signature', { appId: ' ' }),
    ]) expect(getVisibleComparisonTools(withOwnLink, [invalidProcess])).toEqual([]);

    for (const invalidRelation of [
      syntheticRelation('electronic-signature', 'para solicitar firmas', { verified: false }),
      syntheticRelation('electronic-signature', 'para solicitar firmas', { evidence: ' ' }),
      syntheticRelation('electronic-signature', ' '),
      syntheticRelation('contract-generation', 'para generar contratos'),
    ]) {
      const withoutValidLink = tools.map((tool) => tool.id === id
        ? { ...tool, verifiedProcesses: [invalidRelation] }
        : tool);
      expect(getVisibleComparisonTools(withoutValidLink, [signatureProcess()])).toEqual([]);
    }
    const withoutProposedLink = withOwnLink.map((tool) => tool.id === id
      ? { ...tool, processIds: ['contract-storage'] }
      : tool);
    expect(getVisibleComparisonTools(withoutProposedLink, [signatureProcess()])).toEqual([]);
  });

  it('permite cada firma solo cuando su proceso y su propia relación están verificados', () => {
    const tools = signatureTools().map((tool) => ({
      ...tool,
      referenceVisible: false,
      verifiedProcesses: [...tool.verifiedProcesses,
        syntheticRelation('electronic-signature', `para gestionar firmas en ${tool.name}`)],
    }));
    const processes = [signatureProcess()];
    expect(getVisibleComparisonTools(tools, processes).map((tool) => tool.id)).toEqual(signatureIds);
    expect(getSelectedComparisonTools(['pandadoc', 'docusign'], tools, processes).map((tool) => tool.id)).toEqual([
      'docusign', 'pandadoc',
    ]);
    expect(getVerifiedGroups(signatureIds, tools, processes)[0].relatedUsages).toEqual(tools.map((tool) => ({
      toolName: tool.name, usage: `para gestionar firmas en ${tool.name}`,
    })));
    // Los datos de producción siguen intactos: la prueba no activa ninguna función real.
    expect(getVisibleComparisonTools().map((tool) => tool.id).filter((id) => signatureIds.includes(id))).toEqual([]);
    expect(getVerifiedGroups(signatureIds)).toEqual([]);
  });
});

describe('mapeos sintéticos de procesos verificados', () => {
  it('agrupa por proceso y deduplica nombres, procesos y aplicaciones conservando usos específicos', () => {
    const tools = [
      syntheticTool('a', 'Herramienta A', ['shared', 'only-a', 'unknown-process'], [
        syntheticRelation('shared', '  para llevar el seguimiento de tareas  '),
        syntheticRelation('only-a', 'para organizar sus pendientes'),
      ]),
      syntheticTool('b', 'Herramienta B', ['shared', 'other-app'], [
        syntheticRelation('shared', 'para coordinar los pendientes del equipo'),
        syntheticRelation('other-app', 'para registrar actividades'),
      ]),
      syntheticTool('same-name', ' Herramienta A ', ['shared'], [syntheticRelation('shared', 'para otro uso')]),
      syntheticTool('not-selected', 'No seleccionada', ['shared'], [syntheticRelation('shared', 'para sus tareas')]),
      syntheticTool('not-related', 'Sin relación', ['elsewhere'], [syntheticRelation('shared', 'para sus tareas')]),
      syntheticTool('a', 'ID duplicado', ['shared'], [syntheticRelation('shared', 'para sus tareas')]),
    ];
    const processes = [
      syntheticProcess('shared'),
      syntheticProcess('shared', { label: 'No debe duplicarse' }),
      syntheticProcess('only-a'),
      syntheticProcess('other-app', { appId: 'app-b', appName: 'Aplicación B' }),
      syntheticProcess('only-unselected'),
    ];
    const result = getVerifiedGroups(['b', 'a', 'same-name', 'a', 'not-related', 'unknown'], tools, processes);
    expect(result).toEqual([
      {
        id: 'shared', label: 'Proceso shared', description: 'Alcance de shared', appId: 'app-a', appName: 'Aplicación A',
        relatedToolNames: ['Herramienta A', 'Herramienta B'],
        relatedUsages: [
          { toolName: 'Herramienta A', usage: 'para llevar el seguimiento de tareas' },
          { toolName: 'Herramienta B', usage: 'para coordinar los pendientes del equipo' },
        ],
      },
      {
        id: 'only-a', label: 'Proceso only-a', description: 'Alcance de only-a', appId: 'app-a', appName: 'Aplicación A',
        relatedToolNames: ['Herramienta A'], relatedUsages: [{ toolName: 'Herramienta A', usage: 'para organizar sus pendientes' }],
      },
      {
        id: 'other-app', label: 'Proceso other-app', description: 'Alcance de other-app', appId: 'app-b', appName: 'Aplicación B',
        relatedToolNames: ['Herramienta B'], relatedUsages: [{ toolName: 'Herramienta B', usage: 'para registrar actividades' }],
      },
    ]);
    expect(getCandidateAppIds(result)).toEqual(['app-a', 'app-b']);
    expect(getVerifiedGroups([], tools, processes)).toEqual([]);
    expect(getVerifiedGroups(['unknown'], tools, processes)).toEqual([]);
  });

  it('no genera resultados de herramientas reales con evidencia global pero sin evidencia del vínculo', () => {
    const globallyVerified = comparisonProcesses.map((process) => ({
      ...process, verified: true, evidence: 'Evidencia global sintética',
    }));
    expect(getVerifiedGroups(comparisonTools.map((tool) => tool.id), comparisonTools, globallyVerified)).toEqual([]);
  });

  it('excluye procesos no verificados o con evidencia o metadatos obligatorios ausentes', () => {
    const ids = [
      'valid', 'unverified', 'non-boolean', 'null-evidence', 'empty-evidence', 'blank-evidence',
      'empty-label', 'blank-description', 'blank-app-id', 'blank-app-name', ' ', 'no-related-tool',
    ];
    const tools = [syntheticTool('test', 'Referencia', ids.filter((id) => id !== 'no-related-tool'),
      ids.map((id) => syntheticRelation(id, 'para seguir las tareas')))];
    const processes = [
      syntheticProcess('valid', { verified: false }),
      syntheticProcess('valid', { evidence: '  Fuente válida  ' }),
      syntheticProcess('unverified', { verified: false }),
      syntheticProcess('non-boolean', { verified: 1 as unknown as boolean }),
      syntheticProcess('null-evidence', { evidence: null }),
      syntheticProcess('empty-evidence', { evidence: '' }),
      syntheticProcess('blank-evidence', { evidence: ' \n\t ' }),
      syntheticProcess('empty-label', { label: ' ' }),
      syntheticProcess('blank-description', { description: ' ' }),
      syntheticProcess('blank-app-id', { appId: ' ' }),
      syntheticProcess('blank-app-name', { appName: ' ' }),
      syntheticProcess(' ', { label: 'Sin ID' }),
      syntheticProcess('no-related-tool'),
    ];
    expect(getVerifiedGroups(['test'], tools, processes)).toEqual([{
      id: 'valid', label: 'Proceso valid', description: 'Alcance de valid',
      appId: 'app-a', appName: 'Aplicación A', relatedToolNames: ['Referencia'],
      relatedUsages: [{ toolName: 'Referencia', usage: 'para seguir las tareas' }],
    }]);
  });

  it('exige la relación propuesta, el mismo proceso, verificación estricta, evidencia y uso no vacíos', () => {
    const linked = ['process'];
    const tools = [
      syntheticTool('missing', 'Falta la relación verificada', linked),
      syntheticTool('empty-list', 'Lista vacía', linked, []),
      syntheticTool('unverified', 'No verificada', linked, [syntheticRelation('process', 'para seguimiento', { verified: false })]),
      syntheticTool('non-boolean', 'No es booleano', linked, [syntheticRelation('process', 'para seguimiento', { verified: 1 as unknown as boolean })]),
      syntheticTool('null-evidence', 'Evidencia nula', linked, [syntheticRelation('process', 'para seguimiento', { evidence: null as unknown as string })]),
      syntheticTool('empty-evidence', 'Evidencia vacía', linked, [syntheticRelation('process', 'para seguimiento', { evidence: '' })]),
      syntheticTool('blank-evidence', 'Evidencia blanca', linked, [syntheticRelation('process', 'para seguimiento', { evidence: ' \n\t ' })]),
      syntheticTool('null-usage', 'Uso nulo', linked, [syntheticRelation('process', null as unknown as string)]),
      syntheticTool('empty-usage', 'Uso vacío', linked, [syntheticRelation('process', '')]),
      syntheticTool('blank-usage', 'Uso en blanco', linked, [syntheticRelation('process', ' \n\t ')]),
      syntheticTool('other-id', 'Otro proceso', linked, [syntheticRelation('another-process', 'para seguimiento')]),
      syntheticTool('no-proposed-link', 'Sin relación propuesta', ['another-process'], [syntheticRelation('process', 'para seguimiento')]),
      syntheticTool('valid-later', 'Relación válida', linked, [
        syntheticRelation('process', 'para seguimiento', { evidence: ' ' }),
        syntheticRelation('process', ' para llevar el seguimiento de tareas '),
      ]),
    ];
    const ids = tools.map((tool) => tool.id);
    expect(getVerifiedGroups(ids, tools, [syntheticProcess('process')])).toEqual([{
      id: 'process', label: 'Proceso process', description: 'Alcance de process', appId: 'app-a', appName: 'Aplicación A',
      relatedToolNames: ['Relación válida'],
      relatedUsages: [{ toolName: 'Relación válida', usage: 'para llevar el seguimiento de tareas' }],
    }]);
    expect(getVerifiedGroups(ids, tools, [syntheticProcess('process', { verified: false })])).toEqual([]);
    expect(getVerifiedGroups(ids, tools, [syntheticProcess('process', { evidence: ' ' })])).toEqual([]);
  });

  it('la evidencia sintética de Skedda no verifica el vínculo de Calendly', () => {
    const realTools = comparisonTools.filter((tool) => ['calendly', 'skedda'].includes(tool.id));
    const skeddaRelation = syntheticRelation('booking', 'para reservar espacios');
    const tools = realTools.map((tool) => tool.id === 'skedda'
      ? { ...tool, verifiedProcesses: [skeddaRelation] }
      : tool);
    const processes = [syntheticProcess('booking', { label: 'Reservas de espacios' })];
    const selected = ['skedda', 'calendly'];
    expect(getVerifiedGroups(selected, tools, processes)).toEqual([{
      id: 'booking', label: 'Reservas de espacios', description: 'Alcance de booking', appId: 'app-a', appName: 'Aplicación A',
      relatedToolNames: ['Skedda'], relatedUsages: [{ toolName: 'Skedda', usage: 'para reservar espacios' }],
    }]);
    expect(getVerifiedGroups(['calendly'], tools, processes)).toEqual([]);

    const toolsWithCalendly = tools.map((tool) => tool.id === 'calendly'
      ? { ...tool, verifiedProcesses: [syntheticRelation('booking', 'para organizar citas')] }
      : tool);
    expect(getVerifiedGroups(selected, toolsWithCalendly, processes)[0].relatedUsages).toEqual([
      { toolName: 'Calendly', usage: 'para organizar citas' },
      { toolName: 'Skedda', usage: 'para reservar espacios' },
    ]);
  });

  it('solo admite firma electrónica con evidencia del proceso y de la pareja, no almacenamiento o generación', () => {
    const signatureIds = ['docusign', 'dropbox-sign', 'pandadoc'];
    const signatureTools = comparisonTools.filter((tool) => signatureIds.includes(tool.id));
    expect(signatureTools).toHaveLength(3);
    for (const tool of signatureTools) expect(tool.processIds).toEqual(['electronic-signature']);

    const unrelatedContractProcesses = [
      syntheticProcess('contract-storage', { label: 'Almacenamiento de contratos' }),
      syntheticProcess('contract-generation', { label: 'Generación de contratos' }),
    ];
    expect(getVerifiedGroups(signatureIds, signatureTools, unrelatedContractProcesses)).toEqual([]);
    expect(getVerifiedGroups(signatureIds, signatureTools, [
      syntheticProcess('electronic-signature', { verified: false }),
    ])).toEqual([]);
    expect(getVerifiedGroups(signatureIds, signatureTools, [
      syntheticProcess('electronic-signature', { evidence: ' ' }),
    ])).toEqual([]);
    expect(getVerifiedGroups(signatureIds, signatureTools, [
      syntheticProcess('electronic-signature', { label: 'Firma electrónica' }),
    ])).toEqual([]);

    const syntheticSignatureTools = signatureTools.map((tool) => tool.id === 'docusign'
      ? { ...tool, verifiedProcesses: [
        syntheticRelation('electronic-signature', 'para solicitar firmas electrónicas'),
        syntheticRelation('contract-storage', 'para almacenar contratos'),
      ] }
      : tool);
    expect(getVerifiedGroups(signatureIds, syntheticSignatureTools, unrelatedContractProcesses)).toEqual([]);
    expect(getVerifiedGroups(signatureIds, syntheticSignatureTools, [
      syntheticProcess('electronic-signature', { verified: false }),
    ])).toEqual([]);
    expect(getVerifiedGroups(signatureIds, syntheticSignatureTools, [
      syntheticProcess('electronic-signature', { evidence: ' ' }),
    ])).toEqual([]);
    expect(getVerifiedGroups(signatureIds, syntheticSignatureTools, [
      syntheticProcess('electronic-signature', { label: 'Firma electrónica' }),
    ])).toEqual([{
      id: 'electronic-signature', label: 'Firma electrónica', description: 'Alcance de electronic-signature',
      appId: 'app-a', appName: 'Aplicación A', relatedToolNames: ['DocuSign'],
      relatedUsages: [{ toolName: 'DocuSign', usage: 'para solicitar firmas electrónicas' }],
    }]);
  });

  it('devuelve identificadores de aplicación no vacíos y sin duplicados', () => {
    const result = (appId: string): ComparisonResult => ({
      id: 'test', label: 'Prueba', description: 'Alcance', appId,
      appName: 'Aplicación', relatedToolNames: ['Herramienta'], relatedUsages: [{ toolName: 'Herramienta', usage: 'para seguimiento' }],
    });
    expect(getCandidateAppIds([result('app-a'), result('app-b'), result(' app-a '), result(' '), result('')])).toEqual(['app-a', 'app-b']);
    expect(getCandidateAppIds([])).toEqual([]);
  });
});

describe('validación del filtro de aplicaciones', () => {
  it('deriva el filtro de la selección verificada y lo vacía al quitar la última relación', () => {
    const tools = [
      syntheticTool('verified', 'Referencia verificada', ['shared'], [syntheticRelation('shared', 'para tareas')]),
      syntheticTool('pending', 'Referencia pendiente', ['shared']),
    ];
    const processes = [syntheticProcess('shared')];
    expect(getVerifiedComparisonAppIds({ toolIds: ['verified', 'pending'] }, tools, processes)).toEqual(['app-a']);
    expect(getVerifiedComparisonAppIds({ toolIds: ['pending'] }, tools, processes)).toEqual([]);
    expect(getVerifiedComparisonAppIds({ toolIds: [] }, tools, processes)).toEqual([]);
    expect(getVerifiedComparisonAppIds({ toolIds: ['verified'], processId: 'otro' }, tools, processes)).toEqual([]);
    expect(getVerifiedComparisonAppIds({ appIds: ['app-a'] }, tools, processes)).toBeNull();
    expect(getVerifiedComparisonAppIds({ toolIds: [5] }, tools, processes)).toBeNull();
  });
});
