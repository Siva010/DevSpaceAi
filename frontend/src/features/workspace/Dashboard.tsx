import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import {
  FolderKanban,
  ListTodo,
  UsersRound,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  GitCommit,
  MessageSquare,
  CheckCircle2,
  UserPlus,
  FileUp,
  Zap,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { type RootState } from '../../store/store';
import { organizationsApi } from '../../lib/api/organizations.api';
import { projectsApi } from '../../lib/api/projects.api';

const STAT_CARDS = [
  {
    label: 'Total Projects',
    value: '12',
    change: '+3',
    trend: 'up' as const,
    icon: FolderKanban,
    gradient: 'from-blue-600 to-cyan-500',
    shadow: 'shadow-blue-500/30',
    bg: 'bg-blue-500/10',
    accent: 'text-cyan-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]',
  },
  {
    label: 'Active Tasks',
    value: '48',
    change: '+7',
    trend: 'up' as const,
    icon: ListTodo,
    gradient: 'from-violet-600 to-purple-500',
    shadow: 'shadow-violet-500/30',
    bg: 'bg-violet-500/10',
    accent: 'text-purple-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]',
  },
  {
    label: 'Team Members',
    value: '8',
    change: '+2',
    trend: 'up' as const,
    icon: UsersRound,
    gradient: 'from-emerald-500 to-teal-400',
    shadow: 'shadow-emerald-500/30',
    bg: 'bg-emerald-500/10',
    accent: 'text-teal-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]',
  },
  {
    label: 'Completion Rate',
    value: '87%',
    change: '-2%',
    trend: 'down' as const,
    icon: TrendingUp,
    gradient: 'from-amber-500 to-orange-500',
    shadow: 'shadow-amber-500/30',
    bg: 'bg-amber-500/10',
    accent: 'text-orange-400',
    glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]',
  },
];

const RECENT_ACTIVITY = [
  {
    id: 1,
    icon: GitCommit,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    message: 'Pushed 3 commits to',
    target: 'frontend-redesign',
    user: 'Siva Kumar',
    time: '2 min ago',
  },
  {
    id: 2,
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    message: 'Completed task',
    target: 'Setup CI/CD Pipeline',
    user: 'Priya Sharma',
    time: '18 min ago',
  },
  {
    id: 3,
    icon: MessageSquare,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    message: 'Commented on',
    target: 'API Rate Limiting',
    user: 'Arjun Patel',
    time: '45 min ago',
  },
  {
    id: 4,
    icon: UserPlus,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    message: 'Joined workspace as',
    target: 'Developer',
    user: 'Maya Singh',
    time: '1 hr ago',
  },
  {
    id: 5,
    icon: FileUp,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    message: 'Uploaded design specs for',
    target: 'Mobile App V2',
    user: 'Ravi Menon',
    time: '3 hrs ago',
  },
  {
    id: 6,
    icon: Zap,
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/10',
    message: 'Deployed to production',
    target: 'api-service v2.4.1',
    user: 'Siva Kumar',
    time: '5 hrs ago',
  },
];

const CHART_DATA = [
  { label: 'Mon', value: 65 },
  { label: 'Tue', value: 82 },
  { label: 'Wed', value: 45 },
  { label: 'Thu', value: 93 },
  { label: 'Fri', value: 71 },
  { label: 'Sat', value: 38 },
  { label: 'Sun', value: 56 },
];

const MAX_CHART_VALUE = Math.max(...CHART_DATA.map((d) => d.value));

/* ─── Component ─── */

export default function Dashboard() {
  const { slug } = useParams();
  const authUser = useSelector((state: RootState) => state.auth.user);

  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: organizationsApi.getOrganizations,
    staleTime: 5 * 60 * 1000,
  });

  const { data: projects } = useQuery({
    queryKey: ['projects', slug],
    queryFn: projectsApi.getProjects,
    staleTime: 2 * 60 * 1000,
    enabled: !!slug,
  });

  const workspace = workspaces?.find((w) => w.slug === slug) || { name: slug || 'Workspace' };

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? 'Good morning'
      : now.getHours() < 18
        ? 'Good afternoon'
        : 'Good evening';

  const firstName = authUser?.fullName?.split(' ')[0] || authUser?.email?.split('@')[0] || '';

  // Real stats from API
  const totalProjects = projects?.length ?? 0;
  const totalTasks = projects?.reduce((sum, p) => sum + (p.totalTasks || 0), 0) ?? 0;
  const completedTasks = projects?.reduce((sum, p) => sum + (p.completedTasks || 0), 0) ?? 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="w-full min-h-full flex justify-center p-6 sm:p-10 lg:p-12">
      <div className="w-full max-w-[1500px] space-y-10 animate-[fadeIn_0.6s_ease-out] relative z-10">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-2">
          <div>
            <p className="text-sm font-medium text-neutral-400 mb-1 tracking-wide uppercase">{greeting}{firstName ? `, ${firstName}` : ''} 👋</p>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">
              {workspace.name}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400 text-glow">
                Dashboard
              </span>
            </h1>
            <p className="text-sm text-neutral-400 mt-2 font-medium">
              Here's what's happening across your workspace today.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5 backdrop-blur-md shadow-lg shadow-black/20 shrink-0">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Last updated: just now</span>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {STAT_CARDS.map((stat, i) => {
            const Icon = stat.icon;
            const isUp = stat.trend === 'up';
            // Use real data for the first two and last cards
            const realValues = [
              String(totalProjects),
              String(totalTasks),
              stat.value, // Team Members - still static until members API is used here
              `${completionRate}%`,
            ];
            const displayValue = realValues[i] ?? stat.value;

            return (
              <div
                key={stat.label}
                className={cn(
                  "group relative bg-[#0a0a0e]/60 backdrop-blur-xl border border-white/[0.05] rounded-[1.5rem] p-7 hover:border-white/[0.1] transition-all duration-500 hover:-translate-y-1 cursor-default overflow-hidden",
                  stat.glow
                )}
              >
                {/* Animated Glow effect */}
                <div
                  className={cn(
                    'absolute -top-16 -right-16 w-40 h-40 rounded-full opacity-20 blur-3xl transition-opacity duration-700 group-hover:opacity-40 animate-pulse-glow pointer-events-none',
                    `bg-gradient-to-br ${stat.gradient}`
                  )}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                      {stat.label}
                    </span>
                    <div
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg',
                        stat.bg,
                        stat.shadow
                      )}
                    >
                      <Icon className={cn('w-6 h-6 drop-shadow-md', stat.accent)} />
                    </div>
                  </div>

                  <div className="text-4xl font-bold text-white tracking-tight mb-4">
                    {displayValue}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={cn("flex items-center justify-center w-5 h-5 rounded-full bg-white/[0.05]", isUp ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10")}>
                      {isUp ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        isUp ? 'text-emerald-400' : 'text-rose-400'
                      )}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm font-medium text-neutral-500">this week</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom Grid: Chart + Activity ── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 lg:gap-8 pt-4">
          {/* ── Weekly Overview (Bar Chart) ── */}
          <div className="xl:col-span-3 bg-[#0a0a0e]/60 backdrop-blur-xl border border-white/[0.05] rounded-[1.5rem] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col">
            <div className="flex items-center justify-between mb-10 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Weekly Overview
                </h2>
                <p className="text-sm text-neutral-400 mt-1 font-medium">
                  Tasks completed per day
                </p>
              </div>
              <div className="flex items-center gap-1 bg-black/40 border border-white/[0.05] rounded-xl p-1 text-sm font-medium shadow-inner shrink-0">
                <button className="px-4 py-1.5 bg-white/[0.1] text-white rounded-lg shadow-sm">
                  Week
                </button>
                <button className="px-4 py-1.5 text-neutral-400 hover:text-white transition-colors rounded-lg">
                  Month
                </button>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="flex-1 flex items-end justify-between gap-4 min-h-[280px] relative pb-6 pt-10 mt-auto">
              {/* Background grid lines */}
              <div className="absolute inset-0 pb-12 flex flex-col justify-between pointer-events-none opacity-20">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="w-full h-[1px] bg-white/[0.2] border-dashed border-b border-white/[0.1]" />
                ))}
              </div>

              {CHART_DATA.map((bar, i) => {
                const heightPercent = (bar.value / MAX_CHART_VALUE) * 100;
                const isHighest = bar.value === MAX_CHART_VALUE;

                return (
                  <div
                    key={bar.label}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative z-10"
                  >
                    {/* Value tooltip */}
                    <div className="absolute top-0 px-3 py-1.5 bg-white/[0.1] backdrop-blur-md rounded-lg text-sm font-bold text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-full group-hover:-translate-y-[120%] shadow-lg shadow-black/50 border border-white/[0.1] pointer-events-none whitespace-nowrap z-20">
                      {bar.value} tasks
                    </div>

                    {/* Bar Container */}
                    <div className="w-full flex-1 flex items-end justify-center mb-4">
                      <div
                        className={cn(
                          'w-full max-w-[56px] rounded-t-xl transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-x-110 cursor-pointer relative overflow-hidden',
                          isHighest
                            ? 'bg-gradient-to-t from-blue-600 to-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.5)]'
                            : 'bg-gradient-to-t from-white/[0.05] to-white/[0.15] group-hover:from-blue-600/60 group-hover:to-violet-500/60 group-hover:shadow-[0_0_15px_rgba(96,165,250,0.3)]'
                        )}
                        style={{
                          height: `${heightPercent}%`,
                          animationDelay: `${i * 100}ms`,
                        }}
                      >
                         {isHighest && <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />}
                      </div>
                    </div>

                    {/* Label */}
                    <span
                      className={cn(
                        'text-[13px] font-bold tracking-wide transition-colors duration-300 shrink-0',
                        isHighest
                          ? 'text-violet-400'
                          : 'text-neutral-500 group-hover:text-neutral-300'
                      )}
                    >
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Recent Activity ── */}
          <div className="xl:col-span-2 bg-[#0a0a0e]/60 backdrop-blur-xl border border-white/[0.05] rounded-[1.5rem] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 shrink-0">
              <h2 className="text-lg font-bold text-white tracking-wide">
                Recent Activity{' '}
                <span className="text-xs font-normal text-neutral-500">(sample)</span>
              </h2>
              <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-semibold bg-blue-400/10 px-4 py-2 rounded-xl hover:bg-blue-400/20">
                View all
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto scrollbar-none pr-2">
              {RECENT_ACTIVITY.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div
                    key={activity.id}
                    className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-white/[0.03] border border-transparent hover:border-white/[0.05] transition-all duration-300 cursor-pointer"
                  >
                    <div
                      className={cn(
                        'shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mt-0.5 transition-all duration-300 group-hover:scale-110 shadow-md',
                        activity.bg
                      )}
                    >
                      <Icon className={cn('w-5 h-5 drop-shadow-md', activity.color)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] text-neutral-300 leading-relaxed font-medium">
                        <span className="text-white font-bold tracking-wide">
                          {activity.user}
                        </span>{' '}
                        {activity.message}{' '}
                        <span className="text-blue-400 font-bold hover:underline underline-offset-4 decoration-blue-400/50">
                          {activity.target}
                        </span>
                      </p>
                      <p className="text-[12px] font-semibold text-neutral-500 mt-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
