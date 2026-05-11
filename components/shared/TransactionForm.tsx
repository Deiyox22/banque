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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const EXPENSE_CATEGORIES = ['Alimentation', 'Loyer', 'Loisirs', 'Transports', 'Santé', 'Éducation', 'Autres'];
const INCOME_CATEGORIES = ['Salaire', 'Dividendes', 'Vente', 'Cadeau', 'Autre'];

export default function TransactionForm({ onSuccess, initialData }: { onSuccess?: () => void, initialData?: any }) {
  const [error, setError] = useState<string | null>(null);

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
    try {
      // Nettoyage du montant pour accepter point et virgule
      const cleanAmount = typeof data.amount === 'string' 
        ? parseFloat(data.amount.replace(',', '.')) 
        : data.amount;
      
      const payload = { ...data, amount: cleanAmount };

      if (initialData) {
        await updateTransaction(initialData.id, payload);
        toast.success('Transaction mise à jour avec succès ! ✨');
      } else {
        await createTransaction(payload);
        if (data.type === 'income') {
          toast.success(`Revenu de ${cleanAmount}€ ajouté ✨`, {
            description: `${data.label} le ${new Date(data.date).toLocaleDateString()}`,
          });
        } else {
          toast.success(`Dépense de ${cleanAmount}€ ajoutée 🎀`, {
            description: `${data.label} le ${new Date(data.date).toLocaleDateString()}`,
          });
        }
      }
      reset();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
      toast.error('Oups ! Une erreur est survenue lors de l\'enregistrement.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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

        <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-2xl border border-primary/5">
            <input type="checkbox" {...register('is_recurring')} id="is_recurring" className="h-5 w-5 rounded-md border-primary/30 text-primary focus:ring-primary/20" />
            <Label htmlFor="is_recurring" className="text-sm font-bold cursor-pointer text-muted-foreground">Transaction récurrente</Label>
        </div>

        {isRecurring && (
            <div className="space-y-6 p-6 rounded-3xl bg-secondary/20 border border-primary/10 animate-in fade-in slide-in-from-top-4">
                <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-2">Fréquence</Label>
                    <Controller
                        name="recurrence_type"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-12 bg-background/50 border-primary/20 rounded-2xl">
                                    <SelectValue placeholder="Fréquence" />
                                </SelectTrigger>
                                <SelectContent className="bg-background border-primary/10 rounded-2xl">
                                    <SelectItem value="daily" className="rounded-xl">Quotidienne</SelectItem>
                                    <SelectItem value="weekly" className="rounded-xl">Hebdomadaire</SelectItem>
                                    <SelectItem value="monthly" className="rounded-xl">Mensuelle</SelectItem>
                                    <SelectItem value="yearly" className="rounded-xl">Annuelle</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 ml-2">Date de fin</Label>
                    <Input type="date" {...register('recurrence_end_date')} />
                </div>
            </div>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-primary text-primary-foreground font-black text-lg shadow-glow hover:shadow-glow/50 rounded-full transition-all hover:scale-[1.02] active:scale-95">
        {isSubmitting ? 'Enregistrement...' : 'Confirmer ✨'}
      </Button>
    </form>
  );
}
