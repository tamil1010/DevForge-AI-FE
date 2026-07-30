import React, { useState, useEffect } from 'react';
import { X, Sparkles, FileText, Database, RotateCcw, CheckCircle, Loader2 } from 'lucide-react';

const SAMPLE_REQUIREMENT = `Design a database for an e-commerce application.
Customers register with their name, email and phone number.
Products belong to categories.
Each product has a name, description, price and available stock.
Customers place orders.
Each order can contain multiple products and a product can appear in multiple orders.
Customers make payments for their orders.
Each order contains shipping information.`;

const GENERATION_STEPS = [
  'Understanding requirement',
  'Detecting entities',
  'Generating attributes',
  'Identifying relationships',
  'Building schema',
  'Analyzing normalization',
  'Building ER diagram',
  'Generating SQL',
  'Validating design'
];

export default function NewProjectModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [databaseType, setDatabaseType] = useState('PostgreSQL');
  const [requirement, setRequirement] = useState('');
  const [error, setError] = useState('');
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    let interval;
    if (isLoading) {
      setCompletedSteps([]);
      let stepIdx = 0;
      interval = setInterval(() => {
        if (stepIdx < GENERATION_STEPS.length) {
          setCompletedSteps((prev) => [...prev, GENERATION_STEPS[stepIdx]]);
          stepIdx++;
        }
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isOpen) return null;

  const handleLoadExample = () => {
    setName('E-Commerce System DB');
    setDescription('Full database schema for online shopping and order processing.');
    setDatabaseType('PostgreSQL');
    setRequirement(SAMPLE_REQUIREMENT);
    setError('');
  };

  const handleClear = () => {
    setName('');
    setDescription('');
    setRequirement('');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }
    if (!requirement.trim() || requirement.trim().length < 10) {
      setError('Software requirement prompt must be at least 10 characters long.');
      return;
    }
    setError('');
    onSubmit({
      projectName: name.trim(),
      description: description.trim(),
      databaseType,
      requirement: requirement.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#151c2c]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">New Database Design</h2>
              <p className="text-xs text-gray-400">One-Prompt to Complete Database Design Pipeline</p>
            </div>
          </div>
          {!isLoading && (
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Overlay during Generation */}
        {isLoading ? (
          <div className="p-8 space-y-6 text-center">
            <div className="space-y-2">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white">Generating Complete Database Design</h3>
              <p className="text-xs text-gray-400">AI is understanding requirements, building entities, relationships, schema, ER diagram, and SQL...</p>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-xl p-5 text-left max-w-md mx-auto space-y-2 font-mono text-xs">
              {GENERATION_STEPS.map((step, idx) => {
                const isDone = completedSteps.includes(step);
                const isCurrent = !isDone && (idx === 0 || completedSteps.includes(GENERATION_STEPS[idx - 1]));
                return (
                  <div key={idx} className="flex items-center space-x-2.5">
                    {isDone ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-gray-700 inline-block flex-shrink-0" />
                    )}
                    <span className={isDone ? 'text-emerald-300 font-semibold' : isCurrent ? 'text-indigo-300 font-bold' : 'text-gray-600'}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-xs">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Project Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. E-Commerce System DB"
                  className="w-full px-3 py-2 bg-[#1f2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Target Database <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <select
                    value={databaseType}
                    onChange={(e) => setDatabaseType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1f2937] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="PostgreSQL">PostgreSQL</option>
                    <option value="MySQL">MySQL</option>
                    <option value="SQLite">SQLite</option>
                    <option value="MongoDB">MongoDB</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Project Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of the software platform"
                className="w-full px-3 py-2 bg-[#1f2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-gray-300">
                  Requirement Prompt <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center space-x-2 text-xs">
                  <button
                    type="button"
                    onClick={handleLoadExample}
                    className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Load Example</span>
                  </button>
                  <span className="text-gray-600">|</span>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-gray-400 hover:text-gray-200 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
              <textarea
                rows={6}
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="Describe the application you want to design a database for..."
                className="w-full px-3 py-2.5 bg-[#1f2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm font-mono leading-relaxed"
                required
              />
              <div className="flex justify-between items-center mt-1 text-[11px] text-gray-400">
                <span>Single prompt will automatically generate Entities, Relationships, Schema, ER Diagram & SQL script.</span>
                <span>{requirement.length} chars</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>✨ Generate Database Design</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
