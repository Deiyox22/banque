// components/shared/TransactionForm.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema } from '@/lib/validations/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTransaction, updateTransaction } from '@/lib/actions/transactions';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useVaultStore } from '@/store/useVaultStore';

const EXPENSE_CATEGORIES = ['Alimentation', 'Loyer', 'Loisirs', 'Transports', 'Santé', 'Éducation', 'Autres'];
const INCOME_CATEGORIES = ['Salaire', 'Dividendes', 'Vente', 'Cadeau', 'Autre'];

export default function TransactionForm({ onSuccess, initialData }: { onSuccess?: () => void, initialData?: any }) {
  const [error, setError] = useState<string | null>(null);
  const transactions = useVaultStore((state) => state.transactions);
  const setTransactions = useVaultStore((state) => state.setTransactions);
  const fetchTransactions = useVaultStore((state) => state.fetchTransactions);

  const { register, handleSubmit, control, formState: { isSubmitting }, reset, watch } = useForm<any>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData || {
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      is_recurring: false,
    }
  });

  const type = watch('type');
  const isRecurring = watch('is_recurring');
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const onSubmit = async (data: any) => {
    console.log('onSubmit déclenché avec:', data);
    try {
      if (initialData) {
        console.log('Tentative de mise à jour:', initialData.id, data);
        const result = await updateTransaction(initialData.id, data);
        console.log('Résultat mise à jour:', result);
        
        // Mise à jour locale du store
        setTransactions(transactions.map(t => t.id === initialData.id ? { ...t, ...data } : t));
        toast.success('Transaction mise à jour avec succès ! ✨');
      } else {
        await createTransaction(data);
        // On rafraîchit les données depuis le serveur pour avoir les nouveaux ID
        fetchTransactions(new Date().getMonth() + 1, new Date().getFullYear());
        toast.success(`Transaction de ${data.amount}€ ajoutée ✨`, {
          description: `${data.label} le ${new Date(data.date).toLocaleDateString()}`,
        });
      }
      reset();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Erreur soumission:', err);
      setError(err.message);
      toast.error('Oups ! Une erreur est survenue lors de l\'enregistrement.');
    }
  };

  const onInvalid = (errors: any) => {
    console.log('Validation formulaire échouée:', errors);
    setError('Veuillez vérifier les champs du formulaire.');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8 p-6 bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 shadow-soft">
      {error && <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold">{error}</div>}

      <div className="space-y-6">
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Tabs value={field.value} onValueChange={field.onChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1.5 rounded-2xl h-14">
                <TabsTrigger value="expense" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black tracking-tight">Dépense</TabsTrigger>
                <TabsTrigger value="income" className="rounded-xl data-[state=active]:bg-emerald-500 data-[state=active]:text-white font-black tracking-tight">Revenu</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-2">Montant</Label>
              <Input 
                type="text" 
                inputMode="decimal"
                {...register('amount')} 
                placeholder="0.00" 
                className="text-lg font-black" 
                onChange={(e) => {
                  // Permet la saisie de la virgule en la remplaçant visuellement par un point ou en la laissant passer
                  // selon la préférence navigateur, mais ici on gère surtout la soumission.
                }}
              />
            </div>
            <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-2">Date</Label>
                <Input type="date" {...register('date')} className="font-semibold" />
            </div>
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-2">Libellé</Label>
          <Input {...register('label')} placeholder="Ex: Shopping ou Salaire" className="font-semibold" />
        </div>

        <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-2">Catégorie</Label>
            <Controller
                name="category"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-12 bg-background/50 border-primary/20 rounded-2xl font-semibold">
                            <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border-primary/10 rounded-2xl shadow-soft">
                            {categories.map(cat => <SelectItem key={cat} value={cat} className="rounded-xl focus:bg-primary/10 focus:text-primary">{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            />
        </div>

        <div className="space-y-4 p-4 bg-secondary/20 rounded-2xl border border-primary/5">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Récurrence (optionnel)</Label>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Fréquence</Label>
                    <Controller
                        name="recurrence_type"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                <SelectTrigger className="h-10 bg-background/50 border-primary/20 rounded-xl">
                                    <SelectValue placeholder="Aucune" />
                                </SelectTrigger>
                                <SelectContent className="bg-background border-primary/10 rounded-2xl">
                                    <SelectItem value="daily" className="rounded-xl">Jour</SelectItem>
                                    <SelectItem value="weekly" className="rounded-xl">Semaine</SelectItem>
                                    <SelectItem value="monthly" className="rounded-xl">Mois</SelectItem>
                                    <SelectItem value="yearly" className="rounded-xl">An</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Fin (optionnel)</Label>
                    <Input type="date" {...register('recurrence_end_date')} className="h-10 rounded-xl bg-background/50 border-primary/20" />
                </div>
            </div>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-primary text-primary-foreground font-black text-lg shadow-glow hover:shadow-glow/50 rounded-full transition-all hover:scale-[1.02] active:scale-95">
        {isSubmitting ? 'Enregistrement...' : 'Confirmer ✨'}
      </Button>
    </form>
  );
}
