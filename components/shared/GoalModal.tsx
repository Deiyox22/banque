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
    toast.success(`C'est parti pour l'objectif "${data.name}" ! 🚀`, {
      description: 'Chaque petit pas compte pour réaliser ses rêves.',
    });
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground font-black shadow-soft hover:shadow-glow/50 rounded-full px-6 py-6 transition-all hover:scale-105">
          <Plus size={22} className="mr-2" strokeWidth={3} />
          Nouvel objectif
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl border-none shadow-soft">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-primary tracking-tight">Nouvel objectif ✨</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-2">Nom de l'objectif</Label>
            <Input {...register('name')} placeholder="Ex: Voyage à Tokyo ✈️" className="font-bold" />
          </div>
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-2">Montant cible</Label>
            <Input type="number" {...register('target_amount')} placeholder="0" className="text-lg font-black" />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-primary text-primary-foreground font-black text-lg shadow-glow hover:shadow-glow/50 rounded-full transition-all hover:scale-[1.02] active:scale-95 mt-4">
            {isSubmitting ? 'Création...' : 'Créer l\'objectif ✨'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
