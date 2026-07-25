import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  MessageSquare, ChevronLeft, Plus, Reply, ThumbsUp, Pin, X,
  AlertCircle, Lock, Flame, Clock,
} from 'lucide-react';
import PageHero from '../components/PageHero';
import ForumAuthModal from '../components/forum/ForumAuthModal';
import ForumConductModal from '../components/forum/ForumConductModal';
import ForumRulesModal from '../components/forum/ForumRulesModal';
import { useAuth } from '../contexts/AuthContext';
import { useConductAccepted } from '../hooks/useForumModeration';
import { supabase, ForumCategory, ForumThread } from '../lib/supabase';
import { getForumIcon, getForumColor, timeAgo } from '../lib/forum-helpers';

export default function ForumCategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [conductOpen, setConductOpen] = useState(false);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'top' | 'replies'>('recent');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    supabase
      .from('forum_categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        setCategory((data as ForumCategory) ?? null);
      });
  }, [slug]);

  useEffect(() => {
    if (!category) return;
    let q = supabase.from('forum_threads').select('*').eq('category_id', category.id);
    if (sortBy === 'recent') q = q.order('is_pinned', { ascending: false }).order('last_activity_at', { ascending: false });
    else if (sortBy === 'top') q = q.order('is_pinned', { ascending: false }).order('reaction_count', { ascending: false });
    else q = q.order('is_pinned', { ascending: false }).order('reply_count', { ascending: false });
    q.then(({ data }) => {
      setThreads((data as ForumThread[]) ?? []);
      setLoading(false);
    });
  }, [category, sortBy]);

  const { accepted: conductAccepted, recheck: recheckConduct } = useConductAccepted();

  function getDisplayName(): string {
    if (!user) return 'Anónimo';
    const meta = user.user_metadata as Record<string, string> | undefined;
    return meta?.display_name || meta?.name || user.email?.split('@')[0] || 'Participante';
  }

  async function handleCreateThread(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (!conductAccepted) {
      setConductOpen(true);
      return;
    }
    if (!newTitle.trim() || !newBody.trim()) {
      setError('Completa el título y el mensaje.');
      return;
    }
    setSubmitting(true);
    setError('');

    const { data, error: insertError } = await supabase
      .from('forum_threads')
      .insert({
        category_id: category!.id,
        author_id: user.id,
        author_name: getDisplayName(),
        title: newTitle.trim(),
        body: newBody.trim(),
      })
      .select()
      .single();

    setSubmitting(false);

    if (insertError || !data) {
      setError('No se pudo crear la discusión. Inténtalo de nuevo.');
      return;
    }

    setShowNewThread(false);
    setNewTitle('');
    setNewBody('');
    navigate(`/foro/t/${(data as ForumThread).id}`);
  }

  if (!loading && !category) {
    return (
      <div className="pt-32 pb-20 text-center">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-blue-950 mb-2">Categoría no encontrada</h1>
        <Link to="/foro" className="text-sky-600 font-semibold hover:text-sky-700">
          Volver al foro
        </Link>
      </div>
    );
  }

  const Icon = category ? getForumIcon(category.icon_name) : MessageSquare;
  const color = category ? getForumColor(category.color) : getForumColor('sky');

  return (
    <div className="pt-16 sm:pt-24">
      <PageHero
        icon={<Icon className="w-7 h-7" />}
        eyebrow="Sala temática"
        title={category?.name ?? 'Foro'}
        subtitle={category?.description}
      />

      {/* Breadcrumb + actions */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/foro" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-sky-600 text-sm font-medium transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Todas las salas
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={() => setRulesOpen(true)} className="text-slate-400 hover:text-sky-600 text-xs font-medium transition-colors hidden sm:block">
              Reglas
            </button>
            <button
              onClick={() => (user ? setShowNewThread(true) : setAuthOpen(true))}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva discusión
            </button>
          </div>
        </div>
      </div>

      {/* Sort tabs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {[
            { key: 'recent' as const, label: 'Recientes', icon: Clock },
            { key: 'top' as const, label: 'Más apoyadas', icon: Flame },
            { key: 'replies' as const, label: 'Más activas', icon: Reply },
          ].map(({ key, label, icon: TabIcon }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sortBy === key ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Thread list */}
      <section className="py-6 bg-slate-50 min-h-[40vh]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-white border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-blue-950 mb-1">No hay discusiones aún</h3>
              <p className="text-slate-500 text-sm mb-5">Inicia la primera conversación en esta sala temática.</p>
              <button
                onClick={() => (user ? setShowNewThread(true) : setAuthOpen(true))}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-xl hover:bg-sky-500 transition-colors"
              >
                <Plus className="w-4 h-4" /> Crear discusión
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  to={`/foro/t/${thread.id}`}
                  className={`block rounded-2xl border bg-white p-5 hover:shadow-card transition-all group ${
                    thread.is_pinned ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100 hover:border-sky-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${color.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {thread.is_pinned && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                            <Pin className="w-3 h-3" /> Fijada
                          </span>
                        )}
                        {thread.is_featured && (
                          <span className="text-xs font-semibold text-sky-600">Destacada</span>
                        )}
                        {thread.is_closed && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">
                            <Lock className="w-3 h-3" /> Cerrada
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-blue-950 text-[15px] group-hover:text-sky-700 transition-colors leading-snug">
                        {thread.title}
                      </h3>
                      <p className="text-slate-400 text-sm mt-1 line-clamp-1">{thread.body}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                        <span className="font-medium text-slate-600">{thread.author_name}</span>
                        <span className="flex items-center gap-1"><Reply className="w-3 h-3" />{thread.reply_count}</span>
                        <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{thread.reaction_count}</span>
                        <span>{timeAgo(thread.last_activity_at)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New thread modal */}
      {showNewThread && category && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => { setShowNewThread(false); setError(''); }} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg ${color.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color.text}`} />
                </div>
                <div>
                  <h2 className="font-bold text-blue-950 text-base">Nueva discusión</h2>
                  <p className="text-slate-400 text-xs">en {category.name}</p>
                </div>
              </div>
              <button onClick={() => { setShowNewThread(false); setError(''); }} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateThread} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Título</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="¿Qué quieres discutir?"
                  maxLength={200}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mensaje</label>
                <textarea
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Describe tu pregunta, propuesta o experiencia..."
                  rows={6}
                  maxLength={5000}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:-ring-sky-400/30 transition-colors resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">{newBody.length}/5000</p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowNewThread(false); setError(''); }} className="px-4 py-2 text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-xl hover:bg-sky-500 disabled:bg-slate-300 transition-colors">
                  {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ForumConductModal
        open={conductOpen}
        onClose={() => setConductOpen(false)}
        onAccepted={() => recheckConduct()}
      />
      <ForumAuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => recheckConduct()} />
      <ForumRulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}
