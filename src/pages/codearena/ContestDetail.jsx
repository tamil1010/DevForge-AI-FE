import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { codeArenaApi } from '../../api/client';
import {
  Trophy, Clock, Users, ArrowLeft, Loader2, Flame,
  CheckCircle, Lock, ChevronRight, BarChart2, Swords,
  AlertCircle, Star
} from 'lucide-react';

function Countdown({ endTime }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime) - new Date();
      if (diff <= 0) { setTimeLeft('Ended'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return <span className="font-mono">{timeLeft}</span>;
}

const DIFF_COLORS = {
  Easy: 'text-green-400 border-green-700 bg-green-900/20',
  Medium: 'text-yellow-400 border-yellow-700 bg-yellow-900/20',
  Hard: 'text-red-400 border-red-700 bg-red-900/20',
};

export default function ContestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('problems');
  const [registered, setRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContest();
  }, [id]);

  const fetchContest = async () => {
    setLoading(true);
    setError('');
    try {
      const [cRes, lRes] = await Promise.all([
        codeArenaApi.getContestById(id),
        codeArenaApi.getContestLeaderboard(id),
      ]);
      const c = cRes.data?.data || cRes.data;
      setContest(c);
      setRegistered(c?.is_registered || false);
      setLeaderboard(lRes.data?.data || lRes.data || []);
    } catch (err) {
      setError('Failed to load contest. It may not exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      await codeArenaApi.registerForContest(id);
      setRegistered(true);
      setContest(c => c ? { ...c, participant_count: (c.participant_count || 0) + 1 } : c);
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a10] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="min-h-screen bg-[#070a10] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">{error || 'Contest not found'}</p>
          <button onClick={() => navigate('/codearena/contests')} className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-sm">
            All Contests
          </button>
        </div>
      </div>
    );
  }

  const isLive = contest.status === 'live';
  const isCompleted = contest.status === 'completed';
  const isUpcoming = contest.status === 'upcoming';

  const statusConfig = {
    live: { label: 'LIVE', cls: 'text-green-400 bg-green-900/20 border-green-700', dot: 'bg-green-400 animate-pulse' },
    upcoming: { label: 'UPCOMING', cls: 'text-blue-400 bg-blue-900/20 border-blue-700', dot: 'bg-blue-400' },
    completed: { label: 'ENDED', cls: 'text-gray-400 bg-gray-800 border-gray-700', dot: 'bg-gray-500' },
  };
  const sc = statusConfig[contest.status] || statusConfig.upcoming;

  return (
    <div className="min-h-screen bg-[#070a10] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/40 via-[#0b0f19] to-indigo-900/40 border-b border-purple-800/30 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/codearena/contests')}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All Contests
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-600/30 mt-1">
                <Trophy className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-semibold ${sc.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white">{contest.title}</h1>
                <p className="text-gray-400 text-sm mt-1">{contest.description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" /> {contest.duration_minutes || 90} min
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Users className="w-3.5 h-3.5" /> {contest.participant_count || 0} participants
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Swords className="w-3.5 h-3.5" /> {(contest.problems || []).length} problems
                  </span>
                  {isLive && contest.end_time && (
                    <span className="flex items-center gap-1.5 text-xs text-orange-400 font-mono bg-orange-900/20 border border-orange-800/40 px-2 py-0.5 rounded-full">
                      <Flame className="w-3 h-3" /> Time Left: <Countdown endTime={contest.end_time} />
                    </span>
                  )}
                  {isUpcoming && contest.start_time && (
                    <span className="text-xs text-blue-400">
                      Starts: {new Date(contest.start_time).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0">
              {isCompleted ? (
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-medium transition-colors"
                >
                  <BarChart2 className="w-4 h-4" /> View Results
                </button>
              ) : registered ? (
                <div className="text-center">
                  <span className="flex items-center gap-1.5 text-sm text-green-400 mb-2">
                    <CheckCircle className="w-4 h-4" /> Registered
                  </span>
                  {isLive && (
                    <span className="text-xs text-gray-400">Select a problem below to start</span>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Swords className="w-4 h-4" />}
                  Register Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-[#0b0f19] border border-gray-800 rounded-xl p-1 w-fit">
          {[
            { key: 'problems', label: 'Problems', icon: Swords },
            { key: 'leaderboard', label: 'Leaderboard', icon: BarChart2 },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Problems Tab */}
        {activeTab === 'problems' && (
          <div className="space-y-3">
            {(contest.problems || []).length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Swords className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No problems added to this contest yet.
              </div>
            ) : (
              (contest.problems || []).map((p, idx) => {
                const canSolve = isLive && registered;
                return (
                  <div
                    key={p.id || idx}
                    className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5 flex items-center justify-between hover:border-purple-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-lg bg-purple-900/30 border border-purple-800/40 flex items-center justify-center font-bold text-purple-300 text-sm">
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-white">{p.title || p}</p>
                        {p.difficulty && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border mt-1 inline-block ${DIFF_COLORS[p.difficulty] || 'text-gray-400 border-gray-700'}`}>
                            {p.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {p.score && (
                        <div className="text-center">
                          <span className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
                            <Star className="w-3.5 h-3.5" />{p.score} pts
                          </span>
                        </div>
                      )}
                      {canSolve ? (
                        <Link
                          to={`/codearena/problems/${p.id}`}
                          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-medium transition-colors"
                        >
                          Solve <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-gray-500 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                          {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          {isCompleted ? 'Ended' : isUpcoming ? 'Upcoming' : 'Register First'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="bg-[#0b0f19] border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="font-semibold text-gray-200 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-400" /> Contest Leaderboard
              </h3>
            </div>
            {leaderboard.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No participants ranked yet.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                    <th className="px-6 py-3 text-left w-16">Rank</th>
                    <th className="px-6 py-3 text-left">Coder</th>
                    <th className="px-6 py-3 text-center">Score</th>
                    <th className="px-6 py-3 text-center">Solved</th>
                    <th className="px-6 py-3 text-center">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((u, idx) => {
                    const rank = u.rank || idx + 1;
                    return (
                      <tr key={u.user_id || idx} className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className={`font-bold text-sm ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-amber-500' : 'text-gray-400'}`}>
                            #{rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-purple-900/30 border border-purple-700 flex items-center justify-center text-xs font-bold text-purple-300">
                              {(u.username || 'U')[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-white">{u.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-purple-300 font-semibold">{u.score || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-center text-green-400 text-sm">{u.solved || 0}</td>
                        <td className="px-6 py-4 text-center text-gray-400 text-xs font-mono">
                          {u.total_time ? `${u.total_time}s` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

