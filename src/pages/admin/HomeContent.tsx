import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, X, Save, CheckCircle2, AlertCircle, GripVertical, Eye, EyeOff } from 'lucide-react';
import { supabase, HomeStat, HomeWhyMatter, HomePrinciple, HomeStakeholder } from '../../lib/supabase';

type TabKey = 'stats' | 'whyMatters' | 'principles' | 'stakeholders';

const TABS: { key: TabKey; label: string; table: string; icon: typeof Plus }[] = [
  { key: 'stats', label: 'Estadísticas (Hero)', table: 'home_stats', icon: Plus },
  { key: 'whyMatters', label: 'Por qué importa', table: 'home_why_matters', icon: Plus },
  { key: 'principles', label: 'Principios', table: 'home_principles', icon: Plus },
  { key: 'stakeholders', label: 'Comunidad', table: 'home_stakeholders', icon: Plus },
];

const ICON_OPTIONS = [
  'Globe', 'Users', 'Calendar', 'Lightbulb', 'ShieldCheck', 'Wifi', 'Scale',
  'Lock', 'Database', 'Radio', 'MessageSquare', 'Heart', 'Building2',
  'GraduationCap', 'Laptop', 'TrendingUp', 'Zap', 'BookOpen', 'Eye', 'Award',
  'Network', 'Server', 'Cpu', 'Cloud', 'FileText', 'Microscope',
];

type Item = HomeStat | HomeWhyMatter | HomePrinciple | HomeStakeholder;

const EMPTY: Record<TabKey, Record<string, unknown>> = {
  stats: { number: '', label: '', icon_name: 'Globe', sort_order: 0, published: true },
  whyMatters: { label: '', icon_name: 'ShieldCheck', sort_order: 0, published: true },
  principles: { label: '', sort_order: 0, published: true },
  stakeholders: { label: '', description: '', icon_name: 'Users', sort_order: 0, published: true },
};

export default function HomeContent() {
  const [tab, setTab] = useState<TabKey>('stats');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function load(currentTab: TabKey) {
    setLoading(true);
    const table = TABS.find((t) => t.key === currentTab)!.table;
    const { data } = await supabase.from(table).select('*').order('sort_order');
    setItems((data as Item[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(tab); }, [tab]);

  function openNew() {
    setIsNew(true);
    setEditing(null);
    setForm({ ...EMPTY[tab], sort_order: items.length });
    setError('');
  }

  function openEdit(item: Item) {
    setIsNew(false);
    setEditing(item);
    const { id, created_at, ...rest } = item;
    setForm(rest);
    setError('');
  }

  function closePanel() {
    setEditing(null);
    setIsNew(false);
    setError('');
  }

  async function handleSave() {
    const table = TABS.find((t) => t.key === tab)!.table;
    if (tab !== 'principles' && !(form.label as string)?.trim?.() && !(form.number as string)?.trim?.()) {
      setError('El texto principal es requerido.');
      return;
    }
    if (tab === 'principles' && !(form.label as string)?.trim?.()) {
      setError('El texto del principio es requerido.');
      return;
    }
    setSaving(true);
    setError('');
    setSaved(false);
    let result;
    if (isNew) {
      result = await supabase.from(table).insert(form).select().single();
    } else {
      result = await supabase.from(table).update(form).eq('id', (editing as Item).id).select().single();
    }
    setSaving(false);
    if (result.error) { setError(result.error.message); return; }
    setSaved(true);
    await load(tab);
    if (isNew) closePanel();
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este elemento?')) return;
    const table = TABS.find((t) => t.key === tab)!.table;
    await supabase.from(table).delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    if ((editing as Item)?.id === id) closePanel();
  }

  async function togglePublish(item: Item) {
    const table = TABS.find((t) => t.key === tab)!.table;
    await supabase.from(table).update({ published: !item.published }).eq('id', item.id);
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, published: !i.published } : i));
  }

  function renderPrimaryField() {
    if (tab === 'stats') {
      return (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Número *</label>
            <input value={(form.number as string) ?? ''} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} placeholder="8+"
              className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Etiqueta *</label>
            <input value={(form.label as string) ?? ''} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="Ediciones"
              className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500 transition-colors" />
          </div>
        </div>
      );
    }
    return (
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">{tab === 'principles' ? 'Principio *' : 'Etiqueta *'}</label>
        <input value={(form.label as string) ?? ''} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="Texto..."
          className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500 transition-colors" />
      </div>
    );
  }

  function renderSecondaryFields() {
    return (
      <>
        {tab === 'stakeholders' && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Descripción</label>
            <input value={(form.description as string) ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción corta"
              className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500 transition-colors" />
          </div>
        )}
        {tab !== 'principles' && (
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Icono (lucide-react)</label>
            <select value={(form.icon_name as string) ?? 'Globe'} onChange={(e) => setForm((f) => ({ ...f, icon_name: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500 transition-colors">
              {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
            </select>
          </div>
        )}
      </>
    );
  }

  function renderItemLabel(item: Item) {
    if (tab === 'stats') return `${(item as HomeStat).number} — ${(item as HomeStat).label}`;
    return (item as HomeWhyMatter | HomePrinciple | HomeStakeholder).label;
  }

  const panelOpen = editing !== null || isNew;

  return (
    <div className="flex gap-6 max-w-7xl">
      <div className={`${panelOpen ? 'hidden xl:block xl:w-1/2' : 'w-full'} space-y-5`}>
        <div>
          <h1 className="text-2xl font-bold text-white">Contenido del Home</h1>
          <p className="text-slate-400 text-sm mt-1">Administra las listas y tarjetas que aparecen en la página de inicio.</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); closePanel(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">{items.length} elementos</p>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>

        <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-slate-500 text-sm">Cargando...</div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-400 text-sm mb-4">No hay elementos. ¡Agrega el primero!</p>
              <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-500 transition-colors">
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {items.map((item) => (
                <div key={item.id} className={`flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors ${!item.published ? 'opacity-50' : ''}`}>
                  <GripVertical className="w-4 h-4 text-slate-700 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{renderItemLabel(item)}</p>
                    {tab === 'stakeholders' && <p className="text-slate-500 text-xs truncate">{(item as HomeStakeholder).description}</p>}
                    {tab !== 'principles' && <p className="text-slate-600 text-xs mt-0.5">{(item as HomeStat).icon_name}</p>}
                  </div>
                  <span className="text-slate-600 text-xs flex-shrink-0">#{item.sort_order}</span>
                  <button onClick={() => togglePublish(item)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors flex-shrink-0">
                    {item.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors flex-shrink-0"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
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
              <h2 className="text-white font-bold">{isNew ? 'Nuevo elemento' : 'Editar elemento'}</h2>
              <button onClick={closePanel} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {error && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}

            <div className="space-y-3">
              {renderPrimaryField()}
              {renderSecondaryFields()}

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Orden</label>
                  <input type="number" value={(form.sort_order as number) ?? 0} onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                    className="w-24 px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500 transition-colors" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.published ? 'bg-sky-600' : 'bg-slate-700'}`}>
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
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors">
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
