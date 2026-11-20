import { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, ArrowLeft, Store, Sprout, Package } from 'lucide-react';
import { supabase, type Farm, type ListingWithFarm } from '@/lib/supabase';
import { type Route } from '@/lib/router';
import { ListingCard } from '@/components/ListingCard';

type Props = {
  id: string;
  onNavigate: (r: Route) => void;
};

export function FarmProfilePage({ id, onNavigate }: Props) {
  const [farm, setFarm] = useState<Farm | null>(null);
  const [listings, setListings] = useState<ListingWithFarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setNotFound(false);
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setFarm(data as Farm);

      const { data: items } = await supabase
        .from('listings')
        .select('*, farm:farms(id, name, location, image_url), category:categories(id, name, slug)')
        .eq('farm_id', id)
        .order('ad_tier', { ascending: false })
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });
      if (items) setListings(items as ListingWithFarm[]);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        <div className="h-48 bg-stone-200 rounded-2xl mb-6" />
        <div className="h-8 bg-stone-200 rounded w-1/3 mb-4" />
        <div className="h-4 bg-stone-200 rounded w-1/2 mb-8" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-stone-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !farm) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Store className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-stone-700">Farm not found</h2>
        <button onClick={() => onNavigate({ name: 'farms' })} className="mt-4 text-green-700 font-medium hover:underline">
          View all farms
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Cover */}
      <div className="h-48 md:h-64 bg-gradient-to-br from-green-700 to-green-900 relative overflow-hidden">
        {farm.cover_url && (
          <img src={farm.cover_url} alt="" className="w-full h-full object-cover opacity-30" />
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mt-6 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end -mt-16 sm:-mt-20 relative z-10 mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-white bg-stone-100 shadow-lg shrink-0">
            {farm.image_url ? (
              <img src={farm.image_url} alt={farm.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300">
                <Store className="w-10 h-10" />
              </div>
            )}
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800">{farm.name}</h1>
            {farm.location && (
              <p className="text-stone-500 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" /> {farm.location}
              </p>
            )}
          </div>
        </div>

        {farm.description && (
          <p className="text-stone-600 leading-relaxed mb-6 max-w-2xl">{farm.description}</p>
        )}

        {(farm.owner_name || farm.phone || farm.email) && (
          <div className="flex flex-wrap gap-4 mb-8 bg-stone-50 rounded-xl p-4 border border-stone-200">
            {farm.owner_name && (
              <div className="flex items-center gap-2 text-sm text-stone-700">
                <Store className="w-4 h-4 text-green-700" /> {farm.owner_name}
              </div>
            )}
            {farm.phone && (
              <a href={`tel:${farm.phone}`} className="flex items-center gap-2 text-sm text-stone-700 hover:text-green-700">
                <Phone className="w-4 h-4 text-green-700" /> {farm.phone}
              </a>
            )}
            {farm.email && (
              <a href={`mailto:${farm.email}`} className="flex items-center gap-2 text-sm text-stone-700 hover:text-green-700">
                <Mail className="w-4 h-4 text-green-700" /> {farm.email}
              </a>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-stone-400" />
          <h2 className="text-xl font-bold text-stone-800">Products</h2>
          <span className="text-sm text-stone-500">({listings.length})</span>
        </div>

        {listings.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 pb-20">
            <Sprout className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500">This farm hasn't listed any products yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
