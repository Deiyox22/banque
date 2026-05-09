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

export default function TransactionModal({ mode = 'button', transaction }: TransactionModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'fab' ? (
          <button className="fixed bottom-24 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#f472b6] text-[#0d0811] shadow-[0_0_20px_rgba(244,114,182,0.5)] transition-transform hover:scale-110 active:scale-95 md:hidden">
            <Plus size={28} />
          </button>
        ) : mode === 'icon' ? (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-[#f472b6]">
                <PenLine size={16} />
            </Button>
        ) : (
          <Button className="bg-[#f472b6] text-[#0d0811] font-bold hover:bg-[#f472b6]/90 shadow-[0_0_20px_rgba(244,114,182,0.3)]">
            {transaction ? 'Modifier' : <><Plus size={20} className="mr-2" />Nouvelle transaction</>}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Modifier' : 'Ajouter'} une transaction ✨</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <TransactionForm initialData={transaction} onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
