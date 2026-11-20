import { useEffect, useState } from 'react';
import { Trash2, TrendingUp, ArrowLeft, Store, Megaphone, Star, Edit3, Check, X } from 'lucide-react';
import { supabase, type Farm, type ListingWithFarm } from '@/lib/supabase';
import { type Route } from '@/lib/router';
import { formatPrice } from '@/lib/format';

type Props = { onNavigate: (r: Route) => void };

export function ManagePage({ onNavigate }: Props) {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [listings, setListings] = useState<ListingWithFarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editQty, setEditQty] = useState('');
  const [editFeatured, setEditFeatured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('farms').select('*').order('name').then(({ data }) => {
      if (data) {
        setFarms(data);
        if (data.length > 0 && !selectedFarmId) setSelectedFarmId(data[0].id);
      }
      if (!data || data.length === 0) setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedFarmId) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('listings')
        .select('*, farm:farms(id, name, location, image_url), category:categories(id, name, slug)')
        .eq('farm_id', selectedFarmId)
        .order('created_at', { ascending: false });
      setListings((data || []) as ListingWithFarm[]);
      setLoading(false);
    })();
  }, [selectedFarmId]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) { setError(error.message); return; }
    setListings((prev) => prev.filter((l) => l.id !== id));
    setSuccess('Listing deleted.');
    setTimeout(() => setSuccess(null), 3000);
  };

  const startEdit = (l: ListingWithFarm) => {
    setEditingId(l.id);
    setEditPrice(String(l.price));
    setEditQty(String(l.quantity_available));
    setEditFeatured(l.is_featured);
  };

  const saveEdit = async (id: string) => {
    const { error } = await supabase
      .from('listings')
      .update({
        price: parseFloat(editPrice),
        quantity_available: parseInt(editQty) || 0,
        is_featured: editFeatured,
      })
      .eq('id', id);
    if (error) { setError(error.message); setEditingId(null); return; }
    setListings((prev) => prev.map((l) =>
      l.id === id ? { ...l, price: parseFloat(editPrice), quantity_available: parseInt(editQty) || 0, is_featured: editFeatured } : l
    ));
    setEditingId(null);
    setSuccess('Listing updated.');
    setTimeout(() => setSuccess(null), 3000);
  };

  const promoteListing = async (l: ListingWithFarm, tier: 'basic' | 'premium') => {
    const { error } = await supabase
      .from('listings')
      .update({ ad_tier: tier, ad_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() })
      .eq('id', l.id);
    if (error) { setError(error.message); return; }
    setListings((prev) => prev.map((item) =>
      item.id === l.id ? { ...item, ad_tier: tier, ad_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() } : item
    ));
    setSuccess(`${tier === 'premium' ? 'Premium' : 'Basic'} ad activated for "${l.title}".`);
    setTimeout(() => setSuccess(null), 4000);
  };

  const removeAd = async (id: string) => {
    const { error } = await supabase
      .from('listings')
      .update({ ad_tier: 'none', ad_expires_at: null, is_featured: false })
      .eq('id', id);
    if (error) { setError(error.message); return; }
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, ad_tier: 'none', ad_expires_at: null, is_featured: false } : l));
    setSuccess('Ad removed.');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-3xl font-bold text-stone-800 mb-2">Manage Listings</h1>
      <p className="text-stone-500 mb-6">Edit prices, manage inventory, and promote your products with ads.</p>

      {error && <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      {success && <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2 text-green-800"><Check className="w-5 h-5" /> <span className="text-sm font-medium">{success}</span></div>}

      {farms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <Store className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-700">No farms yet</h3>
          <p className="text-stone-500 text-sm mt-1 mb-4">Create a farm profile to start managing listings.</p>
          <button onClick={() => onNavigate({ name: 'sell' })} className="px-5 py-2.5 bg-green-700 text-white rounded-lg font-medium text-sm hover:bg-green-800">
            Create a Farm
          </button>
        </div>
      ) : (
        <>
          {/* Farm selector */}
          <div className="mb-6">
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500 bg-white"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-stone-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="space-y-3">
              {listings.map((l) => (
                <div key={l.id} className="bg-white rounded-xl border border-stone-200 p-4 flex flex-col sm:flex-row gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                    {l.image_url ? <img src={l.image_url} alt={l.title} className="w-full h-full object-cover" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`#/listing/${l.id}`}
                        onClick={(e) => { e.preventDefault(); onNavigate({ name: 'listing', id: l.id }); }}
                        className="font-semibold text-stone-800 hover:text-green-700"
                      >
                        {l.title}
                      </a>
                      {l.ad_tier === 'premium' && <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500 text-white">Sponsored</span>}
                      {l.ad_tier === 'basic' && <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-600 text-white">Featured</span>}
                      {l.is_organic && <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">Organic</span>}
                    </div>

                    {editingId === l.id ? (
                      <div className="flex flex-wrap gap-3 mt-3">
                        <div>
                          <label className="block text-xs text-stone-500 mb-0.5">Price ($)</label>
                          <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-24 px-2 py-1 text-sm border border-stone-300 rounded" />
                        </div>
                        <div>
                          <label className="block text-xs text-stone-500 mb-0.5">Qty</label>
                          <input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} className="w-24 px-2 py-1 text-sm border border-stone-300 rounded" />
                        </div>
                        <label className="flex items-center gap-1.5 text-sm text-stone-700 self-end mb-1">
                          <input type="checkbox" checked={editFeatured} onChange={(e) => setEditFeatured(e.target.checked)} className="w-4 h-4 rounded border-stone-300 text-green-600" />
                          Featured
                        </label>
                        <div className="flex gap-2 self-end mb-1">
                          <button onClick={() => saveEdit(l.id)} className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 text-stone-500 rounded hover:bg-stone-100"><X className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-stone-500 mt-0.5">
                          {formatPrice(l.price)} / {l.unit} · {l.quantity_available} in stock
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <button onClick={() => startEdit(l)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200">
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                          </button>
                          {l.ad_tier === 'none' ? (
                            <>
                              <button onClick={() => promoteListing(l, 'basic')} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100">
                                <Star className="w-3.5 h-3.5" /> Feature
                              </button>
                              <button onClick={() => promoteListing(l, 'premium')} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100">
                                <TrendingUp className="w-3.5 h-3.5" /> Sponsor
                              </button>
                            </>
                          ) : (
                            <button onClick={() => removeAd(l.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200">
                              <X className="w-3.5 h-3.5" /> Remove ad
                            </button>
                          )}
                          <button onClick={() => handleDelete(l.id, l.title)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
              <Megaphone className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 mb-4">No listings for this farm yet.</p>
              <button onClick={() => onNavigate({ name: 'sell' })} className="px-5 py-2.5 bg-green-700 text-white rounded-lg font-medium text-sm hover:bg-green-800">
                Add Products
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
