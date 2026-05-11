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
    <div className="space-y-10 pb-32 w-full overflow-hidden px-1">
      <div className="flex flex-col gap-6 px-1">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-primary">Coucou {displayName} ! ✨</h1>
          <p className="text-muted-foreground font-semibold">Prête à gérer ton budget ?</p>
        </div>
        <MonthNavigation month={month} year={year} monthName={monthName} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BalanceCard title="Mon Solde" amount={balance} type="total" />
        <BalanceCard title="Revenus" amount={totalIncome} type="income" />
        <BalanceCard title="Dépenses" amount={totalExpense} type="expense" />
        <BalanceCard title="Épargne" amount={totalSavings} type="savings" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-80 w-full rounded-3xl" />}>
            <Card className="rounded-3xl border-none shadow-soft p-8 bg-white/40 backdrop-blur-sm overflow-hidden">
                <h2 className="text-xl font-black text-primary mb-6 tracking-tight">Répartition ✨</h2>
                <SpendingChart transactions={transactions || []} />
            </Card>
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-80 w-full rounded-3xl" />}>
            <RecentTransactions transactions={transactions || []} />
        </Suspense>
      </div>
    </div>
  );
}
