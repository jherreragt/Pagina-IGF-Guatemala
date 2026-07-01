import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit2, X, Save, CheckCircle2, AlertCircle, Users, Layers } from 'lucide-react';
import { supabase, EventSpeaker } from '../../lib/supabase';
import { useActiveEdition } from '../../hooks/useActiveEdition';

const CATEGORIES = ['Ponente', 'Moderador', 'Relator', 'Panelista', 'Invitado especial'];
const SECTORS = ['Gobierno', 'Sociedad Civil', 'Sector Privado', 'Comunidad Técnica', 'Academia', 'Juventudes', 'Organismos Internacionales', 'Medios'];

const EMPTY: Omit<EventSpeaker, 'id' | 'created_at' | 'edition_id'> = {
  name: '', role: '', organization: '', sector: 'Academia', category: 'Ponente',
  bio: '', photo_url: '', session_title: '', sort_order: 0, published: true,
};

export default function EventSpeakers() {
  const { edition, loading: editionLoading } = useActiveEdition();
  const [speakers, setSpeakers] = useState<EventSpeaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  const [editing, setEditing] = useState<EventSpeaker | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Omit<EventSpeaker, 'id' | 'created_at' | 'edition_id'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    if (editionLoading) return;
    setLoading(true);
    let q = supabase.from('event_speakers').select('*').order('sort_order').order('name');
    if (edition) q = q.eq('edition_id', edition.id);
    const { data } = await q;
    setSpeakers((data as EventSpeaker[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [edition?.id, editionLoading]);

  function openNew() {
    setIsNew(true); setEditing(null); setForm({ ...EMPTY, sort_order: speakers.length }); setError('');
  }

  function openEdit(s: EventSpeaker) {
    setIsNew(false); setEditing(s);
    setForm({ name: s.name, role: s.role ?? '', organization: s.organization ?? '', sector: s.sector ?? 'Academia',
      category: s.category, bio: s.bio ?? '', photo_url: s.photo_url ?? '', session_title: s.session_title ?? '',
      sort_order: s.sort_order, published: s.published });
    setError('');
  }

  function closePanel() { setEditing(null); setIsNew(false); setError(''); }

  async function handleSave() {
    if (!form.name.trim()) { setError('El nombre es requerido.'); return; }
    setSaving(true); setError(''); setSaved(false);
    const payload = { ...form, edition_id: edition?.id ?? null };
    let result;
    if (isNew) {
      result = await supabase.from('event_speakers').insert(payload).select().single();
    } else {
      result = await supabase.from('event_speakers').update(payload).eq('id', editing!.id).select().single();
    }
    setSaving(false);
    if (result.error) { setError(result.error.message); return; }
    setSaved(true);
    await load();
    if (isNew) closePanel();
    setTimeout(() => setSaved(false), 2500);
  }

  async function deleteSpeaker(id: string) {
    if (!confirm('¿Eliminar este ponente?')) return;
    await supabase.from('event_speakers').delete().eq('id', id);
    setSpeakers((prev) => prev.filter((s) => s.id !== id));
    if (editing?.id === id) closePanel();
  }

  const categories = ['Todos', ...CATEGORIES];
  const filtered = filter === 'Todos' ? speakers : speakers.filter((s) => s.category === filter);
  const panelOpen = editing !== null || isNew;

  return (
    <div className="flex gap-6 max-w-7xl">
      <div className={`${panelOpen ? 'hidden xl:block xl:w-1/2' : 'w-full'} space-y-5`}>
        {edition && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            Editando contenido para: <span className="text-emerald-300 font-semibold">{edition.title}</span>
            <Link to="/admin/event/editions" className="ml-auto flex items-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors">
              <Layers className="w-3 h-3" /> Cambiar
            </Link>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Ponentes y moderadores</h1>
            <p className="text-slate-400 text-sm mt-1">{speakers.length} personas registradas</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === c ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'}`}>
              {c}
            </button>
          ))}
        </div>

        <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-slate-500 text-sm">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-4">No hay ponentes. ¡Agrega el primero!</p>
              <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-500 transition-colors">
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((s) => (
                <div key={s.id} className={`flex items-center gap-4 px-4 py-3.5 hover:bg-white/5 transition-colors ${!s.published ? 'opacity-50' : ''}`}>
                  <div className="w-10 h-10 rounded-xl bg-slate-700 overflow-hidden flex-shrink-0">
                    {s.photo_url ? (
                      <img src={s.photo_url} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                        {s.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{s.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-slate-500 text-xs">{s.role}</span>
                      {s.organization && <><span className="text-slate-700 text-xs">·</span><span className="text-slate-500 text-xs">{s.organization}</span></>}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded-full text-xs flex-shrink-0">{s.category}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteSpeaker(s.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {panelOpen && (
        <div className="flex-1 xl:max-w-lg">
          <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold">{isNew ? 'Nuevo ponente' : 'Editar ponente'}</h2>
              <button onClick={closePanel} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {error && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}

            <div className="space-y-3">
              {[
                { label: 'Nombre completo *', key: 'name', placeholder: 'Nombre Apellido' },
                { label: 'Cargo / Rol', key: 'role', placeholder: 'Director de...' },
                { label: 'Organización', key: 'organization', placeholder: 'Nombre de la organización' },
                { label: 'URL de foto', key: 'photo_url', placeholder: 'https://...' },
                { label: 'Sesión en la que participa', key: 'session_title', placeholder: 'Nombre de la sesión' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                  <input value={(form as Record<string, string>)[key] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
              ))}

              {form.photo_url && (
                <img src={form.photo_url} alt="Preview" className="w-16 h-16 rounded-xl object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Categoría</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Sector</label>
                  <select value={form.sector ?? ''} onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors">
                    {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Biografía</label>
                <textarea value={form.bio ?? ''} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Orden</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-24 px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.published ? 'bg-emerald-600' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.published ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-slate-300 text-sm">Publicar</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {saved && <span className="flex items-center gap-1.5 text-green-400 text-sm"><CheckCircle2 className="w-4 h-4" />Guardado</span>}
              <button onClick={closePanel} className="ml-auto px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-xl transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
