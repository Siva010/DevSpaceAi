import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { organizationsApi } from '../../lib/api/organizations.api';
import { clearAuth } from '../../store/store';
import { X, Plus, Loader2 } from 'lucide-react';

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function CreateWorkspaceModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slugEdited) setSlug(slugify(v));
  };

  const createMutation = useMutation({
    mutationFn: organizationsApi.createOrganization,
    onSuccess: (org) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      onClose();
      navigate(`/workspace/${org.slug}/dashboard`);
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#0d0d12] border border-white/[0.08] rounded-[1.5rem] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-[fadeIn_0.3s_ease-out]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white">New Workspace</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Workspace Name</label>
            <input
              type="text"
              placeholder="Acme Corp"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.06] rounded-xl py-3 px-4 text-sm font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">URL Slug</label>
            <div className="flex items-center gap-0">
              <span className="bg-black/40 border border-white/[0.06] border-r-0 rounded-l-xl py-3 px-3 text-sm font-medium text-neutral-500 whitespace-nowrap">
                devspace.io/
              </span>
              <input
                type="text"
                placeholder="acme-corp"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
                className="flex-1 bg-black/40 border border-white/[0.06] rounded-r-xl py-3 px-4 text-sm font-bold text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              />
            </div>
          </div>

          {createMutation.isError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
              {(createMutation.error as any)?.response?.data?.message || 'Failed to create workspace. Slug may already be taken.'}
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
              onClick={() => createMutation.mutate({ name, slug })}
              disabled={!name.trim() || !slug.trim() || createMutation.isPending}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              {createMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
              ) : (
                'Create Workspace'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkspaceSelection() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: workspaces, isLoading, isError } = useQuery({
    queryKey: ['workspaces'],
    queryFn: organizationsApi.getOrganizations,
  });

  const handleSignOut = () => {
    dispatch(clearAuth());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#05050A] text-white p-8 relative overflow-hidden flex flex-col">
      {/* Dynamic Background Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[150px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/20 blur-[150px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

      {/* Top Nav */}
      <div className="relative z-10 flex justify-between items-center max-w-5xl mx-auto w-full mb-16 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <span className="text-white font-bold text-sm tracking-tighter drop-shadow-md">DS</span>
          </div>
          <span className="font-bold tracking-tight text-xl">DevSpace</span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm font-semibold text-neutral-400 hover:text-white transition-colors bg-white/[0.03] hover:bg-white/[0.08] px-4 py-2 rounded-lg border border-white/[0.05]"
        >
          Sign out
        </button>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto flex-1 animate-[fadeIn_0.6s_ease-out]">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Select a workspace</h1>
        <p className="text-neutral-400 mb-10 font-medium text-lg">Choose a workspace to continue or create a new one.</p>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center">
            Failed to load workspaces. Please try again.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {workspaces?.map((ws) => {
              const role = ws.role || 'Member';
              const members = ws.membersCount || 1;

              return (
                <button
                  key={ws.id}
                  onClick={() => navigate(`/workspace/${ws.slug}/dashboard`)}
                  className="group relative flex flex-col text-left bg-[#0a0a0e]/60 backdrop-blur-xl border border-white/[0.05] rounded-[1.5rem] p-7 hover:border-white/[0.15] transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 hover:-translate-y-1 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden"
                >
                  {/* Inner glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-colors duration-500 pointer-events-none" />

                  <div className="relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30 mb-5 group-hover:scale-110 transition-transform duration-500">
                    {ws.name.charAt(0)}
                  </div>
                  <h2 className="relative z-10 text-xl font-bold text-white mb-1">{ws.name}</h2>
                  <div className="relative z-10 flex items-center gap-3 mt-2 text-xs font-semibold text-neutral-400 uppercase tracking-wide">
                    <span className="text-blue-400">{role}</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-600" />
                    <span>{members} member{members !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Hover highlight arrow */}
                  <div className="absolute top-7 right-7 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-white/50">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                </button>
              );
            })}

            <button
              onClick={() => setShowCreateModal(true)}
              className="group flex flex-col text-left bg-transparent border-2 border-dashed border-white/[0.1] rounded-[1.5rem] p-7 hover:border-blue-500/40 hover:bg-blue-500/[0.02] transition-all duration-500 focus:outline-none justify-center items-center text-neutral-400 hover:text-white min-h-[200px]"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.05] group-hover:bg-blue-500/20 group-hover:text-blue-400 flex items-center justify-center mb-4 transition-colors duration-500">
                <Plus className="w-6 h-6" />
              </div>
              <span className="font-bold text-lg group-hover:text-blue-400 transition-colors duration-500">Create Workspace</span>
            </button>
          </div>
        )}
      </div>

      {showCreateModal && <CreateWorkspaceModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
