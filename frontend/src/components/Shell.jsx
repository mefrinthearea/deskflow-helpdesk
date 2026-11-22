import { NavLink, Outlet } from 'react-router-dom';
import { useDeskFlow } from '../context';

export default function Shell() {
  const { theme, toggleTheme } = useDeskFlow();
  return (
    <div className={`deskflow-scene theme-${theme}`}>
      <div className="window-rim">
        <div className="workspace">
          <header className="topbar">
            <NavLink to="/" className="brand" aria-label="DeskFlow home">
              <span className="brand-mark"><i /><i /></span><span>DeskFlow</span>
            </NavLink>
            <nav className="main-navigation" aria-label="Main navigation">
              <NavLink to="/" end className={({ isActive }) => `navigation-link ${isActive ? 'active' : ''}`}>TICKETS</NavLink>
              <NavLink to="/my-requests" className={({ isActive }) => `navigation-link ${isActive ? 'active' : ''}`}>MY REQUESTS</NavLink>
              <NavLink to="/activity" className={({ isActive }) => `navigation-link ${isActive ? 'active' : ''}`}>ACTIVITY</NavLink>
            </nav>
            <div className="topbar-right">
              <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} aria-pressed={theme === 'dark'}>
                <span className="theme-thumb"/><span>{theme.toUpperCase()}</span>
              </button>
              <div className="profile-block" title="Demo interface — authentication will be connected later"><span className="avatar">GM</span><span>Account</span></div>
            </div>
          </header>
          <main className="workspace-content"><Outlet /></main>
          <footer className="workspace-footer">DESKFLOW&nbsp; / &nbsp;{theme.toUpperCase()}<span>FRONTEND PREVIEW</span></footer>
        </div>
      </div>
    </div>
  );
}
