import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit2, Save, X, CheckCircle2, AlertCircle, Download, Layers } from 'lucide-react';
import { supabase, EventResource } from '../../lib/supabase';
import { useActiveEdition } from '../../hooks/useActiveEdition';

const RESOURCE_TYPES = ['PDF', 'ZIP', 'LINK', 'VIDEO', 'PRESENTACIÓN', 'OTRO'];
const EMPTY: Omit<EventResource, 'id' | 'created_at' | 'edition_id'> = {
  title: '', description: '', file_url: '', resource_type: 'PDF', sort_order: 0, published: true,
};

export default function EventResources() {
  const { edition, loading: editionLoading } = useActiveEdition();
  const [resources, setResources] = useState<EventResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EventResource | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Omit<EventResource, 'id' | 'created_at' | 'edition_id'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    if (editionLoading) return;
    setLoading(true);
    let q = supabase.from('event_resources').select('*').order('sort_order').order('created_at');
    if (edition) q = q.eq('edition_id', edition.id);
    const { data } = await q;
    setResources((data as EventResource[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [edition?.id, editionLoading]);

  function openNew() { setIsNew(true); setEditing(null); setForm({ ...EMPTY, sort_order: resources.length }); setError(''); }
  function openEdit(r: EventResource) {
    setIsNew(false); setEditing(r);
    setForm({ title: r.title, description: r.description ?? '', file_url: r.file_url ?? '', resource_type: r.resource_type, sort_order: r.sort_order, published: r.published });
    setError('');
  }
  function closePanel() { setEditing(null); setIsNew(false); setError(''); }

  async function handleSave() {
    if (!form.title.trim()) { setError('El título es requerido.'); return; }
    setSaving(true); setError(''); setSaved(false);
    const payload = { ...form, edition_id: edition?.id ?? null };
    let result;
    if (isNew) {
      result = await supabase.from('event_resources').insert(payload).select().single();
    } else {
      result = await supabase.from('event_resources').update(payload).eq('id', editing!.id).select().single();
    }
    setSaving(false);
    if (result.error) { setError(result.error.message); return; }
    setSaved(true);
    await load();
    if (isNew) closePanel();
    setTimeout(() => setSaved(false), 2500);
  }

  async function deleteResource(id: string) {
    if (!confirm('¿Eliminar este recurso?')) return;
    await supabase.from('event_resources').delete().eq('id', id);
    setResources((prev) => prev.filter((r) => r.id !== id));
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
            <h1 className="text-2xl font-bold text-slate-900">Recursos del evento</h1>
            <p className="text-slate-500 text-sm mt-1">{resources.length} recursos</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Agregar recurso
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-slate-500 text-sm">Cargando...</div>
          ) : resources.length === 0 ? (
            <div className="p-12 text-center">
              <Download className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm mb-4">No hay recursos. ¡Agrega el primero!</p>
              <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-500 transition-colors">
                <Plus className="w-4 h-4" /> Agregar recurso
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {resources.map((r) => (
                <div key={r.id} className={`flex items-center gap-4 px-4 py-3.5 hover:bg-slate-100 transition-colors ${!r.published ? 'opacity-50' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 text-sm font-medium truncate">{r.title}</p>
                    {r.description && <p className="text-slate-500 text-xs mt-0.5 truncate">{r.description}</p>}
                  </div>
                  <span className="text-slate-500 text-xs font-mono flex-shrink-0">{r.resource_type}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(r)} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-100 rounded transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteResource(r.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {panelOpen && (
        <div className="flex-1 xl:max-w-sm">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900 font-bold">{isNew ? 'Nuevo recurso' : 'Editar recurso'}</h2>
              <button onClick={closePanel} className="text-slate-500 hover:text-slate-900 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {error && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Título *</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Descripción</label>
                <textarea value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">URL del archivo / enlace</label>
                <input value={form.file_url ?? ''} onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))} placeholder="https://..."
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tipo de archivo</label>
                <select value={form.resource_type} onChange={(e) => setForm((f) => ({ ...f, resource_type: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors">
                  {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
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
