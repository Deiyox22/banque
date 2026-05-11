'use client';

import { useState } from 'react';
import { useOptimistic, useTransition } from 'react';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, ShoppingCart, Utensils, Car, PartyPopper, Heart, Home, Briefcase, PlusCircle, MinusCircle, PenLine, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deleteTransaction } from '@/lib/actions/transactions';
import { toast } from 'sonner';
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
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
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

  const categories = Array.from(new Set(optimisticTransactions?.map(t => t.category).filter(Boolean)));

  const filtered = optimisticTransactions?.filter(tx => {
    let matchesDate = false;
    if (!tx.is_recurring) {
        const txDate = new Date(tx.date);
        matchesDate = txDate >= new Date(firstDay) && txDate < new Date(lastDay);
    } else {
        const startDate = new Date(tx.date);
        const endDate = tx.recurrence_end_date ? new Date(tx.recurrence_end_date) : null;
        matchesDate = startDate < new Date(lastDay) && (!endDate || endDate >= new Date(firstDay));
    }
    
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;

    return matchesDate && matchesType && matchesCategory;
  }) || [];

  const monthName = new Date(year, month - 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col gap-4 pb-24 px-1">
      <div className="flex flex-col gap-2">
        <div className="space-y-0">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-primary">Historique ✨</h1>
          <p className="text-muted-foreground font-semibold italic text-xs">Gère tes revenus et tes dépenses avec style.</p>
        </div>
        <MonthNavigation month={month} year={year} monthName={monthName} baseUrl="/transactions" />
      </div>

      <div className="flex flex-col gap-2 p-3 bg-white/50 rounded-2xl border border-primary/5">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary/60">
                <Filter size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Filtres</span>
            </div>
            <div className="flex gap-1">
                <Button 
                    variant={typeFilter === 'all' ? 'default' : 'secondary'}
                    size="sm"
                    className="h-7 rounded-lg text-[10px] font-bold"
                    onClick={() => setTypeFilter('all')}
                >
                    Tout
                </Button>
                <Button 
                    variant={typeFilter === 'income' ? 'default' : 'secondary'}
                    size="sm"
                    className="h-7 rounded-lg text-[10px] font-bold"
                    onClick={() => setTypeFilter('income')}
                >
                    +
                </Button>
                <Button 
                    variant={typeFilter === 'expense' ? 'default' : 'secondary'}
                    size="sm"
                    className="h-7 rounded-lg text-[10px] font-bold"
                    onClick={() => setTypeFilter('expense')}
                >
                    -
                </Button>
            </div>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 rounded-lg text-[11px] font-bold bg-white border-none shadow-sm">
                <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Card className={cn("rounded-3xl border-none shadow-soft overflow-hidden transition-opacity bg-white/30 backdrop-blur-md", isPending && "opacity-60")}>
          <CardHeader className="p-4 pb-1">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary/60">Journal des opérations</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-2">
              {filtered.map((tx) => (
                <div key={tx.id} className="flex items-center p-3 rounded-2xl bg-white/60 transition-all border-b border-rose-100 last:border-none group">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mr-3 transition-transform group-hover:scale-110",
                    tx.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {getCategoryIcon(tx.category || tx.label, tx.type)}
                  </div>
                  
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-bold text-foreground text-sm leading-tight break-words">{tx.label}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{tx.category || 'Général'}</span>
                  </div>

                  <div className={cn(
                    "font-black text-sm shrink-0 mx-2 tracking-tighter",
                    tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </div>
                  
                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className="text-[10px] font-medium text-muted-foreground/60">{new Date(tx.date).toLocaleDateString()}</span>
                    <div className="flex gap-0">
                        <TransactionModal mode="icon" transaction={tx} />
                        <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full" 
                        onClick={() => handleDelete(tx.id)}
                        >
                        <Trash2 size={16} />
                        </Button>
                    </div>
                  </div>
                </div>
              ))}
              {(!filtered || filtered.length === 0) && (
                <div className="py-12 text-center text-muted-foreground font-bold italic flex flex-col items-center gap-2 text-xs">
                  Aucune transaction. 🌸
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