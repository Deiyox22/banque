// lib/actions/children.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { childAccountSchema, transactionSchema, inviteViewerSchema } from '@/lib/validations/schemas';
import { revalidatePath } from 'next/cache';

export async function createChildAccount(formData: any) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Non authentifié' };

  const validatedFields = childAccountSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from('child_accounts')
    .insert({
      ...validatedFields.data,
      created_by: user.id,
    });

  if (error) return { error: error.message };

  revalidatePath('/children');
  return { success: true };
}

export async function createChildTransaction(childId: string, formData: any) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Non authentifié');

  // Vérifier que l'utilisateur est le créateur
  const { data: account } = await supabase
    .from('child_accounts')
    .select('created_by')
    .eq('id', childId)
    .single();

  if (!account || account.created_by !== user.id) {
    throw new Error('Action non autorisée');
  }

  const validatedFields = transactionSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from('child_transactions')
    .insert({
      ...validatedFields.data,
      child_account_id: childId,
    });

  if (error) throw new Error(error.message);

  revalidatePath(`/children/${childId}`);
}

export async function inviteViewer(childId: string, formData: any) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Non authentifié');

  const validatedFields = inviteViewerSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from('child_account_viewers')
    .insert({
      child_account_id: childId,
      invited_email: validatedFields.data.email,
    });

  if (error) throw new Error(error.message);

  revalidatePath(`/children/${childId}`);
}

export async function acceptInvitation(invitationId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Non authentifié');

  const { error } = await supabase
    .from('child_account_viewers')
    .update({ 
      viewer_id: user.id,
      status: 'accepted'
    })
    .eq('id', invitationId)
    .eq('invited_email', user.email);

  if (error) throw new Error(error.message);

  revalidatePath('/children');
  revalidatePath('/');
}

export async function revokeViewer(invitationId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Non authentifié');

  const { error } = await supabase
    .from('child_account_viewers')
    .delete()
    .eq('id', invitationId);

  if (error) throw new Error(error.message);

  revalidatePath(`/children`);
}
