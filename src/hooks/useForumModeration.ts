import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, ForumCodeOfConductSection, ForumConductAcceptance } from '../lib/supabase';

/**
 * Loads the public code of conduct sections (active, ordered).
 */
export function useCodeOfConduct() {
  const [sections, setSections] = useState<ForumCodeOfConductSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from('forum_code_of_conduct')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (active) {
          setSections((data as ForumCodeOfConductSection[]) ?? []);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return { sections, loading };
}

/**
 * Tracks whether the current user has accepted the current version of the
 * code of conduct. Returns a recordConductAcceptance() helper that upserts
 * the acceptance row after registration.
 */
export function useConductAccepted() {
  const { user } = useAuth();
  const [accepted, setAccepted] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [loading, setLoading] = useState(true);

  const check = useCallback(() => {
    if (!user) {
      setAccepted(false);
      setLoading(false);
      return;
    }
    Promise.all([
      supabase.from('forum_conduct_meta').select('current_version').eq('id', 1).maybeSingle(),
      supabase.from('forum_conduct_acceptances').select('version, accepted_at').eq('user_id', user.id).maybeSingle(),
    ]).then(([metaRes, accRes]) => {
      const meta = metaRes.data as { current_version: number } | null;
      const acc = accRes.data as ForumConductAcceptance | null;
      const version = meta?.current_version ?? 1;
      setCurrentVersion(version);
      setAccepted(Boolean(acc) && acc!.version >= version);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    check();
  }, [check]);

  const recordConductAcceptance = useCallback(async () => {
    if (!user) return;
    await supabase
      .from('forum_conduct_acceptances')
      .upsert({ user_id: user.id, version: currentVersion }, { onConflict: 'user_id' });
    setAccepted(true);
  }, [user, currentVersion]);

  return { accepted, currentVersion, loading, recordConductAcceptance, recheck: check };
}

/**
 * Reports whether the current user is a forum moderator (row exists in
 * forum_admins). Public visitors and non-admin authenticated users both
 * return isAdmin=false.
 */
export function useForumAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    supabase
      .from('forum_admins')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin(Boolean(data));
        setLoading(false);
      });
  }, [user]);

  return { isAdmin, loading };
}

/**
 * Shared Spanish labels for report categories, used by both the public
 * report modal and the admin reports panel.
 */
export const REPORT_CATEGORY_LABELS: Record<string, string> = {
  discriminacion: 'Discriminación o exclusión',
  acoso: 'Acoso o hostigamiento',
  discurso_odio: 'Discurso de odio',
  spam: 'Spam o contenido comercial',
  ataques_personales: 'Ataques personales o insultos',
  desinformacion: 'Desinformación intencional',
  otro: 'Otro motivo',
};

export const REPORT_CATEGORIES = Object.keys(REPORT_CATEGORY_LABELS);
