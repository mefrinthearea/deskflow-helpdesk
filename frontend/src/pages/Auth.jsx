import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDeskFlow } from '../context';

export default function Auth() {
  const { user, login, register, theme, toggleTheme } = useDeskFlow();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  if (user) return <Navigate to="/" replace />;
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'register') await register(name, email, password);
      else await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setMessage(err.message);
    } finally { setBusy(false); }
  }

  return (
    <div className={`deskflow-scene theme-${theme}`}>
      <div className="window-rim"><div className="workspace">
        <header className="topbar">
          <div className="brand"><span className="brand-mark"><i /><i /></span><span>DeskFlow</span></div>
          <div className="topbar-right"><button type="button" className="theme-toggle" onClick={toggleTheme}>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</button></div>
        </header>
        <main className="workspace-content auth-content">
          <section className="auth-panel glass-panel">
            <div className="section-label">DESKFLOW / ACCESS</div>
            <h1>{mode === 'login' ? 'Welcome back' : 'Create an account'}</h1>
            <p>{mode === 'login' ? 'Sign in to manage your support tickets.' : 'Register to submit and track support requests.'}</p>
            <form onSubmit={submit} className="auth-form">
              {mode === 'register' && <label className="field"><span>NAME</span><input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" minLength={1}/></label>}
              <label className="field"><span>EMAIL</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"/></label>
              <label className="field"><span>PASSWORD</span><input type="password" minLength={mode === 'register' ? 8 : undefined} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/></label>
              {message && <p className="auth-error" role="alert">{message}</p>}
              <button type="submit" disabled={busy} className="primary-button">{busy ? 'Working…' : mode === 'login' ? 'Sign in' : 'Register'}</button>
            </form>
            <button className="auth-switch" type="button" onClick={() => {setMode(mode === 'login' ? 'register' : 'login');setMessage('');}}>
              {mode === 'login' ? 'Need an account? Register' : 'Already registered? Sign in'}
            </button>
            <p className="auth-demo">Demo customer: customer@test.com · Demo agent: agent@test.com<br/>Demo password: Test1234! (local development only)</p>
          </section>
        </main>
      </div></div>
    </div>
  );
}
