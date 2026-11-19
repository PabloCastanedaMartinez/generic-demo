import React from 'react';

export default function Header({
  searchQuery,
  onSearchChange,
  ordersCount,
  cartCount,
  isCartOpen,
  onGoHome,
  onNavigateAnchor,
  onOpenHistory,
  onOpenCart,
  cartButtonRef
}) {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <a
          href="#vista-tienda"
          className="brand"
          aria-label="Bramadero, volver al inicio"
          onClick={(e) => {
            e.preventDefault();
            onGoHome();
          }}
        >
          <svg className="brand-mark" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2.5" y="2.5" width="19" height="19" rx="4" stroke="currentColor" strokeWidth="1.75" />
            <path d="M7 15.5C7 11.634 10.134 8.5 14 8.5H17V10.5C17 14.366 13.866 17.5 10 17.5H7V15.5Z" stroke="currentColor" strokeWidth="1.75" />
          </svg>
          <span className="brand-name">Bramadero</span>
        </a>

        <nav className="main-nav" aria-label="Navegación principal">
          <a
            href="#catalogo"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              onNavigateAnchor('#catalogo');
            }}
          >
            Catálogo
          </a>
          <a
            href="#obrador"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              onNavigateAnchor('#obrador');
            }}
          >
            El obrador
          </a>
          <a
            href="#entregas"
            className="nav-link"
            onClick={(e) => {
              e.preventDefault();
              onNavigateAnchor('#entregas');
            }}
          >
            Tienda y reservas
          </a>
        </nav>

        <div className="header-actions">
          <div className="search-field">
            <label htmlFor="buscador-catalogo" className="sr-only">
              Buscar productos en el catálogo
            </label>
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              id="buscador-catalogo"
              className="search-input"
              placeholder="Buscar..."
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn btn--quiet header-orders-btn"
            onClick={onOpenHistory}
            aria-label="Historial de reservas en tienda"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              <rect x="9" y="3" width="6" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
              <path d="M9 12H15M9 16H13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            <span className="orders-label">Reservas</span>
            {ordersCount > 0 && (
              <span className="count-chip tabular">{ordersCount}</span>
            )}
          </button>

          <button
            ref={cartButtonRef}
            type="button"
            className="btn btn--primary header-cart-btn"
            aria-controls="carrito-drawer"
            aria-expanded={isCartOpen ? 'true' : 'false'}
            onClick={onOpenCart}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 8H18L19.2 20H4.8L6 8Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
              <path d="M9 8V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            <span>Bolsa</span>
            <span className="cart-badge tabular">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
