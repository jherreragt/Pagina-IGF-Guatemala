import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit2, Save, X, CheckCircle2, AlertCircle, Globe, Layers } from 'lucide-react';
import { supabase, EventAlly } from '../../lib/supabase';
import { useActiveEdition } from '../../hooks/useActiveEdition';

const ALLY_TYPES = ['Apoyo Internacional', 'Apoyo Técnico', 'Aliado Nacional', 'Patrocinador', 'Aliado Institucional'];
const EMPTY: Omit<EventAlly, 'id' | 'created_at' | 'edition_id'> = {
  name: '', ally_type: 'Aliado Nacional', logo_url: '', website_url: '', sort_order: 0, published: true,
};

export default function EventAllies() {
  const { edition, loading: editionLoading } = useActiveEdition();
  const [allies, setAllies] = useState<EventAlly[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EventAlly | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Omit<EventAlly, 'id' | 'created_at' | 'edition_id'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    if (editionLoading) return;
    setLoading(true);
    let q = supabase.from('event_allies').select('*').order('sort_order').order('name');
    if (edition) q = q.eq('edition_id', edition.id);
    const { data } = await q;
    setAllies((data as EventAlly[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [edition?.id, editionLoading]);

  function openNew() { setIsNew(true); setEditing(null); setForm({ ...EMPTY, sort_order: allies.length }); setError(''); }
  function openEdit(a: EventAlly) {
    setIsNew(false); setEditing(a);
    setForm({ name: a.name, ally_type: a.ally_type, logo_url: a.logo_url ?? '', website_url: a.website_url ?? '', sort_order: a.sort_order, published: a.published });
    setError('');
  }
  function closePanel() { setEditing(null); setIsNew(false); setError(''); }

  async function handleSave() {
    if (!form.name.trim()) { setError('El nombre es requerido.'); return; }
    setSaving(true); setError(''); setSaved(false);
    const payload = { ...form, edition_id: edition?.id ?? null };
    let result;
    if (isNew) {
      result = await supabase.from('event_allies').insert(payload).select().single();
    } else {
      result = await supabase.from('event_allies').update(payload).eq('id', editing!.id).select().single();
    }
    setSaving(false);
    if (result.error) { setError('No se pudo guardar el cambio. Verifica los datos e intenta de nuevo.'); return; }
    setSaved(true);
    await load();
    if (isNew) closePanel();
    setTimeout(() => setSaved(false), 2500);
  }

  async function deleteAlly(id: string) {
    if (!confirm('¿Eliminar este aliado?')) return;
    await supabase.from('event_allies').delete().eq('id', id);
    setAllies((prev) => prev.filter((a) => a.id !== id));
    if (editing?.id === id) closePanel();
  }

  const panelOpen = editing !== null || isNew;

  return (
    <div className="flex gap-6 max-w-7xl">
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
            <h1 className="text-2xl font-bold text-slate-900">Aliados y apoyos</h1>
            <p className="text-slate-500 text-sm mt-1">{allies.length} organizaciones</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Agregar aliado
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full p-10 text-center text-slate-500 text-sm">Cargando...</div>
          ) : allies.length === 0 ? (
            <div className="col-span-full p-12 text-center">
              <Globe className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm mb-4">No hay aliados registrados.</p>
              <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-500 transition-colors">
                <Plus className="w-4 h-4" /> Agregar aliado
              </button>
            </div>
          ) : (
            allies.map((a) => (
              <div key={a.id} className={`bg-white border border-slate-200 rounded-xl p-4 ${!a.published ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {a.logo_url ? (
                      <img src={a.logo_url} alt={a.name} className="w-full h-full object-contain p-1"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <Globe className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(a)} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-100 rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteAlly(a.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <p className="text-slate-900 font-semibold text-sm">{a.name}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-700 rounded-full text-slate-500 text-xs">{a.ally_type}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {panelOpen && (
        <div className="flex-1 xl:max-w-sm">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900 font-bold">{isNew ? 'Nuevo aliado' : 'Editar aliado'}</h2>
              <button onClick={closePanel} className="text-slate-500 hover:text-slate-900 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {error && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nombre *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tipo</label>
                <select value={form.ally_type} onChange={(e) => setForm((f) => ({ ...f, ally_type: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors">
                  {ALLY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">URL del logo</label>
                <input value={form.logo_url ?? ''} onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))} placeholder="https://..."
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Sitio web</label>
                <input value={form.website_url ?? ''} onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))} placeholder="https://..."
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Orden</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-20 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.published ? 'bg-sky-600' : 'bg-slate-700'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.published ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-slate-500 text-sm">Publicar</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {saved && <span className="flex items-center gap-1.5 text-green-400 text-sm"><CheckCircle2 className="w-4 h-4" />Guardado</span>}
              <button onClick={closePanel} className="ml-auto px-4 py-2.5 bg-slate-700 hover:bg-slate-100 text-white text-sm font-medium rounded-xl transition-colors">Cancelar</button>
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
