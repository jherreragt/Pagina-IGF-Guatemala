import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, BookOpen, Share2, ChevronRight, Check } from 'lucide-react';
import { supabase, BlogPost } from '../lib/supabase';

function renderContent(content: string) {
  return content
    .split(/\n\n+/)
    .filter(Boolean)
    .map((para, i) => (
      <p key={i} className="text-slate-600 leading-[1.8] text-[16px]">
        {para.trim()}
      </p>
    ));
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) { setNotFound(true); setLoading(false); return; }
        setPost(data as BlogPost);
        // Load related posts
        supabase
          .from('blog_posts')
          .select('id, title, slug, category, published_at, cover_url, excerpt')
          .eq('published', true)
          .eq('category', (data as BlogPost).category)
          .neq('id', (data as BlogPost).id)
          .limit(3)
          .then(({ data: rel }) => setRelated((rel as BlogPost[]) ?? []));
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-16 sm:pt-24 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="pt-16 sm:pt-24 min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-950 mb-2">Artículo no encontrado</h1>
          <p className="text-slate-500 mb-6">El artículo que buscas no existe o no está publicado.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-green-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 sm:pt-24">
      {/* Hero */}
      {post.cover_url ? (
        <div className="relative h-72 sm:h-96 overflow-hidden">
          <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-green-950/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 max-w-4xl mx-auto">
            <span className="inline-block px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-semibold mb-4">
              {post.category}
            </span>
            <h1 className="font-display font-bold text-white text-3xl sm:text-4xl leading-tight">{post.title}</h1>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-950 to-green-900 pt-16 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold mb-4">
              {post.category}
            </span>
            <h1 className="font-display font-bold text-white text-3xl sm:text-4xl leading-tight">{post.title}</h1>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8 pb-8 border-b border-slate-100">
          <Link to="/blog" className="flex items-center gap-2 text-emerald-600 text-sm font-medium hover:text-green-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Blog
          </Link>
          <span className="flex items-center gap-1.5 text-slate-500 text-sm">
            <User className="w-3.5 h-3.5" /> {post.author}
          </span>
          <span className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(post.published_at ?? post.created_at).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs">
                  <Tag className="w-2.5 h-2.5" />{tag}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={handleShare}
            className="ml-auto flex items-center gap-1.5 text-slate-400 hover:text-emerald-600 text-sm transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-green-500">Copiado</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" /> Compartir
              </>
            )}
          </button>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8 border-l-4 border-emerald-400 pl-5 italic">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        {post.content ? (
          <div className="space-y-5">
            {renderContent(post.content)}
          </div>
        ) : (
          <p className="text-slate-400 italic">Este artículo aún no tiene contenido.</p>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-green-950">Artículos relacionados</h3>
              <Link to="/blog" className="flex items-center gap-1 text-emerald-600 text-sm font-medium hover:text-green-700 transition-colors">
                Ver todo <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/blog/${rel.slug}`}
                  className="group rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="h-32 overflow-hidden">
                    {rel.cover_url ? (
                      <img src={rel.cover_url} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-emerald-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-green-950 text-sm group-hover:text-emerald-700 transition-colors line-clamp-2">{rel.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
