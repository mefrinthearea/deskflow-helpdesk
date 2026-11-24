import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DeskFlowProvider, useDeskFlow } from './context';
import Shell from './components/Shell';
import Dashboard from './pages/Dashboard';
import TicketDetail from './pages/TicketDetail';
import TicketForm from './pages/TicketForm';
import Auth from './pages/Auth';
import './styles/deskflow.css';

function AppRoutes() {
  const { user, loading } = useDeskFlow();
  if (loading) return <div className="startup-message" role="status">Connecting to DeskFlow…</div>;
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route element={user ? <Shell /> : <Navigate to="/login" replace />}>
        <Route index element={<Dashboard />} />
        <Route path="tickets/new" element={<TicketForm />} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route path="tickets/:id/edit" element={<TicketForm />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return <BrowserRouter><DeskFlowProvider><AppRoutes /></DeskFlowProvider></BrowserRouter>;
}
