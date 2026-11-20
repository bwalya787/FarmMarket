import { Heart, Store, Sprout, Trash2, ArrowRight } from 'lucide-react';
import { useShop } from '@/lib/shop';
import { type Route } from '@/lib/router';

type Props = { onNavigate: (r: Route) => void };

export function WatchlistPage({ onNavigate }: Props) {
  const { watchlist, removeFromWatchlist } = useShop();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 mb-2">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        <h1 className="text-3xl font-bold text-stone-800">My Watchlist</h1>
      </div>
      <p className="text-stone-500 mb-8">Your saved farms and products for quick access.</p>

      {watchlist.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-semibold text-stone-700">Nothing saved yet</h3>
          <p className="text-stone-500 text-sm mt-1 mb-4">Tap the heart icon on any product or farm to save it here.</p>
          <button onClick={() => onNavigate({ name: 'browse' })} className="px-5 py-2.5 bg-green-700 text-white rounded-lg font-medium text-sm hover:bg-green-800">
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((item) => {
            const route: Route = item.type === 'farm'
              ? { name: 'farm', id: item.id }
              : { name: 'listing', id: item.id };
            const Icon = item.type === 'farm' ? Store : Sprout;
            return (
              <div key={`${item.type}-${item.id}`} className="bg-white rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-lg transition-all">
                <a
                  href={`#/${item.type === 'farm' ? 'farm' : 'listing'}/${item.id}`}
                  onClick={(e) => { e.preventDefault(); onNavigate(route); }}
                  className="block relative aspect-video bg-stone-100 overflow-hidden"
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <Icon className="w-10 h-10" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-white/90 text-stone-700 capitalize">
                    {item.type}
                  </span>
                </a>
                <div className="p-4">
                  <h3 className="font-semibold text-stone-800 line-clamp-1">{item.title}</h3>
                  {item.subtitle && <p className="text-sm text-stone-500 line-clamp-1 mt-0.5">{item.subtitle}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => onNavigate(route)}
                      className="text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-1"
                    >
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeFromWatchlist(item.id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
