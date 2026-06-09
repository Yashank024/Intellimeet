"use client";

import { Bell, Sparkles, User } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="h-16 border-b border-border-slate bg-card-bg fixed top-0 right-0 left-64 z-20 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
        </span>
        <span className="text-xs text-slate-500 font-semibold tracking-wide uppercase">System Monitoring Active</span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 bg-accent-light text-accent-dark px-2.5 py-1 rounded-full text-xs font-semibold select-none">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Gemini-powered Extraction</span>
        </div>

        <div className="h-8 w-px bg-border-slate" />

        <button className="text-slate-400 hover:text-slate-600 transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Lead PM</span>
        </div>
      </div>
    </header>
  );
}
