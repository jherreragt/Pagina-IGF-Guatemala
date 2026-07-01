import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, MapPin, Monitor, Users, ChevronRight, ArrowRight,
  Lightbulb, ShieldCheck, Scale, Wifi, Database, Zap, Radio, TrendingUp,
  Building2, GraduationCap, Laptop, Heart, Globe,
  FileText, Send, Check, Clock, Filter, Download, BookOpen, User
} from 'lucide-react';
import Countdown from '../components/Countdown';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { supabase, EventSession, EventSpeaker, EventAlly, EventResource, BlogPost } from '../lib/supabase';

const themes = [
  { icon: Lightbulb, title: 'Inteligencia artificial y gobernanza digital', color: 'sky' },
  { icon: ShieldCheck, title: 'Ciberseguridad, confianza e infraestructura crítica', color: 'blue' },
  { icon: Scale, title: 'Derechos digitales, democracia y libertad de expresión', color: 'cyan' },
  { icon: Wifi, title: 'Inclusión digital y acceso significativo', color: 'sky' },
  { icon: Database, title: 'Datos, interoperabilidad e infraestructura pública digital', color: 'blue' },
  { icon: Zap, title: 'Juventudes y futuro de Internet', color: 'cyan' },
  { icon: TrendingUp, title: 'Economía digital, innovación y desarrollo sostenible', color: 'sky' },
];

const stakeholders = [
  { icon: Building2, label: 'Gobierno' },
  { icon: Heart, label: 'Sociedad Civil' },
  { icon: TrendingUp, label: 'Sector Privado' },
  { icon: Laptop, label: 'Comunidad Técnica' },
  { icon: GraduationCap, label: 'Academia' },
  { icon: Zap, label: 'Juventudes' },
  { icon: Globe, label: 'Organismos Internacionales' },
  { icon: Radio, label: 'Medios' },
];

const sessionTypes = [
  'Panel', 'Taller', 'Conversatorio', 'Mesa multiactor',
  'Lightning talk', 'Demostración de proyecto', 'Sesión juvenil',
  'Presentación de investigación', 'Laboratorio de ideas',
];

const selectionCriteria = [
  'Relación con gobernanza de Internet', 'Diversidad de actores', 'Claridad del objetivo',
  'Relevancia para Guatemala', 'Inclusión de género', 'Participación juvenil',
  'Enfoque territorial', 'Calidad de la propuesta', 'Enfoque de derechos humanos',
  'Potencial para generar recomendaciones',
];

const typeColors: Record<string, string> = {
  Panel: 'bg-slate-100 text-slate-700', Plenaria: 'bg-blue-50 text-blue-800 font-medium',
  'Mesa multiactor': 'bg-green-100 text-green-700', Conversatorio: 'bg-amber-100 text-amber-700',
  'Sesión juvenil': 'bg-purple-100 text-purple-700', Logística: 'bg-slate-50 text-slate-500',
  Descanso: 'bg-slate-50 text-slate-400',
};

const registrationFields = [
  { id: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Tu nombre completo' },
  { id: 'org', label: 'Organización', type: 'text', placeholder: 'Tu organización' },
  { id: 'role', label: 'Cargo', type: 'text', placeholder: 'Tu cargo o rol' },
  { id: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'correo@ejemplo.com' },
  { id: 'phone', label: 'Teléfono', type: 'tel', placeholder: '+502 0000-0000' },
];

export default function Event() {
  const { settings } = useSiteSettings();
  const eventDate = new Date(settings.event_datetime_iso || '2026-10-15T09:00:00');

  const [sessions, setSessions] = useState<EventSession[]>([]);
  const [speakers, setSpeakers] = useState<EventSpeaker[]>([]);
  const [allies, setAllies] = useState<EventAlly[]>([]);
  const [resources, setResources] = useState<EventResource[]>([]);
  const [news, setNews] = useState<BlogPost[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);

  const [activeFilter, setActiveFilter] = useState('Todos');
  const [speakerCategory, setSpeakerCategory] = useState('Todos');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedConduct, setAcceptedConduct] = useState(false);
  const [acceptedData, setAcceptedData] = useState(false);

  useEffect(() => {
    async function loadAll() {
      const [sessRes, spkRes, allRes, reRes, newsRes] = await Promise.all([
        supabase.from('event_sessions').select('*').eq('published', true).order('sort_order').order('start_time'),
        supabase.from('event_speakers').select('*').eq('published', true).order('sort_order').order('name'),
        supabase.from('event_allies').select('*').eq('published', true).order('sort_order').order('name'),
        supabase.from('event_resources').select('*').eq('published', true).order('sort_order').order('created_at'),
        supabase.from('blog_posts').select('id,title,slug,excerpt,cover_url,category,author,published_at,created_at,tags,content,updated_at,published')
          .eq('published', true).eq('category', 'Evento Anual').order('published_at', { ascending: false }).limit(3),
      ]);
      setSessions((sessRes.data as EventSession[]) ?? []);
      setSpeakers((spkRes.data as EventSpeaker[]) ?? []);
      setAllies((allRes.data as EventAlly[]) ?? []);
      setResources((reRes.data as EventResource[]) ?? []);
      setNews((newsRes.data as BlogPost[]) ?? []);
      setLoadingContent(false);
    }
    loadAll();
  }, []);

  const filteredSessions = activeFilter === 'Todos'
    ? sessions
    : sessions.filter((s) => s.axis === activeFilter);

  const filteredSpeakers = speakerCategory === 'Todos'
    ? speakers
    : speakers.filter((s) => s.category === speakerCategory);

  const speakerCategories = ['Todos', ...Array.from(new Set(speakers.map((s) => s.category)))];
  const axisFilters = ['Todos', ...Array.from(new Set(sessions.filter((s) => s.axis).map((s) => s.axis as string)))];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptedConduct || !acceptedData) return;
    setSubmitting(true);
    await supabase.from('event_registrations').insert({
      name: formData.name ?? '',
      organization: formData.org ?? '',
      role: formData.role ?? '',
      email: formData.email ?? '',
      phone: formData.phone ?? '',
      sector: formData.sector ?? '',
      modality: formData.modality ?? '',
      accepted_conduct: acceptedConduct,
      accepted_data: acceptedData,
    });
    setSubmitting(false);
    setFormSubmitted(true);
  }

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a3a6e 0%, #1565c0 50%, #0288d1 100%)' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-sky-600/10 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/8 blur-[100px]" />
          <div className="absolute inset-0 bg-grid" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/20 mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <Calendar className="w-3 h-3 text-sky-400" />
            <span className="text-sky-300 text-xs font-semibold tracking-widest uppercase">Evento Anual · {settings.event_date}</span>
          </div>

          <h1 className="font-display font-bold text-white leading-tight mb-5">
            <span className="block text-4xl sm:text-5xl lg:text-6xl text-slate-300 font-light mb-1">IGF Guatemala</span>
            <span className="block text-6xl sm:text-7xl lg:text-8xl gradient-text">{settings.event_year}</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 font-light italic mb-6 max-w-2xl mx-auto leading-relaxed">
            "{settings.event_lema}"
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-12 text-slate-400 text-sm">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-sky-400" />{settings.event_date}</span>
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-400" />{settings.event_location}</span>
            <span className="flex items-center gap-2"><Monitor className="w-4 h-4 text-sky-400" />{settings.event_modality}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <a href="#registro" className="btn-primary text-base px-7 py-3.5">
              Registrarme <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#agenda" className="btn-outline text-base px-7 py-3.5">Ver agenda</a>
            <a href="#sesiones" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all">
              Proponer sesión
            </a>
          </div>

          <div className="border-t border-white/[0.08] pt-12">
            <p className="text-slate-500 text-xs font-semibold mb-6 uppercase tracking-widest">El evento comienza en</p>
            <Countdown targetDate={eventDate} />
          </div>
        </div>
      </section>

      {/* Acerca del evento */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-label"><span className="w-5 h-px bg-sky-500" />Acerca del evento</p>
              <h2 className="section-title text-4xl mb-6">El encuentro nacional de gobernanza de Internet</h2>
              <p className="text-slate-500 leading-relaxed mb-5 text-[15px]">
                El Evento Anual del IGF Guatemala es el principal espacio nacional de diálogo multiactor sobre gobernanza de Internet. Reúne a representantes del gobierno, sociedad civil, sector privado, comunidad técnica, academia, juventudes y organismos internacionales.
              </p>
              <p className="text-slate-500 leading-relaxed mb-8 text-[15px]">
                Cada edición busca promover una conversación abierta, inclusiva, transparente y participativa sobre el futuro de Internet en Guatemala, generando recomendaciones concretas para el país.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[{ num: '1 día', label: 'de evento' }, { num: '8+', label: 'sesiones paralelas' }, { num: '500+', label: 'participantes esperados' }].map((stat) => (
                  <div key={stat.label} className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="text-2xl font-black text-sky-600">{stat.num}</div>
                    <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img src="https://images.pexels.com/photos/2833037/pexels-photo-2833037.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Evento IGF Guatemala" className="rounded-2xl shadow-xl w-full h-80 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Quiénes participan */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-950 mb-3">¿Quiénes participan?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Un espacio multiactor donde todos los sectores tienen voz en igualdad de condiciones.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stakeholders.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-slate-100 hover:border-sky-200 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-sky-600" />
                </div>
                <span className="font-semibold text-blue-950 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ejes temáticos */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-sky-600 font-semibold text-sm uppercase tracking-wider mb-4">
              <span className="w-8 h-0.5 bg-sky-500" />Agenda temática<span className="w-8 h-0.5 bg-sky-500" />
            </div>
            <h2 className="text-4xl font-bold text-blue-950 mb-4">Ejes Temáticos {settings.event_year}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {themes.map(({ icon: Icon, title }, i) => (
              <div key={title} className="group flex items-start gap-4 p-6 bg-slate-50 hover:bg-sky-50 rounded-2xl border border-slate-100 hover:border-sky-200 transition-all hover:shadow-md">
                <div className="w-10 h-10 rounded-xl bg-sky-100 group-hover:bg-sky-200 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Icon className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-sky-400/70 mb-1 font-mono">{String(i + 1).padStart(2, '0')}</div>
                  <p className="text-slate-700 font-medium text-sm leading-relaxed">{title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Convocatoria de sesiones */}
      <section id="sesiones" className="py-24 bg-gradient-to-br from-blue-700 to-sky-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-400/15 border border-sky-400/25 mb-6">
              <FileText className="w-3.5 h-3.5 text-sky-300" />
              <span className="text-sky-200 text-xs font-medium tracking-wider uppercase">Convocatoria abierta</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Propón tu Sesión</h2>
            <p className="text-blue-200 max-w-xl mx-auto">¿Tienes un tema relevante para la gobernanza de Internet en Guatemala? Presentá tu propuesta de sesión.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
              <Clock className="w-7 h-7 text-sky-400 mb-4" />
              <h3 className="font-bold text-white text-lg mb-4">Fechas clave</h3>
              <ul className="space-y-3">
                {[
                  { label: 'Apertura de convocatoria', date: '1 de julio 2026' },
                  { label: 'Cierre de convocatoria', date: '31 de agosto 2026' },
                  { label: 'Notificación de resultados', date: '15 de septiembre 2026' },
                  { label: 'Evento', date: settings.event_date || '15 de octubre 2026' },
                ].map(({ label, date }) => (
                  <li key={label} className="flex justify-between gap-4">
                    <span className="text-blue-200 text-sm">{label}</span>
                    <span className="text-sky-300 text-sm font-medium whitespace-nowrap">{date}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
              <Send className="w-7 h-7 text-sky-400 mb-4" />
              <h3 className="font-bold text-white text-lg mb-4">Tipos de sesión</h3>
              <div className="flex flex-wrap gap-2">
                {sessionTypes.map((type) => (
                  <span key={type} className="px-3 py-1 bg-white/10 rounded-full text-sky-200 text-xs font-medium">{type}</span>
                ))}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-7">
              <Check className="w-7 h-7 text-sky-400 mb-4" />
              <h3 className="font-bold text-white text-lg mb-4">Criterios de selección</h3>
              <ul className="space-y-2">
                {selectionCriteria.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-blue-200 text-xs">
                    <div className="w-1 h-1 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />{c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="text-center mt-10">
            <a href="#registro" className="inline-flex items-center gap-2 px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg">
              Enviar propuesta de sesión <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Agenda */}
      <section id="agenda" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-sky-600 font-semibold text-sm uppercase tracking-wider mb-4">
              <span className="w-8 h-0.5 bg-sky-500" />Programa<span className="w-8 h-0.5 bg-sky-500" />
            </div>
            <h2 className="text-4xl font-bold text-blue-950 mb-4">Agenda del Evento</h2>
            <p className="text-slate-500">{settings.event_date} · {settings.event_location}</p>
          </div>

          {sessions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 items-center">
              <Filter className="w-4 h-4 text-slate-400" />
              {axisFilters.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeFilter === f ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {f === 'Todos' ? 'Todos' : f.split(' ').slice(0, 4).join(' ') + (f.split(' ').length > 4 ? '…' : '')}
                </button>
              ))}
            </div>
          )}

          {loadingContent ? (
            <div className="py-16 text-center"><div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : filteredSessions.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 rounded-2xl border border-slate-100">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">La agenda se publicará próximamente.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session) => (
                <div key={session.id}
                  className={`group flex gap-4 p-5 rounded-xl border transition-all hover:shadow-md ${
                    session.session_type === 'Descanso' || session.session_type === 'Logística'
                      ? 'bg-slate-50/60 border-slate-100 opacity-70'
                      : 'bg-white border-slate-100 hover:border-sky-200'
                  }`}>
                  <div className="flex-shrink-0 w-24 text-sky-600 font-mono text-xs font-semibold pt-0.5">
                    {session.start_time}{session.end_time ? `–${session.end_time}` : ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <h3 className="font-semibold text-blue-950 text-sm">{session.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${typeColors[session.session_type] || 'bg-slate-100 text-slate-600'}`}>
                        {session.session_type}
                      </span>
                      {session.axis && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-sky-100 text-sky-700">
                          {session.axis.split(',')[0].split(' ').slice(0, 5).join(' ')}
                        </span>
                      )}
                      {session.room && (
                        <span className="flex items-center gap-1 text-slate-400 text-xs">
                          <MapPin className="w-3 h-3" />{session.room}
                        </span>
                      )}
                    </div>
                    {session.speakers_text && (
                      <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                        <Users className="w-3 h-3" />{session.speakers_text}
                      </p>
                    )}
                    {session.description && <p className="text-slate-400 text-xs mt-1 line-clamp-2">{session.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Ponentes */}
      <section id="ponentes" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-sky-600 font-semibold text-sm uppercase tracking-wider mb-4">
              <span className="w-8 h-0.5 bg-sky-500" />Voces del evento<span className="w-8 h-0.5 bg-sky-500" />
            </div>
            <h2 className="text-4xl font-bold text-blue-950 mb-4">Ponentes y Moderadores</h2>
          </div>

          {speakerCategories.length > 1 && (
            <div className="flex gap-3 justify-center mb-10">
              {speakerCategories.map((cat) => (
                <button key={cat} onClick={() => setSpeakerCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${speakerCategory === cat ? 'bg-sky-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300'}`}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {loadingContent ? (
            <div className="py-16 text-center"><div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : filteredSpeakers.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-100">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Los ponentes se anunciarán próximamente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
              {filteredSpeakers.map((speaker) => (
                <div key={speaker.id} className="group text-center">
                  <div className="relative mb-4 mx-auto w-24 h-24">
                    {speaker.photo_url ? (
                      <img src={speaker.photo_url} alt={speaker.name}
                        className="w-24 h-24 rounded-2xl object-cover shadow-md group-hover:shadow-lg transition-shadow" />
                    ) : (
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center shadow-md">
                        <span className="text-2xl font-bold text-sky-600">
                          {speaker.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 ring-sky-400 transition-all" />
                  </div>
                  <h3 className="font-bold text-blue-950 text-sm">{speaker.name}</h3>
                  <p className="text-sky-600 text-xs font-medium mt-0.5">{speaker.role}</p>
                  <p className="text-slate-500 text-xs">{speaker.organization}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 rounded-full text-slate-500 text-xs">{speaker.sector}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Aliados */}
      {(loadingContent || allies.length > 0) && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-sky-600 font-semibold text-sm uppercase tracking-wider mb-4">
                <span className="w-8 h-0.5 bg-sky-500" />Respaldo<span className="w-8 h-0.5 bg-sky-500" />
              </div>
              <h2 className="text-3xl font-bold text-blue-950 mb-3">Aliados y Apoyos</h2>
            </div>
            {loadingContent ? (
              <div className="py-10 text-center"><div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                {allies.map((ally) => (
                  <a key={ally.id} href={ally.website_url || '#'} target={ally.website_url ? '_blank' : '_self'} rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-5 border border-slate-100 rounded-xl hover:border-sky-200 hover:shadow-md transition-all group">
                    <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden">
                      {ally.logo_url ? (
                        <img src={ally.logo_url} alt={ally.name} className="w-full h-full object-contain p-1"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <Globe className="w-6 h-6 text-sky-400" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-blue-950 text-sm group-hover:text-sky-700 transition-colors">{ally.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{ally.ally_type}</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Noticias del evento */}
      {(loadingContent || news.length > 0) && (
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <div className="inline-flex items-center gap-2 text-sky-600 font-semibold text-sm uppercase tracking-wider mb-4">
                  <span className="w-8 h-0.5 bg-sky-500" />Noticias
                </div>
                <h2 className="text-3xl font-bold text-blue-950">Noticias del evento</h2>
              </div>
              <Link to="/blog" className="flex items-center gap-1 text-sky-600 text-sm font-medium hover:text-blue-700 transition-colors">
                Ver todo <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {loadingContent ? (
              <div className="py-10 text-center"><div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
            ) : news.length === 0 ? null : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`}
                    className="card group flex flex-col overflow-hidden hover:-translate-y-1">
                    <div className="h-44 overflow-hidden">
                      {post.cover_url ? (
                        <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-sky-200" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 p-5">
                      <h3 className="font-bold text-blue-950 group-hover:text-sky-700 transition-colors leading-snug mb-2 line-clamp-2 text-[15px]">{post.title}</h3>
                      {post.excerpt && <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>}
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 text-slate-400 text-xs">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.author}</span>
                        <span className="flex items-center gap-1 ml-auto">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.published_at ?? post.created_at).toLocaleDateString('es-GT', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recursos del evento */}
      {(loadingContent || resources.length > 0) && (
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 text-sky-600 font-semibold text-sm uppercase tracking-wider mb-4">
                <span className="w-8 h-0.5 bg-sky-500" />Documentación
              </div>
              <h2 className="text-3xl font-bold text-blue-950 mb-3">Recursos del Evento</h2>
            </div>
            {loadingContent ? (
              <div className="py-10 text-center"><div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" /></div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-50">
                  {resources.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-700 text-sm font-medium">{r.title}</p>
                        {r.description && <p className="text-slate-400 text-xs mt-0.5">{r.description}</p>}
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-xs text-slate-400 font-mono">{r.resource_type}</span>
                        <a href={r.file_url || '#'} target="_blank" rel="noopener noreferrer"
                          className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-sky-100 flex items-center justify-center transition-colors">
                          <Download className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-600" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Registro */}
      <section id="registro" className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-sky-600 font-semibold text-sm uppercase tracking-wider mb-4">
              <span className="w-8 h-0.5 bg-sky-500" />Participación
            </div>
            <h2 className="text-4xl font-bold text-blue-950 mb-4">Registro al Evento</h2>
            <p className="text-slate-500">Completa el formulario para reservar tu participación.</p>
          </div>

          {formSubmitted ? (
            <div className="text-center py-16 bg-sky-50 rounded-2xl border border-sky-200">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="text-2xl font-bold text-blue-950 mb-2">¡Registro exitoso!</h3>
              <p className="text-slate-600 max-w-sm mx-auto">Hemos recibido tu registro. Recibirás una confirmación en tu correo con los detalles del evento.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                {registrationFields.map(({ id, label, type, placeholder }) => (
                  <div key={id}>
                    <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-1.5">
                      {label} <span className="text-red-500">*</span>
                    </label>
                    <input id={id} type={type} placeholder={placeholder} required
                      value={formData[id] || ''}
                      onChange={(e) => setFormData({ ...formData, [id]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 text-sm transition-colors" />
                  </div>
                ))}
                <div>
                  <label htmlFor="sector" className="block text-sm font-semibold text-slate-700 mb-1.5">Sector <span className="text-red-500">*</span></label>
                  <select id="sector" required value={formData.sector || ''}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 text-sm transition-colors bg-white">
                    <option value="">Selecciona tu sector</option>
                    {['Gobierno', 'Sociedad Civil', 'Sector Privado', 'Comunidad Técnica', 'Academia', 'Juventudes', 'Organismos Internacionales', 'Medios de Comunicación', 'Otro'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="modality" className="block text-sm font-semibold text-slate-700 mb-1.5">Modalidad <span className="text-red-500">*</span></label>
                  <select id="modality" required value={formData.modality || ''}
                    onChange={(e) => setFormData({ ...formData, modality: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none text-slate-800 text-sm transition-colors bg-white">
                    <option value="">Selecciona modalidad</option>
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual/En línea</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={acceptedConduct} onChange={(e) => setAcceptedConduct(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                  <span className="text-slate-600 text-sm">
                    Acepto el <a href="#conducta" className="text-sky-600 font-medium hover:underline">Código de Conducta</a> del IGF Guatemala {settings.event_year}. <span className="text-red-500">*</span>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={acceptedData} onChange={(e) => setAcceptedData(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                  <span className="text-slate-600 text-sm">
                    Consiento el uso de mis datos personales para la gestión de mi participación. <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              <button type="submit" disabled={!acceptedConduct || !acceptedData || submitting}
                className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Confirmar registro <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Código de conducta */}
      <section id="conducta" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-950 mb-3">Código de Conducta</h2>
            <p className="text-slate-500">El IGF Guatemala es un espacio seguro, inclusivo y respetuoso para todas las personas.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { title: 'Respeto mutuo', desc: 'Tratar a todas las personas con dignidad y cortesía, independientemente de su sector, opinión o identidad.' },
              { title: 'No discriminación', desc: 'Está prohibida cualquier forma de discriminación por género, etnia, origen, orientación sexual, capacidad o sector.' },
              { title: 'Diálogo constructivo', desc: 'Las diferencias de opinión se abordan con argumentos, datos y respeto, no con ataques personales.' },
              { title: 'Inclusión', desc: 'Se fomenta la participación equitativa de todas las personas, especialmente de grupos históricamente marginados.' },
              { title: 'Prohibición de acoso', desc: 'No se tolerará ningún tipo de acoso, hostigamiento o intimidación en el espacio del evento.' },
              { title: 'Mecanismo de reporte', desc: 'Cualquier persona puede reportar incidentes de forma confidencial al comité organizador.' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white rounded-xl border border-slate-100 p-6">
                <h3 className="font-bold text-blue-950 text-sm mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sede */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-blue-950 mb-3">Sede y Logística</h2>
            <p className="text-slate-500">Todo lo que necesitas saber para participar.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-5">
              {[
                { icon: MapPin, title: 'Lugar', info: settings.event_location || 'Centro de Convenciones, Ciudad de Guatemala' },
                { icon: Calendar, title: 'Fecha y horario', info: `${settings.event_date || '15 de octubre de 2026'} · 8:00 AM – 6:00 PM` },
                { icon: Monitor, title: 'Modalidad', info: settings.event_modality || 'Presencial con transmisión en vivo' },
                { icon: Users, title: 'Accesibilidad', info: 'El recinto es accesible para personas con movilidad reducida. Servicios de interpretación disponibles.' },
              ].map(({ icon: Icon, title, info }) => (
                <div key={title} className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-950 text-sm mb-1">{title}</h3>
                    <p className="text-slate-600 text-sm">{info}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-100 rounded-2xl h-72 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-10 h-10 text-sky-400 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Mapa de ubicación</p>
                <p className="text-slate-400 text-xs mt-1">{settings.event_location || 'Ciudad de Guatemala'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Volver al sitio */}
      <section className="py-12 bg-blue-700 text-center">
        <p className="text-blue-300 text-sm mb-3">¿Buscas más información sobre el IGF Guatemala?</p>
        <Link to="/" className="inline-flex items-center gap-2 text-sky-300 font-semibold hover:text-white transition-colors">
          Visita el sitio institucional <ChevronRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
