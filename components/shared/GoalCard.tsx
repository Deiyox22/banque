// components/shared/GoalCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import WithdrawModal from './WithdrawModal';
import { deleteGoal } from '@/lib/actions/goals';

interface GoalCardProps {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  color: string;
  onAddSavings: (id: string) => void;
}

export default function GoalCard({ 
  id, 
  name, 
  target_amount, 
  current_amount, 
  deadline, 
  color,
  onAddSavings 
}: GoalCardProps) {
  const percentage = Math.min((current_amount / target_amount) * 100, 100);

  const handleDelete = async () => {
    if (confirm(`Es-tu sûre de vouloir supprimer ton rêve "${name}" ? 🌸`)) {
      await deleteGoal(id);
      toast.success('Objectif supprimé. N\'oublie pas d\'en créer de nouveaux ! 🎀');
    }
  };

  return (
    <Card className="rounded-3xl border-none shadow-soft overflow-hidden bg-white/40 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-glow/10 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 rounded-full shadow-sm animate-pulse" style={{ backgroundColor: color }} />
          <CardTitle className="text-xl font-black text-primary tracking-tight">{name}</CardTitle>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <WithdrawModal id={id} name={name} />
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onAddSavings(id)}
                className="h-9 w-9 text-primary hover:bg-primary/10 rounded-full"
            >
                <Plus size={20} strokeWidth={3} />
            </Button>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDelete}
                className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-full"
            >
                <Trash2 size={18} />
            </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(current_amount)}</span>
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">/ {formatCurrency(target_amount)}</span>
          </div>
          {deadline && (
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1">
              Échéance : {new Date(deadline).toLocaleDateString()}
            </p>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary/70">
            <span>Progression ✨</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <Progress value={percentage} className="h-3 rounded-full bg-secondary/50 overflow-hidden" />
        </div>

        <Button 
            onClick={() => onAddSavings(id)}
            className="w-full mt-6 bg-primary/10 text-primary hover:bg-primary hover:text-white font-black rounded-2xl py-6 transition-all border border-primary/5"
        >
            <Plus size={18} className="mr-2" strokeWidth={3} />
            Épargner
        </Button>
      </CardContent>
    </Card>
  );
}
