import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import { ArrowRight, Check, ChevronDown, Search, X, type LucideIcon } from 'lucide-react';
import { siteConfig, trackEvent } from './siteConfig';
import { getVerifiedBusinessProfile, industryConversation, type BusinessSelection } from './businessProfiles';
import { getVerifiedComparisonAppIds } from './comparisonData';
import {
  appCategories,
  applications,
  industries,
  type AppCategoryId,
  type CatalogApp,
  type CatalogColor,
} from './catalog';
import './explorers.css';

type ActionKind = 'trial' | 'login' | 'contact';
type ExplorerProps = { onAction: (kind: ActionKind, returnFocus?: HTMLElement | null) => void };
type IndustriesProps = ExplorerProps & {
  selection: BusinessSelection | null;
  onSelect: (selection: BusinessSelection) => void;
  onClear: () => void;
  onExample: () => void;
};

// El catálogo conserva los datos, pero no muestra capacidades de IA sin verificar.
const visibleCategories = appCategories.filter((item) => item.id !== 'automation');
const visibleApplications = applications.filter((item) => item.category !== 'automation');

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();

function focusAndReveal(element: HTMLElement | null, block: ScrollLogicalPosition = 'nearest') {
  if (!element?.isConnected) return;
  element.focus({ preventScroll: true });
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || document.body.dataset.motion === 'paused';
  element.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block });
}

function IconTile({ icon: Icon, color, small = false }: { icon: LucideIcon; color: CatalogColor; small?: boolean }) {
  return (
    <span className={`exp-icon exp-icon--${color}${small ? ' exp-icon--small' : ''}`} aria-hidden="true">
      <span className="exp-icon__shine" />
      <Icon className="exp-icon__glyph" strokeWidth={1.8} />
      <span className="exp-icon__dot" />
    </span>
  );
}

function SearchBox({ value, onChange, placeholder, label, id, inputRef }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  id: string;
  inputRef?: RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="exp-search">
      <label className="exp-sr-only" htmlFor={id}>{label}</label>
      <Search size={19} aria-hidden="true" />
      <input ref={inputRef} id={id} type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function Applications({ onAction }: ExplorerProps) {
  const [category, setCategory] = useState<AppCategoryId | 'all'>('all');
  const [search, setSearch] = useState('');
  const [relatedIds, setRelatedIds] = useState<Set<string> | null>(null);
  const [selected, setSelected] = useState<CatalogApp | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const actionStartedRef = useRef(false);
  const searchId = useId();

  useEffect(() => {
    const handleExplore = (event: Event) => {
      setRelatedIds(null);
      const query = (event as CustomEvent<{ query?: unknown }>).detail?.query;
      if (typeof query !== 'string') return;
      const app = visibleApplications.find((item) => normalize(item.name) === normalize(query));
      setCategory('all');
      setSearch(app?.name ?? query);
    };
    const handleCompare = (event: Event) => {
      const appIds = getVerifiedComparisonAppIds((event as CustomEvent<unknown>).detail);
      if (!appIds || appIds.length === 0) return;
      setCategory('all');
      setSearch('');
      setRelatedIds(new Set(appIds));
    };
    const handleComparisonChange = (event: Event) => {
      const appIds = getVerifiedComparisonAppIds((event as CustomEvent<unknown>).detail);
      if (appIds === null) return;
      setRelatedIds((current) => current === null || appIds.length === 0 ? null : new Set(appIds));
    };
    window.addEventListener('berriq:explore-app', handleExplore);
    window.addEventListener('berriq:compare-apps', handleCompare);
    window.addEventListener('berriq:compare-selection', handleComparisonChange);
    return () => {
      window.removeEventListener('berriq:explore-app', handleExplore);
      window.removeEventListener('berriq:compare-apps', handleCompare);
      window.removeEventListener('berriq:compare-selection', handleComparisonChange);
    };
  }, []);

  const filtered = useMemo(() => {
    const query = normalize(search);
    return visibleApplications.filter((app) => {
      const categoryName = appCategories.find((item) => item.id === app.category)?.label ?? '';
      const matchesRelated = relatedIds === null || relatedIds.has(app.id);
      const matchesCategory = category === 'all' || app.category === category;
      const searchable = [app.name, app.summary, categoryName, ...(app.keywords ?? [])].join(' ');
      return matchesRelated && matchesCategory && (!query || normalize(searchable).includes(query));
    });
  }, [category, search, relatedIds]);

  const showAllApplications = () => {
    setRelatedIds(null);
    setSearch('');
    setCategory('all');
    focusAndReveal(searchRef.current);
  };

  const openApp = (app: CatalogApp, button: HTMLButtonElement) => {
    actionStartedRef.current = false;
    triggerRef.current = button;
    trackEvent('module_open', { module: app.id });
    setSelected(app);
  };

  return (
    <section className="section exp-section exp-apps" id="aplicaciones" aria-labelledby="exp-app-title">
      <div className="container exp-container">
        <div className="exp-heading exp-heading--split">
          <div>
            <span className="eyebrow exp-eyebrow"><span className="exp-eyebrow__dot" /> Aplicaciones</span>
            <h2 className="section-title exp-heading__title" id="exp-app-title" tabIndex={-1}>Encuentra las herramientas que necesita tu negocio.</h2>
            <p className="exp-heading__copy">Explora las áreas propuestas para berriq. Su disponibilidad y conexiones están pendientes de verificación.</p>
          </div>
          <div className="exp-heading__aside"><span className="exp-aside__number">{visibleApplications.length}</span><span>formas de organizar<br />tu operación</span></div>
        </div>

        <div className="exp-app-controls">
          <div className="exp-filter-list" role="group" aria-label="Filtrar aplicaciones por categoría">
            <button className={`exp-filter${category === 'all' ? ' exp-is-active' : ''}`} type="button" aria-pressed={category === 'all'} onClick={() => { setRelatedIds(null); setCategory('all'); }}>Todas</button>
            {visibleCategories.map((item) => (
              <button key={item.id} className={`exp-filter${category === item.id ? ' exp-is-active' : ''}`} type="button" aria-pressed={category === item.id} onClick={() => { setRelatedIds(null); setCategory(item.id); }}>{item.label}</button>
            ))}
          </div>
          <SearchBox id={searchId} inputRef={searchRef} label="Buscar aplicaciones" value={search} onChange={(value) => { setRelatedIds(null); setSearch(value); }} placeholder="Buscar una aplicación..." />
        </div>

        {relatedIds !== null && (
          <div className="exp-related">
            <div>
              <h3>Áreas relacionadas para revisar</h3>
              <p>Su disponibilidad en berriq no está verificada.</p>
            </div>
            <button className="exp-related__button" type="button" onClick={showAllApplications}>Ver todas las aplicaciones</button>
          </div>
        )}
        <div className="exp-result-line" aria-live="polite"><span className="exp-sr-only">{relatedIds !== null ? 'Áreas relacionadas para revisar. Su disponibilidad en berriq no está verificada. ' : ''}</span>{filtered.length} {filtered.length === 1 ? 'aplicación' : 'aplicaciones'} para explorar</div>
        {filtered.length > 0 ? (
          <div className="exp-app-grid">
            {filtered.map((app) => (
              <button className="exp-app-card" key={app.id} type="button" onClick={(event) => openApp(app, event.currentTarget)} aria-label={`Conocer ${app.name}${app.verificationNotice ? ', disponibilidad por confirmar' : ''}`}>
                <IconTile icon={app.icon} color={app.color} />
                <span className="exp-app-card__title">{app.name}</span>
                {app.verificationNotice && <span className="exp-app-card__status">Por confirmar</span>}
                <span className="exp-app-card__summary">Posible uso: {app.summary}</span>
                <span className="exp-app-card__more">Ver aplicación <ArrowRight size={14} aria-hidden="true" /></span>
              </button>
            ))}
          </div>
        ) : (
          <div className="exp-empty">{relatedIds !== null ? <><strong>No encontramos aplicaciones relacionadas en el catálogo.</strong><span>Revisa todas las aplicaciones para explorar otras áreas.</span></> : <><strong>No encontramos aplicaciones con esa búsqueda.</strong><span>Prueba otro término o selecciona otra categoría.</span><button type="button" onClick={showAllApplications}>Ver todas las aplicaciones</button></>}</div>
        )}
        <p className="exp-footnote">La disponibilidad de módulos, conexiones y planes se confirmará según el alcance de tu operación.</p>
      </div>

      <Dialog.Root open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        {selected && (
          <Dialog.Portal>
            <Dialog.Overlay className="exp-dialog-overlay" />
            <Dialog.Content className="exp-dialog" onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (!actionStartedRef.current) (triggerRef.current?.isConnected ? triggerRef.current : searchRef.current)?.focus();
            }}>
              <Dialog.Close className="exp-close" aria-label="Cerrar ficha"><X size={20} /></Dialog.Close>
              <div className="exp-dialog__top">
                <IconTile icon={selected.icon} color={selected.color} />
                <div><span className="exp-dialog__category">{appCategories.find((item) => item.id === selected.category)?.label}</span><Dialog.Title className="exp-dialog__title">{selected.name}</Dialog.Title><Dialog.Description className="exp-dialog__description">{selected.summary}</Dialog.Description></div>
              </div>
              <div className="exp-dialog__body">
                <div><h3>Posible gestión</h3><p>{selected.manages}</p></div>
                <div><h3>Posible utilidad</h3><p>{selected.helps}</p></div>
                <div><h3>Áreas relacionadas por verificar</h3><div className="exp-tags">{selected.connections.map((connection) => <span key={connection}>{connection}</span>)}</div></div>
                <div className="exp-example"><span>Ejemplo ilustrativo</span><p>{selected.example}</p></div>
                <p className="exp-dialog__notice">{selected.verificationNotice ?? 'Ejemplo conceptual. La disponibilidad, el alcance y las conexiones están pendientes de verificación.'}</p>
              </div>
              <div className="exp-dialog__footer"><p>Solicita más información sobre el alcance.</p><button className="btn btn-primary exp-primary" type="button" onClick={() => { actionStartedRef.current = true; setSelected(null); onAction('contact', triggerRef.current); }}>Solicitar una demo <ArrowRight size={16} aria-hidden="true" /></button></div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </Dialog.Root>
    </section>
  );
}

function BusinessPanel({ selection, panelRef, panelId, onAction, onExample, onClear, onChange, onRestoreFocus }: {
  selection: BusinessSelection;
  panelRef: RefObject<HTMLElement | null>;
  panelId: string;
  onAction: ExplorerProps['onAction'];
  onExample: () => void;
  onClear: () => void;
  onChange: () => void;
  onRestoreFocus: () => void;
}) {
  const profile = getVerifiedBusinessProfile(selection);
  const industry = industries.find((item) => item.id === selection.industryId);
  const titleId = `${panelId}-title`;
  const contextId = `${panelId}-context`;
  const restoreFocusRef = useRef(onRestoreFocus);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  restoreFocusRef.current = onRestoreFocus;

  // Si el padre desmonta el panel mientras contiene el foco, lo devuelve a un control estable.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    return () => {
      if (panel?.contains(document.activeElement)) restoreFocusRef.current();
    };
  }, [panelRef]);

  // Un cambio externo de perfil puede retirar un botón sin desmontar toda la ficha.
  useLayoutEffect(() => {
    const previous = lastFocusedElementRef.current;
    if (previous && !previous.isConnected && document.activeElement === document.body) panelRef.current?.focus({ preventScroll: true });
  });

  return (
    <section className="exp-business-panel" id={panelId} ref={panelRef} tabIndex={-1} aria-labelledby={`${titleId} ${contextId}`} onFocusCapture={(event) => { if (event.target instanceof HTMLElement) lastFocusedElementRef.current = event.target; }} onBlurCapture={(event) => { if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) lastFocusedElementRef.current = null; }}>
      <div className="exp-business-panel__top">
        <div>
          <span className="exp-business-panel__eyebrow" id={contextId}>Tu negocio{industry ? ` · ${industry.name}` : ''}</span>
          <h3 id={titleId}>{selection.businessName}</h3>
        </div>
        <button className="exp-business-panel__close" type="button" aria-label={`Cerrar selección de ${selection.businessName}`} onClick={() => { onRestoreFocus(); onClear(); }}><X size={19} aria-hidden="true" /></button>
      </div>
      {profile ? (
        <div className="exp-business-panel__content">
          <div className="exp-business-panel__copy"><h4>{profile.headline}</h4><p>{profile.description}</p></div>
          <div className="exp-business-panel__tasks"><span>Para tu día a día</span><ul>{profile.tasks.slice(0, 4).map((task, index) => <li key={`${index}-${task}`}><Check size={16} aria-hidden="true" />{task}</li>)}</ul></div>
          <div className="exp-business-panel__example">
            <div className="exp-business-panel__example-detail"><span>Datos de ejemplo</span><strong>{profile.steps[0].title}</strong>{profile.steps[0].fields.slice(0, 2).map(([label, value]) => <p key={label}>{label}: {value}</p>)}</div>
            <button type="button" className="exp-business-panel__example-button" onClick={onExample}>{profile.exampleButtonLabel} <ArrowRight size={16} aria-hidden="true" /></button>
          </div>
        </div>
      ) : (
        <div className="exp-business-panel__content">
          <div className="exp-business-panel__copy"><h4>{industryConversation[selection.industryId] || '¿Cómo organizas hoy el día a día de tu negocio?'}</h4><p>El ejemplo específico para este negocio está pendiente de verificación. Queremos conocer tu operación antes de mostrarte una propuesta.</p></div>
        </div>
      )}
      <div className="exp-business-panel__footer">
        <div className="exp-business-panel__actions">
          <button type="button" className="btn btn-primary exp-primary" onClick={(event) => onAction('contact', event.currentTarget)}>{profile ? 'Hablar sobre mi negocio' : 'Cuéntanos cómo operas'} <ArrowRight size={16} aria-hidden="true" /></button>
          <button type="button" className="exp-business-panel__change" onClick={onChange}>Cambiar negocio</button>
        </div>
        {!siteConfig.contactUrl && <p className="exp-business-panel__notice">Contacto pendiente de configuración.</p>}
      </div>
    </section>
  );
}

export function Industries({ onAction, selection, onSelect, onClear, onExample }: IndustriesProps) {
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectionRequest, setSelectionRequest] = useState(0);
  const openModeRef = useRef<'hover' | 'manual'>('hover');
  const restoreFocusRef = useRef<string | null>(null);
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
  const panelRefs = useRef(new Map<string, HTMLDivElement>());
  const searchRef = useRef<HTMLInputElement | null>(null);
  const businessPanelRef = useRef<HTMLElement | null>(null);
  const lastSelectionRef = useRef<BusinessSelection | null>(selection);
  const pendingSelectionRef = useRef<BusinessSelection | null>(null);
  const focusedPopoverRef = useRef<string | null>(null);
  const hoveredTriggerRef = useRef<string | null>(null);
  const hoveredPanelRef = useRef<string | null>(null);
  const hoverCloseTimerRef = useRef<number | null>(null);
  const searchId = useId();
  const panelPrefix = useId().replace(/:/g, '');
  const businessPanelId = `${panelPrefix}-business`;
  if (selection) lastSelectionRef.current = selection;

  useLayoutEffect(() => {
    const pending = pendingSelectionRef.current;
    if (!pending || !selection || pending.industryId !== selection.industryId || pending.businessName !== selection.businessName) return;
    pendingSelectionRef.current = null;
    focusAndReveal(businessPanelRef.current, 'start');
  }, [selection, selectionRequest]);

  const restoreBusinessFocus = () => {
    const previous = lastSelectionRef.current;
    const card = previous ? buttonRefs.current.get(previous.industryId) : null;
    focusAndReveal(card?.isConnected ? card : searchRef.current);
  };

  const selectBusiness = (industryId: string, businessName: string) => {
    cancelHoverClose();
    restoreFocusRef.current = null;
    const next = { industryId, businessName };
    pendingSelectionRef.current = next;
    // El negocio pulsado se desmontará; conservar un destino antes de cerrar el menú.
    (buttonRefs.current.get(industryId) ?? searchRef.current)?.focus({ preventScroll: true });
    setOpenId(null);
    setSelectionRequest((current) => current + 1);
    onSelect(next);
  };

  const cancelHoverClose = () => {
    if (hoverCloseTimerRef.current !== null) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  };

  useEffect(() => {
    const handleExplore = (event: Event) => {
      const query = (event as CustomEvent<{ query?: unknown }>).detail?.query;
      if (typeof query !== 'string') return;
      cancelHoverClose();
      restoreFocusRef.current = null;
      setOpenId(null);
      setSearch(query);
    };
    window.addEventListener('berriq:explore-industry', handleExplore);
    return () => {
      window.removeEventListener('berriq:explore-industry', handleExplore);
      cancelHoverClose();
    };
  }, []);

  const filtered = useMemo(() => {
    const query = normalize(search);
    return industries.filter((industry) => !query || normalize([industry.name, ...industry.businesses].join(' ')).includes(query));
  }, [search]);

  useEffect(() => {
    if (openId && !filtered.some((industry) => industry.id === openId)) setOpenId(null);
  }, [filtered, openId]);

  useEffect(() => {
    if (hoveredPanelRef.current !== openId) hoveredPanelRef.current = null;
  }, [openId]);

  const setMode = (mode: 'hover' | 'manual') => {
    openModeRef.current = mode;
  };

  const hasFocus = (id: string) => {
    const active = document.activeElement;
    return !!active && (buttonRefs.current.get(id)?.contains(active) || panelRefs.current.get(id)?.contains(active));
  };

  const scheduleHoverClose = (id: string) => {
    cancelHoverClose();
    if (openModeRef.current !== 'hover') return;
    hoverCloseTimerRef.current = window.setTimeout(() => {
      hoverCloseTimerRef.current = null;
      if (openModeRef.current !== 'hover' || hoveredTriggerRef.current === id || hoveredPanelRef.current === id || hasFocus(id)) return;
      setOpenId((current) => current === id ? null : current);
    }, 250);
  };

  const handleFocusLeave = (id: string, next: EventTarget | null) => {
    if (openId !== id) return;
    if (next instanceof Node && (buttonRefs.current.get(id)?.contains(next) || panelRefs.current.get(id)?.contains(next))) return;
    if (hoveredTriggerRef.current !== id && hoveredPanelRef.current !== id) scheduleHoverClose(id);
  };

  const openByHover = (id: string) => {
    if (openId === id) {
      cancelHoverClose();
      return;
    }
    // Neither a manual panel nor a hover panel reached by keyboard may lose focus to the pointer.
    if (openId && hasFocus(openId)) return;
    cancelHoverClose();
    restoreFocusRef.current = null;
    setMode('hover');
    setOpenId(id);
  };

  const toggleByClick = (id: string, panelId: string) => {
    cancelHoverClose();
    restoreFocusRef.current = null;
    trackEvent('industry_click', { industry: id });
    if (openId === id && openModeRef.current === 'manual') {
      setOpenId(null);
    } else {
      const wasHoverOpen = openId === id;
      setMode('manual');
      setOpenId(id);
      // A panel opened by hover is already mounted; move focus into it on activation.
      if (wasHoverOpen) document.getElementById(panelId)?.focus();
    }
  };

  return (
    <section className="section exp-section exp-industries" id="industrias" aria-labelledby="exp-ind-title">
      <div className="container exp-container">
        <div className="exp-heading exp-heading--industries">
          <span className="eyebrow exp-eyebrow"><span className="exp-eyebrow__dot" /> Industrias</span>
          <h2 className="section-title exp-heading__title" id="exp-ind-title">Una plataforma. <span>Muchas formas de trabajar.</span></h2>
          <p className="exp-heading__copy">Selecciona tu negocio y descubre cómo organizar su día a día con berriq.</p>
        </div>
        <div className="exp-industries__search"><SearchBox id={searchId} inputRef={searchRef} label="Busca tu negocio" value={search} onChange={setSearch} placeholder="Busca tu negocio: yoga, hotel, clínica…" /></div>
        <div className="exp-industries__intro"><span>Explora por industria</span><span aria-live="polite">{filtered.length} {filtered.length === 1 ? 'sector' : 'sectores'}</span></div>

        {filtered.length > 0 ? (
          <div className="exp-industry-grid">
            {filtered.map((industry) => {
              const panelId = `${panelPrefix}-${industry.id}`;
              const isOpen = openId === industry.id;
              return (
                <Popover.Root key={industry.id} open={isOpen} onOpenChange={(open) => {
                  if (!open) setOpenId((current) => current === industry.id ? null : current);
                }}>
                  <Popover.Anchor asChild>
                    <button
                      ref={(node) => { if (node) buttonRefs.current.set(industry.id, node); else buttonRefs.current.delete(industry.id); }}
                      className={`exp-industry-card${isOpen ? ' exp-is-open' : ''}${selection?.industryId === industry.id ? ' exp-industry-card--selected' : ''}`}
                      type="button"
                      aria-label={`Explorar negocios de ${industry.name}${selection?.industryId === industry.id ? `; seleccionado: ${selection.businessName}` : ''}`}
                      aria-expanded={isOpen}
                      aria-haspopup="dialog"
                      aria-controls={isOpen ? panelId : undefined}
                      onPointerEnter={(event) => { if (event.pointerType === 'mouse') { hoveredTriggerRef.current = industry.id; openByHover(industry.id); } }}
                      onPointerLeave={(event) => { if (event.pointerType === 'mouse') { if (hoveredTriggerRef.current === industry.id) hoveredTriggerRef.current = null; if (isOpen) scheduleHoverClose(industry.id); } }}
                      onBlur={(event) => handleFocusLeave(industry.id, event.relatedTarget)}
                      onClick={() => toggleByClick(industry.id, panelId)}
                    >
                      <IconTile icon={industry.icon} color={industry.color} small />
                      <span className="exp-industry-card__text"><strong>{industry.name}</strong><span>{industry.businesses.slice(0, 2).join(' · ')} y más</span></span>
                      <ChevronDown className="exp-industry-card__chevron" size={17} aria-hidden="true" />
                    </button>
                  </Popover.Anchor>
                  <Popover.Portal>
                    <Popover.Content
                      id={panelId}
                      ref={(node) => { if (node) panelRefs.current.set(industry.id, node); else panelRefs.current.delete(industry.id); }}
                      className="exp-popover"
                      side="bottom"
                      align="start"
                      sideOffset={8}
                      collisionPadding={16}
                      avoidCollisions
                      tabIndex={-1}
                      aria-label={`Negocios y aplicaciones de ${industry.name}`}
                      onPointerEnter={(event) => { if (event.pointerType === 'mouse') { hoveredPanelRef.current = industry.id; cancelHoverClose(); } }}
                      onPointerLeave={(event) => { if (event.pointerType === 'mouse') { if (hoveredPanelRef.current === industry.id) hoveredPanelRef.current = null; scheduleHoverClose(industry.id); } }}
                      onFocusCapture={() => { focusedPopoverRef.current = industry.id; }}
                      onBlur={(event) => {
                        if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) focusedPopoverRef.current = null;
                        handleFocusLeave(industry.id, event.relatedTarget);
                      }}
                      onOpenAutoFocus={(event) => { if (openModeRef.current === 'hover') event.preventDefault(); }}
                      onInteractOutside={(event) => {
                        if (buttonRefs.current.get(industry.id)?.contains(event.target as Node)) event.preventDefault();
                      }}
                      onCloseAutoFocus={(event) => {
                        event.preventDefault();
                        if (restoreFocusRef.current === industry.id) {
                          restoreFocusRef.current = null;
                          focusAndReveal(buttonRefs.current.get(industry.id) ?? searchRef.current);
                        } else if (focusedPopoverRef.current === industry.id && document.activeElement === document.body) {
                          focusAndReveal(buttonRefs.current.get(industry.id) ?? searchRef.current);
                        }
                        if (focusedPopoverRef.current === industry.id) focusedPopoverRef.current = null;
                      }}
                      onEscapeKeyDown={() => { if (openModeRef.current === 'manual' || hasFocus(industry.id)) restoreFocusRef.current = industry.id; }}
                    >
                      <div className="exp-popover__header"><div><span>Explora la industria</span><h3>{industry.name}</h3></div><Popover.Close className="exp-close exp-close--small" aria-label={`Cerrar ${industry.name}`} onClick={() => { restoreFocusRef.current = industry.id; }}><X size={18} /></Popover.Close></div>
                      <p className="exp-popover__label">Tipos de negocio</p>
                      <ul className="exp-businesses">{industry.businesses.map((business) => {
                        const isSelected = selection?.industryId === industry.id && selection.businessName === business;
                        return <li key={business}><button type="button" className={`exp-businesses__button${isSelected ? ' exp-businesses__button--selected' : ''}`} aria-label={`Seleccionar ${business}, ${industry.name}`} aria-pressed={isSelected} onClick={() => selectBusiness(industry.id, business)}><span>{business}</span>{isSelected && <Check size={15} aria-hidden="true" />}</button></li>;
                      })}</ul>
                      <p className="exp-popover__label">Aplicaciones para explorar</p>
                      <div className="exp-tags exp-tags--industry">{industry.apps.map((app) => <span key={app}>{app}</span>)}</div>
                      <a href="#aplicaciones" className="exp-popover__link" onClick={(event) => {
                        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                        event.preventDefault();
                        cancelHoverClose();
                        restoreFocusRef.current = null;
                        setOpenId(null);
                        window.dispatchEvent(new CustomEvent('berriq:explore-app', { detail: { query: industry.apps[0] ?? '' } }));
                        if (window.location.hash !== '#aplicaciones') window.location.hash = 'aplicaciones';
                        document.getElementById('aplicaciones')?.scrollIntoView({ block: 'start' });
                        document.getElementById('exp-app-title')?.focus({ preventScroll: true });
                      }}>Explorar soluciones <ArrowRight size={16} aria-hidden="true" /></a>
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              );
            })}
          </div>
        ) : (
          <div className="exp-empty"><strong>No encontramos ese negocio.</strong><span>Prueba con otro nombre o cuéntanos cómo operas.</span><button type="button" onClick={() => setSearch('')}>Ver todas las industrias</button></div>
        )}
        {selection && <BusinessPanel selection={selection} panelRef={businessPanelRef} panelId={businessPanelId} onAction={onAction} onExample={onExample} onClear={onClear} onChange={() => focusAndReveal(searchRef.current)} onRestoreFocus={restoreBusinessFocus} />}
        <p className="exp-industries__hint">Selecciona una industria y luego un negocio para conocer más.</p>
        <div className="exp-industry-bottom">
          <div><strong>¿Tu negocio no aparece?</strong><span>Cuéntanos cómo operas.</span></div>
          <button type="button" className="btn btn-secondary exp-contact" onClick={() => onAction('contact')}>Hablar con un especialista <ArrowRight size={16} aria-hidden="true" /></button>
        </div>
        <p className="exp-footnote">Estos sectores son ejemplos de aplicación potencial. El alcance debe validarse para cada negocio; berriq no se presenta como sustituto de sistemas especializados.</p>
      </div>
    </section>
  );
}
