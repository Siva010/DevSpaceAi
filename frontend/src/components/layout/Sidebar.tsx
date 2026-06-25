import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  FileText,
  UsersRound,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  Zap,
  LogOut,
  User,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSelector, useDispatch } from 'react-redux';
import { clearAuth, toggleSidebar, type RootState } from '../../store/store';
import { usersApi } from '../../lib/api/users.api';
import { authApi } from '../../lib/api/auth.api';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, segment: 'dashboard' },
  { label: 'Projects', icon: FolderKanban, segment: 'projects' },
  { label: 'Tasks', icon: ListTodo, segment: 'tasks' },
  { label: 'Documents', icon: FileText, segment: 'documents' },
  { label: 'Team', icon: UsersRound, segment: 'team' },
  { label: 'Analytics', icon: BarChart3, segment: 'analytics' },
  { label: 'Settings', icon: Settings, segment: 'settings' },
];

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function Sidebar() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dispatch = useDispatch();
  const collapsed = useSelector((state: RootState) => state.ui.sidebarCollapsed);

  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get auth state from Redux
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { data: profile } = useQuery({
    queryKey: ['me'],
    queryFn: usersApi.getMe,
    enabled: !!authUser,
    staleTime: 5 * 60 * 1000,
  });

  const user = profile || authUser;
  const displayName = user?.fullName || user?.email || 'User';
  const displayEmail = user?.email || '';
  const initials = displayName ? getInitials(displayName) : 'U';

  const handleSignOut = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout failed', err);
    }
    dispatch(clearAuth());
    navigate('/login');
    setShowUserMenu(false);
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col h-full border-r border-white/[0.05] bg-black/40 backdrop-blur-xl transition-all duration-300 ease-in-out shrink-0 z-20',
        collapsed ? 'w-[80px]' : 'w-[260px]'
      )}
    >
      {/* ── Logo & Brand ── */}
      <div className="h-16 flex items-center px-6 border-b border-white/[0.05] shrink-0">
        <Link
          to={`/workspace/${slug}/dashboard`}
          className="flex items-center gap-3 group"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.4)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-all duration-300 transform group-hover:scale-105">
            <Zap className="w-5 h-5 text-white animate-pulse" strokeWidth={2.5} />
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold tracking-tight text-white select-none">
              Dev<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">Space</span>
            </span>
          )}
        </Link>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const path = `/workspace/${slug}/${item.segment}`;
          const isActive = location.pathname.startsWith(path);
          const Icon = item.icon;

          return (
            <Link
              key={item.segment}
              to={path}
              className={cn(
                'group relative flex items-center gap-3.5 rounded-xl text-[14px] font-medium transition-all duration-300',
                collapsed ? 'justify-center px-0 py-3' : 'px-4 py-3',
                isActive
                  ? 'bg-gradient-to-r from-blue-600/20 to-violet-600/10 text-white border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.05]'
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-blue-400 to-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
              )}

              <Icon
                className={cn(
                  'shrink-0 transition-all duration-300',
                  collapsed ? 'w-[22px] h-[22px]' : 'w-5 h-5',
                  isActive
                    ? 'text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]'
                    : 'text-neutral-500 group-hover:text-neutral-300'
                )}
              />

              {!collapsed && <span className="tracking-wide">{item.label}</span>}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <span className="absolute left-full ml-4 px-3 py-1.5 rounded-lg bg-[#0f0f13] border border-white/10 text-sm text-white font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 shadow-2xl">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Collapse Toggle ── */}
      <div className="px-4 py-3 border-t border-white/[0.05]">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className={cn(
            'flex items-center gap-3 w-full rounded-xl py-2.5 text-[13px] font-medium text-neutral-500 hover:text-white hover:bg-white/[0.04] transition-all duration-300',
            collapsed ? 'justify-center px-0' : 'px-4'
          )}
        >
          {collapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <>
              <PanelLeftClose className="w-5 h-5" />
              <span className="tracking-wide">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* ── User Profile ── */}
      <div className="px-4 pb-5 pt-2 border-t border-white/[0.05] relative">
        <div
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={cn(
            'group flex items-center rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.05]',
            collapsed ? 'justify-center py-3 px-0' : 'gap-3 p-3'
          )}
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-[12px] font-bold text-white shadow-[0_0_10px_rgba(52,211,153,0.3)] group-hover:shadow-[0_0_15px_rgba(52,211,153,0.5)] transition-shadow">
              {initials}
            </div>
            {/* Online indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-[2.5px] border-[#0a0a0e]" />
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {displayName}
                </p>
                <p className="text-[12px] text-neutral-400 truncate">
                  {displayEmail}
                </p>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-neutral-500 group-hover:text-neutral-300 transition-all", showUserMenu && "rotate-180")} />
            </>
          )}

          {/* Tooltip for collapsed state */}
          {collapsed && (
            <span className="absolute left-full ml-4 px-3 py-1.5 rounded-lg bg-[#0f0f13] border border-white/10 text-sm text-white font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50 shadow-2xl">
              {displayName}
            </span>
          )}
        </div>

        {/* User dropdown menu */}
        {showUserMenu && !collapsed && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#0d0d12] border border-white/[0.08] rounded-xl overflow-hidden shadow-[0_-8px_32px_rgba(0,0,0,0.5)] z-50 animate-[fadeIn_0.2s_ease-out]">
            <button
              onClick={() => { navigate(`/workspace/${slug}/settings`); setShowUserMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-300 hover:bg-white/[0.05] hover:text-white transition-colors"
            >
              <User className="w-4 h-4" />
              Profile & Settings
            </button>
            <div className="h-px bg-white/[0.05]" />
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/[0.08] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
