import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Settings as SettingsIcon, AlertTriangle, Trash2, CheckCircle2, Loader2, X } from 'lucide-react';
import { organizationsApi } from '../../lib/api/organizations.api';


function DeleteConfirmModal({ orgName, onConfirm, onClose }: { orgName: string; onConfirm: () => void; onClose: () => void }) {
  const [confirmText, setConfirmText] = useState('');
  const isMatch = confirmText === orgName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#0d0d12] border border-rose-500/20 rounded-[1.5rem] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-[fadeIn_0.3s_ease-out]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Delete Workspace</h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
          This action is <span className="text-rose-400 font-bold">permanent and irreversible</span>. All projects, tasks, documents, and team data will be deleted.
        </p>

        <div className="space-y-3 mb-6">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Type <span className="text-white font-bold">{orgName}</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={orgName}
            className="w-full bg-black/40 border border-rose-500/20 rounded-xl py-3 px-4 text-sm font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500/40 transition-all"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/[0.06] text-neutral-400 hover:text-white hover:border-white/[0.12] text-sm font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isMatch}
            className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all"
          >
            Delete Workspace
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const [workspaceName, setWorkspaceName] = useState('');
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch workspace data
  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: organizationsApi.getOrganizations,
  });

  const currentWorkspace = workspaces?.find((w) => w.slug === slug);

  useEffect(() => {
    if (currentWorkspace) {
      setWorkspaceName(currentWorkspace.name);
    }
  }, [currentWorkspace]);

  const updateMutation = useMutation({
    mutationFn: (name: string) => organizationsApi.updateName(slug!, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSave = () => {
    if (!workspaceName.trim()) return;
    updateMutation.mutate(workspaceName);
  };

  const deleteMutation = useMutation({
    mutationFn: () => organizationsApi.deleteOrganization(slug!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      // Redirect to workspaces selection page
      navigate('/workspaces');
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <div className="w-full min-h-full flex justify-center p-6 sm:p-10 lg:p-12 relative z-10">
      <div className="w-full max-w-[1000px] space-y-10 animate-[fadeIn_0.6s_ease-out]">

        {/* Header */}
        <div className="pb-2">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">Settings</h1>
          <p className="text-sm text-neutral-400 font-medium">Manage your workspace configuration.</p>
        </div>

        {/* General Settings */}
        <section className="bg-[#0a0a0e]/60 backdrop-blur-xl border border-white/[0.05] rounded-[1.5rem] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="px-8 py-5 border-b border-white/[0.05] flex items-center gap-3 bg-white/[0.01]">
            <div className="p-2 bg-white/[0.05] rounded-lg">
              <SettingsIcon className="w-4 h-4 text-neutral-300" />
            </div>
            <h2 className="text-[15px] font-bold text-white">General Configuration</h2>
          </div>

          <div className="p-8 space-y-8">
            {/* Workspace Name */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider" htmlFor="workspace-name">
                Workspace Name
              </label>
              <input
                id="workspace-name"
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.05] rounded-xl py-3 px-4 text-[14px] font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all shadow-inner"
              />
              <p className="text-[12px] font-medium text-neutral-500">This is the name displayed across the workspace.</p>
            </div>

            {/* Workspace Slug */}
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider" htmlFor="workspace-slug">
                Workspace URL
              </label>
              <div className="flex items-center gap-0">
                <span className="bg-black/40 border border-white/[0.05] border-r-0 rounded-l-xl py-3 px-4 text-[14px] font-medium text-neutral-500">
                  devspace.io/
                </span>
                <input
                  id="workspace-slug"
                  type="text"
                  value={slug || ''}
                  disabled
                  className="flex-1 bg-black/20 border border-white/[0.05] rounded-r-xl py-3 px-4 text-[14px] font-bold text-neutral-600 cursor-not-allowed"
                />
              </div>
              <p className="text-[12px] font-medium text-neutral-500">The workspace URL slug cannot be changed after creation.</p>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/[0.05]">
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending || !workspaceName.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                {updateMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  'Save Changes'
                )}
              </button>
              {saved && (
                <span className="flex items-center gap-2 text-[13px] font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Changes saved successfully
                </span>
              )}
              {updateMutation.isError && (
                <span className="text-[13px] font-bold text-rose-400">Failed to save changes.</span>
              )}
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-rose-500/[0.02] backdrop-blur-xl border border-rose-500/20 rounded-[1.5rem] overflow-hidden shadow-[0_8px_32px_rgba(244,63,94,0.1)]">
          <div className="px-8 py-5 border-b border-rose-500/10 flex items-center gap-3 bg-rose-500/[0.05]">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <h2 className="text-[15px] font-bold text-rose-400">Danger Zone</h2>
          </div>

          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-[15px] font-bold text-white mb-2">Delete this workspace</h3>
                <p className="text-[13px] font-medium text-neutral-400 max-w-lg leading-relaxed">
                  Once you delete a workspace, there is no going back. All projects, documents, tasks, and team member data will be permanently removed.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={deleteMutation.isPending}
                className="flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Workspace'}
              </button>
            </div>
          </div>
        </section>

      </div>

      {showDeleteModal && currentWorkspace && (
        <DeleteConfirmModal
          orgName={currentWorkspace.name}
          onConfirm={handleDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
