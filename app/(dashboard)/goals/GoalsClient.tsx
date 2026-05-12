'use client';

import { useState, useEffect } from 'react';
import GoalCard from '@/components/shared/GoalCard';
import AddSavingsModal from '@/components/shared/AddSavingsModal';
import GoalModal from '@/components/shared/GoalModal';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVaultStore } from '@/store/useVaultStore';
import { createTransaction } from '@/lib/actions/transactions';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function GoalsClient({ goals: initialGoals }: { goals: any[] }) {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [monthlySavings, setMonthlySavings] = useState(100);
  const [isPlanning, setIsPlanning] = useState(false);
  const displayName = useVaultStore((state) => state.displayName);

  useEffect(() => setMounted(true), []);

  const handlePlan = async (goal: any, amount: number) => {
    setIsPlanning(true);
    try {
        await createTransaction({
            label: `Épargne: ${goal.name}`,
            amount: amount,
            type: 'expense',
            category: 'Économies',
            recurrence_type: 'monthly',
            date: new Date().toISOString().split('T')[0]
        });
        toast.success(`Épargne de ${amount}€ planifiée pour ${goal.name} ! ✨`);
    } catch (e) {
        toast.error('Erreur lors de la planification.');
    } finally {
        setIsPlanning(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-primary">Mes Rêves ✨</h1>
          <p className="text-muted-foreground font-semibold italic">Suis tes progrès et réalise tes projets !</p>
        </div>
        <GoalModal />
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 px-1">
        {initialGoals?.map((goal) => (
          <GoalCard 
            key={goal.id}
            id={goal.id}
            name={goal.name}
            target_amount={goal.target_amount}
            current_amount={goal.current_amount}
            deadline={goal.deadline}
            color={goal.color}
            onAddSavings={(id) => setSelectedGoalId(id)}
          />
        ))}

        {(!initialGoals || initialGoals.length === 0) && (
          <div className="col-span-full py-24 text-center rounded-3xl border-4 border-dashed border-primary/10 bg-white/40 backdrop-blur-sm">
            <p className="text-muted-foreground font-bold italic">Tu n'as pas encore d'objectifs. Ajoute ton premier rêve ! 🌸</p>
          </div>
        )}
      </div>

      {/* Simulateur d'épargne */}
      <Card className="rounded-3xl border-none shadow-soft p-6 bg-white/40 backdrop-blur-sm">
        <h2 className="text-xl font-black text-primary mb-4 tracking-tight">Simulateur d'épargne 💡</h2>
        <div className="grid md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3">
                <Label className="text-sm font-bold text-primary/70">Combien pouvez-vous épargner par mois ?</Label>
                <Input 
                    type="number" 
                    value={monthlySavings} 
                    onChange={(e) => setMonthlySavings(Number(e.target.value))}
                    className="h-12 bg-white rounded-2xl font-black"
                />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                {initialGoals?.map(goal => {
                    const remaining = Math.max(0, goal.target_amount - goal.current_amount);
                    const months = Math.ceil(remaining / (monthlySavings || 1));
                    const estDate = new Date();
                    estDate.setMonth(estDate.getMonth() + months);
                    const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);

                    return (
                        <div key={goal.id} className="p-4 bg-white/60 rounded-2xl border border-primary/10 shadow-sm space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary font-black">
                                    {goal.icon || '🎯'}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-black uppercase text-primary/60 truncate">{goal.name}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground">{Math.round(progress)}% complété</p>
                                </div>
                            </div>
                            
                            <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
                            </div>

                            <div className="flex justify-between items-end pt-2">
                                <div className="space-y-0">
                                    <p className="text-xl font-black text-primary leading-none">
                                        {Math.floor(months / 12) > 0 ? `${Math.floor(months / 12)} an${Math.floor(months / 12) > 1 ? 's' : ''} ` : ''}
                                        {months % 12 > 0 ? `${months % 12} mois` : ''}
                                    </p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase italic">
                                        {estDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <Button size="sm" className="rounded-xl font-black" onClick={() => handlePlan(goal, monthlySavings)}>
                                    Planifier
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </Card>

      {selectedGoalId && (
        <AddSavingsModal 
          goalId={selectedGoalId} 
          isOpen={!!selectedGoalId} 
          onClose={() => setSelectedGoalId(null)} 
        />
      )}

      <div className="text-center pt-12 pb-8">
        <p className="text-[10px] font-bold text-muted-foreground/50 tracking-widest uppercase">
          {mounted ? (displayName || 'Utilisateur') : 'Utilisateur'} La Star ✨
        </p>
      </div>
    </div>
  );
}
