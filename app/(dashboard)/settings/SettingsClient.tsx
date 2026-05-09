'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { deleteAccount } from '@/lib/actions/auth';

export default function SettingsClient({ displayName }: { displayName: string }) {
  const [name, setName] = useState(displayName);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
        await deleteAccount();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">Paramètres</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profil */}
        <Card className="bg-[#1a1122] border-[#f472b6]/20">
          <CardHeader>
            <CardTitle className="text-white">Profil</CardTitle>
            <CardDescription className="text-gray-400">Gérez votre nom d'affichage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white" htmlFor="name">Nom</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="bg-[#2a1b35] border-[#f472b6]/20 text-white" 
              />
            </div>
            <Button className="bg-[#f472b6] hover:bg-[#f472b6]/90 text-white">Enregistrer</Button>
          </CardContent>
        </Card>

        {/* Compte */}
        <Card className="bg-[#1a1122] border-[#f472b6]/20">
          <CardHeader>
            <CardTitle className="text-white">Compte</CardTitle>
            <CardDescription className="text-gray-400">Actions sur votre compte.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" onClick={handleLogout}>Déconnexion</Button>
            <Button variant="destructive" className="w-full" onClick={handleDelete}>Supprimer mon compte</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
