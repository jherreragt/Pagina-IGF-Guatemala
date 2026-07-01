import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, CheckCircle2, Circle, Trash2, Edit2,
  Eye, EyeOff, FileText
} from 'lucide-react';
import { supabase, BlogPost } from '../../lib/supabase';

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts'>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts((data as BlogPost[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function togglePublish(post: BlogPost) {
    const newPublished = !post.published;
    await supabase
      .from('blog_posts')
      .update({
        published: newPublished,
        published_at: newPublished ? new Date().toISOString() : null,
      })
      .eq('id', post.id);
    setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, published: newPublished } : p));
  }

  async function deletePost(id: string) {
    if (!confirm('¿Confirmas que deseas eliminar este artículo? Esta acción no se puede deshacer.')) return;
    setDeleting(id);
    await supabase.from('blog_posts').delete().eq('id', id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  }

  const filtered = posts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'published' ? p.published : !p.published);
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog</h1>
          <p className="text-slate-400 text-sm mt-1">Gestiona los artículos del blog del IGF Guatemala.</p>
        </div>
        <Link
          to="/admin/blog/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo artículo
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar artículos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div className="flex rounded-xl border border-white/10 overflow-hidden">
          {(['all', 'published', 'drafts'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-xs font-medium transition-colors ${filter === f ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {f === 'all' ? 'Todos' : f === 'published' ? 'Publicados' : 'Borradores'}
            </button>
          ))}
        </div>
      </div>

      {/* Posts table */}
      <div className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Cargando artículos...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">
              {search || filter !== 'all' ? 'No se encontraron artículos con los filtros seleccionados.' : 'Aún no hay artículos. ¡Crea el primero!'}
            </p>
            {!search && filter === 'all' && (
              <Link to="/admin/blog/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-500 transition-colors">
                <Plus className="w-4 h-4" /> Crear artículo
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((post) => (
              <div key={post.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
                <div className="flex-shrink-0">
                  {post.published
                    ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                    : <Circle className="w-4 h-4 text-slate-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{post.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-slate-500 text-xs">{post.category}</span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-slate-500 text-xs">{post.author}</span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-slate-500 text-xs">{new Date(post.created_at).toLocaleDateString('es-GT')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${post.published ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {post.published ? 'Publicado' : 'Borrador'}
                  </span>
                  <button
                    onClick={() => togglePublish(post)}
                    title={post.published ? 'Despublicar' : 'Publicar'}
                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                  >
                    {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <Link
                    to={`/admin/blog/edit/${post.id}`}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => deletePost(post.id)}
                    disabled={deleting === post.id}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
