'use client';

import { useEffect } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import BalanceCard from '@/components/dashboard/BalanceCard';
import { Card } from '@/components/ui/card';
import SpendingChart from '@/components/dashboard/SpendingChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import MonthNavigation from '@/components/shared/MonthNavigation';

export default function DashboardClient({ initialData, displayName, month, year }: { initialData: any, displayName: string, month: number, year: number }) {
  const { setTransactions } = useVaultStore();

  useEffect(() => {
    if (initialData?.transactions) {
      setTransactions(initialData.transactions);
    }
  }, [initialData, setTransactions]);

  const transactions = initialData?.transactions || [];
  const totalIncome = initialData?.totalIncome || 0;
  const totalExpense = initialData?.totalExpense || 0;
  const balance = initialData?.balance || 0;
  const totalSavings = initialData?.totalSavings || 0;

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
                <SpendingChart transactions={transactions} />
            </Card>
            
            <RecentTransactions transactions={transactions} />
        </div>

        <div className="text-center pt-12 pb-8">
          <p className="text-[10px] font-bold text-muted-foreground/50 tracking-widest uppercase">{displayName} La Star ✨</p>
        </div>
      </>
    </div>
  );
}
