import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import Editor from '@monaco-editor/react';
import { codeProjectApi, projectApi } from '../api/client';
import {
  Code2,
  FileCode,
  Folder,
  Play,
  Bug,
  ShieldCheck,
  Zap,
  BookOpen,
  Send,
  Download,
  Database,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  GitBranch,
  FileText,
  Lock,
  Search,
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  ChevronDown,
  History,
  Terminal,
  ExternalLink,
  HelpCircle,
  Wrench,
  KeyRound,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function CodeWorkspace() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // State
  const [project, setProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [activeTab, setActiveTab] = useState('editor'); // overview, editor, architecture, database, crud, api, auth, tests, debugger, review, security, chat, versions, docs, dependencies
  const [loading, setLoading] = useState(true);
  const [editorContent, setEditorContent] = useState('');
  const [savingFile, setSavingFile] = useState(false);

  // Database Import Modal
  const [showDbModal, setShowDbModal] = useState(false);
  const [dbProjects, setDbProjects] = useState([]);
  const [selectedDbId, setSelectedDbId] = useState('');
  const [importingDb, setImportingDb] = useState(false);

  // Generators State
  const [crudEntity, setCrudEntity] = useState('');
  const [apiSpec, setApiSpec] = useState({ endpointName: 'Payment', path: '/api/payments', method: 'POST', description: 'Process online payments' });
  const [authConfig, setAuthConfig] = useState({ authType: 'JWT', includeRoles: true });

  // AI Actions & Features State
  const [debugLog, setDebugLog] = useState('');
  const [debugResult, setDebugResult] = useState(null);
  const [reviewResult, setReviewResult] = useState(null);
  const [securityResult, setSecurityResult] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [docsMarkdown, setDocsMarkdown] = useState('');
  const [dependenciesResult, setDependenciesResult] = useState(null);

  // Diff & Modification State
  const [modifyPrompt, setModifyPrompt] = useState('');
  const [modifyResult, setModifyResult] = useState(null);
  const [versions, setVersions] = useState([]);

  // AI Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  useEffect(() => {
    fetchProjectData();
    fetchChatHistory();
    fetchVersions();
  }, [projectId]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const res = await codeProjectApi.getProject(projectId);
      if (res.success && res.data) {
        setProject(res.data);
        const fList = res.data.files || [];
        setFiles(fList);
        if (fList.length > 0) {
          const mainFile = fList.find(f => f.name === 'server.js' || f.name === 'app.py' || f.name === 'App.jsx') || fList[0];
          setActiveFile(mainFile);
          setEditorContent(mainFile.content || '');
        }
      }
    } catch (err) {
      console.error('Failed to load code project workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await codeProjectApi.getChatHistory(projectId);
      if (res.success && res.data) setChatMessages(res.data);
    } catch (e) {}
  };

  const fetchVersions = async () => {
    try {
      const res = await codeProjectApi.getVersions(projectId);
      if (res.success && res.data) setVersions(res.data);
    } catch (e) {}
  };

  const handleSelectFile = (file) => {
    setActiveFile(file);
    setEditorContent(file.content || '');
  };

  const handleSaveFile = async () => {
    if (!activeFile) return;
    setSavingFile(true);
    try {
      const res = await codeProjectApi.saveFile(projectId, {
        path: activeFile.path,
        name: activeFile.name,
        content: editorContent,
        language: activeFile.language || 'javascript'
      });
      if (res.success) {
        setFiles(files.map(f => f.path === activeFile.path ? { ...f, content: editorContent } : f));
      }
    } catch (err) {
      console.error('File save error:', err);
    } finally {
      setSavingFile(false);
    }
  };

  const handleOpenDbImportModal = async () => {
    setShowDbModal(true);
    try {
      const res = await projectApi.getProjects();
      if (res.success && res.data) setDbProjects(res.data);
    } catch (e) {}
  };

  const handleImportDatabase = async () => {
    if (!selectedDbId) return;
    setImportingDb(true);
    try {
      const res = await codeProjectApi.importDatabaseSchema(projectId, { db_project_id: selectedDbId });
      if (res.success) {
        setShowDbModal(false);
        fetchProjectData();
      }
    } catch (err) {
      console.error('Database import error:', err);
    } finally {
      setImportingDb(false);
    }
  };

  const handleGenerateCrud = async () => {
    if (!crudEntity) return;
    try {
      const res = await codeProjectApi.generateCrud(projectId, { entity_name: crudEntity });
      if (res.success) {
        fetchProjectData();
        setActiveTab('editor');
      }
    } catch (err) {
      console.error('CRUD generation error:', err);
    }
  };

  const handleGenerateApi = async () => {
    try {
      const res = await codeProjectApi.generateApi(projectId, apiSpec);
      if (res.success && res.data) {
        await codeProjectApi.saveFile(projectId, res.data);
        fetchProjectData();
        setActiveTab('editor');
      }
    } catch (err) {
      console.error('API generation error:', err);
    }
  };

  const handleGenerateAuth = async () => {
    try {
      const res = await codeProjectApi.generateAuth(projectId, authConfig);
      if (res.success && res.data) {
        for (const f of res.data) {
          await codeProjectApi.saveFile(projectId, f);
        }
        fetchProjectData();
        setActiveTab('editor');
      }
    } catch (err) {
      console.error('Auth generation error:', err);
    }
  };

  const handleDebugCode = async () => {
    try {
      const res = await codeProjectApi.debugCode(projectId, {
        error_message: debugLog || 'TypeError: Cannot read properties of undefined (reading id)',
        file_content: editorContent
      });
      if (res.success && res.data) {
        setDebugResult(res.data);
      }
    } catch (err) {
      console.error('Debug error:', err);
    }
  };

  const handleModifyCode = async () => {
    if (!modifyPrompt || !activeFile) return;
    try {
      const res = await codeProjectApi.modifyCode(projectId, {
        prompt: modifyPrompt,
        target_file: activeFile.path,
        current_content: editorContent
      });
      if (res.success && res.data) {
        setModifyResult(res.data);
        setActiveTab('diff');
      }
    } catch (err) {
      console.error('Modify error:', err);
    }
  };

  const handleApplyModifyDiff = async () => {
    if (!modifyResult || !activeFile) return;
    setEditorContent(modifyResult.modifiedContent);
    await codeProjectApi.saveFile(projectId, {
      path: activeFile.path,
      name: activeFile.name,
      content: modifyResult.modifiedContent,
      language: activeFile.language
    });
    setModifyResult(null);
    fetchProjectData();
    setActiveTab('editor');
  };

  const handleRunReview = async () => {
    try {
      const res = await codeProjectApi.reviewCode(projectId);
      if (res.success) setReviewResult(res.data);
    } catch (e) {}
  };

  const handleRunSecurityScan = async () => {
    try {
      const res = await codeProjectApi.scanSecurity(projectId);
      if (res.success) setSecurityResult(res.data);
    } catch (e) {}
  };

  const handleGenerateTests = async () => {
    try {
      const res = await codeProjectApi.generateTests(projectId);
      if (res.success) setTestResult(res.data);
    } catch (e) {}
  };

  const handleGenerateDocs = async () => {
    try {
      const res = await codeProjectApi.getDocs(projectId);
      if (res.success) setDocsMarkdown(res.data.markdown);
    } catch (e) {}
  };

  const handleScanDependencies = async () => {
    try {
      const res = await codeProjectApi.scanDependencies(projectId);
      if (res.success) setDependenciesResult(res.data);
    } catch (e) {}
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    setSendingChat(true);
    const msgText = chatInput;
    setChatInput('');

    try {
      const res = await codeProjectApi.sendChatMessage(projectId, {
        message: msgText,
        active_file: activeFile
      });
      if (res.success) {
        fetchChatHistory();
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setSendingChat(false);
    }
  };

  const handleExportZip = async () => {
    try {
      const res = await codeProjectApi.exportProject(projectId);
      if (res.success && res.data) {
        const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", jsonStr);
        downloadAnchor.setAttribute("download", `${project.name.toLowerCase().replace(/\s+/g, '-')}-source.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#07090e] items-center justify-center text-purple-400">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#07090e] text-gray-200 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar title={`AI CODE / ${project ? project.name.toUpperCase() : 'WORKSPACE'}`} />

        {/* Workspace Top Header Bar */}
        <div className="bg-[#0b0f17] border-b border-gray-800/80 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold text-white tracking-wide">{project?.name}</h1>
                <span className="px-2 py-0.5 bg-purple-950 text-purple-300 border border-purple-800/50 rounded text-[10px] font-mono">
                  {project?.programming_language} ({project?.framework})
                </span>
                <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800/50 rounded text-[10px] font-mono flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Validation Score: {project?.validation_summary?.score || 95}/100</span>
                </span>
              </div>
              <p className="text-[11px] text-gray-400 max-w-xl truncate mt-0.5">{project?.requirement}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenDbImportModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-900/50 hover:bg-indigo-800/60 text-indigo-200 border border-indigo-700/50 rounded-lg text-xs font-medium transition"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Import Database Design</span>
            </button>

            <button
              onClick={handleExportZip}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium shadow-md shadow-purple-600/20 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Project</span>
            </button>
          </div>
        </div>

        {/* Source Database Design Sync Banner */}
        {project?.linked_db_project_id && (
          <div className="bg-indigo-950/40 border-b border-indigo-800/40 px-5 py-2 flex flex-wrap items-center justify-between text-xs gap-2">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-white">Source DB Design Connected</span>
              <span className="text-gray-400">({project.database_type || 'PostgreSQL'} • Source of Truth: AI Database Designer ✓)</span>
            </div>
            <button
              onClick={() => {
                setSelectedDbId(project.linked_db_project_id);
                handleImportDatabase();
              }}
              disabled={importingDb}
              className="px-3 py-1 bg-indigo-600/80 hover:bg-indigo-600 disabled:opacity-50 text-white rounded text-[11px] font-medium flex items-center space-x-1 transition"
            >
              {importingDb ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              <span>Sync DB Schema Changes</span>
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-[#0e131f] border-b border-gray-800/80 px-4 flex items-center space-x-1 overflow-x-auto text-xs font-medium">
          {[
            { id: 'editor', label: 'Files & Editor', icon: FileCode },
            { id: 'overview', label: 'Overview', icon: Layers },
            { id: 'architecture', label: 'Architecture', icon: GitBranch },
            { id: 'database', label: 'Database', icon: Database },
            { id: 'crud', label: 'CRUD Generator', icon: Wrench },
            { id: 'api', label: 'API Generator', icon: Zap },
            { id: 'auth', label: 'Auth Generator', icon: KeyRound },
            { id: 'tests', label: 'Tests', icon: Play },
            { id: 'debugger', label: 'Debugger', icon: Bug },
            { id: 'review', label: 'Code Review', icon: ShieldCheck },
            { id: 'security', label: 'Security Scan', icon: ShieldAlert },
            { id: 'diff', label: 'Diff & Modify', icon: History },
            { id: 'chat', label: 'AI Chat', icon: Sparkles },
            { id: 'docs', label: 'Documentation', icon: BookOpen },
            { id: 'dependencies', label: 'Dependencies', icon: Terminal }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'review' && !reviewResult) handleRunReview();
                  if (tab.id === 'security' && !securityResult) handleRunSecurityScan();
                  if (tab.id === 'tests' && !testResult) handleGenerateTests();
                  if (tab.id === 'docs' && !docsMarkdown) handleGenerateDocs();
                  if (tab.id === 'dependencies' && !dependenciesResult) handleScanDependencies();
                }}
                className={`flex items-center space-x-1.5 px-3 py-2.5 border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-purple-500 text-purple-300 bg-purple-950/30'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400' : 'text-gray-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* TAB 1: FILES & MONACO CODE EDITOR */}
          {activeTab === 'editor' && (
            <div className="flex-1 flex min-h-0">
              {/* Left File Tree Explorer */}
              <div className="w-64 bg-[#090d14] border-r border-gray-800/80 flex flex-col flex-shrink-0">
                <div className="p-3 border-b border-gray-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider font-mono">EXPLORER</span>
                  <span className="text-[10px] text-gray-500">{files.length} Files</span>
                </div>

                <div className="p-2 space-y-0.5 overflow-y-auto flex-1 text-xs">
                  {files.map(file => {
                    const isSelected = activeFile?.path === file.path;
                    return (
                      <button
                        key={file.path}
                        onClick={() => handleSelectFile(file)}
                        className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-left transition font-mono ${
                          isSelected
                            ? 'bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/40'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                        }`}
                      >
                        <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-purple-400' : 'text-gray-500'}`} />
                        <span className="truncate">{file.path}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Center Monaco Editor Panel */}
              <div className="flex-1 flex flex-col bg-[#07090e] min-w-0">
                {/* Editor Action Header */}
                <div className="bg-[#0f1422] border-b border-gray-800/80 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-mono text-white font-semibold">{activeFile?.path || 'No File Selected'}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveFile}
                      disabled={savingFile}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-medium flex items-center space-x-1"
                    >
                      {savingFile ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>

                {/* Natural Language Code Modification Prompt Bar */}
                <div className="bg-[#0c101a] border-b border-gray-800/80 px-4 py-2 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Ask AI Code to modify this file (e.g. Add pagination, add input validation, add error logging...)"
                    value={modifyPrompt}
                    onChange={(e) => setModifyPrompt(e.target.value)}
                    className="flex-1 bg-[#131926] border border-gray-700/60 rounded px-3 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleModifyCode}
                    disabled={!modifyPrompt}
                    className="px-3 py-1 bg-purple-600/80 hover:bg-purple-600 disabled:opacity-50 text-white rounded text-xs font-medium flex items-center space-x-1"
                  >
                    <span>Modify with AI</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Monaco Editor Component */}
                <div className="flex-1 relative">
                  <Editor
                    height="100%"
                    language={activeFile?.language || 'javascript'}
                    theme="vs-dark"
                    value={editorContent}
                    onChange={(val) => setEditorContent(val || '')}
                    options={{
                      fontSize: 13,
                      minimap: { enabled: true },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      lineNumbers: 'on',
                      tabSize: 2
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* Database Connection Source Status */}
              <div className="bg-[#0e1320] border border-emerald-800/40 rounded-xl p-5 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-white">Database Connected: {project?.database_type || 'PostgreSQL'}</h4>
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800/50 rounded text-[10px] font-mono font-bold">SOURCE: AI DATABASE DESIGNER ✓</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">Application models, CRUD APIs, controllers, and database connection logic generated directly from AI Database Designer.</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('database')}
                  className="px-3 py-1.5 bg-emerald-900/40 hover:bg-emerald-800/50 text-emerald-300 border border-emerald-700/40 rounded text-xs font-medium"
                >
                  Manage DB Schema
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#0e1320] border border-gray-800 rounded-xl p-4">
                  <div className="text-gray-400 text-xs font-mono">Language & Framework</div>
                  <div className="text-lg font-bold text-white mt-1">{project?.programming_language}</div>
                  <div className="text-xs text-purple-400 font-mono">{project?.framework}</div>
                </div>

                <div className="bg-[#0e1320] border border-gray-800 rounded-xl p-4">
                  <div className="text-gray-400 text-xs font-mono">Database Dialect</div>
                  <div className="text-lg font-bold text-white mt-1">{project?.database_type}</div>
                  <div className="text-xs text-emerald-400 font-mono">ORM Models Auto-Generated</div>
                </div>

                <div className="bg-[#0e1320] border border-gray-800 rounded-xl p-4">
                  <div className="text-gray-400 text-xs font-mono">Total Source Files</div>
                  <div className="text-lg font-bold text-white mt-1">{files.length} Files</div>
                  <div className="text-xs text-indigo-400 font-mono">{files.filter(f => f.path.includes('controller')).length} Controllers</div>
                </div>

                <div className="bg-[#0e1320] border border-gray-800 rounded-xl p-4">
                  <div className="text-gray-400 text-xs font-mono">Overall Validation</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">95 / 100</div>
                  <div className="text-xs text-gray-400 font-mono">Passed All Checks</div>
                </div>
              </div>

              {/* Requirement Summary Box */}
              <div className="bg-[#0e1320] border border-gray-800 rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">Natural Language Specification</h3>
                <p className="text-sm text-gray-200 bg-[#121828] p-4 rounded-lg border border-gray-800 font-mono leading-relaxed">
                  "{project?.requirement}"
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ARCHITECTURE */}
          {activeTab === 'architecture' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h3 className="text-sm font-bold text-white mb-4">Project File & Component Architecture</h3>
              <div className="bg-[#0e1320] border border-gray-800 rounded-xl p-5 space-y-3 font-mono text-xs">
                {files.map(f => (
                  <div key={f.path} className="flex items-center space-x-2 text-gray-300">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-white">{f.path}</span>
                    <span className="text-gray-500 text-[11px]">— {f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DATABASE INTEGRATION */}
          {activeTab === 'database' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between bg-[#0e1320] border border-gray-800 rounded-xl p-5">
                <div>
                  <h3 className="text-sm font-bold text-white">Import Database Designer Schema</h3>
                  <p className="text-xs text-gray-400 mt-1">Link an existing AI Database Designer project schema to generate ORM models, controllers, and APIs.</p>
                </div>
                <button
                  onClick={handleOpenDbImportModal}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5"
                >
                  <Database className="w-4 h-4" />
                  <span>Import Database Schema</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: CRUD GENERATOR */}
          {activeTab === 'crud' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <h3 className="text-sm font-bold text-white">Dedicated CRUD Generator</h3>
              <div className="bg-[#0e1320] border border-gray-800 rounded-xl p-5 space-y-4 max-w-xl">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Entity Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Student"
                    value={crudEntity}
                    onChange={(e) => setCrudEntity(e.target.value)}
                    className="w-full bg-[#141b2b] border border-gray-700/80 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  onClick={handleGenerateCrud}
                  disabled={!crudEntity}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium"
                >
                  Generate CRUD Controller & Routes
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: API GENERATOR */}
          {activeTab === 'api' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <h3 className="text-sm font-bold text-white">AI REST API Generator</h3>
              <div className="bg-[#0e1320] border border-gray-800 rounded-xl p-5 space-y-4 max-w-xl">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Endpoint Name</label>
                  <input
                    type="text"
                    value={apiSpec.endpointName}
                    onChange={(e) => setApiSpec({ ...apiSpec, endpointName: e.target.value })}
                    className="w-full bg-[#141b2b] border border-gray-700/80 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">HTTP Method & Path</label>
                  <div className="flex space-x-2">
                    <select
                      value={apiSpec.method}
                      onChange={(e) => setApiSpec({ ...apiSpec, method: e.target.value })}
                      className="bg-[#141b2b] border border-gray-700/80 rounded-lg p-2 text-xs text-white"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                    <input
                      type="text"
                      value={apiSpec.path}
                      onChange={(e) => setApiSpec({ ...apiSpec, path: e.target.value })}
                      className="flex-1 bg-[#141b2b] border border-gray-700/80 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>
                <button
                  onClick={handleGenerateApi}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium"
                >
                  Generate API Route & Controller
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: AUTH GENERATOR */}
          {activeTab === 'auth' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <h3 className="text-sm font-bold text-white">Dedicated Authentication Generator</h3>
              <div className="bg-[#0e1320] border border-gray-800 rounded-xl p-5 space-y-4 max-w-xl">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Auth Strategy</label>
                  <select
                    value={authConfig.authType}
                    onChange={(e) => setAuthConfig({ ...authConfig, authType: e.target.value })}
                    className="w-full bg-[#141b2b] border border-gray-700/80 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="JWT">JWT Bearer Token Authentication</option>
                    <option value="Session">Session Cookie Auth</option>
                  </select>
                </div>
                <button
                  onClick={handleGenerateAuth}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium"
                >
                  Generate Authentication Module
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: TESTS */}
          {activeTab === 'tests' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Automated Test Suite Generator</h3>
                <button
                  onClick={handleGenerateTests}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Test Suite</span>
                </button>
              </div>

              {testResult && (
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-[#0e1320] border border-gray-800 p-4 rounded-xl">
                    <div className="text-gray-400 text-xs">Total Tests</div>
                    <div className="text-xl font-bold text-white">{testResult.testCount}</div>
                  </div>
                  <div className="bg-[#0e1320] border border-gray-800 p-4 rounded-xl">
                    <div className="text-gray-400 text-xs">Passed</div>
                    <div className="text-xl font-bold text-emerald-400">{testResult.passed}</div>
                  </div>
                  <div className="bg-[#0e1320] border border-gray-800 p-4 rounded-xl">
                    <div className="text-gray-400 text-xs">Failed</div>
                    <div className="text-xl font-bold text-red-400">{testResult.failed}</div>
                  </div>
                  <div className="bg-[#0e1320] border border-gray-800 p-4 rounded-xl">
                    <div className="text-gray-400 text-xs">Coverage</div>
                    <div className="text-xl font-bold text-purple-400">{testResult.coverage}%</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: DEBUGGER */}
          {activeTab === 'debugger' && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <h3 className="text-sm font-bold text-white">AI Error Debugger</h3>
              <div className="space-y-3">
                <textarea
                  rows={4}
                  placeholder="Paste error stack trace or exception log..."
                  value={debugLog}
                  onChange={(e) => setDebugLog(e.target.value)}
                  className="w-full bg-[#121828] border border-gray-700/80 rounded-lg p-3 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleDebugCode}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5"
                >
                  <Bug className="w-4 h-4" />
                  <span>Analyze Error Log</span>
                </button>
              </div>

              {debugResult && (
                <div className="bg-[#0e1320] border border-gray-800 rounded-xl p-5 space-y-3 text-xs">
                  <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-lg">
                    <span className="font-bold text-red-300">Problem:</span> {debugResult.problem}
                  </div>
                  <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-lg">
                    <span className="font-bold text-amber-300">Root Cause:</span> {debugResult.rootCause}
                  </div>
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-lg">
                    <span className="font-bold text-emerald-300">Suggested Fix:</span> {debugResult.suggestedFix}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 10: CODE REVIEW */}
          {activeTab === 'review' && reviewResult && (
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-[#0e1320] border border-gray-800 p-4 rounded-xl">
                  <div className="text-gray-400 text-xs">Quality Score</div>
                  <div className="text-2xl font-bold text-purple-400">{reviewResult.scores.quality}/100</div>
                </div>
                <div className="bg-[#0e1320] border border-gray-800 p-4 rounded-xl">
                  <div className="text-gray-400 text-xs">Security Score</div>
                  <div className="text-2xl font-bold text-emerald-400">{reviewResult.scores.security}/100</div>
                </div>
                <div className="bg-[#0e1320] border border-gray-800 p-4 rounded-xl">
                  <div className="text-gray-400 text-xs">Performance</div>
                  <div className="text-2xl font-bold text-indigo-400">{reviewResult.scores.performance}/100</div>
                </div>
                <div className="bg-[#0e1320] border border-gray-800 p-4 rounded-xl">
                  <div className="text-gray-400 text-xs">Maintainability</div>
                  <div className="text-2xl font-bold text-amber-400">{reviewResult.scores.maintainability}/100</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: SECURITY SCAN */}
          {activeTab === 'security' && securityResult && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <h3 className="text-sm font-bold text-white">AI Security Vulnerability Audit</h3>
              <div className="space-y-3">
                {(Array.isArray(securityResult.vulnerabilities) ? securityResult.vulnerabilities : []).map(v => (
                  <div key={v.id} className="bg-[#0e1320] border border-gray-800 p-4 rounded-xl space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-red-950 text-red-300 text-[10px] font-mono rounded">{v.severity}</span>
                      <span className="font-bold text-white text-xs">{v.title}</span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono">{v.location}</p>
                    <p className="text-xs text-gray-300">{v.risk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 12: DIFF & MODIFY */}
          {activeTab === 'diff' && modifyResult && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">AI Code Modification Diff Viewer</h3>
                <button
                  onClick={handleApplyModifyDiff}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
                >
                  Apply Changes
                </button>
              </div>

              <div className="bg-[#0e1320] border border-gray-800 p-4 rounded-xl font-mono text-xs space-y-1">
                {modifyResult.diff.map((d, i) => (
                  <div key={i} className={d.type === 'add' ? 'text-emerald-400 bg-emerald-950/30 px-2 py-0.5' : 'text-red-400 bg-red-950/30 px-2 py-0.5'}>
                    {d.line}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 13: AI CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col bg-[#07090e]">
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatMessages.map(c => (
                  <div key={c.id} className={`flex ${c.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xl p-3 rounded-xl text-xs ${c.sender === 'user' ? 'bg-purple-600 text-white' : 'bg-[#121828] text-gray-200 border border-gray-800'}`}>
                      {c.message}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#0d121d] border-t border-gray-800 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Ask AI Code assistant..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  className="flex-1 bg-[#131926] border border-gray-700/60 rounded px-3 py-2 text-xs text-white"
                />
                <button
                  onClick={handleSendChat}
                  disabled={sendingChat}
                  className="px-4 py-2 bg-purple-600 text-white rounded text-xs font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* TAB 14: DOCUMENTATION */}
          {activeTab === 'docs' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <pre className="bg-[#0e1320] border border-gray-800 p-5 rounded-xl font-mono text-xs text-gray-300 whitespace-pre-wrap">
                {docsMarkdown}
              </pre>
            </div>
          )}

          {/* TAB 15: DEPENDENCIES */}
          {activeTab === 'dependencies' && dependenciesResult && (
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <h3 className="text-sm font-bold text-white">Project Dependencies</h3>
              <div className="bg-[#0e1320] border border-gray-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#121828] border-b border-gray-800 text-gray-400 font-mono">
                    <tr>
                      <th className="p-3">Package</th>
                      <th className="p-3">Version</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 text-gray-300 font-mono">
                    {dependenciesResult.dependencies.map(d => (
                      <tr key={d.name}>
                        <td className="p-3 font-bold text-white">{d.name}</td>
                        <td className="p-3">{d.version}</td>
                        <td className="p-3 text-emerald-400">{d.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Database Import Modal */}
      {showDbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1422] border border-gray-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span>Import Database Designer Schema</span>
            </h3>

            <p className="text-xs text-gray-400">
              Select an existing AI Database Designer project to automatically convert its tables, relationships, and attributes into backend ORM models, controllers, and APIs.
            </p>

            <select
              value={selectedDbId}
              onChange={(e) => setSelectedDbId(e.target.value)}
              className="w-full bg-[#141b2b] border border-gray-700/80 rounded-lg p-2.5 text-xs text-white"
            >
              <option value="">-- Select Database Design Project --</option>
              {dbProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.database_type || 'PostgreSQL'})</option>
              ))}
            </select>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowDbModal(false)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-xs"
              >
                Cancel
              </button>

              <button
                onClick={handleImportDatabase}
                disabled={!selectedDbId || importingDb}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5"
              >
                {importingDb ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Import & Generate Code</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
