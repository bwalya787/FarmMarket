import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { ShopProvider } from '@/lib/shop';
import { useRoute } from '@/lib/router';
import { HomePage } from '@/pages/HomePage';
import { BrowsePage } from '@/pages/BrowsePage';
import { ListingDetailPage } from '@/pages/ListingDetailPage';
import { FarmProfilePage } from '@/pages/FarmProfilePage';
import { FarmsPage } from '@/pages/FarmsPage';
import { SellPage } from '@/pages/SellPage';
import { ManagePage } from '@/pages/ManagePage';
import { AdsPage } from '@/pages/AdsPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { WatchlistPage } from '@/pages/WatchlistPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { OrderDetailPage } from '@/pages/OrderDetailPage';

export default function App() {
  const [route, navigate] = useRoute();
  const [search, setSearch] = useState('');

  return (
    <ShopProvider>
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <Header
          current={route}
          onNavigate={navigate}
          searchValue={search}
          onSearch={setSearch}
        />
        <main className="flex-1">
          {route.name === 'home' && <HomePage onNavigate={navigate} />}
          {route.name === 'browse' && (
            <BrowsePage
              onNavigate={navigate}
              initialCategory={route.category}
              initialSearch={route.search}
            />
          )}
          {route.name === 'listing' && <ListingDetailPage id={route.id} onNavigate={navigate} />}
          {route.name === 'farm' && <FarmProfilePage id={route.id} onNavigate={navigate} />}
          {route.name === 'farms' && <FarmsPage onNavigate={navigate} />}
          {route.name === 'sell' && <SellPage onNavigate={navigate} />}
          {route.name === 'manage' && <ManagePage onNavigate={navigate} />}
          {route.name === 'ads' && <AdsPage onNavigate={navigate} />}
          {route.name === 'checkout' && <CheckoutPage onNavigate={navigate} />}
          {route.name === 'watchlist' && <WatchlistPage onNavigate={navigate} />}
          {route.name === 'messages' && <MessagesPage onNavigate={navigate} />}
          {route.name === 'order' && <OrderDetailPage id={route.id} onNavigate={navigate} />}
        </main>
        <Footer onNavigate={navigate} />
        <CartDrawer onNavigate={navigate} />
      </div>
    </ShopProvider>
  );
}
