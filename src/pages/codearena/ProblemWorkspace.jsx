import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import AppLayout from '../../components/layout/AppLayout';
import { codeArenaApi, ensureDemoAuth } from '../../api/client';
import {
  Play,
  Send,
  RotateCcw,
  Sparkles,
  BookOpen,
  MessageSquare,
  Clock,
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Cpu,
  ChevronDown,
  ChevronUp,
  Terminal,
  FileCode,
  ThumbsUp,
  ArrowLeft,
  Flame,
  Award,
  Layers,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

const LANGUAGE_CONFIG = {
  javascript: { name: 'JavaScript (Node.js)', monacoLang: 'javascript' },
  python: { name: 'Python 3', monacoLang: 'python' },
  cpp: { name: 'C++ (GCC 9.2)', monacoLang: 'cpp' },
  java: { name: 'Java (JDK 13)', monacoLang: 'java' },
  c: { name: 'C (GCC 9.2)', monacoLang: 'c' }
};

export default function ProblemWorkspace() {
  const { problemId } = useParams();
  const navigate = useNavigate();

  // State
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLang, setSelectedLang] = useState('javascript');
  const [code, setCode] = useState('');
  const [activeLeftTab, setActiveLeftTab] = useState('description'); // 'description', 'ai', 'editorial', 'submissions', 'discussions'
  
  // Execution Console State
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcases'); // 'testcases', 'custom', 'output'
  const [customInput, setCustomInput] = useState('');
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);

  // AI Assistant State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState('');
  const [aiHintLevel, setAiHintLevel] = useState(1);

  // Editorial & Discussions State
  const [editorial, setEditorial] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [submissionsList, setSubmissionsList] = useState([]);

  useEffect(() => {
    loadProblem();
  }, [problemId]);

  const loadProblem = async () => {
    setLoading(true);
    try {
      await ensureDemoAuth();
      const res = await codeArenaApi.getProblem(problemId);
      if (res.success) {
        const p = res.data;
        setProblem(p);
        const lang = p.last_language || 'javascript';
        setSelectedLang(lang);
        setCode(p.last_code || p.starter_templates[lang] || '');
        if (p.sample_test_cases && p.sample_test_cases.length > 0) {
          setCustomInput(p.sample_test_cases[0].input || '');
        }
      }
    } catch (err) {
      console.error('Failed to load problem:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    setSelectedLang(newLang);
    if (problem?.starter_templates?.[newLang]) {
      setCode(problem.starter_templates[newLang]);
    }
  };

  const handleResetCode = () => {
    if (problem?.starter_templates?.[selectedLang]) {
      setCode(problem.starter_templates[selectedLang]);
    }
  };

  // Run Code against sample / custom input
  const handleRunCode = async () => {
    setRunning(true);
    setActiveConsoleTab('output');
    try {
      const res = await codeArenaApi.runCode({
        problemId: problem.id,
        code,
        language: selectedLang,
        customInput: activeConsoleTab === 'custom' ? customInput : null
      });
      if (res.success) {
        setRunResult(res.data);
      }
    } catch (err) {
      setRunResult({ verdict: 'Runtime Error', first_failed_case: { error: err.message } });
    } finally {
      setRunning(false);
    }
  };

  // Submit Code against all hidden test cases
  const handleSubmitCode = async () => {
    setSubmitting(true);
    setActiveConsoleTab('output');
    try {
      const res = await codeArenaApi.submitCode({
        problemId: problem.id,
        code,
        language: selectedLang
      });
      if (res.success) {
        setSubmissionResult(res.data);
        setRunResult({
          verdict: res.data.status,
          passed_count: res.data.passed_test_cases,
          total_count: res.data.total_test_cases,
          average_time: (res.data.execution_time_ms / 1000).toFixed(3),
          peak_memory_kb: res.data.memory_kb,
          first_failed_case: res.data.first_failed_case,
          test_results: res.data.test_results
        });
        if (res.data.status === 'Accepted') {
          setProblem(prev => ({ ...prev, is_solved: true }));
        }
      }
    } catch (err) {
      setRunResult({ verdict: 'Internal Error', first_failed_case: { error: err.message } });
    } finally {
      setSubmitting(false);
    }
  };

  // AI Assistant triggers
  const triggerAi = async (type, params = {}) => {
    setAiLoading(true);
    setActiveLeftTab('ai');
    try {
      const res = await codeArenaApi.aiAssist({
        type,
        problemId: problem.id,
        code,
        language: selectedLang,
        error: runResult?.first_failed_case?.error || runResult?.verdict,
        testResult: runResult,
        level: params.level || aiHintLevel
      });
      if (type === 'explain') setAiOutput(res.explanation);
      if (type === 'hint') {
        setAiOutput(res.hint);
        setAiHintLevel(prev => (prev < 3 ? prev + 1 : 1));
      }
      if (type === 'explain_error') setAiOutput(res.analysis);
      if (type === 'complexity') setAiOutput(res.complexity);
      if (type === 'review') setAiOutput(res.review);
      if (type === 'optimize') setAiOutput(res.suggestions);
    } catch (err) {
      setAiOutput(`⚠️ AI Assistant encountered an error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Editorial tab
  const handleLoadEditorial = async () => {
    setActiveLeftTab('editorial');
    if (!editorial) {
      try {
        const res = await codeArenaApi.getEditorial(problem.id);
        if (res.success) setEditorial(res.data);
      } catch (e) {
        setEditorial({ approach: 'Locked', algorithm: e.message });
      }
    }
  };

  // Submissions tab
  const handleLoadSubmissions = async () => {
    setActiveLeftTab('submissions');
    try {
      const res = await codeArenaApi.getSubmissions({ problemId: problem.id });
      if (res.success) setSubmissionsList(res.data);
    } catch (e) {}
  };

  // Discussions tab
  const handleLoadDiscussions = async () => {
    setActiveLeftTab('discussions');
    try {
      const res = await codeArenaApi.getDiscussions(problem.id);
      if (res.success) setDiscussions(res.data);
    } catch (e) {}
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    if (!newDiscussionTitle.trim() || !newDiscussionContent.trim()) return;
    try {
      const res = await codeArenaApi.createDiscussion(problem.id, {
        title: newDiscussionTitle,
        content: newDiscussionContent,
        tags: [problem.category, selectedLang]
      });
      if (res.success) {
        setDiscussions([res.data, ...discussions]);
        setNewDiscussionTitle('');
        setNewDiscussionContent('');
      }
    } catch (e) {}
  };

  const handleAddComment = async (discussionId) => {
    const text = commentInputs[discussionId];
    if (!text || !text.trim()) return;
    try {
      const res = await codeArenaApi.addComment(discussionId, { content: text });
      if (res.success) {
        setDiscussions(discussions.map(d => d.id === discussionId ? { ...d, comments: [...(d.comments || []), res.data] } : d));
        setCommentInputs({ ...commentInputs, [discussionId]: '' });
      }
    } catch (e) {}
  };

  const handleUpvote = async (discussionId) => {
    try {
      await codeArenaApi.upvoteDiscussion(discussionId);
      setDiscussions(discussions.map(d => d.id === discussionId ? { ...d, upvotes: d.upvotes + 1 } : d));
    } catch (e) {}
  };

  if (loading || !problem) {
    return (
      <AppLayout>
        <div className="flex-1 bg-[#070a10] flex items-center justify-center text-gray-500 font-mono text-xs">
          Loading problem workspace...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 bg-[#070a10] text-gray-200 flex flex-col h-screen overflow-hidden font-sans">
        {/* TOP WORKSPACE NAVIGATION BAR */}
        <div className="h-12 bg-[#0b0f19] border-b border-gray-800/80 px-4 flex items-center justify-between flex-shrink-0 text-xs">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/codearena/problems')}
              className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"
              title="Back to Problems"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm">{problem.title}</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  problem.difficulty === 'Easy'
                    ? 'bg-emerald-950 text-emerald-400'
                    : problem.difficulty === 'Medium'
                    ? 'bg-amber-950 text-amber-400'
                    : 'bg-rose-950 text-rose-400'
                }`}
              >
                {problem.difficulty}
              </span>
              {problem.is_solved && (
                <span className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 text-[10px] font-semibold rounded">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Solved</span>
                </span>
              )}
            </div>
          </div>

          {/* RIGHT ACTION CONTROLS */}
          <div className="flex items-center space-x-2.5">
            {/* Language Selector */}
            <div className="relative">
              <select
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-1.5 bg-[#0e1320] border border-gray-700/80 rounded-lg text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                {Object.entries(LANGUAGE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k} className="bg-gray-900 text-white">
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Code */}
            <button
              onClick={handleResetCode}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition"
              title="Reset to starter template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Run Code */}
            <button
              onClick={handleRunCode}
              disabled={running || submitting}
              className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{running ? 'Running...' : 'Run'}</span>
            </button>

            {/* Submit Code */}
            <button
              onClick={handleSubmitCode}
              disabled={running || submitting}
              className="px-5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-purple-600/30 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Evaluating...' : 'Submit'}</span>
            </button>
          </div>
        </div>

        {/* MAIN SPLIT PANE BODY */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT PANE: DESCRIPTION, AI ASSISTANT, EDITORIAL, DISCUSSIONS */}
          <div className="w-1/2 flex flex-col border-r border-gray-800/80 bg-[#070a10] overflow-hidden">
            {/* TABS HEADER */}
            <div className="h-10 bg-[#0b0f19] border-b border-gray-800/80 px-3 flex items-center space-x-1 flex-shrink-0 text-xs">
              <button
                onClick={() => setActiveLeftTab('description')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition ${
                  activeLeftTab === 'description'
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Description</span>
              </button>

              <button
                onClick={() => setActiveLeftTab('ai')}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition ${
                  activeLeftTab === 'ai'
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Assistant</span>
              </button>

              <button
                onClick={handleLoadEditorial}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition ${
                  activeLeftTab === 'editorial'
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Editorial</span>
              </button>

              <button
                onClick={handleLoadSubmissions}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition ${
                  activeLeftTab === 'submissions'
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>Submissions</span>
              </button>

              <button
                onClick={handleLoadDiscussions}
                className={`px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition ${
                  activeLeftTab === 'discussions'
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-rose-400" />
                <span>Discuss</span>
              </button>
            </div>

            {/* TAB CONTENT SCROLLABLE */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-gray-300">
              {/* TAB 1: DESCRIPTION */}
              {activeLeftTab === 'description' && (
                <div className="space-y-6">
                  {/* Problem statement */}
                  <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-4">
                    <p className="whitespace-pre-line text-gray-200 text-sm font-normal">
                      {problem.description}
                    </p>
                  </div>

                  {/* Input / Output format */}
                  <div className="space-y-3">
                    <div className="bg-[#0e1320] border border-gray-800 p-3.5 rounded-xl space-y-1">
                      <div className="font-bold text-gray-300 uppercase tracking-wider text-[10px] font-mono text-purple-400">
                        Input Format
                      </div>
                      <p className="text-gray-300 font-mono text-[11px]">{problem.input_format}</p>
                    </div>

                    <div className="bg-[#0e1320] border border-gray-800 p-3.5 rounded-xl space-y-1">
                      <div className="font-bold text-gray-300 uppercase tracking-wider text-[10px] font-mono text-purple-400">
                        Output Format
                      </div>
                      <p className="text-gray-300 font-mono text-[11px]">{problem.output_format}</p>
                    </div>
                  </div>

                  {/* Sample test cases */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider">Sample Test Cases</h3>
                    {problem.sample_test_cases.map((tc, idx) => (
                      <div key={idx} className="bg-[#0b0f19] border border-gray-800 rounded-xl p-4 space-y-2">
                        <div className="font-bold text-purple-400 font-mono text-[11px]">Example {idx + 1}</div>
                        <div className="space-y-1">
                          <div className="text-[10px] text-gray-500 font-mono uppercase">Input:</div>
                          <pre className="p-2 bg-[#0e1320] rounded border border-gray-800 text-gray-200 font-mono text-[11px] overflow-x-auto">
                            {tc.input}
                          </pre>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[10px] text-gray-500 font-mono uppercase">Expected Output:</div>
                          <pre className="p-2 bg-[#0e1320] rounded border border-gray-800 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                            {tc.expected_output}
                          </pre>
                        </div>
                        {tc.explanation && (
                          <div className="text-[11px] text-gray-400 italic">
                            <strong className="text-gray-300">Explanation:</strong> {tc.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Constraints */}
                  <div className="bg-[#0e1320] border border-gray-800 p-4 rounded-xl space-y-2">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono text-purple-400">
                      Constraints
                    </h3>
                    <pre className="text-gray-300 font-mono text-[11px] whitespace-pre-line leading-relaxed">
                      {problem.constraints}
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 2: AI CODING ASSISTANT */}
              {activeLeftTab === 'ai' && (
                <div className="space-y-5">
                  <div className="p-4 bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-[#0e1320] border border-purple-500/30 rounded-xl space-y-1.5">
                    <div className="flex items-center space-x-2 text-purple-300 font-bold">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>CodeArena AI Mentor</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Get structured algorithmic coaching, complexity breakdowns, and debugging guidance.
                    </p>
                  </div>

                  {/* 6 AI Action Buttons */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => triggerAi('explain')}
                      disabled={aiLoading}
                      className="p-3 bg-[#0e1320] hover:bg-purple-900/20 border border-gray-800 hover:border-purple-500/40 rounded-xl text-left transition disabled:opacity-50"
                    >
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Explain Problem</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">Simple language & analogies</div>
                    </button>

                    <button
                      onClick={() => triggerAi('hint')}
                      disabled={aiLoading}
                      className="p-3 bg-[#0e1320] hover:bg-purple-900/20 border border-gray-800 hover:border-purple-500/40 rounded-xl text-left transition disabled:opacity-50"
                    >
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Progressive Hint ({aiHintLevel}/3)</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">Nudges without full solution</div>
                    </button>

                    <button
                      onClick={() => triggerAi('complexity')}
                      disabled={aiLoading}
                      className="p-3 bg-[#0e1320] hover:bg-purple-900/20 border border-gray-800 hover:border-purple-500/40 rounded-xl text-left transition disabled:opacity-50"
                    >
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Big-O Complexity</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">Time & Space analysis</div>
                    </button>

                    <button
                      onClick={() => triggerAi('explain_error')}
                      disabled={aiLoading}
                      className="p-3 bg-[#0e1320] hover:bg-purple-900/20 border border-gray-800 hover:border-purple-500/40 rounded-xl text-left transition disabled:opacity-50"
                    >
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>Explain Bug / Error</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">Diagnose compilation/runtime bugs</div>
                    </button>

                    <button
                      onClick={() => triggerAi('review')}
                      disabled={aiLoading}
                      className="p-3 bg-[#0e1320] hover:bg-purple-900/20 border border-gray-800 hover:border-purple-500/40 rounded-xl text-left transition disabled:opacity-50"
                    >
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>Code Review</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">Edge cases & clean code</div>
                    </button>

                    <button
                      onClick={() => triggerAi('optimize')}
                      disabled={aiLoading}
                      className="p-3 bg-[#0e1320] hover:bg-purple-900/20 border border-gray-800 hover:border-purple-500/40 rounded-xl text-left transition disabled:opacity-50"
                    >
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span>Optimization Tips</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">Memory & speed tuning</div>
                    </button>
                  </div>

                  {/* AI Response Display */}
                  {aiLoading ? (
                    <div className="p-8 bg-[#0b0f19] border border-gray-800 rounded-xl flex items-center justify-center space-x-2 text-purple-400 text-xs font-mono">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Synthesizing algorithmic coaching response...</span>
                    </div>
                  ) : aiOutput ? (
                    <div className="p-5 bg-[#0b0f19] border border-purple-500/30 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                        <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">AI Mentor Advice</span>
                        <button
                          onClick={() => setAiOutput('')}
                          className="text-[10px] text-gray-500 hover:text-white"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="prose prose-invert max-w-none text-xs text-gray-200 whitespace-pre-line leading-relaxed font-sans">
                        {aiOutput}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* TAB 3: EDITORIAL */}
              {activeLeftTab === 'editorial' && (
                <div className="space-y-4">
                  {editorial ? (
                    <div className="space-y-4">
                      <div className="bg-[#0e1320] border border-gray-800 p-4 rounded-xl space-y-2">
                        <div className="font-bold text-white text-sm">Approach: {editorial.approach}</div>
                        <p className="text-gray-300 text-xs leading-relaxed">{editorial.algorithm}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-[#0b0f19] border border-gray-800 rounded-xl">
                          <span className="text-[10px] text-gray-400 uppercase font-mono">Time Complexity</span>
                          <div className="font-bold text-emerald-400 text-xs mt-1 font-mono">{editorial.time_complexity}</div>
                        </div>
                        <div className="p-3 bg-[#0b0f19] border border-gray-800 rounded-xl">
                          <span className="text-[10px] text-gray-400 uppercase font-mono">Space Complexity</span>
                          <div className="font-bold text-indigo-400 text-xs mt-1 font-mono">{editorial.space_complexity}</div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 uppercase font-mono">Optimal Reference Solution</span>
                        <pre className="p-4 bg-[#0b0f19] border border-gray-800 rounded-xl text-purple-300 font-mono text-[11px] overflow-x-auto">
                          {editorial.solution_code}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500 text-xs">Loading editorial...</div>
                  )}
                </div>
              )}

              {/* TAB 4: SUBMISSIONS */}
              {activeLeftTab === 'submissions' && (
                <div className="space-y-3">
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider">Your Past Submissions</h3>
                  {submissionsList.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-xs">No previous submissions for this problem.</div>
                  ) : (
                    submissionsList.map(s => (
                      <div key={s.id} className="p-3.5 bg-[#0e1320] border border-gray-800 rounded-xl flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              s.status === 'Accepted' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                            }`}>
                              {s.status}
                            </span>
                            <span className="font-mono text-gray-400 text-[11px] uppercase">{s.language}</span>
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            {s.passed_test_cases}/{s.total_test_cases} Passed • {s.execution_time_ms}ms • {(s.memory_kb / 1024).toFixed(1)} MB
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(s.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: DISCUSSIONS */}
              {activeLeftTab === 'discussions' && (
                <div className="space-y-6">
                  {/* Create Discussion Form */}
                  <form onSubmit={handleCreateDiscussion} className="bg-[#0e1320] border border-gray-800 p-4 rounded-xl space-y-3">
                    <span className="font-bold text-white text-xs">Start a New Discussion</span>
                    <input
                      type="text"
                      placeholder="Title (e.g. Clean Two-Pointer Approach in Java)"
                      value={newDiscussionTitle}
                      onChange={(e) => setNewDiscussionTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#070a10] border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                    <textarea
                      rows={3}
                      placeholder="Share your approach, alternative data structures, or edge case insights..."
                      value={newDiscussionContent}
                      onChange={(e) => setNewDiscussionContent(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#070a10] border border-gray-800 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Post Discussion
                    </button>
                  </form>

                  {/* Discussions List */}
                  <div className="space-y-4">
                    {discussions.map(d => (
                      <div key={d.id} className="bg-[#0b0f19] border border-gray-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{d.title}</span>
                          <button
                            onClick={() => handleUpvote(d.id)}
                            className="flex items-center space-x-1 px-2.5 py-1 bg-gray-800 hover:bg-purple-900/40 text-gray-300 hover:text-purple-300 rounded-lg text-xs transition"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>{d.upvotes}</span>
                          </button>
                        </div>
                        <p className="text-gray-300 text-xs leading-relaxed">{d.content}</p>
                        <div className="flex items-center space-x-2 text-[10px] text-gray-500 font-mono">
                          <span>By {d.user_name}</span>
                          <span>•</span>
                          <span>{d.comments?.length || 0} Replies</span>
                        </div>

                        {/* Comments */}
                        {d.comments && d.comments.length > 0 && (
                          <div className="space-y-2 border-t border-gray-800/60 pt-3">
                            {d.comments.map(c => (
                              <div key={c.id} className="p-2.5 bg-[#0e1320] rounded-lg text-xs space-y-1">
                                <div className="text-[10px] font-bold text-purple-300">{c.user_name}</div>
                                <div className="text-gray-300">{c.content}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add reply */}
                        <div className="flex items-center space-x-2 pt-2">
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            value={commentInputs[d.id] || ''}
                            onChange={(e) => setCommentInputs({ ...commentInputs, [d.id]: e.target.value })}
                            className="flex-1 px-3 py-1 bg-[#070a10] border border-gray-800 rounded-lg text-xs text-white"
                          />
                          <button
                            onClick={() => handleAddComment(d.id)}
                            className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE: MONACO EDITOR (TOP) & TEST CASES CONSOLE (BOTTOM) */}
          <div className="w-1/2 flex flex-col bg-[#0b0f19] overflow-hidden">
            {/* MONACO CODE EDITOR */}
            <div className="flex-1 overflow-hidden relative">
              <Editor
                height="100%"
                language={LANGUAGE_CONFIG[selectedLang]?.monacoLang || 'javascript'}
                value={code}
                onChange={(newVal) => setCode(newVal || '')}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  fontFamily: 'Fira Code, Menlo, Monaco, Consolas, monospace'
                }}
              />
            </div>

            {/* BOTTOM CONSOLE: TEST CASES, CUSTOM INPUT, AND OUTPUT */}
            <div className="h-64 border-t border-gray-800/80 bg-[#070a10] flex flex-col flex-shrink-0">
              {/* CONSOLE TABS */}
              <div className="h-9 bg-[#0b0f19] border-b border-gray-800/80 px-3 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setActiveConsoleTab('testcases')}
                    className={`px-3 py-1 rounded text-[11px] font-medium transition ${
                      activeConsoleTab === 'testcases' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Sample Cases
                  </button>
                  <button
                    onClick={() => setActiveConsoleTab('custom')}
                    className={`px-3 py-1 rounded text-[11px] font-medium transition ${
                      activeConsoleTab === 'custom' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Custom Input
                  </button>
                  <button
                    onClick={() => setActiveConsoleTab('output')}
                    className={`px-3 py-1 rounded text-[11px] font-medium transition ${
                      activeConsoleTab === 'output' ? 'bg-gray-800 text-purple-300' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Execution Output
                  </button>
                </div>

                {runResult && (
                  <div className="flex items-center space-x-2 text-[10px]">
                    <span className="text-gray-500">Verdict:</span>
                    <span className={`font-bold uppercase ${
                      runResult.verdict === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {runResult.verdict}
                    </span>
                  </div>
                )}
              </div>

              {/* CONSOLE BODY */}
              <div className="flex-1 p-3.5 overflow-y-auto text-xs font-mono text-gray-300">
                {/* SAMPLE CASES */}
                {activeConsoleTab === 'testcases' && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      {problem.sample_test_cases.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedTestCaseIdx(idx)}
                          className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                            selectedTestCaseIdx === idx
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-800/80 text-gray-400 hover:text-white'
                          }`}
                        >
                          Case {idx + 1}
                        </button>
                      ))}
                    </div>

                    {problem.sample_test_cases[selectedTestCaseIdx] && (
                      <div className="space-y-2">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase">Input:</div>
                          <pre className="p-2 bg-[#0e1320] border border-gray-800 rounded text-[11px] text-gray-200">
                            {problem.sample_test_cases[selectedTestCaseIdx].input}
                          </pre>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase">Expected Output:</div>
                          <pre className="p-2 bg-[#0e1320] border border-gray-800 rounded text-[11px] text-emerald-400">
                            {problem.sample_test_cases[selectedTestCaseIdx].expected_output}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CUSTOM INPUT */}
                {activeConsoleTab === 'custom' && (
                  <div className="h-full flex flex-col space-y-1">
                    <span className="text-[10px] text-gray-500 uppercase">Custom STDIN:</span>
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter raw stdin values here..."
                      className="flex-1 w-full p-2 bg-[#0e1320] border border-gray-800 rounded text-[11px] text-white focus:outline-none focus:border-purple-500 font-mono resize-none"
                    />
                  </div>
                )}

                {/* OUTPUT */}
                {activeConsoleTab === 'output' && (
                  <div>
                    {running || submitting ? (
                      <div className="flex items-center justify-center py-8 space-x-2 text-purple-400">
                        <Cpu className="w-4 h-4 animate-spin" />
                        <span>Evaluating submission in Judge0 isolated sandbox...</span>
                      </div>
                    ) : runResult ? (
                      <div className="space-y-3">
                        {/* Status banner */}
                        <div className={`p-3 rounded-xl border flex items-center justify-between ${
                          runResult.verdict === 'Accepted'
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        }`}>
                          <div className="flex items-center space-x-2 font-bold text-sm">
                            {runResult.verdict === 'Accepted' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-400" />
                            )}
                            <span>{runResult.verdict}</span>
                          </div>

                          <div className="text-[11px] font-mono text-gray-400 flex items-center space-x-3">
                            <span>Passed: {runResult.passed_count}/{runResult.total_count}</span>
                            <span>Time: {runResult.average_time}s</span>
                            <span>Memory: {Math.round(runResult.peak_memory_kb / 1024)} MB</span>
                          </div>
                        </div>

                        {/* Error output if failed */}
                        {runResult.first_failed_case && runResult.first_failed_case.error && (
                          <div className="space-y-1">
                            <span className="text-[10px] text-rose-400 uppercase">Error Output:</span>
                            <pre className="p-2.5 bg-rose-950/20 border border-rose-900/40 rounded text-rose-300 text-[11px] overflow-x-auto">
                              {runResult.first_failed_case.error}
                            </pre>
                          </div>
                        )}

                        {/* Test case breakdown if available */}
                        {runResult.test_results && (
                          <div className="grid grid-cols-4 gap-2 pt-1">
                            {runResult.test_results.map((tr) => (
                              <div
                                key={tr.test_case_number}
                                className={`p-2 rounded border text-center ${
                                  tr.passed
                                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                                    : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                                }`}
                              >
                                <div className="font-bold">Test #{tr.test_case_number}</div>
                                <div className="text-[9px] uppercase font-mono">{tr.status}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-8">
                        Click 'Run' to test sample cases or 'Submit' to evaluate against all test cases.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

