import { useEffect, useState } from 'react';
import {
  Plus, Trash2, Edit2, X, Save, AlertCircle, CheckCircle2, ShieldCheck,
} from 'lucide-react';
import { supabase, ForumRule } from '../../lib/supabase';

const EMPTY = { title: '', description: '', sort_order: 0, is_active: true };

export default function ForumRulesAdmin() {
  const [rules, setRules] = useState<ForumRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ForumRule | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('forum_rules').select('*').order('sort_order');
    setRules((data as ForumRule[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setIsNew(true); setEditing(null);
    setForm({ ...EMPTY, sort_order: rules.length + 1 });
    setError('');
  }

  function openEdit(rule: ForumRule) {
    setIsNew(false); setEditing(rule);
    setForm({ title: rule.title, description: rule.description, sort_order: rule.sort_order, is_active: rule.is_active });
    setError('');
  }

  function closePanel() { setEditing(null); setIsNew(false); setError(''); }

  async function handleSave() {
    if (!form.title.trim() || !form.description.trim()) { setError('Título y descripción son requeridos.'); return; }
    setSaving(true); setError(''); setSaved(false);
    let result;
    if (isNew) {
      result = await supabase.from('forum_rules').insert(form).select().single();
    } else {
      result = await supabase.from('forum_rules').update(form).eq('id', editing!.id).select().single();
    }
    setSaving(false);
    if (result.error) { setError(result.error.message); return; }
    setSaved(true);
    await load();
    if (isNew) closePanel();
  }

  async function handleDelete(rule: ForumRule) {
    if (!confirm(`¿Eliminar la regla "${rule.title}"?`)) return;
    await supabase.from('forum_rules').delete().eq('id', rule.id);
    await load();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reglas de participación</h1>
          <p className="text-slate-500 text-sm mt-1">Edita las normas que rigen el foro.</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Nueva regla
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500 text-sm">Cargando...</div>
      ) : rules.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No hay reglas definidas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, i) => (
            <div key={rule.id} className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400 font-bold text-xs">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 text-sm">{rule.title}</h3>
                    {!rule.is_active && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-500">Inactiva</span>}
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">{rule.description}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(rule)} className="text-slate-500 hover:text-sky-400 transition-colors w-8 h-8 rounded-lg flex items-center justify-center">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(rule)} className="text-slate-500 hover:text-red-400 transition-colors w-8 h-8 rounded-lg flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Create panel */}
      {(editing || isNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" onClick={closePanel} />
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-slate-900 font-bold text-base">{isNew ? 'Nueva regla' : 'Editar regla'}</h2>
              <button onClick={closePanel} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {error && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0" />{error}</div>}
            {saved && <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm"><CheckCircle2 className="w-4 h-4 flex-shrink-0" />Guardado correctamente</div>}

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Título</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500 resize-none" />
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
