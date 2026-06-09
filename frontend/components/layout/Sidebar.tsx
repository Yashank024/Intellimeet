"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  UploadCloud, 
  History, 
  AlertOctagon, 
  TrendingUp, 
  MessageSquare
} from 'lucide-react';

// Custom, theme-based responsive SVG logo representing meeting intelligence, soundwaves, and GenAI
const LogoIcon = () => (
  <svg className="h-9 w-9 shrink-0 select-none" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="url(#sidebarLogoGradient)" />
    {/* Soundwaves */}
    <rect x="11" y="15" width="2.5" height="10" rx="1.25" fill="white" />
    <rect x="16" y="10" width="2.5" height="20" rx="1.25" fill="white" />
    <rect x="21" y="13" width="2.5" height="14" rx="1.25" fill="white" />
    <rect x="26" y="17" width="2.5" height="6" rx="1.25" fill="white" />
    {/* Sparkle (Intelligence) */}
    <path d="M26 9L27.2 10.2L28.4 9L27.2 7.8L26 9Z" fill="#FFFFFF" />
    
    <defs>
      <linearGradient id="sidebarLogoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#E06B36" />
        <stop offset="1" stopColor="#B34C20" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/upload', label: 'Upload Meeting', icon: UploadCloud },
    { href: '/meetings', label: 'Meetings History', icon: History },
    { href: '/escalations', label: 'Escalation Center', icon: AlertOctagon },
    { href: '/risks', label: 'Risk Analytics', icon: TrendingUp },
    { href: '/chat', label: 'AI Chat Assistant', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-[#091E1A] text-white flex flex-col fixed inset-y-0 left-0 border-r border-[#0E2C26] select-none">
      <div className="p-6 border-b border-[#0E2C26] flex items-center space-x-3.5">
        <LogoIcon />
        <div>
          <h1 className="font-serif font-normal text-lg leading-tight tracking-wide text-white">IntelliMeet</h1>
          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">Meeting Intel</p>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center space-x-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-accent/15 text-accent border-l-4 border-accent pl-3 shadow-2xs'
                  : 'text-slate-300 hover:bg-white/[0.03] hover:text-white pl-4'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-105 ${
                isActive ? 'text-accent' : 'text-slate-400 group-hover:text-slate-200'
              }`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#0E2C26] bg-black/15">
        <div className="flex items-center space-x-3">
          <div className="w-8.5 h-8.5 rounded-full bg-accent/20 flex items-center justify-center text-accent font-extrabold text-xs tracking-wider uppercase select-none border border-accent/10">
            EH
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-white">Executive Hub</p>
            <p className="text-[10px] text-slate-400 truncate">demo@intellimeet.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
