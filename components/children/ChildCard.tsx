// components/children/ChildCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

interface ChildCardProps {
  id: string;
  name: string;
  balance: number;
  monthly_limit?: number;
  avatar_color: string;
  isOwner: boolean;
}

export default function ChildCard({ id, name, balance, monthly_limit, avatar_color, isOwner }: ChildCardProps) {
  const percentage = monthly_limit ? (balance / monthly_limit) * 100 : 0;
  
  return (
    <Link href={`/children/${id}`}>
      <Card className="overflow-hidden border-[#f472b6]/10 bg-[#1a1122] transition-all hover:border-[#f472b6]/40">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div 
            className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-black/20"
            style={{ backgroundColor: avatar_color }}
          >
            {name.charAt(0)}
          </div>
          <div>
            <CardTitle className="text-lg font-bold">{name}</CardTitle>
            <p className="text-xs text-gray-500">{isOwner ? 'Propriétaire' : 'Invité'}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <span className="text-2xl font-bold font-mono text-[#f472b6]">{formatCurrency(balance)}</span>
            {monthly_limit && (
              <span className="text-sm text-gray-500 ml-2">/ {formatCurrency(monthly_limit)}</span>
            )}
          </div>
          
          {monthly_limit && (
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-400 uppercase font-bold">
                <span>Dépenses</span>
                <span>{Math.round(percentage)}%</span>
              </div>
              <Progress value={percentage} className="h-2" indicatorColor={percentage > 90 ? 'bg-rose-500' : 'bg-[#c084fc]'} />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
