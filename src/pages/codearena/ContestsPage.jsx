import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import { codeArenaApi, ensureDemoAuth } from '../../api/client';
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  Flame,
  Zap,
  Award
} from 'lucide-react';

export default function ContestsPage() {
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'live', 'upcoming', 'completed'
  const [registeringId, setRegisteringId] = useState(null);
  const [registeredIds, setRegisteredIds] = useState(new Set());

  useEffect(() => {
    loadContests();
  }, []);

  const loadContests = async () => {
    setLoading(true);
    try {
      await ensureDemoAuth();
      const res = await codeArenaApi.getContests();
      if (res.success) {
        setContests(res.data);
      }
    } catch (err) {
      console.error('Failed to load contests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (contestId) => {
    setRegisteringId(contestId);
    try {
      const res = await codeArenaApi.registerContest(contestId);
      if (res.success) {
        setRegisteredIds(prev => new Set([...prev, contestId]));
      }
    } catch (err) {
      console.error('Contest registration failed:', err);
    } finally {
      setRegisteringId(null);
    }
  };

  const filteredContests = contests.filter(c => {
    if (activeTab === 'all') return true;
    return c.status === activeTab;
  });

  return (
    <AppLayout>
      <div className="flex-1 bg-[#070a10] text-gray-200 overflow-y-auto p-8 space-y-8 font-sans">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/80 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-[11px] font-mono mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>Contest Arena</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Algorithmic Battles & Tournaments</h1>
            <p className="text-gray-400 text-xs">
              Compete live with programmers worldwide, solve problems under time pressure, and earn rating points.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {['all', 'live', 'upcoming', 'completed'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition ${
                  activeTab === tab
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-[#0b0f19] hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* CONTESTS GRID */}
        {loading ? (
          <div className="text-center py-24 text-gray-500 text-xs font-mono">
            Loading scheduled contests...
          </div>
        ) : filteredContests.length === 0 ? (
          <div className="text-center py-24 text-gray-500 text-xs">
            No contests found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map((c) => {
              const isRegistered = registeredIds.has(c.id);
              const isLive = c.status === 'live';
              const isUpcoming = c.status === 'upcoming';

              return (
                <div
                  key={c.id}
                  className={`bg-[#0b0f19] border rounded-2xl p-6 flex flex-col justify-between space-y-6 transition hover:shadow-2xl ${
                    isLive
                      ? 'border-red-500/50 shadow-red-500/10'
                      : 'border-gray-800/80 hover:border-purple-500/40'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Status Badge & Duration */}
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                          isLive
                            ? 'bg-red-600 text-white animate-pulse'
                            : isUpcoming
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {isLive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                        <span>{c.status}</span>
                      </span>

                      <div className="flex items-center space-x-1 text-gray-400 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{c.duration_minutes} mins</span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition">
                        {c.title}
                      </h3>
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                        {c.description}
                      </p>
                    </div>

                    {/* Details row */}
                    <div className="pt-2 border-t border-gray-800/60 space-y-2 text-xs text-gray-400 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <Users className="w-3.5 h-3.5 text-purple-400" />
                          <span>Participants</span>
                        </span>
                        <strong className="text-white">{c.participants_count.toLocaleString()}</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Start Time</span>
                        </span>
                        <span className="text-gray-300">{new Date(c.start_time).toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Problem Count</span>
                        </span>
                        <span className="text-white">{c.problem_ids?.length || 4} Problems</span>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTON */}
                  <div>
                    {isLive ? (
                      <button
                        onClick={() => navigate(`/codearena/contests/${c.id}`)}
                        className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 transition transform hover:-translate-y-0.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Enter Arena</span>
                      </button>
                    ) : isUpcoming ? (
                      <button
                        onClick={() => handleRegister(c.id)}
                        disabled={isRegistered || registeringId === c.id}
                        className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                          isRegistered
                            ? 'bg-emerald-950/80 border border-emerald-800/60 text-emerald-300'
                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30'
                        }`}
                      >
                        {isRegistered ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Registered</span>
                          </>
                        ) : (
                          <>
                            <Trophy className="w-3.5 h-3.5" />
                            <span>{registeringId === c.id ? 'Registering...' : 'Register Now'}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/codearena/contests/${c.id}`)}
                        className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-medium flex items-center justify-center space-x-2 transition"
                      >
                        <span>View Results & Editorial</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

