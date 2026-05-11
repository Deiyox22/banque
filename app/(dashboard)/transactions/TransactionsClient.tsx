'use client';

import { useOptimistic, useTransition } from 'react';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ShoppingCart, Utensils, Car, PartyPopper, Heart, Home, Briefcase, PlusCircle, MinusCircle, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { deleteTransaction } from '@/lib/actions/transactions';
import TransactionModal from '@/components/shared/TransactionModal';
import MonthNavigation from '@/components/shared/MonthNavigation';

const getCategoryIcon = (category: string, type: 'income' | 'expense') => {
  const cat = category.toLowerCase();
  if (type === 'income') return <PlusCircle size={18} className="text-emerald-600" />;
  
  if (cat.includes('course') || cat.includes('achat') || cat.includes('shopping')) return <ShoppingCart size={18} />;
  if (cat.includes('resto') || cat.includes('bouffe') || cat.includes('aliment')) return <Utensils size={18} />;
  if (cat.includes('transport') || cat.includes('voiture') || cat.includes('essence')) return <Car size={18} />;
  if (cat.includes('loisir') || cat.includes('fête') || cat.includes('sorti')) return <PartyPopper size={18} />;
  if (cat.includes('santé') || cat.includes('soin')) return <Heart size={18} />;
  if (cat.includes('loyer') || cat.includes('maison') || cat.includes('facture')) return <Home size={18} />;
  if (cat.includes('boulot') || cat.includes('travail') || cat.includes('salaire')) return <Briefcase size={18} />;
  
  return <MinusCircle size={18} className="text-rose-400" />;
};

export function TransactionsClient({ initialTransactions, month, year }: { initialTransactions: any[], month: number, year: number }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticTransactions, addOptimistic] = useOptimistic(
    initialTransactions,
    (state, idToDelete: string) => state.filter(t => t.id !== idToDelete)
  );

  const handleDelete = async (id: string) => {
    if (confirm('Es-tu sûre de vouloir supprimer cette transaction ? 🌸')) {
      startTransition(() => {
          addOptimistic(id);
      });
      await deleteTransaction(id);
      toast.success('Transaction supprimée. Le budget est à jour ! 🎀');
    }
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
    <div className="space-y-12 pb-32 px-1">
      <div className="flex flex-col gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-primary">Historique ✨</h1>
          <p className="text-muted-foreground font-semibold italic">Gère tes revenus et tes dépenses avec style.</p>
        </div>
        <MonthNavigation month={month} year={year} monthName={monthName} baseUrl="/transactions" />
      </div>

      <div className="grid gap-8">
        <Card className={cn("rounded-3xl border-none shadow-soft overflow-hidden transition-opacity bg-white/30 backdrop-blur-md", isPending && "opacity-60")}>
          <CardHeader className="p-6 sm:p-8 pb-4">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-primary/60">Journal des opérations</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-8 pt-0">
            <div className="space-y-3 sm:space-y-4">
              {filtered.map((tx) => (
                <div key={tx.id} className="flex items-center p-3 sm:p-4 rounded-2xl bg-white/60 transition-all border border-primary/5 hover:border-primary/20 group hover:shadow-sm">
                  <div className={cn(
                    "h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0 mr-3 sm:mr-4 transition-transform group-hover:scale-110",
                    tx.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {getCategoryIcon(tx.category || tx.label, tx.type)}
                  </div>
                  
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-bold text-foreground text-sm leading-tight tracking-tight break-words">{tx.label}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mt-0.5">{tx.category || 'Général'}</span>
                  </div>

                  <div className={cn(
                    "font-black text-sm sm:text-base shrink-0 mx-2 sm:mx-4 tracking-tighter",
                    tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                  
                  <div className="flex shrink-0 gap-0.5 sm:gap-1">
                    <TransactionModal mode="icon" transaction={tx} />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all" 
                      onClick={() => handleDelete(tx.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
              {(!filtered || filtered.length === 0) && (
                <div className="py-24 text-center text-muted-foreground font-bold italic flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-primary">
                    <PenLine size={32} />
                  </div>
                  Aucune transaction trouvée pour cette période. 🌸
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
