import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { authApi } from '../../lib/api/auth.api';
import { setAuth } from '../../store/store';

type AuthMode = 'login' | 'register';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSuccess = (data: { access_token: string; user: { id: string; email: string; fullName: string | null } }) => {
    dispatch(setAuth({ token: data.access_token, user: data.user }));
    navigate('/workspaces');
  };

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: handleSuccess,
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Invalid email or password.';
      setErrorMessage(Array.isArray(msg) ? msg[0] : msg);
    }
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: handleSuccess,
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Registration failed. Email may already be in use.';
      setErrorMessage(Array.isArray(msg) ? msg[0] : msg);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (mode === 'login') {
      loginMutation.mutate({ email, password });
    } else {
      registerMutation.mutate({ email, password, fullName });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="flex min-h-screen bg-[#05050A] items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600/20 blur-[150px] animate-pulse-glow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[150px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 w-full max-w-md bg-[#0a0a0e]/80 backdrop-blur-xl border border-white/[0.05] rounded-[2rem] p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-[fadeIn_0.6s_ease-out]">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-violet-500 to-fuchsia-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <span className="text-white font-bold text-2xl tracking-tighter drop-shadow-md">DS</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-neutral-400 text-sm font-medium">
            {mode === 'login' ? 'Sign in to your account to continue' : 'Join DevSpace to get started'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-black/40 border border-white/[0.05] rounded-xl p-1 mb-8">
          <button
            onClick={() => { setMode('login'); setErrorMessage(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              mode === 'login'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMessage(null); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              mode === 'register'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
             <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium p-3 rounded-xl text-center">
               {errorMessage}
             </div>
           )}

          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider ml-1">Full Name</label>
              <Input
                type="text"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-black/40 border-white/[0.05] text-white placeholder:text-neutral-600 h-12 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider ml-1">Email address</label>
            <Input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/40 border-white/[0.05] text-white placeholder:text-neutral-600 h-12 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Password</label>
              {mode === 'login' && (
                <a href="#" className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
              )}
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/40 border-white/[0.05] text-white placeholder:text-neutral-600 h-12 rounded-xl focus:border-blue-500/50 focus:ring-blue-500/20 transition-all"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-white text-black hover:bg-neutral-200 mt-6 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </Button>
        </form>
      </div>
    </div>
  );
}
