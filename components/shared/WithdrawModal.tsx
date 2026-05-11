'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { withdrawSavings } from '@/lib/actions/goals';
import { toast } from 'sonner';
import { Minus } from 'lucide-react';

interface WithdrawModalProps {
  id: string;
  name: string;
}

export default function WithdrawModal({ id, name }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleWithdraw = async () => {
    if (!amount) return;
    setLoading(true);
    await withdrawSavings(id, Number(amount));
    setLoading(false);
    setOpen(false);
    setAmount('');
    toast.info(`Retrait de ${amount}€ effectué. Utilise-les sagement ! 🎀`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-500 hover:bg-rose-50 rounded-full transition-all">
          <Minus size={20} strokeWidth={3} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-soft">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-primary tracking-tight">Retirer de {name} ✨</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-primary/60 ml-2">Montant à retirer</Label>
            <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="0.00"
                className="font-black text-lg" 
            />
          </div>
          <Button onClick={handleWithdraw} disabled={loading} className="w-full h-16 bg-rose-500 text-white font-black text-lg shadow-glow hover:shadow-glow/50 rounded-full transition-all hover:scale-[1.02]">
            {loading ? 'Retrait...' : 'Confirmer le retrait ✨'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
