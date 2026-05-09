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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
        <CardTitle className="text-xs font-medium text-gray-400 truncate">{title}</CardTitle>
        <div className={cn(
          "rounded-full p-1.5",
          type === 'income' && "bg-green-500/10 text-green-500",
          type === 'expense' && "bg-rose-500/10 text-rose-500",
          type === 'total' && "bg-[#f472b6]/10 text-[#f472b6]",
          type === 'savings' && "bg-[#c084fc]/10 text-[#c084fc]",
        )}>
          <Icon size={14} />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-lg font-bold font-mono text-[#f472b6] truncate">
          {formatCurrency(amount)}
        </div>
      </CardContent>
    </Card>
  );
}
