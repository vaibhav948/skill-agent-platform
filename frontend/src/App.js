import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Skills from './pages/Skills';
import SkillBuilder from './pages/SkillBuilder';
import TestSkill from './pages/TestSkill';
import History from './pages/History';
import Layout from './components/common/Layout';
import CompareVersions from './pages/CompareVersions';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/skills/new" element={<SkillBuilder />} />
          <Route path="/skills/:id/edit" element={<SkillBuilder />} />
          <Route path="/skills/:id/test" element={<TestSkill />} />
          <Route path="/history" element={<History />} />
          <Route path="/skills/:id/compare" element={<CompareVersions />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;