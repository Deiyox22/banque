'use client';

import { useState } from 'react';
import GoalCard from '@/components/shared/GoalCard';
import AddSavingsModal from '@/components/shared/AddSavingsModal';
import GoalModal from '@/components/shared/GoalModal';

export default function GoalsClient({ goals: initialGoals }: { goals: any[] }) {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f472b6]">Objectifs d'Épargne</h1>
          <p className="text-gray-400">Suivez vos progrès vers vos projets et rêves.</p>
        </div>
        <GoalModal />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="col-span-full py-20 text-center rounded-3xl border-2 border-dashed border-white/5 bg-[#1a1122]/50">
            <p className="text-gray-500">Vous n'avez pas encore d'objectifs. Commencez dès maintenant !</p>
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
    </div>
  );
}
