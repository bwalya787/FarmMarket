import { MapPin, Sprout } from 'lucide-react';
import { type ListingWithFarm } from '@/lib/supabase';
import { type Route, buildHash } from '@/lib/router';
import { formatPrice } from '@/lib/format';

type Props = {
  listing: ListingWithFarm;
  onNavigate: (r: Route) => void;
};

export function ListingCard({ listing, onNavigate }: Props) {
  const adBadge = listing.ad_tier === 'premium'
    ? { label: 'Sponsored', className: 'bg-amber-500 text-white' }
    : listing.ad_tier === 'basic'
    ? { label: 'Featured', className: 'bg-green-600 text-white' }
    : listing.is_featured
    ? { label: 'Featured', className: 'bg-green-600 text-white' }
    : null;

  return (
    <a
      href={buildHash({ name: 'listing', id: listing.id })}
      onClick={(e) => { e.preventDefault(); onNavigate({ name: 'listing', id: listing.id }); }}
      className="group block bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-green-300 hover:shadow-lg transition-all duration-200"
    >
      <div className="relative aspect-square bg-stone-100 overflow-hidden">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-300">
            <Sprout className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          {adBadge && (
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${adBadge.className}`}>
              {adBadge.label}
            </span>
          )}
          {listing.is_organic && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-white/90 text-green-700">
              Organic
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-stone-800 line-clamp-1 group-hover:text-green-700 transition-colors">
          {listing.title}
        </h3>
        <p className="text-sm text-stone-500 line-clamp-1 mt-0.5">
          {listing.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-stone-900">{formatPrice(listing.price)}</span>
            <span className="text-xs text-stone-500">/{listing.unit}</span>
          </div>
          {listing.quantity_available > 0 ? (
            <span className="text-xs text-green-600 font-medium">In stock</span>
          ) : (
            <span className="text-xs text-stone-400 font-medium">Sold out</span>
          )}
        </div>
        {listing.farm && (
          <div className="flex items-center gap-1 mt-2 text-xs text-stone-500">
            <MapPin className="w-3 h-3" />
            <span className="line-clamp-1">{listing.farm.name}{listing.farm.location ? ` · ${listing.farm.location}` : ''}</span>
          </div>
        )}
      </div>
    </a>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 animate-pulse">
      <div className="aspect-square bg-stone-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-stone-200 rounded w-3/4" />
        <div className="h-3 bg-stone-200 rounded w-full" />
        <div className="h-5 bg-stone-200 rounded w-1/3 mt-2" />
      </div>
    </div>
  );
}
