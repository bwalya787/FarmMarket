import { useEffect, useState } from 'react';
import { Mail, Store, ArrowLeft, Search, CheckCheck, Trash2, Inbox } from 'lucide-react';
import { supabase, type Farm, type Message } from '@/lib/supabase';
import { type Route } from '@/lib/router';

type Props = { onNavigate: (r: Route) => void };

export function MessagesPage({ onNavigate }: Props) {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    supabase.from('farms').select('*').order('name').then(({ data }) => {
      if (data) {
        setFarms(data);
        if (data.length > 0) setSelectedFarmId(data[0].id);
      }
      if (!data || data.length === 0) setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedFarmId) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('farm_id', selectedFarmId)
        .order('created_at', { ascending: false });
      setMessages((data || []) as Message[]);
      setLoading(false);
    })();
  }, [selectedFarmId]);

  const markAllRead = async () => {
    const unread = messages.filter((m) => !m.is_read);
    if (unread.length === 0) return;
    await supabase.from('messages').update({ is_read: true }).in('id', unread.map((m) => m.id));
    setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
  };

  const deleteMessage = async (id: string) => {
    await supabase.from('messages').delete().eq('id', id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const filtered = filter
    ? messages.filter((m) =>
        m.sender_name.toLowerCase().includes(filter.toLowerCase()) ||
        m.subject.toLowerCase().includes(filter.toLowerCase()) ||
        m.body.toLowerCase().includes(filter.toLowerCase()))
    : messages;

  const unreadCount = messages.filter((m) => !m.is_read).length;
  const selectedFarm = farms.find((f) => f.id === selectedFarmId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center gap-2 mb-2">
        <Mail className="w-6 h-6 text-green-700" />
        <h1 className="text-3xl font-bold text-stone-800">Messages</h1>
      </div>
      <p className="text-stone-500 mb-6">View messages sent by buyers to your farms.</p>

      {farms.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <Inbox className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">No farms yet. Create a farm to receive messages.</p>
        </div>
      ) : (
        <>
          {/* Farm selector + actions */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-stone-400" />
              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:border-green-500 bg-white"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100">
                <CheckCheck className="w-4 h-4" /> Mark all read ({unreadCount})
              </button>
            )}
            <div className="relative ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search messages..."
                className="pl-9 pr-3 py-2 text-sm bg-stone-100 rounded-lg border border-transparent focus:bg-white focus:border-green-500 focus:outline-none w-full sm:w-56"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-stone-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((msg) => (
                <div key={msg.id} className={`bg-white rounded-xl border p-4 ${msg.is_read ? 'border-stone-200' : 'border-green-300 bg-green-50/30'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {!msg.is_read && <span className="w-2 h-2 rounded-full bg-green-600 shrink-0" />}
                        <span className="font-semibold text-stone-800 text-sm">{msg.sender_name}</span>
                        <span className="text-xs text-stone-400">· {msg.sender_email}</span>
                      </div>
                      <p className="font-medium text-stone-700 text-sm">{msg.subject}</p>
                      <p className="text-sm text-stone-600 mt-1 leading-relaxed">{msg.body}</p>
                      <p className="text-xs text-stone-400 mt-2">
                        {new Date(msg.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <a href={`mailto:${msg.sender_email}`} className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 text-center">
                        Reply
                      </a>
                      <button onClick={() => deleteMessage(msg.id)} className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
              <Inbox className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">
                {selectedFarm ? `No messages for ${selectedFarm.name} yet.` : 'No messages yet.'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
