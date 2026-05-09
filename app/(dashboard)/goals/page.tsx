// app/(dashboard)/goals/page.tsx
import { createClient } from '@/lib/supabase/server';
import GoalCard from '@/components/shared/GoalCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function GoalsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: goals } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#f472b6]">Objectifs d'Épargne</h1>
          <p className="text-gray-400">Suivez vos progrès vers vos projets et rêves.</p>
        </div>
        <Button className="bg-[#f472b6] text-[#0d0811] font-bold hover:bg-[#f472b6]/90">
          <Plus size={20} className="mr-2" />
          Nouvel objectif
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {goals?.map((goal) => (
          <GoalCard 
            key={goal.id}
            id={goal.id}
            name={goal.name}
            target_amount={goal.target_amount}
            current_amount={goal.current_amount}
            deadline={goal.deadline}
            color={goal.color}
            onAddSavings={() => {}} // Implemented via client component or server action later
          />
        ))}

        {(!goals || goals.length === 0) && (
          <div className="col-span-full py-20 text-center rounded-3xl border-2 border-dashed border-white/5 bg-[#1a1122]/50">
            <p className="text-gray-500">Vous n'avez pas encore d'objectifs. Commencez dès maintenant !</p>
          </div>
        )}
      </div>
    </div>
  );
}
