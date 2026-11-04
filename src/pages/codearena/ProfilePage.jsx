import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { codeArenaApi } from '../../api/client';
import {
  User, Star, Trophy, Flame, Target, Code2, BarChart3,
  ArrowLeft, Loader2, Award, Calendar, TrendingUp, Zap,
  CheckCircle, Clock, XCircle
} from 'lucide-react';

const DIFFICULTY_COLORS = {
  easy: { bar: 'bg-green-500', text: 'text-green-400', bg: 'bg-green-900/20 border-green-800/40' },
  medium: { bar: 'bg-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-800/40' },
  hard: { bar: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-900/20 border-red-800/40' },
};

const BADGE_STYLES = {
  'Grandmaster': 'from-red-600 to-red-800 border-red-500',
  'Master': 'from-orange-600 to-orange-800 border-orange-500',
  'Expert': 'from-purple-600 to-purple-800 border-purple-500',
  'Specialist': 'from-cyan-600 to-cyan-800 border-cyan-500',
  'Apprentice': 'from-green-700 to-green-900 border-green-600',
};

function ActivityHeatmap({ days = 90 }) {
  // Generate fake activity data for demo
  const cells = Array.from({ length: days }, (_, i) => ({
    date: new Date(Date.now() - (days - i) * 86400000),
    count: Math.random() > 0.6 ? Math.floor(Math.random() * 5) : 0,
  }));

  const getColor = (count) => {
    if (count === 0) return 'bg-gray-800';
    if (count === 1) return 'bg-purple-900';
    if (count === 2) return 'bg-purple-700';
    if (count === 3) return 'bg-purple-500';
    return 'bg-purple-400';
  };

  return (
    <div className="flex flex-wrap gap-1">
      {cells.map((cell, i) => (
        <div
          key={i}
          title={`${cell.date.toDateString()}: ${cell.count} submissions`}
          className={`w-3 h-3 rounded-sm ${getColor(cell.count)} cursor-pointer hover:opacity-80 transition-opacity`}
        />
      ))}
    </div>
  );
}

function BarStat({ label, value, max, color = 'purple' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className={`text-${color}-400 font-medium`}>{value}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className={`bg-${color}-500 h-2 rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await codeArenaApi.getProfile();
      setProfile(res.data?.data || res.data);
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a10] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#070a10] flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400">{error || 'Profile not found'}</p>
          <button onClick={() => navigate('/codearena')} className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-sm">
            Back to Arena
          </button>
        </div>
      </div>
    );
  }

  const { username, rating, rank, streak, badges = [], stats = {}, language_usage = {}, topic_distribution = {} } = profile;
  const { easy_solved = 0, medium_solved = 0, hard_solved = 0, total_solved = 0, total_submissions = 0, accuracy = 0 } = stats;
  const badgeStyle = BADGE_STYLES[badges[0]] || BADGE_STYLES['Apprentice'];

  const totalProblems = { easy: 10, medium: 20, hard: 10 };

  const langEntries = Object.entries(language_usage || {});
  const maxLang = Math.max(...langEntries.map(([, v]) => v), 1);

  const topicEntries = Object.entries(topic_distribution || {});
  const maxTopic = Math.max(...topicEntries.map(([, v]) => v), 1);

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
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${badgeStyle} border-2 flex items-center justify-center text-3xl font-bold`}>
              {(username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{username || 'Demo Coder'}</h1>
              <div className="flex items-center gap-4 mt-2">
                {badges.length > 0 && (
                  <span className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${badgeStyle} border font-semibold`}>
                    {badges[0]}
                  </span>
                )}
                <span className="text-gray-400 text-sm flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-purple-400" /> Rank #{rank || '—'}
                </span>
                <span className="text-gray-400 text-sm flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" /> {streak || 0} day streak
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Rating', value: rating || 0, icon: Star, color: 'purple' },
            { label: 'Problems Solved', value: total_solved, icon: CheckCircle, color: 'green' },
            { label: 'Submissions', value: total_submissions, icon: Clock, color: 'blue' },
            { label: 'Accuracy', value: `${accuracy}%`, icon: Target, color: 'yellow' },
            { label: 'Streak', value: `${streak || 0}d`, icon: Flame, color: 'orange' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`bg-[#0b0f19] border border-${color}-800/30 rounded-xl p-4 text-center`}>
              <Icon className={`w-5 h-5 text-${color}-400 mx-auto mb-2`} />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Difficulty Breakdown */}
            <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-400" /> Difficulty Breakdown
              </h3>
              {[
                { key: 'easy', label: 'Easy', solved: easy_solved, total: totalProblems.easy },
                { key: 'medium', label: 'Medium', solved: medium_solved, total: totalProblems.medium },
                { key: 'hard', label: 'Hard', solved: hard_solved, total: totalProblems.hard },
              ].map(({ key, label, solved, total }) => {
                const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
                const { bar, text, bg } = DIFFICULTY_COLORS[key];
                return (
                  <div key={key} className={`mb-3 p-3 rounded-lg border ${bg}`}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className={text}>{label}</span>
                      <span className="text-gray-300">{solved}/{total}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className={`${bar} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Badges */}
            <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" /> Badges Earned
              </h3>
              {badges.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No badges yet. Keep solving!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge) => {
                    const style = BADGE_STYLES[badge] || BADGE_STYLES['Apprentice'];
                    return (
                      <span key={badge} className={`text-xs px-3 py-1.5 rounded-full bg-gradient-to-r ${style} border font-medium`}>
                        {badge}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Heatmap */}
            <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" /> Activity (Last 90 Days)
              </h3>
              <ActivityHeatmap days={90} />
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                <span>Less</span>
                {['bg-gray-800', 'bg-purple-900', 'bg-purple-700', 'bg-purple-500', 'bg-purple-400'].map((c, i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                ))}
                <span>More</span>
              </div>
            </div>

            {/* Language Usage */}
            {langEntries.length > 0 && (
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" /> Language Usage
                </h3>
                {langEntries.map(([lang, count]) => (
                  <BarStat key={lang} label={lang} value={count} max={maxLang} color="cyan" />
                ))}
              </div>
            )}

            {/* Topic Distribution */}
            {topicEntries.length > 0 && (
              <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" /> Topic Distribution
                </h3>
                {topicEntries.map(([topic, count]) => (
                  <BarStat key={topic} label={topic} value={count} max={maxTopic} color="indigo" />
                ))}
              </div>
            )}

            {/* Performance Insights */}
            <div className="bg-[#0b0f19] border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" /> Performance Insights
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Best Streak', value: `${(streak || 0) + 2} days` },
                  { label: 'Avg Time / Problem', value: '18 min' },
                  { label: 'Contests Entered', value: profile.contests_entered || 1 },
                  { label: 'Contest Best Rank', value: `#${profile.contest_best_rank || 3}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-lg font-semibold text-white mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

