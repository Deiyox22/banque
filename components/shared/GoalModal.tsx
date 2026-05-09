'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { savingsGoalSchema } from '@/lib/validations/schemas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createGoal } from '@/lib/actions/goals';
import { useRouter } from 'next/navigation';

export default function GoalModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm<any>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: { color: '#6366f1' }
  });

  const onSubmit = async (data: any) => {
    await createGoal(data);
    reset();
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#f472b6] text-[#0d0811] font-bold hover:bg-[#f472b6]/90">
          <Plus size={20} className="mr-2" />
          Nouvel objectif
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvel objectif ✨</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Nom de l'objectif</Label>
            <Input {...register('name')} placeholder="Ex: Vacances" />
          </div>
          <div className="space-y-2">
            <Label>Montant cible</Label>
            <Input type="number" {...register('target_amount')} placeholder="0" />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-[#f472b6] text-black font-bold">
            {isSubmitting ? 'Création...' : 'Créer'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
