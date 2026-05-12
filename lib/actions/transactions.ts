// lib/actions/transactions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { transactionSchema } from '@/lib/validations/schemas';
import { revalidatePath } from 'next/cache';

export async function createTransaction(formData: any) {
  console.log('Début createTransaction');
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Non authentifié');

  const validatedFields = transactionSchema.safeParse(formData);

  if (!validatedFields.success) {
    console.log('Validation échouée', validatedFields.error);
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  // Nettoyage des champs vides
  const data = Object.fromEntries(
    Object.entries(validatedFields.data).map(([key, value]) => [
      key,
      value === '' || value === undefined ? null : value
    ])
  );

  console.log('Insertion dans transactions...');
  const { error } = await supabase
    .from('transactions')
    .insert({
      ...data,
      owner_id: user.id,
    });

  if (error) {
    console.log('Erreur insertion:', error);
    throw new Error(error.message);
  }

  console.log('Insertion réussie');

  if (data.category === 'Économies' && data.label && typeof data.label === 'string' && data.label.startsWith('Épargne: ')) {
    const goalName = data.label.replace('Épargne: ', '');
    const { data: goal } = await supabase
        .from('savings_goals')
        .select('id, current_amount')
        .eq('name', goalName)
        .eq('owner_id', user.id)
        .single();
    
    if (goal) {
        console.log('Mise à jour objectif...');
        await supabase
            .from('savings_goals')
            .update({ current_amount: goal.current_amount + Number(data.amount) })
            .eq('id', goal.id);
    }
  }

  console.log('revalidatePath...');
  revalidatePath('/transactions');
  revalidatePath('/');
  console.log('Fin createTransaction');
}

export async function updateTransaction(id: string, formData: any) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Non authentifié');

  const validatedFields = transactionSchema.safeParse(formData);

  if (!validatedFields.success) {
    console.error('Validation échouée:', validatedFields.error);
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from('transactions')
    .update(validatedFields.data)
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) {
    console.error('Erreur Supabase:', error);
    throw new Error(error.message);
  }
}

export async function hideCategory(name: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Non authentifié');

  const { error } = await supabase
    .from('hidden_categories')
    .insert({
      user_id: user.id,
      name,
    });

  if (error) throw new Error(error.message);

  revalidatePath('/transactions');
  revalidatePath('/');
}

export async function deleteTransaction(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Non authentifié');

  console.log('Suppression ID original reçu:', id);

  // Un UUID standard a 5 segments séparés par des tirets
  // Format : xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const originalId = id.includes('-') && id.split('-').length > 5 
    ? id.split('-').slice(0, 5).join('-') 
    : id;
  console.log('ID nettoyé pour Supabase:', originalId);

  // Si l'ID est clairement invalide (trop court pour un UUID), on arrête.
  if (originalId.length < 8) {
      console.error('ID trop court pour être un UUID:', originalId);
      throw new Error('Identifiant de transaction invalide');
  }

  // Récupérer la transaction AVANT de la supprimer pour ajuster l'objectif si nécessaire
  // On utilise une recherche par libellé ou une autre clé si l'ID échoue, 
  // mais pour l'instant on reste sur l'ID.
  const { data: tx } = await supabase
    .from('transactions')
    .select('id, label, amount, type, category')
    .eq('id', originalId)
    .eq('owner_id', user.id)
    .single();

  if (tx) {
    if (tx.category === 'Économies') {
      const goalName = tx.label.replace('Épargne: ', '').replace('Retrait épargne: ', '');
      const { data: goal } = await supabase
          .from('savings_goals')
          .select('id, current_amount')
          .eq('name', goalName)
          .eq('owner_id', user.id)
          .single();
      
      if (goal) {
          const adjustment = tx.type === 'expense' ? tx.amount : -tx.amount;
          await supabase
              .from('savings_goals')
              .update({ current_amount: goal.current_amount - adjustment })
              .eq('id', goal.id);
      }
    }
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', originalId)
    .eq('owner_id', user.id);

  if (error) {
      console.error('Erreur Supabase delete:', error);
      throw new Error(error.message);
  }
  
  revalidatePath('/transactions');
  revalidatePath('/');
}
