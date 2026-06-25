import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { MoreHorizontal, Plus, X, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '../../lib/utils';
import { TaskCard, type TaskCardProps } from './TaskCard';
import { tasksApi, PRIORITY_MAP, STATUS_MAP, STATUS_REVERSE_MAP } from '../../lib/api/tasks.api';

/* ─── Column config ─── */
type ColumnId = 'todo' | 'in-progress' | 'review' | 'done';

interface ColumnConfig {
  id: ColumnId;
  title: string;
  dot: string;
  headerAccent: string;
  countBg: string;
  dbStatus: string;
}

const COLUMNS: ColumnConfig[] = [
  { id: 'todo', title: 'TODO', dot: 'bg-neutral-500 shadow-[0_0_10px_rgba(115,115,115,0.8)]', headerAccent: 'border-t-neutral-500/50', countBg: 'bg-neutral-500/20 text-neutral-300', dbStatus: 'TODO' },
  { id: 'in-progress', title: 'IN PROGRESS', dot: 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]', headerAccent: 'border-t-blue-500/50', countBg: 'bg-blue-500/20 text-blue-300', dbStatus: 'IN_PROGRESS' },
  { id: 'review', title: 'REVIEW', dot: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]', headerAccent: 'border-t-amber-500/50', countBg: 'bg-amber-500/20 text-amber-300', dbStatus: 'REVIEW' },
  { id: 'done', title: 'DONE', dot: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]', headerAccent: 'border-t-emerald-500/50', countBg: 'bg-emerald-500/20 text-emerald-300', dbStatus: 'DONE' },
];

/* ─── Task data ─── */
interface TaskData extends TaskCardProps {
  columnId: ColumnId;
  dbId: string;
}

/* ─── Add Task Modal ─── */
function AddTaskModal({
  projectId,
  defaultColumnId,
  onClose,
}: {
  projectId: string;
  defaultColumnId: ColumnId;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { slug } = useParams();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState(3);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState(defaultColumnId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const createMutation = useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId, slug] });
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) return;
    createMutation.mutate({
      title,
      projectId,
      status: STATUS_REVERSE_MAP[status] || 'TODO',
      priority,
      dueDate: dueDate || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#0d0d12] border border-white/[0.08] rounded-[1.5rem] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-[fadeIn_0.3s_ease-out]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white">Add Task</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Title</label>
            <textarea
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={2}
              className="w-full bg-black/40 border border-white/[0.06] rounded-xl py-3 px-4 text-sm font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-none"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/[0.06] rounded-xl py-3 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all appearance-none cursor-pointer"
              >
                <option value={1}>🔴 Urgent</option>
                <option value={2}>🟠 High</option>
                <option value={3}>🟡 Medium</option>
                <option value={4}>🔵 Low</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ColumnId)}
                className="w-full bg-black/40 border border-white/[0.06] rounded-xl py-3 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all appearance-none cursor-pointer"
              >
                {COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

<div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.06] rounded-xl py-3 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all [color-scheme:dark]"
            />
          </div>

          {createMutation.isError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
              Failed to create task. Please try again.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/[0.06] text-neutral-400 hover:text-white hover:border-white/[0.12] text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || createMutation.isPending}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              {createMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
              ) : (
                'Add Task'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Droppable Column Wrapper ─── */
function DroppableColumn({
  column,
  tasks,
  onAddTask,
  onDeleteTask,
}: {
  column: ColumnConfig;
  tasks: TaskData[];
  onAddTask?: (columnId: ColumnId) => void;
  onDeleteTask: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex w-80 min-w-[320px] flex-shrink-0 flex-col">
      {/* Column header */}
      <div
        className={cn(
          'mb-3 rounded-2xl border-t-2 bg-[#0a0a0e]/80 backdrop-blur-md px-5 py-4 border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden',
          column.headerAccent
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={cn('h-2.5 w-2.5 rounded-full', column.dot)} />
            <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-300">
              {column.title}
            </span>
            <span
              className={cn(
                'rounded-md px-2 py-0.5 text-[11px] font-bold border border-white/[0.05]',
                column.countBg
              )}
            >
              {tasks.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {onAddTask && (
              <button
                onClick={() => onAddTask(column.id)}
                className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-white/10 hover:text-neutral-300"
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
            <button className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-white/10 hover:text-neutral-300">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable task list */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-1 flex-col gap-3 overflow-y-auto rounded-[1.5rem] bg-black/20 p-3 shadow-inner',
          'transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/[0.1] hover:scrollbar-thumb-white/[0.2]',
          isOver ? 'bg-blue-500/10 border border-blue-500/30 ring-4 ring-blue-500/10' : 'border border-transparent'
        )}
        style={{ maxHeight: 'calc(100vh - 220px)' }}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} {...task} onDelete={onDeleteTask} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-xl opacity-50 shadow-inner">
              📋
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-600">No tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Kanban Board ─── */
export default function KanbanBoard() {
  const { projectId, slug } = useParams();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addTaskColumn, setAddTaskColumn] = useState<ColumnId | null>(null);
  // Local task state for optimistic DnD UX
  const [localTasks, setLocalTasks] = useState<TaskData[] | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const { data: apiTasks, isLoading, isError } = useQuery({
    queryKey: ['tasks', projectId, slug],
    queryFn: () => tasksApi.getTasks(projectId),
    enabled: true,
  });

  // Convert API tasks to UI TaskData format
  const tasks: TaskData[] = useMemo(() => {
    if (localTasks !== null) return localTasks;
    if (!apiTasks) return [];

    return apiTasks.map((t) => {
      const columnId = (STATUS_MAP[t.status] || 'todo') as ColumnId;
      const priorityLabel = (PRIORITY_MAP[t.priority] || 'Medium') as TaskCardProps['priority'];
      const assigneeName = t.assignee?.fullName || t.assignee?.email || 'Unassigned';
      const dueDateStr = t.dueDate
        ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '';

      return {
        id: t.id,
        dbId: t.id,
        title: t.title,
        priority: priorityLabel,
        assignee: assigneeName,
        dueDate: dueDateStr,
        columnId,
        order: t.order || 0,
      };
    });
  }, [apiTasks, localTasks]);



  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, order }: { id: string; status: string; order?: number }) =>
      tasksApi.updateTaskStatus(id, status, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId, slug] });
      setLocalTasks(null);
    },
    onError: () => {
      // Rollback on error
      setLocalTasks(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId, slug] });
    },
  });

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeId) || null,
    [activeId, tasks]
  );

  const getTasksByColumn = useCallback(
    (columnId: ColumnId) => tasks.filter((t) => t.columnId === columnId),
    [tasks]
  );

  const findColumnOfItem = useCallback(
    (id: string): ColumnId | undefined => {
      if (COLUMNS.some((c) => c.id === id)) return id as ColumnId;
      return tasks.find((t) => t.id === id)?.columnId;
    },
    [tasks]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Initialize local tasks for optimistic updates
    setLocalTasks(tasks);
  }, [tasks]);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeColumn = findColumnOfItem(active.id as string);
      const overColumn = findColumnOfItem(over.id as string);

      if (!activeColumn || !overColumn || activeColumn === overColumn) return;

      setLocalTasks((prev) => {
        if (!prev) return prev;
        return prev.map((task) =>
          task.id === active.id ? { ...task, columnId: overColumn } : task
        );
      });
    },
    [findColumnOfItem]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) {
        setLocalTasks(null);
        return;
      }

      const activeColumn = findColumnOfItem(active.id as string);
      const overColumn = findColumnOfItem(over.id as string);

      if (!activeColumn || !overColumn) {
        setLocalTasks(null);
        return;
      }

      const dbStatus = COLUMNS.find((c) => c.id === overColumn)?.dbStatus || 'TODO';

      setLocalTasks((prev) => {
        if (!prev) return prev;
        
        // We do optimistic reordering
        const activeTaskIndex = prev.findIndex((t) => t.id === active.id);
        if (activeTaskIndex === -1) return prev;
        
        const activeTask = { ...prev[activeTaskIndex], columnId: overColumn };
        const withoutActive = prev.filter((t) => t.id !== active.id);
        
        const columnTasks = withoutActive.filter((t) => t.columnId === overColumn);
        const otherTasks = withoutActive.filter((t) => t.columnId !== overColumn);
        
        let insertIndex = columnTasks.findIndex((t) => t.id === over.id);
        if (insertIndex === -1) {
          // If over is not a task, it must be the column itself. Insert at end.
          insertIndex = columnTasks.length;
        } else {
          // If moving down within same column, insert after
          if (activeColumn === overColumn) {
            const oldIndex = prev.filter(t => t.columnId === overColumn).findIndex(t => t.id === active.id);
            if (oldIndex < insertIndex) {
              insertIndex += 1;
            }
          }
        }

        columnTasks.splice(insertIndex, 0, activeTask);

        // Calculate new order
        let newOrder = 1000;
        if (columnTasks.length > 1) {
          if (insertIndex === 0) {
            newOrder = columnTasks[1].order - 1000;
          } else if (insertIndex === columnTasks.length - 1) {
            newOrder = columnTasks[columnTasks.length - 2].order + 1000;
          } else {
            newOrder = (columnTasks[insertIndex - 1].order + columnTasks[insertIndex + 1].order) / 2;
          }
        }
        
        activeTask.order = newOrder;

        // Fire mutation
        updateStatusMutation.mutate({ 
          id: active.id as string, 
          status: dbStatus, 
          order: newOrder 
        });

        const newTasks = [...otherTasks, ...columnTasks];
        setTimeout(() => setLocalTasks(null), 500);
        return newTasks;
      });
    },
    [findColumnOfItem, updateStatusMutation]
  );

  /* Project name from projectId */
  const projectName = projectId ? `Project Board` : 'All Tasks';

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center max-w-md">
          Failed to load tasks. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col relative z-10 animate-[fadeIn_0.6s_ease-out]">
      {/* Board Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.05] bg-[#0a0a0e]/40 backdrop-blur-xl shrink-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white mb-1">
            {projectName}
          </h1>
          <p className="text-sm font-medium text-neutral-400">
            {projectId
              ? `${tasks.length} tasks across ${COLUMNS.length} columns`
              : `Showing all ${tasks.length} tasks across all projects`
            }
          </p>
        </div>
        <div className="flex items-center gap-5">
          {projectId && (
            <button
              onClick={() => setAddTaskColumn('todo')}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 lg:p-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/[0.1]">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full min-w-max pb-4">
            {COLUMNS.map((column) => (
              <DroppableColumn
                key={column.id}
                column={column}
                tasks={getTasksByColumn(column.id)}
                onAddTask={projectId ? (colId) => setAddTaskColumn(colId) : undefined}
                onDeleteTask={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}>
            {activeTask ? (
              <div className="rotate-[4deg] scale-105 opacity-95 shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-50">
                <TaskCard {...activeTask} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Add Task Modal */}
      {addTaskColumn && projectId && (
        <AddTaskModal
          projectId={projectId}
          defaultColumnId={addTaskColumn}
          onClose={() => setAddTaskColumn(null)}
        />
      )}
    </div>
  );
}
