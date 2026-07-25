import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DesignerHome from './pages/DesignerHome';
import Workspace from './pages/Workspace';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DesignerHome />} />
        <Route path="/database-designer/:projectId" element={<Workspace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
