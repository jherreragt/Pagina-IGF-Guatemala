import { useEffect, useState } from 'react';
import {
  Plus, Trash2, Edit2, X, Save, AlertCircle, CheckCircle2, GripVertical,
} from 'lucide-react';
import { supabase, ForumCategory } from '../../lib/supabase';

const EMPTY = {
  name: '', slug: '', description: '', icon_name: 'MessageSquare', color: 'sky', sort_order: 0, is_active: true,
};

const ICON_OPTIONS = ['MessageSquare', 'Wifi', 'ShieldCheck', 'Lock', 'Lightbulb', 'Scale', 'Radio', 'Database', 'Zap', 'Globe', 'Heart', 'Server'];
const COLOR_OPTIONS = ['sky', 'blue', 'cyan', 'amber', 'red', 'green', 'orange', 'teal', 'purple', 'indigo', 'pink', 'slate'];

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function ForumCategories() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ForumCategory | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('forum_categories').select('*').order('sort_order');
    setCategories((data as ForumCategory[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setIsNew(true);
    setEditing(null);
    setForm({ ...EMPTY, sort_order: categories.length + 1 });
    setError('');
  }

  function openEdit(cat: ForumCategory) {
    setIsNew(false);
    setEditing(cat);
    setForm({
      name: cat.name, slug: cat.slug, description: cat.description, icon_name: cat.icon_name,
      color: cat.color, sort_order: cat.sort_order, is_active: cat.is_active,
    });
    setError('');
  }

  function closePanel() { setEditing(null); setIsNew(false); setError(''); }

  async function handleSave() {
    if (!form.name.trim()) { setError('El nombre es requerido.'); return; }
    setSaving(true); setError(''); setSaved(false);
    const payload = { ...form, slug: form.slug || slugify(form.name) };
    let result;
    if (isNew) {
      result = await supabase.from('forum_categories').insert(payload).select().single();
    } else {
      result = await supabase.from('forum_categories').update(payload).eq('id', editing!.id).select().single();
    }
    setSaving(false);
    if (result.error) { setError(result.error.message); return; }
    setSaved(true);
    await load();
    if (isNew) closePanel();
  }

  async function handleDelete(cat: ForumCategory) {
    if (!confirm(`¿Eliminar la categoría "${cat.name}"? Se borrarán todas sus discusiones.`)) return;
    await supabase.from('forum_categories').delete().eq('id', cat.id);
    await load();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categorías del foro</h1>
          <p className="text-slate-500 text-sm mt-1">Crea, edita o desactiva las salas temáticas.</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Nueva categoría
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500 text-sm">Cargando...</div>
      ) : categories.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <p className="text-slate-500 text-sm">No hay categorías. Crea la primera.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-100 transition-colors">
                <GripVertical className="w-4 h-4 text-slate-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 text-sm font-medium truncate">{cat.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5 truncate">{cat.description}</p>
                </div>
                <span className="text-xs text-slate-500 flex-shrink-0">{cat.thread_count} hilos</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${cat.is_active ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-500'}`}>
                  {cat.is_active ? 'Activa' : 'Inactiva'}
                </span>
                <button onClick={() => openEdit(cat)} className="text-slate-500 hover:text-sky-400 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(cat)} className="text-slate-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit/Create panel */}
      {(editing || isNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" onClick={closePanel} />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900 font-bold text-base">{isNew ? 'Nueva categoría' : 'Editar categoría'}</h2>
              <button onClick={closePanel} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {error && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}
            {saved && <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm"><CheckCircle2 className="w-4 h-4 flex-shrink-0" />Guardado correctamente</div>}

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Nombre</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: isNew ? slugify(e.target.value) : form.slug })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Slug (URL)</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Ícono</label>
                <select value={form.icon_name} onChange={(e) => setForm({ ...form, icon_name: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500">
                  {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Color</label>
                <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500">
                  {COLOR_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Orden</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1.5">Estado</label>
                <button onClick={() => setForm({ ...form, is_active: !form.is_active })} className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${form.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-500'}`}>
                  {form.is_active ? 'Activa' : 'Inactiva'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={closePanel} className="px-4 py-2 text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-500 disabled:bg-slate-300 transition-colors">
                {saving ? <div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Guardar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
