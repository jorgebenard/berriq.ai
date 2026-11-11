import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Calculator,
  Check,
  ChevronDown,
  Layers3,
  MapPin,
  Plus,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import {
  calculateCapacityQuote,
  COMMERCIAL_CONFIG,
  COMMERCIAL_PLANS,
  formatCommercialPrice,
  type CapacityOption,
  type CommercialPlan,
} from './commercial';
import { trackEvent } from './siteConfig';
import './plans.css';

type ActionKind = 'trial' | 'login' | 'contact';

type PlansProps = {
  onAction: (kind: ActionKind) => void;
};

const planIcons = {
  start: Sparkles,
  grow: Layers3,
  enterprise: Building2,
};

function quantityLabel(quantity: number, singular: string, plural: string) {
  return `${quantity} ${quantity === 1 ? singular : plural}`;
}

function PlanCard({ plan, onAction }: { plan: CommercialPlan; onAction: PlansProps['onAction'] }) {
  const Icon = planIcons[plan.id];
  return (
    <article className={`plan-card plan-card--${plan.id}`}>
      <div className="plan-card__topline">
        <span className="plan-card__icon" aria-hidden="true"><Icon size={23} strokeWidth={1.8} /></span>
        {plan.recommended && <span className="plan-card__badge">Recomendado</span>}
      </div>
      <h3 className="plan-card__name">{plan.name}</h3>
      <p className="plan-card__description">{plan.message}</p>
      <div className="plan-card__price">
        <span className="plan-card__amount">{formatCommercialPrice(plan.monthlyPrice)}</span>
        <span className="plan-card__price-note">MXN / mes <span>+ IVA</span></span>
      </div>
      <div className="plan-card__divider" />
      <p className="plan-card__includes-label">CAPACIDAD INCLUIDA</p>
      <ul className="plan-card__features">
        <li><Check aria-hidden="true" size={16} /><span><strong>{plan.includedUsers}</strong> usuarios internos</span></li>
        <li><Check aria-hidden="true" size={16} /><span><strong>{plan.includedLocations}</strong> {plan.includedLocations === 1 ? 'sede' : 'sedes'}</span></li>
      </ul>
      <button className={`btn ${plan.id === 'start' ? 'btn-secondary' : 'btn-primary'} plan-card__button`} type="button" onClick={() => { trackEvent('plan_click', { plan: plan.id }); onAction(plan.action); }}>
        {plan.actionLabel}<ArrowUpRight size={17} aria-hidden="true" />
      </button>
      <details className="plan-card__details">
        <summary>Ver detalles y condiciones <ChevronDown size={16} aria-hidden="true" /></summary>
        <ul>
          <li>{quantityLabel(plan.includedUsers, 'usuario interno incluido', 'usuarios internos incluidos')}.</li>
          <li>{quantityLabel(plan.includedLocations, 'sede incluida', 'sedes incluidas')}.</li>
          {COMMERCIAL_CONFIG.conditions.map((condition) => <li key={condition}>{condition}</li>)}
        </ul>
      </details>
    </article>
  );
}

function QuoteBreakdown({ option, advancedControl, onAction }: {
  option: CapacityOption;
  advancedControl: boolean;
  onAction: PlansProps['onAction'];
}) {
  const { plan } = option;
  return (
    <div className="plan-result__option">
      <div className="plan-result__plan-line">
        <div>
          <span className="plan-result__small-label">CONFIGURACIÓN</span>
          <h4>{plan.name}</h4>
        </div>
        <span className="plan-result__check" aria-hidden="true"><Check size={18} /></span>
      </div>
      <div className="plan-result__total">
        <strong>{formatCommercialPrice(option.total)}</strong>
        <span>MXN / mes<br /><b>IVA no calculado</b></span>
      </div>
      <dl className="plan-result__breakdown">
        <div><dt>Plan base</dt><dd>{formatCommercialPrice(plan.monthlyPrice)}</dd></div>
        <div>
          <dt>{option.additionalUserBlocks} {option.additionalUserBlocks === 1 ? 'bloque' : 'bloques'} de {COMMERCIAL_CONFIG.additionalUsers.quantity} usuarios adicionales</dt>
          <dd>{formatCommercialPrice(option.additionalUsersPrice)}</dd>
        </div>
        <div>
          <dt>{quantityLabel(option.additionalLocations, 'sede adicional', 'sedes adicionales')}</dt>
          <dd>{formatCommercialPrice(option.additionalLocationsPrice)}</dd>
        </div>
      </dl>
      <p className="plan-result__capacity">
        Capacidad resultante: {plan.includedUsers + option.additionalUsers} usuarios internos y {quantityLabel(plan.includedLocations + option.additionalLocations, 'sede', 'sedes')}.
      </p>
      <button type="button" className="btn btn-primary plan-result__button" onClick={() => { trackEvent('plan_click', { plan: plan.id, source: 'calculator' }); onAction(advancedControl ? 'contact' : plan.action); }}>
        {advancedControl ? 'Consultar alcance' : plan.actionLabel}<ArrowRight size={17} aria-hidden="true" />
      </button>
    </div>
  );
}

function isPositiveInteger(value: string): boolean {
  return value.trim() !== '' && Number.isSafeInteger(Number(value)) && Number(value) >= 1;
}

function PlanCalculator({ onAction }: PlansProps) {
  const [users, setUsers] = useState('5');
  const [locations, setLocations] = useState('1');
  const [multiCompany, setMultiCompany] = useState(false);
  const [advancedControl, setAdvancedControl] = useState(false);
  const usersValid = isPositiveInteger(users);
  const locationsValid = isPositiveInteger(locations);
  let quote: ReturnType<typeof calculateCapacityQuote> | null = null;
  let calculationError = '';
  if (usersValid && locationsValid) {
    try {
      quote = calculateCapacityQuote({ users: Number(users), locations: Number(locations), multiCompany, advancedControl });
    } catch {
      calculationError = 'Las cantidades son demasiado grandes para calcular una estimación.';
    }
  }

  return (
    <section className="plan-calculator" aria-labelledby="plan-calculator-title">
      <div className="plan-calculator__form">
        <span className="plan-calculator__eyebrow"><Calculator size={17} aria-hidden="true" /> COMPARADOR DE CAPACIDAD</span>
        <h3 id="plan-calculator-title">Encuentra tu plan<span>.</span></h3>
        <p className="plan-calculator__intro">Cuéntanos el tamaño de tu operación y compara las opciones por capacidad.</p>
        <div className="plan-calculator__numbers">
          <div className="plan-field">
            <label htmlFor="plan-users">Usuarios internos</label>
            <div className="plan-field__input"><UsersRound size={19} aria-hidden="true" /><input id="plan-users" type="number" inputMode="numeric" min="1" step="1" required value={users} onChange={(event) => setUsers(event.target.value)} aria-invalid={!usersValid} aria-describedby={!usersValid ? 'plan-input-error' : undefined} /></div>
          </div>
          <div className="plan-field">
            <label htmlFor="plan-locations">Sedes</label>
            <div className="plan-field__input"><MapPin size={19} aria-hidden="true" /><input id="plan-locations" type="number" inputMode="numeric" min="1" step="1" required value={locations} onChange={(event) => setLocations(event.target.value)} aria-invalid={!locationsValid} aria-describedby={!locationsValid ? 'plan-input-error' : undefined} /></div>
          </div>
        </div>
        {(!usersValid || !locationsValid) && <p id="plan-input-error" className="plan-calculator__error">Introduce números enteros mayores que cero.</p>}
        {calculationError && <p className="plan-calculator__error" role="alert">{calculationError}</p>}
        <fieldset className="plan-calculator__questions">
          <legend>Cuéntanos un poco más</legend>
          <label className="plan-switch">
            <span><strong>Varias empresas independientes</strong><small>¿Necesitas gestionar más de una empresa?</small></span>
            <input type="checkbox" checked={multiCompany} onChange={(event) => setMultiCompany(event.target.checked)} />
            <span className="plan-switch__track" aria-hidden="true"><span /></span>
          </label>
          <label className="plan-switch">
            <span><strong>Control avanzado</strong><small>¿Requieres funciones avanzadas de control?</small></span>
            <input type="checkbox" checked={advancedControl} onChange={(event) => setAdvancedControl(event.target.checked)} />
            <span className="plan-switch__track" aria-hidden="true"><span /></span>
          </label>
        </fieldset>
      </div>
      <div className="plan-calculator__result" aria-live="polite" aria-atomic="true">
        {multiCompany ? (
          <div className="plan-result__custom">
            <span className="plan-result__icon"><Building2 size={24} aria-hidden="true" /></span>
            <span className="plan-result__eyebrow">berriq A MEDIDA</span>
            <h4>Hablemos de tu operación.</h4>
            <p>Para varias empresas independientes, necesitamos evaluar el alcance antes de ofrecerte una propuesta.</p>
            {advancedControl && <p>Las funciones avanzadas de control también están pendientes de validación en la matriz comercial.</p>}
            <button type="button" className="btn btn-primary plan-result__button" onClick={() => onAction('contact')}>Solicitar evaluación <ArrowRight size={17} aria-hidden="true" /></button>
          </div>
        ) : quote ? (
          <>
            <span className="plan-result__eyebrow">TU ESTIMACIÓN POR CAPACIDAD</span>
            <h4 className="plan-result__heading">La opción de menor precio</h4>
            <p className="plan-result__intro">Calculada con usuarios internos y sedes, para un negocio.</p>
            {advancedControl && <p className="plan-result__warning"><strong>Control avanzado pendiente de validación.</strong> Esta estimación solo considera capacidad; la matriz comercial aún no confirma qué plan incluye estas funciones. El resultado no garantiza su disponibilidad.</p>}
            {quote.cheapestOptions.length > 1 && <p className="plan-result__tie">Estas configuraciones tienen el mismo precio mínimo.</p>}
            {quote.cheapestOptions.map((option) => <QuoteBreakdown key={option.plan.id} option={option} advancedControl={advancedControl} onAction={onAction} />)}
            <p className="plan-result__footnote">{COMMERCIAL_CONFIG.conditions[2]} {COMMERCIAL_CONFIG.conditions[3]} IVA de los extras pendiente de confirmar.</p>
          </>
        ) : (
          <div className="plan-result__empty"><Calculator size={24} aria-hidden="true" /><p>Introduce usuarios y sedes válidos para ver tu estimación.</p></div>
        )}
      </div>
    </section>
  );
}

export function Plans({ onAction }: PlansProps) {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = cardsRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.classList.add('plan-cards--visible');
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="planes" className="section plan-section" aria-labelledby="plans-title">
      <div className="container plan-container">
        <header className="plan-heading">
          <p className="eyebrow plan-heading__eyebrow"><span /> PLANES</p>
          <h2 id="plans-title" className="section-title">Elige el tamaño de tu operación<span>.</span></h2>
          <p>Planes por negocio, con usuarios y sedes incluidos.</p>
          <p className="plan-heading__validation">Precios y condiciones de esta propuesta sujetos a validación comercial.</p>
        </header>

        <div className="plan-cards" ref={cardsRef}>
          {COMMERCIAL_PLANS.map((plan) => <PlanCard key={plan.id} plan={plan} onAction={onAction} />)}
        </div>

        <div className="plan-extras">
          <div className="plan-extras__title"><span><Plus size={18} aria-hidden="true" /></span><div><strong>Crece a tu ritmo</strong><small>Agrega capacidad cuando la necesites.</small></div></div>
          <div className="plan-extras__item"><UsersRound size={20} aria-hidden="true" /><div><strong>{COMMERCIAL_CONFIG.additionalUsers.quantity} usuarios adicionales</strong><span>{formatCommercialPrice(COMMERCIAL_CONFIG.additionalUsers.monthlyPrice)} MXN / mes · IVA por confirmar</span></div></div>
          <div className="plan-extras__item"><MapPin size={20} aria-hidden="true" /><div><strong>Sede adicional</strong><span>{formatCommercialPrice(COMMERCIAL_CONFIG.additionalLocation.monthlyPrice)} MXN / mes · IVA por confirmar</span></div></div>
        </div>
        <div className="plan-terms">
          <p>{COMMERCIAL_CONFIG.customMessage}</p>
          <ul>{COMMERCIAL_CONFIG.conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul>
        </div>
        <PlanCalculator onAction={onAction} />
      </div>
    </section>
  );
}
