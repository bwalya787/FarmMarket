import { Sprout } from 'lucide-react';
import { type Route, buildHash } from '@/lib/router';

export function Footer({ onNavigate }: { onNavigate: (r: Route) => void }) {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-1 sm:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center">
                <Sprout className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">FarmMarket</span>
            </div>
            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Connecting local farms with buyers in your community. Fresh produce,
              dairy, grains, and more — straight from the source.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><a href={buildHash({ name: 'browse' })} onClick={(e) => { e.preventDefault(); onNavigate({ name: 'browse' }); }} className="hover:text-white transition-colors">Marketplace</a></li>
              <li><a href={buildHash({ name: 'farms' })} onClick={(e) => { e.preventDefault(); onNavigate({ name: 'farms' }); }} className="hover:text-white transition-colors">Find Farms</a></li>
              <li><a href={buildHash({ name: 'sell' })} onClick={(e) => { e.preventDefault(); onNavigate({ name: 'sell' }); }} className="hover:text-white transition-colors">Sell on FarmMarket</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">For Sellers</h4>
            <ul className="space-y-2 text-sm">
              <li><a href={buildHash({ name: 'manage' })} onClick={(e) => { e.preventDefault(); onNavigate({ name: 'manage' }); }} className="hover:text-white transition-colors">Manage Listings</a></li>
              <li><a href={buildHash({ name: 'ads' })} onClick={(e) => { e.preventDefault(); onNavigate({ name: 'ads' }); }} className="hover:text-white transition-colors">Promote with Ads</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-800 mt-10 pt-6 text-sm text-stone-500">
          © {new Date().getFullYear()} FarmMarket. Connecting farms and communities.
        </div>
      </div>
    </footer>
  );
}
