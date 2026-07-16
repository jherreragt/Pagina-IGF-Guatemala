import { useEffect, useState } from 'react';
import {
  Pin, Sparkles, Lock, Trash2, Eye, Search, MessageSquare, Reply, ThumbsUp,
} from 'lucide-react';
import { supabase, ForumThread, ForumCategory } from '../../lib/supabase';

export default function ForumThreads() {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [catMap, setCatMap] = useState<Record<string, ForumCategory>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'featured' | 'pinned'>('all');

  async function load() {
    setLoading(true);
    const { data: cats } = await supabase.from('forum_categories').select('*');
    const map: Record<string, ForumCategory> = {};
    (cats as ForumCategory[] | null)?.forEach((c) => (map[c.id] = c));
    setCatMap(map);

    let q = supabase.from('forum_threads').select('*').order('last_activity_at', { ascending: false });
    if (filter === 'open') q = q.eq('is_closed', false);
    else if (filter === 'closed') q = q.eq('is_closed', true);
    else if (filter === 'featured') q = q.eq('is_featured', true);
    else if (filter === 'pinned') q = q.eq('is_pinned', true);

    const { data } = await q;
    setThreads((data as ForumThread[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  const filtered = search
    ? threads.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.body.toLowerCase().includes(search.toLowerCase()))
    : threads;

  async function togglePinned(t: ForumThread) {
    await supabase.from('forum_threads').update({ is_pinned: !t.is_pinned }).eq('id', t.id);
    load();
  }

  async function toggleFeatured(t: ForumThread) {
    await supabase.from('forum_threads').update({ is_featured: !t.is_featured }).eq('id', t.id);
    load();
  }

  async function toggleClosed(t: ForumThread) {
    await supabase.from('forum_threads').update({ is_closed: !t.is_closed }).eq('id', t.id);
    load();
  }

  async function handleDelete(t: ForumThread) {
    if (!confirm(`¿Eliminar la discusión "${t.title}"? Esta acción no se puede deshacer.`)) return;
    await supabase.from('forum_threads').delete().eq('id', t.id);
    load();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Moderar discusiones</h1>
        <p className="text-slate-400 text-sm mt-1">Fijar, destacar, cerrar o eliminar discusiones del foro.</p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar discusiones..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
          {[
            { key: 'all' as const, label: 'Todas' },
            { key: 'open' as const, label: 'Abiertas' },
            { key: 'closed' as const, label: 'Cerradas' },
            { key: 'featured' as const, label: 'Destacadas' },
            { key: 'pinned' as const, label: 'Fijadas' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filter === key ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Thread list */}
      {loading ? (
        <div className="text-center py-10 text-slate-500 text-sm">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-10 text-center">
          <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay discusiones que coincidan.</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="divide-y divide-white/5">
            {filtered.map((t) => {
              const cat = catMap[t.category_id];
              return (
                <div key={t.id} className="px-5 py-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {cat && <span className="text-xs font-semibold text-sky-400">{cat.name}</span>}
                        {t.is_pinned && <span className="inline-flex items-center gap-1 text-xs text-amber-400"><Pin className="w-3 h-3" /> Fijada</span>}
                        {t.is_featured && <span className="inline-flex items-center gap-1 text-xs text-sky-400"><Sparkles className="w-3 h-3" /> Destacada</span>}
                        {t.is_closed && <span className="inline-flex items-center gap-1 text-xs text-red-400"><Lock className="w-3 h-3" /> Cerrada</span>}
                      </div>
                      <p className="text-white text-sm font-medium truncate">{t.title}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>{t.author_name}</span>
                        <span className="flex items-center gap-1"><Reply className="w-3 h-3" />{t.reply_count}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{t.reaction_count}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{t.view_count}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => togglePinned(t)} title="Fijar/soltar" className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${t.is_pinned ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'}`}>
                        <Pin className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleFeatured(t)} title="Destacar" className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${t.is_featured ? 'bg-sky-500/20 text-sky-400' : 'text-slate-400 hover:text-sky-400 hover:bg-sky-500/10'}`}>
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleClosed(t)} title="Cerrar/abrir" className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${t.is_closed ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'}`}>
                        <Lock className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(t)} title="Eliminar" className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
