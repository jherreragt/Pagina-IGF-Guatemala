import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Youtube, GripVertical, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase, YouTubeVideo } from '../../lib/supabase';

type FormData = {
  youtube_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  sort_order: number;
  published: boolean;
};

const EMPTY: FormData = {
  youtube_id: '',
  title: '',
  description: '',
  thumbnail_url: '',
  category: 'Webinar',
  sort_order: 0,
  published: true,
};

export default function YouTubeVideosAdmin() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('youtube_videos')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (data) setVideos(data as YouTubeVideo[]);
    setLoading(false);
  }

  function openNew() {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(v: YouTubeVideo) {
    setForm({
      youtube_id: v.youtube_id,
      title: v.title,
      description: v.description ?? '',
      thumbnail_url: v.thumbnail_url ?? '',
      category: v.category,
      sort_order: v.sort_order,
      published: v.published,
    });
    setEditingId(v.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.youtube_id.trim() || !form.title.trim()) {
      setError('El ID de YouTube y el título son obligatorios');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      youtube_id: form.youtube_id.trim(),
      title: form.title.trim(),
      description: form.description.trim() || null,
      thumbnail_url: form.thumbnail_url.trim() || null,
      category: form.category.trim() || 'Webinar',
      sort_order: form.sort_order,
      published: form.published,
    };

    if (editingId) {
      const { error: err } = await supabase.from('youtube_videos').update(payload).eq('id', editingId);
      if (err) setError(err.message);
    } else {
      const { error: err } = await supabase.from('youtube_videos').insert(payload);
      if (err) setError(err.message);
    }

    setSaving(false);
    if (!error) {
      setShowForm(false);
      load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este video?')) return;
    await supabase.from('youtube_videos').delete().eq('id', id);
    load();
  }

  async function togglePublished(v: YouTubeVideo) {
    await supabase.from('youtube_videos').update({ published: !v.published }).eq('id', v.id);
    load();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Videos de YouTube</h1>
          <p className="text-slate-400 text-sm mt-1">Administra los webinars y videos que se muestran en la página principal.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo video
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-slate-800/50 border border-white/10 rounded-2xl p-12 text-center">
          <Youtube className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No hay videos agregados todavía.</p>
          <button onClick={openNew} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-500 transition-colors">
            <Plus className="w-4 h-4" />
            Agregar primer video
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((v) => (
            <div key={v.id} className="flex items-center gap-4 p-4 bg-slate-800/50 border border-white/10 rounded-xl hover:bg-slate-800/80 transition-colors">
              <div className="w-28 h-16 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                <img
                  src={v.thumbnail_url || `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`}
                  alt={v.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400">{v.category}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.published ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'}`}>
                    {v.published ? 'Publicado' : 'Oculto'}
                  </span>
                </div>
                <p className="text-white text-sm font-medium truncate">{v.title}</p>
                <p className="text-slate-500 text-xs mt-0.5">ID: {v.youtube_id} · Orden: {v.sort_order}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => togglePublished(v)} className="p-2 text-slate-400 hover:text-sky-400 transition-colors" title={v.published ? 'Ocultar' : 'Publicar'}>
                  {v.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(v)} className="p-2 text-slate-400 hover:text-sky-400 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-slate-800 border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-white font-bold text-lg">{editingId ? 'Editar video' : 'Nuevo video'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">ID del video de YouTube <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.youtube_id}
                  onChange={(e) => setForm({ ...form, youtube_id: e.target.value })}
                  placeholder="dQw4w9WgXcQ"
                  className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
                />
                <p className="text-slate-500 text-xs mt-1">El ID está en la URL: youtube.com/watch?v=<strong className="text-slate-400">XXXX</strong></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Título <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Título del video"
                  className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Categoría</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
                >
                  <option>Webinar</option>
                  <option>Foro</option>
                  <option>Conversatorio</option>
                  <option>Panel</option>
                  <option>Entrevista</option>
                  <option>Ponencia</option>
                  <option>Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Descripción opcional"
                  className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">URL de miniatura (opcional)</label>
                <input
                  type="text"
                  value={form.thumbnail_url}
                  onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
                />
                <p className="text-slate-500 text-xs mt-1">Dejar vacío para usar la miniatura por defecto de YouTube</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Orden</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Publicado</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, published: !form.published })}
                    className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${form.published ? 'bg-green-600/20 text-green-400 border border-green-500/30' : 'bg-slate-900 text-slate-400 border border-white/10'}`}
                  >
                    {form.published ? 'Visible' : 'Oculto'}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-white/10">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
