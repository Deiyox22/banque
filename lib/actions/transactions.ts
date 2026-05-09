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

  const { error } = await supabase
    .from('transactions')
    .insert({
      ...validatedFields.data,
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

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/transactions');
  revalidatePath('/');
}
