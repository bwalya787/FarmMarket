import { useEffect, useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Props = {
  farmId: string;
  farmName: string;
  defaultSubject?: string;
  triggerClassName?: string;
  triggerLabel?: string;
};

export function MessageModal({
  farmId,
  farmName,
  defaultSubject = '',
  triggerClassName = 'flex items-center gap-2 px-4 py-2.5 bg-white rounded-lg border border-green-200 text-sm font-medium text-stone-700 hover:bg-green-100 transition-colors',
  triggerLabel = 'Message Farm',
}: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setSubject(defaultSubject);
  }, [open, defaultSubject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !body.trim()) {
      setError('All fields are required');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from('messages').insert({
      farm_id: farmId,
      sender_name: name.trim(),
      sender_email: email.trim(),
      subject: subject.trim(),
      body: body.trim(),
    });
    setSubmitting(false);
    if (error) { setError(error.message); return; }
    setSuccess(true);
    setName(''); setEmail(''); setSubject(''); setBody('');
    setTimeout(() => { setSuccess(false); setOpen(false); }, 2000);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className={triggerClassName}>
        <MessageSquare className="w-4 h-4" /> {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <div>
                <h3 className="font-semibold text-stone-800">Message {farmName}</h3>
                <p className="text-xs text-stone-500 mt-0.5">Ask about products, pickup times, etc.</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Send className="w-6 h-6 text-green-700" />
                </div>
                <h4 className="font-semibold text-stone-800">Message sent!</h4>
                <p className="text-sm text-stone-500 mt-1">The farm will get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Your name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Subject</label>
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Message</label>
                  <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500 resize-none" placeholder="Hi, I'm interested in..." />
                </div>
                <button type="submit" disabled={submitting} className="w-full py-2.5 bg-green-700 text-white rounded-lg font-medium text-sm hover:bg-green-800 disabled:opacity-50 flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
