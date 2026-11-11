import { useEffect, useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Boxes,
  Building2,
  CalendarDays,
  Circle,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Layers3,
  ListChecks,
  Package,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { getVerifiedBusinessProfile, type BusinessSelection } from "./businessProfiles";
import { siteConfig } from "./siteConfig";
import "./experience.css";

type ActionKind = "trial" | "login" | "contact";
type ActionProps = { onAction?: (kind: ActionKind) => void };
type ExperienceProps = ActionProps & {
  selection?: BusinessSelection | null;
  onChangeBusiness?: () => void;
  exampleRequest?: number;
};

type DemoStep = {
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  fields: [string, string][];
  next: string;
};

type Journey = {
  id: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  steps: DemoStep[];
};

// Los datos describen recorridos ilustrativos, no registros ni capturas reales.
const journeys: Journey[] = [
  {
    id: "servicios",
    label: "Servicios",
    subtitle: "De la oportunidad al cobro",
    icon: CalendarDays,
    steps: [
      {
        label: "Prospecto",
        title: "Una conversación empieza aquí",
        description: "El recorrido comienza con la información de una persona interesada y el servicio que busca.",
        icon: UserRound,
        fields: [["Contacto", "Andrea Pérez"], ["Interés", "Consultoría de negocio"], ["Origen", "Consulta inicial"]],
        next: "Cotización",
      },
      {
        label: "Cotización",
        title: "Una propuesta con contexto",
        description: "La cotización ilustra el alcance de un servicio para continuar la conversación comercial.",
        icon: FileText,
        fields: [["Propuesta", "Consultoría de negocio"], ["Alcance", "Sesión inicial"], ["Contacto", "Andrea Pérez"]],
        next: "Servicio",
      },
      {
        label: "Servicio",
        title: "Del acuerdo al servicio",
        description: "La propuesta y el servicio forman parte de un mismo recorrido, desde el interés hasta la atención.",
        icon: CalendarDays,
        fields: [["Servicio", "Sesión de consultoría"], ["Responsable", "Equipo de servicios"], ["Referencia", "Propuesta de ejemplo"]],
        next: "Seguimiento de cobro",
      },
      {
        label: "Seguimiento de cobro",
        title: "El seguimiento también cuenta",
        description: "Un importe de ejemplo permite visualizar el seguimiento sin representar un cobro real.",
        icon: CircleDollarSign,
        fields: [["Concepto", "Sesión de consultoría"], ["Importe ilustrativo", "$2,400 MXN"], ["Seguimiento", "Por revisar"]],
        next: "Fin del recorrido",
      },
    ],
  },
  {
    id: "membresias",
    label: "Membresías",
    subtitle: "Una relación que continúa",
    icon: BadgeCheck,
    steps: [
      {
        label: "Cliente",
        title: "Conoce a tu cliente",
        description: "Todo comienza con un cliente y la información necesaria para comprender su relación con el negocio.",
        icon: UserRound,
        fields: [["Cliente", "Lucía Moreno"], ["Interés", "Plan de bienestar"], ["Tipo", "Cliente de ejemplo"]],
        next: "Plan",
      },
      {
        label: "Plan",
        title: "Un plan para su necesidad",
        description: "El ejemplo relaciona a un cliente con el plan que le interesa, sin activar una membresía.",
        icon: Layers3,
        fields: [["Plan de ejemplo", "Bienestar mensual"], ["Cliente", "Lucía Moreno"], ["Frecuencia", "Mensual"]],
        next: "Vigencia",
      },
      {
        label: "Vigencia",
        title: "La vigencia, a la vista",
        description: "Las fechas ilustran cómo se puede entender el periodo de una membresía.",
        icon: CalendarDays,
        fields: [["Plan de ejemplo", "Bienestar mensual"], ["Periodo ilustrativo", "1–30 de abril"], ["Cliente", "Lucía Moreno"]],
        next: "Renovación",
      },
      {
        label: "Renovación",
        title: "Una relación que continúa",
        description: "Al acercarse el final del periodo, la renovación es el siguiente punto del recorrido ilustrativo.",
        icon: RefreshCw,
        fields: [["Plan de ejemplo", "Bienestar mensual"], ["Siguiente periodo", "Mayo"], ["Seguimiento", "Renovación por revisar"]],
        next: "Fin del recorrido",
      },
    ],
  },
  {
    id: "productos",
    label: "Productos",
    subtitle: "Del catálogo al seguimiento",
    icon: ShoppingBag,
    steps: [
      {
        label: "Catálogo",
        title: "Todo empieza con un producto",
        description: "El catálogo reúne la información de los productos que forman parte de la oferta del negocio.",
        icon: Package,
        fields: [["Producto de ejemplo", "Botella reutilizable"], ["Categoría", "Accesorios"], ["Referencia", "BOT-01"]],
        next: "Pedido",
      },
      {
        label: "Pedido",
        title: "Un pedido en contexto",
        description: "Este paso muestra cómo un producto puede formar parte de un pedido de ejemplo, sin crear uno real.",
        icon: ShoppingBag,
        fields: [["Referencia", "Pedido de ejemplo"], ["Producto", "Botella reutilizable"], ["Cantidad ilustrativa", "2 unidades"]],
        next: "Inventario",
      },
      {
        label: "Inventario",
        title: "Productos y existencias",
        description: "La información de inventario aporta contexto al recorrido del producto y su disponibilidad.",
        icon: Boxes,
        fields: [["Producto", "Botella reutilizable"], ["Ubicación ilustrativa", "Almacén principal"], ["Existencia de ejemplo", "24 unidades"]],
        next: "Seguimiento",
      },
      {
        label: "Seguimiento",
        title: "Continúa el recorrido",
        description: "El seguimiento ayuda a representar los siguientes pasos del pedido, sin simular un envío real.",
        icon: ListChecks,
        fields: [["Referencia", "Pedido de ejemplo"], ["Detalle", "2 botellas reutilizables"], ["Seguimiento", "Por revisar"]],
        next: "Fin del recorrido",
      },
    ],
  },
  {
    id: "sedes",
    label: "Sedes",
    subtitle: "Una operación coordinada",
    icon: Building2,
    steps: [
      {
        label: "Equipo",
        title: "Las personas en el centro",
        description: "Un equipo de ejemplo inicia el recorrido de una operación con más de una sede.",
        icon: UsersRound,
        fields: [["Equipo", "Operaciones"], ["Sedes ilustrativas", "Centro y Norte"], ["Enfoque", "Coordinación"]],
        next: "Actividad",
      },
      {
        label: "Actividad",
        title: "Una vista de la actividad",
        description: "Las actividades muestran el contexto de trabajo de cada sede en este ejemplo.",
        icon: ClipboardList,
        fields: [["Sede de ejemplo", "Centro"], ["Actividad", "Revisión de pendientes"], ["Equipo", "Operaciones"]],
        next: "Indicadores",
      },
      {
        label: "Indicadores",
        title: "Información para observar",
        description: "Los indicadores de ejemplo ayudan a ilustrar cómo consultar información de distintas sedes.",
        icon: ListChecks,
        fields: [["Sedes de ejemplo", "Centro y Norte"], ["Vista", "Actividad por sede"], ["Periodo ilustrativo", "Este mes"]],
        next: "Supervisión",
      },
      {
        label: "Supervisión",
        title: "Una mirada más amplia",
        description: "La supervisión reúne el contexto del equipo y la actividad para una visión de la operación.",
        icon: Building2,
        fields: [["Vista de ejemplo", "Resumen de sedes"], ["Equipo", "Operaciones"], ["Seguimiento", "Revisión general"]],
        next: "Fin del recorrido",
      },
    ],
  },
];

export function Experience({ selection = null, onChangeBusiness, exampleRequest = 0 }: ExperienceProps = {}) {
  const profile = getVerifiedBusinessProfile(selection);
  const profileJourneyId = profile?.journeyId;
  const [journeyId, setJourneyId] = useState(profileJourneyId ?? journeys[0].id);
  const [stepIndex, setStepIndex] = useState("0");
  const industryId = selection?.industryId;
  const businessName = selection?.businessName;

  useEffect(() => {
    if (profileJourneyId) setJourneyId(profileJourneyId);
    setStepIndex("0");
  }, [industryId, businessName, exampleRequest, profileJourneyId]);

  const displayedJourneys = journeys.map((journey) => {
    if (!profile || profile.journeyId !== journey.id) return journey;
    return {
      ...journey,
      steps: profile.steps.map((step, index) => ({
        ...step,
        icon: journey.steps[index]?.icon ?? journey.icon,
      })),
    };
  });

  return (
    <section className="xp-experience section" id="como-funciona" aria-labelledby="xp-experience-title">
      <div className="container">
        <div className="xp-section-heading xp-section-heading-center">
          <span className="eyebrow xp-eyebrow">UNA OPERACIÓN CONECTADA</span>
          <h2 className="section-title" id="xp-experience-title" tabIndex={-1}>Así se conecta tu día a día.</h2>
          <p>Descubre cómo las distintas áreas de tu negocio pueden formar parte de una misma historia.</p>
        </div>

        {selection && (
          <div className="xp-business-context">
            <div className="xp-business-context-copy" role="status" aria-live="polite">
              <strong>{profile ? `Ejemplo para: ${selection.businessName}` : `Ejemplo para ${selection.businessName} pendiente de validación`}</strong>
              <p>{profile
                ? `El recorrido de ${journeys.find((journey) => journey.id === profile.journeyId)?.label ?? "este negocio"} está adaptado; los demás son ejemplos generales.`
                : "Mientras tanto, explora los cuatro ejemplos generales. No están personalizados para este negocio."}</p>
            </div>
            {onChangeBusiness && <button type="button" className="xp-business-change" onClick={onChangeBusiness}>Cambiar negocio</button>}
          </div>
        )}

        <Tabs.Root
          id="xp-journeys"
          value={journeyId}
          onValueChange={(value) => { setJourneyId(value); setStepIndex("0"); }}
          className="xp-journeys"
        >
          <Tabs.List id="xp-journeys-tabs" className="xp-journey-list" aria-label="Elige un recorrido">
            {displayedJourneys.map((journey) => {
              const Icon = journey.icon;
              return (
                <Tabs.Trigger key={journey.id} value={journey.id} className="xp-journey-trigger">
                  <span className={`xp-journey-icon xp-journey-icon-${journey.id}`}><Icon size={21} strokeWidth={1.8} aria-hidden="true" /></span>
                  <span className="xp-journey-label"><strong>{journey.label}</strong><small>{journey.subtitle}</small></span>
                  <ArrowRight className="xp-journey-arrow" size={17} aria-hidden="true" />
                </Tabs.Trigger>
              );
            })}
          </Tabs.List>

          {displayedJourneys.map((journey) => (
            <Tabs.Content key={journey.id} value={journey.id} className="xp-journey-content">
              <Tabs.Root value={stepIndex} onValueChange={setStepIndex} orientation="vertical" className="xp-experience-layout">
                <div className="xp-steps-column">
                  <div className="xp-steps-heading">
                    <span className="xp-mini-label">EXPLORA EL RECORRIDO</span>
                    <h3>{profile?.journeyId === journey.id ? profile.headline : journey.label}</h3>
                    {selection && <p className="xp-journey-kind">{profile?.journeyId === journey.id ? "Ejemplo adaptado para este negocio." : "Ejemplo general, no personalizado para este negocio."}</p>}
                    <p>Selecciona cada paso para ver cómo se conecta con el siguiente.</p>
                  </div>
                  <Tabs.List className="xp-step-list" aria-label={`Pasos del recorrido de ${journey.label.toLowerCase()}`}>
                    {journey.steps.map((step, index) => (
                      <Tabs.Trigger key={index} value={String(index)} className="xp-step-trigger">
                        <span className="xp-step-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                        <span>{step.label}</span>
                        <ArrowRight size={16} className="xp-step-arrow" aria-hidden="true" />
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>
                </div>

                <div className="xp-demo-stage">
                  {journey.steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <Tabs.Content key={index} value={String(index)} className="xp-demo-content">
                        <div className="xp-demo-topline"><span>VISTA ILUSTRATIVA</span><span>{String(index + 1).padStart(2, "0")} / {String(journey.steps.length).padStart(2, "0")}</span></div>
                        <div className="xp-demo-intro">
                          <span className="xp-demo-icon"><Icon size={25} strokeWidth={1.8} aria-hidden="true" /></span>
                          <div><span className="xp-demo-kicker">{step.label}</span><h4>{step.title}</h4></div>
                        </div>
                        <p className="xp-demo-description">{step.description}</p>
                        <div className="xp-demo-card">
                          <div className="xp-demo-card-header">
                            <div><span className="xp-demo-card-dot" aria-hidden="true" /> <strong>Detalle del ejemplo</strong></div>
                            <span className="xp-demo-badge">Datos demostrativos</span>
                          </div>
                          <dl className="xp-demo-fields">
                            {step.fields.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}
                          </dl>
                          <div className="xp-demo-next"><span>Siguiente paso</span><strong>{step.next} <ArrowRight size={15} aria-hidden="true" /></strong></div>
                        </div>
                        <p className="xp-demo-note">Ejemplo conceptual: no genera ventas, pagos ni reservas.</p>
                      </Tabs.Content>
                    );
                  })}
                </div>
              </Tabs.Root>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>
    </section>
  );
}

export function Automation(_props: ActionProps = {}) {
  return (
    <section className="xp-automation section" aria-labelledby="xp-automation-title">
      <div className="container xp-automation-grid">
        <div className="xp-automation-copy">
          <span className="eyebrow xp-eyebrow xp-eyebrow-light"><span className="xp-yellow-dot" aria-hidden="true" /> MIRANDO HACIA ADELANTE</span>
          <h2 className="section-title" id="xp-automation-title">Menos tareas repetitivas. <span>Más tiempo para dirigir.</span></h2>
          <p>Una operación conectada abre espacio para pensar en lo que sigue. Las capacidades de automatización e inteligencia artificial de berriq están pendientes de verificación.</p>
          <div className="xp-pending"><span className="xp-pending-icon"><ClipboardList size={18} aria-hidden="true" /></span><span><strong>Alcance pendiente de confirmar</strong><br />Esta sección se completará cuando conozcamos las funciones disponibles y sus condiciones.</span></div>
        </div>
        <div className="xp-automation-visual" aria-label="Información sobre automatización e inteligencia artificial pendiente de verificación">
          <div className="xp-automation-orbit xp-automation-orbit-one" aria-hidden="true" />
          <div className="xp-automation-orbit xp-automation-orbit-two" aria-hidden="true" />
          <div className="xp-automation-card">
            <div className="xp-automation-card-head"><span className="xp-auto-spark"><Sparkles size={21} aria-hidden="true" /></span><span className="xp-auto-tag">EN REVISIÓN</span></div>
            <span className="xp-auto-small">AUTOMATIZACIÓN E IA</span>
            <h3>Primero, claridad.</h3>
            <p>Compartiremos los detalles cuando estén verificados.</p>
            <div className="xp-auto-divider" />
            <div className="xp-auto-row"><span><Circle size={13} aria-hidden="true" /> Funciones disponibles</span><strong>Por confirmar</strong></div>
            <div className="xp-auto-row"><span><Circle size={13} aria-hidden="true" /> Alcance y condiciones</span><strong>Por confirmar</strong></div>
          </div>
          <span className="xp-auto-accent" aria-hidden="true"><ArrowDownLeft size={19} /></span>
        </div>
      </div>
    </section>
  );
}

const faqs = [
  ["¿Qué es berriq?", "berriq es una propuesta de plataforma modular de gestión empresarial, con áreas como clientes, ventas, reservas, membresías, inventario, equipo y seguimiento de cobros. La disponibilidad de cada herramienta está pendiente de verificación."],
  ["¿Para qué tipos de negocio sirve?", "La plataforma puede explorarse para distintos tipos de operación, desde servicios y comercio hasta organizaciones con varias sedes. El alcance para necesidades especializadas debe verificarse para cada caso."],
  ["¿Necesito activar todas las aplicaciones?", "berriq tiene un enfoque modular para adaptar las herramientas a cada operación. La disponibilidad y las condiciones de activación de cada aplicación están pendientes de confirmación."],
  ["¿Qué incluye la prueba?", "La duración, las condiciones y el alcance de la prueba están pendientes de confirmación. El registro se conectará cuando esté disponible el proceso real."],
  ["¿Qué cuenta como usuario interno?", "Es una persona del equipo que accede a la plataforma para trabajar en la operación. La definición exacta y los permisos incluidos están pendientes de confirmación."],
  ["¿Mis clientes necesitan una licencia?", "Los clientes del portal no equivalen a usuarios administrativos. Las condiciones de acceso y cualquier licencia aplicable están pendientes de confirmación."],
  ["¿Puedo añadir usuarios y sedes?", "La propuesta contempla bloques de usuarios adicionales y sedes adicionales. Cada sede adicional no incluye usuarios; las capacidades y condiciones aplicables deben confirmarse."],
  ["¿Puedo usar mi marca?", "Las opciones de personalización de marca están pendientes de confirmación. Consulta el alcance disponible para tu operación."],
  ["¿Qué cuesta la implementación?", "El costo y el alcance de la implementación aún no están confirmados. Podemos revisar las necesidades de tu negocio antes de informarte condiciones."],
  ["¿Qué pasa si necesito varias empresas?", "Para varias empresas independientes o una operación especial, es necesario evaluar el alcance y las condiciones de berriq a medida."],
  ["¿Qué funciones de IA están disponibles?", "Las funciones de inteligencia artificial y su disponibilidad están pendientes de verificación. Compartiremos su alcance cuando esté confirmado."],
  ["¿Cómo cancelo o exporto mi información?", "Los procesos y condiciones de cancelación y exportación de datos están pendientes de confirmación. Consulta estos detalles antes de contratar."],
] as const;

export function FAQ(_props: ActionProps = {}) {
  return (
    <section className="xp-faq section" id="recursos" aria-labelledby="xp-faq-title">
      <div className="container xp-faq-grid">
        <div className="xp-faq-intro">
          <span className="eyebrow xp-eyebrow">PREGUNTAS FRECUENTES</span>
          <h2 className="section-title" id="xp-faq-title">Hablemos claro.</h2>
          <p>Todo lo que necesitas saber para empezar a conocer berriq. Si algo aún está por confirmar, te lo decimos.</p>
          <span className="xp-faq-deco" aria-hidden="true"><Sparkles size={24} /></span>
        </div>
        <Accordion.Root type="single" collapsible className="xp-accordion">
          {faqs.map(([question, answer], index) => (
            <Accordion.Item key={question} value={`faq-${index}`} className="xp-accordion-item">
              <Accordion.Header className="xp-accordion-heading">
                <Accordion.Trigger className="xp-accordion-trigger"><span>{question}</span><span className="xp-accordion-icon"><ChevronDown size={18} aria-hidden="true" /></span></Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="xp-accordion-content"><p>{answer}</p></Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}

export function Closing({ onAction }: ActionProps = {}) {
  const [pending, setPending] = useState<ActionKind | null>(null);
  function handleAction(kind: ActionKind) {
    if (onAction) { onAction(kind); return; }
    setPending(kind);
  }
  return (
    <section className="xp-closing section" aria-labelledby="xp-closing-title">
      <div className="container">
        <div className="xp-closing-panel">
          <div className="xp-closing-copy">
            <span className="xp-closing-eyebrow"><span aria-hidden="true" /> SIGAMOS EN CONTACTO</span>
            <h2 className="section-title" id="xp-closing-title">Dale a tu negocio una forma más conectada de trabajar.</h2>
            <p>Explora las herramientas de berriq y descubre cómo organizar tu operación desde un solo lugar.</p>
            <div className="xp-closing-actions">
              <button type="button" className="btn btn-primary xp-closing-primary" onClick={() => handleAction("trial")}>Prueba berriq gratis <ArrowRight size={18} aria-hidden="true" /></button>
              <button type="button" className="btn btn-secondary xp-closing-secondary" onClick={() => handleAction("contact")}>Hablar con un especialista <ArrowUpRight size={17} aria-hidden="true" /></button>
            </div>
            {pending && <p className="xp-closing-pending" role="status">{pending === "trial" ? "El acceso a la prueba está pendiente de conexión y confirmación de condiciones." : "El canal de contacto está pendiente de confirmación."}</p>}
          </div>
          <div className="xp-closing-art" aria-hidden="true">
            <div className="xp-closing-ring xp-closing-ring-one" />
            <div className="xp-closing-ring xp-closing-ring-two" />
            <div className="xp-closing-tile"><Layers3 size={42} strokeWidth={1.5} /></div>
            <span className="xp-closing-spark"><Sparkles size={23} /></span>
            <span className="xp-closing-dot" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer({ onAction }: ActionProps = {}) {
  const [notice, setNotice] = useState("");
  function contact() {
    if (onAction) { onAction("contact"); return; }
    setNotice("El canal de contacto está pendiente de confirmación.");
  }
  return (
    <footer className="xp-footer">
      <div className="container">
        <div className="xp-footer-main">
          <div className="xp-footer-brand">
            <img src="/brand/berriq_blanco.svg" alt="berriq" width="132" />
            <p>Una forma más conectada de trabajar.</p>
          </div>
          <nav className="xp-footer-nav" aria-label="Navegación del pie de página">
            <div><h2>Explora</h2><a href="#aplicaciones">Producto</a><a href="#industrias">Industrias</a><a href="#planes">Planes</a></div>
            <div><h2>Recursos</h2><a href="#recursos">Preguntas frecuentes</a><button type="button" onClick={contact}>Contacto</button></div>
            <div><h2>Información</h2>{siteConfig.privacyUrl ? <a href={siteConfig.privacyUrl}>Privacidad</a> : <button type="button" onClick={() => setNotice("La política de privacidad está pendiente de publicación.")}>Privacidad <span>· pendiente</span></button>}{siteConfig.termsUrl ? <a href={siteConfig.termsUrl}>Condiciones</a> : <button type="button" onClick={() => setNotice("Las condiciones están pendientes de publicación.")}>Condiciones <span>· pendiente</span></button>}</div>
          </nav>
        </div>
        {notice && <p className="xp-footer-notice" role="status">{notice}</p>}
        <div className="xp-footer-bottom"><span>© {new Date().getFullYear()} berriq</span><span>Hecho para conectar tu operación.</span></div>
      </div>
    </footer>
  );
}
