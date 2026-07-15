import { Youtube, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface YouTubeWebinarsProps {
  channelId?: string;
  playlistId?: string;
  channelName?: string;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
}

const PLACEHOLDER_VIDEOS: Video[] = [
  { id: 'dQw4w9WgXcQ', title: 'Webinar: Introducción a la gobernanza de Internet', thumbnail: 'https://images.pexels.com/photos/2776222/pexels-photo-2776222.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'dQw4w9WgXcQ', title: 'Foro: Derechos digitales en Guatemala', thumbnail: 'https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { id: 'dQw4w9WgXcQ', title: 'Conversatorio: IA y sociedad civil', thumbnail: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

function buildEmbedUrl(playlistId?: string, channelId?: string) {
  if (playlistId) {
    return `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
  }
  if (channelId) {
    const id = channelId.startsWith('@') ? channelId : `UC${channelId.replace(/^UC/, '')}`;
    return `https://www.youtube.com/embed?listType=user_uploads&list=${id}`;
  }
  return '';
}

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
  const embedUrl = selected
    ? `https://www.youtube.com/embed/${selected.id}`
    : buildEmbedUrl(playlistId, channelId);
  const channelUrl = buildChannelUrl(channelId, playlistId);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white">
      {/* Player */}
      <div className="relative w-full bg-slate-900" style={{ aspectRatio: '16 / 9' }}>
        {hasConfig || selected ? (
          <iframe
            src={embedUrl}
            title={selected?.title ?? `Webinars — ${channelName}`}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-3">
              <Youtube className="w-7 h-7 text-red-600" />
            </div>
            <p className="text-slate-300 text-sm font-medium">Webinars anteriores</p>
            <p className="text-slate-400 text-xs mt-1 max-w-xs">
              Próximamente compartiremos aquí las grabaciones de nuestros webinars previos.
            </p>
          </div>
        )}
      </div>

      {/* Footer with channel link */}
      {hasConfig && channelUrl && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-600" />
            <span className="text-sm font-semibold text-blue-950">{channelName}</span>
          </div>
          <a
            href={channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
          >
            Ver canal
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Placeholder video list (shown when no channel configured yet) */}
      {!hasConfig && (
        <div className="p-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Webinars destacados
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PLACEHOLDER_VIDEOS.map((v) => (
              <button
                key={v.title}
                onClick={() => setSelected(v)}
                className="group text-left rounded-xl overflow-hidden border border-slate-100 hover:border-sky-200 hover:shadow-card transition-all"
              >
                <div className="relative h-24 overflow-hidden">
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-red-600 group-hover:bg-red-500 flex items-center justify-center shadow-lg transition-colors">
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-white ml-0.5" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-700 p-2.5 line-clamp-2 group-hover:text-sky-700 transition-colors">
                  {v.title}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
