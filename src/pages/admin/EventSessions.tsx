import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Trash2, Edit2, GripVertical, ChevronUp, ChevronDown, X, Save, CheckCircle2, AlertCircle, Layers
} from 'lucide-react';
import { supabase, EventSession } from '../../lib/supabase';
import { useActiveEdition } from '../../hooks/useActiveEdition';

const SESSION_TYPES = ['Panel', 'Taller', 'Conversatorio', 'Mesa multiactor', 'Plenaria', 'Lightning talk', 'Sesión juvenil', 'Demostración', 'Logística', 'Descanso'];
const AXES = [
  'Inteligencia artificial y gobernanza digital',
  'Derechos digitales, democracia y libertad de expresión',
  'Ciberseguridad, confianza e infraestructura crítica',
  'Inclusión digital y acceso significativo',
  'Datos, interoperabilidad e infraestructura pública digital',
  'Juventudes y futuro de Internet',
  'Economía digital, innovación y desarrollo sostenible',
];

const EMPTY: Omit<EventSession, 'id' | 'created_at' | 'edition_id'> = {
  title: '', description: '', session_type: 'Panel', axis: '', start_time: '',
  end_time: '', event_date: '2026-11-05', room: '', speakers_text: '', sort_order: 0, published: true,
};

export default function EventSessions() {
  const { edition, loading: editionLoading } = useActiveEdition();
  const [sessions, setSessions] = useState<EventSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EventSession | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Omit<EventSession, 'id' | 'created_at' | 'edition_id'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    if (editionLoading) return;
    setLoading(true);
    let q = supabase.from('event_sessions').select('*').order('sort_order').order('start_time');
    if (edition) q = q.eq('edition_id', edition.id);
    const { data } = await q;
    setSessions((data as EventSession[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [edition?.id, editionLoading]);

  function openNew() {
    setIsNew(true);
    setForm({ ...EMPTY, sort_order: sessions.length });
    setEditing(null);
    setError('');
  }

  function openEdit(s: EventSession) {
    setIsNew(false);
    setEditing(s);
    setForm({ title: s.title, description: s.description ?? '', session_type: s.session_type, axis: s.axis ?? '',
      start_time: s.start_time ?? '', end_time: s.end_time ?? '', event_date: s.event_date ?? '2026-11-05',
      room: s.room ?? '', speakers_text: s.speakers_text ?? '', sort_order: s.sort_order, published: s.published });
    setError('');
  }

  function closePanel() { setEditing(null); setIsNew(false); setError(''); }

  async function handleSave() {
    if (!form.title.trim()) { setError('El título es requerido.'); return; }
    setSaving(true); setError(''); setSaved(false);
    const payload = { ...form, edition_id: edition?.id ?? null };
    let result;
    if (isNew) {
      result = await supabase.from('event_sessions').insert(payload).select().single();
    } else {
      result = await supabase.from('event_sessions').update(payload).eq('id', editing!.id).select().single();
    }
    setSaving(false);
    if (result.error) { setError('No se pudo guardar el cambio. Verifica los datos e intenta de nuevo.'); return; }
    setSaved(true);
    await load();
    if (isNew) closePanel();
    setTimeout(() => setSaved(false), 2500);
  }

  async function deleteSession(id: string) {
    if (!confirm('¿Eliminar esta sesión?')) return;
    await supabase.from('event_sessions').delete().eq('id', id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (editing?.id === id) closePanel();
  }

  async function toggle(s: EventSession) {
    await supabase.from('event_sessions').update({ published: !s.published }).eq('id', s.id);
    setSessions((prev) => prev.map((x) => x.id === s.id ? { ...x, published: !x.published } : x));
  }

  const typeColor: Record<string, string> = {
    Plenaria: 'bg-blue-500/15 text-blue-700',
    Descanso: 'bg-slate-700 text-slate-500',
    Logística: 'bg-slate-700 text-slate-500',
    Panel: 'bg-sky-500/15 text-sky-700',
    default: 'bg-slate-700/50 text-slate-500',
  };

  const panelOpen = editing !== null || isNew;

  return (
    <div className="flex gap-6 max-w-7xl h-full">
      {/* List */}
      <div className={`${panelOpen ? 'hidden xl:block xl:w-1/2' : 'w-full'} space-y-5`}>
        {edition && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-sky-500/5 border border-sky-500/20 rounded-xl text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse flex-shrink-0" />
            Editando contenido para: <span className="text-sky-700 font-semibold">{edition.title}</span>
            <Link to="/admin/event/editions" className="ml-auto flex items-center gap-1 text-slate-500 hover:text-sky-400 transition-colors">
              <Layers className="w-3 h-3" /> Cambiar
            </Link>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Agenda del evento</h1>
            <p className="text-slate-500 text-sm mt-1">{sessions.length} sesiones</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Nueva sesión
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-slate-500 text-sm">Cargando sesiones...</div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-500 text-sm mb-4">No hay sesiones. ¡Crea la primera!</p>
              <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-500 transition-colors">
                <Plus className="w-4 h-4" /> Nueva sesión
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sessions.map((s) => (
                <div key={s.id} className={`flex items-center gap-3 px-4 py-3.5 hover:bg-slate-100 transition-colors ${!s.published ? 'opacity-50' : ''}`}>
                  <GripVertical className="w-4 h-4 text-slate-600 flex-shrink-0 cursor-grab" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {s.start_time && <span className="text-sky-400 text-xs font-mono">{s.start_time}{s.end_time ? `–${s.end_time}` : ''}</span>}
                      <span className={`px-2 py-0.5 rounded-full text-xs ${typeColor[s.session_type] ?? typeColor.default}`}>{s.session_type}</span>
                    </div>
                    <p className="text-slate-900 text-sm font-medium truncate">{s.title}</p>
                    {s.room && <p className="text-slate-500 text-xs mt-0.5">{s.room}</p>}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => toggle(s)} className="p-1.5 text-slate-500 hover:text-sky-400 rounded transition-colors" title={s.published ? 'Ocultar' : 'Mostrar'}>
                      {s.published ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => openEdit(s)} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-100 rounded transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteSession(s.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit panel */}
      {panelOpen && (
        <div className="flex-1 xl:max-w-lg">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900 font-bold">{isNew ? 'Nueva sesión' : 'Editar sesión'}</h2>
              <button onClick={closePanel} className="text-slate-500 hover:text-slate-900 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {error && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Título *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Tipo</label>
                  <select value={form.session_type} onChange={(e) => setForm((f) => ({ ...f, session_type: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors">
                    {SESSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Fecha</label>
                  <input type="date" value={form.event_date ?? ''} onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Hora inicio</label>
                  <input type="time" value={form.start_time ?? ''} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Hora fin</label>
                  <input type="time" value={form.end_time ?? ''} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Sala / Ubicación</label>
                <input value={form.room ?? ''} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} placeholder="Auditorio principal"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Eje temático</label>
                <select value={form.axis ?? ''} onChange={(e) => setForm((f) => ({ ...f, axis: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors">
                  <option value="">Sin eje asignado</option>
                  {AXES.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Ponentes / Participantes</label>
                <input value={form.speakers_text ?? ''} onChange={(e) => setForm((f) => ({ ...f, speakers_text: e.target.value }))} placeholder="Nombre de ponentes"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Descripción</label>
                <textarea value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Orden</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors" />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.published ? 'bg-sky-600' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.published ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-slate-500 text-sm">Publicar</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {saved && <span className="flex items-center gap-1.5 text-green-400 text-sm"><CheckCircle2 className="w-4 h-4" />Guardado</span>}
              <button onClick={closePanel} className="ml-auto px-4 py-2.5 bg-slate-700 hover:bg-slate-100 text-white text-sm font-medium rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors">
                {saving ? <div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
