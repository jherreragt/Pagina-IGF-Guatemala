import { useState } from 'react';
import { Youtube, ExternalLink, X, Play } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
}

interface YouTubeWebinarsProps {
  channelId?: string;
  playlistId?: string;
  channelName?: string;
}

const PLACEHOLDER_VIDEOS: Video[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Webinar: Introducción a la gobernanza de Internet',
    thumbnail: 'https://images.pexels.com/photos/2776222/pexels-photo-2776222.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Foro: Derechos digitales en Guatemala',
    thumbnail: 'https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'dQw4w9WgXcQ',
    title: 'Conversatorio: IA y sociedad civil',
    thumbnail: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
];

function buildChannelUrl(channelId?: string, playlistId?: string) {
  if (playlistId) return `https://www.youtube.com/playlist?list=${playlistId}`;
  if (channelId) {
    return channelId.startsWith('@')
      ? `https://www.youtube.com/${channelId}`
      : `https://www.youtube.com/channel/${channelId}`;
  }
  return '';
}

export default function YouTubeWebinars({
  channelId,
  playlistId,
  channelName = 'IGF Guatemala',
}: YouTubeWebinarsProps) {
  const [selected, setSelected] = useState<Video | null>(null);

  const hasConfig = Boolean(channelId || playlistId);
  const channelUrl = buildChannelUrl(channelId, playlistId);
  const videos = PLACEHOLDER_VIDEOS;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="section-label">
              <span className="w-5 h-px bg-sky-500" />
              Multimedia
            </p>
            <h2 className="section-title text-4xl sm:text-5xl">Webinars y videos previos</h2>
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

        {/* Video grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <button
              key={video.title}
              onClick={() => setSelected(video)}
              className="group text-left rounded-2xl overflow-hidden bg-white border border-slate-100 hover:border-sky-200 hover:shadow-card-hover transition-all hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-red-600 group-hover:bg-red-500 group-hover:scale-110 flex items-center justify-center shadow-xl transition-all duration-300">
                    <Play className="w-6 h-6 text-white ml-0.5 fill-white" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-semibold">{channelName}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-blue-950 text-[15px] leading-snug group-hover:text-sky-700 transition-colors line-clamp-2">
                  {video.title}
                </h3>
              </div>
            </button>
          ))}
        </div>

        {!hasConfig && (
          <div className="mt-8 text-center">
            <a
              href="https://www.youtube.com/@IGFGuatemala"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-semibold transition-colors"
            >
              <Youtube className="w-4 h-4" />
              Visitar canal de YouTube
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Modal player */}
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
                src={`https://www.youtube.com/embed/${selected.id}?autoplay=1`}
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
                <span className="text-slate-300 text-sm font-semibold">{channelName}</span>
              </div>
              <h3 className="text-white font-bold text-lg">{selected.title}</h3>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
