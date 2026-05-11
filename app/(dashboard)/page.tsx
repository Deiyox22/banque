import { createClient } from '@/lib/supabase/server';
import { getDashboardData } from '@/lib/data/dashboard';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const awaitedSearchParams = await searchParams;

  const now = new Date();
  const month = parseInt(awaitedSearchParams.month || (now.getMonth() + 1).toString());
  const year = parseInt(awaitedSearchParams.year || now.getFullYear().toString());

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user!.id)
    .single();

  const displayName = profile?.display_name || 'Utilisateur';

  const initialData = await getDashboardData(user!.id, month, year);

  return <DashboardClient initialData={initialData} displayName={displayName} month={month} year={year} />;
}
