import { useEffect, useId, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Popover from '@radix-ui/react-popover';
import { ArrowRight, ChevronDown, Search, X, type LucideIcon } from 'lucide-react';
import { trackEvent } from './siteConfig';
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

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();

function IconTile({ icon: Icon, color, small = false }: { icon: LucideIcon; color: CatalogColor; small?: boolean }) {
  return (
    <span className={`exp-icon exp-icon--${color}${small ? ' exp-icon--small' : ''}`} aria-hidden="true">
      <span className="exp-icon__shine" />
      <Icon className="exp-icon__glyph" strokeWidth={1.8} />
      <span className="exp-icon__dot" />
    </span>
  );
}

function SearchBox({ value, onChange, placeholder, label, id }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  id: string;
}) {
  return (
    <div className="exp-search">
      <label className="exp-sr-only" htmlFor={id}>{label}</label>
      <Search size={19} aria-hidden="true" />
      <input id={id} type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}

export function Applications({ onAction }: ExplorerProps) {
  const [category, setCategory] = useState<AppCategoryId | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CatalogApp | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const actionStartedRef = useRef(false);
  const searchId = useId();

  useEffect(() => {
    const handleExplore = (event: Event) => {
      const query = (event as CustomEvent<{ query?: unknown }>).detail?.query;
      if (typeof query !== 'string') return;
      const app = applications.find((item) => normalize(item.name) === normalize(query));
      setCategory('all');
      setSearch(app?.name ?? query);
    };
    window.addEventListener('berriq:explore-app', handleExplore);
    return () => window.removeEventListener('berriq:explore-app', handleExplore);
  }, []);

  const filtered = useMemo(() => {
    const query = normalize(search);
    return applications.filter((app) => {
      const categoryName = appCategories.find((item) => item.id === app.category)?.label ?? '';
      const matchesCategory = category === 'all' || app.category === category;
      const searchable = [app.name, app.summary, categoryName, ...(app.keywords ?? [])].join(' ');
      return matchesCategory && (!query || normalize(searchable).includes(query));
    });
  }, [category, search]);

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
            <p className="exp-heading__copy">Explora las áreas de berriq y descubre cómo pueden trabajar juntas.</p>
          </div>
          <div className="exp-heading__aside"><span className="exp-aside__number">{applications.length}</span><span>formas de organizar<br />tu operación</span></div>
        </div>

        <div className="exp-app-controls">
          <div className="exp-filter-list" role="group" aria-label="Filtrar aplicaciones por categoría">
            <button className={`exp-filter${category === 'all' ? ' exp-is-active' : ''}`} type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>Todas</button>
            {appCategories.map((item) => (
              <button key={item.id} className={`exp-filter${category === item.id ? ' exp-is-active' : ''}`} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{item.label}</button>
            ))}
          </div>
          <SearchBox id={searchId} label="Buscar aplicaciones" value={search} onChange={setSearch} placeholder="Buscar una aplicación..." />
        </div>

        <div className="exp-result-line" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'aplicación' : 'aplicaciones'} para explorar</div>
        {filtered.length > 0 ? (
          <div className="exp-app-grid">
            {filtered.map((app) => (
              <button className="exp-app-card" key={app.id} type="button" onClick={(event) => openApp(app, event.currentTarget)} aria-label={`Conocer ${app.name}`}>
                <IconTile icon={app.icon} color={app.color} />
                <span className="exp-app-card__title">{app.name}</span>
                <span className="exp-app-card__summary">{app.summary}</span>
                <span className="exp-app-card__more">Ver aplicación <ArrowRight size={14} aria-hidden="true" /></span>
              </button>
            ))}
          </div>
        ) : category === 'automation' ? (
          <div className="exp-empty"><strong>Funciones pendientes de verificación.</strong><span>Las capacidades de automatización e IA se mostrarán aquí cuando estén confirmadas.</span><button type="button" onClick={() => { setSearch(''); setCategory('all'); }}>Ver todas las aplicaciones</button></div>
        ) : (
          <div className="exp-empty"><strong>No encontramos aplicaciones con esa búsqueda.</strong><span>Prueba otro término o selecciona otra categoría.</span><button type="button" onClick={() => { setSearch(''); setCategory('all'); }}>Ver todas las aplicaciones</button></div>
        )}
        <p className="exp-footnote">La disponibilidad de módulos, conexiones y planes se confirmará según el alcance de tu operación. Las funciones de automatización e IA están pendientes de validación.</p>
      </div>

      <Dialog.Root open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        {selected && (
          <Dialog.Portal>
            <Dialog.Overlay className="exp-dialog-overlay" />
            <Dialog.Content className="exp-dialog" onCloseAutoFocus={(event) => {
              event.preventDefault();
              if (!actionStartedRef.current) triggerRef.current?.focus();
            }}>
              <Dialog.Close className="exp-close" aria-label="Cerrar ficha"><X size={20} /></Dialog.Close>
              <div className="exp-dialog__top">
                <IconTile icon={selected.icon} color={selected.color} />
                <div><span className="exp-dialog__category">{appCategories.find((item) => item.id === selected.category)?.label}</span><Dialog.Title className="exp-dialog__title">{selected.name}</Dialog.Title><Dialog.Description className="exp-dialog__description">{selected.summary}</Dialog.Description></div>
              </div>
              <div className="exp-dialog__body">
                <div><h3>Qué puedes gestionar</h3><p>{selected.manages}</p></div>
                <div><h3>La tarea que facilita</h3><p>{selected.helps}</p></div>
                <div><h3>Áreas relacionadas</h3><div className="exp-tags">{selected.connections.map((connection) => <span key={connection}>{connection}</span>)}</div></div>
                <div className="exp-example"><span>Ejemplo ilustrativo</span><p>{selected.example}</p></div>
                <p className="exp-dialog__notice">Ejemplo conceptual. La disponibilidad, el alcance y las conexiones están pendientes de verificación.</p>
              </div>
              <div className="exp-dialog__footer"><p>Solicita más información sobre el alcance.</p><button className="btn btn-primary exp-primary" type="button" onClick={() => { actionStartedRef.current = true; setSelected(null); onAction('contact', triggerRef.current); }}>Solicitar una demo <ArrowRight size={16} aria-hidden="true" /></button></div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </Dialog.Root>
    </section>
  );
}

export function Industries({ onAction }: ExplorerProps) {
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const openModeRef = useRef<'hover' | 'manual'>('hover');
  const restoreFocusRef = useRef<string | null>(null);
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
  const panelRefs = useRef(new Map<string, HTMLDivElement>());
  const hoveredTriggerRef = useRef<string | null>(null);
  const hoveredPanelRef = useRef<string | null>(null);
  const hoverCloseTimerRef = useRef<number | null>(null);
  const searchId = useId();
  const panelPrefix = useId().replace(/:/g, '');

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
          <p className="exp-heading__copy">Encuentra tu industria y explora cómo berriq puede adaptarse a tu operación.</p>
        </div>
        <div className="exp-industries__search"><SearchBox id={searchId} label="Busca tu negocio" value={search} onChange={setSearch} placeholder="Busca tu negocio: yoga, hotel, clínica…" /></div>
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
                      className={`exp-industry-card${isOpen ? ' exp-is-open' : ''}`}
                      type="button"
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
                      onBlur={(event) => handleFocusLeave(industry.id, event.relatedTarget)}
                      onOpenAutoFocus={(event) => { if (openModeRef.current === 'hover') event.preventDefault(); }}
                      onInteractOutside={(event) => {
                        if (buttonRefs.current.get(industry.id)?.contains(event.target as Node)) event.preventDefault();
                      }}
                      onCloseAutoFocus={(event) => {
                        event.preventDefault();
                        if (restoreFocusRef.current === industry.id) {
                          restoreFocusRef.current = null;
                          buttonRefs.current.get(industry.id)?.focus();
                        }
                      }}
                      onEscapeKeyDown={() => { if (openModeRef.current === 'manual' || hasFocus(industry.id)) restoreFocusRef.current = industry.id; }}
                    >
                      <div className="exp-popover__header"><div><span>Explora la industria</span><h3>{industry.name}</h3></div><Popover.Close className="exp-close exp-close--small" aria-label={`Cerrar ${industry.name}`} onClick={() => { restoreFocusRef.current = industry.id; }}><X size={18} /></Popover.Close></div>
                      <p className="exp-popover__label">Tipos de negocio</p>
                      <ul className="exp-businesses">{industry.businesses.map((business) => <li key={business}>{business}</li>)}</ul>
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
        <p className="exp-industries__hint">Selecciona una industria para conocer los negocios y aplicaciones relacionados.</p>
        <div className="exp-industry-bottom">
          <div><strong>¿Tu negocio no aparece?</strong><span>Cuéntanos cómo operas.</span></div>
          <button type="button" className="btn btn-secondary exp-contact" onClick={() => onAction('contact')}>Hablar con un especialista <ArrowRight size={16} aria-hidden="true" /></button>
        </div>
        <p className="exp-footnote">Estos sectores son ejemplos de aplicación potencial. El alcance debe validarse para cada negocio; berriq no se presenta como sustituto de sistemas especializados.</p>
      </div>
    </section>
  );
}
