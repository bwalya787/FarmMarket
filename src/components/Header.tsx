import { Sprout, Search, Store, LayoutDashboard, Megaphone, Menu, X, ShoppingCart, Heart, Mail } from 'lucide-react';
import { useState } from 'react';
import { type Route, buildHash } from '@/lib/router';
import { useShop } from '@/lib/shop';

type Props = {
  current: Route;
  onNavigate: (r: Route) => void;
  searchValue: string;
  onSearch: (q: string) => void;
};

export function Header({ current, onNavigate, searchValue, onSearch }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, setCartOpen, watchlist } = useShop();

  const navItems: { label: string; route: Route; icon: typeof Sprout }[] = [
    { label: 'Marketplace', route: { name: 'browse' }, icon: Store },
    { label: 'Farms', route: { name: 'farms' }, icon: Sprout },
    { label: 'Sell', route: { name: 'sell' }, icon: LayoutDashboard },
    { label: 'Manage', route: { name: 'manage' }, icon: Megaphone },
  ];

  const isActive = (r: Route) => current.name === r.name;

  const handleNav = (r: Route) => {
    onNavigate(r);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <a
            href={buildHash({ name: 'home' })}
            onClick={(e) => { e.preventDefault(); handleNav({ name: 'home' }); }}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-green-700 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-stone-800 hidden sm:block">FarmMarket</span>
          </a>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onNavigate({ name: 'browse', search: searchValue || undefined });
              }}
              placeholder="Search for produce, farms..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-stone-100 rounded-lg border border-transparent focus:bg-white focus:border-green-600 focus:outline-none transition-all"
            />
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onNavigate({ name: 'watchlist' })}
              className="relative p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
              title="Watchlist"
            >
              <Heart className="w-5 h-5" />
              {watchlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {watchlist.length}
                </span>
              )}
            </button>
            <button
              onClick={() => onNavigate({ name: 'messages' })}
              className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors hidden sm:block"
              title="Messages"
            >
              <Mail className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={buildHash(item.route)}
                  onClick={(e) => { e.preventDefault(); handleNav(item.route); }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.route)
                      ? 'bg-green-50 text-green-700'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="lg:hidden pb-4 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={buildHash(item.route)}
                  onClick={(e) => { e.preventDefault(); handleNav(item.route); }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive(item.route)
                      ? 'bg-green-50 text-green-700'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </a>
              );
            })}
            <a
              href={buildHash({ name: 'messages' })}
              onClick={(e) => { e.preventDefault(); handleNav({ name: 'messages' }); }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 sm:hidden"
            >
              <Mail className="w-4 h-4" /> Messages
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
