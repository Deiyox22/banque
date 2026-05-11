'use client';

import { Link } from 'next-view-transitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ShoppingCart, Utensils, Car, PartyPopper, Heart, Home, Briefcase, PlusCircle, MinusCircle, PenLine, Trash2, ArrowRight } from 'lucide-react';
import TransactionModal from '@/components/shared/TransactionModal';
import { Button } from '@/components/ui/button';
import { deleteTransaction } from '@/lib/actions/transactions';
import { useVaultStore } from '@/store/useVaultStore';
import { toast } from 'sonner';
import { useState } from 'react';
import DeleteConfirmationModal from '@/components/shared/DeleteConfirmationModal';

interface Transaction {
  id: string;
  label: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

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

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const deleteLocalTransaction = useVaultStore((state) => state.deleteLocalTransaction);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const handleDelete = async (id: string) => {
      deleteLocalTransaction(id);
      await deleteTransaction(id);
      toast.success('Hop ! Disparue. ✨');
  };

  return (
    <Card className="rounded-3xl border-none shadow-soft overflow-hidden bg-white/30 backdrop-blur-md">
      <DeleteConfirmationModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={() => deleteId && handleDelete(deleteId)} 
      />
      <CardHeader className="flex flex-row items-center justify-between p-5 sm:p-6 pb-2">
        <CardTitle className="text-xl font-black text-primary tracking-tight">Activités</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <div className="space-y-3">
          {recent.map((tx) => (
            <div 
              key={tx.id} 
              className="flex items-center p-3 sm:p-4 rounded-2xl bg-white/60 transition-all border-b border-rose-100 last:border-none group"
            >
                <div className={cn(
                    "h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0 mr-3 sm:mr-4 transition-transform group-hover:scale-110",
                    tx.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                {getCategoryIcon(tx.category || tx.label, tx.type)}
                </div>
                
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-bold text-foreground text-sm leading-tight tracking-tight">{tx.label}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mt-0.5">{tx.category || 'Général'}</span>
                </div>

                <div className={cn(
                    "font-black text-sm sm:text-base shrink-0 mx-2 sm:mx-3 tracking-tighter",
                    tx.type === 'income' ? "text-emerald-600" : "text-rose-600"
                )}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
                
                <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className="text-[10px] font-medium text-muted-foreground/60">{new Date(tx.date).toLocaleDateString()}</span>
                    <div className="flex gap-0.5 sm:gap-1">
                        <TransactionModal mode="icon" transaction={tx} />
                        <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={() => setDeleteId(tx.id)}
                        >
                        <Trash2 size={16} />
                        </Button>
                    </div>
                </div>
            </div>
          ))}
          {recent.length === 0 && (
            <div className="py-12 text-center flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-primary">
                <PenLine size={32} />
              </div>
              <p className="text-sm font-semibold text-muted-foreground italic max-w-[200px]">
                Votre VAULT est vide. Commencez par ajouter une transaction.
              </p>
            </div>
          )}
        </div>
        <Button variant="ghost" className="w-full mt-6 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl py-6" asChild>
            <Link href="/transactions">Historique complet <ArrowRight size={14} className="ml-2" strokeWidth={3} /></Link>
        </Button>
      </CardContent>
    </Card>
  );
}
