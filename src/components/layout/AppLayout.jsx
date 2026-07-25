import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({ title, search, onSearchChange, children }) {
  return (
    <div className="flex min-h-screen bg-[#0b0f17] text-gray-100 antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} search={search} onSearchChange={onSearchChange} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
