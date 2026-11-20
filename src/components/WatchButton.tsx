import { Heart } from 'lucide-react';
import { useShop } from '@/lib/shop';

type Props = {
  id: string;
  type: 'listing' | 'farm';
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  className?: string;
};

export function WatchButton({ id, type, title, subtitle, imageUrl, className = '' }: Props) {
  const { isWatched, toggleWatch } = useShop();
  const watched = isWatched(id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWatch({ id, type, title, subtitle: subtitle ?? null, imageUrl: imageUrl ?? null });
      }}
      className={`flex items-center gap-1.5 transition-colors ${className}`}
      aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
      title={watched ? 'In your watchlist' : 'Save to watchlist'}
    >
      <Heart className={watched ? 'fill-red-500 text-red-500' : 'text-stone-400 hover:text-red-500'} />
    </button>
  );
}
