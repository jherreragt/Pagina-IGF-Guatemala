import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Calendar, ArrowRight, User, Tag } from 'lucide-react';
import { supabase, BlogPost } from '../lib/supabase';
import PageHero from '../components/PageHero';

const CATEGORIES = [
  'Todos', 'Gobernanza de Internet', 'Derechos Digitales', 'Ciberseguridad',
  'Inclusión Digital', 'Inteligencia Artificial', 'Juventudes', 'Evento Anual', 'General',
];

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setPosts((data as BlogPost[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = posts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.excerpt ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'Todos' || p.category === category;
    return matchSearch && matchCat;
  });

  const [featured, ...rest] = filtered;

  return (
    <div className="pt-16 sm:pt-24">
      <PageHero
        icon={<BookOpen className="w-7 h-7" />}
        eyebrow="Publicaciones"
        title="Blog IGF"
        titleAccent="Guatemala"
        subtitle="Artículos, análisis y reflexiones sobre gobernanza de Internet, derechos digitales y transformación digital."
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar artículos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${category === cat ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              Cargando artículos...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No se encontraron artículos.</p>
              <p className="text-slate-400 text-sm mt-1">Intenta con otros filtros o términos de búsqueda.</p>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featured && !search && category === 'Todos' && (
                <Link
                  to={`/blog/${featured.slug}`}
                  className="group block mb-10 rounded-2xl overflow-hidden border border-slate-100 hover:border-emerald-200 hover:shadow-card-hover transition-all duration-200"
                >
                  <div className="grid lg:grid-cols-5">
                    <div className="lg:col-span-2 relative h-56 lg:h-auto overflow-hidden">
                      {featured.cover_url ? (
                        <img
                          src={featured.cover_url}
                          alt={featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-emerald-200" />
                        </div>
                      )}
                    </div>
                    <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-5">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                          {featured.category}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Destacado</span>
                      </div>
                      <h2 className="font-display font-bold text-green-950 text-2xl lg:text-3xl mb-4 group-hover:text-emerald-700 transition-colors leading-tight">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-slate-500 leading-relaxed mb-6 line-clamp-3 text-[15px]">{featured.excerpt}</p>
                      )}
                      <div className="flex items-center gap-4 text-slate-400 text-xs mb-6">
                        <span className="flex items-center gap-1.5"><User className="w-3 h-3" />{featured.author}</span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(featured.published_at ?? featured.created_at).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm group-hover:text-green-700 transition-colors">
                        Leer artículo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(search || category !== 'Todos' ? filtered : rest).map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group card flex flex-col overflow-hidden hover:-translate-y-1"
                  >
                    <div className="h-44 overflow-hidden">
                      {post.cover_url ? (
                        <img
                          src={post.cover_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
                          <BookOpen className="w-10 h-10 text-emerald-200" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 p-5">
                      <span className="text-xs font-bold text-emerald-600 mb-2">{post.category}</span>
                      <h3 className="font-bold text-green-950 group-hover:text-emerald-700 transition-colors leading-snug mb-2 line-clamp-2 text-[15px]">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>
                      )}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 text-slate-400 text-xs">
                              <Tag className="w-2.5 h-2.5" />{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 text-slate-400 text-xs">
                        <span className="flex items-center gap-1.5"><User className="w-3 h-3" />{post.author}</span>
                        <span className="flex items-center gap-1.5 ml-auto">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.published_at ?? post.created_at).toLocaleDateString('es-GT', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
