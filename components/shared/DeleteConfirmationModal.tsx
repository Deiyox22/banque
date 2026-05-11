'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, itemName = 'cette transaction' }: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-soft">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-primary tracking-tight">Es-tu sûre ? 🌸</DialogTitle>
        </DialogHeader>
        <p className="text-sm font-semibold text-muted-foreground mt-2">
          Cette action est irréversible. Veux-tu vraiment supprimer {itemName} ?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="rounded-full">Annuler</Button>
          <Button 
            variant="destructive" 
            onClick={() => { onConfirm(); onClose(); }} 
            className="rounded-full px-6 font-black"
          >
            Supprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
