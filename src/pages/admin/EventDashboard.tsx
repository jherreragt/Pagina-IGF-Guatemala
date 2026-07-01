import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Globe, FileText, Download, ArrowRight, ClipboardList, Layers } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useActiveEdition } from '../../hooks/useActiveEdition';

export default function EventDashboard() {
  const { edition, loading: editionLoading } = useActiveEdition();
  const [stats, setStats] = useState({ sessions: 0, speakers: 0, allies: 0, resources: 0, registrations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (editionLoading) return;
    async function load() {
      const addFilter = (q: any) => edition ? q.eq('edition_id', edition.id) : q;
      const [s, sp, al, re, reg] = await Promise.all([
        addFilter(supabase.from('event_sessions').select('*', { count: 'exact', head: true })),
        addFilter(supabase.from('event_speakers').select('*', { count: 'exact', head: true })),
        addFilter(supabase.from('event_allies').select('*', { count: 'exact', head: true })),
        addFilter(supabase.from('event_resources').select('*', { count: 'exact', head: true })),
        addFilter(supabase.from('event_registrations').select('*', { count: 'exact', head: true })),
      ]);
      setStats({
        sessions: s.count ?? 0,
        speakers: sp.count ?? 0,
        allies: al.count ?? 0,
        resources: re.count ?? 0,
        registrations: reg.count ?? 0,
      });
      setLoading(false);
    }
    load();
  }, [edition?.id, editionLoading]);

  const cards = [
    { label: 'Sesiones de agenda', value: stats.sessions, icon: Calendar, href: '/admin/event/sessions', color: 'sky' },
    { label: 'Ponentes y moderadores', value: stats.speakers, icon: Users, href: '/admin/event/speakers', color: 'blue' },
    { label: 'Aliados y apoyos', value: stats.allies, icon: Globe, href: '/admin/event/allies', color: 'cyan' },
    { label: 'Recursos del evento', value: stats.resources, icon: FileText, href: '/admin/event/resources', color: 'sky' },
    { label: 'Registros de participantes', value: stats.registrations, icon: ClipboardList, href: '/admin/event/registrations', color: 'green' },
  ];

  const quickLinks = [
    { label: 'Gestionar ediciones', desc: 'Crear nueva edición o cambiar el año activo', href: '/admin/event/editions', icon: Layers },
    { label: 'Gestionar agenda', desc: 'Sesiones, horarios y salas', href: '/admin/event/sessions', icon: Calendar },
    { label: 'Gestionar ponentes', desc: 'Ponentes, moderadores y relatores', href: '/admin/event/speakers', icon: Users },
    { label: 'Gestionar aliados', desc: 'Aliados nacionales e internacionales', href: '/admin/event/allies', icon: Globe },
    { label: 'Gestionar recursos', desc: 'Documentos y materiales del evento', href: '/admin/event/resources', icon: Download },
    { label: 'Ver registros', desc: 'Participantes registrados', href: '/admin/event/registrations', icon: ClipboardList },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Evento Anual</h1>
        <p className="text-slate-400 text-sm mt-1">Administra los contenidos del evento anual IGF Guatemala.</p>
      </div>

      {!editionLoading && (
        <div className={`rounded-2xl p-5 border ${edition ? 'bg-sky-500/5 border-sky-500/30' : 'bg-amber-500/5 border-amber-500/30'}`}>
          {edition ? (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <span className="text-sky-400 text-xs font-semibold uppercase tracking-wider">Edición activa</span>
                </div>
                <p className="text-white font-bold text-lg">{edition.title}</p>
                {edition.event_date && (
                  <p className="text-slate-400 text-sm">{edition.event_date} · {edition.event_location}</p>
                )}
                {edition.lema && (
                  <p className="text-slate-500 text-xs italic mt-1">"{edition.lema}"</p>
                )}
              </div>
              <Link
                to="/admin/event/editions"
                className="flex items-center gap-1.5 px-4 py-2 bg-sky-600/20 hover:bg-sky-600 border border-sky-500/30 hover:border-transparent text-sky-300 hover:text-white text-sm font-semibold rounded-xl transition-all flex-shrink-0"
              >
                <Layers className="w-4 h-4" /> Cambiar edición
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-amber-300 text-sm font-medium">
                No hay ninguna edición activa. El sitio público muestra todos los contenidos sin filtrar.
              </p>
              <Link
                to="/admin/event/editions"
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/20 hover:bg-amber-500 border border-amber-500/30 text-amber-300 hover:text-white text-sm font-semibold rounded-xl transition-all flex-shrink-0"
              >
                <Layers className="w-4 h-4" /> Gestionar ediciones
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            to={href}
            className="bg-slate-800/50 border border-white/10 rounded-2xl p-5 hover:border-sky-500/40 hover:bg-slate-800 transition-all"
          >
            <div className={`w-9 h-9 rounded-xl bg-${color}-500/15 flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 text-${color}-400`} />
            </div>
            <div className="text-2xl font-black text-white mb-1">
              {loading ? '—' : value}
            </div>
            <div className="text-slate-500 text-xs leading-snug">{label}</div>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map(({ label, desc, href, icon: Icon }) => (
            <Link
              key={label}
              to={href}
              className="flex items-start gap-4 p-5 bg-slate-800/50 border border-white/10 rounded-xl hover:border-sky-500/40 hover:bg-slate-800 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 ml-auto self-center flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
