import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { Link } from 'react-router-dom';
import type { Prospect, StatutProspect } from '../types/database';
import { PriorityBadge } from './PriorityBadge';
import { STATUTS } from './StatutBadge';
import { formatDate } from '../lib/formatDate';

function KanbanCard({ prospect }: { prospect: Prospect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: prospect.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 10 }
          : undefined
      }
      className={`cursor-grab rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800 ${
        isDragging ? 'opacity-60' : ''
      }`}
    >
      <p className="font-medium">{prospect.nom}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{prospect.activite ?? '—'}</p>
      <div className="mt-2 flex items-center justify-between">
        <PriorityBadge priorite={prospect.priorite} />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(prospect.prochaine_relance)}
        </span>
      </div>
      <Link
        to={`/prospects/${prospect.id}`}
        className="mt-2 inline-block text-xs font-medium text-sky-600 hover:underline dark:text-sky-400"
      >
        Voir la fiche
      </Link>
    </div>
  );
}

function KanbanColumn({ statut, prospects }: { statut: StatutProspect; prospects: Prospect[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: statut });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-64 shrink-0 flex-col rounded-xl border p-3 ${
        isOver
          ? 'border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-950'
          : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      <p className="mb-3 text-sm font-semibold">
        {statut} <span className="text-slate-400">({prospects.length})</span>
      </p>
      <div className="flex flex-col gap-2">
        {prospects.map((prospect) => (
          <KanbanCard key={prospect.id} prospect={prospect} />
        ))}
      </div>
    </div>
  );
}

export function PipelineKanban({
  prospects,
  onStatutChange,
}: {
  prospects: Prospect[];
  onStatutChange: (id: string, statut: StatutProspect) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragEnd(event: DragEndEvent) {
    const prospectId = String(event.active.id);
    const nextStatut = event.over?.id as StatutProspect | undefined;
    if (!nextStatut) return;
    const prospect = prospects.find((p) => p.id === prospectId);
    if (prospect && prospect.statut !== nextStatut) {
      onStatutChange(prospectId, nextStatut);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STATUTS.map((statut) => (
          <KanbanColumn
            key={statut}
            statut={statut}
            prospects={prospects.filter((p) => p.statut === statut)}
          />
        ))}
      </div>
    </DndContext>
  );
}
