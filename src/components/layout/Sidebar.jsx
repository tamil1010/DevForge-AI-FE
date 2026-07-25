import React from 'react';
import { NavLink } from 'react-router-dom';
import { Database, Layers, FolderKanban, Sparkles, Code2, Lock } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#0b0f17] border-r border-gray-800/80 flex flex-col flex-shrink-0 min-h-screen text-xs">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-800/80 flex items-center space-x-3">
        <div className="p-2 bg-indigo-600 rounded-lg text-white font-bold shadow-lg shadow-indigo-600/30">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-wider text-white">DEVFORGE AI</div>
          <div className="text-[10px] text-indigo-400 font-mono">DATABASE DESIGNER</div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {/* Module Group */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            DATABASE TOOLS
          </div>
          <div className="space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-2.5 px-3 py-2.5 rounded-lg transition font-medium ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`
              }
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Database Designer</span>
            </NavLink>
          </div>
        </div>

        {/* Future Modules Group */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            FUTURE MODULES
          </div>
          <div className="space-y-2 opacity-60">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-400">
              <div className="flex items-center space-x-2.5">
                <Code2 className="w-4 h-4 text-gray-500" />
                <span>DevForge AI Core</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded font-mono">Coming Soon</span>
            </div>

            <div className="flex items-center justify-between px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-400">
              <div className="flex items-center space-x-2.5">
                <Lock className="w-4 h-4 text-gray-500" />
                <span>CodeArena</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded font-mono">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-800/80 text-[10px] text-gray-500 font-mono">
        DevForge AI Platform v1.0
      </div>
    </aside>
  );
}
