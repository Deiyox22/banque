'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const [name, setName] = useState('Utilisateur');
  const [email, setEmail] = useState('utilisateur@example.com');

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">Paramètres</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profil */}
        <Card className="bg-[#1a1122] border-[#f472b6]/20">
          <CardHeader>
            <CardTitle className="text-white">Profil</CardTitle>
            <CardDescription className="text-gray-400">Gérez vos informations personnelles.</CardDescription>
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
            <div className="space-y-2">
              <Label className="text-white" htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#2a1b35] border-[#f472b6]/20 text-white" 
              />
            </div>
            <Button className="bg-[#f472b6] hover:bg-[#f472b6]/90 text-white">Enregistrer</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-[#1a1122] border-[#f472b6]/20">
          <CardHeader>
            <CardTitle className="text-white">Notifications</CardTitle>
            <CardDescription className="text-gray-400">Configurez vos préférences d'alerte.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Alertes transactions</span>
              <Button variant="outline" className="border-[#f472b6]/20 text-[#f472b6]">Actif</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Rappels d'objectifs</span>
              <Button variant="outline" className="border-[#f472b6]/20 text-[#f472b6]">Actif</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
