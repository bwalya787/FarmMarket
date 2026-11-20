import { useEffect, useState } from 'react';
import { ArrowRight, Sprout, Truck, ShieldCheck, Megaphone, TrendingUp } from 'lucide-react';
import { supabase, type ListingWithFarm, type Category, type Ad } from '@/lib/supabase';
import { type Route } from '@/lib/router';
import { getCategoryIcon } from '@/lib/icons';
import { ListingCard } from '@/components/ListingCard';

type Props = { onNavigate: (r: Route) => void };

export function HomePage({ onNavigate }: Props) {
  const [featured, setFeatured] = useState<ListingWithFarm[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroAd, setHeroAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [feat, cats, ads] = await Promise.all([
        supabase
          .from('listings')
          .select('*, farm:farms(id, name, location, image_url), category:categories(id, name, slug)')
          .or('is_featured.eq.true,ad_tier.neq.none')
          .order('ad_tier', { ascending: false })
          .limit(8),
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('ads')
          .select('*')
          .eq('is_active', true)
          .eq('placement', 'hero')
          .or('end_date.is.null,end_date.gt.now()')
          .limit(1)
          .maybeSingle(),
      ]);
      if (feat.data) setFeatured(feat.data as ListingWithFarm[]);
      if (cats.data) setCategories(cats.data);
      if (ads.data) setHeroAd(ads.data as Ad);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-800 via-green-700 to-green-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&h=600&fit=crop)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-sm font-medium mb-4">
              <Sprout className="w-4 h-4" /> Fresh from local farms
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Buy direct from farms near you
            </h1>
            <p className="text-lg text-green-50/90 mb-8 leading-relaxed">
              Browse fresh produce, dairy, grains, and more from local farms.
              Skip the grocery store — get it straight from the source.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate({ name: 'browse' })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-800 rounded-xl font-semibold hover:bg-green-50 transition-colors"
              >
                Browse Marketplace <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate({ name: 'sell' })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-500 transition-colors border border-green-400"
              >
                Sell Your Products
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Ad */}
      {heroAd && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative h-32 md:h-40">
              {heroAd.image_url && (
                <img src={heroAd.image_url} alt={heroAd.title} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-center px-6 md:px-10">
                <div>
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Sponsored</span>
                  <h2 className="text-lg md:text-2xl font-bold text-white mt-1">{heroAd.title}</h2>
                  <p className="text-sm text-white/80 hidden md:block mt-1">{heroAd.description}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <h2 className="text-2xl font-bold text-stone-800 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            return (
              <button
                key={cat.id}
                onClick={() => onNavigate({ name: 'browse', category: cat.slug })}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-stone-200 hover:border-green-400 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Icon className="w-6 h-6 text-green-700" />
                </div>
                <span className="text-sm font-medium text-stone-700 text-center">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-stone-800">Featured & Sponsored</h2>
          <button
            onClick={() => onNavigate({ name: 'browse' })}
            className="text-sm font-medium text-green-700 hover:text-green-800 inline-flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-stone-200 animate-pulse">
                <div className="aspect-square bg-stone-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-stone-200 rounded w-3/4" />
                  <div className="h-5 bg-stone-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <p className="text-stone-500">No featured listings yet.</p>
        )}
      </section>

      {/* Value props */}
      <section className="bg-stone-50 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <Sprout className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 mb-1">Farm Fresh</h3>
                <p className="text-sm text-stone-600 leading-relaxed">Produce harvested at peak freshness and delivered straight from the farm.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 mb-1">Local Pickup</h3>
                <p className="text-sm text-stone-600 leading-relaxed">Buy directly from farms in your area. Arrange pickup or local delivery.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 mb-1">Trusted Farms</h3>
                <p className="text-sm text-stone-600 leading-relaxed">Every farm is verified. Know exactly where your food comes from.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sell CTA + Ad CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-2xl p-8 text-white">
            <Megaphone className="w-8 h-8 mb-4 text-green-200" />
            <h3 className="text-xl font-bold mb-2">Are you a farmer?</h3>
            <p className="text-green-50/90 mb-4 text-sm leading-relaxed">
              List your products for free and reach buyers in your community.
              Set your own prices and manage your inventory.
            </p>
            <button
              onClick={() => onNavigate({ name: 'sell' })}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-green-800 rounded-lg font-semibold text-sm hover:bg-green-50 transition-colors"
            >
              Start Selling <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-8 text-white">
            <TrendingUp className="w-8 h-8 mb-4 text-amber-100" />
            <h3 className="text-xl font-bold mb-2">Promote with Ads</h3>
            <p className="text-amber-50/90 mb-4 text-sm leading-relaxed">
              Boost your listings with sponsored placement. Get featured at the
              top of search results and the homepage.
            </p>
            <button
              onClick={() => onNavigate({ name: 'ads' })}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-amber-700 rounded-lg font-semibold text-sm hover:bg-amber-50 transition-colors"
            >
              Learn About Ads <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
