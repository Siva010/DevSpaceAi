import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, GripVertical, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';

export interface TaskCardProps {
  id: string;
  title: string;
  priority: Priority;
  assignee: string;
  dueDate: string;
  tag?: string;
  onDelete?: (id: string) => void;
}

const PRIORITY_CONFIG: Record<Priority, { bg: string; text: string; dot: string; glow: string }> = {
  Urgent: { bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-400', glow: 'shadow-[0_0_10px_rgba(244,63,94,0.3)]' },
  High: { bg: 'bg-orange-500/10 border-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-400', glow: 'shadow-[0_0_10px_rgba(249,115,22,0.3)]' },
  Medium: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400', glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]' },
  Low: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400', glow: 'shadow-[0_0_10px_rgba(59,130,246,0.3)]' },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

const ASSIGNEE_COLORS = [
  'from-blue-500 to-cyan-400 shadow-blue-500/40',
  'from-purple-500 to-pink-500 shadow-purple-500/40',
  'from-emerald-500 to-teal-400 shadow-emerald-500/40',
  'from-orange-500 to-amber-500 shadow-orange-500/40',
  'from-rose-500 to-pink-500 shadow-rose-500/40',
  'from-indigo-500 to-blue-500 shadow-indigo-500/40',
];

function getAssigneeColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ASSIGNEE_COLORS[Math.abs(hash) % ASSIGNEE_COLORS.length];
}

export function TaskCard({ id, title, priority, assignee, dueDate, tag, onDelete }: TaskCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityStyle = PRIORITY_CONFIG[priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-2xl bg-[#12121a]/80 backdrop-blur-md p-5 border border-white/[0.05]',
        'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
        'hover:border-white/[0.15] hover:bg-[#1a1a24]/90 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]',
        isDragging
          ? 'z-50 rotate-[3deg] scale-105 border-blue-500/40 bg-[#12121a] shadow-[0_20px_40px_rgba(0,0,0,0.5)] opacity-95'
          : ''
      )}
    >
      {/* Action Buttons */}
      <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {confirmDelete ? (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(id); setConfirmDelete(false); }}
            className="text-rose-400 hover:text-rose-300 text-xs font-bold px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 transition-all"
          >
            Confirm?
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); }}
            className="rounded-lg p-1.5 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab rounded-lg p-1.5 text-neutral-500 hover:text-white hover:bg-white/10 active:cursor-grabbing transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </div>

      {/* Tag */}
      {tag && (
        <span className="mb-3 inline-block rounded-lg bg-white/[0.03] border border-white/[0.05] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
          {tag}
        </span>
      )}

      {/* Title */}
      <h4 className="mb-4 pr-6 text-[14px] font-bold leading-relaxed text-white transition-colors group-hover:text-blue-400">
        {title}
      </h4>

      {/* Priority Badge */}
      <div className="mb-4 flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-[11px] font-bold border uppercase tracking-wider',
            priorityStyle.bg,
            priorityStyle.text
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', priorityStyle.dot, priorityStyle.glow)} />
          {priority}
        </span>
      </div>

      {/* Footer — Assignee + Due date */}
      <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-[0.4rem] bg-gradient-to-br text-[10px] font-bold text-white shadow-lg',
              getAssigneeColor(assignee)
            )}
          >
            {getInitials(assignee)}
          </div>
          <span className="text-[12px] font-semibold text-neutral-400">{assignee.split(' ')[0]}</span>
        </div>

        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 bg-black/20 px-2 py-1 rounded-md">
          <Calendar className="h-3.5 w-3.5" />
          {dueDate}
        </span>
      </div>
    </div>
  );
}
