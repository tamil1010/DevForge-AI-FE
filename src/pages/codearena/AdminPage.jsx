import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { codeArenaApi } from '../../api/client';
import {
  ShieldCheck, Plus, Trash2, Edit3, ArrowLeft, Loader2,
  CheckCircle, XCircle, AlertCircle, Trophy, BookOpen,
  RefreshCw, ChevronDown
} from 'lucide-react';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const CATEGORIES = ['Arrays', 'Strings', 'Linked Lists', 'Stack & Queue', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Binary Search', 'Math', 'Backtracking', 'Hashing'];

const EMPTY_PROBLEM = {
  title: '', difficulty: 'Easy', category: 'Arrays',
  description: '', constraints: '', examples: '',
  time_limit: 2000, memory_limit: 256,
  tags: '', languages: ['javascript', 'python', 'cpp'],
};

const EMPTY_CONTEST = {
  title: '', description: '', start_time: '', end_time: '',
  duration_minutes: 90, problems: [], max_participants: 500,
};

function Toast({ msg, type }) {
  if (!msg) return null;
  const styles = {
    success: 'bg-green-900/80 border-green-700 text-green-200',
    error: 'bg-red-900/80 border-red-700 text-red-200',
    info: 'bg-blue-900/80 border-blue-700 text-blue-200',
  };
  return (
    <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl border text-sm flex items-center gap-2 shadow-xl ${styles[type] || styles.info}`}>
      {type === 'success' && <CheckCircle className="w-4 h-4" />}
      {type === 'error' && <XCircle className="w-4 h-4" />}
      {type === 'info' && <AlertCircle className="w-4 h-4" />}
      {msg}
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('problems');
  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: '', type: 'info' });
  const [showAddProblem, setShowAddProblem] = useState(false);
  const [showAddContest, setShowAddContest] = useState(false);
  const [problemForm, setProblemForm] = useState(EMPTY_PROBLEM);
  const [contestForm, setContestForm] = useState(EMPTY_CONTEST);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'info' }), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        codeArenaApi.getProblems({ limit: 100 }),
        codeArenaApi.getContests(),
      ]);
      setProblems(pRes.data?.data?.problems || pRes.data?.problems || []);
      setContests(cRes.data?.data || cRes.data || []);
    } catch {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProblem = async (e) => {
    e.preventDefault();
    if (!problemForm.title.trim() || !problemForm.description.trim()) {
      showToast('Title and description are required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...problemForm,
        tags: problemForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      await codeArenaApi.adminCreateProblem(payload);
      showToast('Problem created successfully!', 'success');
      setShowAddProblem(false);
      setProblemForm(EMPTY_PROBLEM);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create problem', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProblem = async (problemId) => {
    if (!confirm(`Delete problem "${problemId}"?`)) return;
    setDeleting(problemId);
    try {
      await codeArenaApi.adminDeleteProblem(problemId);
      showToast('Problem deleted', 'success');
      setProblems(p => p.filter(x => x.id !== problemId));
    } catch {
      showToast('Failed to delete problem', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const handleCreateContest = async (e) => {
    e.preventDefault();
    if (!contestForm.title.trim()) {
      showToast('Contest title is required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await codeArenaApi.adminCreateContest(contestForm);
      showToast('Contest created!', 'success');
      setShowAddContest(false);
      setContestForm(EMPTY_CONTEST);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create contest', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const DIFF_COLORS = { Easy: 'text-green-400', Medium: 'text-yellow-400', Hard: 'text-red-400' };

  return (
    <div className="min-h-screen bg-[#070a10] text-white">
      <Toast msg={toast.msg} type={toast.type} />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/40 via-[#0b0f19] to-indigo-900/40 border-b border-purple-800/30 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/codearena')}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Arena
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-600/30">
                <ShieldCheck className="w-7 h-7 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Management</h1>
                <p className="text-gray-400 text-sm">Manage problems, contests, and platform settings</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-[#0b0f19] border border-gray-800 rounded-xl p-1 w-fit">
          {[
            { key: 'problems', label: 'Problems', icon: BookOpen },
            { key: 'contests', label: 'Contests', icon: Trophy },
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
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-gray-400 text-sm">{problems.length} problems</p>
              <button
                onClick={() => setShowAddProblem(!showAddProblem)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Problem
              </button>
            </div>

            {/* Add Problem Form */}
            {showAddProblem && (
              <div className="bg-[#0b0f19] border border-purple-800/50 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-purple-300 mb-5 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> New Problem
                </h3>
                <form onSubmit={handleCreateProblem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-400 mb-1 block">Title *</label>
                    <input
                      value={problemForm.title}
                      onChange={e => setProblemForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Two Sum"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Difficulty</label>
                    <select
                      value={problemForm.difficulty}
                      onChange={e => setProblemForm(p => ({ ...p, difficulty: e.target.value }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                    >
                      {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Category</label>
                    <select
                      value={problemForm.category}
                      onChange={e => setProblemForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                    >
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-400 mb-1 block">Description *</label>
                    <textarea
                      value={problemForm.description}
                      onChange={e => setProblemForm(p => ({ ...p, description: e.target.value }))}
                      rows={4}
                      placeholder="Problem description..."
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Tags (comma-separated)</label>
                    <input
                      value={problemForm.tags}
                      onChange={e => setProblemForm(p => ({ ...p, tags: e.target.value }))}
                      placeholder="hash-table, two-pointer"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Time Limit (ms)</label>
                    <input
                      type="number"
                      value={problemForm.time_limit}
                      onChange={e => setProblemForm(p => ({ ...p, time_limit: Number(e.target.value) }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => { setShowAddProblem(false); setProblemForm(EMPTY_PROBLEM); }}
                      className="px-4 py-2 border border-gray-700 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Create Problem
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Problems Table */}
            <div className="bg-[#0b0f19] border border-gray-800 rounded-xl overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                      <th className="px-6 py-3 text-left">Problem</th>
                      <th className="px-6 py-3 text-center">Difficulty</th>
                      <th className="px-6 py-3 text-center">Category</th>
                      <th className="px-6 py-3 text-center">Acceptance</th>
                      <th className="px-6 py-3 text-center">Submissions</th>
                      <th className="px-6 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {problems.map((p, i) => (
                      <tr key={p.id || i} className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-sm text-white">{p.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{p.id}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-xs font-semibold ${DIFF_COLORS[p.difficulty] || 'text-gray-400'}`}>
                            {p.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs text-gray-400">{p.category}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs text-green-400">{p.acceptance_rate || 0}%</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-xs text-gray-400">{p.submission_count || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate(`/codearena/problems/${p.id}`)}
                              className="p-1.5 rounded-lg bg-blue-900/30 hover:bg-blue-800/50 text-blue-400 transition-colors"
                              title="View"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProblem(p.id)}
                              disabled={deleting === p.id}
                              className="p-1.5 rounded-lg bg-red-900/30 hover:bg-red-800/50 text-red-400 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deleting === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Contests Tab */}
        {activeTab === 'contests' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-gray-400 text-sm">{contests.length} contests</p>
              <button
                onClick={() => setShowAddContest(!showAddContest)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Contest
              </button>
            </div>

            {/* Add Contest Form */}
            {showAddContest && (
              <div className="bg-[#0b0f19] border border-purple-800/50 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-purple-300 mb-5 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> New Contest
                </h3>
                <form onSubmit={handleCreateContest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-400 mb-1 block">Title *</label>
                    <input
                      value={contestForm.title}
                      onChange={e => setContestForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Weekly Clash #43"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-400 mb-1 block">Description</label>
                    <textarea
                      value={contestForm.description}
                      onChange={e => setContestForm(p => ({ ...p, description: e.target.value }))}
                      rows={2}
                      placeholder="Contest description..."
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Start Time</label>
                    <input
                      type="datetime-local"
                      value={contestForm.start_time}
                      onChange={e => setContestForm(p => ({ ...p, start_time: e.target.value }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Duration (minutes)</label>
                    <input
                      type="number"
                      value={contestForm.duration_minutes}
                      onChange={e => setContestForm(p => ({ ...p, duration_minutes: Number(e.target.value) }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Max Participants</label>
                    <input
                      type="number"
                      value={contestForm.max_participants}
                      onChange={e => setContestForm(p => ({ ...p, max_participants: Number(e.target.value) }))}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => { setShowAddContest(false); setContestForm(EMPTY_CONTEST); }}
                      className="px-4 py-2 border border-gray-700 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Create Contest
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Contests Table */}
            <div className="bg-[#0b0f19] border border-gray-800 rounded-xl overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                      <th className="px-6 py-3 text-left">Contest</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3 text-center">Problems</th>
                      <th className="px-6 py-3 text-center">Participants</th>
                      <th className="px-6 py-3 text-center">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contests.map((c, i) => {
                      const statusColors = {
                        live: 'text-green-400 bg-green-900/20 border-green-700',
                        upcoming: 'text-blue-400 bg-blue-900/20 border-blue-700',
                        completed: 'text-gray-400 bg-gray-800/30 border-gray-700',
                      };
                      return (
                        <tr key={c.id || i} className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-medium text-sm text-white">{c.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{c.description}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${statusColors[c.status] || statusColors.upcoming}`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-400 text-sm">
                            {(c.problems || []).length}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-400 text-sm">
                            {c.participant_count || 0}
                          </td>
                          <td className="px-6 py-4 text-center text-gray-400 text-sm">
                            {c.duration_minutes || '—'} min
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

