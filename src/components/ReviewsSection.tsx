import { useEffect, useState } from 'react';
import { StarRatingDisplay, StarRatingInput } from '@/components/StarRating';
import { supabase, type Review } from '@/lib/supabase';

type Props = {
  targetType: 'listing' | 'farm';
  targetId: string;
};

export function ReviewsSection({ targetType, targetId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .order('created_at', { ascending: false });
      setReviews((data || []) as Review[]);
      setLoading(false);
    })();
  }, [targetType, targetId]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Please enter your name'); return; }
    setSubmitting(true);
    setError(null);
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        target_type: targetType,
        target_id: targetId,
        reviewer_name: name.trim(),
        rating,
        comment: comment.trim() || null,
      })
      .select()
      .single();
    setSubmitting(false);
    if (error) { setError(error.message); return; }
    setReviews((prev) => [data as Review, ...prev]);
    setName(''); setRating(5); setComment('');
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-lg font-bold text-stone-800">
          {reviews.length > 0 ? 'Reviews' : 'No reviews yet'}
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRatingDisplay rating={avgRating} size={16} />
            <span className="text-sm text-stone-500 font-medium">{avgRating.toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
          </div>
        )}
      </div>

      {/* Write a review */}
      <form onSubmit={handleSubmit} className="bg-stone-50 rounded-xl p-4 border border-stone-200 mb-6">
        <h4 className="text-sm font-semibold text-stone-700 mb-3">Write a Review</h4>
        {error && <div className="mb-3 p-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm text-stone-600">Your rating:</span>
          <StarRatingInput value={rating} onChange={setRating} size={24} />
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500 mb-3"
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder="Share your experience..."
          className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500 mb-3 resize-none"
        />
        <button type="submit" disabled={submitting} className="px-4 py-2 bg-green-700 text-white rounded-lg font-medium text-sm hover:bg-green-800 disabled:opacity-50">
          {submitting ? 'Submitting...' : 'Post Review'}
        </button>
      </form>

      {/* Review list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white border border-stone-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-stone-800 text-sm">{r.reviewer_name}</span>
                <span className="text-xs text-stone-400">
                  {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <StarRatingDisplay rating={r.rating} size={14} className="mb-2" />
              {r.comment && <p className="text-sm text-stone-600 leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-stone-400">Be the first to leave a review.</p>
      )}
    </div>
  );
}
