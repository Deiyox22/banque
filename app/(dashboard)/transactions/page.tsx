// app/(dashboard)/transactions/page.tsx
import { createClient } from '@/lib/supabase/server';
import { TransactionsClient } from './TransactionsClient';

export const dynamic = 'force-dynamic';

export default async function TransactionsPage({
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

  const { data: rawTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('owner_id', user!.id)
    .order('date', { ascending: false });

  return <TransactionsClient initialTransactions={rawTransactions || []} month={month} year={year} />;
}
