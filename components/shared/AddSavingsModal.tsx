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
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter à l'épargne ✨</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Montant à ajouter</Label>
            <Input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="Ex: 50" 
            />
          </div>
          <Button onClick={handleAdd} disabled={isSubmitting} className="w-full bg-[#f472b6] text-black font-bold">
            {isSubmitting ? 'Ajout...' : 'Confirmer l\'ajout'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
