import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Eye, EyeOff, X, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase, BlogPost } from '../../lib/supabase';

const CATEGORIES = [
  'Gobernanza de Internet', 'Derechos Digitales', 'Ciberseguridad',
  'Inclusión Digital', 'Inteligencia Artificial', 'Juventudes',
  'Evento Anual', 'Recursos', 'General',
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function BlogEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_url: '',
    author: 'IGF Guatemala',
    category: 'General',
    tags: [] as string[],
    published: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      supabase.from('blog_posts').select('*').eq('id', id).single().then(({ data }) => {
        if (data) {
          const p = data as BlogPost;
          setForm({
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt ?? '',
            content: p.content ?? '',
            cover_url: p.cover_url ?? '',
            author: p.author,
            category: p.category,
            tags: p.tags ?? [],
            published: p.published,
          });
          setSlugManual(true);
        }
        setLoading(false);
      });
    }
  }, [id, isNew]);

  function handleTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      slug: slugManual ? f.slug : slugify(title),
    }));
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  }

  async function handleSave(publish?: boolean) {
    setError('');
    setSaving(true);
    setSaved(false);

    const payload = {
      ...form,
      published: publish !== undefined ? publish : form.published,
      published_at: (publish ?? form.published) ? new Date().toISOString() : null,
      slug: form.slug || slugify(form.title),
    };

    let result;
    if (isNew) {
      result = await supabase.from('blog_posts').insert(payload).select().single();
    } else {
      result = await supabase.from('blog_posts').update(payload).eq('id', id!).select().single();
    }

    setSaving(false);

    if (result.error) {
      setError(result.error.message.includes('duplicate') ? 'Ya existe un artículo con ese slug. Usa un slug diferente.' : result.error.message);
      return;
    }

    setSaved(true);
    if (publish !== undefined) setForm((f) => ({ ...f, published: publish }));
    if (isNew && result.data) {
      navigate(`/admin/blog/edit/${(result.data as BlogPost).id}`, { replace: true });
    }
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/blog')}
            className="p-2 text-slate-500 hover:text-white hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{isNew ? 'Nuevo artículo' : 'Editar artículo'}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${form.published ? 'bg-green-400' : 'bg-amber-400'}`} />
              <span className="text-slate-500 text-xs">{form.published ? 'Publicado' : 'Borrador'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {saved && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Guardado
            </div>
          )}
          <button
            onClick={() => handleSave()}
            disabled={saving || !form.title}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-100 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-colors"
          >
            <Save className="w-4 h-4" />
            Guardar borrador
          </button>
          <button
            onClick={() => handleSave(!form.published)}
            disabled={saving || !form.title}
            className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm rounded-xl transition-colors disabled:opacity-50 ${
              form.published
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-sky-600 hover:bg-sky-500 text-white'
            }`}
          >
            {form.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {form.published ? 'Despublicar' : 'Publicar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">
                Título <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Título del artículo"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 text-lg font-medium focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">
                Slug (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => { setSlugManual(true); setForm((f) => ({ ...f, slug: e.target.value })); }}
                  placeholder="slug-del-articulo"
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 placeholder-slate-600 text-sm font-mono focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
              <p className="text-slate-600 text-xs mt-1">/blog/{form.slug || 'slug-del-articulo'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1.5">
                Resumen / Extracto
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="Breve descripción del artículo para listados y SEO..."
                rows={3}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <label className="block text-sm font-medium text-slate-500 mb-1.5">
              Contenido
            </label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Escribe el contenido del artículo aquí. Puedes usar saltos de línea para separar párrafos."
              rows={20}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors resize-y font-mono leading-relaxed"
            />
            <p className="text-slate-600 text-xs mt-2">Los párrafos separados por líneas en blanco se mostrarán correctamente en el sitio.</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
            <h3 className="text-sm font-semibold text-slate-500">Información del artículo</h3>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Categoría</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Autor</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">URL de imagen de portada</label>
              <input
                type="url"
                value={form.cover_url}
                onChange={(e) => setForm((f) => ({ ...f, cover_url: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-600 text-sm focus:outline-none focus:border-sky-500 transition-colors"
              />
              {form.cover_url && (
                <img src={form.cover_url} alt="Preview" className="mt-2 w-full h-28 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Etiquetas</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="Agregar etiqueta"
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-600 text-xs focus:outline-none focus:border-sky-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 rounded-full text-sky-700 text-xs">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => handleSave()}
            disabled={saving || !form.title}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-700 hover:bg-slate-100 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            {saving ? <div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
