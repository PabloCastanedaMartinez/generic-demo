import React, { useEffect, useRef } from 'react';
import { STORE_INFO } from '../data/products.js';
import { formatGTQ } from '../utils/currency.js';

export default function CartDrawer({
  isOpen,
  metrics,
  showMobileBar,
  onClose,
  onOpenCart,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onGoToCheckout,
  onBrowseCatalog,
  returnFocusToRef
}) {
  const closeBtnRef = useRef(null);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      closeBtnRef.current?.focus();
    } else if (!isOpen && prevOpenRef.current) {
      returnFocusToRef.current?.focus();
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, returnFocusToRef]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div
          className="drawer-backdrop"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {isOpen && (
        <aside
          className="cart-drawer"
          id="carrito-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="carrito-titulo"
        >
          <div className="drawer-header">
            <h2 id="carrito-titulo">Tu bolsa de reserva</h2>
            <button
              ref={closeBtnRef}
              type="button"
              className="icon-btn"
              aria-label="Cerrar bolsa de reserva"
              onClick={onClose}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="pickup-banner">
            <strong>Modalidad de reserva</strong>
            <p>
              Sin pagos ni envíos en línea. Recoge tu pedido en nuestra tienda física en Vía 4, Zona 4.
            </p>
          </div>

          <div className="drawer-body">
            {metrics.items.length === 0 ? (
              <div className="cart-empty">
                <p className="empty-title">Tu bolsa está vacía por ahora</p>
                <p className="empty-desc">
                  Agrega café recién tostado, hogazas de masa madre o cerámica para iniciar tu reserva en tienda física.
                </p>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={onBrowseCatalog}
                >
                  Explorar catálogo
                </button>
              </div>
            ) : (
              <ul className="cart-list">
                {metrics.items.map((item) => {
                  const exceedsStock =
                    item.availableStock <= 0 || item.totalProductQty > item.availableStock;
                  const atStockLimit =
                    !exceedsStock && item.totalProductQty >= item.availableStock;

                  return (
                    <li key={`${item.product.id}__${item.variant}`} className="cart-item">
                      <img className="cart-item-img" src={item.product.image} alt={item.product.alt} />
                      <div className="cart-item-main">
                        <div className="cart-item-head">
                          <div>
                            <p className="cart-item-title">{item.product.name}</p>
                            <p className="cart-item-variant">{item.variant}</p>
                            <p className="cart-item-stock tabular">
                              Stock disponible: {item.availableStock} u.
                            </p>
                            {exceedsStock ? (
                              <span className="meta-tag meta-tag--danger">
                                Excede el stock disponible ({item.availableStock} u.)
                              </span>
                            ) : atStockLimit ? (
                              <span className="meta-tag meta-tag--warning">
                                Límite de stock alcanzado
                              </span>
                            ) : null}
                          </div>
                          <strong className="tabular">{formatGTQ(item.lineTotal)}</strong>
                        </div>
                        <div className="cart-item-controls">
                          <div className="qty-stepper">
                            <button
                              type="button"
                              aria-label={`Disminuir cantidad de ${item.product.name}`}
                              onClick={() => onUpdateQty(item.product.id, item.variant, -1)}
                            >
                              −
                            </button>
                            <span className="tabular">{item.qty}</span>
                            <button
                              type="button"
                              aria-label={`Aumentar cantidad de ${item.product.name}`}
                              aria-disabled={atStockLimit || exceedsStock ? 'true' : undefined}
                              onClick={() => onUpdateQty(item.product.id, item.variant, 1)}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => onRemoveItem(item.product.id, item.variant)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {metrics.items.length > 0 && (
            <div className="drawer-footer">
              <dl className="drawer-totals">
                <div className="total-row">
                  <dt>Subtotal</dt>
                  <dd className="tabular">{formatGTQ(metrics.subtotal)}</dd>
                </div>
                <div className="total-row">
                  <dt>Entrega</dt>
                  <dd>En tienda física (Sin costo)</dd>
                </div>
                <div className="total-row">
                  <dt>Pago en línea</dt>
                  <dd>No aplica (Reserva)</dd>
                </div>
                <div className="total-row total-row--grand">
                  <dt>Total a reservar</dt>
                  <dd className="tabular">{formatGTQ(metrics.total)}</dd>
                </div>
              </dl>
              <p className="drawer-address-reminder">
                Recolección en {STORE_INFO.name} ({STORE_INFO.address}). En el siguiente paso solo ingresas tus datos para apartar el stock.
              </p>
              <div className="drawer-actions">
                <button
                  type="button"
                  className="btn btn--primary btn--full"
                  onClick={onGoToCheckout}
                >
                  Continuar a reserva en tienda
                </button>
                <button
                  type="button"
                  className="btn btn--quiet btn--full"
                  onClick={onClearCart}
                >
                  Vaciar bolsa
                </button>
              </div>
            </div>
          )}
        </aside>
      )}

      {showMobileBar && (
        <div className="mobile-cart-bar">
          <div className="mobile-cart-info">
            <span className="mobile-cart-count tabular">
              {metrics.count === 1 ? '1 artículo reservado' : `${metrics.count} artículos en reserva`}
            </span>
            <strong className="mobile-cart-total tabular">{formatGTQ(metrics.total)}</strong>
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onOpenCart}
          >
            Ver bolsa y reservar
          </button>
        </div>
      )}
    </>
  );
}
