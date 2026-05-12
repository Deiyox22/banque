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
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useVaultStore } from '@/store/useVaultStore';
import { createClient } from '@/lib/supabase/client';

const EXPENSE_CATEGORIES_DEFAULT = ['Alimentation', 'Loyer', 'Loisirs', 'Transports', 'Santé', 'Éducation', 'Autres'];
const INCOME_CATEGORIES_DEFAULT = ['Salaire', 'Dividendes', 'Vente', 'Cadeau', 'Autre'];

export default function TransactionForm({ onSuccess, initialData }: { onSuccess?: () => void, initialData?: any }) {
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

  const { data: dynamicCats = [] } = useQuery({
      queryKey: ['all-categories'],
      queryFn: async () => {
          const supabase = createClient();
          // Récupérer les catégories utilisées ET les catégories masquées
          const { data: txs } = await supabase.from('transactions').select('category').not('category', 'is', null);
          const { data: hidden } = await supabase.from('hidden_categories').select('name');
          
          const allCats = Array.from(new Set(txs?.map(t => t.category))).filter(Boolean);
          const hiddenCats = new Set(hidden?.map(h => h.name));
          
          return allCats.filter(c => !hiddenCats.has(c));
      }
  });

  const categories = Array.from(new Set([...(type === 'income' ? INCOME_CATEGORIES_DEFAULT : EXPENSE_CATEGORIES_DEFAULT), ...dynamicCats]));

  const onSubmit = async (data: any) => {
    try {
      if (initialData) {
        await updateTransaction(initialData.id, data);
        setTransactions(transactions.map(t => t.id === initialData.id ? { ...t, ...data } : t));
        toast.success('Transaction mise à jour avec succès ! ✨');
      } else {
        await createTransaction(data);
        fetchTransactions(new Date().getMonth() + 1, new Date().getFullYear());
        toast.success(`Transaction ajoutée ✨`);
      }
      reset();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error('Oups ! Une erreur est survenue.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-6 bg-white/40 backdrop-blur-md rounded-3xl border border-white/50 shadow-soft">
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
              <Input type="text" {...register('amount')} placeholder="0.00" className="text-lg font-black" />
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
            <div className="relative">
                <Input 
                    list="categories"
                    {...register('category')}
                    placeholder="Sélectionnez ou tapez une catégorie" 
                    className="h-12 bg-background/50 border-primary/20 rounded-2xl font-semibold w-full"
                />
                <datalist id="categories">
                    {categories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
            </div>
            <p className="text-[10px] text-muted-foreground px-2">Sélectionnez une catégorie dans la liste ou tapez-en une nouvelle.</p>
        </div>
        <div className="space-y-4 p-4 bg-secondary/20 rounded-2xl border border-primary/5">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">Récurrence (optionnel)</Label>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <Controller
                        name="recurrence_type"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                <SelectTrigger className="h-10 bg-background/50 border-primary/20 rounded-xl">
                                    <SelectValue placeholder="Fréquence" />
                                </SelectTrigger>
                                <SelectContent className="bg-background border-primary/10 rounded-2xl">
                                    <SelectItem value="daily">Jour</SelectItem>
                                    <SelectItem value="weekly">Semaine</SelectItem>
                                    <SelectItem value="monthly">Mois</SelectItem>
                                    <SelectItem value="yearly">An</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <Input type="date" {...register('recurrence_end_date')} className="h-10 rounded-xl bg-background/50 border-primary/20" />
            </div>
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-primary text-primary-foreground font-black text-lg rounded-full shadow-glow">
        Confirmer ✨
      </Button>
    </form>
  );
}
