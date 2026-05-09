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
    <Card className="border-[#6366f1]/10 bg-[#13131a]">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-400">Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
              <div className="flex flex-col">
                <span className="font-medium text-white">{tx.label}</span>
                <span className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</span>
              </div>
              <div className={cn(
                "font-mono font-bold",
                tx.type === 'income' ? "text-green-400" : "text-red-400"
              )}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500">
              Aucune transaction pour le moment.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
