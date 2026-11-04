import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { codeArenaApi } from '../../api/client';
import {
  Trophy, Flame, Medal, Star, TrendingUp, Globe, Calendar,
  ArrowLeft, Loader2, Crown, ChevronUp, ChevronDown, Minus
} from 'lucide-react';

const TABS = [
  { key: 'global', label: 'Global', icon: Globe },
  { key: 'weekly', label: 'Weekly', icon: Calendar },
  { key: 'monthly', label: 'Monthly', icon: TrendingUp },
];

const BADGE_COLORS = {
  'Grandmaster': 'text-red-400 bg-red-900/30 border-red-700',
  'Master': 'text-orange-400 bg-orange-900/30 border-orange-700',
  'Expert': 'text-purple-400 bg-purple-900/30 border-purple-700',
  'Specialist': 'text-cyan-400 bg-cyan-900/30 border-cyan-700',
  'Apprentice': 'text-green-400 bg-green-900/30 border-green-700',
};

const RANK_ICONS = {
  1: <Crown className="w-5 h-5 text-yellow-400" />,
  2: <Medal className="w-5 h-5 text-gray-300" />,
  3: <Medal className="w-5 h-5 text-amber-600" />,
};

function RankChange({ change }) {
  if (change === 0) return <Minus className="w-3 h-3 text-gray-500" />;
  if (change > 0) return (
    <span className="flex items-center gap-0.5 text-green-400 text-xs">
      <ChevronUp className="w-3 h-3" />{change}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-red-400 text-xs">
      <ChevronDown className="w-3 h-3" />{Math.abs(change)}
    </span>
  );
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('global');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await codeArenaApi.getLeaderboard();
      setLeaderboard(res.data?.data || res.data || []);
    } catch (err) {
      setError('Failed to load leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  // For weekly/monthly tabs, generate variation of global data
  const getDisplayData = () => {
    if (!leaderboard.length) return [];
    if (activeTab === 'global') return leaderboard;
    // Shuffle slightly for demo
    return [...leaderboard].sort((a, b) => {
      const seed = activeTab === 'weekly' ? 0.3 : 0.7;
      return (b.score || b.rating || 0) * seed - (a.score || a.rating || 0) * seed;
    }).map((u, i) => ({ ...u, rank: i + 1 }));
  };

  const displayData = getDisplayData();

  return (
    <div className="min-h-screen bg-[#070a10] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/40 via-[#0b0f19] to-indigo-900/40 border-b border-purple-800/30 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/codearena')}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Arena
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-600/30">
              <Trophy className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Global Leaderboard
              </h1>
              <p className="text-gray-400 mt-1">Top coders ranked by rating and performance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-[#0b0f19] border border-gray-800 rounded-xl p-1 w-fit">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {!loading && displayData.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center pt-8">
              <div className="relative mb-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-2xl font-bold border-2 border-gray-400">
                  {(displayData[1]?.username || 'U')[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-gray-500 rounded-full flex items-center justify-center text-xs font-bold border border-gray-700">
                  2
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-200">{displayData[1]?.username}</p>
              <p className="text-xs text-gray-400">{displayData[1]?.rating} pts</p>
              <div className="mt-3 w-full h-20 bg-gradient-to-t from-gray-700/40 to-transparent rounded-t-lg border-t border-gray-600" />
            </div>
            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <Crown className="w-7 h-7 text-yellow-400 mb-2" />
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-3xl font-bold border-2 border-yellow-400 shadow-lg shadow-yellow-900/50">
                  {(displayData[0]?.username || 'U')[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-sm font-bold border-2 border-yellow-300 text-black">
                  1
                </div>
              </div>
              <p className="font-bold text-yellow-300">{displayData[0]?.username}</p>
              <p className="text-xs text-yellow-500">{displayData[0]?.rating} pts</p>
              <div className="mt-3 w-full h-32 bg-gradient-to-t from-yellow-700/30 to-transparent rounded-t-lg border-t border-yellow-600" />
            </div>
            {/* 3rd Place */}
            <div className="flex flex-col items-center pt-12">
              <div className="relative mb-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-xl font-bold border-2 border-amber-600">
                  {(displayData[2]?.username || 'U')[0].toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-amber-700 rounded-full flex items-center justify-center text-xs font-bold border border-amber-500">
                  3
                </div>
              </div>
              <p className="text-sm font-semibold text-amber-300">{displayData[2]?.username}</p>
              <p className="text-xs text-gray-400">{displayData[2]?.rating} pts</p>
              <div className="mt-3 w-full h-12 bg-gradient-to-t from-amber-900/40 to-transparent rounded-t-lg border-t border-amber-700" />
            </div>
          </div>
        )}

        {/* Full Table */}
        <div className="bg-[#0b0f19] border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-gray-200 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" /> Rankings
            </h2>
            <span className="text-xs text-gray-500">{displayData.length} coders ranked</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-400">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                    <th className="px-6 py-3 text-left w-16">Rank</th>
                    <th className="px-6 py-3 text-left">Coder</th>
                    <th className="px-6 py-3 text-center">Badge</th>
                    <th className="px-6 py-3 text-center">Rating</th>
                    <th className="px-6 py-3 text-center">Solved</th>
                    <th className="px-6 py-3 text-center">Score</th>
                    <th className="px-6 py-3 text-center">Country</th>
                    <th className="px-6 py-3 text-center">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((user, idx) => {
                    const rank = user.rank || idx + 1;
                    const badgeStyle = BADGE_COLORS[user.badge] || 'text-gray-400 bg-gray-800/30 border-gray-700';
                    const isMe = user.username === 'demo_coder';
                    return (
                      <tr
                        key={user.user_id || idx}
                        className={`border-b border-gray-800/50 hover:bg-purple-900/10 transition-colors ${isMe ? 'bg-purple-900/20 border-purple-800/40' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {RANK_ICONS[rank] || (
                              <span className="text-gray-400 font-mono text-sm w-5 text-center">{rank}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border ${
                              rank === 1 ? 'bg-yellow-900/40 border-yellow-600 text-yellow-300' :
                              rank === 2 ? 'bg-gray-800 border-gray-500 text-gray-200' :
                              rank === 3 ? 'bg-amber-900/40 border-amber-700 text-amber-300' :
                              'bg-purple-900/30 border-purple-700 text-purple-300'
                            }`}>
                              {(user.username || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className={`font-medium text-sm ${isMe ? 'text-purple-300' : 'text-white'}`}>
                                {user.username} {isMe && <span className="text-xs text-purple-400">(you)</span>}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${badgeStyle}`}>
                            {user.badge || 'Apprentice'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-purple-300 font-semibold">{user.rating || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-green-400 font-medium">{user.solved || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-blue-300 font-mono text-sm">{user.score || user.rating || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-400 text-sm">
                          {user.country || '🌐'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <RankChange change={user.rank_change || 0} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            { label: 'Total Coders', value: displayData.length, icon: Globe, color: 'purple' },
            { label: 'Avg Rating', value: displayData.length ? Math.round(displayData.reduce((s, u) => s + (u.rating || 0), 0) / displayData.length) : 0, icon: Star, color: 'yellow' },
            { label: 'Problems Available', value: '9+', icon: Trophy, color: 'green' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`bg-[#0b0f19] border border-${color}-800/30 rounded-xl p-4 flex items-center gap-4`}>
              <div className={`p-3 bg-${color}-900/30 rounded-lg`}>
                <Icon className={`w-5 h-5 text-${color}-400`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

