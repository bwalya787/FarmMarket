import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ShoppingCart, Store } from 'lucide-react';
import { useShop } from '@/lib/shop';
import { supabase } from '@/lib/supabase';
import { type Route } from '@/lib/router';
import { formatPrice } from '@/lib/format';

type Props = { onNavigate: (r: Route) => void };

export function CheckoutPage({ onNavigate }: Props) {
  const { cart, cartTotal, clearCart } = useShop();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const groupedByFarm = cart.reduce((acc, item) => {
    (acc[item.farmName] = acc[item.farmName] || []).push(item);
    return acc;
  }, {} as Record<string, typeof cart>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError('Name and email are required'); return; }
    if (cart.length === 0) { setError('Your cart is empty'); return; }
    setSubmitting(true);
    setError(null);

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_name: name.trim(),
        buyer_email: email.trim(),
        buyer_phone: phone.trim() || null,
        pickup_notes: notes.trim() || null,
        total: cartTotal,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError || !orderData) {
      setSubmitting(false);
      setError(orderError?.message || 'Failed to create order');
      return;
    }

    const orderItems = cart.map((item) => ({
      order_id: orderData.id,
      listing_id: item.listingId,
      farm_id: item.farmId,
      listing_title: item.title,
      farm_name: item.farmName,
      unit_price: item.price,
      quantity: item.quantity,
      unit: item.unit,
      subtotal: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    setSubmitting(false);

    if (itemsError) { setError(itemsError.message); return; }
    setOrderId(orderData.id);
    clearCart();
  };

  // Success screen
  if (orderId) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-700" />
        </div>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">Order Placed!</h1>
        <p className="text-stone-600 mb-1">Thank you, {name}. Your order has been submitted.</p>
        <p className="text-sm text-stone-500 mb-8">Each farm will contact you to arrange pickup. You can track your order anytime.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => onNavigate({ name: 'order', id: orderId })} className="px-5 py-2.5 bg-green-700 text-white rounded-lg font-medium text-sm hover:bg-green-800">
            View Order
          </button>
          <button onClick={() => onNavigate({ name: 'browse' })} className="px-5 py-2.5 bg-stone-100 text-stone-700 rounded-lg font-medium text-sm hover:bg-stone-200">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Empty cart
  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <ShoppingCart className="w-8 h-8 text-stone-400" />
        </div>
        <h1 className="text-xl font-semibold text-stone-700">Your cart is empty</h1>
        <p className="text-stone-500 text-sm mt-1 mb-6">Add some products before checking out.</p>
        <button onClick={() => onNavigate({ name: 'browse' })} className="px-5 py-2.5 bg-green-700 text-white rounded-lg font-medium text-sm hover:bg-green-800">
          Browse Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-3xl font-bold text-stone-800 mb-2">Checkout</h1>
      <p className="text-stone-500 mb-8">Review your items and provide your contact info for pickup.</p>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Your Details</h2>
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Full name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Pickup notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500 resize-none" placeholder="Preferred pickup times, special instructions..." />
            </div>
          </form>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 h-fit">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Order Summary</h2>
          <div className="space-y-5 max-h-[300px] overflow-y-auto mb-4">
            {Object.entries(groupedByFarm).map(([farmName, items]) => (
              <div key={farmName}>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" /> {farmName}
                </p>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.listingId} className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                        {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800 line-clamp-1">{item.title}</p>
                        <p className="text-xs text-stone-500">{item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                      <span className="text-sm font-semibold text-stone-800">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Items</span><span>{cart.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-stone-800">Total</span>
              <span className="text-xl font-bold text-green-700">{formatPrice(cartTotal)}</span>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full mt-5 py-3 bg-green-700 text-white rounded-xl font-semibold text-sm hover:bg-green-800 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? 'Placing Order...' : <>Place Order <ArrowRight className="w-4 h-4" /></>}
          </button>
          <p className="text-xs text-stone-400 text-center mt-3">Payment is arranged directly with each farm at pickup.</p>
        </div>
      </div>
    </div>
  );
}
