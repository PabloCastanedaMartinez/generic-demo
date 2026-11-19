import React from 'react';
import { STORE_INFO, TRACKING_INTERVAL_MS, TRACKING_LABELS } from '../data/products.js';
import { formatGTQ } from '../utils/currency.js';

function formatCountdown(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const secs = String(totalSec % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function ConfirmationView({
  order,
  nowMs,
  onBackToCatalog,
  onOpenHistory
}) {
  if (!order) return null;

  const isCompleted = order.trackingIndex >= TRACKING_LABELS.length - 1;
  const stepStartedAt = order.stepStartedAtMs || order.createdAtMs || nowMs;
  const elapsedMs = Math.max(0, nowMs - stepStartedAt);
  const remainingMs = isCompleted ? 0 : Math.max(0, TRACKING_INTERVAL_MS - elapsedMs);
  const progressPct = isCompleted
    ? 100
    : Math.min(100, Math.max(0, Math.round((elapsedMs / TRACKING_INTERVAL_MS) * 100)));

  const customer = order.customer || {};
  const store = order.pickupStore || STORE_INFO;
  const nextStep = !isCompleted ? TRACKING_LABELS[order.trackingIndex + 1] : null;

  return (
    <div id="vista-confirmacion" className="view-panel">
      <section className="confirmation-section" aria-labelledby="conf-titulo">
        <div className="wrap confirmation-wrap">
          <div className="confirmation-card">
            <div className="confirmation-head">
              <h1 id="conf-titulo">Tu reserva en tienda quedó registrada</h1>
              <div className="confirmation-meta-row">
                <span className="status-badge status-badge--ok">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Reserva confirmada · Entrega en tienda física
                </span>
                <span className="folio-badge tabular">Folio {order.id}</span>
              </div>
              <p className="section-sub">
                Registrada el {order.createdAt} para recoger en tienda física durante la ventana: {customer.horario}.
              </p>
            </div>

            <div className="tracking-panel">
              <div className="tracking-head">
                <div className="tracking-title-group">
                  <h2>Estado de la reserva en tienda</h2>
                  <p className="tracking-auto-note">
                    Actualización automática cada 5:00 min · Estado controlado por cronómetro (no modificable manualmente)
                  </p>
                </div>
                <div
                  className={`timer-badge ${isCompleted ? 'timer-badge--done' : ''}`}
                  aria-live="off"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.75" />
                    <path d="M12 9V13L14.5 14.5M9.5 3H14.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  </svg>
                  <span className="tabular">
                    {isCompleted
                      ? 'Cronómetro completado (00:00) · Reserva entregada en tienda'
                      : `Próximo avance (${nextStep?.title}): ${formatCountdown(remainingMs)}`}
                  </span>
                </div>
              </div>

              <div
                className="timer-progress"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPct}
                aria-label="Progreso del intervalo de 5 minutos para la siguiente actualización de estado"
              >
                <div className="timer-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>

              <ol className="tracking-steps">
                {TRACKING_LABELS.map((step, idx) => {
                  const isDone = idx <= order.trackingIndex;
                  const isCurrent = idx === order.trackingIndex && !isCompleted;

                  return (
                    <li
                      key={step.key}
                      className={`tracking-step ${isDone ? 'tracking-step--done' : ''} ${
                        isCurrent ? 'tracking-step--current' : ''
                      }`}
                    >
                      <div className="tracking-step-top">
                        <strong>{step.title}</strong>
                        <span className="tracking-milestone tabular">{step.milestone}</span>
                      </div>
                      <span>{step.detail}</span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="receipt-grid">
              <div className="receipt-block">
                <h3>Datos de quien recoge</h3>
                <div className="receipt-address">
                  <strong>{customer.nombre}</strong>
                  <span className="tabular">Tel. {customer.telefono}</span>
                  <span>{customer.email}</span>
                  <span>Ventana de recolección: {customer.horario}</span>
                  {customer.notas && <span>Indicaciones: {customer.notas}</span>}
                </div>
              </div>

              <div className="receipt-block">
                <h3>Entrega en tienda física</h3>
                <div className="receipt-payment">
                  <strong>{store.name}</strong>
                  <span>{store.address}</span>
                  <span>Horario de tienda: {store.hours}</span>
                  <span>{store.paymentNote}</span>
                </div>
              </div>
            </div>

            <div className="receipt-items-block">
              <h3>Artículos reservados (stock apartado)</h3>
              <ul className="summary-items">
                {order.items.map((item) => (
                  <li key={`${item.id}__${item.variant}`} className="summary-item">
                    <img className="summary-thumb" src={item.image} alt={item.alt} />
                    <div className="summary-item-info">
                      <span className="summary-item-name">{item.name}</span>
                      <span className="summary-item-variant">
                        {item.variant} · Cant. {item.qty}
                      </span>
                    </div>
                    <span className="summary-item-price tabular">{formatGTQ(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <dl className="summary-totals summary-totals--compact">
                <div className="total-row">
                  <dt>Subtotal</dt>
                  <dd className="tabular">{formatGTQ(order.subtotal)}</dd>
                </div>
                <div className="total-row">
                  <dt>Modalidad de entrega</dt>
                  <dd>Recolección en tienda física</dd>
                </div>
                <div className="total-row">
                  <dt>Pago en la página</dt>
                  <dd>No aplica (Liquidación en tienda)</dd>
                </div>
                <div className="total-row total-row--grand">
                  <dt>Total de la reserva</dt>
                  <dd className="tabular">{formatGTQ(order.total)}</dd>
                </div>
              </dl>
            </div>

            <div className="confirmation-actions">
              <button type="button" className="btn btn--primary" onClick={onBackToCatalog}>
                Volver al catálogo
              </button>
              <button type="button" className="btn btn--secondary" onClick={onOpenHistory}>
                Ver historial de reservas
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
