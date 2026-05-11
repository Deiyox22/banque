'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addSavings } from '@/lib/actions/goals';
import { useRouter } from 'next/navigation';

export default function AddSavingsModal({ goalId, isOpen, onClose }: { goalId: string, isOpen: boolean, onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleAdd = async () => {
    if (!amount) return;
    setIsSubmitting(true);
    await addSavings(goalId, parseFloat(amount));
    setIsSubmitting(false);
    onClose();
    toast.success(`+${amount}€ mis de côté ! Tu te rapproches de ton but. 🌸✨`);
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl border-none shadow-soft">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-primary tracking-tight text-center">Ajouter de l'épargne ✨</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-primary/60 ml-2">Montant à ajouter</Label>
            <Input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="Ex: 50" 
              className="font-black text-lg"
            />
          </div>
          <Button onClick={handleAdd} disabled={isSubmitting} className="w-full h-16 bg-primary text-primary-foreground font-black text-lg shadow-glow hover:shadow-glow/50 rounded-full transition-all hover:scale-[1.02]">
            {isSubmitting ? 'Ajout...' : 'Confirmer l\'ajout ✨'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
