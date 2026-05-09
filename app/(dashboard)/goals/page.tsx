import { createClient } from '@/lib/supabase/server';
import GoalsClient from './GoalsClient';

export const dynamic = 'force-dynamic';

export default async function GoalsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: goals } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false });

  return <GoalsClient goals={goals || []} />;
}
