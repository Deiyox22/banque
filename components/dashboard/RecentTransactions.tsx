// components/dashboard/RecentTransactions.tsx
import { Link } from 'next-view-transitions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ShoppingCart, Utensils, Car, PartyPopper, Heart, Home, Briefcase, PlusCircle, MinusCircle, PenLine, Trash2, ArrowRight } from 'lucide-react';
import TransactionModal from '@/components/shared/TransactionModal';
import { Button } from '@/components/ui/button';
import { deleteTransaction } from '@/lib/actions/transactions';

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
  if (type === 'income') return <PlusCircle size={18} className="text-emerald-500" />;
  
  if (cat.includes('course') || cat.includes('achat') || cat.includes('shopping')) return <ShoppingCart size={18} />;
  if (cat.includes('resto') || cat.includes('bouffe') || cat.includes('aliment')) return <Utensils size={18} />;
  if (cat.includes('transport') || cat.includes('voiture') || cat.includes('essence')) return <Car size={18} />;
  if (cat.includes('loisir') || cat.includes('fête') || cat.includes('sorti')) return <PartyPopper size={18} />;
  if (cat.includes('santé') || cat.includes('soin')) return <Heart size={18} />;
  if (cat.includes('loyer') || cat.includes('maison') || cat.includes('facture')) return <Home size={18} />;
  if (cat.includes('boulot') || cat.includes('travail') || cat.includes('salaire')) return <Briefcase size={18} />;
  
  return <MinusCircle size={18} className="text-rose-500" />;
};

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <Card className="border-[#f472b6]/10 bg-[#13131a]/80 backdrop-blur-sm shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-white">Dernières transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {recent.map((tx) => (
            <div 
              key={tx.id} 
              className="flex flex-col p-4 rounded-2xl bg-[#1a1122]/50 border border-white/[0.08] shadow-sm transition-all hover:border-[#f472b6]/30 w-full gap-2"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={cn(
                    "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0",
                    tx.type === 'income' ? "bg-emerald-500/10" : "bg-rose-500/10"
                    )}>
                    {getCategoryIcon(tx.category || tx.label, tx.type)}
                    </div>
                    <div className="flex flex-col min-w-0 overflow-hidden">
                        <span className="font-bold text-white text-sm truncate">{tx.label}</span>
                        <span className="text-[11px] text-gray-500 truncate">{tx.category || 'Général'}</span>
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
                <span className="text-[10px] text-gray-500 font-mono uppercase">
                    {new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                </span>
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
          {recent.length === 0 && (
            <div className="py-12 text-center flex flex-col items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
                <PenLine size={24} />
              </div>
              <p className="text-sm text-gray-500 italic max-w-[200px]">
                Votre VAULT est vide. Commencez par ajouter une transaction.
              </p>
            </div>
          )}
        </div>
        <Button variant="ghost" className="w-full mt-4 text-xs text-gray-400 hover:text-[#f472b6] hover:bg-transparent" asChild>
            <Link href="/transactions">Voir l'historique complet <ArrowRight size={14} className="ml-1" /></Link>
        </Button>
      </CardContent>
    </Card>
  );
}
