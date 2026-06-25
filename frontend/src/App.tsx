import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/auth/Login';
import WorkspaceSelection from './features/workspace/WorkspaceSelection';
import WorkspaceLayout from './components/layout/WorkspaceLayout';
import Dashboard from './features/workspace/Dashboard';
import ProjectList from './features/projects/ProjectList';
import KanbanBoard from './features/tasks/KanbanBoard';
import DocumentList from './features/docs/DocumentList';
import DocumentEditor from './features/docs/DocumentEditor';
import Team from './features/workspace/Team';
import Settings from './features/workspace/Settings';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes require authentication */}
      <Route element={<ProtectedRoute />}>
        <Route path="/workspaces" element={<WorkspaceSelection />} />
        
        <Route path="/workspace/:slug" element={<WorkspaceLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/:projectId" element={<KanbanBoard />} />
          <Route path="tasks" element={<KanbanBoard />} />
          <Route path="documents" element={<DocumentList />} />
          <Route path="documents/:documentId" element={<DocumentEditor />} />
          <Route path="team" element={<Team />} />
          <Route path="analytics" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
