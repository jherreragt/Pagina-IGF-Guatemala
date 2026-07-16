import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Settings, Edit2,
  CheckCircle2, Circle, ArrowRight, MessageSquare,
  Youtube, Mail, Calendar, Users, AlertCircle
} from 'lucide-react';
import { supabase, BlogPost, ContactSubmission } from '../../lib/supabase';

type Stats = {
  blogTotal: number;
  blogPublished: number;
  blogDrafts: number;
  videos: number;
  newMessages: number;
  registrations: number;
  speakers: number;
  threads: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    blogTotal: 0, blogPublished: 0, blogDrafts: 0,
    videos: 0, newMessages: 0, registrations: 0, speakers: 0, threads: 0,
  });
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [recentMessages, setRecentMessages] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [
        { count: blogTotal },
        { count: blogPublished },
        { data: recentBlogs },
        { count: videos },
        { data: messages },
        { count: registrations },
        { count: speakers },
        { count: threads },
      ] = await Promise.all([
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('published', true),
        supabase.from('blog_posts').select('id, title, slug, published, created_at, category, author').order('created_at', { ascending: false }).limit(5),
        supabase.from('youtube_videos').select('*', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('event_registrations').select('*', { count: 'exact', head: true }),
        supabase.from('event_speakers').select('*', { count: 'exact', head: true }),
        supabase.from('forum_threads').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        blogTotal: blogTotal ?? 0,
        blogPublished: blogPublished ?? 0,
        blogDrafts: (blogTotal ?? 0) - (blogPublished ?? 0),
        videos: videos ?? 0,
        newMessages: (messages as ContactSubmission[] | null)?.filter((m) => m.status === 'new').length ?? 0,
        registrations: registrations ?? 0,
        speakers: speakers ?? 0,
        threads: threads ?? 0,
      });
      if (recentBlogs) setRecentPosts(recentBlogs as BlogPost[]);
      if (messages) setRecentMessages(messages as ContactSubmission[]);
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { label: 'Artículos', value: stats.blogTotal, sub: `${stats.blogPublished} publicados`, icon: FileText, iconClass: 'bg-sky-500/15 text-sky-400', href: '/admin/blog' },
    { label: 'Videos YouTube', value: stats.videos, sub: 'en la home', icon: Youtube, iconClass: 'bg-red-500/15 text-red-400', href: '/admin/videos' },
    { label: 'Mensajes nuevos', value: stats.newMessages, sub: 'sin leer', icon: Mail, iconClass: 'bg-amber-500/15 text-amber-400', href: '/admin/mensajes' },
    { label: 'Registros', value: stats.registrations, sub: 'al evento', icon: Calendar, iconClass: 'bg-green-500/15 text-green-400', href: '/admin/event/registrations' },
    { label: 'Ponentes', value: stats.speakers, sub: 'registrados', icon: Users, iconClass: 'bg-sky-500/15 text-sky-400', href: '/admin/event/speakers' },
    { label: 'Hilos foro', value: stats.threads, sub: 'activos', icon: MessageSquare, iconClass: 'bg-sky-500/15 text-sky-400', href: '/admin/forum' },
  ];

  const quick = [
    { label: 'Nuevo artículo', href: '/admin/blog/new', icon: FileText, desc: 'Crear un post para el blog' },
    { label: 'Agregar video', href: '/admin/videos', icon: Youtube, desc: 'Subir un webinar o video' },
    { label: 'Ver mensajes', href: '/admin/mensajes', icon: Mail, desc: 'Revisar contacto del sitio' },
    { label: 'Configuración', href: '/admin/settings', icon: Settings, desc: 'Editar textos y secciones' },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Panel de administración del IGF Guatemala.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, iconClass, href }) => (
          <Link
            key={label}
            to={href}
            className="bg-slate-800/50 border border-white/10 rounded-2xl p-5 hover:border-sky-500/40 hover:bg-slate-800 transition-all group"
          >
            <div className={`w-9 h-9 rounded-lg ${iconClass} flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-white mb-0.5">
              {loading ? '—' : value}
            </div>
            <div className="text-slate-400 text-xs">{label}</div>
            <div className="text-slate-500 text-xs mt-0.5">{sub}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quick.map(({ label, href, icon: Icon, desc }) => (
            <Link
              key={label}
              to={href}
              className="flex items-start gap-4 p-5 bg-slate-800/50 border border-white/10 rounded-xl hover:border-sky-500/40 hover:bg-slate-800 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent posts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Artículos recientes</h2>
            <Link to="/admin/blog" className="text-sky-400 text-sm hover:text-sky-300 transition-colors flex items-center gap-1">
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Cargando...</div>
            ) : recentPosts.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Aún no hay artículos.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {post.published
                        ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        : <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      }
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{post.title}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{post.category}</p>
                      </div>
                    </div>
                    <Link to={`/admin/blog/edit/${post.id}`} className="text-slate-400 hover:text-sky-400 transition-colors flex-shrink-0 ml-3">
                      <Edit2 className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent messages */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Mensajes recientes</h2>
            <Link to="/admin/mensajes" className="text-sky-400 text-sm hover:text-sky-300 transition-colors flex items-center gap-1">
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-500 text-sm">Cargando...</div>
            ) : recentMessages.length === 0 ? (
              <div className="p-8 text-center">
                <Mail className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Sin mensajes nuevos.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentMessages.map((msg) => (
                  <Link
                    key={msg.id}
                    to="/admin/mensajes"
                    className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {msg.status === 'new'
                        ? <AlertCircle className="w-4 h-4 text-sky-400 flex-shrink-0" />
                        : <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      }
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{msg.name}</p>
                        <p className="text-slate-500 text-xs mt-0.5 truncate">{msg.subject}</p>
                      </div>
                    </div>
                    <span className="text-slate-500 text-xs flex-shrink-0 ml-3">
                      {new Date(msg.created_at).toLocaleDateString('es-GT')}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
