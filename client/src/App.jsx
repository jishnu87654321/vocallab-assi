import { useState } from 'react';
import PipelineFeed from './components/PipelineFeed';
import CheckpointModal from './components/CheckpointModal';
import SessionHistory from './components/SessionHistory';
import TerminalDemo from './components/TerminalDemo';
import LaunchModal from './components/LaunchModal';

const API_BASE = '/api';

/* ─── Layout helpers ─────────────────────────────────────────────────── */
const CONTAINER = {
  maxWidth: '1280px',
  margin: '0 auto',
  width: '100%',
  paddingLeft: '24px',
  paddingRight: '24px',
};
const PY_XL   = { paddingTop: '64px',  paddingBottom: '64px' };
const PY_LG   = { paddingTop: '40px',  paddingBottom: '40px' };
const PY_MD   = { paddingTop: '24px',  paddingBottom: '24px' };
const MB_MD   = { marginBottom: '24px' };
const MB_LG   = { marginBottom: '40px' };
const MB_XL   = { marginBottom: '64px' };
const MT_XL   = { marginTop:    '64px' };
const MT_MD   = { marginTop:    '24px' };
const MT_SM   = { marginTop:    '16px' };
const GAP_XL  = { gap: '64px' };
const GAP_LG  = { gap: '40px' };
const GAP_MD  = { gap: '24px' };
const GAP_SM  = { gap: '16px' };
const GAP_XS  = { gap: '8px' };

export default function App() {
  const [view, setView] = useState('landing');
  const [sessionId, setSessionId] = useState(null);
  const [seedDomain, setSeedDomain] = useState('');
  const [launchError, setLaunchError] = useState(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [inputDomain, setInputDomain] = useState('');
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [checkpointData, setCheckpointData] = useState({ total: 0, preview: [] });
  const [completionMetrics, setCompletionMetrics] = useState(null);

  async function handleLaunch(e) {
    e.preventDefault();
    if (!inputDomain.trim()) return;
    setIsLaunching(true);
    setLaunchError(null);
    setCompletionMetrics(null);
    setShowCheckpoint(false);
    try {
      const res = await fetch(`${API_BASE}/pipeline/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: inputDomain.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start pipeline');
      setSessionId(data.sessionId);
      setSeedDomain(data.seedDomain);
      setShowLaunchModal(false);
      setInputDomain('');
      setView('run');
    } catch (err) {
      setLaunchError(err.message);
    } finally {
      setIsLaunching(false);
    }
  }

  async function handleCheckpointTrigger(data) {
    try {
      const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
      if (res.ok) {
        const session = await res.json();
        if (session.status === 'awaiting_confirm') {
          const contacts = session.stages?.stage3?.output || [];
          setCheckpointData({ total: contacts.length, preview: contacts.slice(0, 5) });
          setShowCheckpoint(true);
        } else {
          setShowCheckpoint(false);
        }
      }
    } catch (err) {
      console.error('Failed to fetch session for checkpoint trigger:', err);
    }
  }
  function handleCheckpointConfirm() { setShowCheckpoint(false); }
  function handleCheckpointCancel() { setShowCheckpoint(false); setView('history'); setSessionId(null); }
  async function handlePipelineComplete(summary) {
    if (summary) {
      setCompletionMetrics(summary);
    } else {
      // Fallback: fetch session details directly from backend
      try {
        const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
        if (res.ok) {
          const session = await res.json();
          setCompletionMetrics(session.summary);
        }
      } catch (err) {
        console.error('Failed to fetch session for complete fallback:', err);
      }
    }
  }
  function handleResumeSession(sid, session) {
    setSessionId(sid);
    setSeedDomain(session.seedDomain);
    if (session.status === 'awaiting_confirm') {
      const contacts = session.stages?.stage3?.output || [];
      setCheckpointData({ total: contacts.length, preview: contacts.slice(0, 5) });
      setShowCheckpoint(true);
    } else if (session.status === 'completed') {
      setCompletionMetrics(session.summary);
    } else {
      setCompletionMetrics(null);
    }
    setView('run');
  }

  const scrollToSection = (id) => {
    setView('landing');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const openLaunchModal = () => {
    setLaunchError(null);
    setInputDomain('');
    setShowLaunchModal(true);
    setTimeout(() => document.getElementById('modal-domain-input')?.focus(), 120);
  };



  /* ─── Run View ─────────────────────────────────────────────────────── */
  const renderRunView = () => (
    <div style={{ ...CONTAINER, ...PY_XL, display: 'flex', flexDirection: 'column', gap: '32px' }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="font-label-sm text-on-surface-variant">SESSION ID:</span>
            <span className="font-label-sm" style={{ color: '#d0bcff', fontWeight: 600 }}>{sessionId}</span>
          </div>
          <h2 className="font-headline-lg text-on-surface" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            Target: <span className="text-secondary">{seedDomain}</span>
          </h2>
        </div>
        <button
          className="font-label-sm text-on-surface-variant"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid #494454', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => { setSessionId(null); setView('landing'); }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
          Launcher Home
        </button>
      </div>

      {completionMetrics && (
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(25,28,34,0.95) 100%)', borderColor: 'rgba(16,185,129,0.3)', padding: '24px 32px', borderRadius: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎉</span>
            <h3 className="font-headline-lg-mobile" style={{ color: '#10b981' }}>Campaign Run Completed Successfully</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px', textAlign: 'center' }}>
            {[
              { label: 'Lookalikes', value: completionMetrics.lookalikes },
              { label: 'Prospects', value: completionMetrics.prospects },
              { label: 'Resolved', value: completionMetrics.emailsResolved },
              { label: 'Sent', value: completionMetrics.emailsSent, color: '#10b981' },
              { label: 'Failed', value: completionMetrics.emailsFailed, color: '#ef4444' },
            ].map(m => (
              <div key={m.label} className="glass-card" style={{ padding: '16px', borderRadius: '10px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: m.color || '#d0bcff', lineHeight: 1 }}>{m.value}</div>
                <div className="font-label-sm text-on-surface-variant" style={{ marginTop: '4px' }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <PipelineFeed sessionId={sessionId} onCheckpoint={handleCheckpointTrigger} onComplete={handlePipelineComplete} />
    </div>
  );

  /* ─── Stage Cards ──────────────────────────────────────────────────── */
  const stages = [
    { num: '01', title: 'Vector Lookalike Extraction', desc: 'Identifies target domains similar to the input seed using vector-search AI models.', integration: 'Ocean.io' },
    { num: '02', title: 'Attribute Prospecting', desc: 'Filters decision-makers based on granular role attributes via scraping engines.', integration: 'Prospeo' },
    { num: '03', title: 'SMTP & MX Validation', desc: 'Resolves deliverability addresses with multi-step MX validation protocols.', integration: 'Eazyreach' },
    { num: '04', title: 'Template Dispatch', desc: 'Compiles dynamic templates and manages campaign dispatch via transactional APIs.', integration: 'Brevo' },
  ];

  /* ─── Landing ──────────────────────────────────────────────────────── */
  const renderLanding = () => (
    <div className="fade-in" style={{ width: '100%' }}>

      {/* ── Hero ── */}
      <section style={{ ...CONTAINER, paddingTop: '80px', paddingBottom: '72px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '64px', position: 'relative', borderRadius: '12px', flexWrap: 'wrap' }}>
        {/* Left */}
        <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 1 }}>
          <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '256px', height: '256px', background: '#d0bcff', opacity: 0.05, filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }}></div>
          <h1 className="font-headline-xl text-on-surface">
            VocaReach: The Automated <span className="text-secondary">Cold-Outreach Pipeline</span>
          </h1>
          <p className="font-body-md text-on-surface-variant" style={{ maxWidth: '480px' }}>
            A four-stage stateless execution engine designed for scale. Production-grade CLI for SDE assignments. Supercharge lead generation with idempotent transformations and surgical precision.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={openLaunchModal}
              className="btn-primary"
              style={{ background: '#8B5CF6', color: 'white', padding: '12px 24px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', transition: 'all 0.3s' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>terminal</span>
              Initialize Pipeline
            </button>
            <button
              onClick={() => scrollToSection('architecture-section')}
              style={{ padding: '12px 24px', border: '1px solid #4cd7f6', color: '#4cd7f6', borderRadius: '6px', cursor: 'pointer', background: 'transparent', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 500, letterSpacing: '0.05em', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(76,215,246,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              View Documentation
            </button>
          </div>
        </div>

        {/* Right: Terminal */}
        <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <TerminalDemo />
        </div>
      </section>

      {/* ── Global Scale ── */}
      <section style={{ background: '#0b0e14', borderTop: '1px solid #494454', borderBottom: '1px solid #494454', ...MT_XL }}>
        <div style={{ ...CONTAINER, ...PY_XL, display: 'flex', alignItems: 'center', gap: '64px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 340px' }}>
            <img alt="Global Reach" src="/global_reach.png" style={{ width: '100%', borderRadius: '12px', border: '1px solid #494454', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }} />
          </div>
          <div style={{ flex: '1 1 340px' }}>
            <h2 className="font-headline-lg text-on-surface" style={{ marginBottom: '24px' }}>Production Ready at Global Scale</h2>
            <p className="font-body-md text-on-surface-variant" style={{ marginBottom: '24px' }}>
              Built for reliability. VocaReach utilizes distributed infrastructure to manage high-concurrency prospecting tasks without performance degradation.
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {['Distributed Task Processing', 'Zero-Configuration Scaling', 'Global SMTP Relay Infrastructure'].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#cbc3d7' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#4cd7f6', flexShrink: 0 }}></span>
                  <span className="font-body-md">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Pipeline Overview ── */}
      <section id="architecture-section" style={{ ...PY_XL, ...MT_XL }}>
        <div style={{ ...CONTAINER }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 className="font-headline-lg text-on-surface" style={{ marginBottom: '8px' }}>Linear Pipeline Execution &amp; State Orchestration</h2>
            <p className="font-body-md text-on-surface-variant">A synchronized flow of high-concurrency data enrichment APIs.</p>
          </div>
          <div style={{ marginBottom: '64px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #494454', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <img alt="Architecture Diagram" src="/architecture.png" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
          <div id="stages-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {stages.map(stage => (
              <div key={stage.num} className="glass-card cyber-glow" style={{ padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="font-label-sm text-secondary" style={{ marginBottom: '8px' }}>[STAGE {stage.num}]</div>
                <h3 className="font-headline-lg-mobile text-on-surface" style={{ marginBottom: '8px' }}>{stage.title}</h3>
                <p className="font-body-md text-on-surface-variant" style={{ flex: 1 }}>{stage.desc}</p>
                <div className="font-label-sm text-tertiary" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #494454' }}>Integration: {stage.integration}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Start + Tech Stack ── */}
      <section style={{ ...CONTAINER, ...PY_XL, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '64px' }}>
        {/* Quick Start */}
        <div>
          <h2 className="font-headline-lg text-on-surface" style={{ marginBottom: '24px' }}>Quick Start</h2>
          <div className="cyber-glow" style={{ background: '#000', border: '1px solid #30363D', borderRadius: '8px', padding: '24px', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: '#cbc3d7', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '16px', right: '16px', cursor: 'pointer', opacity: 0.5 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>content_copy</span>
            </div>
            <div className="text-tertiary" style={{ marginBottom: '8px' }}>[INIT] Install globally</div>
            <div style={{ marginBottom: '24px' }}>$ npm install -g vocareach-cli</div>
            <div className="text-tertiary" style={{ marginBottom: '8px' }}>[RUN] Execute pipeline</div>
            <div>$ npx vocareach stripe.com</div>
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <h2 className="font-headline-lg text-on-surface" style={{ marginBottom: '24px' }}>Core Technologies</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            {[
              { icon: 'javascript', label: 'Node.js' },
              { icon: 'api', label: 'Axios' },
              { icon: 'format_paint', label: 'Chalk' },
              { icon: 'sync', label: 'Ora' },
            ].map(t => (
              <div key={t.label} className="glass-card" style={{ padding: '16px', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', aspectRatio: '1', cursor: 'default', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1d2026'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(22,27,34,0.70)'}
              >
                <span className="material-symbols-outlined text-on-surface" style={{ fontSize: '30px' }}>{t.icon}</span>
                <span className="font-label-sm text-on-surface-variant">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fault Tolerance ── */}
      <section style={{ background: '#191c22', borderTop: '1px solid #494454', ...MT_XL, paddingTop: '96px', paddingBottom: '96px' }}>
        <div style={{ ...CONTAINER }}>
          <div style={{ textAlign: 'center', maxWidth: '672px', margin: '0 auto 40px' }}>
            <h2 className="font-headline-lg text-on-surface" style={{ marginBottom: '8px' }}>Fault-Tolerant Execution Engine</h2>
            <p className="font-body-md text-on-surface-variant">Built to survive connection instability and strict rate-limit policies.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {[
              { title: 'Exponential Backoff', desc: 'Automatic retries with randomized jitter ensure transient API failures are handled gracefully.' },
              { title: 'Rate Limiting', desc: 'Token bucket implementation throttles requests based on upstream provider X-RateLimit headers.' },
              { title: 'State Serialization', desc: 'Pipeline state is serialized after each stage. Crash recovery resumes execution from last checkpoint.' },
            ].map(card => (
              <div key={card.title} className="glass-card cyber-glow" style={{ padding: '24px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 className="font-headline-lg-mobile text-on-surface">{card.title}</h3>
                <p className="font-body-md text-on-surface-variant">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integration Ecosystem ── */}
      <section style={{ ...CONTAINER, paddingTop: '96px', paddingBottom: '96px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h2 className="font-headline-lg text-on-surface" style={{ marginBottom: '8px' }}>Integration Ecosystem</h2>
          <p className="font-body-md text-on-surface-variant">Unified API orchestration across best-in-class data providers.</p>
        </div>
        <div style={{ marginBottom: '64px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #494454', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <img alt="API Ecosystem Illustration" src="/ecosystem.png" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {[
            { icon: 'travel_explore', name: 'Ocean.io', desc: 'Provides AI-driven lookalike audiences. We extract firmographic data to populate initial account objects.', data: 'DATA: Domains, Firmographics' },
            { icon: 'person_search', name: 'Prospeo', desc: 'Programmatically scrapes LinkedIn for decision-makers matching role criteria within target accounts.', data: 'DATA: Names, URLs, Titles' },
            { icon: 'mark_email_read', name: 'Eazyreach', desc: 'Validates business email addresses by executing SMTP handshakes and resolving MX records.', data: 'DATA: Verified Emails, Status' },
            { icon: 'campaign', name: 'Brevo', desc: 'Handles campaign dispatch by compiling dynamic templates with resolved prospect metadata.', data: 'DATA: Analytics, Delivery' },
          ].map(card => (
            <div key={card.name} className="cyber-glow" style={{ background: '#000', border: '1px solid #30363D', padding: '24px', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '24px', transition: 'border-color 0.2s', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#8B5CF6'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#30363D'}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: '#1d2026', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-symbols-outlined" style={{ color: '#8B5CF6', fontSize: '24px' }}>{card.icon}</span>
              </div>
              <div>
                <h3 className="font-headline-lg-mobile text-on-surface" style={{ marginBottom: '8px' }}>{card.name}</h3>
                <p className="font-body-md text-on-surface-variant" style={{ marginBottom: '8px' }}>{card.desc}</p>
                <div className="font-label-sm text-tertiary">{card.data}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ ...CONTAINER, paddingTop: '120px', paddingBottom: '120px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 className="font-headline-xl text-on-surface" style={{ marginBottom: '24px' }}>Ready to automate your outreach?</h2>
        <p className="font-body-md text-on-surface-variant" style={{ maxWidth: '512px', marginBottom: '40px' }}>
          Deploy an autonomous pipeline to eliminate manual friction and drive high-intent lead generation.
        </p>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={openLaunchModal}
            className="btn-primary"
            style={{ background: '#8B5CF6', color: 'white', padding: '14px 64px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', boxShadow: '0 0 15px rgba(139,92,246,0.3)', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 25px rgba(139,92,246,0.6)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 15px rgba(139,92,246,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Get Started
          </button>
          <button
            onClick={() => setView('history')}
            style={{ padding: '14px 64px', border: '1px solid #494454', color: '#e1e2eb', borderRadius: '6px', cursor: 'pointer', background: 'transparent', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
            onMouseEnter={e => e.currentTarget.style.background = '#1d2026'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>history</span>
            View History
          </button>
        </div>
      </section>

      {/* ── Developer Banner ── */}
      <section style={{ ...CONTAINER, ...PY_XL }}>
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #494454', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', height: '400px', position: 'relative' }}>
          <img alt="Developer Workspace" src="/workspace.png" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to top, #10131a 0%, transparent 100%)' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 className="font-headline-lg text-on-surface">Built for Developers</h2>
              <p className="font-body-md text-on-surface-variant">A workspace optimized for high-concurrency automation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section style={{ background: '#191c22', borderTop: '1px solid #494454', marginTop: 'auto' }}>
        <div style={{ ...CONTAINER, ...PY_XL, textAlign: 'center', maxWidth: '1280px' }}>
          <div style={{ maxWidth: '672px', margin: '0 auto' }}>
            <div className="font-label-sm text-secondary" style={{ marginBottom: '8px' }}>[MISSION]</div>
            <h2 className="font-headline-lg text-on-surface" style={{ marginBottom: '24px' }}>Engineering Outreach</h2>
            <p className="font-body-md text-on-surface-variant">
              Built to eliminate the manual friction of B2B prospecting. VocaReach chains together best-in-class data providers into a single, cohesive CLI experience designed for modern sales engineering teams.
            </p>
          </div>
        </div>
      </section>
    </div>
  );

  /* ─── Root ─────────────────────────────────────────────────────────── */
  return (
    <div style={{ background: '#10131a', color: '#e1e2eb', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden', fontFamily: 'Inter, sans-serif' }}>

      {/* ── TopNavBar ── */}
      <nav style={{ background: 'rgba(16,19,26,0.70)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', width: '100%', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #494454' }}>
        <div style={{ ...CONTAINER, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
          {/* Logo */}
          <div
            onClick={() => { setView('landing'); setSessionId(null); }}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '24px', color: '#d0bcff', letterSpacing: '-0.05em', cursor: 'pointer', userSelect: 'none' }}
          >
            VocaReach
          </div>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {[
              { label: 'Architecture', action: () => scrollToSection('architecture-section') },
              { label: 'API Stages', action: () => scrollToSection('stages-section') },
              { label: 'Quick Start', action: openLaunchModal, active: true },
              { label: 'Campaign History', action: () => setView('history'), highlight: view === 'history' },
            ].map(item => (
              <button key={item.label} onClick={item.action}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '16px', lineHeight: '24px',
                  color: item.highlight ? '#d0bcff' : item.active ? '#d0bcff' : '#cbc3d7',
                  fontWeight: item.active || item.highlight ? 700 : 400,
                  borderBottom: item.active ? '2px solid #d0bcff' : 'none',
                  paddingBottom: item.active ? '4px' : '0',
                  transition: 'color 0.2s',
                  display: window.innerWidth < 768 ? 'none' : 'block',
                }}
                onMouseEnter={e => { if (!item.active && !item.highlight) e.currentTarget.style.color = '#d0bcff'; }}
                onMouseLeave={e => { if (!item.active && !item.highlight) e.currentTarget.style.color = '#cbc3d7'; }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Get Started CTA */}
          <button
            onClick={openLaunchModal}
            style={{ background: '#8B5CF6', color: 'white', padding: '8px 24px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', transition: 'all 0.3s', display: 'block' }}
            className="btn-primary"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Main ── */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        {view === 'landing' && renderLanding()}
        {view === 'run' && sessionId && renderRunView()}
        {view === 'history' && (
          <div style={{ ...CONTAINER, ...PY_XL }} className="fade-in">
            <SessionHistory onResume={handleResumeSession} />
          </div>
        )}
      </main>

      {/* ── Launch Modal ── */}
      {showLaunchModal && (
        <LaunchModal
          showLaunchModal={showLaunchModal}
          setShowLaunchModal={setShowLaunchModal}
          handleLaunch={handleLaunch}
          inputDomain={inputDomain}
          setInputDomain={setInputDomain}
          isLaunching={isLaunching}
          launchError={launchError}
        />
      )}

      {/* ── Checkpoint Modal ── */}
      {showCheckpoint && sessionId && (
        <CheckpointModal
          sessionId={sessionId}
          total={checkpointData.total}
          preview={checkpointData.preview}
          onConfirm={handleCheckpointConfirm}
          onCancel={handleCheckpointCancel}
        />
      )}

      {/* ── Footer ── */}
      <footer style={{ background: '#0b0e14', borderTop: '1px solid #494454' }}>
        <div style={{ ...CONTAINER, ...PY_XL, display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '32px', color: '#e1e2eb', lineHeight: '40px', letterSpacing: '-0.01em' }}>VocaReach</div>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {['Documentation', 'Changelog', 'Security', 'Status', 'Twitter'].map(link => (
              <a key={link} href="#" style={{ color: '#cbc3d7', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', letterSpacing: '0.05em', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#d0bcff'}
                onMouseLeave={e => e.currentTarget.style.color = '#cbc3d7'}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'center', paddingBottom: '24px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#4edea3', letterSpacing: '0.05em' }}>
          © 2024 VocaLabs. Cyber-Industrial Automation.
        </div>
      </footer>
    </div>
  );
}
