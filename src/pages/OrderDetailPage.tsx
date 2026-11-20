import { useEffect, useState } from 'react';
import { ArrowLeft, Package, Store, Check, Clock, MapPin } from 'lucide-react';
import { supabase, type OrderWithItems } from '@/lib/supabase';
import { type Route } from '@/lib/router';
import { formatPrice } from '@/lib/format';

type Props = {
  id: string;
  onNavigate: (r: Route) => void;
};

export function OrderDetailPage({ id, onNavigate }: Props) {
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setOrder(data as OrderWithItems);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        <div className="h-5 bg-stone-200 rounded w-24 mb-6" />
        <div className="h-8 bg-stone-200 rounded w-1/3 mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-stone-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-stone-700">Order not found</h2>
        <button onClick={() => onNavigate({ name: 'browse' })} className="mt-4 text-green-700 font-medium hover:underline">
          Back to marketplace
        </button>
      </div>
    );
  }

  const groupedByFarm = order.order_items.reduce((acc, item) => {
    (acc[item.farm_name] = acc[item.farm_name] || []).push(item);
    return acc;
  }, {} as Record<string, typeof order.order_items>);

  const statusInfo: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: Check },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: Check },
  };
  const status = statusInfo[order.status] || statusInfo.pending;
  const StatusIcon = status.icon;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Order Details</h1>
          <p className="text-sm text-stone-500 mt-1">
            Placed {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}>
          <StatusIcon className="w-4 h-4" /> {status.label}
        </span>
      </div>

      {/* Buyer info */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-6">
        <h2 className="text-sm font-semibold text-stone-700 mb-3">Buyer Information</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div><span className="text-stone-500">Name:</span> <span className="font-medium text-stone-800">{order.buyer_name}</span></div>
          <div><span className="text-stone-500">Email:</span> <span className="font-medium text-stone-800">{order.buyer_email}</span></div>
          {order.buyer_phone && <div><span className="text-stone-500">Phone:</span> <span className="font-medium text-stone-800">{order.buyer_phone}</span></div>}
        </div>
        {order.pickup_notes && (
          <div className="mt-3 p-3 bg-stone-50 rounded-lg">
            <span className="text-xs text-stone-500 font-medium">Pickup Notes</span>
            <p className="text-sm text-stone-700 mt-1">{order.pickup_notes}</p>
          </div>
        )}
      </div>

      {/* Items by farm */}
      <div className="space-y-4">
        {Object.entries(groupedByFarm).map(([farmName, items]) => (
          <div key={farmName} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-stone-50 border-b border-stone-100">
              <Store className="w-4 h-4 text-green-700" />
              <span className="font-semibold text-stone-800 text-sm">{farmName}</span>
            </div>
            <div className="divide-y divide-stone-100">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-stone-800 text-sm">{item.listing_title}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{item.quantity} × {formatPrice(item.unit_price)} / {item.unit}</p>
                  </div>
                  <span className="font-semibold text-stone-800">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-6 bg-white rounded-2xl border border-stone-200 p-5 flex items-center justify-between">
        <span className="font-semibold text-stone-800">Total</span>
        <span className="text-2xl font-bold text-green-700">{formatPrice(order.total)}</span>
      </div>

      <p className="text-xs text-stone-400 text-center mt-4 flex items-center justify-center gap-1">
        <MapPin className="w-3.5 h-3.5" /> Payment and pickup are arranged directly with each farm.
      </p>
    </div>
  );
}
