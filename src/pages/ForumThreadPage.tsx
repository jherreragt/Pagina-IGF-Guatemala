import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  MessageSquare, ChevronLeft, Reply, ThumbsUp, Flag, Pin, Lock,
  AlertCircle, Send, EyeOff, Trash2, ShieldAlert, Sparkles, X,
  ShieldCheck, EyeOff as HideIcon, Clock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ForumAuthModal from '../components/forum/ForumAuthModal';
import ForumConductModal from '../components/forum/ForumConductModal';
import ForumRulesModal from '../components/forum/ForumRulesModal';
import { useConductAccepted, useForumAdmin, REPORT_CATEGORY_LABELS, REPORT_CATEGORIES } from '../hooks/useForumModeration';
import { supabase, ForumThread, ForumPost, ForumCategory, ForumReportReasonCategory } from '../lib/supabase';
import { getForumIcon, getForumColor, timeAgo } from '../lib/forum-helpers';

export default function ForumThreadPage() {
  const { id: threadId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [thread, setThread] = useState<ForumThread | null>(null);
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [conductOpen, setConductOpen] = useState(false);
  const { accepted: conductAccepted, recheck: recheckConduct } = useConductAccepted();
  const { isAdmin } = useForumAdmin();
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set());
  const [reportTarget, setReportTarget] = useState<{ type: 'thread' | 'post'; id: string } | null>(null);
  const [reportCategory, setReportCategory] = useState<ForumReportReasonCategory>('otro');
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  function getDisplayName(): string {
    if (!user) return 'Anónimo';
    const meta = user.user_metadata as Record<string, string> | undefined;
    return meta?.display_name || meta?.name || user.email?.split('@')[0] || 'Participante';
  }

  const loadThread = useCallback(() => {
    if (!threadId) return;
    supabase
      .from('forum_threads')
      .select('*')
      .eq('id', threadId)
      .maybeSingle()
      .then(({ data }) => {
        const t = data as ForumThread | null;
        setThread(t);
        if (t) {
          supabase
            .from('forum_categories')
            .select('*')
            .eq('id', t.category_id)
            .maybeSingle()
            .then(({ data: catData }) => setCategory(catData as ForumCategory | null));

          // Increment view count
          supabase.rpc('increment_view_count', { thread_id: threadId }).then(() => {});
        }
        setLoading(false);
      });
  }, [threadId]);

  const loadPosts = useCallback(() => {
    if (!threadId) return;
    supabase
      .from('forum_posts')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setPosts((data as ForumPost[]) ?? []));
  }, [threadId]);

  const loadMyReactions = useCallback(() => {
    if (!user || !threadId) return;
    supabase
      .from('forum_reactions')
      .select('target_type, target_id')
      .eq('user_id', user.id)
      .or(`target_id.eq.${threadId}`)
      .then(({ data }) => {
        const set = new Set<string>();
        (data ?? []).forEach((r: { target_type: string; target_id: string }) => {
          set.add(`${r.target_type}:${r.target_id}`);
        });
        setMyReactions(set);
      });

    // Also check reactions on posts in this thread
    posts.forEach((p) => {
      supabase
        .from('forum_reactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('target_type', 'post')
        .eq('target_id', p.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setMyReactions((prev) => new Set(prev).add(`post:${p.id}`));
          }
        });
    });
  }, [user, threadId, posts]);

  useEffect(() => { loadThread(); }, [loadThread]);
  useEffect(() => { loadPosts(); }, [loadPosts]);
  useEffect(() => { loadMyReactions(); }, [loadMyReactions]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { setAuthOpen(true); return; }
    if (!conductAccepted) { setConductOpen(true); return; }
    if (!replyBody.trim()) return;
    if (thread?.is_closed) return;
    setSubmitting(true);
    setError('');

    const { error: insertError } = await supabase.from('forum_posts').insert({
      thread_id: threadId,
      author_id: user.id,
      author_name: getDisplayName(),
      body: replyBody.trim(),
    });

    setSubmitting(false);
    if (insertError) {
      setError('No se pudo publicar tu respuesta. Inténtalo de nuevo.');
      return;
    }
    setReplyBody('');
    setError('');
    loadPosts();
    loadThread();
  }

  async function handleModerateThread(field: 'is_pinned' | 'is_closed' | 'is_featured' | 'is_hidden', value: boolean) {
    if (!thread || !isAdmin) return;
    await supabase.from('forum_threads').update({ [field]: value }).eq('id', thread.id);
    loadThread();
  }

  async function handleModeratePost(postId: string, field: 'is_hidden' | 'moderation_status', value: boolean | string) {
    if (!isAdmin) return;
    await supabase.from('forum_posts').update({ [field]: value }).eq('id', postId);
    loadPosts();
    loadThread();
  }

  async function handleAdminDeletePost(postId: string) {
    if (!isAdmin) return;
    if (!confirm('¿Eliminar esta respuesta? Esta acción no se puede deshacer.')) return;
    await supabase.from('forum_posts').delete().eq('id', postId);
    loadPosts();
    loadThread();
  }

  async function handleAdminDeleteThread() {
    if (!isAdmin || !thread) return;
    if (!confirm('¿Eliminar esta discusión? Esta acción no se puede deshacer.')) return;
    await supabase.from('forum_threads').delete().eq('id', thread.id);
    navigate('/foro');
  }

  async function handleReact(targetType: 'thread' | 'post', targetId: string) {
    if (!user) { setAuthOpen(true); return; }
    const key = `${targetType}:${targetId}`;
    const hasReacted = myReactions.has(key);

    if (hasReacted) {
      await supabase
        .from('forum_reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('target_type', targetType)
        .eq('target_id', targetId);
      setMyReactions((prev) => { const s = new Set(prev); s.delete(key); return s; });
    } else {
      await supabase.from('forum_reactions').insert({
        user_id: user.id,
        target_type: targetType,
        target_id: targetId,
      });
      setMyReactions((prev) => new Set(prev).add(key));
    }

    // Refresh counts
    loadThread();
    loadPosts();
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !reportTarget) return;
    if (reportCategory === 'otro' && !reportReason.trim()) {
      setError('Selecciona un motivo o descríbelo.');
      return;
    }
    setReportSubmitting(true);
    const { error: reportError } = await supabase.from('forum_reports').insert({
      reporter_id: user.id,
      target_type: reportTarget.type,
      target_id: reportTarget.id,
      reason: reportReason.trim() || REPORT_CATEGORY_LABELS[reportCategory],
      reason_category: reportCategory,
    });
    setReportSubmitting(false);
    if (reportError) {
      setError('No se pudo enviar el reporte.');
      return;
    }
    setReportDone(true);
    setReportReason('');
    setReportCategory('otro');
    setTimeout(() => { setReportTarget(null); setReportDone(false); }, 2000);
  }

  async function handleDeletePost(postId: string) {
    if (!user) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const isOwner = post.author_id === user.id;
    if (!isOwner) return;
    await supabase.from('forum_posts').delete().eq('id', postId).eq('author_id', user.id);
    loadPosts();
    loadThread();
  }

  async function handleDeleteThread() {
    if (!user || !thread) return;
    const isOwner = thread.author_id === user.id;
    if (!isOwner) return;
    await supabase.from('forum_threads').delete().eq('id', thread.id).eq('author_id', user.id);
  }

  if (loading) {
    return (
      <div className="pt-32 pb-20 text-center">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm mt-3">Cargando discusión...</p>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="pt-32 pb-20 text-center">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-blue-950 mb-2">Discusión no encontrada</h1>
        <Link to="/foro" className="text-sky-600 font-semibold hover:text-sky-700">Volver al foro</Link>
      </div>
    );
  }

  const Icon = category ? getForumIcon(category.icon_name) : MessageSquare;
  const color = category ? getForumColor(category.color) : getForumColor('sky');
  const isOwner = user?.id === thread.author_id;
  const hasThreadReaction = myReactions.has(`thread:${thread.id}`);

  return (
    <div className="pt-16 sm:pt-24 min-h-screen bg-slate-50">
      {/* Breadcrumb bar */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/foro" className="hover:text-sky-600 transition-colors">Foro</Link>
            <span>/</span>
            {category && (
              <Link to={`/foro/${category.slug}`} className={`hover:${color.text} transition-colors ${color.text}`}>
                {category.name}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to={category ? `/foro/${category.slug}` : '/foro'} className="inline-flex items-center gap-1.5 text-slate-500 hover:text-sky-600 text-sm font-medium transition-colors mb-5">
          <ChevronLeft className="w-4 h-4" /> Volver a la sala
        </Link>

        {/* Thread header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {category && (
                <Link to={`/foro/${category.slug}`} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${color.bg} ${color.text}`}>
                  <Icon className="w-3 h-3" />{category.name}
                </Link>
              )}
              {thread.is_pinned && <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600"><Pin className="w-3 h-3" /> Fijada</span>}
              {thread.is_featured && <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600"><Sparkles className="w-3 h-3" /> Destacada</span>}
              {thread.is_closed && <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500"><Lock className="w-3 h-3" /> Cerrada</span>}
            </div>

            <h1 className="font-display font-bold text-blue-950 text-2xl sm:text-3xl leading-tight mb-4">
              {thread.title}
            </h1>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {thread.author_name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-950">{thread.author_name}</p>
                  <p className="text-xs text-slate-400">{timeAgo(thread.created_at)} · {thread.view_count} vistas</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReact('thread', thread.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    hasThreadReaction
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-slate-100 text-slate-500 hover:bg-sky-50 hover:text-sky-600'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${hasThreadReaction ? 'fill-sky-600' : ''}`} />
                  {thread.reaction_count}
                </button>
                {user && (
                  <button
                    onClick={() => { setReportTarget({ type: 'thread', id: thread.id }); setReportDone(false); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" /> Reportar
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={handleDeleteThread}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Thread body */}
          <div className="px-6 pb-6 border-t border-slate-50 pt-5">
            <p className="text-slate-700 text-[15px] leading-relaxed whitespace-pre-wrap">{thread.body}</p>
          </div>

          {/* Pending-review banner — visible to author and admins */}
          {thread.moderation_status === 'pending' && (isOwner || isAdmin) && (
            <div className="px-6 py-3 border-t border-amber-200 bg-amber-50">
              <div className="flex items-center gap-2 text-amber-800 text-xs">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">
                  {isOwner
                    ? 'Tu discusión está en revisión. Un moderador la aprobará pronto. Mientras tanto, no es visible para otras personas.'
                    : 'Esta discusión está pendiente de aprobación.'}
                </span>
              </div>
            </div>
          )}

          {/* Moderator controls */}
          {isAdmin && (
            <div className="px-6 py-3 border-t border-slate-100 bg-sky-50/50">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 mr-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Moderación
                </span>
                <button
                  onClick={() => handleModerateThread('is_pinned', !thread.is_pinned)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${thread.is_pinned ? 'bg-amber-100 text-amber-700' : 'bg-white text-slate-500 hover:bg-amber-50 hover:text-amber-600 border border-slate-200'}`}
                >
                  <Pin className="w-3 h-3" /> {thread.is_pinned ? 'Fijada' : 'Fijar'}
                </button>
                <button
                  onClick={() => handleModerateThread('is_featured', !thread.is_featured)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${thread.is_featured ? 'bg-sky-100 text-sky-700' : 'bg-white text-slate-500 hover:bg-sky-50 hover:text-sky-600 border border-slate-200'}`}
                >
                  <Sparkles className="w-3 h-3" /> {thread.is_featured ? 'Destacada' : 'Destacar'}
                </button>
                <button
                  onClick={() => handleModerateThread('is_closed', !thread.is_closed)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${thread.is_closed ? 'bg-red-100 text-red-600' : 'bg-white text-slate-500 hover:bg-red-50 hover:text-red-500 border border-slate-200'}`}
                >
                  <Lock className="w-3 h-3" /> {thread.is_closed ? 'Cerrada' : 'Cerrar'}
                </button>
                <button
                  onClick={() => handleModerateThread('is_hidden', !thread.is_hidden)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${thread.is_hidden ? 'bg-slate-200 text-slate-700' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
                >
                  <HideIcon className="w-3 h-3" /> {thread.is_hidden ? 'Oculta' : 'Ocultar'}
                </button>
                <button
                  onClick={handleAdminDeleteThread}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-red-500 hover:bg-red-50 border border-red-200 transition-colors ml-auto"
                >
                  <Trash2 className="w-3 h-3" /> Eliminar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Posts header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-blue-950 text-lg flex items-center gap-2">
            <Reply className="w-5 h-5 text-sky-600" />
            {thread.reply_count} {thread.reply_count === 1 ? 'respuesta' : 'respuestas'}
          </h2>
          <button onClick={() => setRulesOpen(true)} className="text-slate-400 hover:text-sky-600 text-xs font-medium transition-colors">
            Reglas
          </button>
        </div>

        {/* Posts list */}
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center mb-6">
            <Reply className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Sé la primera persona en responder.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {posts.map((post) => {
              const hasReacted = myReactions.has(`post:${post.id}`);
              const isPostOwner = user?.id === post.author_id;
              return (
                <div key={post.id} className={`bg-white rounded-2xl border p-5 ${post.is_hidden ? 'border-red-100 bg-red-50/30' : 'border-slate-100 shadow-card'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {post.author_name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-blue-950">{post.author_name}</span>
                        <span className="text-xs text-slate-400">{timeAgo(post.created_at)}</span>
                      </div>
                    </div>
                    {post.is_hidden && (
                      <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                        <EyeOff className="w-3 h-3" /> Oculto
                      </span>
                    )}
                  </div>

                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap mb-4">{post.body}</p>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                    <button
                      onClick={() => handleReact('post', post.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        hasReacted ? 'bg-sky-100 text-sky-700' : 'text-slate-400 hover:bg-sky-50 hover:text-sky-600'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasReacted ? 'fill-sky-600' : ''}`} />
                      {post.reaction_count}
                    </button>
                    {user && !post.is_hidden && (
                      <button
                        onClick={() => { setReportTarget({ type: 'post', id: post.id }); setReportDone(false); }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Flag className="w-3 h-3" /> Reportar
                      </button>
                    )}
                    {isPostOwner && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-auto"
                      >
                        <Trash2 className="w-3 h-3" /> Eliminar
                      </button>
                    )}
                  </div>

                  {/* Post moderation controls */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-sky-100 bg-sky-50/40 -mx-5 -mb-5 px-5 py-2 rounded-b-2xl">
                      <span className="text-xs font-bold text-sky-700 inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                      </span>
                      <button
                        onClick={() => handleModeratePost(post.id, 'is_hidden', !post.is_hidden)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-white text-slate-500 hover:bg-slate-100 border border-slate-200 transition-colors"
                      >
                        <HideIcon className="w-3 h-3" /> {post.is_hidden ? 'Mostrar' : 'Ocultar'}
                      </button>
                      <button
                        onClick={() => handleAdminDeletePost(post.id)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-white text-red-500 hover:bg-red-50 border border-red-200 transition-colors ml-auto"
                      >
                        <Trash2 className="w-3 h-3" /> Eliminar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Reply box */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
          {thread.is_closed ? (
            <div className="flex items-center gap-3 text-slate-400 text-sm py-4">
              <Lock className="w-5 h-5 text-red-400" />
              Esta discusión está cerrada. No se aceptan nuevas respuestas.
            </div>
          ) : !user ? (
            <div className="text-center py-6">
              <p className="text-slate-500 text-sm mb-3">Inicia sesión para participar en la discusión.</p>
              <button onClick={() => setAuthOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-xl hover:bg-sky-500 transition-colors">
                Iniciar sesión / Registrarse
              </button>
            </div>
          ) : user && !conductAccepted ? (
            <div className="text-center py-6">
              <ShieldCheck className="w-7 h-7 text-sky-500 mx-auto mb-2" />
              <p className="text-slate-700 text-sm font-semibold mb-1">
                Acepta los lineamientos para participar
              </p>
              <p className="text-slate-400 text-xs mb-4 max-w-sm mx-auto">
                Para publicar en el foro debes aceptar los Lineamientos de Respeto y Convivencia.
              </p>
              <button
                onClick={() => setConductOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white text-sm font-semibold rounded-xl hover:bg-sky-500 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" /> Ver y aceptar lineamientos
              </button>
            </div>
          ) : (
            <form onSubmit={handleReply}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {getDisplayName()[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    rows={3}
                    maxLength={3000}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-colors resize-none"
                  />
                  {error && (
                    <p className="flex items-center gap-1.5 text-red-500 text-xs mt-2">
                      <AlertCircle className="w-3.5 h-3.5" />{error}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-slate-400">{replyBody.length}/3000</p>
                    <button
                      type="submit"
                      disabled={submitting || !replyBody.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-xl hover:bg-sky-500 disabled:bg-slate-300 transition-colors"
                    >
                      {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Responder</>}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Report modal */}
      {reportTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setReportTarget(null)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                </div>
                <h2 className="font-bold text-blue-950 text-base">Reportar contenido</h2>
              </div>
              <button onClick={() => setReportTarget(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleReport} className="p-6 space-y-4">
              {reportDone ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <ThumbsUp className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-blue-950 font-semibold">Reporte enviado</p>
                  <p className="text-slate-400 text-sm mt-1">El equipo de moderación lo revisará.</p>
                </div>
              ) : (
                <>
                  <p className="text-slate-500 text-sm">
                    Cuéntanos por qué este contenido es inapropiado. Un moderador lo revisará.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría del reporte</label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {REPORT_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setReportCategory(cat as ForumReportReasonCategory)}
                          className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                            reportCategory === cat
                              ? 'bg-sky-50 border-sky-300 text-sky-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-sky-200'
                          }`}
                        >
                          {REPORT_CATEGORY_LABELS[cat]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Detalles {reportCategory === 'otro' && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder={reportCategory === 'otro' ? 'Describe el problema...' : 'Opcional: agrega más detalles'}
                      rows={3}
                      required={reportCategory === 'otro'}
                      maxLength={500}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30 transition-colors resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <button type="button" onClick={() => setReportTarget(null)} className="px-4 py-2 text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={reportSubmitting} className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-500 disabled:bg-slate-300 transition-colors">
                      {reportSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Enviar reporte'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      <ForumAuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => recheckConduct()} />
      <ForumConductModal
        open={conductOpen}
        onClose={() => setConductOpen(false)}
        onAccepted={() => recheckConduct()}
      />
      <ForumRulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}
