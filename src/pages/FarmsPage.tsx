import { useEffect, useState } from 'react';
import { MapPin, Store, Sprout } from 'lucide-react';
import { supabase, type Farm } from '@/lib/supabase';
import { type Route, buildHash } from '@/lib/router';

type Props = { onNavigate: (r: Route) => void };
type FarmWithCount = Farm & { listing_count: number };

export function FarmsPage({ onNavigate }: Props) {
  const [farms, setFarms] = useState<FarmWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('farms')
        .select('*, listings(count)')
        .order('name');
      if (error) { console.error(error); }
      if (data) {
        const mapped = (data as (Farm & { listings: { count: number }[] })[]).map((f) => ({
          ...f,
          listing_count: f.listings?.[0]?.count ?? 0,
        }));
        setFarms(mapped);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-stone-800 mb-2">Local Farms</h1>
      <p className="text-stone-500 mb-8">Meet the farmers growing your food.</p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-200 animate-pulse">
              <div className="h-32 bg-stone-200" />
              <div className="p-5 space-y-2">
                <div className="h-5 bg-stone-200 rounded w-2/3" />
                <div className="h-4 bg-stone-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : farms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <a
              key={farm.id}
              href={buildHash({ name: 'farm', id: farm.id })}
              onClick={(e) => { e.preventDefault(); onNavigate({ name: 'farm', id: farm.id }); }}
              className="group block bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-green-300 hover:shadow-lg transition-all"
            >
              <div className="h-32 bg-gradient-to-br from-green-600 to-green-800 relative overflow-hidden">
                {farm.cover_url && (
                  <img src={farm.cover_url} alt="" className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-300" />
                )}
                <div className="absolute -bottom-6 left-5 w-14 h-14 rounded-xl overflow-hidden border-4 border-white bg-stone-100 shadow">
                  {farm.image_url ? (
                    <img src={farm.image_url} alt={farm.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <Store className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 pt-8">
                <h3 className="font-semibold text-stone-800 group-hover:text-green-700 transition-colors">{farm.name}</h3>
                {farm.location && (
                  <p className="text-sm text-stone-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {farm.location}
                  </p>
                )}
                {farm.description && (
                  <p className="text-sm text-stone-600 mt-2 line-clamp-2 leading-relaxed">{farm.description}</p>
                )}
                <div className="flex items-center gap-1 mt-3 text-xs font-medium text-green-700">
                  <Sprout className="w-3.5 h-3.5" />
                  {farm.listing_count} {farm.listing_count === 1 ? 'product' : 'products'}
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Store className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">No farms registered yet.</p>
        </div>
      )}
    </div>
  );
}
