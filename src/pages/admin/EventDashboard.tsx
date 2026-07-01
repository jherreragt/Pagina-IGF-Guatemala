import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Globe, FileText, Download, ArrowRight, ClipboardList } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function EventDashboard() {
  const [stats, setStats] = useState({ sessions: 0, speakers: 0, allies: 0, resources: 0, registrations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, sp, al, re, reg] = await Promise.all([
        supabase.from('event_sessions').select('*', { count: 'exact', head: true }),
        supabase.from('event_speakers').select('*', { count: 'exact', head: true }),
        supabase.from('event_allies').select('*', { count: 'exact', head: true }),
        supabase.from('event_resources').select('*', { count: 'exact', head: true }),
        supabase.from('event_registrations').select('*', { count: 'exact', head: true }),
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
  }, []);

  const cards = [
    { label: 'Sesiones de agenda', value: stats.sessions, icon: Calendar, href: '/admin/event/sessions', color: 'sky' },
    { label: 'Ponentes y moderadores', value: stats.speakers, icon: Users, href: '/admin/event/speakers', color: 'blue' },
    { label: 'Aliados y apoyos', value: stats.allies, icon: Globe, href: '/admin/event/allies', color: 'cyan' },
    { label: 'Recursos del evento', value: stats.resources, icon: FileText, href: '/admin/event/resources', color: 'sky' },
    { label: 'Registros de participantes', value: stats.registrations, icon: ClipboardList, href: '/admin/event/registrations', color: 'green' },
  ];

  const quickLinks = [
    { label: 'Gestionar agenda', desc: 'Sesiones, horarios y salas', href: '/admin/event/sessions', icon: Calendar },
    { label: 'Gestionar ponentes', desc: 'Ponentes, moderadores y relatores', href: '/admin/event/speakers', icon: Users },
    { label: 'Gestionar aliados', desc: 'Aliados nacionales e internacionales', href: '/admin/event/allies', icon: Globe },
    { label: 'Gestionar recursos', desc: 'Documentos y materiales del evento', href: '/admin/event/resources', icon: Download },
    { label: 'Ver registros', desc: 'Participantes registrados', href: '/admin/event/registrations', icon: ClipboardList },
    { label: 'Información del evento', desc: 'Fecha, lugar, lema (Configuración)', href: '/admin/settings', icon: FileText },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Evento Anual</h1>
        <p className="text-slate-400 text-sm mt-1">Administra todos los contenidos de la página del evento anual IGF Guatemala.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            to={href}
            className="bg-slate-800/50 border border-white/10 rounded-2xl p-5 hover:border-sky-500/40 hover:bg-slate-800 transition-all group"
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
