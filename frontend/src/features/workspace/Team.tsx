import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserPlus, MoreHorizontal, Shield, Crown, Star, User, Loader2, X } from 'lucide-react';
import { membersApi, type Member } from '../../lib/api/members.api';

const ROLE_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  OWNER: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]', icon: Crown },
  ADMIN: { color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]', icon: Shield },
  MANAGER: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]', icon: Star },
  MEMBER: { color: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20 shadow-[0_0_10px_rgba(115,115,115,0.2)]', icon: User },
};

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-indigo-500 to-blue-600',
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(email: string) {
  const hash = email.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function formatJoinDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function InviteMemberModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const queryClient = useQueryClient();
  const { slug } = useParams();

  const inviteMutation = useMutation({
    mutationFn: (payload: { email: string; role: string }) => membersApi.addMember(slug!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', slug] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#0d0d12] border border-white/[0.08] rounded-[1.5rem] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-[fadeIn_0.3s_ease-out]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white">Invite Member</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.06] rounded-xl py-3 px-4 text-sm font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.06] rounded-xl py-3 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all appearance-none cursor-pointer"
            >
              <option value="MEMBER">Member</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {inviteMutation.isError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl">
              {(inviteMutation.error as any)?.response?.data?.message || 'Failed to invite member.'}
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
              onClick={() => inviteMutation.mutate({ email, role })}
              disabled={!email.trim() || inviteMutation.isPending}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              {inviteMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Inviting...</>
              ) : (
                'Send Invite'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Team() {
  const { slug } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { data: members, isLoading, isError } = useQuery({
    queryKey: ['members', slug],
    queryFn: () => membersApi.getMembers(slug!),
    enabled: !!slug,
  });

  const filteredMembers = (members || []).filter((member: Member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-full flex justify-center p-6 sm:p-10 lg:p-12 relative z-10">
      <div className="w-full max-w-[1200px] space-y-10 animate-[fadeIn_0.6s_ease-out]">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">Team</h1>
            <p className="text-sm text-neutral-400 font-medium">Manage your workspace members and their roles.</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0e]/60 backdrop-blur-xl border border-white/[0.05] rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          </div>
        ) : isError ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center">
            Failed to load team members. Please try again.
          </div>
        ) : (
          <>
            {/* Members Count */}
            <div className="flex items-center gap-2 text-[13px] font-bold text-neutral-500 uppercase tracking-wider">
              <span>{filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Team Table */}
            <div className="bg-[#0a0a0e]/60 backdrop-blur-xl border border-white/[0.05] rounded-[1.5rem] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-white/[0.05] bg-white/[0.01]">
                <div className="col-span-5 sm:col-span-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Member</div>
                <div className="col-span-4 sm:col-span-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider hidden sm:block">Email</div>
                <div className="col-span-4 sm:col-span-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Role</div>
                <div className="col-span-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider hidden sm:block">Joined</div>
                <div className="col-span-3 sm:col-span-1"></div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-white/[0.05]">
                {filteredMembers.map((member) => {
                  const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.MEMBER;
                  const RoleIcon = roleConfig.icon;
                  const avatarColor = getAvatarColor(member.email);

                  return (
                    <div
                      key={member.id}
                      className="grid grid-cols-12 gap-4 px-8 py-5 items-center hover:bg-white/[0.02] transition-colors duration-300 group"
                    >
                      {/* Avatar + Name */}
                      <div className="col-span-5 sm:col-span-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-[0.6rem] bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-[13px] font-bold shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                          {getInitials(member.name)}
                        </div>
                        <span className="font-bold text-white text-[14px] group-hover:text-blue-400 transition-colors">{member.name}</span>
                      </div>

                      {/* Email */}
                      <div className="col-span-4 sm:col-span-3 text-[13px] font-medium text-neutral-400 truncate hidden sm:block">
                        {member.email}
                      </div>

                      {/* Role Badge */}
                      <div className="col-span-4 sm:col-span-2 flex items-center">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border uppercase tracking-wider ${roleConfig.color}`}>
                          <RoleIcon className="w-3.5 h-3.5" />
                          {member.role}
                        </span>
                      </div>

                      {/* Joined Date */}
                      <div className="col-span-2 text-[13px] font-medium text-neutral-500 hidden sm:block">
                        {formatJoinDate(member.joinedDate)}
                      </div>

                      {/* Actions */}
                      <div className="col-span-3 sm:col-span-1 flex justify-end">
                        <button className="text-neutral-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-white/10">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {filteredMembers.length === 0 && (
                <div className="px-8 py-20 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.05] flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Search className="w-8 h-8 text-neutral-500" />
                  </div>
                  <p className="text-white font-bold text-lg mb-1">No members found</p>
                  <p className="text-neutral-500 text-sm font-medium">Try a different search term.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showInviteModal && <InviteMemberModal onClose={() => setShowInviteModal(false)} />}
    </div>
  );
}
