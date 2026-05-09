// components/dashboard/RecentTransactions.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ShoppingCart, Utensils, Car, PartyPopper, Heart, Home, Briefcase, PlusCircle, MinusCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
  return (
    <Card className="border-[#f472b6]/10 bg-[#13131a]/80 backdrop-blur-sm shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-white">Dernières transactions</CardTitle>
        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#f472b6]/10 text-[#f472b6] border border-[#f472b6]/20">
          Activité récente
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {transactions.map((tx) => (
            <div 
              key={tx.id} 
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                  tx.type === 'income' ? "bg-emerald-500/10" : "bg-rose-500/10"
                )}>
                  {getCategoryIcon(tx.category || tx.label, tx.type)}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-white text-sm sm:text-base">{tx.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">{tx.category || 'Général'}</span>
                    <span className="text-[10px] text-gray-600">•</span>
                    <span className="text-[10px] text-gray-500 font-mono uppercase">
                      {new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className={cn(
                  "font-mono font-black text-sm sm:text-base flex items-center gap-1",
                  tx.type === 'income' ? "text-emerald-400" : "text-rose-400"
                )}>
                  {tx.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {formatCurrency(tx.amount)}
                </div>
                <span className="text-[10px] text-gray-600 font-medium">Confirmé</span>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
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
      </CardContent>
    </Card>
  );
}

// Helper icons (need to be imported correctly, adding PenLine for empty state)
import { PenLine } from 'lucide-react';

