import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DesignerHome from './pages/DesignerHome';
import Workspace from './pages/Workspace';
import AiCodeHome from './pages/AiCodeHome';
import CodeWorkspace from './pages/CodeWorkspace';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DesignerHome />} />
        <Route path="/database-designer/:projectId" element={<Workspace />} />
        <Route path="/ai-code" element={<AiCodeHome />} />
        <Route path="/ai-code/:projectId" element={<CodeWorkspace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
