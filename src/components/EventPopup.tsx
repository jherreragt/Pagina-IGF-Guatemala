import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight, X, Sparkles, Clock } from 'lucide-react';
import { useActiveEdition } from '../hooks/useActiveEdition';

const EXIT_MS = 350;

export default function EventPopup() {
  const { edition, loading } = useActiveEdition();
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => closeBtnRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [visible]);

  function dismiss(persist = true) {
    if (closing) return;
    setClosing(true);
    if (persist && year) localStorage.setItem(storageKey, 'true');
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, EXIT_MS);
  }

  useEffect(() => {
    if (!visible) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, closing, year]);

  if (!visible || !edition) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:px-6 sm:pb-6">
      {/* Backdrop */}
      <div
        onClick={() => dismiss(false)}
        className={`absolute inset-0 bg-blue-950/40 backdrop-blur-[2px] transition-opacity duration-${EXIT_MS} ${
          closing ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden="true"
      />

      {/* Popup card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-popup-title"
        className={`relative w-full sm:max-w-2xl mx-4 mb-4 sm:mx-auto rounded-2xl shadow-2xl overflow-hidden ${
          closing ? 'popup-slide-down' : 'popup-slide-up'
        }`}
        style={{ background: 'linear-gradient(135deg, #1a3a6e 0%, #1565c0 50%, #0288d1 100%)' }}
      >
        {/* Decorative glow */}
        <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-sky-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-52 h-52 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-stretch">
          {/* Accent bar */}
          <div className="h-1 sm:h-auto sm:w-1.5 bg-gradient-to-r sm:bg-gradient-to-b from-sky-400 to-blue-500 flex-shrink-0" />

          {/* Content */}
          <div className="flex-1 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex w-11 h-11 rounded-xl bg-white/10 border border-white/15 items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-sky-300" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-400/15 border border-sky-400/25 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <span className="text-sky-200 text-[10px] font-semibold tracking-widest uppercase">Nueva edición</span>
                </div>

                <h3 id="event-popup-title" className="text-white font-bold text-base sm:text-lg leading-tight mb-1">
                  IGF Guatemala {edition.year}
                </h3>

                {edition.lema && (
                  <p className="text-slate-300 text-xs sm:text-sm italic mb-3 line-clamp-2">
                    "{edition.lema}"
                  </p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-slate-300 text-xs">
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
                  {edition.event_modality && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                      {edition.event_modality}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 px-5 pb-5 sm:px-6 sm:pb-6 sm:pr-6 sm:flex-col sm:items-stretch sm:gap-2.5">
            <Link
              to="/evento#registro"
              onClick={() => dismiss(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm rounded-xl transition-all hover:scale-[1.02] shadow-lg whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
            >
              Registrarme <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              ref={closeBtnRef}
              onClick={() => dismiss(true)}
              aria-label="Cerrar invitación"
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
