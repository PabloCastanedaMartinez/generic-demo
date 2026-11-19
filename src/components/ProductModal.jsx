import React, { useEffect, useRef, useState } from 'react';
import { formatGTQ } from '../utils/currency.js';

export default function ProductModal({
  product,
  selectedVariant,
  availableStock,
  totalProductInCart,
  onSelectVariant,
  onAddToCart,
  onClose
}) {
  const dialogRef = useRef(null);
  const [qty, setQty] = useState(1);
  const [stockError, setStockError] = useState('');

  const remainingStock = Math.max(0, availableStock - totalProductInCart);
  const isOutOfStock = availableStock <= 0;
  const isFullyInCart = !isOutOfStock && remainingStock === 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (product && !dialog.open) {
      dialog.showModal();
    } else if (!product && dialog.open) {
      dialog.close();
    }
  }, [product]);

  useEffect(() => {
    setQty(1);
    setStockError('');
  }, [product?.id, selectedVariant, availableStock, totalProductInCart]);

  const handleStepQty = (delta) => {
    if (isOutOfStock) {
      setStockError('Este producto está agotado y no tiene existencias disponibles.');
      return;
    }
    if (isFullyInCart) {
      setStockError(
        `Ya tienes las ${availableStock} unidades disponibles en tu bolsa.`
      );
      return;
    }

    const next = qty + delta;
    if (next < 1) {
      setQty(1);
      setStockError('');
      return;
    }
    if (next > remainingStock) {
      setStockError(
        `Stock máximo alcanzado: solo quedan ${remainingStock} ${
          remainingStock === 1 ? 'unidad disponible' : 'unidades disponibles'
        }${totalProductInCart > 0 ? ` (${totalProductInCart} ya en tu bolsa)` : ''}.`
      );
      return;
    }

    setQty(next);
    setStockError('');
  };

  const handleConfirmAdd = () => {
    if (isOutOfStock || isFullyInCart) return;
    if (qty > remainingStock) {
      setStockError(
        `La cantidad solicitada (${qty}) supera el stock disponible (${remainingStock}).`
      );
      return;
    }
    const added = onAddToCart(product.id, selectedVariant, qty);
    if (added) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal-dialog"
      id="producto-modal"
      aria-labelledby="modal-prod-titulo"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      {product && (
        <div className="modal-card">
          <div className="modal-header">
            <h2 id="modal-prod-titulo">{product.name}</h2>
            <button
              type="button"
              className="icon-btn"
              aria-label="Cerrar ficha de producto"
              onClick={onClose}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="product-modal-grid">
            <img className="product-modal-img" src={product.image} alt={product.alt} />
            <div className="product-modal-info">
              <strong className="product-price tabular">{formatGTQ(product.price)}</strong>
              <p className="product-desc">{product.description}</p>

              <div className="product-meta-row">
                {isOutOfStock ? (
                  <span className="meta-tag meta-tag--danger">Agotado · Sin stock</span>
                ) : availableStock <= 3 ? (
                  <span className="meta-tag meta-tag--warning tabular">
                    Stock en tienda: {availableStock} {availableStock === 1 ? 'unidad' : 'unidades'}
                  </span>
                ) : (
                  <span className="meta-tag meta-tag--stock tabular">
                    Stock en tienda: {availableStock} unidades
                  </span>
                )}

                {!isOutOfStock && (
                  <span className="meta-tag tabular">
                    Disponibles para agregar: {remainingStock}
                  </span>
                )}
              </div>

              <div className="variant-group">
                <span className="variant-label">Presentación</span>
                <div className="variant-pills">
                  {product.variants.map((variant) => (
                    <button
                      key={variant}
                      type="button"
                      className="variant-btn"
                      aria-pressed={variant === selectedVariant ? 'true' : 'false'}
                      onClick={() => onSelectVariant(product.id, variant)}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>

              <dl className="spec-list">
                {product.specs.map(([key, val]) => (
                  <div key={key} className="spec-row">
                    <dt>{key}</dt>
                    <dd>{val}</dd>
                  </div>
                ))}
              </dl>

              {!isOutOfStock && (
                <div className="modal-qty-row">
                  <span className="variant-label">Cantidad a reservar</span>
                  <div className="qty-stepper">
                    <button
                      type="button"
                      aria-label="Disminuir cantidad"
                      disabled={isFullyInCart || qty <= 1}
                      onClick={() => handleStepQty(-1)}
                    >
                      −
                    </button>
                    <span className="tabular">{isFullyInCart ? 0 : qty}</span>
                    <button
                      type="button"
                      aria-label="Aumentar cantidad"
                      aria-disabled={isFullyInCart || qty >= remainingStock ? 'true' : undefined}
                      onClick={() => handleStepQty(1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {stockError && (
                <p className="field-error" role="alert">
                  {stockError}
                </p>
              )}

              <button
                type="button"
                className="btn btn--primary btn--full"
                disabled={isOutOfStock || isFullyInCart}
                onClick={handleConfirmAdd}
              >
                {isOutOfStock
                  ? 'Producto agotado — Sin stock'
                  : isFullyInCart
                    ? 'Stock máximo ya en tu bolsa'
                    : `Reservar en bolsa (${qty}) — ${formatGTQ(product.price * qty)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
