// lib/actions/transactions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { transactionSchema } from '@/lib/validations/schemas';
import { revalidatePath } from 'next/cache';

export async function createTransaction(formData: any) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Non authentifié');

  const validatedFields = transactionSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  // Nettoyage des champs vides
  const data = Object.fromEntries(
    Object.entries(validatedFields.data).map(([key, value]) => [
      key,
      value === '' || value === undefined ? null : value
    ])
  );

  const { error } = await supabase
    .from('transactions')
    .insert({
      ...data,
      owner_id: user.id,
    });

  if (error) throw new Error(error.message);

  revalidatePath('/transactions');
  revalidatePath('/');
}

export async function updateTransaction(id: string, formData: any) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Non authentifié');

  const validatedFields = transactionSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from('transactions')
    .update(validatedFields.data)
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/transactions');
  revalidatePath('/');
}

export async function deleteTransaction(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Non authentifié');

  // 1. Get transaction info
  const { data: tx } = await supabase
    .from('transactions')
    .select('label, amount, type, category')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single();

  if (!tx) throw new Error('Transaction non trouvée');

  // 2. If it's a savings transaction, update the goal
  if (tx.category === 'Économies') {
    const goalName = tx.label.replace('Épargne: ', '').replace('Retrait épargne: ', '');
    const { data: goal } = await supabase
        .from('savings_goals')
        .select('id, current_amount')
        .eq('name', goalName)
        .eq('owner_id', user.id)
        .single();
    
    if (goal) {
        // Si c'est une dépense (Épargne ajoutée), on doit soustraire de l'objectif (car on annule l'ajout).
        // Si c'est un revenu (Retrait épargne), on doit ajouter à l'objectif (car on annule le retrait).
        const adjustment = tx.type === 'expense' ? tx.amount : -tx.amount;
        await supabase
            .from('savings_goals')
            .update({ current_amount: goal.current_amount - adjustment })
            .eq('id', goal.id);
    }
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) throw new Error(error.message);

  // revalidatePath('/transactions');
  // revalidatePath('/goals');
  // revalidatePath('/');
}
