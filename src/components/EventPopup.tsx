import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, X, Sparkles } from 'lucide-react';
import { useActiveEdition } from '../hooks/useActiveEdition';

export default function EventPopup() {
  const { edition, loading } = useActiveEdition();
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  const year = edition?.year;
  const storageKey = `igf-event-popup-dismissed-${year}`;
  const registrationOpen = edition ? edition.registration_open : false;

  useEffect(() => {
    if (loading || !edition || !year) return;
    if (!registrationOpen) return;
    if (pathname.startsWith('/evento') || pathname.startsWith('/admin')) return;

    const dismissed = localStorage.getItem(storageKey) === 'true';
    if (dismissed) return;

    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [loading, edition, year, registrationOpen, pathname, storageKey]);

  function handleClose() {
    setVisible(false);
    if (year) localStorage.setItem(storageKey, 'true');
  }

  if (!visible || !edition) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-none">
      <div
        className="pointer-events-auto mx-auto max-w-2xl rounded-2xl shadow-2xl overflow-hidden popup-slide-up"
        style={{ background: 'linear-gradient(135deg, #1a3a6e 0%, #1565c0 50%, #0288d1 100%)' }}
      >
        <div className="relative flex flex-col sm:flex-row items-stretch">
          {/* Accent bar */}
          <div className="hidden sm:block w-1.5 bg-gradient-to-b from-sky-400 to-blue-500 flex-shrink-0" />

          {/* Content */}
          <div className="flex-1 px-5 py-5 sm:px-6 sm:py-5">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-11 h-11 rounded-xl bg-white/10 border border-white/15 items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-sky-300" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-400/15 border border-sky-400/25 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <span className="text-sky-200 text-[10px] font-semibold tracking-widest uppercase">Nueva edición</span>
                </div>

                <h3 className="text-white font-bold text-base sm:text-lg leading-tight mb-1">
                  IGF Guatemala {edition.year}
                </h3>

                {edition.lema && (
                  <p className="text-slate-300 text-xs sm:text-sm italic mb-2.5 line-clamp-1">
                    "{edition.lema}"
                  </p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-300 text-xs">
                  {edition.event_date && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                      {edition.event_date}
                    </span>
                  )}
                  {edition.event_location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                      {edition.event_location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 px-5 pb-5 sm:px-6 sm:pb-5 sm:pr-6 sm:flex-col sm:items-stretch sm:gap-2.5">
            <Link
              to="/evento#registro"
              onClick={handleClose}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm rounded-xl transition-all hover:scale-[1.02] shadow-lg whitespace-nowrap"
            >
              Registrarme <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleClose}
              aria-label="Cerrar"
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
