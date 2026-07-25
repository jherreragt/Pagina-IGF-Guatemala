import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare, ThumbsUp, Reply, Flag, Users, Layers,
  ArrowRight, AlertTriangle, CheckCircle2, FolderTree, ShieldCheck, Clock,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
  threads: number;
  posts: number;
  reports: number;
  openReports: number;
  categories: number;
  admins: number;
}

export default function ForumDashboard() {
  const [stats, setStats] = useState<Stats>({ threads: 0, posts: 0, reports: 0, openReports: 0, categories: 0, admins: 0 });
  const [recentReports, setRecentReports] = useState<{ id: string; reason: string; target_type: string; status: string; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [t, p, r, c, a] = await Promise.all([
        supabase.from('forum_threads').select('*', { count: 'exact', head: true }),
        supabase.from('forum_posts').select('*', { count: 'exact', head: true }),
        supabase.from('forum_reports').select('*', { count: 'exact', head: true }),
        supabase.from('forum_categories').select('*', { count: 'exact', head: true }),
        supabase.from('forum_admins').select('*', { count: 'exact', head: true }),
      ]);

      const openReports = await supabase.from('forum_reports').select('*', { count: 'exact', head: true }).eq('status', 'open');

      setStats({
        threads: t.count ?? 0,
        posts: p.count ?? 0,
        reports: r.count ?? 0,
        openReports: openReports.count ?? 0,
        categories: c.count ?? 0,
        admins: a.count ?? 0,
      });

      const { data: reports } = await supabase
        .from('forum_reports')
        .select('id, reason, target_type, status, created_at')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentReports(reports ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: 'Discusiones', value: stats.threads, icon: MessageSquare, color: 'sky' },
    { label: 'Respuestas', value: stats.posts, icon: Reply, color: 'blue' },
    { label: 'Reportes abiertos', value: stats.openReports, icon: Flag, color: 'red' },
    { label: 'Categorías', value: stats.categories, icon: Layers, color: 'green' },
  ];

  const links = [
    { label: 'Gestionar categorías', href: '/admin/forum/categorias', icon: FolderTree, desc: 'Crear, editar o cerrar salas temáticas' },
    { label: 'Moderar discusiones', href: '/admin/forum/discusiones', icon: MessageSquare, desc: 'Cerrar, destacar o eliminar discusiones' },
    { label: 'Revisar reportes', href: '/admin/forum/reportes', icon: Flag, desc: 'Gestionar contenido reportado' },
    { label: 'Reglas de participación', href: '/admin/forum/reglas', icon: ShieldCheck, desc: 'Editar las normas del foro' },
    { label: 'Gestionar usuarios', href: '/admin/forum/usuarios', icon: Users, desc: 'Administrar moderadores y usuarios' },
    { label: 'Cola de moderación', href: '/admin/forum/cola', icon: Clock, desc: 'Aprobar o rechazar primeros aportes' },
    { label: 'Lineamientos de convivencia', href: '/admin/forum/lineamientos', icon: ShieldCheck, desc: 'Editar el código de conducta del foro' },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Foro de Diálogo</h1>
        <p className="text-slate-500 text-sm mt-1">Panel de moderación y gestión del foro multiactor.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className={`w-9 h-9 rounded-xl bg-${color}-500/15 flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 text-${color}-400`} />
            </div>
            <div className="text-2xl font-black text-slate-900">{loading ? '—' : value}</div>
            <div className="text-slate-500 text-xs mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Open reports alert */}
      {stats.openReports > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-slate-900 font-semibold text-sm">{stats.openReports} {stats.openReports === 1 ? 'reporte sin revisar' : 'reportes sin revisar'}</p>
            <p className="text-slate-500 text-xs mt-0.5">Hay contenido reportado que requiere atención.</p>
          </div>
          <Link to="/admin/forum/reportes" className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors">
            Revisar <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Management links */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Gestión del foro</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map(({ label, href, icon: Icon, desc }) => (
            <Link
              key={href}
              to={href}
              className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-sky-500/40 hover:bg-white transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <p className="text-slate-900 font-medium text-sm">{label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent reports */}
      {recentReports.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Reportes recientes</h2>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="divide-y divide-slate-100">
              {recentReports.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Flag className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-slate-900 text-sm truncate">{r.reason}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{r.target_type} · {new Date(r.created_at).toLocaleDateString('es-GT')}</p>
                    </div>
                  </div>
                  <Link to="/admin/forum/reportes" className="text-sky-400 text-sm hover:text-sky-700 transition-colors flex items-center gap-1 flex-shrink-0 ml-4">
                    Revisar <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
