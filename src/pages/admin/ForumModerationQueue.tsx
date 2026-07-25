import { useEffect, useState, useCallback } from 'react';
import {
  Clock, CheckCircle2, XCircle, MessageSquare, Reply, User, Eye, ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, ForumThread, ForumPost } from '../../lib/supabase';

type PendingThread = ForumThread & { category_name?: string };
type PendingPost = ForumPost & { thread_title?: string };

export default function ForumModerationQueue() {
  const [threads, setThreads] = useState<PendingThread[]>([]);
  const [posts, setPosts] = useState<PendingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: t }, { data: p }] = await Promise.all([
      supabase
        .from('forum_threads')
        .select('*, forum_categories!inner(name)')
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: false }),
      supabase
        .from('forum_posts')
        .select('*, forum_threads!inner(title)')
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: false }),
    ]);
    setThreads(
      ((t as (ForumThread & { forum_categories: { name: string } })[]) ?? []).map((row) => ({
        ...row,
        category_name: row.forum_categories?.name,
      }))
    );
    setPosts(
      ((p as (ForumPost & { forum_threads: { title: string } })[]) ?? []).map((row) => ({
        ...row,
        thread_title: row.forum_threads?.title,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function approveThread(id: string) {
    setActing(id);
    await supabase.from('forum_threads').update({ moderation_status: 'approved' }).eq('id', id);
    setActing(null);
    load();
  }

  async function rejectThread(id: string) {
    if (!confirm('¿Rechazar y eliminar esta discusión?')) return;
    setActing(id);
    await supabase.from('forum_threads').delete().eq('id', id);
    setActing(null);
    load();
  }

  async function approvePost(id: string) {
    setActing(id);
    await supabase.from('forum_posts').update({ moderation_status: 'approved' }).eq('id', id);
    setActing(null);
    load();
  }

  async function rejectPost(id: string) {
    if (!confirm('¿Rechazar y eliminar esta respuesta?')) return;
    setActing(id);
    await supabase.from('forum_posts').delete().eq('id', id);
    setActing(null);
    load();
  }

  const total = threads.length + posts.length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cola de moderación</h1>
          <p className="text-slate-400 text-sm mt-1">
            Primer aporte de personas nuevas, esperando aprobación.
          </p>
        </div>
        {total > 0 && (
          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/15 text-amber-400 rounded-lg text-sm font-semibold">
            <Clock className="w-4 h-4" /> {total} pendiente{total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-4 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
        <p className="text-slate-300 text-xs leading-relaxed">
          Cuando alguien publica por primera vez en el foro, su aporte queda pendiente hasta
          que un moderador lo aprueba. Aportes posteriores se publican automáticamente.
          Esto ayuda a prevenir spam y trolls sin frenar a quienes ya participan.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500 text-sm">Cargando pendientes...</div>
      ) : total === 0 ? (
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-green-400/60 mx-auto mb-3" />
          <p className="text-white font-semibold text-sm">No hay nada pendiente</p>
          <p className="text-slate-400 text-xs mt-1">Todo el contenido nuevo está aprobado.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Pending threads */}
          {threads.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <h2 className="text-white font-semibold text-sm">
                  Discusiones ({threads.length})
                </h2>
              </div>
              <div className="space-y-3">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    className="bg-slate-800/50 border border-white/10 rounded-2xl p-5"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400">
                            {thread.category_name ?? 'Categoría'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <User className="w-3 h-3" /> {thread.author_name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(thread.created_at).toLocaleDateString('es-GT')}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold text-sm mb-1.5">{thread.title}</h3>
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                          {thread.body}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => approveThread(thread.id)}
                          disabled={acting === thread.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:bg-slate-700"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                        </button>
                        <button
                          onClick={() => rejectThread(thread.id)}
                          disabled={acting === thread.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:bg-slate-700"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Rechazar
                        </button>
                      </div>
                    </div>
                    <Link
                      to={`/foro/t/${thread.id}`}
                      className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      <Eye className="w-3 h-3" /> Ver en el foro
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending posts */}
          {posts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Reply className="w-4 h-4 text-blue-400" />
                <h2 className="text-white font-semibold text-sm">
                  Respuestas ({posts.length})
                </h2>
              </div>
              <div className="space-y-3">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-slate-800/50 border border-white/10 rounded-2xl p-5"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <User className="w-3 h-3" /> {post.author_name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(post.created_at).toLocaleDateString('es-GT')}
                          </span>
                        </div>
                        {post.thread_title && (
                          <p className="text-slate-500 text-xs mb-1.5">
                            En: <span className="text-slate-300">{post.thread_title}</span>
                          </p>
                        )}
                        <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">
                          {post.body}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => approvePost(post.id)}
                          disabled={acting === post.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:bg-slate-700"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                        </button>
                        <button
                          onClick={() => rejectPost(post.id)}
                          disabled={acting === post.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/80 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:bg-slate-700"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
