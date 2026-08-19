import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, CheckCircle2, AlertCircle, Zap, Calendar } from 'lucide-react';
import { supabase, EventEdition } from '../../lib/supabase';

type EditionForm = Omit<EventEdition, 'id' | 'created_at' | 'is_active'>;

const EMPTY_FORM: EditionForm = {
  year: '',
  title: '',
  lema: '',
  event_date: '',
  event_location: 'Ciudad de Guatemala',
  event_modality: 'Presencial con transmisión en línea',
  datetime_iso: '',
  registration_open: true,
  sessions_open: true,
};

export default function EventEditions() {
  const [editions, setEditions] = useState<EventEdition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EventEdition | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<EditionForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('event_editions')
      .select('*')
      .order('year', { ascending: false });
    setEditions((data as EventEdition[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setIsNew(true);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setError('');
  }

  function openEdit(ed: EventEdition) {
    setIsNew(false);
    setEditing(ed);
    setForm({
      year: ed.year,
      title: ed.title,
      lema: ed.lema ?? '',
      event_date: ed.event_date ?? '',
      event_location: ed.event_location,
      event_modality: ed.event_modality,
      datetime_iso: ed.datetime_iso ?? '',
      registration_open: ed.registration_open,
      sessions_open: ed.sessions_open,
    });
    setError('');
  }

  function closePanel() { setEditing(null); setIsNew(false); setError(''); }

  function handleYearChange(year: string) {
    setForm((f) => ({
      ...f,
      year,
      title: f.title === '' || f.title === `IGF Guatemala ${f.year}` ? `IGF Guatemala ${year}` : f.title,
    }));
  }

  async function handleSave() {
    if (!form.year.trim()) { setError('El año es requerido.'); return; }
    if (!form.title.trim()) { setError('El título es requerido.'); return; }
    setSaving(true); setError(''); setSaved(false);
    const payload = { ...form };
    let result;
    if (isNew) {
      result = await supabase.from('event_editions').insert({ ...payload, is_active: false }).select().single();
    } else {
      result = await supabase.from('event_editions').update(payload).eq('id', editing!.id).select().single();
    }
    setSaving(false);
    if (result.error) { setError(result.error.message); return; }
    setSaved(true);
    await load();
    if (isNew) closePanel();
    setTimeout(() => setSaved(false), 2500);
  }

  async function activateEdition(id: string) {
    setActivating(id);
    await supabase.from('event_editions').update({ is_active: false }).neq('id', id);
    await supabase.from('event_editions').update({ is_active: true }).eq('id', id);
    await load();
    setActivating(null);
  }

  async function deleteEdition(ed: EventEdition) {
    if (ed.is_active) {
      alert('No se puede eliminar la edición activa. Activa otra edición primero.');
      return;
    }
    if (!confirm(`¿Eliminar la edición "${ed.title}"? El contenido (sesiones, ponentes, etc.) quedará sin edición asignada.`)) return;
    await supabase.from('event_editions').delete().eq('id', ed.id);
    setEditions((prev) => prev.filter((e) => e.id !== ed.id));
    if (editing?.id === ed.id) closePanel();
  }

  const panelOpen = editing !== null || isNew;

  return (
    <div className="flex gap-6 max-w-7xl">
      {/* List */}
      <div className={`${panelOpen ? 'hidden xl:block xl:w-1/2' : 'w-full'} space-y-5`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Ediciones del evento</h1>
            <p className="text-slate-500 text-sm mt-1">
              Cada año es una edición independiente con su propio contenido.
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Nueva edición
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Cargando...</div>
        ) : editions.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-4">No hay ediciones registradas.</p>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-500 transition-colors"
            >
              <Plus className="w-4 h-4" /> Nueva edición
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {editions.map((ed) => (
              <div
                key={ed.id}
                className={`bg-white border rounded-2xl p-5 transition-all ${
                  ed.is_active
                    ? 'border-sky-500/50 bg-sky-500/5'
                    : 'border-slate-200 hover:border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-black text-2xl text-slate-900">{ed.year}</span>
                      {ed.is_active && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-sky-500/20 border border-sky-500/30 rounded-full text-sky-700 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                          Activa
                        </span>
                      )}
                    </div>
                    <p className="text-slate-900 font-medium text-sm mb-0.5">{ed.title}</p>
                    {ed.lema && (
                      <p className="text-slate-500 text-xs italic mb-2 line-clamp-1">"{ed.lema}"</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      {ed.event_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{ed.event_date}
                        </span>
                      )}
                      <span>{ed.event_location}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${ed.registration_open ? 'bg-green-500/10 text-green-400' : 'bg-slate-700 text-slate-500'}`}>
                        Registro {ed.registration_open ? 'abierto' : 'cerrado'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${ed.sessions_open ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-700 text-slate-500'}`}>
                        Convocatoria {ed.sessions_open ? 'abierta' : 'cerrada'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {!ed.is_active && (
                      <button
                        onClick={() => activateEdition(ed.id)}
                        disabled={activating === ed.id}
                        title="Activar esta edición en el sitio público"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600/20 hover:bg-sky-600 border border-sky-500/30 hover:border-transparent text-sky-700 hover:text-slate-900 text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
                      >
                        {activating === ed.id
                          ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          : <Zap className="w-3 h-3" />}
                        Activar
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(ed)}
                      className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-100 rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteEdition(ed)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit panel */}
      {panelOpen && (
        <div className="flex-1 xl:max-w-lg">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900 font-bold">{isNew ? 'Nueva edición' : 'Editar edición'}</h2>
              <button onClick={closePanel} className="text-slate-500 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Año *</label>
                  <input
                    value={form.year}
                    onChange={(e) => handleYearChange(e.target.value)}
                    placeholder="2027"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Título *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="IGF Guatemala 2027"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Lema</label>
                <textarea
                  value={form.lema ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, lema: e.target.value }))}
                  rows={2}
                  placeholder="Lema o tema central del evento"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Fecha (texto para mostrar)</label>
                <input
                  value={form.event_date ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
                  placeholder="9 de noviembre de 2027"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Fecha ISO (para cuenta regresiva)</label>
                <input
                  value={form.datetime_iso ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, datetime_iso: e.target.value }))}
                  placeholder="2027-10-15T09:00:00"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Lugar</label>
                <input
                  value={form.event_location}
                  onChange={(e) => setForm((f) => ({ ...f, event_location: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Modalidad</label>
                <input
                  value={form.event_modality}
                  onChange={(e) => setForm((f) => ({ ...f, event_modality: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                {[
                  { key: 'registration_open' as const, label: 'Registro abierto' },
                  { key: 'sessions_open' as const, label: 'Convocatoria de sesiones abierta' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center justify-between p-3 bg-white/60 rounded-xl cursor-pointer">
                    <span className="text-slate-500 text-sm">{label}</span>
                    <div
                      onClick={() => setForm((f) => ({ ...f, [key]: !f[key] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form[key] ? 'bg-sky-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {saved && (
                <span className="flex items-center gap-1.5 text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />Guardado
                </span>
              )}
              <button onClick={closePanel} className="ml-auto px-4 py-2.5 bg-slate-700 hover:bg-slate-100 text-white text-sm font-medium rounded-xl transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors"
              >
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
