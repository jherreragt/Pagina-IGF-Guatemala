import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare, Users, ThumbsUp, Reply, Pin, Flame, ArrowRight, ShieldCheck,
  TrendingUp, Clock, ChevronRight,
} from 'lucide-react';
import PageHero from '../components/PageHero';
import ForumRulesModal from '../components/forum/ForumRulesModal';
import { supabase, ForumCategory, ForumThread } from '../lib/supabase';
import { getForumIcon, getForumColor, timeAgo } from '../lib/forum-helpers';

export default function Forum() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [recentThreads, setRecentThreads] = useState<ForumThread[]>([]);
  const [topThreads, setTopThreads] = useState<ForumThread[]>([]);
  const [catMap, setCatMap] = useState<Record<string, ForumCategory>>({});
  const [loading, setLoading] = useState(true);
  const [rulesOpen, setRulesOpen] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: cats } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      const catList = (cats as ForumCategory[]) ?? [];
      setCategories(catList);
      const map: Record<string, ForumCategory> = {};
      catList.forEach((c) => (map[c.id] = c));
      setCatMap(map);

      const { data: recent } = await supabase
        .from('forum_threads')
        .select('*')
        .order('last_activity_at', { ascending: false })
        .limit(6);
      setRecentThreads((recent as ForumThread[]) ?? []);

      const { data: top } = await supabase
        .from('forum_threads')
        .select('*')
        .order('reaction_count', { ascending: false })
        .limit(4);
      setTopThreads((top as ForumThread[]) ?? []);

      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="pt-16 sm:pt-24">
      <PageHero
        icon={<MessageSquare className="w-7 h-7" />}
        eyebrow="Participación"
        title="Foro de"
        titleAccent="Diálogo Multiactor"
        subtitle="Un espacio abierto, seguro y moderado para intercambiar ideas, plantear preguntas y construir propuestas sobre el futuro de Internet en Guatemala."
      />

      {/* Quick stats bar */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-950">{categories.length}</div>
            <div className="text-slate-400 text-xs font-medium mt-1">Salas temáticas</div>
          </div>
          <div className="text-center border-x border-slate-100">
            <div className="text-2xl font-bold text-blue-950">{recentThreads.length}</div>
            <div className="text-slate-400 text-xs font-medium mt-1">Discusiones recientes</div>
          </div>
          <div className="text-center">
            <button onClick={() => setRulesOpen(true)} className="inline-flex flex-col items-center group">
              <ShieldCheck className="w-6 h-6 text-sky-600 mb-1 group-hover:text-sky-700 transition-colors" />
              <span className="text-sky-600 text-xs font-semibold group-hover:text-sky-700 transition-colors">Ver reglas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories grid */}
      <section className="py-16 bg-slate-50 bg-grid-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="section-label">
                <span className="w-5 h-px bg-sky-500" />
                Salas temáticas
              </p>
              <h2 className="section-title text-3xl">Explora por temática</h2>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-36 rounded-2xl bg-white border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const Icon = getForumIcon(cat.icon_name);
                const color = getForumColor(cat.color);
                return (
                  <Link
                    key={cat.id}
                    to={`/foro/${cat.slug}`}
                    className="card group p-6 hover:-translate-y-1 flex flex-col"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div className={`w-11 h-11 rounded-xl ${color.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-5 h-5 ${color.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-blue-950 text-[15px] leading-snug group-hover:text-sky-700 transition-colors">
                          {cat.name}
                        </h3>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed flex-1 line-clamp-2 mb-4">
                      {cat.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">
                        {cat.thread_count} {cat.thread_count === 1 ? 'discusión' : 'discusiones'}
                      </span>
                      <span className={`inline-flex items-center gap-1 ${color.text} font-semibold group-hover:gap-2 transition-all`}>
                        Entrar <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Two-column: recent + trending */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent discussions */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-sky-600" />
              <h2 className="section-title text-2xl">Discusiones recientes</h2>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-slate-50 animate-pulse" />
                ))}
              </div>
            ) : recentThreads.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-10 text-center">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Aún no hay discusiones. ¡Sé la primera persona en participar!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentThreads.map((thread) => {
                  const cat = catMap[thread.category_id];
                  return (
                    <Link
                      key={thread.id}
                      to={`/foro/t/${thread.id}`}
                      className="block rounded-xl border border-slate-100 hover:border-sky-200 hover:shadow-card transition-all p-4 group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            {cat && (
                              <span className={`text-xs font-semibold ${getForumColor(cat.color).text}`}>
                                {cat.name}
                              </span>
                            )}
                            {thread.is_pinned && <Pin className="w-3 h-3 text-amber-500" />}
                            {thread.is_closed && (
                              <span className="text-xs text-red-500 font-medium">Cerrado</span>
                            )}
                          </div>
                          <h3 className="font-semibold text-blue-950 text-sm group-hover:text-sky-700 transition-colors line-clamp-1">
                            {thread.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span>{thread.author_name}</span>
                            <span className="flex items-center gap-1"><Reply className="w-3 h-3" />{thread.reply_count}</span>
                            <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{thread.reaction_count}</span>
                            <span>{timeAgo(thread.last_activity_at)}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Trending sidebar */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="section-title text-2xl">Más apoyadas</h2>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-50 animate-pulse" />
                ))}
              </div>
            ) : topThreads.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center">
                <TrendingUp className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-xs">Aún no hay discusiones destacadas.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {topThreads.map((thread, i) => {
                  const cat = catMap[thread.category_id];
                  return (
                    <Link
                      key={thread.id}
                      to={`/foro/t/${thread.id}`}
                      className="block rounded-xl border border-slate-100 hover:border-sky-200 hover:shadow-card transition-all p-3.5 group"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg font-black text-slate-200 group-hover:text-sky-200 transition-colors leading-none mt-0.5">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-blue-950 text-sm group-hover:text-sky-700 transition-colors line-clamp-2 leading-snug">
                            {thread.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                            <span className="flex items-center gap-1 text-orange-500 font-semibold">
                              <ThumbsUp className="w-3 h-3" />{thread.reaction_count}
                            </span>
                            {cat && <span className="truncate">{cat.name}</span>}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #16293f 0%, #1d3a5d 50%, #274f7e 100%)' }}>
        <div className="absolute inset-0 bg-grid" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users className="w-10 h-10 text-white mx-auto mb-4" />
          <h2 className="font-display font-bold text-white text-3xl sm:text-4xl mb-4">
            Tu voz importa en la gobernanza de Internet
          </h2>
          <p className="text-sky-100/90 text-[15px] mb-7 max-w-xl mx-auto leading-relaxed">
            Crea una cuenta para publicar, responder y apoyar ideas. La participación es abierta, gratuita y multiactor.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/foro/brecha-digital" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-sky-700 font-bold rounded-xl hover:bg-sky-50 transition-all hover:scale-[1.02] shadow-lg">
              Explorar foros <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={() => setRulesOpen(true)} className="btn-outline text-base px-7 py-3">
              Ver reglas de participación
            </button>
          </div>
        </div>
      </section>

      <ForumRulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}
