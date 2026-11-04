import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DesignerHome from './pages/DesignerHome';
import Workspace from './pages/Workspace';
import AiCodeHome from './pages/AiCodeHome';
import CodeWorkspace from './pages/CodeWorkspace';
import CodeArenaDashboard from './pages/codearena/CodeArenaDashboard';
import ProblemsPage from './pages/codearena/ProblemsPage';
import ProblemWorkspace from './pages/codearena/ProblemWorkspace';
import ContestsPage from './pages/codearena/ContestsPage';
import ContestDetail from './pages/codearena/ContestDetail';
import LeaderboardPage from './pages/codearena/LeaderboardPage';
import ProfilePage from './pages/codearena/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Module 1: AI Database Designer */}
        <Route path="/" element={<DesignerHome />} />
        <Route path="/database-designer/:projectId" element={<Workspace />} />

        {/* Module 2: AI Code Generator */}
        <Route path="/ai-code" element={<AiCodeHome />} />
        <Route path="/ai-code/:projectId" element={<CodeWorkspace />} />

        {/* Module 3: CodeArena (Competitive Programming) */}
        <Route path="/codearena" element={<CodeArenaDashboard />} />
        <Route path="/codearena/problems" element={<ProblemsPage />} />
        <Route path="/codearena/problems/:problemId" element={<ProblemWorkspace />} />
        <Route path="/codearena/contests" element={<ContestsPage />} />
        <Route path="/codearena/contests/:id" element={<ContestDetail />} />
        <Route path="/codearena/leaderboard" element={<LeaderboardPage />} />
        <Route path="/codearena/profile" element={<ProfilePage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
