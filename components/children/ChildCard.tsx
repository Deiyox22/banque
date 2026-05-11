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
      <Card className="rounded-3xl border-none shadow-soft overflow-hidden bg-white/40 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-glow/10 group p-2">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <div 
            className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-sm group-hover:rotate-6 transition-transform"
            style={{ backgroundColor: avatar_color }}
          >
            {name.charAt(0)}
          </div>
          <div>
            <CardTitle className="text-xl font-black text-primary tracking-tight">{name}</CardTitle>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{isOwner ? 'Propriétaire ✨' : 'Invité 🌸'}</p>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <div className="mb-6 flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(balance)}</span>
            {monthly_limit && (
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">/ {formatCurrency(monthly_limit)}</span>
            )}
          </div>
          
          {monthly_limit && (
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary/70">
                <span>Dépenses mensuelles</span>
                <span>{Math.round(percentage)}%</span>
              </div>
              <Progress value={percentage} className="h-3 rounded-full bg-secondary/50 overflow-hidden" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
