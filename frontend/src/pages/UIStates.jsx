import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeading from '../components/PageHeading';
import { useDeskFlow } from '../context';
export default function UIStates() {
  const [value,setValue] = useState(''); const [error,setError] = useState(false);
  const [confirm,setConfirm] = useState(false); const { reset } = useDeskFlow();
  return <><PageHeading eyebrow="COMPONENT BEHAVIOR" title="UI states" description="Clear feedback for empty results, validation and destructive actions."/>
  <div className="states-layout"><section className="state-card glass-panel"><div className="section-label">EMPTY STATE</div><h2>No matching tickets</h2><p>Try a different query or remove a filter.</p><Link to="/" className="primary-button">Clear filters</Link></section>
    <section className="state-card glass-panel"><div className="section-label">VALIDATION</div><h2>Subject is required</h2><form onSubmit={e=>{e.preventDefault();setError(!value.trim());}}><input value={value} onChange={e=>{setValue(e.target.value);setError(false);}} placeholder="Please enter a subject before submitting." aria-invalid={error}/><button className="sr-only">Validate</button>{error && <small role="alert">Please enter a subject before submitting.</small>}</form></section>
    <section className="state-card glass-panel"><div className="section-label">CONFIRM DELETE</div><h2>Delete ticket DF-1042?</h2><p>This action cannot be undone.</p><button onClick={()=>setConfirm(true)} className="primary-button">Delete ticket</button>{confirm && <div className="inline-confirm"><span>Example confirmation only; no ticket is deleted here.</span><button className="secondary-button" onClick={()=>setConfirm(false)}>Cancel</button></div>}</section>
    <section className="state-card glass-panel"><div className="section-label">LOADING</div><div className="skeleton"/><div className="skeleton shorter"/><div className="skeleton shortest"/><button className="reset-demo" onClick={reset}>Restore demo ticket data</button></section>
  </div></>;
}
