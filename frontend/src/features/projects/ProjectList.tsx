import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, FolderKanban, CheckCircle2, ArrowRight, X, Loader2, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { projectsApi } from '../../lib/api/projects.api';

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'On Hold': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Completed: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Archived: 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20',
};

const PROJECT_COLORS = [
  'from-blue-600 to-cyan-500 shadow-blue-500/30',
  'from-violet-600 to-purple-500 shadow-violet-500/30',
  'from-emerald-500 to-teal-400 shadow-emerald-500/30',
  'from-amber-500 to-orange-500 shadow-amber-500/30',
  'from-rose-500 to-pink-500 shadow-rose-500/30',
];

function generateKey(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 5) || name.slice(0, 3).toUpperCase();
}

// Deterministic hash for consistent project colors based on ID
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [keyEdited, setKeyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const handleNameChange = (v: string) => {
    setName(v);
    if (!keyEdited) setKey(generateKey(v));
  };

  const createMutation = useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!name.trim() || !key.trim()) return;
    createMutation.mutate({ name, key, description });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#0d0d12] border border-white/[0.08] rounded-[1.5rem] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-[fadeIn_0.3s_ease-out]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white">New Project</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Project Name</label>
            <input
              type="text"
              placeholder="e.g. Engineering Platform"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.06] rounded-xl py-3 px-4 text-sm font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Project Key</label>
            <input
              type="text"
              placeholder="ENG"
              value={key}
              onChange={(e) => { setKey(e.target.value.toUpperCase().slice(0, 10)); setKeyEdited(true); }}
              className="w-full bg-black/40 border border-white/[0.06] rounded-xl py-3 px-4 text-sm font-bold text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all tracking-widest"
            />
            <p className="text-xs text-neutral-500">Short identifier used in task IDs (e.g. ENG-1)</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Description <span className="text-neutral-600 normal-case font-normal">(optional)</span></label>
            <textarea
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-black/40 border border-white/[0.06] rounded-xl py-3 px-4 text-sm font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-none"
            />
          </div>

          {createMutation.isError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
              {(createMutation.error as any)?.response?.data?.message || 'Failed to create project.'}
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
              disabled={!name.trim() || !key.trim() || createMutation.isPending}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              {createMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectList() {
  const { slug } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ['projects', slug],
    queryFn: projectsApi.getProjects,
  });

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: projectsApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', slug] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects
      .filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .map((p) => ({
        ...p,
        status: p.status || 'Active',
        progress: p.progress ?? 0,
        totalTasks: p.totalTasks ?? 0,
        completedTasks: p.completedTasks ?? 0,
        color: PROJECT_COLORS[hashCode(p.id) % PROJECT_COLORS.length],
      }));
  }, [projects, searchQuery]);

  return (
    <div className="w-full min-h-full flex justify-center p-6 sm:p-10 lg:p-12 relative z-10">
      <div className="w-full max-w-[1500px] space-y-10 animate-[fadeIn_0.6s_ease-out]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">Projects</h1>
            <p className="text-sm text-neutral-400 font-medium">Manage and track all your workspace projects.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0e]/60 backdrop-blur-xl border border-white/[0.05] rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
          />
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center">
            Failed to load projects. Please try again.
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProjects.map((project) => (
              <Link
                key={project.id}
                to={`/workspace/${slug}/projects/${project.id}`}
                className="group relative flex flex-col bg-[#0a0a0e]/60 backdrop-blur-xl border border-white/[0.05] rounded-[1.5rem] p-7 hover:border-white/[0.15] transition-all duration-500 hover:-translate-y-1 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              >
                {/* Inner glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-transparent to-white/0 group-hover:from-white/[0.02] group-hover:to-transparent transition-colors duration-500 pointer-events-none" />

                {/* Top Row */}
                <div className="relative z-10 flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white text-[13px] font-bold shadow-lg transition-transform duration-500 group-hover:scale-110', project.color)}>
                      {project.key}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-[15px] group-hover:text-blue-400 transition-colors">
                        {project.name}
                      </h3>
                      <span className={cn('inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1.5 shadow-sm', STATUS_STYLES[project.status] || STATUS_STYLES.Active)}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirmDeleteId === project.id) {
                        deleteMutation.mutate(project.id);
                        setConfirmDeleteId(null);
                      } else {
                        setConfirmDeleteId(project.id);
                        setTimeout(() => setConfirmDeleteId(null), 3000);
                      }
                    }}
                    className={cn(
                      'transition-colors opacity-0 group-hover:opacity-100 p-1.5 rounded-lg',
                      confirmDeleteId === project.id
                        ? 'text-rose-400 hover:text-rose-300 text-xs font-bold px-2 py-1 bg-rose-500/20 border border-rose-500/30'
                        : 'text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10'
                    )}
                    title="Delete Project"
                  >
                    {confirmDeleteId === project.id ? 'Confirm?' : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>

                {/* Description */}
                <p className="relative z-10 text-[13px] font-medium text-neutral-400 leading-relaxed mb-6 line-clamp-2 flex-1">
                  {project.description || 'No description provided.'}
                </p>

                {/* Progress Bar */}
                <div className="relative z-10 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Progress</span>
                    <span className="text-[12px] font-bold text-neutral-300">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-black/40 border border-white/[0.05] rounded-full overflow-hidden shadow-inner">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-1000',
                        project.progress === 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                        project.progress < 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                        'bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                      )}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer Stats */}
                <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/[0.05]">
                  <div className="flex items-center gap-5 text-xs font-semibold text-neutral-500">
                    <span className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
                      {project.completedTasks}/{project.totalTasks} tasks
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100 group-hover:translate-x-1 duration-300" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#0a0a0e]/40 backdrop-blur-md border border-white/[0.05] rounded-[2rem]">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.05] flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FolderKanban className="w-8 h-8 text-neutral-500" />
            </div>
            <p className="text-white font-bold text-lg mb-1">No projects found</p>
            <p className="text-neutral-500 text-sm font-medium mb-6">
              {searchQuery ? 'Try adjusting your search filters.' : 'Create your first project to get started.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            )}
          </div>
        )}
      </div>

      {showCreateModal && <CreateProjectModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
