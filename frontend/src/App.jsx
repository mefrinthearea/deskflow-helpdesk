import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DeskFlowProvider } from './context';
import Shell from './components/Shell';
import Dashboard from './pages/Dashboard';
import TicketDetail from './pages/TicketDetail';
import TicketForm from './pages/TicketForm';
import Activity from './pages/Activity';
import UIStates from './pages/UIStates';
import './styles/deskflow.css';

/** Routes stay separate from the application shell so all pages share navigation. */
export default function App() {
  return (
    <BrowserRouter>
      <DeskFlowProvider>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Dashboard />} />
            <Route path="my-requests" element={<Dashboard mine />} />
            <Route path="activity" element={<Activity />} />
            <Route path="tickets/new" element={<TicketForm />} />
            <Route path="tickets/:id" element={<TicketDetail />} />
            <Route path="tickets/:id/edit" element={<TicketForm />} />
            <Route path="ui-states" element={<UIStates />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </DeskFlowProvider>
    </BrowserRouter>
  );
}
