import { useMemo, useState } from 'react';
import {
  useTable,
  tableFeatures,
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  createSortedRowModel,
  createFilteredRowModel,
  sortFns,
  filterFns,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import type { Prospect } from '../types/database';
import { PriorityBadge } from './PriorityBadge';
import { StatutBadge } from './StatutBadge';
import { STATUTS } from './StatutBadge';
import { formatDate } from '../lib/formatDate';

const features = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  sortFns,
  filterFns,
});

const columnHelper = createColumnHelper<typeof features, Prospect>();

const columns = columnHelper.columns([
  columnHelper.accessor('nom', {
    header: 'Entreprise',
    sortFn: 'alphanumeric',
    filterFn: 'includesString',
  }),
  columnHelper.accessor('activite', {
    header: 'Activité',
    sortFn: 'alphanumeric',
    filterFn: 'equalsString',
    cell: (info) => info.getValue() ?? '—',
  }),
  columnHelper.accessor('priorite', {
    header: 'Priorité',
    sortFn: 'alphanumeric',
    filterFn: 'equalsString',
    cell: (info) => <PriorityBadge priorite={info.getValue()} />,
  }),
  columnHelper.accessor('statut', {
    header: 'Statut',
    sortFn: 'alphanumeric',
    filterFn: 'equalsString',
    cell: (info) => <StatutBadge statut={info.getValue()} />,
  }),
  columnHelper.accessor('prochaine_relance', {
    header: 'Prochaine relance',
    sortFn: 'datetime',
    cell: (info) => formatDate(info.getValue()),
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: (info) => (
      <Link
        to={`/prospects/${info.row.original.id}`}
        className="text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
      >
        Voir
      </Link>
    ),
  }),
]);

export function PipelineTable({ prospects }: { prospects: Prospect[] }) {
  const [globalFilter, setGlobalFilter] = useState('');

  const activites = useMemo(
    () =>
      [...new Set(prospects.map((p) => p.activite).filter((value): value is string => Boolean(value)))].sort(
        (a, b) => a.localeCompare(b, 'fr')
      ),
    [prospects]
  );

  const table = useTable({
    features,
    columns,
    data: prospects,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const statutColumn = table.getColumn('statut');
  const prioriteColumn = table.getColumn('priorite');
  const activiteColumn = table.getColumn('activite');

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="search"
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder="Rechercher une entreprise…"
          className="min-w-[180px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 dark:border-slate-700 dark:bg-slate-800"
        />
        <select
          value={(statutColumn?.getFilterValue() as string) ?? ''}
          onChange={(event) => statutColumn?.setFilterValue(event.target.value || undefined)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          aria-label="Filtrer par statut"
        >
          <option value="">Tous les statuts</option>
          {STATUTS.map((statut) => (
            <option key={statut} value={statut}>
              {statut}
            </option>
          ))}
        </select>
        <select
          value={(prioriteColumn?.getFilterValue() as string) ?? ''}
          onChange={(event) => prioriteColumn?.setFilterValue(event.target.value || undefined)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          aria-label="Filtrer par priorité"
        >
          <option value="">Toutes les priorités</option>
          <option value="Haute">Haute</option>
          <option value="Moyenne">Moyenne</option>
          <option value="Basse">Basse</option>
        </select>
        <select
          value={(activiteColumn?.getFilterValue() as string) ?? ''}
          onChange={(event) => activiteColumn?.setFilterValue(event.target.value || undefined)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          aria-label="Filtrer par activité"
        >
          <option value="">Toutes les activités</option>
          {activites.map((activite) => (
            <option key={activite} value={activite}>
              {activite}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300">
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={() => header.column.toggleSorting()}
                        className="flex items-center gap-1 focus:outline-2 focus:outline-offset-2 focus:outline-sky-500"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && '↑'}
                        {header.column.getIsSorted() === 'desc' && '↓'}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
                {row.getAllCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {table.getRowModel().rows.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Aucun prospect ne correspond à ces filtres.
          </p>
        )}
      </div>
    </div>
  );
}
