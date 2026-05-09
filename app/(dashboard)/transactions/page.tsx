// app/(dashboard)/transactions/page.tsx
import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TransactionForm from '@/components/shared/TransactionForm';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteTransaction } from '@/lib/actions/transactions';

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#f472b6]">Transactions</h1>
        <p className="text-gray-400">Gérez l'ensemble de vos revenus et dépenses personnels.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-[#f472b6]/10 bg-[#1a1122]">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-400">Historique complet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions?.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <div className="flex gap-4 items-center">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold",
                        tx.type === 'income' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {tx.type === 'income' ? '+' : '-'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{tx.label}</span>
                        <span className="text-xs text-gray-500">{tx.category} • {new Date(tx.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "font-mono font-bold",
                        tx.type === 'income' ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
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

        <div className="space-y-8">
          <Card className="border-[#f472b6]/10 bg-[#1a1122]">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Ajouter</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
