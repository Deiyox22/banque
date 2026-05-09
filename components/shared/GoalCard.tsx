// components/shared/GoalCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
  
  return (
    <Card className="border-[#f472b6]/10 bg-[#1a1122]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full shadow-[0_0_10px_rgba(244,114,182,0.5)]" style={{ backgroundColor: color }} />
          <CardTitle className="text-lg font-bold">{name}</CardTitle>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onAddSavings(id)}
          className="h-8 w-8 text-[#f472b6] hover:bg-[#f472b6]/10"
        >
          <Plus size={18} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-end gap-1">
            <span className="text-2xl font-bold font-mono text-[#f472b6]">{formatCurrency(current_amount)}</span>
            <span className="text-sm text-gray-500 mb-1">sur {formatCurrency(target_amount)}</span>
          </div>
          {deadline && (
            <p className="text-xs text-gray-500 mt-1">
              Échéance : {new Date(deadline).toLocaleDateString()}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Progression</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <Progress value={percentage} className="h-2" indicatorColor={`bg-[${color}]`} />
        </div>
      </CardContent>
    </Card>
  );
}
