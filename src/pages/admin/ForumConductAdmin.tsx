import { useEffect, useState } from 'react';
import {
  Plus, Trash2, Edit2, X, Save, AlertCircle, CheckCircle2, ShieldCheck, ArrowUp, ArrowDown,
} from 'lucide-react';
import { supabase, ForumCodeOfConductSection } from '../../lib/supabase';

const EMPTY = { title: '', body: '', sort_order: 0, is_active: true };

export default function ForumConductAdmin() {
  const [sections, setSections] = useState<ForumCodeOfConductSection[]>([]);
  const [version, setVersion] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ForumCodeOfConductSection | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [bumping, setBumping] = useState(false);
  const [bumped, setBumped] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: s }, { data: m }] = await Promise.all([
      supabase.from('forum_code_of_conduct').select('*').order('sort_order'),
      supabase.from('forum_conduct_meta').select('current_version').eq('id', 1).maybeSingle(),
    ]);
    setSections((s as ForumCodeOfConductSection[]) ?? []);
    setVersion((m as { current_version: number } | null)?.current_version ?? 1);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setIsNew(true);
    setEditing(null);
    setForm({ ...EMPTY, sort_order: sections.length + 1 });
    setError('');
  }

  function openEdit(section: ForumCodeOfConductSection) {
    setIsNew(false);
    setEditing(section);
    setForm({
      title: section.title,
      body: section.body,
      sort_order: section.sort_order,
      is_active: section.is_active,
    });
    setError('');
  }

  function closePanel() {
    setEditing(null);
    setIsNew(false);
    setError('');
  }

  async function handleSave() {
    if (!form.title.trim() || !form.body.trim()) {
      setError('El título y el cuerpo son obligatorios.');
      return;
    }
    setSaving(true);
    setError('');
    setSaved(false);
    let result;
    if (isNew) {
      result = await supabase.from('forum_code_of_conduct').insert(form).select().single();
    } else {
      result = await supabase
        .from('forum_code_of_conduct')
        .update(form)
        .eq('id', editing!.id)
        .select()
        .single();
    }
    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setSaved(true);
    await load();
    if (isNew) closePanel();
  }

  async function handleDelete(section: ForumCodeOfConductSection) {
    if (!confirm(`¿Eliminar la sección "${section.title}"?`)) return;
    await supabase.from('forum_code_of_conduct').delete().eq('id', section.id);
    await load();
  }

  async function moveSection(section: ForumCodeOfConductSection, dir: -1 | 1) {
    const newOrder = section.sort_order + dir;
    await supabase
      .from('forum_code_of_conduct')
      .update({ sort_order: newOrder })
      .eq('id', section.id);
    await load();
  }

  async function bumpVersion() {
    if (
      !confirm(
        'Al subir la versión, todas las personas participantes deberán aceptar de nuevo los lineamientos la próxima vez que quieran publicar. ¿Continuar?'
      )
    )
      return;
    setBumping(true);
    setBumped(false);
    const { error: e } = await supabase
      .from('forum_conduct_meta')
      .update({ current_version: version + 1, updated_at: new Date().toISOString() })
      .eq('id', 1);
    setBumping(false);
    if (e) {
      setError(e.message);
      return;
    }
    setBumped(true);
    await load();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Lineamientos de convivencia</h1>
          <p className="text-slate-400 text-sm mt-1">
            El código que las personas aceptan al registrarse. Versión actual: <b>v{version}</b>
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Nueva sección
        </button>
      </div>

      {/* Version bump notice */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Re-aceptación al actualizar</p>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Si cambias el contenido de los lineamientos, puedes subir la versión para que
              todas las personas participantes deban aceptarlos de nuevo antes de seguir publicando.
            </p>
          </div>
          <button
            onClick={bumpVersion}
            disabled={bumping}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:bg-slate-700 flex-shrink-0"
          >
            {bumping ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              `Subir a v${version + 1}`
            )}
          </button>
        </div>
        {bumped && (
          <p className="text-green-400 text-xs mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Versión actualizada. Las personas existentes
            deberán aceptar de nuevo.
          </p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500 text-sm">Cargando...</div>
      ) : sections.length === 0 ? (
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-10 text-center">
          <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay secciones del código de conducta.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section, i) => (
            <div
              key={section.id}
              className="bg-slate-800/50 border border-white/10 rounded-2xl p-5"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-sky-500/15 flex items-center justify-center text-sky-400 font-bold text-xs">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white text-sm">{section.title}</h3>
                    {!section.is_active && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400">
                        Inactiva
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                    {section.body}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => moveSection(section, -1)}
                    disabled={i === 0}
                    className="text-slate-400 hover:text-sky-400 disabled:opacity-30 transition-colors w-7 h-7 rounded-lg flex items-center justify-center"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveSection(section, 1)}
                    disabled={i === sections.length - 1}
                    className="text-slate-400 hover:text-sky-400 disabled:opacity-30 transition-colors w-7 h-7 rounded-lg flex items-center justify-center"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEdit(section)}
                    className="text-slate-400 hover:text-sky-400 transition-colors w-7 h-7 rounded-lg flex items-center justify-center"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(section)}
                    className="text-slate-400 hover:text-red-400 transition-colors w-7 h-7 rounded-lg flex items-center justify-center"
                  >
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
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={closePanel} />
          <div className="relative w-full max-w-lg bg-slate-800 border border-white/10 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-base">
                {isNew ? 'Nueva sección' : 'Editar sección'}
              </h2>
              <button
                onClick={closePanel}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Guardado correctamente
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Título</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Cuerpo</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={5}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Orden</label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Estado</label>
                <button
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.is_active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {form.is_active ? 'Activa' : 'Inactiva'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={closePanel}
                className="px-4 py-2 text-slate-400 text-sm font-medium hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-500 disabled:bg-slate-700 transition-colors"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
