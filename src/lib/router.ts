import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'browse'; category?: string; search?: string }
  | { name: 'listing'; id: string }
  | { name: 'farm'; id: string }
  | { name: 'farms' }
  | { name: 'sell' }
  | { name: 'manage' }
  | { name: 'ads' };

export function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '');
  const [path, queryString] = clean.split('?');
  const segments = path.split('/').filter(Boolean);
  const params = new URLSearchParams(queryString || '');

  if (segments.length === 0) return { name: 'home' };
  if (segments[0] === 'browse') {
    return { name: 'browse', category: params.get('cat') || undefined, search: params.get('q') || undefined };
  }
  if (segments[0] === 'listing' && segments[1]) return { name: 'listing', id: segments[1] };
  if (segments[0] === 'farm' && segments[1]) return { name: 'farm', id: segments[1] };
  if (segments[0] === 'farms') return { name: 'farms' };
  if (segments[0] === 'sell') return { name: 'sell' };
  if (segments[0] === 'manage') return { name: 'manage' };
  if (segments[0] === 'ads') return { name: 'ads' };
  return { name: 'home' };
}

export function buildHash(route: Route): string {
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
  }
}

export function useRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = (r: Route) => {
    window.location.hash = buildHash(r);
  };

  return [route, navigate];
}
