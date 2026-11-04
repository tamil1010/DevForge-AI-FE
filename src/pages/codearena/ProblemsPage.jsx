import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { codeArenaApi, ensureDemoAuth } from '../../api/client';
import {
  Search,
  Filter,
  CheckCircle2,
  Circle,
  ArrowUpDown,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Code,
  Tag,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'Arrays',
  'Strings',
  'Linked Lists',
  'Stack and Queue',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Greedy Algorithms',
  'Sorting and Searching',
  'Hashing',
  'Recursion and Backtracking',
  'Mathematics'
];

const DIFFICULTIES = ['ALL', 'Easy', 'Medium', 'Hard'];
const STATUSES = ['ALL', 'SOLVED', 'UNSOLVED'];
const LANGUAGES = ['ALL', 'javascript', 'python', 'cpp', 'java', 'c'];

export default function ProblemsPage() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, total_pages: 1 });

  useEffect(() => {
    loadProblems();
  }, [pagination.page, selectedCategory, selectedDifficulty, selectedStatus, selectedLanguage]);

  const loadProblems = async () => {
    setLoading(true);
    try {
      await ensureDemoAuth();
      const res = await codeArenaApi.getProblems({
        page: pagination.page,
        limit: pagination.limit,
        search,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        status: selectedStatus,
        language: selectedLanguage
      });
      if (res.success) {
        setProblems(res.problems);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Failed to load problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadProblems();
  };

  return (
    <AppLayout>
      <div className="flex-1 bg-[#070a10] text-gray-200 overflow-y-auto p-8 space-y-6 font-sans">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/30 rounded text-purple-400 text-[11px] font-mono mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Problem Explorer</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Competitive Coding Problems</h1>
            <p className="text-gray-400 text-xs">
              Master core algorithmic patterns across 12 fundamental data structure and algorithm tracks.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-gray-400">Total Available: <strong className="text-white">{pagination.total}</strong></span>
          </div>
        </div>

        {/* SEARCH AND FILTER BAR */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="md:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search problem title or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
              />
            </form>

            {/* Difficulty Filter */}
            <div className="relative">
              <select
                value={selectedDifficulty}
                onChange={(e) => { setSelectedDifficulty(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition cursor-pointer appearance-none"
              >
                {DIFFICULTIES.map(d => (
                  <option key={d} value={d} className="bg-gray-900">Difficulty: {d}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => { setSelectedStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                className="w-full px-3 py-2 bg-[#0b0f19] border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition cursor-pointer appearance-none"
              >
                <option value="ALL" className="bg-gray-900">Status: All</option>
                <option value="SOLVED" className="bg-gray-900">Status: Solved</option>
                <option value="UNSOLVED" className="bg-gray-900">Status: Unsolved</option>
              </select>
            </div>
          </div>

          {/* CATEGORY PILL TABS */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setPagination(p => ({ ...p, page: 1 })); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-[#0b0f19] hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* PROBLEMS TABLE */}
        <div className="bg-[#0b0f19] border border-gray-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1320] text-gray-400 uppercase font-mono text-[10px] tracking-wider border-b border-gray-800/80">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">Status</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Acceptance</th>
                  <th className="py-3.5 px-4">Submissions</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-sans">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500">
                      Loading coding problems...
                    </td>
                  </tr>
                ) : problems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-gray-500">
                      No problems match the selected filters.
                    </td>
                  </tr>
                ) : (
                  problems.map((prob) => (
                    <tr
                      key={prob.id}
                      onClick={() => navigate(`/codearena/problems/${prob.id}`)}
                      className="hover:bg-[#121829] cursor-pointer transition group"
                    >
                      {/* Solved check */}
                      <td className="py-3.5 px-4 text-center">
                        {prob.is_solved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-600 mx-auto" />
                        )}
                      </td>

                      {/* Title */}
                      <td className="py-3.5 px-4 font-semibold text-white group-hover:text-purple-300 transition">
                        {prob.title}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-gray-400 font-mono text-[11px]">
                        <span className="px-2 py-0.5 bg-gray-800/60 rounded border border-gray-700/40">
                          {prob.category}
                        </span>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            prob.difficulty === 'Easy'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                              : prob.difficulty === 'Medium'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                      </td>

                      {/* Acceptance rate */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-purple-500 h-1.5 rounded-full"
                              style={{ width: `${prob.acceptance_rate}%` }}
                            />
                          </div>
                          <span className="font-mono text-gray-400 text-[11px]">{prob.acceptance_rate}%</span>
                        </div>
                      </td>

                      {/* Submissions */}
                      <td className="py-3.5 px-4 text-gray-400 font-mono text-[11px]">
                        {prob.total_submissions.toLocaleString()}
                      </td>

                      {/* Solve CTA */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-3 py-1 bg-purple-600/20 group-hover:bg-purple-600 text-purple-300 group-hover:text-white rounded-lg text-xs font-medium transition">
                          Solve
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="p-4 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400 font-mono">
            <span>
              Page {pagination.page} of {pagination.total_pages || 1}
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                className="p-1.5 bg-[#0e1320] border border-gray-800 hover:border-gray-700 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.total_pages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                className="p-1.5 bg-[#0e1320] border border-gray-800 hover:border-gray-700 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

