import { createClient } from '@/lib/supabase/server';
import BalanceCard from '@/components/dashboard/BalanceCard';
import { Card } from '@/components/ui/card';
import SpendingChart from '@/components/dashboard/SpendingChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import TransactionModal from '@/components/shared/TransactionModal';
import MonthNavigation from '@/components/shared/MonthNavigation';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

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

  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = month === 12 
    ? `${year + 1}-01-01` 
    : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user!.id)
    .single();

  const displayName = profile?.display_name || 'Utilisateur';

  // Fetching data for current month
  const { data: rawTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('owner_id', user!.id);

  // Logic to filter and expand recurring transactions
  const selectedDate = new Date(year, month - 1);
  const transactions = rawTransactions?.filter(tx => {
    if (!tx.is_recurring) {
        const txDate = new Date(tx.date);
        return txDate >= new Date(firstDay) && txDate < new Date(lastDay);
    }
    // For recurring: check if start date <= period end and (no end date or end date >= period start)
    const startDate = new Date(tx.date);
    const endDate = tx.recurrence_end_date ? new Date(tx.recurrence_end_date) : null;
    return startDate < new Date(lastDay) && (!endDate || endDate >= new Date(firstDay));
  }) || [];

  const { data: goals } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('owner_id', user!.id);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const balance = totalIncome - totalExpense;
  const totalSavings = goals?.reduce((acc, g) => acc + Number(g.current_amount), 0) || 0;

  const monthName = new Date(year, month - 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 pb-20 w-full overflow-hidden">
      <div className="flex flex-col gap-4 px-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f472b6]">Bonjour {displayName} ! ✨</h1>
        <MonthNavigation month={month} year={year} monthName={monthName} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <BalanceCard title="Solde" amount={balance} type="total" />
        <BalanceCard title="Revenus" amount={totalIncome} type="income" />
        <BalanceCard title="Dépenses" amount={totalExpense} type="expense" />
        <BalanceCard title="Économies" amount={totalSavings} type="savings" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <Card className="border-[#f472b6]/10 bg-[#13131a]/80 backdrop-blur-sm shadow-xl p-4">
                <h2 className="text-lg font-bold text-white mb-4">Répartition des dépenses</h2>
                <SpendingChart transactions={transactions || []} />
            </Card>
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <RecentTransactions transactions={transactions || []} />
        </Suspense>
      </div>

      <TransactionModal mode="fab" />
    </div>
  );
}
