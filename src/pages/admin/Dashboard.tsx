import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Settings, Globe, Eye, PenLine, Edit2,
  CheckCircle2, Circle, ArrowRight
} from 'lucide-react';
import { supabase, BlogPost } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, slug, published, created_at, category, author')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setRecentPosts(data as BlogPost[]);
        const total = data.length;
        const published = data.filter((p) => p.published).length;
        setStats({ total, published, drafts: total - published });
      }

      // Get actual totals
      const { count: totalCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });
      const { count: pubCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

      setStats({
        total: totalCount ?? 0,
        published: pubCount ?? 0,
        drafts: (totalCount ?? 0) - (pubCount ?? 0),
      });
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: 'Total de artículos', value: stats.total, icon: FileText, color: 'emerald' },
    { label: 'Publicados', value: stats.published, icon: Globe, color: 'green' },
    { label: 'Borradores', value: stats.drafts, icon: PenLine, color: 'amber' },
  ];

  const quick = [
    { label: 'Nuevo artículo', href: '/admin/blog/new', icon: FileText, desc: 'Crear un post para el blog' },
    { label: 'Configuración del sitio', href: '/admin/settings', icon: Settings, desc: 'Editar textos y secciones' },
    { label: 'Ver blog público', href: '/blog', icon: Eye, desc: 'Previsualizar el blog', external: true },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Bienvenido al panel de administración del IGF Guatemala.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-800/50 border border-white/10 rounded-2xl p-6">
            <div className={`w-10 h-10 rounded-xl bg-${color}-500/15 flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 text-${color}-400`} />
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {loading ? '—' : value}
            </div>
            <div className="text-slate-400 text-sm">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quick.map(({ label, href, icon: Icon, desc, external }) => (
            external ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-5 bg-slate-800/50 border border-white/10 rounded-xl hover:border-emerald-500/40 hover:bg-slate-800 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                </div>
              </a>
            ) : (
              <Link
                key={label}
                to={href}
                className="flex items-start gap-4 p-5 bg-slate-800/50 border border-white/10 rounded-xl hover:border-emerald-500/40 hover:bg-slate-800 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                </div>
              </Link>
            )
          ))}
        </div>
      </div>

      {/* Recent posts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Artículos recientes</h2>
          <Link to="/admin/blog" className="text-emerald-400 text-sm hover:text-emerald-300 transition-colors flex items-center gap-1">
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Cargando...</div>
          ) : recentPosts.length === 0 ? (
            <div className="p-10 text-center">
              <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">Aún no hay artículos. ¡Crea el primero!</p>
              <Link to="/admin/blog/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-500 transition-colors">
                Crear artículo
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {post.published
                      ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      : <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    }
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{post.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{post.category} · {new Date(post.created_at).toLocaleDateString('es-GT')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${post.published ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {post.published ? 'Publicado' : 'Borrador'}
                    </span>
                    <Link to={`/admin/blog/edit/${post.id}`} className="text-slate-400 hover:text-emerald-400 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
