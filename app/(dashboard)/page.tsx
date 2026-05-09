// app/(dashboard)/page.tsx
import { createClient } from '@/lib/supabase/server';
import BalanceCard from '@/components/dashboard/BalanceCard';
import SpendingDonut from '@/components/dashboard/SpendingDonut';
import BalanceLine from '@/components/dashboard/BalanceLine';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import TransactionModal from '@/components/shared/TransactionModal';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user!.id)
    .single();

  const displayName = profile?.display_name || 'Utilisateur';

  // Fetching real data
  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('owner_id', user!.id)
    .order('date', { ascending: false })
    .limit(5);

  const { data: allTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('owner_id', user!.id);

  const { data: goals } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('owner_id', user!.id);

  // Simple calculations for the demo
  const totalIncome = allTransactions?.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const totalExpense = allTransactions?.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const balance = totalIncome - totalExpense;
  const totalSavings = goals?.reduce((acc, g) => acc + Number(g.current_amount), 0) || 0;

  // Mock data for charts (would be calculated from real data in production)
  const donutData = [
    { name: 'Logement', value: 850, color: '#f472b6' },
    { name: 'Alimentation', value: 450, color: '#c084fc' },
    { name: 'Transport', value: 200, color: '#60a5fa' },
    { name: 'Loisirs', value: 150, color: '#fbbf24' },
  ];

  const lineData = [
    { date: 'Jan', balance: 2500 },
    { date: 'Feb', balance: 2800 },
    { date: 'Mar', balance: 2600 },
    { date: 'Apr', balance: 3100 },
    { date: 'May', balance: 3400 },
    { date: 'Jun', balance: 3800 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f472b6]">Bonjour {displayName} ! ✨</h1>
          <p className="text-gray-400">Voici l'état de vos finances aujourd'hui.</p>
        </div>
        <TransactionModal mode="button" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BalanceCard title="Solde Total" amount={balance} type="total" />
        <BalanceCard title="Revenus" amount={totalIncome} type="income" />
        <BalanceCard title="Dépenses" amount={totalExpense} type="expense" />
        <BalanceCard title="Économies" amount={totalSavings} type="savings" />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <BalanceLine data={lineData} />
        <SpendingDonut data={donutData} />
      </div>

      <div className="grid gap-8">
        <RecentTransactions transactions={transactions || []} />
      </div>

      {/* Bouton flottant mobile Modal */}
      <TransactionModal mode="fab" />
    </div>
  );
}
