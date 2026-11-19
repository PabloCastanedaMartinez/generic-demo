import React, { useEffect, useRef } from 'react';
import { STORE_INFO, TRACKING_INTERVAL_MS, TRACKING_LABELS } from '../data/products.js';
import { formatGTQ } from '../utils/currency.js';

function formatCountdown(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const mins = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const secs = String(totalSec % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function HistoryModal({
  isOpen,
  orders,
  nowMs,
  onSelectOrder,
  onClose
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="modal-dialog"
      id="historial-modal"
      aria-labelledby="modal-hist-titulo"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="modal-card modal-card--narrow">
        <div className="modal-header">
          <h2 id="modal-hist-titulo">Reservas recientes en tienda</h2>
          <button
            type="button"
            className="icon-btn"
            aria-label="Cerrar historial"
            onClick={onClose}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {orders.length === 0 ? (
            <div className="cart-empty">
              <p className="empty-title">Aún no hay reservas registradas en este navegador</p>
              <p className="empty-desc">
                Completa una reserva desde tu bolsa para consultar su folio, punto de recolección en tienda física y el cronómetro automático de estado.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const customer = order.customer || {};
              const store = order.pickupStore || STORE_INFO;
              const isCompleted = order.trackingIndex >= TRACKING_LABELS.length - 1;
              const stepStartedAt = order.stepStartedAtMs || order.createdAtMs || nowMs;
              const remainingMs = isCompleted
                ? 0
                : Math.max(0, TRACKING_INTERVAL_MS - Math.max(0, nowMs - stepStartedAt));
              const currentStep = TRACKING_LABELS[order.trackingIndex] || TRACKING_LABELS[0];

              return (
                <article key={order.id} className="history-card">
                  <div className="history-card-head">
                    <strong className="tabular">
                      {order.id} · {formatGTQ(order.total)}
                    </strong>
                    <span className={`meta-tag ${isCompleted ? 'meta-tag--today' : 'meta-tag--stock'}`}>
                      {currentStep.title}
                    </span>
                  </div>
                  <div className="history-card-meta">
                    <span>Recoge: {customer.nombre || 'Cliente en tienda'}</span>
                    <span>Ventana: {customer.horario || 'Por confirmar'}</span>
                  </div>
                  <div>
                    Entrega en tienda física: {store.address}
                  </div>
                  <div className="history-timer-line tabular">
                    {isCompleted
                      ? 'Cronómetro completado (00:00) · Entregado en tienda'
                      : `Próxima actualización automática en ${formatCountdown(remainingMs)}`}
                  </div>
                  <div>
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => onSelectOrder(order.id)}
                    >
                      Ver comprobante y cronómetro
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </dialog>
  );
}
