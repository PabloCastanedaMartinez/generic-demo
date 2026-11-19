import React from 'react';
import { CATEGORIES, PRODUCTS, STORE_INFO } from '../data/products.js';
import { formatGTQ } from '../utils/currency.js';

export default function StoreView({
  filteredProducts,
  selectedCategory,
  onSelectCategory,
  onlyToday,
  onToggleToday,
  sortBy,
  onSortChange,
  onClearFilters,
  selectedVariants,
  onSelectVariant,
  getCartQty,
  getProductCartQty,
  getProductStock,
  hasModifiedStock,
  onResetStock,
  onAddToCart,
  onUpdateQty,
  onOpenProductModal,
  onHeroQuickAdd
}) {
  return (
    <div id="vista-tienda" className="view-panel">
      <section className="hero" aria-labelledby="hero-titulo">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <h1 id="hero-titulo">Café guatemalteco en lote corto, pan de piedra y objetos de mesa</h1>
            <p className="hero-lead">
              Tostamos cada martes y horneamos masa madre cada mañana en Zona 4, Ciudad de Guatemala. Reserva tus piezas en línea con validación de stock real y recógelas directamente en nuestra tienda física, sin pagos ni envíos en la página.
            </p>
            <div className="hero-actions">
              <a href="#catalogo" className="btn btn--primary">
                Ver catálogo disponible
              </a>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={onHeroQuickAdd}
              >
                Reservar Caja de Cata — {formatGTQ(195)}
              </button>
            </div>
            <ul className="hero-facts" aria-label="Condiciones de reserva en tienda">
              <li>
                <strong>Sin pagos ni envíos</strong>
                <span>Reserva en línea y liquida al recoger en tienda</span>
              </li>
              <li>
                <strong>Entrega en tienda física</strong>
                <span>Vía 4, Cuatro Grados Norte, Zona 4</span>
              </li>
              <li>
                <strong>Estado automático</strong>
                <span>Cronómetro con actualización cada 5 minutos</span>
              </li>
            </ul>
          </div>

          <figure className="hero-media">
            <img
              src="/assets/img/m28989985-2400.webp"
              alt="Extracción de espresso en taza de cerámica blanca desde portafiltro sin fondo"
              width="2500"
              height="1786"
            />
          </figure>
        </div>
      </section>

      <section id="catalogo" className="catalog-section" aria-labelledby="catalogo-titulo">
        <div className="wrap">
          <div className="section-head">
            <h2 id="catalogo-titulo">Catálogo para reserva en tienda</h2>
            <p className="section-sub">
              Doce piezas en Quetzales guatemaltecos disponibles para apartar en línea y retirar en mostrador. Validamos las existencias disponibles en tienda antes de agregar cada producto a tu bolsa.
            </p>
          </div>

          <div className="catalog-toolbar">
            <div className="category-tabs" role="tablist" aria-label="Filtrar por categoría">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className="tab-btn"
                  role="tab"
                  aria-selected={selectedCategory === cat.id ? 'true' : 'false'}
                  onClick={() => onSelectCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="toolbar-controls">
              <label className="toggle-chip">
                <input
                  type="checkbox"
                  checked={onlyToday}
                  onChange={(e) => onToggleToday(e.target.checked)}
                />
                <span>Disponible hoy en tienda</span>
              </label>

              <div className="sort-wrap">
                <label htmlFor="orden-catalogo" className="sort-label">
                  Orden
                </label>
                <select
                  id="orden-catalogo"
                  className="select-control"
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
                >
                  <option value="destacados">Destacados</option>
                  <option value="precio-asc">Precio: menor a mayor</option>
                  <option value="precio-desc">Precio: mayor a menor</option>
                </select>
              </div>

              {hasModifiedStock && (
                <button
                  type="button"
                  className="btn btn--quiet btn--sm"
                  onClick={onResetStock}
                >
                  Restablecer stock
                </button>
              )}
            </div>
          </div>

          <p className="catalog-status" aria-live="polite">
            Mostrando {filteredProducts.length} de {PRODUCTS.length} productos
          </p>

          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => {
                const selectedVariant = selectedVariants[product.id] || product.variants[0];
                const qtyInCart = getCartQty(product.id, selectedVariant);
                const totalProductQty = getProductCartQty(product.id);
                const availableStock = getProductStock(product.id);
                const isOutOfStock = availableStock <= 0;
                const isAtStockLimit = !isOutOfStock && totalProductQty >= availableStock;

                const mediaClass = product.mediaClass
                  ? `product-media ${product.mediaClass}`
                  : 'product-media';

                return (
                  <article
                    key={product.id}
                    className={`product-card ${isOutOfStock ? 'product-card--out' : ''}`}
                  >
                    <div className={mediaClass}>
                      <img src={product.image} alt={product.alt} />
                    </div>
                    <div className="product-body">
                      <div className="product-top-row">
                        <h3 className="product-title">{product.name}</h3>
                        <span className="product-price tabular">{formatGTQ(product.price)}</span>
                      </div>
                      <p className="product-desc">{product.description}</p>
                      <div className="product-meta-row">
                        <span className="meta-tag">{product.categoryLabel}</span>
                        {product.today ? (
                          <span className="meta-tag meta-tag--today">Disponible hoy en tienda</span>
                        ) : (
                          <span className="meta-tag">Recolección desde mañana</span>
                        )}
                        {availableStock === 0 ? (
                          <span className="meta-tag meta-tag--danger">Agotado · Sin stock</span>
                        ) : availableStock <= 3 ? (
                          <span className="meta-tag meta-tag--warning tabular">
                            {availableStock === 1
                              ? '¡Última unidad disponible!'
                              : `¡Últimas ${availableStock} unidades!`}
                          </span>
                        ) : (
                          <span className="meta-tag meta-tag--stock tabular">
                            Stock: {availableStock} disponibles
                          </span>
                        )}
                      </div>
                      <div className="variant-group">
                        <span className="variant-label">Presentación</span>
                        <div className="variant-pills" role="group" aria-label={`Presentación de ${product.name}`}>
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

                      {totalProductQty > 0 && (
                        <p
                          className={`stock-note ${isAtStockLimit ? 'stock-note--limit' : ''}`}
                          aria-live="polite"
                        >
                          En bolsa: <strong className="tabular">{totalProductQty}</strong> de{' '}
                          <strong className="tabular">{availableStock}</strong> disponibles
                          {isAtStockLimit ? ' · Límite de stock alcanzado' : ''}
                        </p>
                      )}

                      <div className="product-actions">
                        {isOutOfStock ? (
                          <button
                            type="button"
                            className="btn btn--primary"
                            disabled
                          >
                            Sin stock disponible
                          </button>
                        ) : qtyInCart > 0 ? (
                          <div className="qty-inline" aria-label={`Cantidad en bolsa para ${product.name}`}>
                            <button
                              type="button"
                              className="qty-inline-btn"
                              aria-label={`Quitar una unidad de ${product.name}`}
                              onClick={() => onUpdateQty(product.id, selectedVariant, -1)}
                            >
                              −
                            </button>
                            <span className="qty-inline-val tabular">{qtyInCart} en bolsa</span>
                            <button
                              type="button"
                              className={`qty-inline-btn ${isAtStockLimit ? 'qty-inline-btn--limit' : ''}`}
                              aria-label={`Añadir una unidad más de ${product.name}`}
                              aria-disabled={isAtStockLimit ? 'true' : undefined}
                              onClick={() => onUpdateQty(product.id, selectedVariant, 1)}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn--primary"
                            onClick={() => onAddToCart(product.id, selectedVariant, 1)}
                          >
                            Reservar en bolsa
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn--secondary"
                          onClick={() => onOpenProductModal(product.id)}
                        >
                          Detalles
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p className="empty-title">No encontramos artículos con esa búsqueda o filtro.</p>
              <p className="empty-desc">
                Prueba limpiando el filtro de categoría o buscando otro término como «centeno», «Acatenango» o «cobre».
              </p>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={onClearFilters}
              >
                Mostrar todo el catálogo
              </button>
            </div>
          )}
        </div>
      </section>

      <section id="obrador" className="workshop-section" aria-labelledby="obrador-titulo">
        <div className="wrap workshop-grid">
          <div className="workshop-copy">
            <h2 id="obrador-titulo">Del obrador directo a tu recolección en tienda</h2>
            <p className="workshop-lead">
              Cada artículo se hornea y empaca en nuestra panadería y tostaduría de Cuatro Grados Norte. Todos los pedidos funcionan únicamente como reservas en línea para entregarse en tienda física, sin cobros digitales ni envíos a domicilio.
            </p>

            <dl className="schedule-list" id="entregas">
              <div className="schedule-row">
                <dt>Horneado y tueste</dt>
                <dd>Martes a domingo desde las 07:00 h; café tostado en lotes de 12 kg.</dd>
              </div>
              <div className="schedule-row">
                <dt>Tienda física de entrega</dt>
                <dd>{STORE_INFO.address} · {STORE_INFO.hours}.</dd>
              </div>
              <div className="schedule-row">
                <dt>Modalidad de pedido</dt>
                <dd>{STORE_INFO.paymentNote}.</dd>
              </div>
              <div className="schedule-row">
                <dt>Seguimiento automático</dt>
                <dd>El estado de cada reserva avanza automáticamente con un cronómetro cada 5 minutos hasta su entrega en mostrador.</dd>
              </div>
            </dl>
          </div>

          <figure className="workshop-media">
            <img
              src="/assets/img/m11317510-1200.webp"
              alt="Puerta de hierro de horno panadero con pala de madera y harina sobre el alféizar"
              width="1200"
              height="800"
            />
          </figure>
        </div>
      </section>
    </div>
  );
}
