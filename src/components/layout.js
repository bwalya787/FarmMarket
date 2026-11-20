import { icon } from './icons.js';
import { navigate, getRoute } from '../lib/router.js';
import { cartCount, getWatchlist, openCart, isCartOpen, closeCart, getCart, updateQty, removeFromCart } from '../lib/store.js';
import { formatPrice } from '../lib/supabase.js';

let mobileMenuOpen = false;

function buildNavHash(route) {
  switch (route.name) {
    case 'browse': return '/browse';
    case 'farms': return '/farms';
    case 'sell': return '/sell';
    case 'manage': return '/manage';
    default: return '/';
  }
}

function getSearchValue() {
  const route = getRoute();
  if (route.name === 'browse' && route.search) return route.search;
  return '';
}

export function renderHeader() {
  const route = getRoute();
  const count = cartCount();
  const watchCount = getWatchlist().length;

  const navItems = [
    { label: 'Marketplace', route: { name: 'browse' }, icon: 'store' },
    { label: 'Farms', route: { name: 'farms' }, icon: 'sprout' },
    { label: 'Sell', route: { name: 'sell' }, icon: 'megaphone' },
    { label: 'Manage', route: { name: 'manage' }, icon: 'sliders' },
  ];

  const navLinks = navItems.map((item) => {
    const active = route.name === item.route.name;
    return `<a href="#${buildNavHash(item.route)}" data-nav="${item.route.name}" class="nav-link ${active ? 'active' : ''}">${icon(item.icon, { size: 16 })} ${item.label}</a>`;
  }).join('');

  const mobileLinks = navItems.map((item) => {
    const active = route.name === item.route.name;
    return `<a href="#${buildNavHash(item.route)}" data-nav="${item.route.name}" class="nav-link ${active ? 'active' : ''}">${icon(item.icon, { size: 16 })} ${item.label}</a>`;
  }).join('');

  return `
    <header class="header" id="app-header">
      <div class="header-inner">
        <a href="#/" data-nav="home" class="logo">
          <span class="logo-icon">${icon('sprout', { size: 20 })}</span>
          <span class="logo-text">FarmMarket</span>
        </a>
        <div class="search-bar">
          ${icon('search', { size: 16 })}
          <input type="text" id="search-input" placeholder="Search for produce, farms..." value="${getSearchValue()}" />
        </div>
        <div class="header-actions">
          <button id="nav-watchlist" class="icon-btn" title="Watchlist">
            ${icon('heart', { size: 20 })}
            ${watchCount > 0 ? `<span class="badge badge-red">${watchCount}</span>` : ''}
          </button>
          <button id="nav-messages" class="icon-btn" title="Messages" style="display:none" data-mobile-show>
            ${icon('mail', { size: 20 })}
          </button>
          <button id="nav-cart" class="icon-btn" title="Cart">
            ${icon('cart', { size: 20 })}
            ${count > 0 ? `<span class="badge badge-green">${count}</span>` : ''}
          </button>
        </div>
        <nav class="nav-desktop">${navLinks}</nav>
        <button id="mobile-toggle" class="icon-btn mobile-toggle">
          ${mobileMenuOpen ? icon('x', { size: 20 }) : icon('menu', { size: 20 })}
        </button>
      </div>
      <nav class="nav-mobile ${mobileMenuOpen ? 'open' : ''}">
        ${mobileLinks}
        <a href="#/messages" data-nav="messages" class="nav-link">${icon('mail', { size: 16 })} Messages</a>
      </nav>
    </header>
  `;
}

export function attachHeaderEvents() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        navigate({ name: 'browse', search: searchInput.value || null });
      }
    });
  }

  document.getElementById('nav-cart')?.addEventListener('click', () => openCart());
  document.getElementById('nav-watchlist')?.addEventListener('click', () => navigate({ name: 'watchlist' }));
  document.getElementById('nav-messages')?.addEventListener('click', () => navigate({ name: 'messages' }));

  document.getElementById('mobile-toggle')?.addEventListener('click', () => {
    mobileMenuOpen = !mobileMenuOpen;
    rerenderHeader();
  });

  document.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', () => {
      mobileMenuOpen = false;
    });
  });
}

export function rerenderHeader() {
  const existing = document.getElementById('app-header');
  if (existing) {
    existing.outerHTML = renderHeader();
    attachHeaderEvents();
  }
}

// ===== Cart Drawer =====

export function renderCartDrawer() {
  const root = document.getElementById('cart-drawer-root');
  if (!root) return;
  root.innerHTML = renderCartDrawerHTML();
  attachCartDrawerEvents();
}

function renderCartDrawerHTML() {
  if (!isCartOpen()) return '';

  const cart = getCart();

  if (cart.length === 0) {
    return `
      <div class="cart-overlay" data-close-cart></div>
      <div class="cart-drawer">
        <div class="cart-header">
          <h2>${icon('cart', { size: 20 })} Your Cart</h2>
          <button class="icon-btn" data-close-cart>${icon('x', { size: 20 })}</button>
        </div>
        <div class="cart-empty">
          <div class="icon-circle">${icon('cart', { size: 32 })}</div>
          <p class="font-semibold" style="color:var(--stone-700)">Your cart is empty</p>
          <p class="text-sm text-stone-500 mt-2 mb-4">Browse the marketplace to add items.</p>
          <button class="btn btn-primary" data-go-browse>Browse Marketplace</button>
        </div>
      </div>
    `;
  }

  const grouped = groupByFarm(cart);
  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const totalCount = cart.reduce((s, c) => s + c.quantity, 0);

  const items = Object.entries(grouped).map(([farmName, items]) => `
    <div class="cart-farm-group">
      <p class="cart-farm-label">${farmName}</p>
      ${items.map((item) => `
        <div class="cart-item">
          <div class="img">${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" />` : ''}</div>
          <div class="info">
            <p class="item-title">${item.title}</p>
            <p class="item-price">${formatPrice(item.price)} / ${item.unit}</p>
            <div class="qty-controls">
              <button data-qty-minus="${item.listingId}">${icon('minus', { size: 14 })}</button>
              <span class="qty-val">${item.quantity}</span>
              <button data-qty-plus="${item.listingId}" ${item.quantity >= item.maxAvailable ? 'disabled' : ''}>${icon('plus', { size: 14 })}</button>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">
            <span class="item-total">${formatPrice(item.price * item.quantity)}</span>
            <button class="icon-btn" data-remove-cart="${item.listingId}" style="padding:2px">${icon('trash', { size: 16 })}</button>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('');

  return `
    <div class="cart-overlay" data-close-cart></div>
    <div class="cart-drawer">
      <div class="cart-header">
        <h2>${icon('cart', { size: 20 })} Your Cart <span class="text-sm text-stone-500">(${totalCount})</span></h2>
        <button class="icon-btn" data-close-cart>${icon('x', { size: 20 })}</button>
      </div>
      <div class="cart-body">${items}</div>
      <div class="cart-footer">
        <div class="flex-between mb-2">
          <span class="text-sm text-stone-600">Subtotal</span>
          <span class="font-bold" style="font-size:18px">${formatPrice(total)}</span>
        </div>
        <p class="text-sm text-stone-400 mb-4">Pickup arranged directly with each farm after checkout.</p>
        <button class="btn btn-primary btn-lg" style="width:100%" data-go-checkout>Checkout ${icon('arrowRight', { size: 16 })}</button>
      </div>
    </div>
  `;
}

function groupByFarm(cart) {
  return cart.reduce((acc, item) => {
    (acc[item.farmName] = acc[item.farmName] || []).push(item);
    return acc;
  }, {});
}

function attachCartDrawerEvents() {
  document.querySelectorAll('[data-close-cart]').forEach((el) => {
    el.addEventListener('click', () => closeCart());
  });
  document.querySelector('[data-go-browse]')?.addEventListener('click', () => { closeCart(); navigate({ name: 'browse' }); });
  document.querySelector('[data-go-checkout]')?.addEventListener('click', () => { closeCart(); navigate({ name: 'checkout' }); });

  document.querySelectorAll('[data-qty-minus]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-qty-minus');
      const item = getCart().find((c) => c.listingId === id);
      if (item) updateQty(id, item.quantity - 1);
    });
  });
  document.querySelectorAll('[data-qty-plus]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-qty-plus');
      const item = getCart().find((c) => c.listingId === id);
      if (item) updateQty(id, item.quantity + 1);
    });
  });
  document.querySelectorAll('[data-remove-cart]').forEach((el) => {
    el.addEventListener('click', () => removeFromCart(el.getAttribute('data-remove-cart')));
  });
}

// ===== Footer =====

export function renderFooter() {
  return `
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-grid">
          <div>
            <div class="footer-logo">
              <span class="logo-icon">${icon('sprout', { size: 16 })}</span>
              <span class="logo-text" style="color:white">FarmMarket</span>
            </div>
            <p>Connecting local farms with buyers in your community. Fresh produce, dairy, grains, and more — straight from the source.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><a href="#/browse" data-nav="browse">Marketplace</a></li>
              <li><a href="#/farms" data-nav="farms">Find Farms</a></li>
              <li><a href="#/sell" data-nav="sell">Sell on FarmMarket</a></li>
            </ul>
          </div>
          <div>
            <h4>For Sellers</h4>
            <ul>
              <li><a href="#/manage" data-nav="manage">Manage Listings</a></li>
              <li><a href="#/ads" data-nav="ads">Promote with Ads</a></li>
              <li><a href="#/messages" data-nav="messages">Messages</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">© ${new Date().getFullYear()} FarmMarket. Connecting farms and communities.</div>
      </div>
    </footer>
  `;
}
