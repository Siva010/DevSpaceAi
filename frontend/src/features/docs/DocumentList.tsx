import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Plus, FileText, Clock, X, Loader2, Trash2 } from 'lucide-react';
import { documentsApi } from '../../lib/api/documents.api';

const EMOJI_LIST = ['📋', '🔧', '🎨', '📈', '⚡', '📝', '🚀', '💡', '🔍', '📊'];

function getDocEmoji(title: string) {
  const hash = title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return EMOJI_LIST[hash % EMOJI_LIST.length];
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return 'Just now'; // Handle server clock skew or future dates
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CreateDocumentModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const { slug } = useParams();

  const createMutation = useMutation({
    mutationFn: documentsApi.createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', slug] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#0d0d12] border border-white/[0.08] rounded-[1.5rem] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-[fadeIn_0.3s_ease-out]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white">New Document</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Title</label>
            <input
              type="text"
              placeholder="Document title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.06] rounded-xl py-3 px-4 text-sm font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Content <span className="text-neutral-600 normal-case font-normal">(optional)</span></label>
            <textarea
              placeholder="Start writing..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full bg-black/40 border border-white/[0.06] rounded-xl py-3 px-4 text-sm font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all resize-none"
            />
          </div>

          {createMutation.isError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
              Failed to create document. Please try again.
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
              onClick={() => createMutation.mutate({ title, content })}
              disabled={!title.trim() || createMutation.isPending}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              {createMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
              ) : (
                'Create Document'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DocumentList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: documents, isLoading, isError } = useQuery({
    queryKey: ['documents', slug],
    queryFn: documentsApi.getDocuments,
  });

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: documentsApi.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', slug] });
    },
  });

  const filteredDocs = (documents || []).filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.content && doc.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full min-h-full flex justify-center p-6 sm:p-10 lg:p-12 relative z-10">
      <div className="w-full max-w-[1500px] space-y-10 animate-[fadeIn_0.6s_ease-out]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">Documents</h1>
            <p className="text-sm text-neutral-400 font-medium">Create and manage your workspace documents.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            <Plus className="w-4 h-4" />
            New Document
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0e]/60 backdrop-blur-xl border border-white/[0.05] rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center">
            Failed to load documents. Please try again.
          </div>
        ) : (
          /* Documents Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate(`/workspace/${slug}/documents/${doc.id}`)}
                className="group relative flex flex-col bg-[#0a0a0e]/60 backdrop-blur-xl border border-white/[0.05] rounded-[1.5rem] p-6 hover:border-white/[0.15] transition-all duration-500 hover:-translate-y-1 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] cursor-pointer"
              >
                {/* Inner glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-transparent to-white/0 group-hover:from-white/[0.02] group-hover:to-transparent transition-colors duration-500 pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-2xl shadow-inner transition-transform duration-500 group-hover:scale-110">
                    {getDocEmoji(doc.title)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirmDeleteId === doc.id) {
                        deleteMutation.mutate(doc.id);
                        setConfirmDeleteId(null);
                      } else {
                        setConfirmDeleteId(doc.id);
                        setTimeout(() => setConfirmDeleteId(null), 3000);
                      }
                    }}
                    className={cn(
                      'transition-colors opacity-0 group-hover:opacity-100 p-1.5 rounded-lg',
                      confirmDeleteId === doc.id
                        ? 'text-rose-400 hover:text-rose-300 text-xs font-bold px-2 py-1 bg-rose-500/20 border border-rose-500/30'
                        : 'text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10'
                    )}
                    title="Delete Document"
                  >
                    {confirmDeleteId === doc.id ? 'Confirm?' : <Trash2 className="w-5 h-5" />}
                  </button>
                </div>

                {/* Title */}
                <h3 className="relative z-10 font-bold text-white text-[15px] mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
                  {doc.title}
                </h3>

                {/* Preview */}
                <p className="relative z-10 text-[13px] font-medium text-neutral-400 leading-relaxed mb-6 line-clamp-3 flex-1">
                  {doc.content || 'No content yet. Click to start writing.'}
                </p>

                {/* Footer */}
                <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/[0.05]">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(doc.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* New Document Card */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="group flex flex-col text-left bg-transparent border-2 border-dashed border-white/[0.1] rounded-[1.5rem] p-7 hover:border-blue-500/40 hover:bg-blue-500/[0.02] transition-all duration-500 focus:outline-none justify-center items-center text-neutral-400 hover:text-white min-h-[240px]"
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.05] group-hover:bg-blue-500/20 group-hover:text-blue-400 flex items-center justify-center mb-4 transition-colors duration-500">
                <FileText className="w-6 h-6" />
              </div>
              <span className="font-bold text-[15px] group-hover:text-blue-400 transition-colors duration-500">
                Create Document
              </span>
            </button>

            {/* Empty State */}
            {filteredDocs.length === 0 && !isLoading && (
              <div className="col-span-full text-center py-20 bg-[#0a0a0e]/40 backdrop-blur-md border border-white/[0.05] rounded-[2rem]">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.05] flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Search className="w-8 h-8 text-neutral-500" />
                </div>
                <p className="text-white font-bold text-lg mb-1">
                  {searchQuery ? 'No documents found' : 'No documents yet'}
                </p>
                <p className="text-neutral-500 text-sm font-medium">
                  {searchQuery ? 'Try a different search term.' : 'Create your first document to get started.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && <CreateDocumentModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}
