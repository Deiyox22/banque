// components/shared/TransactionModal.tsx
'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, PenLine } from 'lucide-react';
import TransactionForm from './TransactionForm';
import { cn } from '@/lib/utils';

interface TransactionModalProps {
  mode?: 'fab' | 'button' | 'icon';
  transaction?: any;
}

import { useSearchParams } from 'next/navigation';

export default function TransactionModal({ mode = 'button', transaction }: TransactionModalProps) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const month = searchParams.get('month') || (new Date().getMonth() + 1).toString();
  const year = searchParams.get('year') || new Date().getFullYear().toString();
  const defaultDate = `${year}-${month.padStart(2, '0')}-01`;

  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'fab' ? (
          <button className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-all hover:scale-110 active:scale-90 border-4 border-background">
            <Plus size={32} strokeWidth={3} />
          </button>
        ) : mode === 'icon' ? (
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full">
                <PenLine size={18} />
            </Button>
        ) : (
          <Button className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-soft rounded-full px-6 py-6 transition-all hover:scale-105 active:scale-95">
            {transaction ? 'Modifier' : <><Plus size={22} className="mr-2" strokeWidth={3} />Nouvelle transaction</>}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-soft">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight text-primary">
            {transaction ? 'Modifier' : 'Ajouter'} une transaction
          </DialogTitle>
          <p className="text-xs font-bold uppercase tracking-widest text-primary/60">
            {monthName}
          </p>
        </DialogHeader>
        <div className="mt-4">
          <TransactionForm initialData={transaction} onSuccess={() => setOpen(false)} defaultDate={defaultDate} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
