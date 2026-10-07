export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR');
}

export function toDateInputValue(value: string | null | undefined): string {
  if (!value) return '';
  // Les dates stockées (colonne `date`) sont déjà en yyyy-mm-dd ; les
  // timestamps (created_at...) ont une partie heure à retirer.
  return value.slice(0, 10);
}
