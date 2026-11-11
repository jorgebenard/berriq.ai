import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  CreditCard,
  FileText,
  GraduationCap,
  HeartPulse,
  Hotel,
  Layers3,
  LayoutDashboard,
  Link2,
  ListChecks,
  Menu,
  MessageSquare,
  Network,
  Package,
  Search,
  ShoppingBag,
  Stethoscope,
  Store,
  UsersRound,
  X,
  type LucideIcon,
} from "lucide-react";
import "./hero.css";

type ActionKind = "trial" | "login" | "contact";
type ActionProps = { onAction: (kind: ActionKind) => void };
type MenuKind = "applications" | "industries";

type MenuItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  query: string;
};

const applicationItems: MenuItem[] = [
  { icon: UsersRound, title: "Clientes y ventas", description: "Relaciones y oportunidades", color: "violet", query: "Ventas y clientes" },
  { icon: CalendarDays, title: "Reservas y servicios", description: "Agenda y recurrencia", color: "coral", query: "Reservas y recurrencia" },
  { icon: CreditCard, title: "Membresías", description: "Planes y vigencias", color: "yellow", query: "membresías" },
  { icon: Package, title: "Comercio", description: "Productos e inventario", color: "blue", query: "Comercio" },
  { icon: CircleDollarSign, title: "Finanzas y compras", description: "Cobros y proveedores", color: "mint", query: "Finanzas y compras" },
  { icon: UsersRound, title: "Personas y equipo", description: "Personal y ausencias", color: "pink", query: "Personas" },
  { icon: Building2, title: "Dirección y operación", description: "Sedes y reportes", color: "violet", query: "Dirección y operación" },
];

const industryItems: MenuItem[] = [
  { icon: Stethoscope, title: "Salud", description: "Clínicas y consultorios", color: "mint", query: "Salud" },
  { icon: HeartPulse, title: "Fitness y bienestar", description: "Estudios y centros", color: "coral", query: "Fitness y bienestar" },
  { icon: Store, title: "Comercio", description: "Tiendas y distribuidores", color: "yellow", query: "Comercio" },
  { icon: GraduationCap, title: "Educación", description: "Academias y centros", color: "blue", query: "Educación" },
  { icon: Building2, title: "Oficinas e inmobiliario", description: "Espacios y propiedades", color: "violet", query: "Oficinas e inmobiliario" },
  { icon: Hotel, title: "Hotelería y alojamiento", description: "Hoteles y hospedaje", color: "blue", query: "Hotelería y alojamiento" },
  { icon: ShoppingBag, title: "Más industrias", description: "Explora otras formas de trabajar", color: "pink", query: "" },
];

function MenuContents({ kind, onNavigate }: { kind: MenuKind; onNavigate: () => void }) {
  const isApplications = kind === "applications";
  const target = isApplications ? "#aplicaciones" : "#industrias";
  const items = isApplications ? applicationItems : industryItems;
  const explore = (query: string) => {
    window.dispatchEvent(new CustomEvent(isApplications ? "berriq:explore-app" : "berriq:explore-industry", { detail: { query } }));
    onNavigate();
  };

  return (
    <div className="nav-mega-inner">
      <div className="nav-mega-intro">
        <span className="nav-mega-kicker">{isApplications ? "EXPLORA berriq" : "PARA TU NEGOCIO"}</span>
        <h2>{isApplications ? "Todo trabaja mejor conectado." : "Una plataforma, muchas formas de trabajar."}</h2>
        <p>{isApplications ? "Conoce las herramientas que pueden acompañar tu operación." : "Encuentra ideas para organizar los procesos de tu industria."}</p>
        <a className="nav-mega-all" href={target} onClick={() => explore("")}>
          {isApplications ? "Ver aplicaciones" : "Ver industrias"} <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
      <div className="nav-mega-grid">
        {items.map(({ icon: Icon, title, description, color, query }) => (
          <a className="nav-mega-item" href={target} onClick={() => explore(query)} key={title}>
            <span className={`nav-mega-icon nav-color-${color}`}><Icon size={19} aria-hidden="true" /></span>
            <span><strong>{title}</strong><small>{description}</small></span>
            <ArrowDownRight className="nav-item-arrow" size={15} aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
}

/** Navigation destinations for registration and login remain delegated to the page. */
export function Header({ onAction }: ActionProps) {
  const [activeMenu, setActiveMenu] = useState<MenuKind | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const desktopApplicationRef = useRef<HTMLButtonElement>(null);
  const desktopIndustryRef = useRef<HTMLButtonElement>(null);
  const mobileApplicationRef = useRef<HTMLButtonElement>(null);
  const mobileIndustryRef = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const desktopAppPanelId = `nav-desktop-apps-${generatedId}`;
  const desktopIndustryPanelId = `nav-desktop-industries-${generatedId}`;
  const mobilePanelId = `nav-mobile-panel-${generatedId}`;
  const mobileAppPanelId = `nav-mobile-apps-${generatedId}`;
  const mobileIndustryPanelId = `nav-mobile-industries-${generatedId}`;

  useEffect(() => {
    const breakpoint = window.matchMedia("(max-width: 1120px)");
    const resetNavigation = () => {
      setActiveMenu(null);
      setMobileOpen(false);
    };
    breakpoint.addEventListener("change", resetNavigation);
    return () => breakpoint.removeEventListener("change", resetNavigation);
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
        setMobileOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.key !== "Escape") return;
      if (activeMenu) {
        event.preventDefault();
        const trigger = mobileOpen
          ? activeMenu === "applications" ? mobileApplicationRef : mobileIndustryRef
          : activeMenu === "applications" ? desktopApplicationRef : desktopIndustryRef;
        setActiveMenu(null);
        trigger.current?.focus();
      } else if (mobileOpen) {
        event.preventDefault();
        setMobileOpen(false);
        mobileToggleRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeMenu, mobileOpen]);

  const closeNavigation = () => {
    setActiveMenu(null);
    setMobileOpen(false);
  };
  const toggleMenu = (kind: MenuKind) => setActiveMenu((current) => current === kind ? null : kind);
  const triggerAction = (kind: ActionKind) => {
    closeNavigation();
    onAction(kind);
  };

  return (
    <header className="nav-header" ref={headerRef} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closeNavigation();
    }}>
      <div className="container nav-bar">
        <a className="nav-brand" href="#inicio" aria-label="berriq, ir al inicio" onClick={closeNavigation}>
          <img src="/brand/berriq_violeta.svg" alt="berriq" />
        </a>
        <nav className="nav-desktop" aria-label="Navegación principal">
          <button ref={desktopApplicationRef} className={`nav-link nav-dropdown-trigger${activeMenu === "applications" ? " nav-is-active" : ""}`} type="button" aria-expanded={activeMenu === "applications"} aria-controls={desktopAppPanelId} onClick={() => toggleMenu("applications")}>
            Aplicaciones <ChevronDown size={15} aria-hidden="true" />
          </button>
          <div id={desktopAppPanelId} className="nav-mega" hidden={activeMenu !== "applications" || mobileOpen}>
            <div className="container"><MenuContents kind="applications" onNavigate={closeNavigation} /></div>
          </div>
          <button ref={desktopIndustryRef} className={`nav-link nav-dropdown-trigger${activeMenu === "industries" ? " nav-is-active" : ""}`} type="button" aria-expanded={activeMenu === "industries"} aria-controls={desktopIndustryPanelId} onClick={() => toggleMenu("industries")}>
            Industrias <ChevronDown size={15} aria-hidden="true" />
          </button>
          <div id={desktopIndustryPanelId} className="nav-mega" hidden={activeMenu !== "industries" || mobileOpen}>
            <div className="container"><MenuContents kind="industries" onNavigate={closeNavigation} /></div>
          </div>
          <a className="nav-link" href="#como-funciona" onClick={closeNavigation}>Cómo funciona</a>
          <a className="nav-link" href="#planes" onClick={closeNavigation}>Planes</a>
          <a className="nav-link" href="#recursos" onClick={closeNavigation}>Recursos</a>
        </nav>
        <div className="nav-actions">
          <button className="nav-login" type="button" onClick={() => triggerAction("login")}>Iniciar sesión</button>
          <button className="btn btn-primary nav-trial" type="button" onClick={() => triggerAction("trial")}>Prueba gratis <ArrowRight size={16} aria-hidden="true" /></button>
        </div>
        <button ref={mobileToggleRef} className="nav-mobile-toggle" type="button" aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={mobileOpen} aria-controls={mobilePanelId} onClick={() => { setMobileOpen((open) => !open); setActiveMenu(null); }}>
          {mobileOpen ? <X size={23} aria-hidden="true" /> : <Menu size={23} aria-hidden="true" />}
        </button>
      </div>

      <nav id={mobilePanelId} className="nav-mobile" aria-label="Navegación móvil" hidden={!mobileOpen}>
        <div className="nav-mobile-content">
          <button ref={mobileApplicationRef} className="nav-mobile-row" type="button" aria-expanded={activeMenu === "applications"} aria-controls={mobileAppPanelId} onClick={() => toggleMenu("applications")}>
            Aplicaciones <ChevronDown className={activeMenu === "applications" ? "nav-chevron-open" : ""} size={18} aria-hidden="true" />
          </button>
          <div className="nav-mobile-submenu" id={mobileAppPanelId} hidden={activeMenu !== "applications"}>
            <MenuContents kind="applications" onNavigate={closeNavigation} />
          </div>
          <button ref={mobileIndustryRef} className="nav-mobile-row" type="button" aria-expanded={activeMenu === "industries"} aria-controls={mobileIndustryPanelId} onClick={() => toggleMenu("industries")}>
            Industrias <ChevronDown className={activeMenu === "industries" ? "nav-chevron-open" : ""} size={18} aria-hidden="true" />
          </button>
          <div className="nav-mobile-submenu" id={mobileIndustryPanelId} hidden={activeMenu !== "industries"}>
            <MenuContents kind="industries" onNavigate={closeNavigation} />
          </div>
          <a className="nav-mobile-row" href="#como-funciona" onClick={closeNavigation}>Cómo funciona <ArrowRight size={17} aria-hidden="true" /></a>
          <a className="nav-mobile-row" href="#planes" onClick={closeNavigation}>Planes <ArrowRight size={17} aria-hidden="true" /></a>
          <a className="nav-mobile-row" href="#recursos" onClick={closeNavigation}>Recursos <ArrowRight size={17} aria-hidden="true" /></a>
          <div className="nav-mobile-actions">
            <button className="btn btn-secondary" type="button" onClick={() => triggerAction("login")}>Iniciar sesión</button>
            <button className="btn btn-primary" type="button" onClick={() => triggerAction("trial")}>Prueba gratis <ArrowRight size={16} aria-hidden="true" /></button>
          </div>
        </div>
      </nav>
    </header>
  );
}

function ProductIllustration() {
  return (
    <div className="hero-visual" role="img" aria-label="Ilustración de un panel de gestión con clientes, ventas, pendientes, reservas, membresías y cobros. Datos de ejemplo.">
      <div className="hero-visual-orbit hero-orbit-one" aria-hidden="true" />
      <div className="hero-visual-orbit hero-orbit-two" aria-hidden="true" />
      <div className="hero-decor-icon hero-decor-calendar" aria-hidden="true"><CalendarDays size={21} /></div>
      <div className="hero-decor-icon hero-decor-package" aria-hidden="true"><Package size={21} /></div>
      <div className="hero-dashboard" aria-hidden="true">
        <aside className="hero-dash-sidebar">
          <div className="hero-dash-brand"><img src="/brand/berriq_blanco.svg" alt="" /></div>
          <div className="hero-dash-nav-label">MI ESPACIO</div>
          <div className="hero-dash-nav-item hero-dash-nav-active"><LayoutDashboard /><span>Inicio</span></div>
          <div className="hero-dash-nav-item"><UsersRound /><span>Clientes</span></div>
          <div className="hero-dash-nav-item"><CalendarDays /><span>Reservas</span></div>
          <div className="hero-dash-nav-item"><ShoppingBag /><span>Ventas</span></div>
          <div className="hero-dash-nav-item"><Package /><span>Inventario</span></div>
          <div className="hero-dash-sidebar-bottom"><span className="hero-dash-avatar">B</span><span>Mi negocio<small>Espacio de trabajo</small></span></div>
        </aside>
        <div className="hero-dash-main">
          <div className="hero-dash-top"><span>Mi espacio <span className="hero-dash-divider">/</span> <strong>Inicio</strong></span><span className="hero-dash-search"><Search size={13} /></span></div>
          <div className="hero-dash-content">
            <div className="hero-dash-heading"><div><span className="hero-dash-greeting">TU ESPACIO DE TRABAJO</span><h3>Tu negocio, en orden.</h3><p>Una vista de tu operación</p></div><span className="hero-dash-heading-icon"><Layers3 size={16} /></span></div>
            <div className="hero-dash-metrics">
              <div className="hero-dash-metric"><span className="hero-dash-metric-icon hero-icon-violet"><UsersRound /></span><span>Clientes</span><strong>Contactos</strong><small>Información reunida</small></div>
              <div className="hero-dash-metric"><span className="hero-dash-metric-icon hero-icon-coral"><BarChart3 /></span><span>Ventas</span><strong>Oportunidades</strong><small>En seguimiento</small></div>
              <div className="hero-dash-metric"><span className="hero-dash-metric-icon hero-icon-mint"><ListChecks /></span><span>Pendientes</span><strong>Actividades</strong><small>Por revisar</small></div>
            </div>
            <div className="hero-dash-lower">
              <div className="hero-dash-activity">
                <div className="hero-dash-card-title"><strong>Actividad reciente</strong><span>Vista general</span></div>
                <div className="hero-dash-activity-row"><span className="hero-dash-row-icon hero-icon-violet"><UsersRound /></span><span><strong>Cliente de ejemplo</strong><small>Contacto</small></span><em>Registrado</em></div>
                <div className="hero-dash-activity-row"><span className="hero-dash-row-icon hero-icon-coral"><FileText /></span><span><strong>Propuesta de servicio</strong><small>Oportunidad</small></span><em className="hero-status-warm">En revisión</em></div>
                <div className="hero-dash-activity-row"><span className="hero-dash-row-icon hero-icon-mint"><Check /></span><span><strong>Seguimiento</strong><small>Actividad</small></span><em className="hero-status-light">Pendiente</em></div>
              </div>
              <div className="hero-dash-overview"><div className="hero-dash-card-title"><strong>Por revisar</strong></div><span className="hero-dash-illustration"><ClipboardList size={25} /></span><strong>Todo a la vista</strong><p>Consulta tus pendientes en un solo lugar.</p><span className="hero-dash-overview-link">Ver actividades <ArrowRight size={11} /></span></div>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-float-card hero-float-reservation" aria-hidden="true"><span className="hero-float-icon hero-icon-coral"><CalendarDays /></span><span><small>RESERVA</small><strong>Servicio de ejemplo</strong><em>Programada</em></span></div>
      <div className="hero-float-card hero-float-membership" aria-hidden="true"><span className="hero-float-icon hero-icon-violet"><CreditCard /></span><span><small>MEMBRESÍA</small><strong>Plan de ejemplo</strong><em>Vigencia</em></span></div>
      <div className="hero-float-card hero-float-payment" aria-hidden="true"><span className="hero-float-icon hero-icon-mint"><CircleDollarSign /></span><span><small>COBRO</small><strong>Seguimiento</strong><em>Por revisar</em></span></div>
      <p className="hero-example-label"><span /> Vista ilustrativa · datos de ejemplo</p>
    </div>
  );
}

export function Hero({ onAction }: ActionProps) {
  return (
    <section id="inicio" className="hero-section">
      <div className="container hero-layout">
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow"><span className="hero-eyebrow-dot" /> Software de gestión empresarial</div>
          <h1>Clientes, ventas y operación. <span>Todo conectado.</span></h1>
          <p className="hero-description">berriq reúne CRM, reservas, membresías, inventario, equipo y seguimiento de cobros en una plataforma modular. Organiza tu negocio y consulta su información sin saltar entre herramientas.</p>
          <div className="hero-actions">
            <button className="btn btn-primary hero-primary" type="button" onClick={() => onAction("trial")}>Prueba berriq gratis <ArrowRight size={18} aria-hidden="true" /></button>
            <a className="btn btn-secondary hero-secondary" href="#aplicaciones">Explorar aplicaciones <ArrowRight size={18} aria-hidden="true" /></a>
          </div>
          <p className="hero-support"><span className="hero-support-icon"><Clock3 size={13} aria-hidden="true" /></span> Registro pendiente de conexión</p>
        </div>
        <ProductIllustration />
      </div>
      <div className="hero-bottom-line" aria-hidden="true" />
    </section>
  );
}

const problemItems = [
  { icon: MessageSquare, text: "Clientes y oportunidades repartidos entre mensajes y hojas de cálculo." },
  { icon: UsersRound, text: "Equipos que trabajan con información diferente." },
  { icon: ClipboardList, text: "Cobros, reservas y pendientes difíciles de supervisar." },
];
const benefitItems = [
  { icon: Layers3, title: "Centraliza", text: "Encuentra la información en un mismo entorno.", color: "violet" },
  { icon: Link2, title: "Coordina", text: "Conecta personas y procesos.", color: "coral" },
  { icon: BarChart3, title: "Supervisa", text: "Consulta pendientes y resultados.", color: "mint" },
];

export function Benefits() {
  return (
    <section className="section benefit-section" aria-labelledby="benefit-title">
      <div className="container benefit-container">
        <div className="benefit-heading">
          <span className="eyebrow benefit-eyebrow"><span /> UNA FORMA MÁS SIMPLE DE TRABAJAR</span>
          <h2 id="benefit-title" className="section-title">Menos información dispersa.<br /><span>Más control de tu negocio.</span></h2>
          <p>Cuando la información se encuentra en distintos lugares, es más difícil tener una visión completa. Dale a tu operación un punto de encuentro.</p>
        </div>
        <div className="benefit-connection">
          <div className="benefit-problems">
            <div className="benefit-panel-heading"><span className="benefit-panel-label">EL DÍA A DÍA</span><span className="benefit-panel-note">Información dispersa</span></div>
            <div className="benefit-problem-list">
              {problemItems.map(({ icon: Icon, text }) => <div className="benefit-problem" key={text}><span className="benefit-problem-icon"><Icon size={19} aria-hidden="true" /></span><p>{text}</p></div>)}
            </div>
          </div>
          <div className="benefit-bridge" aria-hidden="true"><span><Network size={24} /></span><ArrowRight size={17} /></div>
          <div className="benefit-solutions">
            <div className="benefit-panel-heading"><span className="benefit-panel-label">CON berriq</span><span className="benefit-connected-label"><span /> Una operación conectada</span></div>
            <div className="benefit-solution-list">
              {benefitItems.map(({ icon: Icon, title, text, color }) => <div className="benefit-solution" key={title}><span className={`benefit-solution-icon benefit-icon-${color}`}><Icon size={20} aria-hidden="true" /></span><div><h3>{title}</h3><p>{text}</p></div><ArrowRight className="benefit-solution-arrow" size={17} aria-hidden="true" /></div>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
