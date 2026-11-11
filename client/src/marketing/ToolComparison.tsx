import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, Check, Search, X } from 'lucide-react';
import {
  comparisonCategories,
  getSelectedComparisonTools,
  getVerifiedGroups,
  getVisibleComparisonTools,
  type ComparisonCategoryId,
  type ComparisonTool,
} from './comparisonData';
import './toolComparison.css';

const INITIAL_TOOL_COUNT = 16;

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();

function ToolCard({ tool, selected, onToggle }: {
  tool: ComparisonTool;
  selected: boolean;
  onToggle: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showLogo = Boolean(tool.logo) && !imageFailed;

  return (
    <button
      type="button"
      className={`tc-tool${selected ? ' tc-tool--selected' : ''}`}
      aria-pressed={selected}
      onClick={onToggle}
    >
      <span className="tc-tool__check" aria-hidden="true">{selected && <Check size={13} strokeWidth={3} />}</span>
      {showLogo && (
        <span className={`tc-tool__brand tc-tool__brand--${tool.id}`} aria-hidden="true">
          <img src={tool.logo ?? undefined} alt="" onError={() => setImageFailed(true)} />
        </span>
      )}
      <span className={`tc-tool__name${showLogo ? '' : ' tc-tool__name--fallback'}`}>{tool.name}</span>
    </button>
  );
}

export function ToolComparison() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [category, setCategory] = useState<ComparisonCategoryId | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const instructionId = `${id}-instruction`;
  const searchId = `${id}-search`;
  const resultTitleId = `${id}-result-title`;
  const gridId = `${id}-grid`;

  const visibleTools = getVisibleComparisonTools();
  const selectedTools = getSelectedComparisonTools(selectedIds);
  const groups = getVerifiedGroups(selectedTools.map((tool) => tool.id));
  const hasSelection = selectedTools.length > 0;
  const visibleCategories = comparisonCategories.filter((item) => visibleTools.some((tool) => tool.category === item.id));
  const query = normalize(search);
  const filteredTools = visibleTools.filter((tool) =>
    (category === 'all' || tool.category === category)
    && (!query || normalize(`${tool.name} ${tool.label}`).includes(query))
  );
  const displayedTools = expanded ? filteredTools : filteredTools.slice(0, INITIAL_TOOL_COUNT);

  useEffect(() => {
    const selected = getSelectedComparisonTools(selectedIds);
    window.dispatchEvent(new CustomEvent('berriq:compare-selection', { detail: { toolIds: selected.map((tool) => tool.id) } }));
  }, [selectedIds]);

  const toggleTool = (toolId: string) => {
    setSelectedIds((current) => current.includes(toolId)
      ? current.filter((selectedId) => selectedId !== toolId)
      : [...current, toolId]);
  };

  const clearSelection = () => {
    // El control que recibe el foco permanece visible aunque cambien los filtros.
    searchRef.current?.focus({ preventScroll: true });
    setSelectedIds([]);
  };

  const revealApplications = () => {
    // Evitar el desplazamiento automático del hash antes de aplicar la preferencia de movimiento.
    if (window.location.hash !== '#aplicaciones') {
      window.history.pushState(window.history.state, '', '#aplicaciones');
    }
    const title = document.getElementById('exp-app-title');
    const target = title ?? document.getElementById('aplicaciones');
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      || document.body.dataset.motion === 'paused';
    target?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'start' });
    title?.focus({ preventScroll: true });
  };

  const showApplications = (processId?: string) => {
    if (groups.length === 0 || (processId !== undefined && !groups.some((group) => group.id === processId))) return;
    const toolIds = selectedTools.map((tool) => tool.id);
    const detail = processId === undefined ? { toolIds } : { toolIds, processId };
    window.dispatchEvent(new CustomEvent('berriq:compare-apps', { detail }));
    revealApplications();
  };

  const showAllApplications = () => {
    window.dispatchEvent(new CustomEvent('berriq:compare-show-all'));
    revealApplications();
  };

  if (visibleTools.length === 0) return null;

  return (
    <section id="herramientas-comparacion" className="tc-section" aria-labelledby={`${id}-title`}>
      <div className="tc-container">
        <div className="tc-heading">
          <span className="tc-eyebrow"><span aria-hidden="true" /> Referencias informativas</span>
          <h2 id={`${id}-title`}>¿Cuántas de estas herramientas utilizas?</h2>
          <p>Clientes, tareas, reservas, cobros y equipo. Explora herramientas que suelen formar parte del día a día de un negocio.</p>
        </div>

        <p className="tc-preview">Referencias informativas: su aparición no implica equivalencia, cobertura ni integración con berriq.</p>

        <div className="tc-layout">
          <div className="tc-choices">
            <div className="tc-choices__heading">
              <p id={instructionId}>Selecciona las herramientas que utilizas para explorar sus categorías.</p>
              <button type="button" className="tc-clear" onClick={clearSelection} disabled={!hasSelection}>Limpiar selección</button>
            </div>

            <div className="tc-search">
              <Search size={18} aria-hidden="true" />
              <label className="tc-sr-only" htmlFor={searchId}>Busca una herramienta</label>
              <input
                ref={searchRef}
                id={searchId}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Busca una herramienta"
              />
              {search && (
                <button type="button" className="tc-search__clear" aria-label="Limpiar búsqueda" onClick={() => { setSearch(''); searchRef.current?.focus(); }}>
                  <X size={17} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="tc-filters" role="group" aria-label="Filtrar herramientas por categoría">
              <button type="button" className={`tc-filter${category === 'all' ? ' tc-filter--active' : ''}`} aria-pressed={category === 'all'} onClick={() => setCategory('all')}>Todas</button>
              {visibleCategories.map((item) => (
                <button key={item.id} type="button" className={`tc-filter${category === item.id ? ' tc-filter--active' : ''}`} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>
              ))}
            </div>

            <p className="tc-count" aria-live="polite">{filteredTools.length} {filteredTools.length === 1 ? 'herramienta' : 'herramientas'} {query || category !== 'all' ? (filteredTools.length === 1 ? 'encontrada' : 'encontradas') : 'para explorar'}</p>
            {filteredTools.length > 0 ? (
              <>
                <div id={gridId} className="tc-grid" role="group" aria-labelledby={instructionId}>
                  {displayedTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      selected={selectedIds.includes(tool.id)}
                      onToggle={() => toggleTool(tool.id)}
                    />
                  ))}
                </div>
                {filteredTools.length > INITIAL_TOOL_COUNT && (
                  <button type="button" className="tc-expand" aria-expanded={expanded} aria-controls={gridId} onClick={() => setExpanded((current) => !current)}>
                    {expanded ? 'Mostrar menos' : 'Ver todas las herramientas'}
                  </button>
                )}
              </>
            ) : (
              <div className="tc-no-results">
                <strong>No encontramos herramientas con esos filtros.</strong>
                <p>Prueba otro término o selecciona otra categoría. Tu selección se conserva.</p>
                <button type="button" onClick={() => { setSearch(''); setCategory('all'); searchRef.current?.focus(); }}>Limpiar búsqueda y filtros</button>
              </div>
            )}
          </div>

          <section className="tc-result" aria-labelledby={resultTitleId}>
            <span className="tc-result__eyebrow">Tu selección</span>
            <h3 id={resultTitleId}>{hasSelection ? (groups.length > 0 ? 'Estos son los procesos que puedes explorar en berriq.' : 'Tus herramientas seleccionadas') : 'Selecciona tus herramientas para explorar sus categorías.'}</h3>
            {hasSelection ? (
              <>
                <div className="tc-selection">
                  <span className="tc-result__label">Herramientas seleccionadas</span>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {selectedTools.map((tool) => (
                      <li key={tool.id}><p>{tool.name} · {comparisonCategories.find((item) => item.id === tool.category)?.label}</p></li>
                    ))}
                  </ul>
                </div>
                {groups.length > 0 ? (
                  <div className="tc-processes">
                    <span className="tc-result__label">Procesos verificados</span>
                    <ul>
                      {groups.map((group) => (
                        <li key={group.id}>
                          <strong>{group.label}</strong>
                          <p>{group.description}</p>
                          {group.relatedUsages.map(({ toolName, usage }) => <p key={`${toolName}-${usage}`}>Si utilizas {toolName} {usage}…</p>)}
                          <p>Aplicación de berriq: <strong>{group.appName}</strong></p>
                          <button type="button" className="tc-processes__link" onClick={() => showApplications(group.id)}>
                            Explorar {group.appName} de berriq <ArrowRight size={15} aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="tc-result__notice">Esta selección es informativa y no describe funciones ni integraciones de berriq.</p>
                )}
              </>
            ) : (
              <p className="tc-empty">Puedes elegir varias herramientas y cambiar tu selección cuando quieras.</p>
            )}
            <button type="button" className="tc-primary" onClick={groups.length > 0 ? () => showApplications() : showAllApplications}>
              {groups.length > 0 ? 'Ver estas funciones en berriq' : 'Ver aplicaciones de berriq'} <ArrowRight size={17} aria-hidden="true" />
            </button>
          </section>
        </div>
        <p className="tc-sr-only" role="status" aria-live="polite" aria-atomic="true">
          {hasSelection
            ? `${selectedTools.length} ${selectedTools.length === 1 ? 'herramienta seleccionada' : 'herramientas seleccionadas'}; ${groups.length} ${groups.length === 1 ? 'proceso verificado' : 'procesos verificados'}.`
            : 'Ninguna herramienta seleccionada.'}
        </p>
        <p className="tc-footnote">Las marcas pertenecen a sus respectivos titulares; su aparición no implica afiliación ni integración.</p>
      </div>
    </section>
  );
}
