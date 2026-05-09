'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function deleteAccount() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Non authentifié' };

  // Suppression en cascade automatique via contraintes FK dans Supabase si configuré, 
  // sinon suppression manuelle des données liées ici.
  const { error } = await supabase.auth.admin.deleteUser(user.id);

  if (error) return { error: error.message };

  redirect('/login');
}
