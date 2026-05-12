'use client';

import { useState, useEffect } from 'react';
import GoalCard from '@/components/shared/GoalCard';
import AddSavingsModal from '@/components/shared/AddSavingsModal';
import GoalModal from '@/components/shared/GoalModal';

import { useVaultStore } from '@/store/useVaultStore';

export default function GoalsClient({ goals: initialGoals }: { goals: any[] }) {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const displayName = useVaultStore((state) => state.displayName);

  useEffect(() => setMounted(true), []);

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
