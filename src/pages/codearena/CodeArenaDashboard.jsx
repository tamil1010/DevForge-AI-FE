import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { codeArenaApi, ensureDemoAuth } from '../../api/client';
import {
  Swords,
  Trophy,
  Flame,
  BookOpen,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Zap,
  Target,
  Users,
  ChevronRight,
  Sparkles,
  Play
} from 'lucide-react';

export default function CodeArenaDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      await ensureDemoAuth();
      const res = await codeArenaApi.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load CodeArena dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {
    total_solved: 6,
    available_problems: 15,
    global_rank: 4,
    rating: 1850,
    current_streak: 7,
    longest_streak: 15,
    total_submissions: 18,
    acceptance_rate: 77.8,
    easy_solved: 3,
    medium_solved: 2,
    hard_solved: 1
  };

  const activeContests = data?.active_contests || [];
  const upcomingContests = data?.upcoming_contests || [];
  const recentSubmissions = data?.recent_submissions || [];
  const recommendedProblems = data?.recommended_problems || [];

  return (
    <AppLayout>
      <div className="flex-1 bg-[#070a10] text-gray-200 overflow-y-auto p-8 space-y-8 font-sans">
        {/* HERO BANNER */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/40 via-indigo-950/30 to-[#0e1320] border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-xs font-mono">
                <Swords className="w-3.5 h-3.5" />
                <span>CodeArena Competitive League • Season 4</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Welcome back, <span className="bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">Architect</span>
              </h1>
              <p className="text-gray-400 text-sm max-w-xl">
                Sharpen your algorithms, conquer live timed contests, and earn rating points with Judge0-powered automated grading.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/codearena/problems')}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Solve Problems</span>
              </button>
              <button
                onClick={() => navigate('/codearena/contests')}
                className="px-5 py-2.5 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Enter Contest</span>
              </button>
            </div>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Solved Problems */}
          <div className="bg-[#0b0f19] border border-gray-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-medium">Solved</span>
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {stats.total_solved} <span className="text-xs font-normal text-gray-500">/ {stats.available_problems}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-purple-500 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, (stats.total_solved / Math.max(1, stats.available_problems)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Rating */}
          <div className="bg-[#0b0f19] border border-gray-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-medium">Rating</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 tracking-tight">{stats.rating}</div>
            <div className="text-[10px] text-amber-400/80 font-mono">Specialist Division</div>
          </div>

          {/* Global Rank */}
          <div className="bg-[#0b0f19] border border-gray-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-medium">Global Rank</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">#{stats.global_rank}</div>
            <div className="text-[10px] text-gray-400 font-mono">Top 2% Worldwide</div>
          </div>

          {/* Coding Streak */}
          <div className="bg-[#0b0f19] border border-gray-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-medium">Streak</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-bold text-orange-400 tracking-tight">{stats.current_streak} Days</div>
            <div className="text-[10px] text-gray-400 font-mono">Best: {stats.longest_streak} Days</div>
          </div>

          {/* Acceptance Rate */}
          <div className="bg-[#0b0f19] border border-gray-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-medium">Accuracy</span>
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-indigo-400 tracking-tight">{stats.acceptance_rate}%</div>
            <div className="text-[10px] text-gray-400 font-mono">{stats.total_submissions} Total Submissions</div>
          </div>

          {/* Active Contests */}
          <div className="bg-[#0b0f19] border border-gray-800/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-medium">Active Battles</span>
              <Zap className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400 tracking-tight">{activeContests.length} Live</div>
            <div className="text-[10px] text-gray-400 font-mono">{upcomingContests.length} Scheduled</div>
          </div>
        </div>

        {/* SECTION 2: LIVE CONTEST BANNER IF ACTIVE */}
        {activeContests.length > 0 && (
          <div className="bg-gradient-to-r from-red-950/40 via-purple-950/40 to-[#0e1320] border border-rose-500/30 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400 animate-pulse">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded uppercase tracking-wider">LIVE NOW</span>
                  <h3 className="text-base font-bold text-white">{activeContests[0].title}</h3>
                </div>
                <p className="text-xs text-gray-400 mt-1">{activeContests[0].description}</p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/codearena/contests/${activeContests[0].id}`)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-lg shadow-red-600/30 transition"
            >
              <span>Enter Arena</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* SECTION 3: TWO-COLUMN WORKSPACE (RECOMMENDED & RECENT SUBMISSIONS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* RECOMMENDED PROBLEMS (2 cols) */}
          <div className="lg:col-span-2 bg-[#0b0f19] border border-gray-800/80 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recommended Next Challenges</h2>
              </div>
              <button
                onClick={() => navigate('/codearena/problems')}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center space-x-1"
              >
                <span>View all problems</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recommendedProblems.map((prob) => (
                <div
                  key={prob.id}
                  onClick={() => navigate(`/codearena/problems/${prob.id}`)}
                  className="p-4 bg-[#0e1320] hover:bg-[#131b2e] border border-gray-800/80 hover:border-purple-500/40 rounded-xl transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white group-hover:text-purple-300 transition">
                        {prob.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          prob.difficulty === 'Easy'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                            : prob.difficulty === 'Medium'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/50'
                            : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                        }`}
                      >
                        {prob.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 font-mono">
                      <span>{prob.category}</span>
                      <span>•</span>
                      <span>{prob.acceptance_rate}% Acceptance</span>
                      <span>•</span>
                      <span>{prob.total_submissions.toLocaleString()} Submissions</span>
                    </div>
                  </div>

                  <div className="p-2 bg-gray-800 group-hover:bg-purple-600 text-gray-400 group-hover:text-white rounded-lg transition">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT SUBMISSIONS & DIFFICULTY BREAKDOWN (1 col) */}
          <div className="space-y-6">
            {/* DIFFICULTY BREAKDOWN CARD */}
            <div className="bg-[#0b0f19] border border-gray-800/80 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Proficiency Distribution</h2>
              <div className="space-y-3">
                {/* Easy */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-emerald-400 font-medium">Easy</span>
                    <span className="text-gray-400 font-mono">{stats.easy_solved} Solved</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>

                {/* Medium */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-amber-400 font-medium">Medium</span>
                    <span className="text-gray-400 font-mono">{stats.medium_solved} Solved</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>

                {/* Hard */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-rose-400 font-medium">Hard</span>
                    <span className="text-gray-400 font-mono">{stats.hard_solved} Solved</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT SUBMISSIONS */}
            <div className="bg-[#0b0f19] border border-gray-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent Activity</h2>
                <Clock className="w-4 h-4 text-gray-500" />
              </div>

              {recentSubmissions.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-xs">
                  No submissions yet. Solve a problem to begin!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 bg-[#0e1320] border border-gray-800/60 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-medium text-white truncate max-w-[150px]">{sub.problem_title}</div>
                        <div className="text-[10px] text-gray-500 font-mono uppercase">{sub.language}</div>
                      </div>
                      <div
                        className={`px-2 py-0.5 text-[10px] font-bold rounded flex items-center space-x-1 ${
                          sub.status === 'Accepted'
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-rose-950 text-rose-400'
                        }`}
                      >
                        {sub.status === 'Accepted' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{sub.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

