'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { withdrawSavings } from '@/lib/actions/goals';
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
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:bg-rose-400/10">
          <Minus size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-[#1a1122] border-white/5">
        <DialogHeader>
          <DialogTitle className="text-white">Retirer de {name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-gray-400">Montant à retirer</Label>
            <Input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                className="h-12 bg-black/20" 
                placeholder="0.00" 
            />
          </div>
          <Button onClick={handleWithdraw} disabled={loading} className="w-full h-12 bg-rose-500 hover:bg-rose-600">
            {loading ? 'Retrait...' : 'Confirmer le retrait'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
