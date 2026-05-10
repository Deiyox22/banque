'use client';

import { useOptimistic, useTransition } from 'react';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteTransaction } from '@/lib/actions/transactions';
import TransactionModal from '@/components/shared/TransactionModal';
import MonthNavigation from '@/components/shared/MonthNavigation';

export function TransactionsClient({ initialTransactions, month, year }: { initialTransactions: any[], month: number, year: number }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticTransactions, addOptimistic] = useOptimistic(
    initialTransactions,
    (state, idToDelete: string) => state.filter(t => t.id !== idToDelete)
  );

  const handleDelete = async (id: string) => {
    startTransition(() => {
        addOptimistic(id);
    });
    await deleteTransaction(id);
  };

  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = month === 12 
    ? `${year + 1}-01-01` 
    : `${year}-${String(month + 1).padStart(2, '0')}-01`;

  const filtered = optimisticTransactions?.filter(tx => {
    if (!tx.is_recurring) {
        const txDate = new Date(tx.date);
        return txDate >= new Date(firstDay) && txDate < new Date(lastDay);
    }
    const startDate = new Date(tx.date);
    const endDate = tx.recurrence_end_date ? new Date(tx.recurrence_end_date) : null;
    return startDate < new Date(lastDay) && (!endDate || endDate >= new Date(firstDay));
  }) || [];

  const monthName = new Date(year, month - 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f472b6]">Transactions</h1>
          <p className="text-gray-400">Gérez l'ensemble de vos revenus et dépenses personnels.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <MonthNavigation month={month} year={year} monthName={monthName} baseUrl="/transactions" />
      </div>

      <div className="grid gap-8">
        <Card className={cn("border-[#f472b6]/10 bg-[#1a1122] transition-opacity", isPending && "opacity-60")}>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-400">Historique mensuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filtered.map((tx) => (
                <div key={tx.id} className="flex flex-col p-4 rounded-2xl bg-[#1a1122]/50 border border-white/[0.08] shadow-sm transition-all hover:border-[#f472b6]/30 w-full gap-2">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={cn(
                        "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0",
                        tx.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {tx.type === 'income' ? '+' : '-'}
                      </div>
                      <div className="flex flex-col min-w-0 overflow-hidden">
                        <span className="font-bold text-white text-sm truncate">{tx.label}</span>
                        <span className="text-[11px] text-gray-500 truncate">{tx.category}</span>
                      </div>
                    </div>
                    <div className={cn(
                      "font-mono font-black text-sm shrink-0",
                      tx.type === 'income' ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between w-full border-t border-white/5 pt-2">
                    <span className="text-[10px] text-gray-500 font-mono uppercase">{new Date(tx.date).toLocaleDateString()}</span>
                    <div className="flex">
                      <TransactionModal mode="icon" transaction={tx} />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-rose-400" onClick={() => handleDelete(tx.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {(!filtered || filtered.length === 0) && (
                <div className="py-12 text-center text-gray-500 italic">
                  Aucune transaction trouvée pour cette période.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <TransactionModal mode="fab" />
    </div>
  );
}
