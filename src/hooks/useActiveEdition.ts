import { useEffect, useState } from 'react';
import { supabase, EventEdition } from '../lib/supabase';

export function useActiveEdition() {
  const [edition, setEdition] = useState<EventEdition | null>(null);
  const [loading, setLoading] = useState(true);

  async function reload() {
    const { data } = await supabase
      .from('event_editions')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();
    setEdition(data as EventEdition | null);
    setLoading(false);
  }

  useEffect(() => { reload(); }, []);

  return { edition, loading, reload };
}
