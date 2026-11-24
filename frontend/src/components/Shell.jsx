import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDeskFlow } from '../context';

const navClassName = ({ isActive }) => `navigation-link ${isActive ? 'active' : ''}`;

export default function Shell() {
  const { theme, toggleTheme, user, logout } = useDeskFlow();
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const nextTheme = theme === 'light' ? 'dark' : 'light';
  async function signOut() {
    setSigningOut(true);
    setLogoutError('');
    try { await logout(); navigate('/login', { replace: true }); }
    catch (error) { setLogoutError(error.message); }
    finally { setSigningOut(false); }
  }
  return (
    <div className={`deskflow-scene theme-${theme}`}>
      <div className="window-rim"><div className="workspace">
        <header className="topbar">
          <NavLink to="/" className="brand" aria-label="DeskFlow home">
            <span className="brand-mark"><i /><i /></span><span>DeskFlow</span>
          </NavLink>
          <nav className="main-navigation" aria-label="Main navigation">
            <NavLink to="/" end className={navClassName}>TICKETS</NavLink>
          </nav>
          <div className="topbar-right">
            <button type="button" className="theme-toggle" onClick={toggleTheme}
              aria-label={`Switch to ${nextTheme} mode`} aria-pressed={theme === 'dark'}>
              <span className="theme-thumb" /><span>{theme.toUpperCase()}</span>
            </button>
            <div className="profile-block" title={`${user.name} · ${user.role}`}>
              <span className="avatar">{user.name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}</span>
              <span>{user.name}</span>
            </div>
            <button type="button" className="signout-link" disabled={signingOut} onClick={signOut}>Sign out</button>
          </div>
        </header>
        {logoutError && <p role="alert" className="auth-error">{logoutError}</p>}
        <main className="workspace-content"><Outlet /></main>
        <footer className="workspace-footer">DESKFLOW&nbsp; / &nbsp;{theme.toUpperCase()}<span>{user.role.toUpperCase()} WORKSPACE</span></footer>
      </div></div>
    </div>
  );
}
