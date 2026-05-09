// components/shared/TransactionForm.tsx
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionSchema } from '@/lib/validations/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTransaction } from '@/lib/actions/transactions';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, MinusCircle, Tag, Calendar, PenLine, CreditCard, RotateCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = ['Alimentation', 'Loyer', 'Loisirs', 'Transports', 'Santé', 'Éducation', 'Autres'];

export default function TransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, watch } = useForm<any>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      is_recurring: false,
    }
  });

  const isRecurring = watch('is_recurring');

  const onSubmit = async (data: any) => {
    try {
      await createTransaction(data);
      reset();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm">{error}</div>}
      
      <div className="space-y-4">
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Tabs value={field.value} onValueChange={field.onChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/40 p-1 border border-white/5 h-12">
                <TabsTrigger value="expense" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">Dépense</TabsTrigger>
                <TabsTrigger value="income" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">Revenu</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Montant</Label>
              <Input type="number" {...register('amount')} className="h-12 bg-black/20" placeholder="0.00" />
            </div>
            <div className="space-y-2">
                <Label className="text-gray-400">Date</Label>
                <Input type="date" {...register('date')} className="h-12 bg-black/20" />
            </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-400">Libellé</Label>
          <Input {...register('label')} className="h-12 bg-black/20" placeholder="Ex: Loyer" />
        </div>

        <div className="space-y-2">
            <Label className="text-gray-400">Catégorie</Label>
            <Controller
                name="category"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="h-12 bg-black/20">
                            <SelectValue placeholder="Sélectionnez une catégorie" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1122]">
                            {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            />
        </div>

        <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" {...register('is_recurring')} id="is_recurring" className="h-4 w-4" />
            <Label htmlFor="is_recurring" className="text-sm cursor-pointer">Transaction récurrente</Label>
        </div>

        {isRecurring && (
            <div className="space-y-4 p-4 rounded-xl bg-black/20 border border-white/5">
                <div className="space-y-2">
                    <Label className="text-gray-400">Fréquence</Label>
                    <Controller
                        name="recurrence_type"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-10 bg-[#1a1122]">
                                    <SelectValue placeholder="Fréquence" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1122]">
                                    <SelectItem value="daily">Quotidienne</SelectItem>
                                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                                    <SelectItem value="monthly">Mensuelle</SelectItem>
                                    <SelectItem value="yearly">Annuelle</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-gray-400">Date de fin (Optionnel)</Label>
                    <Input type="date" {...register('recurrence_end_date')} className="h-10 bg-[#1a1122]" />
                </div>
            </div>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-[#f472b6] text-black font-bold">
        {isSubmitting ? 'Enregistrement...' : 'Confirmer'}
      </Button>
    </form>
  );
}

