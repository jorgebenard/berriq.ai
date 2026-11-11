import { useEffect, useId, useRef, useState, type Ref } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import {
  comparisonTools,
  getCandidateAppIds,
  getComparisonGroups,
  getSelectedComparisonTools,
  type ComparisonTool,
} from './comparisonData';
import './toolComparison.css';

function ToolCard({ tool, selected, onToggle, firstRef }: {
  tool: ComparisonTool;
  selected: boolean;
  onToggle: () => void;
  firstRef?: Ref<HTMLButtonElement>;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showLogo = Boolean(tool.logo) && !imageFailed;

  return (
    <button
      ref={firstRef}
      type="button"
      className={`tc-tool${selected ? ' tc-tool--selected' : ''}`}
      aria-pressed={selected}
      onClick={onToggle}
    >
      <span className="tc-tool__check" aria-hidden="true">{selected && <Check size={15} strokeWidth={3} />}</span>
      <span className={`tc-tool__brand tc-tool__brand--${tool.id}`}>
        {showLogo ? (
          <img src={tool.logo ?? undefined} alt="" onError={() => setImageFailed(true)} />
        ) : (
          <span className="tc-tool__fallback">{tool.name}</span>
        )}
      </span>
      {showLogo && <span className="tc-tool__name">{tool.name}</span>}
      <span className="tc-tool__label">{tool.label}</span>
    </button>
  );
}

export function ToolComparison() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const firstToolRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const instructionId = `${id}-instruction`;
  const resultTitleId = `${id}-result-title`;
  const visibleTools = comparisonTools.filter((tool) => tool.visible);
  const selectedTools = getSelectedComparisonTools(selectedIds);
  const groups = getComparisonGroups(selectedIds);
  const hasSelection = selectedTools.length > 0;

  useEffect(() => {
    const appIds = getCandidateAppIds(getComparisonGroups(selectedIds));
    window.dispatchEvent(new CustomEvent('berriq:compare-selection', { detail: { appIds } }));
  }, [selectedIds]);

  const toggleTool = (toolId: string) => {
    setSelectedIds((current) => current.includes(toolId)
      ? current.filter((id) => id !== toolId)
      : [...current, toolId]);
  };

  const clearSelection = () => {
    // El botón queda deshabilitado al limpiar: devolver el foco a un control estable.
    firstToolRef.current?.focus({ preventScroll: true });
    setSelectedIds([]);
  };

  const showApplications = () => {
    const appIds = getCandidateAppIds(groups);
    window.dispatchEvent(new CustomEvent('berriq:compare-apps', { detail: { appIds } }));

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

  return (
    <section className="tc-section" aria-labelledby={`${id}-title`}>
      <div className="tc-container">
        <div className="tc-heading">
          <span className="tc-eyebrow"><span aria-hidden="true" /> Comparación por procesos</span>
          <h2 id={`${id}-title`}>¿Utilizas alguna de estas herramientas?</h2>
          <p>Tus clientes en una aplicación, tus pendientes en otra y tus cobros en una hoja de cálculo. Descubre qué procesos puedes reunir en berriq.</p>
          <p className="tc-heading__notice">La cobertura de estos procesos en berriq está pendiente de verificación.</p>
        </div>

        <div className="tc-layout">
          <div className="tc-choices">
            <div className="tc-choices__heading">
              <p id={instructionId}>Selecciona las herramientas que utilizas.</p>
              <button type="button" className="tc-clear" onClick={clearSelection} disabled={!hasSelection}>Limpiar selección</button>
            </div>
            <div className="tc-grid" role="group" aria-labelledby={instructionId}>
              {visibleTools.map((tool, index) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  selected={selectedIds.includes(tool.id)}
                  onToggle={() => toggleTool(tool.id)}
                  firstRef={index === 0 ? firstToolRef : undefined}
                />
              ))}
            </div>
          </div>

          <section className="tc-result" aria-labelledby={resultTitleId}>
            <span className="tc-result__eyebrow">Tu selección</span>
            <h3 id={resultTitleId}>{hasSelection ? 'Tu operación puede estar más conectada.' : 'Descubre qué puedes conectar.'}</h3>
            {hasSelection ? (
              <>
                <div className="tc-selection">
                  <span className="tc-result__label">Herramientas seleccionadas</span>
                  <p>{selectedTools.map((tool) => tool.name).join(' · ')}</p>
                </div>
                <div className="tc-processes">
                  <span className="tc-result__label">Procesos de tus herramientas seleccionadas</span>
                  <ul>
                    {groups.map((group) => (
                      <li key={group.id}>
                        <span className="tc-processes__dot" aria-hidden="true" />
                        <div>
                          <strong>{group.label}</strong>
                          {group.note && <span className="tc-processes__note">{group.note}</span>}
                          <span className="tc-processes__status">Cobertura en berriq aún no verificada.</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="tc-result__closing">Conoce qué funciones cubren estos procesos y cómo encajan en tu negocio.</p>
                <button type="button" className="tc-primary" onClick={showApplications}>
                  Ver estas funciones en berriq <ArrowRight size={17} aria-hidden="true" />
                </button>
              </>
            ) : (
              <div className="tc-empty">
                <p>Selecciona tus herramientas para explorar los procesos relacionados en berriq.</p>
                <div className="tc-empty__hint" aria-hidden="true"><span /><span /><span /></div>
                <p className="tc-empty__note">Puedes elegir varias y cambiar tu selección cuando quieras.</p>
              </div>
            )}
          </section>
        </div>
        <p className="tc-sr-only" role="status" aria-live="polite" aria-atomic="true">
          {selectedTools.length === 0
            ? 'Ninguna herramienta seleccionada.'
            : `${selectedTools.length} ${selectedTools.length === 1 ? 'herramienta seleccionada' : 'herramientas seleccionadas'}; ${groups.length} ${groups.length === 1 ? 'grupo de procesos' : 'grupos de procesos'}. La cobertura en berriq aún no está verificada.`}
        </p>
        <p className="tc-footnote">Comparación por procesos, no equivalencia completa entre productos. Las marcas pertenecen a sus respectivos titulares; su aparición no implica afiliación ni integración.</p>
      </div>
    </section>
  );
}
