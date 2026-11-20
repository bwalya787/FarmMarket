// Hash-based router

export function parseHash(hash) {
  const clean = hash.replace(/^#\/?/, '');
  const [path, queryString] = clean.split('?');
  const segments = path.split('/').filter(Boolean);
  const params = new URLSearchParams(queryString || '');

  if (segments.length === 0) return { name: 'home' };
  if (segments[0] === 'browse')
    return { name: 'browse', category: params.get('cat') || null, search: params.get('q') || null };
  if (segments[0] === 'listing' && segments[1]) return { name: 'listing', id: segments[1] };
  if (segments[0] === 'farm' && segments[1]) return { name: 'farm', id: segments[1] };
  if (segments[0] === 'farms') return { name: 'farms' };
  if (segments[0] === 'sell') return { name: 'sell' };
  if (segments[0] === 'manage') return { name: 'manage' };
  if (segments[0] === 'ads') return { name: 'ads' };
  if (segments[0] === 'cart') return { name: 'cart' };
  if (segments[0] === 'checkout') return { name: 'checkout' };
  if (segments[0] === 'order' && segments[1]) return { name: 'order', id: segments[1] };
  if (segments[0] === 'watchlist') return { name: 'watchlist' };
  if (segments[0] === 'messages') return { name: 'messages' };
  return { name: 'home' };
}

export function buildHash(route) {
  switch (route.name) {
    case 'home': return '#/';
    case 'browse': {
      const params = new URLSearchParams();
      if (route.category) params.set('cat', route.category);
      if (route.search) params.set('q', route.search);
      const qs = params.toString();
      return qs ? `#/browse?${qs}` : '#/browse';
    }
    case 'listing': return `#/listing/${route.id}`;
    case 'farm': return `#/farm/${route.id}`;
    case 'farms': return '#/farms';
    case 'sell': return '#/sell';
    case 'manage': return '#/manage';
    case 'ads': return '#/ads';
    case 'cart': return '#/cart';
    case 'checkout': return '#/checkout';
    case 'order': return `#/order/${route.id}`;
    case 'watchlist': return '#/watchlist';
    case 'messages': return '#/messages';
    default: return '#/';
  }
}

export function navigate(route) {
  window.location.hash = buildHash(route);
}

let currentRoute = null;
const routeListeners = new Set();

export function getRoute() {
  return currentRoute || parseHash(window.location.hash);
}

export function initRouter() {
  currentRoute = parseHash(window.location.hash);
  const onChange = () => {
    currentRoute = parseHash(window.location.hash);
    window.scrollTo(0, 0);
    routeListeners.forEach((fn) => fn(currentRoute));
  };
  window.addEventListener('hashchange', onChange);
}

export function onRouteChange(fn) {
  routeListeners.add(fn);
  return () => routeListeners.delete(fn);
}
