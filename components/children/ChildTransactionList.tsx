// components/children/ChildTransactionList.tsx
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Transaction {
  id: string;
  label: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category?: string;
}

interface ChildTransactionListProps {
  transactions: Transaction[];
}

export default function ChildTransactionList({ transactions }: ChildTransactionListProps) {
  return (
    <Card className="rounded-3xl border-none shadow-soft overflow-hidden bg-white/40 backdrop-blur-sm">
      <CardHeader className="p-6 pb-2">
        <CardTitle className="text-xs font-black uppercase tracking-widest text-primary/60">Journal des transactions ✨</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/50 border border-primary/5 transition-all hover:border-primary/20 group">
              <div className="flex flex-col min-w-0 mr-3">
                <span className="font-bold text-foreground text-sm leading-tight tracking-tight break-words">{tx.label}</span>
                import { formatDate } from '@/lib/utils';
// ...
<span className="text-[10px] font-black uppercase tracking-widest text-primary/40 mt-1">{formatDate(tx.date)}</span>
              </div>
              <div className={cn(
                "font-black text-sm sm:text-base shrink-0 tracking-tighter",
                tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
              )}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="py-12 text-center text-sm font-bold text-muted-foreground/60 italic">
              Aucune transaction pour le moment. 🌸
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
