import React, { useEffect, useMemo, useRef, useState } from 'react';
import { STORE_INFO } from '../data/products.js';
import { formatGTQ } from '../utils/currency.js';

const INITIAL_CUSTOMER = {
  nombre: '',
  telefono: '',
  email: '',
  horario: 'Hoy, 16:00 – 19:00 h',
  notas: ''
};

export default function CheckoutView({
  metrics,
  demoOptions,
  onBackToStore,
  onOrderConfirmed,
  onShowToast
}) {
  const [customer, setCustomer] = useState(INITIAL_CUSTOMER);
  const [errors, setErrors] = useState({});
  const [errorBanner, setErrorBanner] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fieldRefs = useRef({});
  const appliedDemoRef = useRef(false);

  useEffect(() => {
    if (!demoOptions || appliedDemoRef.current) return;
    appliedDemoRef.current = true;
    if (demoOptions.fill) {
      setCustomer({
        nombre: 'Sofía Castellanos Morales',
        telefono: '5428 9130',
        email: 'sofia.castellanos@ejemplo.com',
        horario: 'Hoy, 16:00 – 19:00 h',
        notas: 'Pasará a recoger al salir del trabajo'
      });
    }
  }, [demoOptions]);

  const stockIssues = useMemo(() => {
    const issues = [];
    const seen = new Set();
    for (const item of metrics.items) {
      if (seen.has(item.product.id)) continue;
      if (item.availableStock <= 0 || item.totalProductQty > item.availableStock) {
        seen.add(item.product.id);
        issues.push({
          id: item.product.id,
          name: item.product.name,
          requested: item.totalProductQty,
          available: item.availableStock
        });
      }
    }
    return issues;
  }, [metrics.items]);

  const handleFieldChange = (field, value) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleAutofillCustomer = () => {
    setCustomer({
      nombre: 'Sofía Castellanos Morales',
      telefono: '5428 9130',
      email: 'sofia.castellanos@ejemplo.com',
      horario: 'Hoy, 16:00 – 19:00 h',
      notas: 'Pasará a recoger al salir del trabajo'
    });
    setErrors({});
    setErrorBanner('');
    onShowToast('Datos de prueba autocompletados');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    const invalidOrder = [];

    const markError = (key, msg) => {
      newErrors[key] = msg;
      invalidOrder.push(key);
    };

    if (customer.nombre.trim().length < 3) {
      markError('nombre', 'Escribe el nombre completo de quien recogerá la reserva en tienda.');
    }

    const phoneDigits = customer.telefono.replace(/\D/g, '');
    if (phoneDigits.length < 8 || phoneDigits.length > 10) {
      markError('telefono', 'Ingresa un número telefónico de 8 a 10 dígitos para avisar cuando esté lista.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      markError('email', 'Escribe un correo electrónico válido (ejemplo@dominio.com).');
    }

    setErrors(newErrors);

    if (stockIssues.length > 0) {
      const detail = stockIssues
        .map((issue) =>
          issue.available <= 0
            ? `${issue.name} (agotado)`
            : `${issue.name} (solicitaste ${issue.requested}, disponibles: ${issue.available})`
        )
        .join('; ');
      setErrorBanner(
        `No es posible confirmar la reserva por falta de stock en: ${detail}. Ajusta tu bolsa antes de continuar.`
      );
      return;
    }

    if (invalidOrder.length > 0) {
      const count = invalidOrder.length;
      setErrorBanner(
        count === 1
          ? 'Revisa 1 campo marcado antes de confirmar tu reserva en tienda.'
          : `Revisa los ${count} campos marcados antes de confirmar tu reserva en tienda.`
      );
      const firstKey = invalidOrder[0];
      fieldRefs.current[firstKey]?.focus();
      return;
    }

    setErrorBanner('');
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      onOrderConfirmed({
        customer: {
          nombre: customer.nombre.trim(),
          telefono: customer.telefono.trim(),
          email: customer.email.trim(),
          horario: customer.horario,
          notas: customer.notas.trim()
        }
      });
    }, 350);
  };

  return (
    <div id="vista-checkout" className="view-panel">
      <section className="checkout-section" aria-labelledby="checkout-titulo">
        <div className="wrap">
          <div className="checkout-topbar">
            <button type="button" className="btn btn--quiet" onClick={onBackToStore}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Volver al catálogo</span>
            </button>
            <span className="checkout-mode-note">Reserva sin pagos ni envíos en línea · Entrega en tienda física</span>
          </div>

          <div className="checkout-head">
            <h1 id="checkout-titulo">Confirmar reserva para entrega en tienda física</h1>
            <p className="section-sub">
              Esta página no procesa pagos ni realiza envíos a domicilio. Al confirmar, apartamos el stock de tus productos para que los recojas presencialmente en nuestro obrador de Zona 4.
            </p>
          </div>

          <div className="checkout-layout">
            <form className="checkout-form" onSubmit={handleSubmit} noValidate>
              {/* BLOQUE 1: DATOS DE QUIEN RECOGE */}
              <fieldset className="checkout-panel">
                <legend className="sr-only">Datos de quien recoge en tienda</legend>
                <div className="panel-stack">
                  <div className="panel-header-row">
                    <h2 className="panel-heading">Datos de quien recoge en tienda</h2>
                    <button
                      type="button"
                      className="btn btn--quiet btn--sm"
                      onClick={handleAutofillCustomer}
                    >
                      Autocompletar datos de prueba
                    </button>
                  </div>
                  <p className="panel-desc">
                    Usaremos estos datos únicamente para identificar tu folio de reserva en mostrador cuando pases a tienda física.
                  </p>

                  <div className="form-grid">
                    <div className="field field--full">
                      <label htmlFor="res-nombre">
                        Nombre completo de quien recoge <span className="req" aria-hidden="true">*</span>
                      </label>
                      <input
                        ref={(el) => { fieldRefs.current.nombre = el; }}
                        type="text"
                        id="res-nombre"
                        autoComplete="name"
                        placeholder="Ej. Sofía Castellanos Morales"
                        value={customer.nombre}
                        onChange={(e) => handleFieldChange('nombre', e.target.value)}
                        aria-invalid={errors.nombre ? 'true' : undefined}
                        aria-describedby={errors.nombre ? 'err-res-nombre' : undefined}
                      />
                      <span className="field-error" id="err-res-nombre" aria-live="polite">
                        {errors.nombre || ''}
                      </span>
                    </div>

                    <div className="field">
                      <label htmlFor="res-telefono">
                        Teléfono móvil (8 dígitos) <span className="req" aria-hidden="true">*</span>
                      </label>
                      <input
                        ref={(el) => { fieldRefs.current.telefono = el; }}
                        type="tel"
                        id="res-telefono"
                        autoComplete="tel-national"
                        inputMode="numeric"
                        maxLength={14}
                        placeholder="5428 9130"
                        value={customer.telefono}
                        onChange={(e) => handleFieldChange('telefono', e.target.value)}
                        aria-invalid={errors.telefono ? 'true' : undefined}
                        aria-describedby={errors.telefono ? 'err-res-telefono' : undefined}
                      />
                      <span className="field-error" id="err-res-telefono" aria-live="polite">
                        {errors.telefono || ''}
                      </span>
                    </div>

                    <div className="field">
                      <label htmlFor="res-email">
                        Correo para comprobante <span className="req" aria-hidden="true">*</span>
                      </label>
                      <input
                        ref={(el) => { fieldRefs.current.email = el; }}
                        type="email"
                        id="res-email"
                        autoComplete="email"
                        placeholder="sofia@ejemplo.com"
                        value={customer.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        aria-invalid={errors.email ? 'true' : undefined}
                        aria-describedby={errors.email ? 'err-res-email' : undefined}
                      />
                      <span className="field-error" id="err-res-email" aria-live="polite">
                        {errors.email || ''}
                      </span>
                    </div>

                    <div className="field">
                      <label htmlFor="res-horario">
                        Ventana de recolección en tienda <span className="req" aria-hidden="true">*</span>
                      </label>
                      <select
                        id="res-horario"
                        value={customer.horario}
                        onChange={(e) => handleFieldChange('horario', e.target.value)}
                      >
                        <option value="Hoy, 16:00 – 19:00 h">Hoy, 16:00 – 19:00 h</option>
                        <option value="Mañana, 09:00 – 13:00 h">Mañana, 09:00 – 13:00 h</option>
                        <option value="Mañana, 15:00 – 19:00 h">Mañana, 15:00 – 19:00 h</option>
                      </select>
                    </div>

                    <div className="field field--full">
                      <label htmlFor="res-notas">Indicaciones para preparar tu reserva (opcional)</label>
                      <input
                        type="text"
                        id="res-notas"
                        placeholder="Ej. Moler el café al llegar o tener listo el pan rebanado"
                        value={customer.notas}
                        onChange={(e) => handleFieldChange('notas', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* BLOQUE 2: CONDICIONES DE RESERVA Y ENTREGA EN TIENDA FÍSICA */}
              <section className="checkout-panel" aria-labelledby="condiciones-tienda-titulo">
                <div className="panel-stack">
                  <h2 id="condiciones-tienda-titulo" className="panel-heading">
                    Condiciones de reserva y entrega en tienda física
                  </h2>
                  <p className="panel-desc">
                    No solicitamos tarjetas, transferencias ni cobros en efectivo en línea, ni realizamos envíos a domicilio. Tu reserva aparta el inventario seleccionado para entrega exclusiva en mostrador.
                  </p>

                  <div className="store-info-card">
                    <dl className="spei-details">
                      <div className="spei-row">
                        <dt>Tienda de recolección</dt>
                        <dd>{STORE_INFO.name}</dd>
                      </div>
                      <div className="spei-row">
                        <dt>Dirección física</dt>
                        <dd>{STORE_INFO.address}</dd>
                      </div>
                      <div className="spei-row">
                        <dt>Horario de atención</dt>
                        <dd>{STORE_INFO.hours}</dd>
                      </div>
                      <div className="spei-row">
                        <dt>Modalidad</dt>
                        <dd>{STORE_INFO.modality}</dd>
                      </div>
                      <div className="spei-row">
                        <dt>Pagos y envíos en página</dt>
                        <dd>Deshabilitados — liquidación y entrega únicamente en tienda</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section>

              {stockIssues.length > 0 && (
                <div className="form-alert" role="alert">
                  No es posible confirmar la reserva por falta de stock en:{' '}
                  {stockIssues
                    .map((issue) =>
                      issue.available <= 0
                        ? `${issue.name} (agotado)`
                        : `${issue.name} (solicitaste ${issue.requested}, disponibles: ${issue.available})`
                    )
                    .join('; ')}
                  . Vuelve al catálogo o ajusta tu bolsa antes de continuar.
                </div>
              )}

              {errorBanner && stockIssues.length === 0 && (
                <div className="form-alert" role="alert">
                  {errorBanner}
                </div>
              )}

              <div className="checkout-submit-row">
                <button
                  type="submit"
                  className="btn btn--primary btn--lg btn--full"
                  disabled={submitting || stockIssues.length > 0}
                >
                  {submitting
                    ? 'Registrando reserva y apartando stock...'
                    : 'Confirmar reserva en tienda física'}
                </button>
              </div>
            </form>

            {/* RESUMEN LATERAL */}
            <aside className="order-summary" aria-labelledby="resumen-titulo">
              <div className="summary-card">
                <h2 id="resumen-titulo">Resumen de tu reserva</h2>

                <ul className="summary-items">
                  {metrics.items.map((item) => {
                    const invalidStock =
                      item.availableStock <= 0 || item.totalProductQty > item.availableStock;

                    return (
                      <li key={`${item.product.id}__${item.variant}`} className="summary-item">
                        <img className="summary-thumb" src={item.product.image} alt={item.product.alt} />
                        <div className="summary-item-info">
                          <span className="summary-item-name">{item.product.name}</span>
                          <span className="summary-item-variant">
                            {item.variant} · Cant. {item.qty}
                          </span>
                          <span
                            className={`summary-item-stock tabular ${
                              invalidStock ? 'summary-item-stock--error' : ''
                            }`}
                          >
                            {invalidStock
                              ? `Stock insuficiente (disponibles: ${item.availableStock})`
                              : `Stock disponible: ${item.availableStock} u.`}
                          </span>
                        </div>
                        <span className="summary-item-price tabular">{formatGTQ(item.lineTotal)}</span>
                      </li>
                    );
                  })}
                </ul>

                <div className="summary-address-box">
                  <h3>Recolección en tienda física</h3>
                  <strong>{STORE_INFO.name}</strong>
                  <span>{STORE_INFO.address}</span>
                  <div className="summary-address-placeholder">
                    Quien recoge: {customer.nombre.trim() || 'Pendiente de ingresar'}
                  </div>
                  <div className="summary-address-placeholder">
                    Ventana: {customer.horario}
                  </div>
                </div>

                <dl className="summary-totals">
                  <div className="total-row">
                    <dt>Subtotal de artículos</dt>
                    <dd className="tabular">{formatGTQ(metrics.subtotal)}</dd>
                  </div>
                  <div className="total-row">
                    <dt>Modalidad de entrega</dt>
                    <dd>Recolección en tienda</dd>
                  </div>
                  <div className="total-row">
                    <dt>Pago en la página</dt>
                    <dd>No aplica (Reserva)</dd>
                  </div>
                  <div className="total-row total-row--grand">
                    <dt>Total reservado</dt>
                    <dd className="tabular">{formatGTQ(metrics.total)}</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
