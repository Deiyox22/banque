import { useRef } from 'react';
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

function KanbanColumn({
  statut,
  prospects,
  innerRef,
}: {
  statut: StatutProspect;
  prospects: Prospect[];
  innerRef: (el: HTMLDivElement | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: statut });

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        innerRef(el);
      }}
      className={`flex w-full flex-col rounded-xl border p-3 sm:w-64 sm:shrink-0 sm:snap-center ${
        isOver
          ? 'border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-950'
          : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      <p className="mb-3 text-sm font-semibold">
        {statut} <span className="text-slate-400">({prospects.length})</span>
      </p>
      {prospects.length > 0 && (
        <div className="flex flex-col gap-2">
          {prospects.map((prospect) => (
            <KanbanCard key={prospect.id} prospect={prospect} />
          ))}
        </div>
      )}
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
  const columnRefs = useRef<Partial<Record<StatutProspect, HTMLDivElement | null>>>({});

  function allerAuStatut(statut: StatutProspect) {
    columnRefs.current[statut]?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
  }

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
    <div>
      {/* Mobile uniquement : les statuts s'empilent verticalement (plus
          naturel à faire défiler qu'horizontalement) ; ces pastilles
          permettent de sauter directement à un statut plutôt que de
          descendre à travers d'éventuelles sections vides. */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 sm:hidden" aria-label="Aller à un statut">
        {STATUTS.map((statut) => (
          <button
            key={statut}
            type="button"
            onClick={() => allerAuStatut(statut)}
            className="shrink-0 rounded-full border border-slate-300 px-3 py-1 text-xs font-medium whitespace-nowrap text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-sky-500 dark:border-slate-700 dark:text-slate-300"
          >
            {statut}{' '}
            <span className="text-slate-400">({prospects.filter((p) => p.statut === statut).length})</span>
          </button>
        ))}
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-3 sm:flex-row sm:snap-x sm:snap-mandatory sm:overflow-x-auto sm:pb-4">
          {STATUTS.map((statut) => (
            <KanbanColumn
              key={statut}
              statut={statut}
              prospects={prospects.filter((p) => p.statut === statut)}
              innerRef={(el) => {
                columnRefs.current[statut] = el;
              }}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
