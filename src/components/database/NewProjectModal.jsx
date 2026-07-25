import React, { useState } from 'react';
import { X, Sparkles, FileText, Database, RotateCcw } from 'lucide-react';

const SAMPLE_REQUIREMENT = `Design a database for an online shopping system.
Customers register using their name, email and phone number.
Customers can place multiple orders.
Each order can contain multiple products and each product can appear in multiple orders.
Products belong to categories.
Each product contains a name, price and stock quantity.
Customers can make payments for their orders.
Every order contains shipping information.`;

export default function NewProjectModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [databaseType, setDatabaseType] = useState('PostgreSQL');
  const [requirement, setRequirement] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLoadExample = () => {
    setName('E-Commerce Platform DB');
    setDescription('Full database schema for online shopping and order processing platform.');
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
      setError('Software requirement must be at least 10 characters long.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#151c2c]">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">New Database Design</h2>
              <p className="text-xs text-gray-400">Convert natural-language requirements into relational database schemas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
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
                placeholder="e.g. E-Commerce Platform DB"
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
              placeholder="Optional short description of the application domain"
              className="w-full px-3 py-2 bg-[#1f2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-gray-300">
                Software Requirement <span className="text-red-400">*</span>
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
              placeholder="Describe your application and its data requirements.&#10;&#10;Example:&#10;Build a database for an online shopping platform.&#10;Customers can create accounts and place orders.&#10;Each order can contain multiple products..."
              className="w-full px-3 py-2.5 bg-[#1f2937] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-sm font-mono leading-relaxed"
              required
            />
            <div className="flex justify-between items-center mt-1 text-[11px] text-gray-400">
              <span>AI will extract entities, attributes, primary keys, and relationships.</span>
              <span className={requirement.length > 500 ? 'text-amber-400' : 'text-gray-400'}>
                {requirement.length} characters
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white rounded-lg hover:bg-gray-800 transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Requirement</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
