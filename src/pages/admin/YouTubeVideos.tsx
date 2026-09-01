import { useEffect, useState, useMemo } from 'react';
import {
  Plus, Edit2, Trash2, X, Save, Youtube, Eye, EyeOff, Loader2,
  Search, ArrowUp, ArrowDown, Link2, AlertCircle, CheckCircle2,
} from 'lucide-react';
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

const CATEGORIES = ['Webinar', 'Foro', 'Conversatorio', 'Panel', 'Entrevista', 'Ponencia', 'Otro'];

function extractYouTubeId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /[?&]v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = trimmed.match(p);
    if (m) return m[1];
  }
  return trimmed;
}

function getThumbUrl(youtubeId: string, custom?: string | null): string {
  if (custom) return custom;
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

export default function YouTubeVideosAdmin() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('Todas');
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => { load(); }, []);

  // Auto-clear success message
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

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

  const filtered = useMemo(() => {
    return videos.filter((v) => {
      const matchSearch =
        !search ||
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.youtube_id.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === 'Todas' || v.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [videos, search, filterCat]);

  const stats = useMemo(() => ({
    total: videos.length,
    published: videos.filter((v) => v.published).length,
    hidden: videos.filter((v) => !v.published).length,
  }), [videos]);

  function openNew() {
    setForm(EMPTY);
    setEditingId(null);
    setUrlInput('');
    setError('');
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
    setUrlInput('');
    setEditingId(v.id);
    setError('');
    setShowForm(true);
  }

  function handleUrlPaste(value: string) {
    setUrlInput(value);
    const id = extractYouTubeId(value);
    if (id && id !== form.youtube_id) {
      setForm((prev) => ({ ...prev, youtube_id: id }));
    }
  }

  async function handleSave() {
    if (!form.youtube_id.trim() || !form.title.trim()) {
      setError('El ID/URL de YouTube y el título son obligatorios');
      return;
    }
    setSaving(true);
    setError('');

    const cleanId = extractYouTubeId(form.youtube_id);
    const payload = {
      youtube_id: cleanId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      thumbnail_url: form.thumbnail_url.trim() || null,
      category: form.category.trim() || 'Webinar',
      sort_order: form.sort_order,
      published: form.published,
    };

    let errMsg = '';
    if (editingId) {
      const { error: err } = await supabase.from('youtube_videos').update(payload).eq('id', editingId);
      if (err) errMsg = 'No se pudo guardar el video. Verifica los datos e intenta de nuevo.';
    } else {
      const { error: err } = await supabase.from('youtube_videos').insert(payload);
      if (err) errMsg = 'No se pudo guardar el video. Verifica los datos e intenta de nuevo.';
    }

    setSaving(false);
    if (errMsg) {
      setError(errMsg);
      return;
    }
    setShowForm(false);
    setSuccess(editingId ? 'Video actualizado correctamente' : 'Video creado correctamente');
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este video? Esta acción no se puede deshacer.')) return;
    const { error: err } = await supabase.from('youtube_videos').delete().eq('id', id);
    if (err) { setError('No se pudo eliminar el video. Intenta de nuevo.'); return; }
    setSuccess('Video eliminado');
    load();
  }

  async function togglePublished(v: YouTubeVideo) {
    const { error: err } = await supabase
      .from('youtube_videos')
      .update({ published: !v.published })
      .eq('id', v.id);
    if (err) { setError('No se pudo actualizar el video. Intenta de nuevo.'); return; }
    load();
  }

  async function moveVideo(v: YouTubeVideo, direction: 'up' | 'down') {
    const sorted = [...videos].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((x) => x.id === v.id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sorted.length - 1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const swap = sorted[swapIdx];

    await Promise.all([
      supabase.from('youtube_videos').update({ sort_order: swap.sort_order }).eq('id', v.id),
      supabase.from('youtube_videos').update({ sort_order: v.sort_order }).eq('id', swap.id),
    ]);
    load();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Videos de YouTube</h1>
          <p className="text-slate-500 text-sm mt-1">Administra los webinars y videos que se muestran en la página principal.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo video
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-slate-500 text-xs mt-0.5">Total videos</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600">{stats.published}</div>
          <div className="text-slate-500 text-xs mt-0.5">Publicados</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-slate-400">{stats.hidden}</div>
          <div className="text-slate-500 text-xs mt-0.5">Ocultos</div>
        </div>
      </div>

      {/* Success toast */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Error toast */}
      {error && !showForm && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filters */}
      {videos.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título o ID..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500"
          >
            <option>Todas</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
        </div>
      ) : videos.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Youtube className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No hay videos agregados todavía.</p>
          <button onClick={openNew} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-500 transition-colors">
            <Plus className="w-4 h-4" />
            Agregar primer video
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No se encontraron videos con los filtros aplicados.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((v, idx) => (
            <div key={v.id} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
              {/* Reorder */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  onClick={() => moveVideo(v, 'up')}
                  disabled={idx === 0}
                  className="p-1 text-slate-400 hover:text-sky-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title="Subir"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => moveVideo(v, 'down')}
                  disabled={idx === filtered.length - 1}
                  className="p-1 text-slate-400 hover:text-sky-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title="Bajar"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Thumbnail */}
              <div className="w-28 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 relative group/thumb">
                <img
                  src={getThumbUrl(v.youtube_id, v.thumbnail_url)}
                  alt={v.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`; }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700">{v.category}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.published ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {v.published ? 'Publicado' : 'Oculto'}
                  </span>
                  <span className="text-slate-400 text-xs">Orden: {v.sort_order}</span>
                </div>
                <p className="text-slate-900 text-sm font-medium truncate">{v.title}</p>
                <a
                  href={`https://www.youtube.com/watch?v=${v.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 text-xs hover:text-sky-600 transition-colors inline-flex items-center gap-1 mt-0.5"
                >
                  <Link2 className="w-3 h-3" />
                  youtube.com/watch?v={v.youtube_id}
                </a>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => togglePublished(v)} className="p-2 text-slate-400 hover:text-sky-600 transition-colors" title={v.published ? 'Ocultar' : 'Publicar'}>
                  {v.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(v)} className="p-2 text-slate-400 hover:text-sky-600 transition-colors" title="Editar">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Eliminar">
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
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-slate-900 font-bold text-lg">{editingId ? 'Editar video' : 'Nuevo video'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* URL paste helper */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Pegar URL de YouTube (opcional)</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => handleUrlPaste(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
                <p className="text-slate-400 text-xs mt-1">Pega la URL completa y extraeremos el ID automáticamente</p>
              </div>

              {/* YouTube ID */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ID del video de YouTube <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.youtube_id}
                  onChange={(e) => setForm({ ...form, youtube_id: e.target.value })}
                  placeholder="dQw4w9WgXcQ"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500"
                />
                <p className="text-slate-400 text-xs mt-1">El ID está en la URL: youtube.com/watch?v=<strong>XXXX</strong></p>
              </div>

              {/* Live thumbnail preview */}
              {form.youtube_id.trim() && (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <p className="text-slate-500 text-xs font-medium px-3 py-2 border-b border-slate-200">Vista previa de miniatura</p>
                  <div className="relative h-40 bg-slate-200">
                    <img
                      src={getThumbUrl(form.youtube_id.trim(), form.thumbnail_url.trim() || null)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const parent = img.parentElement;
                        if (parent && !parent.querySelector('.thumb-error')) {
                          const msg = document.createElement('div');
                          msg.className = 'thumb-error absolute inset-0 flex items-center justify-center text-slate-400 text-sm';
                          msg.textContent = 'ID no válido o miniatura no disponible';
                          parent.appendChild(msg);
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Título <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Título del video"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Descripción opcional"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">URL de miniatura personalizada (opcional)</label>
                <input
                  type="text"
                  value={form.thumbnail_url}
                  onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500"
                />
                <p className="text-slate-400 text-xs mt-1">Dejar vacío para usar la miniatura por defecto de YouTube</p>
              </div>

              {/* Sort order + Published */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Orden</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Estado</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, published: !form.published })}
                    className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${form.published ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}
                  >
                    {form.published ? 'Visible en el sitio' : 'Oculto'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-200">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Guardar cambios' : 'Crear video'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
