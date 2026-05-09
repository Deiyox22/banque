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
    <Card className="border-[#f472b6]/10 bg-[#1a1122]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        <div className={cn(
          "rounded-full p-2",
          type === 'income' && "bg-green-500/10 text-green-500",
          type === 'expense' && "bg-rose-500/10 text-rose-500",
          type === 'total' && "bg-[#f472b6]/10 text-[#f472b6]",
          type === 'savings' && "bg-[#c084fc]/10 text-[#c084fc]",
        )}>
          <Icon size={18} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono text-[#f472b6]">
          {formatCurrency(amount)}
        </div>
      </CardContent>
    </Card>
  );
}
