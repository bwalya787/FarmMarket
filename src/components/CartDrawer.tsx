import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useShop } from '@/lib/shop';
import { type Route } from '@/lib/router';
import { formatPrice } from '@/lib/format';

type Props = {
  onNavigate: (r: Route) => void;
};

export function CartDrawer({ onNavigate }: Props) {
  const { cart, cartOpen, setCartOpen, updateQty, removeFromCart, cartTotal, cartCount } = useShop();

  if (!cartOpen) return null;

  const groupedByFarm = cart.reduce((acc, item) => {
    (acc[item.farmName] = acc[item.farmName] || []).push(item);
    return acc;
  }, {} as Record<string, typeof cart>);

  return (
    <div className="fixed inset-0 z-[55] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={() => setCartOpen(false)} />
      <div className="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col animate-[slideIn_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-700" />
            <h2 className="font-semibold text-stone-800">Your Cart</h2>
            {cartCount > 0 && <span className="text-xs font-medium text-stone-500">({cartCount})</span>}
          </div>
          <button onClick={() => setCartOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-stone-400" />
            </div>
            <p className="font-medium text-stone-700">Your cart is empty</p>
            <p className="text-sm text-stone-500 mt-1 mb-4">Browse the marketplace to add items.</p>
            <button
              onClick={() => { setCartOpen(false); onNavigate({ name: 'browse' }); }}
              className="px-5 py-2.5 bg-green-700 text-white rounded-lg font-medium text-sm hover:bg-green-800"
            >
              Browse Marketplace
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {Object.entries(groupedByFarm).map(([farmName, items]) => (
                <div key={farmName}>
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">{farmName}</p>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.listingId} className="flex gap-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                          {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-800 line-clamp-1">{item.title}</p>
                          <p className="text-sm text-stone-500">{formatPrice(item.price)} / {item.unit}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex items-center border border-stone-200 rounded-lg">
                              <button onClick={() => updateQty(item.listingId, item.quantity - 1)} className="p-1 text-stone-500 hover:text-stone-800">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2 text-sm font-medium text-stone-800 min-w-[1.5rem] text-center">{item.quantity}</span>
                              <button onClick={() => updateQty(item.listingId, item.quantity + 1)} disabled={item.quantity >= item.maxAvailable} className="p-1 text-stone-500 hover:text-stone-800 disabled:opacity-30">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <button onClick={() => removeFromCart(item.listingId)} className="p-1 text-stone-400 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-stone-800">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-stone-100 p-5 shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 text-sm">Subtotal</span>
                <span className="text-lg font-bold text-stone-900">{formatPrice(cartTotal)}</span>
              </div>
              <p className="text-xs text-stone-500">Pickup arranged directly with each farm after checkout.</p>
              <button
                onClick={() => { setCartOpen(false); onNavigate({ name: 'checkout' }); }}
                className="w-full py-3 bg-green-700 text-white rounded-xl font-semibold text-sm hover:bg-green-800 flex items-center justify-center gap-2 transition-colors"
              >
                Checkout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
