import { Star } from 'lucide-react';

type Props = {
  rating: number;
  size?: number;
  className?: string;
};

export function StarRatingDisplay({ rating, size = 16, className = '' }: Props) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}
        />
      ))}
    </div>
  );
}

type InputProps = {
  value: number;
  onChange: (v: number) => void;
  size?: number;
};

export function StarRatingInput({ value, onChange, size = 28 }: InputProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="hover:scale-110 transition-transform"
          aria-label={`${i} stars`}
        >
          <Star
            style={{ width: size, height: size }}
            className={i <= value ? 'fill-amber-400 text-amber-400' : 'text-stone-300 hover:text-amber-300'}
          />
        </button>
      ))}
    </div>
  );
}
