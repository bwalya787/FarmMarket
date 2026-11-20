import { useEffect, useState } from 'react';
import { Store, Plus, Check, ArrowLeft, Sprout } from 'lucide-react';
import { supabase, type Farm, type Category } from '@/lib/supabase';
import { type Route } from '@/lib/router';
import { getCategoryIcon } from '@/lib/icons';

type Props = { onNavigate: (r: Route) => void };

export function SellPage({ onNavigate }: Props) {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [showFarmForm, setShowFarmForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Farm form
  const [farmName, setFarmName] = useState('');
  const [farmDesc, setFarmDesc] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmOwner, setFarmOwner] = useState('');
  const [farmPhone, setFarmPhone] = useState('');
  const [farmEmail, setFarmEmail] = useState('');
  const [farmImage, setFarmImage] = useState('');

  // Listing form
  const [listingTitle, setListingTitle] = useState('');
  const [listingDesc, setListingDesc] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [listingUnit, setListingUnit] = useState('lb');
  const [listingQty, setListingQty] = useState('');
  const [listingCategory, setListingCategory] = useState('');
  const [listingImage, setListingImage] = useState('');
  const [listingOrganic, setListingOrganic] = useState(false);

  useEffect(() => {
    (async () => {
      const [f, c] = await Promise.all([
        supabase.from('farms').select('*').order('name'),
        supabase.from('categories').select('*').order('sort_order'),
      ]);
      if (f.data) setFarms(f.data);
      if (c.data) setCategories(c.data);
    })();
  }, []);

  const refreshFarms = async () => {
    const { data } = await supabase.from('farms').select('*').order('name');
    if (data) setFarms(data);
  };

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) { setError('Farm name is required'); return; }
    setSubmitting(true);
    setError(null);
    const { data, error } = await supabase
      .from('farms')
      .insert({
        name: farmName.trim(),
        description: farmDesc.trim() || null,
        location: farmLocation.trim() || null,
        owner_name: farmOwner.trim() || null,
        phone: farmPhone.trim() || null,
        email: farmEmail.trim() || null,
        image_url: farmImage.trim() || null,
      })
      .select()
      .single();
    setSubmitting(false);
    if (error) { setError(error.message); return; }
    await refreshFarms();
    setSelectedFarmId(data.id);
    setShowFarmForm(false);
    setFarmName(''); setFarmDesc(''); setFarmLocation(''); setFarmOwner(''); setFarmPhone(''); setFarmEmail(''); setFarmImage('');
    setSuccess('Farm created! Now add your first product.');
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmId) { setError('Please select or create a farm first'); return; }
    if (!listingTitle.trim() || !listingPrice) { setError('Title and price are required'); return; }
    setSubmitting(true);
    setError(null);
    const { error } = await supabase
      .from('listings')
      .insert({
        farm_id: selectedFarmId,
        category_id: listingCategory || null,
        title: listingTitle.trim(),
        description: listingDesc.trim() || null,
        price: parseFloat(listingPrice),
        unit: listingUnit.trim() || 'unit',
        quantity_available: parseInt(listingQty) || 0,
        image_url: listingImage.trim() || null,
        is_organic: listingOrganic,
      });
    setSubmitting(false);
    if (error) { setError(error.message); return; }
    setListingTitle(''); setListingDesc(''); setListingPrice(''); setListingQty('');
    setListingImage(''); setListingOrganic(false);
    setSuccess("Product listed! It's now live in the marketplace.");
    setTimeout(() => setSuccess(null), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-3xl font-bold text-stone-800 mb-2">Sell Your Products</h1>
      <p className="text-stone-500 mb-8">Create a farm profile and list products for buyers to discover.</p>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2 text-green-800">
          <Check className="w-5 h-5 shrink-0" /> <span className="text-sm font-medium">{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* Farm selector */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Store className="w-5 h-5 text-green-700" />
          <h2 className="text-lg font-semibold text-stone-800">Your Farm</h2>
        </div>

        {farms.length > 0 && !showFarmForm ? (
          <div className="space-y-3">
            <select
              value={selectedFarmId}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500"
            >
              <option value="">Select a farm...</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.name}{f.location ? ` — ${f.location}` : ''}</option>
              ))}
            </select>
            <button
              onClick={() => setShowFarmForm(true)}
              className="text-sm text-green-700 font-medium hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Create a new farm
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateFarm} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Farm name *</label>
                <input value={farmName} onChange={(e) => setFarmName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" placeholder="Green Valley Farm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
                <input value={farmLocation} onChange={(e) => setFarmLocation(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" placeholder="Sonoma County, CA" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <textarea value={farmDesc} onChange={(e) => setFarmDesc(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" placeholder="Tell buyers about your farm..." />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Owner name</label>
                <input value={farmOwner} onChange={(e) => setFarmOwner(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                <input value={farmPhone} onChange={(e) => setFarmPhone(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                <input value={farmEmail} onChange={(e) => setFarmEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Profile image URL</label>
              <input value={farmImage} onChange={(e) => setFarmImage(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" placeholder="https://..." />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-green-700 text-white rounded-lg font-medium text-sm hover:bg-green-800 disabled:opacity-50">
                {submitting ? 'Creating...' : 'Create Farm'}
              </button>
              {farms.length > 0 && (
                <button type="button" onClick={() => setShowFarmForm(false)} className="px-5 py-2.5 text-stone-600 rounded-lg font-medium text-sm hover:bg-stone-100">
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Listing form */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sprout className="w-5 h-5 text-green-700" />
          <h2 className="text-lg font-semibold text-stone-800">Add a Product</h2>
        </div>

        {!selectedFarmId && farms.length > 0 ? (
          <p className="text-sm text-stone-500 py-4">Select or create a farm above to start listing products.</p>
        ) : (
          <form onSubmit={handleCreateListing} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Product title *</label>
              <input value={listingTitle} onChange={(e) => setListingTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" placeholder="Heirloom Tomatoes" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <textarea value={listingDesc} onChange={(e) => setListingDesc(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" placeholder="Vine-ripened heirloom tomatoes..." />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Price ($) *</label>
                <input type="number" step="0.01" min="0" value={listingPrice} onChange={(e) => setListingPrice(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" placeholder="4.50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Unit</label>
                <input value={listingUnit} onChange={(e) => setListingUnit(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" placeholder="lb" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Quantity</label>
                <input type="number" min="0" value={listingQty} onChange={(e) => setListingQty(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" placeholder="80" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                <select value={listingCategory} onChange={(e) => setListingCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500">
                  <option value="">None</option>
                  {categories.map((c) => {
                    const Icon = getCategoryIcon(c.icon);
                    void Icon;
                    return <option key={c.id} value={c.id}>{c.name}</option>;
                  })}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
              <input value={listingImage} onChange={(e) => setListingImage(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" placeholder="https://..." />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={listingOrganic} onChange={(e) => setListingOrganic(e.target.checked)} className="w-4 h-4 rounded border-stone-300 text-green-600 focus:ring-green-500" />
              <span className="text-sm text-stone-700">This product is organic</span>
            </label>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-green-700 text-white rounded-lg font-medium text-sm hover:bg-green-800 disabled:opacity-50">
              {submitting ? 'Listing...' : 'List Product'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
