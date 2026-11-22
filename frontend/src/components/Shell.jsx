import { NavLink, Outlet } from 'react-router-dom';
import { useDeskFlow } from '../context';

const navClassName = ({ isActive }) => `navigation-link ${isActive ? 'active' : ''}`;

export default function Shell() {
  const { theme, toggleTheme } = useDeskFlow();
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <div className={`deskflow-scene theme-${theme}`}>
      <div className="window-rim">
        <div className="workspace">
          <header className="topbar">
            <NavLink to="/" className="brand" aria-label="DeskFlow home">
              <span className="brand-mark"><i /><i /></span>
              <span>DeskFlow</span>
            </NavLink>

            <nav className="main-navigation" aria-label="Main navigation">
              <NavLink to="/" end className={navClassName}>TICKETS</NavLink>
              <NavLink to="/my-requests" className={navClassName}>MY REQUESTS</NavLink>
              <NavLink to="/activity" className={navClassName}>ACTIVITY</NavLink>
            </nav>

            <div className="topbar-right">
              <button
                type="button"
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label={`Switch to ${nextTheme} mode`}
                aria-pressed={theme === 'dark'}
              >
                <span className="theme-thumb" />
                <span>{theme.toUpperCase()}</span>
              </button>
              <div
                className="profile-block"
                title="Demo interface — authentication will be connected later"
              >
                <span className="avatar">GM</span>
                <span>Account</span>
              </div>
            </div>
          </header>

          <main className="workspace-content"><Outlet /></main>

          <footer className="workspace-footer">
            DESKFLOW&nbsp; / &nbsp;{theme.toUpperCase()}
            <span>FRONTEND PREVIEW</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
