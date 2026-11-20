import { useEffect, useState } from 'react';
import { Megaphone, TrendingUp, Star, ArrowRight, Check, Sparkles } from 'lucide-react';
import { supabase, type Ad } from '@/lib/supabase';
import { type Route } from '@/lib/router';

type Props = { onNavigate: (r: Route) => void };

const tiers = [
  {
    name: 'Standard Listing',
    price: 'Free',
    tier: 'none',
    icon: Star,
    color: 'stone',
    features: ['List unlimited products', 'Appear in browse & search', 'Farm profile page', 'Contact info for buyers'],
    cta: 'Start Selling',
    route: { name: 'sell' } as Route,
  },
  {
    name: 'Featured',
    price: '$5/mo',
    tier: 'basic',
    icon: TrendingUp,
    color: 'green',
    features: ['Everything in Standard', 'Featured badge on listings', 'Priority in search results', 'Appear in homepage featured row', 'Stand out from competitors'],
    cta: 'Feature Your Products',
    route: { name: 'manage' } as Route,
    highlight: true,
  },
  {
    name: 'Sponsored',
    price: '$15/mo',
    tier: 'premium',
    icon: Sparkles,
    color: 'amber',
    features: ['Everything in Featured', 'Sponsored badge — top placement', 'Premium ad tier sorting', 'Homepage hero placement priority', 'Maximum visibility'],
    cta: 'Sponsor Your Products',
    route: { name: 'manage' } as Route,
  },
];

export function AdsPage({ onNavigate }: Props) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('ads')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setAds(data as Ad[]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Megaphone className="w-7 h-7 text-amber-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-3">Promote Your Farm</h1>
        <p className="text-stone-500 max-w-xl mx-auto">
          Get your products in front of more buyers. Choose a plan that fits your farm
          and boost your visibility across the marketplace.
        </p>
      </div>

      {/* Pricing tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {tiers.map((t) => {
          const Icon = t.icon;
          const isHighlight = t.highlight;
          return (
            <div
              key={t.name}
              className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${
                isHighlight ? 'border-green-500 shadow-lg md:scale-105' : 'border-stone-200'
              }`}
            >
              {isHighlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-600 text-white text-xs font-semibold rounded-full">
                  Most Popular
                </span>
              )}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                t.color === 'amber' ? 'bg-amber-100' : t.color === 'green' ? 'bg-green-100' : 'bg-stone-100'
              }`}>
                <Icon className={`w-6 h-6 ${
                  t.color === 'amber' ? 'text-amber-600' : t.color === 'green' ? 'text-green-700' : 'text-stone-600'
                }`} />
              </div>
              <h3 className="text-lg font-bold text-stone-800">{t.name}</h3>
              <p className="text-3xl font-bold text-stone-900 mt-2">{t.price}</p>
              <ul className="space-y-2 mt-5 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-stone-600">
                    <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onNavigate(t.route)}
                className={`mt-6 w-full py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-1.5 ${
                  isHighlight
                    ? 'bg-green-700 text-white hover:bg-green-800'
                    : t.color === 'amber'
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {t.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Active ads showcase */}
      <div>
        <h2 className="text-xl font-bold text-stone-800 mb-5">Currently Running Ads</h2>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : ads.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ads.map((ad) => (
              <div key={ad.id} className="relative rounded-xl overflow-hidden h-32 group">
                {ad.image_url && (
                  <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20 p-4 flex flex-col justify-end">
                  <span className="text-xs font-semibold text-amber-400 uppercase mb-1">{ad.placement} ad</span>
                  <h3 className="font-bold text-white text-sm">{ad.title}</h3>
                  {ad.description && <p className="text-xs text-white/80 line-clamp-1 mt-0.5">{ad.description}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-stone-500 text-sm">No active ads right now.</p>
        )}
      </div>
    </div>
  );
}
