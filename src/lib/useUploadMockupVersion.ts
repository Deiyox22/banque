import { useCallback, useState } from 'react';
import { supabase } from './supabase';

export function useUploadMockupVersion() {
  const [uploadingProspectId, setUploadingProspectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadNewVersion = useCallback(async (prospectId: string, currentVersion: number, file: File) => {
    setUploadingProspectId(prospectId);
    setError(null);

    const nextVersion = currentVersion + 1;
    const storagePath = `${prospectId}/v${nextVersion}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('mockups')
      .upload(storagePath, file, { contentType: 'text/html' });
    if (uploadError) {
      setError(uploadError.message);
      setUploadingProspectId(null);
      return false;
    }

    const { error: insertError } = await supabase.from('mockups').insert({
      prospect_id: prospectId,
      nom_fichier: file.name,
      version: nextVersion,
      storage_path: storagePath,
    });
    if (insertError) {
      setError(insertError.message);
      setUploadingProspectId(null);
      return false;
    }

    setUploadingProspectId(null);
    return true;
  }, []);

  return { uploadNewVersion, uploadingProspectId, error };
}
