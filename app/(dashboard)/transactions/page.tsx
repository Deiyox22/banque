// app/(dashboard)/transactions/page.tsx
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteTransaction } from '@/lib/actions/transactions';
import TransactionModal from '@/components/shared/TransactionModal';

export default async function TransactionsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('owner_id', user!.id)
    .order('date', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f472b6]">Transactions</h1>
          <p className="text-gray-400">Gérez l'ensemble de vos revenus et dépenses personnels.</p>
        </div>
      </div>

      <div className="grid gap-8">
        <Card className="border-[#f472b6]/10 bg-[#1a1122]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-400">Historique complet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions?.map((tx) => (
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
                      <form action={async () => {
                        'use server';
                        await deleteTransaction(tx.id);
                      }}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-rose-400">
                          <Trash2 size={16} />
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
              {(!transactions || transactions.length === 0) && (
                <div className="py-12 text-center text-gray-500 italic">
                  Aucune transaction trouvée.
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
