import { useEffect, useState } from 'react';
import { X, ShieldCheck, ScrollText, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { useCodeOfConduct } from '../../hooks/useForumModeration';
import { supabase } from '../../lib/supabase';

interface ForumConductModalProps {
  open: boolean;
  onClose: () => void;
  onAccepted?: () => void;
}

/**
 * Modal that presents the full code of conduct and asks the user to
 * explicitly accept it. Used both as the in-signup acceptance step and
 * as a re-acceptance prompt when the code is updated.
 */
export default function ForumConductModal({ open, onClose, onAccepted }: ForumConductModalProps) {
  const { sections, loading } = useCodeOfConduct();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setExpanded(sections[0]?.id ?? null);
      setError('');
    }
  }, [open, sections]);

  if (!open) return null;

  async function handleAccept() {
    setAccepting(true);
    setError('');
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // During registration there is no user yet — accept in-memory only.
    if (!user) {
      setAccepting(false);
      onAccepted?.();
      onClose();
      return;
    }
    const { data: meta } = await supabase
      .from('forum_conduct_meta')
      .select('current_version')
      .eq('id', 1)
      .maybeSingle();
    const version = (meta as { current_version: number } | null)?.current_version ?? 1;
    const { error: upsertError } = await supabase
      .from('forum_conduct_acceptances')
      .upsert({ user_id: user.id, version }, { onConflict: 'user_id' });
    setAccepting(false);
    if (upsertError) {
      setError('No se pudo registrar la aceptación. Inténtalo de nuevo.');
      return;
    }
    onAccepted?.();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-blue-700 to-sky-700 text-white flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold">Lineamientos de Respeto y Convivencia</h2>
          <p className="text-sky-100 text-sm mt-1">
            Para participar en el foro debes conocer y aceptar estos lineamientos.
            Buscan garantizar un espacio seguro, respetuoso y libre de discriminación.
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-10 text-slate-400 text-sm">Cargando lineamientos...</div>
          ) : (
            <div className="space-y-2">
              {sections.map((section, i) => {
                const isOpen = expanded === section.id;
                return (
                  <div key={section.id} className="rounded-xl border border-slate-200 overflow-hidden">
                    <button
                      onClick={() => setExpanded(isOpen ? null : section.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-md bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 font-bold text-xs">
                        {i + 1}
                      </span>
                      <span className="flex-1 font-semibold text-blue-950 text-sm">{section.title}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1">
                        <p className="text-slate-600 text-sm leading-relaxed">{section.body}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
            <ScrollText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 text-xs leading-relaxed">
              Al aceptar confirmas que leíste los lineamientos y te comprometes a respetarlos.
              El equipo de moderación puede ocultar o eliminar contenido que los infrinja, y
              suspender cuentas en caso de infracciones graves o reiteradas.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50">
          {error && (
            <p className="text-red-600 text-xs mb-2 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-red-500" /> {error}
            </p>
          )}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAccept}
              disabled={accepting || loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {accepting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Acepto los lineamientos
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
