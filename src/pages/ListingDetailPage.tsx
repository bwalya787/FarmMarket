import { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, ArrowLeft, Sprout, Tag, ShieldCheck, Package, Store } from 'lucide-react';
import { supabase, type ListingWithFarm, type Farm, type Listing } from '@/lib/supabase';
import { type Route, buildHash } from '@/lib/router';
import { formatPrice, timeAgo } from '@/lib/format';
import { ListingCard } from '@/components/ListingCard';

type Props = {
  id: string;
  onNavigate: (r: Route) => void;
};

export function ListingDetailPage({ id, onNavigate }: Props) {
  const [listing, setListing] = useState<ListingWithFarm | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [related, setRelated] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setNotFound(false);
      const { data, error } = await supabase
        .from('listings')
        .select('*, farm:farms(id, name, location, image_url), category:categories(id, name, slug)')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const l = data as ListingWithFarm;
      setListing(l);

      if (l.farm) {
        const { data: farmData } = await supabase
          .from('farms')
          .select('*')
          .eq('id', l.farm.id)
          .maybeSingle();
        if (farmData) setFarm(farmData as Farm);
      }

      if (l.category_id) {
        const { data: rel } = await supabase
          .from('listings')
          .select('*, farm:farms(id, name, location, image_url), category:categories(id, name, slug)')
          .eq('category_id', l.category_id)
          .neq('id', id)
          .limit(4);
        if (rel) setRelated(rel as ListingWithFarm[]);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse">
          <div className="h-5 bg-stone-200 rounded w-32 mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-stone-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-stone-200 rounded w-3/4" />
              <div className="h-6 bg-stone-200 rounded w-1/3" />
              <div className="h-4 bg-stone-200 rounded w-full" />
              <div className="h-4 bg-stone-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Sprout className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-stone-700">Listing not found</h2>
        <button
          onClick={() => onNavigate({ name: 'browse' })}
          className="mt-4 text-green-700 font-medium hover:underline"
        >
          Back to marketplace
        </button>
      </div>
    );
  }

  const isAd = listing.ad_tier !== 'none';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {isAd && (
        <div className={`px-4 py-2 rounded-lg text-sm font-medium mb-4 ${
          listing.ad_tier === 'premium' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
        }`}>
          {listing.ad_tier === 'premium' ? 'Sponsored listing — premium placement' : 'Featured listing'}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 aspect-square">
          {listing.image_url ? (
            <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              <Sprout className="w-16 h-16" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2 mb-3">
            {listing.is_organic && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Organic
              </span>
            )}
            {listing.category && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-stone-100 text-stone-600">
                {listing.category.name}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-stone-800 mb-2">{listing.title}</h1>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-green-700">{formatPrice(listing.price)}</span>
            <span className="text-stone-500">per {listing.unit}</span>
          </div>

          {listing.description && (
            <p className="text-stone-600 leading-relaxed mb-4">{listing.description}</p>
          )}

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-stone-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
                <Package className="w-3.5 h-3.5" /> Availability
              </div>
              <p className="font-semibold text-stone-800 text-sm">
                {listing.quantity_available > 0 ? `${listing.quantity_available} ${listing.unit} available` : 'Sold out'}
              </p>
            </div>
            <div className="bg-stone-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
                <Tag className="w-3.5 h-3.5" /> Listed
              </div>
              <p className="font-semibold text-stone-800 text-sm">{timeAgo(listing.created_at)}</p>
            </div>
          </div>

          {/* Farm card */}
          {farm && (
            <a
              href={buildHash({ name: 'farm', id: farm.id })}
              onClick={(e) => { e.preventDefault(); onNavigate({ name: 'farm', id: farm.id }); }}
              className="flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-xl hover:border-green-300 hover:shadow-sm transition-all mb-4"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-100 shrink-0">
                {farm.image_url ? (
                  <img src={farm.image_url} alt={farm.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <Store className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-stone-500">Sold by</p>
                <p className="font-semibold text-stone-800 truncate">{farm.name}</p>
                {farm.location && <p className="text-xs text-stone-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {farm.location}</p>}
              </div>
            </a>
          )}

          {/* Contact */}
          {farm && (farm.phone || farm.email) && (
            <div className="mt-auto bg-green-50 rounded-xl p-4 border border-green-100">
              <h3 className="font-semibold text-green-800 text-sm mb-3">Contact the farm to buy</h3>
              <div className="flex flex-wrap gap-3">
                {farm.phone && (
                  <a href={`tel:${farm.phone}`} className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg border border-green-200 text-sm font-medium text-stone-700 hover:bg-green-100 transition-colors">
                    <Phone className="w-4 h-4 text-green-700" /> {farm.phone}
                  </a>
                )}
                {farm.email && (
                  <a href={`mailto:${farm.email}`} className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg border border-green-200 text-sm font-medium text-stone-700 hover:bg-green-100 transition-colors">
                    <Mail className="w-4 h-4 text-green-700" /> Email
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-stone-800 mb-5">More from this category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((l) => (
              <ListingCard key={l.id} listing={l as ListingWithFarm} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
