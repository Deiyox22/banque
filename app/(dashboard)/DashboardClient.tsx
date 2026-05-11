'use client';

import { useEffect } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import BalanceCard from '@/components/dashboard/BalanceCard';
import { Card } from '@/components/ui/card';
import SpendingChart from '@/components/dashboard/SpendingChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import MonthNavigation from '@/components/shared/MonthNavigation';
import { Loader2 } from 'lucide-react';

export default function DashboardClient({ initialData, displayName, month, year }: { initialData: any, displayName: string, month: number, year: number }) {
  const { transactions, isLoading, setTransactions, fetchTransactions } = useVaultStore();

    useEffect(() => {
      if (initialData && initialData.transactions) {
        setTransactions(initialData.transactions);
      } else {
        // If initialData is not available or empty, fetch transactions for the current month/year.
        // This fallback should ideally also handle recurring transaction generation if needed,
        // but for now, we prioritize using server-rendered initialData.
        fetchTransactions(month, year);
      }
    }, [month, year, fetchTransactions, initialData, setTransactions]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0) || 0;
  const balance = totalIncome - totalExpense;
  const totalSavings = initialData.totalSavings; 

  const monthName = new Date(year, month - 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4 pb-24 w-full overflow-hidden px-1">
      <div className="flex flex-col gap-2 px-1">
        <div className="space-y-0">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-primary">Coucou {displayName} ! ✨</h1>
          <p className="text-muted-foreground font-semibold text-xs">Prête à gérer ton budget ?</p>
        </div>
        <MonthNavigation month={month} year={year} monthName={monthName} />
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <BalanceCard title="Mon Solde" amount={balance} type="total" />
                <BalanceCard title="Revenus" amount={totalIncome} type="income" />
                <BalanceCard title="Dépenses" amount={totalExpense} type="expense" />
                <BalanceCard title="Épargne" amount={totalSavings} type="savings" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="rounded-3xl border-none shadow-soft p-4 bg-white/40 backdrop-blur-sm overflow-hidden">
                    <h2 className="text-sm font-black text-primary mb-2 tracking-tight">Répartition ✨</h2>
                    <SpendingChart transactions={transactions || []} />
                </Card>
                
                <RecentTransactions transactions={transactions || []} />
            </div>
        </>
      )}
    </div>
  );
}
