import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Pause, Play, Sparkles, X } from 'lucide-react';
import { Header, Hero, Benefits } from '../marketing/Hero';
import { Applications, Industries } from '../marketing/Explorers';
import { Experience, Automation, FAQ, Closing, Footer } from '../marketing/Experience';
import { Plans } from '../marketing/Plans';
import { siteConfig, trackEvent } from '../marketing/siteConfig';

type Action = 'trial' | 'login' | 'contact';

function PendingAction({ action, onClose, restoreFocus }: { action: Action | null; onClose: () => void; restoreFocus: () => void }) {
  const isTrial = action === 'trial';
  const title = isTrial ? 'Tu prueba de berriq' : action === 'login' ? 'Acceso a berriq' : 'Hablemos de tu operación';
  const description = isTrial
    ? 'Esta es una vista demostrativa. El registro todavía no está conectado y aquí no se crean cuentas.'
    : action === 'login'
      ? 'El enlace de acceso a la plataforma está pendiente de confirmación.'
      : 'El canal para contactar a un especialista está pendiente de confirmación.';
  return <Dialog.Root open={action !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="modal-overlay" />
      <Dialog.Content className="modal-content" onCloseAutoFocus={(event) => { event.preventDefault(); restoreFocus(); }}>
        <Dialog.Close className="modal-close" aria-label="Cerrar"><X size={18} /></Dialog.Close>
        <span className="modal-kicker"><Sparkles size={14} /> VISTA PREVIA</span>
        <Dialog.Title className="modal-title">{title}</Dialog.Title>
        <Dialog.Description className="modal-description">{description}</Dialog.Description>
        {isTrial && <div className="modal-demo">
          <strong>Formulario ilustrativo · no introduzcas datos</strong>
          <div className="modal-fields">
            <label>Nombre<input type="text" placeholder="Tu nombre" disabled /></label>
            <label>Correo<input type="email" placeholder="tu@negocio.com" disabled /></label>
            <label>Nombre del negocio<input type="text" placeholder="Tu negocio" disabled /></label>
            <label>Contraseña<input type="password" placeholder="••••••••" disabled /></label>
          </div>
          <p className="modal-note">La duración y las condiciones de la prueba se confirmarán cuando el alta esté disponible.</p>
        </div>}
        <button className="btn modal-action" disabled>Conexión pendiente</button>
        <div className="modal-links">
          {siteConfig.privacyUrl ? <a href={siteConfig.privacyUrl}>Privacidad</a> : <span>Privacidad: pendiente</span>}
          {siteConfig.termsUrl ? <a href={siteConfig.termsUrl}>Condiciones</a> : <span>Condiciones: pendientes</span>}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

export default function Home() {
  const [action, setAction] = useState<Action | null>(null);
  const [paused, setPaused] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => { document.body.dataset.motion = paused ? 'paused' : 'playing'; return () => { delete document.body.dataset.motion; }; }, [paused]);
  function onAction(kind: Action, returnFocus?: HTMLElement | null) {
    returnFocusRef.current = returnFocus ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    trackEvent(`click_${kind}`);
    const url = kind === 'trial' ? siteConfig.trialUrl : kind === 'login' ? siteConfig.loginUrl : siteConfig.contactUrl;
    if (url) window.location.assign(url); else setAction(kind);
  }
  function restoreFocus() {
    const previous = returnFocusRef.current;
    const fallback = Array.from(document.querySelectorAll<HTMLElement>('.nav-mobile-toggle, .nav-brand')).find((element) => element.getClientRects().length > 0);
    const target = previous?.isConnected && previous.getClientRects().length > 0 ? previous : fallback;
    target?.focus({ preventScroll: true });
  }
  return <>
    <a className="skip-link" href="#contenido">Ir al contenido principal</a>
    <Header onAction={onAction} />
    <main id="contenido">
      <Hero onAction={onAction} />
      <Benefits />
      <Applications onAction={onAction} />
      <Industries onAction={onAction} />
      <Experience onAction={onAction} />
      <Automation onAction={onAction} />
      <Plans onAction={onAction} />
      <FAQ onAction={onAction} />
      <Closing onAction={onAction} />
    </main>
    <Footer onAction={onAction} />
    <button type="button" className="motion-toggle" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? 'Reanudar movimiento decorativo' : 'Pausar movimiento decorativo'}>{paused ? <Play size={14} /> : <Pause size={14} />}{paused ? 'Reanudar movimiento' : 'Pausar movimiento'}</button>
    <PendingAction action={action} onClose={() => setAction(null)} restoreFocus={restoreFocus} />
  </>;
}
