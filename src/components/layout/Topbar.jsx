import React from 'react';
import { Search, Bell, User } from 'lucide-react';

export default function Topbar({ title, search, onSearchChange }) {
  return (
    <header className="h-16 bg-[#111827] border-b border-gray-800/80 px-6 flex items-center justify-between text-xs flex-shrink-0">
      <div className="flex items-center space-x-4">
        <h1 className="text-base font-bold text-white tracking-tight">{title || 'AI Database Designer'}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {onSearchChange !== undefined && (
          <div className="relative w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search database designs..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#1f2937] border border-gray-700/60 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>
        )}

        <div className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 cursor-pointer relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-indigo-500 rounded-full absolute top-1.5 right-1.5" />
        </div>

        <div className="flex items-center space-x-2 pl-2 border-l border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-300 font-bold font-mono">
            DA
          </div>
          <div className="hidden md:block text-left">
            <div className="font-semibold text-white">Demo Architect</div>
            <div className="text-[10px] text-gray-400 font-mono">demo@devforge.ai</div>
          </div>
        </div>
      </div>
    </header>
  );
}
