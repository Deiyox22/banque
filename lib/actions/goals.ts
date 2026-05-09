// lib/actions/goals.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { savingsGoalSchema } from '@/lib/validations/schemas';
import { revalidatePath } from 'next/cache';

export async function createGoal(formData: any) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Non authentifié' };

  const validatedFields = savingsGoalSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from('savings_goals')
    .insert({
      ...validatedFields.data,
      owner_id: user.id,
    });

  if (error) return { error: error.message };

  revalidatePath('/goals');
  revalidatePath('/');
  return { success: true };
}

export async function updateGoal(id: string, formData: any) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Non authentifié' };

  const validatedFields = savingsGoalSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from('savings_goals')
    .update(validatedFields.data)
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/goals');
  revalidatePath('/');
  return { success: true };
}

export async function addSavings(id: string, amount: number) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Non authentifié');

  const { data: goal } = await supabase
    .from('savings_goals')
    .select('current_amount')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single();

  if (!goal) throw new Error('Objectif non trouvé');

  const { error } = await supabase
    .from('savings_goals')
    .update({ current_amount: goal.current_amount + amount })
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/goals');
  revalidatePath('/');
}

export async function deleteGoal(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Non authentifié');

  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/goals');
  revalidatePath('/');
}
