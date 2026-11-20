import { useEffect, useState, useCallback } from 'react';
import { SlidersHorizontal, X, Sprout } from 'lucide-react';
import { supabase, type ListingWithFarm, type Category } from '@/lib/supabase';
import { type Route } from '@/lib/router';
import { getCategoryIcon } from '@/lib/icons';
import { ListingCard } from '@/components/ListingCard';

type Props = {
  onNavigate: (r: Route) => void;
  initialCategory?: string;
  initialSearch?: string;
};

type SortOption = 'featured' | 'price_low' | 'price_high' | 'newest';

export function BrowsePage({ onNavigate, initialCategory, initialSearch }: Props) {
  const [listings, setListings] = useState<ListingWithFarm[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [search, setSearch] = useState(initialSearch || '');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setSelectedCategory(initialCategory || null);
    setSearch(initialSearch || '');
  }, [initialCategory, initialSearch]);

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order')
      .then(({ data }) => { if (data) setCategories(data); });
  }, []);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('listings')
      .select('*, farm:farms(id, name, location, image_url), category:categories(id, name, slug)');

    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) query = query.eq('category_id', cat.id);
    }
    if (search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`);
    }
    if (organicOnly) {
      query = query.eq('is_organic', true);
    }
    switch (sortBy) {
      case 'price_low': query = query.order('price', { ascending: true }); break;
      case 'price_high': query = query.order('price', { ascending: false }); break;
      case 'newest': query = query.order('created_at', { ascending: false }); break;
      default:
        query = query.order('ad_tier', { ascending: false }).order('is_featured', { ascending: false }).order('created_at', { ascending: false });
    }

    const { data, error } = await query.limit(60);
    if (error) {
      console.error('Error fetching listings:', error);
    }
    setListings((data || []) as ListingWithFarm[]);
    setLoading(false);
  }, [selectedCategory, search, organicOnly, sortBy, categories]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const activeCat = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-800">
          {activeCat ? activeCat.name : 'Marketplace'}
        </h1>
        <p className="text-stone-500 mt-1">
          {search ? `Results for "${search}"` : 'Fresh products from local farms'}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className={`${showFilters ? 'fixed inset-0 z-40 bg-black/40 lg:bg-transparent lg:static lg:z-auto' : 'hidden'} lg:block w-full lg:w-64 shrink-0`}>
          <div className={`${showFilters ? 'fixed bottom-0 left-0 top-0 overflow-y-auto bg-white p-5 lg:static lg:p-0 lg:bg-transparent' : ''} lg:sticky lg:top-20`}>
            <div className="flex items-center justify-between lg:hidden mb-4">
              <h2 className="font-semibold text-stone-800">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-1 text-stone-500"><X className="w-5 h-5" /></button>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-2">Categories</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => { setSelectedCategory(null); onNavigate({ name: 'browse' }); }}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors ${
                      !selectedCategory ? 'bg-green-50 text-green-700 font-medium' : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => {
                    const Icon = getCategoryIcon(cat.icon);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.slug); onNavigate({ name: 'browse', category: cat.slug }); }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                          selectedCategory === cat.slug ? 'bg-green-50 text-green-700 font-medium' : 'text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-stone-100 pt-3">
                <h3 className="text-sm font-semibold text-stone-700 mb-2">Options</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={organicOnly}
                    onChange={(e) => setOrganicOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-stone-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-stone-600">Organic only</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-stone-200 text-sm font-medium text-stone-700"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-stone-500 hidden sm:block">
                {loading ? 'Loading...' : `${listings.length} results`}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-white rounded-lg border border-stone-200 text-sm text-stone-700 focus:outline-none focus:border-green-500"
              >
                <option value="featured">Featured first</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Grid */}
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
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} onNavigate={onNavigate} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center mb-4">
                <Sprout className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-700">No listings found</h3>
              <p className="text-stone-500 text-sm mt-1">Try adjusting your filters or search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
