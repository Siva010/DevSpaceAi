import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Clock, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { documentsApi } from '../../lib/api/documents.api';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export default function DocumentEditor() {
  const { slug, documentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [viewingVersionId, setViewingVersionId] = useState<string | null>(null);

  const { data: docData, isLoading, isError } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => documentsApi.getDocument(documentId!),
    enabled: !!documentId,
  });

  useEffect(() => {
    if (docData && !viewingVersionId) {
      setTitle(docData.title);
      setContent(docData.content || '');
      setHasChanges(false);
    }
  }, [docData, viewingVersionId]);

  const updateMutation = useMutation({
    mutationFn: (payload: { title: string; content: string }) => documentsApi.updateDocument(documentId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', documentId] });
      queryClient.invalidateQueries({ queryKey: ['documents', slug] });
      setSaved(true);
      setHasChanges(false);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasChanges && !updateMutation.isPending) {
          handleSave();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasChanges, updateMutation.isPending]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  const handleSave = () => {
    if (!title.trim() || viewingVersionId) return;
    updateMutation.mutate({ title, content });
  };

  const handleRestore = () => {
    if (!viewingVersionId || !docData?.versions) return;
    const version = docData.versions.find(v => v.id === viewingVersionId);
    if (version) {
      setContent(version.content);
      setViewingVersionId(null);
      // Immediately save to create a new version and update current
      updateMutation.mutate({ title, content: version.content });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isError || !docData) {
    return (
      <div className="w-full h-full flex items-center justify-center text-rose-400">
        Failed to load document.
      </div>
    );
  }

  const activeContent = viewingVersionId 
    ? docData.versions?.find(v => v.id === viewingVersionId)?.content || '' 
    : content;

  return (
    <div className="w-full h-full flex overflow-hidden relative z-10 animate-[fadeIn_0.3s_ease-out]">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 border-b border-white/[0.05] flex items-center justify-between px-6 bg-[#0a0a0e]/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => navigate(`/workspace/${slug}/documents`)}
              className="p-2 text-neutral-400 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setHasChanges(true); }}
              disabled={!!viewingVersionId}
              className="bg-transparent text-lg font-bold text-white placeholder:text-neutral-600 focus:outline-none flex-1 disabled:opacity-50"
              placeholder="Document Title"
            />
          </div>
          
          <div className="flex items-center gap-4 ml-4">
            {saved && (
              <span className="flex items-center gap-1.5 text-[13px] font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Saved
              </span>
            )}
            
            {viewingVersionId ? (
              <div className="flex items-center gap-3">
                <span className="text-amber-400 text-sm font-bold bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/20">
                  Viewing History
                </span>
                <button
                  onClick={() => setViewingVersionId(null)}
                  className="px-4 py-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                >
                  Restore Version
                </button>
              </div>
            ) : (
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto bg-[#0d0d12]">
          <div className="max-w-4xl mx-auto p-8 h-full">
            <textarea
              value={activeContent}
              onChange={(e) => { if (!viewingVersionId) { setContent(e.target.value); setHasChanges(true); } }}
              disabled={!!viewingVersionId}
              placeholder="Start typing your document content here..."
              className="w-full h-full bg-transparent text-neutral-300 font-medium text-[15px] leading-relaxed resize-none focus:outline-none disabled:opacity-80"
            />
          </div>
        </div>
      </div>

      {/* Version History Sidebar */}
      <div className="w-80 border-l border-white/[0.05] bg-[#0a0a0e]/60 backdrop-blur-xl flex flex-col h-full shrink-0">
        <div className="p-5 border-b border-white/[0.05] flex items-center gap-3">
          <Clock className="w-5 h-5 text-neutral-400" />
          <h3 className="font-bold text-white text-[15px]">Version History</h3>
        </div>
        
        <div className="flex-1 overflow-auto p-4 space-y-3">
          <button
            onClick={() => setViewingVersionId(null)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              !viewingVersionId
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-black/40 border-white/[0.05] text-neutral-400 hover:border-white/[0.15] hover:bg-white/[0.02]'
            }`}
          >
            <div className="font-bold text-[13px] mb-1">Current Version</div>
            <div className="text-[11px] opacity-70">Active draft</div>
          </button>

          {docData.versions?.map((version, idx) => (
            <button
              key={version.id}
              onClick={() => setViewingVersionId(version.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                viewingVersionId === version.id
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-black/40 border-white/[0.05] text-neutral-400 hover:border-white/[0.15] hover:bg-white/[0.02]'
              }`}
            >
              <div className="font-bold text-[13px] mb-1 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Version {docData.versions!.length - idx}
              </div>
              <div className="text-[11px] opacity-70">
                {formatDate(version.createdAt)}
              </div>
            </button>
          ))}
          
          {(!docData.versions || docData.versions.length === 0) && (
            <div className="text-center p-4 text-[13px] font-medium text-neutral-500">
              No previous versions yet. Save changes to create a version history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
