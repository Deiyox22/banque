// components/dashboard/BalanceCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  title: string;
  amount: number;
  type?: 'income' | 'expense' | 'total' | 'savings';
}

export default function BalanceCard({ title, amount, type = 'total' }: BalanceCardProps) {
  const icons = {
    total: Wallet,
    income: TrendingUp,
    expense: TrendingDown,
    savings: TrendingUp,
  };

  const Icon = icons[type];

  return (
    <Card className="rounded-2xl border border-primary/10 shadow-lg shadow-black/5 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-primary/10 relative bg-secondary/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-1">
        <CardTitle className="text-[10px] font-black text-rose-500 tracking-widest uppercase">{title}</CardTitle>
        <div className={cn(
          "rounded-xl p-2 bg-white shadow-sm",
          type === 'income' && "text-emerald-600",
          type === 'expense' && "text-rose-600",
          type === 'total' && "text-primary",
          type === 'savings' && "text-secondary-foreground",
        )}>
          <Icon size={14} strokeWidth={3} />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="text-xl font-black text-foreground tracking-tighter">
          {formatCurrency(amount)}
        </div>
      </CardContent>
    </Card>
  );
}
