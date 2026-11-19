import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PRODUCTS,
  STORE_INFO,
  TRACKING_INTERVAL_MS,
  TRACKING_LABELS
} from './data/products.js';
import { formatGTQ, generateOrderFolio } from './utils/currency.js';
import Header from './components/Header.jsx';
import StoreView from './components/StoreView.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CheckoutView from './components/CheckoutView.jsx';
import ConfirmationView from './components/ConfirmationView.jsx';
import ProductModal from './components/ProductModal.jsx';
import HistoryModal from './components/HistoryModal.jsx';

const STORAGE_CART_KEY = 'bramadero_gtq_cart_v1';
const STORAGE_ORDERS_KEY = 'bramadero_gtq_orders_v2';
const STORAGE_STOCK_KEY = 'bramadero_gtq_stock_v2';

function getInitialStockMap() {
  const map = {};
  for (const product of PRODUCTS) {
    map[product.id] = product.stock;
  }
  return map;
}

function readStoredStock() {
  const initial = getInitialStockMap();
  try {
    const raw = localStorage.getItem(STORAGE_STOCK_KEY);
    if (!raw) return initial;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return initial;
    const next = { ...initial };
    for (const product of PRODUCTS) {
      if (typeof parsed[product.id] === 'number' && parsed[product.id] >= 0) {
        next[product.id] = Math.floor(parsed[product.id]);
      }
    }
    return next;
  } catch {
    return initial;
  }
}

function readStoredCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_CART_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => PRODUCTS.some((p) => p.id === item.productId) && Number(item.qty) > 0
    );
  } catch {
    return [];
  }
}

function normalizeOrder(order) {
  if (!order || typeof order !== 'object') return null;
  const now = Date.now();
  const createdAtMs = Number(order.createdAtMs) || now;
  const stepStartedAtMs = Number(order.stepStartedAtMs) || createdAtMs;
  const trackingIndex = Math.min(
    TRACKING_LABELS.length - 1,
    Math.max(0, Number(order.trackingIndex) || 0)
  );
  const customer = order.customer || {
    nombre: order.address?.nombre || 'Cliente en tienda',
    telefono: order.address?.telefono || '',
    email: order.address?.email || '',
    horario: order.address?.horario || 'Hoy, 16:00 – 19:00 h',
    notas: order.address?.referencias || ''
  };
  const pickupStore = order.pickupStore || STORE_INFO;
  const subtotal = Number(order.subtotal) || 0;
  const total = Number(order.total ?? subtotal) || subtotal;

  return {
    ...order,
    createdAtMs,
    stepStartedAtMs,
    trackingIndex,
    customer,
    pickupStore,
    subtotal,
    total
  };
}

function readStoredOrders() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_ORDERS_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeOrder).filter(Boolean);
  } catch {
    return [];
  }
}

function getDefaultVariants() {
  const map = {};
  for (const product of PRODUCTS) {
    map[product.id] = product.variants[0];
  }
  return map;
}

export default function App() {
  const [view, setView] = useState('vista-tienda');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [onlyToday, setOnlyToday] = useState(false);
  const [sortBy, setSortBy] = useState('destacados');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariants, setSelectedVariants] = useState(getDefaultVariants);

  const [productStock, setProductStock] = useState(readStoredStock);
  const [cart, setCart] = useState(readStoredCart);
  const [orders, setOrders] = useState(readStoredOrders);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [productModalId, setProductModalId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [demoCheckoutOpts, setDemoCheckoutOpts] = useState(null);

  const [toastMsg, setToastMsg] = useState('');
  const [srAnnouncement, setSrAnnouncement] = useState('');
  const toastTimerRef = useRef(null);
  const cartButtonRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setSrAnnouncement('');
    requestAnimationFrame(() => setSrAnnouncement(msg));
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMsg('');
    }, 3500);
  }, []);

  // Persistencia de stock, carrito y reservas
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STOCK_KEY, JSON.stringify(productStock));
    } catch {
      // Ignorar si almacenamiento no está disponible
    }
  }, [productStock]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
    } catch {
      // Ignorar si almacenamiento no está disponible
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // Ignorar si almacenamiento no está disponible
    }
  }, [orders]);

  // Cronómetro global de 1 segundo para actualizar el conteo y avanzar etapas cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const maxIndex = TRACKING_LABELS.length - 1;
    let advancedOrder = null;

    const hasPendingAdvance = orders.some(
      (order) =>
        order.trackingIndex < maxIndex &&
        nowMs - order.stepStartedAtMs >= TRACKING_INTERVAL_MS
    );

    if (!hasPendingAdvance) return;

    const nextOrders = orders.map((order) => {
      if (order.trackingIndex >= maxIndex) return order;
      const elapsed = nowMs - order.stepStartedAtMs;
      if (elapsed < TRACKING_INTERVAL_MS) return order;

      const steps = Math.floor(elapsed / TRACKING_INTERVAL_MS);
      const nextIndex = Math.min(maxIndex, order.trackingIndex + steps);
      const nextStepStartedAtMs = order.stepStartedAtMs + steps * TRACKING_INTERVAL_MS;

      advancedOrder = {
        id: order.id,
        statusTitle: TRACKING_LABELS[nextIndex].title
      };

      return {
        ...order,
        trackingIndex: nextIndex,
        stepStartedAtMs: nextStepStartedAtMs
      };
    });

    setOrders(nextOrders);
    if (advancedOrder) {
      showToast(`Reserva ${advancedOrder.id} actualizada automáticamente: ${advancedOrder.statusTitle}`);
    }
  }, [nowMs, orders, showToast]);

  // Soporte de ?demo=... para verificación e inspección rápida
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const demo = params.get('demo');
    if (!demo) return;

    const ensureDemoCart = () => {
      setCart((prev) => {
        if (prev.length > 0) return prev;
        return [
          { productId: 'caja-cata', variant: PRODUCTS[0].variants[0], qty: 1 },
          { productId: 'hogaza-centeno', variant: 'Hogaza entera (850 g)', qty: 2 }
        ];
      });
    };

    if (demo === 'carrito') {
      ensureDemoCart();
      setIsCartOpen(true);
    } else if (demo === 'checkout') {
      ensureDemoCart();
      setDemoCheckoutOpts({
        fill: params.get('fill') === '1'
      });
      setView('vista-checkout');
    } else if (demo === 'confirmacion') {
      const now = Date.now();
      setOrders((prev) => {
        if (prev.length > 0) {
          setActiveOrderId(prev[0].id);
          return prev;
        }
        const demoOrder = {
          id: 'BRM-4821',
          createdAt: new Date(now).toLocaleString('es-GT', {
            dateStyle: 'medium',
            timeStyle: 'short'
          }),
          createdAtMs: now,
          stepStartedAtMs: now,
          trackingIndex: 0,
          customer: {
            nombre: 'Sofía Castellanos Morales',
            telefono: '5428 9130',
            email: 'sofia.castellanos@ejemplo.com',
            horario: 'Hoy, 16:00 – 19:00 h',
            notas: 'Pasará a recoger al salir del trabajo'
          },
          pickupStore: STORE_INFO,
          items: [
            {
              id: 'caja-cata',
              name: 'Caja de Cata 3 × 200 g',
              image: '/assets/img/photo-c70.jpg',
              alt: PRODUCTS[0].alt,
              variant: 'Grano entero',
              qty: 1,
              lineTotal: 195
            },
            {
              id: 'hogaza-centeno',
              name: 'Hogaza de Centeno y Alcaravea',
              image: '/assets/img/m33603672-1200.webp',
              alt: PRODUCTS[4].alt,
              variant: 'Hogaza entera (850 g)',
              qty: 2,
              lineTotal: 116
            }
          ],
          subtotal: 311,
          total: 311
        };
        setActiveOrderId(demoOrder.id);
        return [demoOrder];
      });
      setView('vista-confirmacion');
    }
  }, []);

  const getProductStock = useCallback(
    (productId) => {
      if (typeof productStock[productId] === 'number') {
        return productStock[productId];
      }
      const product = PRODUCTS.find((p) => p.id === productId);
      return product ? product.stock : 0;
    },
    [productStock]
  );

  const getProductCartQty = useCallback(
    (productId) =>
      cart.reduce(
        (sum, item) => (item.productId === productId ? sum + item.qty : sum),
        0
      ),
    [cart]
  );

  const getCartQty = useCallback(
    (productId, variant) => {
      const found = cart.find((item) => item.productId === productId && item.variant === variant);
      return found ? found.qty : 0;
    },
    [cart]
  );

  const hasModifiedStock = useMemo(
    () => PRODUCTS.some((p) => getProductStock(p.id) !== p.stock),
    [getProductStock]
  );

  const handleResetStock = useCallback(() => {
    setProductStock(getInitialStockMap());
    showToast('Stock del catálogo restablecido a valores iniciales.');
  }, [showToast]);

  const cartMetrics = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    const productQtyMap = {};

    for (const entry of cart) {
      productQtyMap[entry.productId] = (productQtyMap[entry.productId] || 0) + entry.qty;
    }

    const items = [];
    for (const entry of cart) {
      const product = PRODUCTS.find((p) => p.id === entry.productId);
      if (!product) continue;
      const lineTotal = product.price * entry.qty;
      const availableStock =
        typeof productStock[product.id] === 'number' ? productStock[product.id] : product.stock;
      const totalProductQty = productQtyMap[product.id] || 0;
      const remainingStock = Math.max(0, availableStock - totalProductQty);

      count += entry.qty;
      subtotal += lineTotal;
      items.push({
        product,
        variant: entry.variant,
        qty: entry.qty,
        lineTotal,
        availableStock,
        totalProductQty,
        remainingStock
      });
    }

    return { count, subtotal, total: subtotal, items };
  }, [cart, productStock]);

  const showMobileBar = cartMetrics.count > 0 && view === 'vista-tienda';

  useEffect(() => {
    document.body.classList.toggle('has-mobile-bar', showMobileBar);
    return () => document.body.classList.remove('has-mobile-bar');
  }, [showMobileBar]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
      if (selectedCategory !== 'todos' && p.category !== selectedCategory) return false;
      if (onlyToday && !p.today) return false;
      if (query) {
        const haystack = `${p.name} ${p.categoryLabel} ${p.description} ${p.variants.join(' ')}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    if (sortBy === 'precio-asc') {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'precio-desc') {
      list = [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [selectedCategory, onlyToday, searchQuery, sortBy]);

  const handleSelectVariant = useCallback((productId, variant) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
  }, []);

  const handleAddToCart = useCallback(
    (productId, variant, qty = 1) => {
      const product = PRODUCTS.find((p) => p.id === productId);
      if (!product) return false;

      const available = getProductStock(productId);
      const inCart = getProductCartQty(productId);
      const requestedQty = Math.max(1, Math.floor(Number(qty) || 1));

      if (available <= 0) {
        showToast(`Sin stock: ${product.name} está agotado.`);
        return false;
      }

      if (inCart + requestedQty > available) {
        showToast(
          `Stock insuficiente para ${product.name}. Solo hay ${available} unidades disponibles (${inCart} ya en tu bolsa).`
        );
        return false;
      }

      const chosenVariant = variant || product.variants[0];

      setCart((prev) => {
        const idx = prev.findIndex(
          (item) => item.productId === productId && item.variant === chosenVariant
        );
        if (idx === -1) {
          return [...prev, { productId, variant: chosenVariant, qty: requestedQty }];
        }
        return prev.map((item, i) =>
          i === idx ? { ...item, qty: item.qty + requestedQty } : item
        );
      });

      showToast(`Añadido a tu reserva: ${product.name} (${chosenVariant})`);
      return true;
    },
    [getProductCartQty, getProductStock, showToast]
  );

  const handleUpdateQty = useCallback(
    (productId, variant, delta) => {
      const product = PRODUCTS.find((p) => p.id === productId);
      if (!product) return;

      if (delta > 0) {
        const available = getProductStock(productId);
        const inCart = getProductCartQty(productId);
        if (inCart + delta > available) {
          showToast(
            `Límite de stock alcanzado para ${product.name} (${available} disponibles).`
          );
          return;
        }
      }

      setCart((prev) => {
        const next = prev
          .map((item) =>
            item.productId === productId && item.variant === variant
              ? { ...item, qty: item.qty + delta }
              : item
          )
          .filter((item) => item.qty > 0);

        if (next.length === 0 && view === 'vista-checkout') {
          setView('vista-tienda');
          showToast('Tu bolsa quedó vacía; volviste al catálogo.');
        }
        return next;
      });
    },
    [getProductCartQty, getProductStock, showToast, view]
  );

  const handleRemoveItem = useCallback(
    (productId, variant) => {
      setCart((prev) => {
        const next = prev.filter(
          (item) => !(item.productId === productId && item.variant === variant)
        );
        if (next.length === 0 && view === 'vista-checkout') {
          setView('vista-tienda');
          showToast('Tu bolsa quedó vacía; volviste al catálogo.');
        }
        return next;
      });
    },
    [view, showToast]
  );

  const handleClearCart = useCallback(() => {
    setCart([]);
    showToast('Bolsa vaciada');
  }, [showToast]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory('todos');
    setOnlyToday(false);
    setSortBy('destacados');
    setSearchQuery('');
  }, []);

  const switchView = useCallback((nextView, anchorSelector = null) => {
    setView(nextView);
    if (nextView === 'vista-checkout' || nextView === 'vista-confirmacion') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } else if (anchorSelector) {
      requestAnimationFrame(() => {
        document.querySelector(anchorSelector)?.scrollIntoView();
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const handleGoToCheckout = useCallback(() => {
    if (cartMetrics.count === 0) {
      showToast('Agrega al menos un producto antes de continuar a tu reserva.');
      return;
    }
    setIsCartOpen(false);
    switchView('vista-checkout');
  }, [cartMetrics.count, showToast, switchView]);

  const handleOrderConfirmed = useCallback(
    ({ customer }) => {
      const qtyByProduct = {};
      for (const item of cartMetrics.items) {
        qtyByProduct[item.product.id] = (qtyByProduct[item.product.id] || 0) + item.qty;
      }

      for (const [productId, requested] of Object.entries(qtyByProduct)) {
        const product = PRODUCTS.find((p) => p.id === productId);
        const available = getProductStock(productId);
        if (available <= 0 || requested > available) {
          showToast(
            `Stock insuficiente para ${product?.name || productId}. Disponibles: ${available}, solicitados: ${requested}.`
          );
          return false;
        }
      }

      const now = Date.now();
      setNowMs(now);

      setProductStock((prev) => {
        const next = { ...prev };
        for (const [productId, requested] of Object.entries(qtyByProduct)) {
          const current = typeof next[productId] === 'number' ? next[productId] : 0;
          next[productId] = Math.max(0, current - requested);
        }
        return next;
      });

      const order = {
        id: generateOrderFolio(),
        createdAt: new Date(now).toLocaleString('es-GT', {
          dateStyle: 'medium',
          timeStyle: 'short'
        }),
        createdAtMs: now,
        stepStartedAtMs: now,
        trackingIndex: 0,
        customer,
        pickupStore: STORE_INFO,
        items: cartMetrics.items.map((item) => ({
          id: item.product.id,
          name: item.product.name,
          image: item.product.image,
          alt: item.product.alt,
          variant: item.variant,
          qty: item.qty,
          lineTotal: item.lineTotal
        })),
        subtotal: cartMetrics.subtotal,
        total: cartMetrics.total
      };

      setOrders((prev) => [order, ...prev]);
      setActiveOrderId(order.id);
      setCart([]);
      switchView('vista-confirmacion');
      showToast(`Reserva ${order.id} confirmada para recoger en tienda (${formatGTQ(order.total)})`);
      return true;
    },
    [cartMetrics, getProductStock, showToast, switchView]
  );

  const modalProduct = useMemo(
    () => PRODUCTS.find((p) => p.id === productModalId) || null,
    [productModalId]
  );

  const activeOrder = useMemo(
    () => orders.find((o) => o.id === activeOrderId) || orders[0] || null,
    [orders, activeOrderId]
  );

  return (
    <>
      <a className="skip-link" href="#contenido-principal">
        Saltar al contenido principal
      </a>

      <Header
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (view !== 'vista-tienda') {
            switchView('vista-tienda', '#catalogo');
          }
        }}
        ordersCount={orders.length}
        cartCount={cartMetrics.count}
        isCartOpen={isCartOpen}
        onGoHome={() => switchView('vista-tienda')}
        onNavigateAnchor={(anchor) => switchView('vista-tienda', anchor)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        cartButtonRef={cartButtonRef}
      />

      <main id="contenido-principal">
        {view === 'vista-tienda' && (
          <StoreView
            filteredProducts={filteredProducts}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onlyToday={onlyToday}
            onToggleToday={setOnlyToday}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onClearFilters={handleClearFilters}
            selectedVariants={selectedVariants}
            onSelectVariant={handleSelectVariant}
            getCartQty={getCartQty}
            getProductCartQty={getProductCartQty}
            getProductStock={getProductStock}
            hasModifiedStock={hasModifiedStock}
            onResetStock={handleResetStock}
            onAddToCart={handleAddToCart}
            onUpdateQty={handleUpdateQty}
            onOpenProductModal={(id) => setProductModalId(id)}
            onHeroQuickAdd={() => {
              const added = handleAddToCart('caja-cata', PRODUCTS[0].variants[0], 1);
              if (added) {
                setIsCartOpen(true);
              }
            }}
          />
        )}

        {view === 'vista-checkout' && (
          <CheckoutView
            metrics={cartMetrics}
            demoOptions={demoCheckoutOpts}
            onBackToStore={() => switchView('vista-tienda', '#catalogo')}
            onOrderConfirmed={handleOrderConfirmed}
            onShowToast={showToast}
          />
        )}

        {view === 'vista-confirmacion' && (
          <ConfirmationView
            order={activeOrder}
            nowMs={nowMs}
            onBackToCatalog={() => switchView('vista-tienda', '#catalogo')}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />
        )}
      </main>

      <footer className="site-footer">
        <div className="wrap footer-inner">
          <div className="footer-brand">
            <span className="brand-name">Bramadero</span>
            <p className="footer-address">
              {STORE_INFO.address} · {STORE_INFO.hours}
            </p>
          </div>
          <div className="footer-meta">
            <p>Prototipo React en Quetzales guatemaltecos (GTQ) — reservas en línea para entrega exclusiva en tienda física, sin pagos ni envíos en la página.</p>
            <p className="credits-line">Fotografías vía Unsplash y Wikimedia Commons</p>
          </div>
        </div>
      </footer>

      <CartDrawer
        isOpen={isCartOpen}
        metrics={cartMetrics}
        showMobileBar={showMobileBar}
        onClose={() => setIsCartOpen(false)}
        onOpenCart={() => setIsCartOpen(true)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onGoToCheckout={handleGoToCheckout}
        onBrowseCatalog={() => {
          setIsCartOpen(false);
          switchView('vista-tienda', '#catalogo');
        }}
        returnFocusToRef={cartButtonRef}
      />

      <ProductModal
        product={modalProduct}
        selectedVariant={modalProduct ? selectedVariants[modalProduct.id] : ''}
        availableStock={modalProduct ? getProductStock(modalProduct.id) : 0}
        totalProductInCart={modalProduct ? getProductCartQty(modalProduct.id) : 0}
        onSelectVariant={handleSelectVariant}
        onAddToCart={handleAddToCart}
        onClose={() => setProductModalId(null)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        orders={orders}
        nowMs={nowMs}
        onSelectOrder={(orderId) => {
          setActiveOrderId(orderId);
          setIsHistoryOpen(false);
          switchView('vista-confirmacion');
        }}
        onClose={() => setIsHistoryOpen(false)}
      />

      <div className="sr-only" aria-live="polite">
        {srAnnouncement}
      </div>

      {toastMsg && (
        <div className="toast" role="status" aria-live="polite">
          {toastMsg}
        </div>
      )}
    </>
  );
}
