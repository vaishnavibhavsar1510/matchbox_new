import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../components/AuthContext';
import { Avatar } from './Avatar';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊', badge: null },
  { name: 'Host Event', href: '/dashboard/events/host', icon: '🎯', badge: 'New' },
  { name: 'Profile', href: '/dashboard/profile', icon: '👤', badge: null },
  { name: 'Messages', href: '/dashboard/messages', icon: '💬', badge: '3' },
  { name: 'Events', href: '/dashboard/events', icon: '🎉', badge: null },
  { name: 'Settings', href: '/dashboard/settings', icon: '⚙️', badge: null },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1E1B2E] shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
              MatchBox
            </h1>
            <button
              onClick={onClose}
              className="text-purple-300 hover:text-purple-200 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-700 via-violet-800 to-indigo-900 text-white'
                      : 'text-purple-200 hover:bg-purple-900/20'
                  }`}
                  onClick={() => {
                    onClose();
                  }}
                >
                  <span className={`${isActive ? 'text-white' : 'text-purple-300 group-hover:text-purple-200'}`}>
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-indigo-950/20 bg-gradient-to-t from-indigo-950/50 to-transparent backdrop-blur-xl">
            <div className="flex items-center p-2 rounded-2xl transition-colors hover:bg-indigo-500/5 group">
              <Avatar
                name={user?.name || 'User'}
                image={user?.profileImage}
                size="sm"
              />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-slate-300 truncate group-hover:text-white transition-colors">
                  {user?.name}
                </p>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="text-xs text-slate-400 hover:text-violet-300 transition-colors duration-300 font-medium tracking-wide"
                >
                  Sign out
                </button>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 ring-4 ring-green-400/20"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 