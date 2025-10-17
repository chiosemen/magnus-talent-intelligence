'use client';
import { useState } from 'react';
export default function Home() {
  const [jd, setJd] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<string>('');
  async function submitJD() {
    setStatus('Submitting…');
    const res = await fetch('/api/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ company, role, location, jd_text: jd }) });
    const data = await res.json();
    setStatus(data.ok ? 'Queued successfully ✅' : `Error: ${data.error}`);
  }
  return (
    <div className="container">
      <h1>Magnus Talent Intelligence Agent</h1>
      <div className="card">
        <h3>Submit a Job Description</h3>
        <label>Company</label>
        <input value={company} onChange={e=>setCompany(e.target.value)} placeholder="Company Inc." />
        <label>Role</label>
        <input value={role} onChange={e=>setRole(e.target.value)} placeholder="Senior Product Owner" />
        <label>Location</label>
        <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Remote (US)" />
        <label>Job Description</label>
        <textarea rows={10} value={jd} onChange={e=>setJd(e.target.value)} placeholder="Paste JD here…" />
        <button onClick={submitJD}>Ingest & Queue</button>
        <p style={{marginTop:12}}>{status}</p>
      </div>
      <div className="card">
        <p>Start the background worker with <code>pnpm worker</code> in another terminal.</p>
      </div>
    </div>
  );
}
