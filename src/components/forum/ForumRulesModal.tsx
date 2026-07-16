import { useEffect, useState } from 'react';
import { X, ShieldCheck, ScrollText } from 'lucide-react';
import { supabase, ForumRule } from '../../lib/supabase';

interface ForumRulesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ForumRulesModal({ open, onClose }: ForumRulesModalProps) {
  const [rules, setRules] = useState<ForumRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase
      .from('forum_rules')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        setRules((data as ForumRule[]) ?? []);
        setLoading(false);
      });
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden">
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
          <h2 className="text-xl font-bold">Reglas de participación</h2>
          <p className="text-sky-100 text-sm mt-1">
            Normas para mantener un espacio seguro, respetuoso y constructivo.
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-10 text-slate-400 text-sm">Cargando reglas...</div>
          ) : rules.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">No hay reglas definidas.</div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule, i) => (
                <div key={rule.id} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-950 text-sm mb-1">{rule.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
            <ScrollText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-amber-800 text-xs leading-relaxed">
              La moderación no busca limitar la diversidad de opiniones, sino garantizar
              que el espacio sea seguro, respetuoso y útil para la construcción colectiva.
              El equipo del IGF Guatemala puede ocultar o eliminar contenido que infrinja estas normas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
