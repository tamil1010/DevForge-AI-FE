import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Database,
  Sparkles,
  Code2,
  Trophy,
  Swords,
  BookOpen,
  BarChart3,
  Flame,
  Settings
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const isCodeArena = location.pathname.startsWith('/codearena');

  return (
    <aside className="w-64 bg-[#0b0f17] border-r border-gray-800/80 flex flex-col flex-shrink-0 min-h-screen text-xs">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-800/80 flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg text-white font-bold shadow-lg shadow-purple-600/30">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-bold tracking-wider text-white">DEVFORGE AI</div>
          <div className="text-[10px] text-purple-400 font-mono">DEVELOPER PLATFORM</div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {/* Module 1: AI Database Designer */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            DATABASE TOOLS
          </div>
          <div className="space-y-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-2.5 px-3 py-2.5 rounded-lg transition font-medium ${
                  isActive && !location.pathname.startsWith('/ai-code') && !location.pathname.startsWith('/codearena')
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

        {/* Module 2: AI Code Generator */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            AI CODE GENERATOR
          </div>
          <div className="space-y-1">
            <NavLink
              to="/ai-code"
              className={({ isActive }) =>
                `flex items-center space-x-2.5 px-3 py-2.5 rounded-lg transition font-medium ${
                  isActive
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`
              }
            >
              <Code2 className="w-4 h-4 text-purple-400" />
              <span>AI Code Generator</span>
            </NavLink>
          </div>
        </div>

        {/* Module 3: CodeArena (Competitive Programming) */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-semibold text-purple-400 uppercase tracking-wider">
            CODEARENA
          </div>
          <div className="space-y-1">
            <NavLink
              to="/codearena"
              end
              className={({ isActive }) =>
                `flex items-center space-x-2.5 px-3 py-2 rounded-lg transition font-medium ${
                  isActive
                    ? 'bg-purple-600/25 text-purple-300 border border-purple-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`
              }
            >
              <Swords className="w-4 h-4 text-purple-400" />
              <span>Arena Dashboard</span>
            </NavLink>

            <NavLink
              to="/codearena/problems"
              className={({ isActive }) =>
                `flex items-center space-x-2.5 px-3 py-2 rounded-lg transition font-medium ${
                  isActive
                    ? 'bg-purple-600/25 text-purple-300 border border-purple-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`
              }
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span>Problems</span>
            </NavLink>

            <NavLink
              to="/codearena/contests"
              className={({ isActive }) =>
                `flex items-center space-x-2.5 px-3 py-2 rounded-lg transition font-medium ${
                  isActive
                    ? 'bg-purple-600/25 text-purple-300 border border-purple-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`
              }
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Contests</span>
            </NavLink>

            <NavLink
              to="/codearena/leaderboard"
              className={({ isActive }) =>
                `flex items-center space-x-2.5 px-3 py-2 rounded-lg transition font-medium ${
                  isActive
                    ? 'bg-purple-600/25 text-purple-300 border border-purple-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`
              }
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Leaderboard</span>
            </NavLink>

            <NavLink
              to="/codearena/profile"
              className={({ isActive }) =>
                `flex items-center space-x-2.5 px-3 py-2 rounded-lg transition font-medium ${
                  isActive
                    ? 'bg-purple-600/25 text-purple-300 border border-purple-500/50'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`
              }
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Profile & Analytics</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-800/80 text-[10px] text-gray-500 font-mono flex items-center justify-between">
        <span>DevForge AI Platform</span>
        <span className="text-purple-400 font-semibold">v2.0</span>
      </div>
    </aside>
  );
}
