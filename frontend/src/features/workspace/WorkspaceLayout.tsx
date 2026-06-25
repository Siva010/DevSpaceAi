import { Outlet } from 'react-router-dom';
import { Search, Bell, Plus } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';

export default function WorkspaceLayout() {
  return (
    <div className="flex h-screen text-white overflow-hidden bg-[#05050A] relative font-['Outfit']">
      {/* ── Dynamic Background Orbs ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-fuchsia-600/10 blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />

      {/* ── Layout Container ── */}
      <div className="relative z-10 flex w-full h-full glass-panel">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-transparent">
          {/* Top Header Bar */}
          <header className="h-16 flex items-center justify-between px-8 border-b border-white/[0.06] bg-black/20 backdrop-blur-md shrink-0 z-10">
            {/* Search */}
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-80 group">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 focus:bg-white/[0.05] transition-all duration-300 shadow-inner"
                />
                <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-500 bg-white/[0.04] border border-white/[0.08] rounded px-1.5 py-0.5 hidden sm:inline-block">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button onClick={() => alert('No new notifications.')} className="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-all duration-300">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#0a0a0e] shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
              </button>
              <button onClick={() => alert('Global create menu coming soon!')} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:scale-[1.02] active:scale-[0.98]">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New</span>
              </button>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-auto scrollbar-none relative">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
