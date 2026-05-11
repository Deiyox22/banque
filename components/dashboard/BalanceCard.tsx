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
    <Card className="rounded-3xl border-none shadow-soft overflow-hidden transition-all hover:scale-[1.02] hover:shadow-glow/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
        <CardTitle className="text-sm font-black text-primary/80 tracking-tight uppercase">{title}</CardTitle>
        <div className={cn(
          "rounded-2xl p-2.5",
          type === 'income' && "bg-emerald-50 text-emerald-500",
          type === 'expense' && "bg-rose-50 text-rose-500",
          type === 'total' && "bg-primary/10 text-primary",
          type === 'savings' && "bg-secondary text-secondary-foreground",
        )}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        <div className="text-2xl font-black text-foreground tracking-tighter">
          {formatCurrency(amount)}
        </div>
      </CardContent>
    </Card>
  );
}
