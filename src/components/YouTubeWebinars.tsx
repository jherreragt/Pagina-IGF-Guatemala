import { useEffect, useState, useMemo } from 'react';
import { Youtube, ExternalLink, X, Play } from 'lucide-react';
import { supabase, YouTubeVideo } from '../lib/supabase';

interface YouTubeWebinarsProps {
  channelId?: string;
  playlistId?: string;
  channelName?: string;
}

function buildChannelUrl(channelId?: string, playlistId?: string) {
  if (playlistId) return `https://www.youtube.com/playlist?list=${playlistId}`;
  if (channelId) {
    return channelId.startsWith('http')
      ? channelId
      : channelId.startsWith('@')
        ? `https://www.youtube.com/${channelId}`
        : `https://www.youtube.com/channel/${channelId}`;
  }
  return '';
}

function getThumbnail(video: YouTubeVideo): string {
  if (video.thumbnail_url) return video.thumbnail_url;
  return `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`;
}

export default function YouTubeWebinars({
  channelId,
  playlistId,
  channelName = 'IGF Guatemala',
}: YouTubeWebinarsProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selected, setSelected] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('Todos');

  useEffect(() => {
    supabase
      .from('youtube_videos')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setVideos(data as YouTubeVideo[]);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(videos.map((v) => v.category)));
    return ['Todos', ...cats];
  }, [videos]);

  const filtered = useMemo(() => {
    if (activeCat === 'Todos') return videos;
    return videos.filter((v) => v.category === activeCat);
  }, [videos, activeCat]);

  const hasConfig = Boolean(channelId || playlistId);
  const channelUrl = buildChannelUrl(channelId, playlistId);

  if (!loading && videos.length === 0) return null;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="section-label">
              <span className="w-5 h-px bg-sky-500" />
              Multimedia
            </p>
            <h2 className="section-title text-4xl sm:text-5xl">Webinars y videos</h2>
            <p className="text-slate-500 text-[15px] mt-3 max-w-xl">
              Revive las conversaciones, paneles y webinars del IGF Guatemala sobre gobernanza de Internet.
            </p>
          </div>
          {hasConfig && channelUrl && (
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-all hover:scale-[1.02] shadow-md shadow-red-500/20"
            >
              <Youtube className="w-4 h-4" />
              Ver canal completo
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Category filters */}
        {!loading && categories.length > 2 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCat === cat
                    ? 'bg-sky-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:text-sky-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 animate-pulse">
                <div className="h-48 bg-slate-200" />
                <div className="p-5 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <Youtube className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No hay videos en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((video) => (
              <button
                key={video.id}
                onClick={() => setSelected(video)}
                className="group text-left rounded-2xl overflow-hidden bg-white border border-slate-100 hover:border-sky-200 hover:shadow-card-hover transition-all hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getThumbnail(video)}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-red-600 group-hover:bg-red-500 group-hover:scale-110 flex items-center justify-center shadow-xl transition-all duration-300">
                      <Play className="w-6 h-6 text-white ml-0.5 fill-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <Youtube className="w-4 h-4 text-white" />
                    <span className="text-white text-xs font-semibold">{video.category}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-blue-950 text-[15px] leading-snug group-hover:text-sky-700 transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-slate-500 text-sm mt-2 line-clamp-2 leading-relaxed">{video.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-4xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="relative w-full bg-black" style={{ aspectRatio: '16 / 9' }}>
              <iframe
                src={`https://www.youtube.com/embed/${selected.youtube_id}?autoplay=1`}
                title={selected.title}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Youtube className="w-5 h-5 text-red-600" />
                <span className="text-slate-300 text-sm font-semibold">{selected.category}</span>
              </div>
              <h3 className="text-white font-bold text-lg">{selected.title}</h3>
              {selected.description && (
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">{selected.description}</p>
              )}
              <a
                href={`https://www.youtube.com/watch?v=${selected.youtube_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 text-sm font-medium mt-3 transition-colors"
              >
                Ver en YouTube
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
