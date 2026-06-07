import { useEffect, useRef, useState, useCallback } from 'react';

const API_BASE = '/api';

const STAGE_META = [
  { label: 'Init',       shortLabel: 'Init'   },
  { label: 'Lookalikes', shortLabel: 'Look'   },
  { label: 'Prospects',  shortLabel: 'Pros'   },
  { label: 'Emails',     shortLabel: 'Email'  },
  { label: 'Dispatch',   shortLabel: 'Send'   },
];

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch { return '--:--:--'; }
}

function getLogText(event) {
  switch (event.type) {
    case 'stage_start':    return event.label || `Stage ${event.stage} starting...`;
    case 'stage_complete': return `Stage ${event.stage} complete — ${event.count ?? 0} result(s)`;
    case 'item':           return formatItemText(event.data);
    case 'warning':        return event.message || 'Warning';
    case 'error':          return event.message || 'An error occurred';
    case 'checkpoint':     return `Checkpoint — ${event.total} contacts resolved. Awaiting confirmation.`;
    case 'complete':       return `Pipeline complete — ${event.summary?.emailsSent ?? 0} emails sent`;
    default:               return JSON.stringify(event);
  }
}

function formatItemText(data) {
  if (!data) return 'Item discovered';
  if (typeof data === 'string') return data;
  if (data.email) return `${data.name} <${data.email}> @ ${data.domain}`;
  if (data.name) return `${data.name} — ${data.title || ''} @ ${data.domain || ''}`;
  if (data.status === 'sent') return `Sent to ${data.email}`;
  return JSON.stringify(data);
}

/**
 * PipelineFeed
 * Connects to SSE stream, tracks stage progress, renders live event log.
 */
export default function PipelineFeed({ sessionId, onCheckpoint, onComplete }) {
  const [events, setEvents] = useState([]);
  const [stages, setStages] = useState({ 0:'pending',1:'pending',2:'pending',3:'pending',4:'pending' });
  const [connected, setConnected] = useState(false);
  const [done, setDone] = useState(false);
  const [hasError, setHasError] = useState(false);
  const logRef = useRef(null);
  const esRef  = useRef(null);

  const appendEvent = useCallback((evt) => {
    setEvents(prev => [...prev, evt]);
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const es = new EventSource(`${API_BASE}/pipeline/stream/${sessionId}`);
    esRef.current = es;
    setConnected(true);

    es.onmessage = (e) => {
      let data;
      try { data = JSON.parse(e.data); } catch { return; }

      appendEvent(data);

      switch (data.type) {
        case 'stage_start':
          if (data.stage !== undefined)
            setStages(prev => ({ ...prev, [data.stage]: 'active' }));
          break;

        case 'stage_complete':
          if (data.stage !== undefined)
            setStages(prev => ({ ...prev, [data.stage]: 'done' }));
          break;

        case 'checkpoint':
          onCheckpoint && onCheckpoint(data);
          break;

        case 'complete':
          setDone(true);
          es.close();
          setConnected(false);
          onComplete && onComplete(data.summary);
          break;

        case 'error':
          setHasError(true);
          setStages(prev => {
            const updated = { ...prev };
            // Mark the current active stage as error
            for (const k of Object.keys(updated)) {
              if (updated[k] === 'active') updated[k] = 'error';
            }
            return updated;
          });
          break;
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
    };

    return () => { es.close(); esRef.current = null; };
  }, [sessionId, appendEvent, onCheckpoint, onComplete]);

  // Auto-scroll log to bottom
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="flex-col gap-6 fade-in" style={{ display: 'flex', gap: '24px' }}>

      {/* Stage Progress Track */}
      <div className="card" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0 }}>Pipeline Progress</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {connected && <span className="spinner spinner-sm spinner-secondary" style={{ marginRight: '4px' }} />}
            <span className="badge" style={{
              background: done ? 'var(--success-bg)' : hasError ? 'var(--error-bg)' : connected ? 'var(--violet-glow)' : 'rgba(255,255,255,0.06)',
              color: done ? 'var(--success)' : hasError ? 'var(--error)' : connected ? '#a78bfa' : 'var(--text-muted)',
              border: `1px solid ${done ? 'rgba(16,185,129,0.3)' : hasError ? 'rgba(239,68,68,0.3)' : connected ? 'rgba(109,40,217,0.3)' : 'var(--border)'}`,
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '100px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {done ? 'Complete' : hasError ? 'Failed' : connected ? 'Running' : 'Idle'}
            </span>
          </div>
        </div>

        <div className="stage-track">
          {STAGE_META.map((meta, idx) => (
            <div key={idx} className={`stage-step ${stages[idx]}`}>
              <div className="stage-dot">
                {stages[idx] === 'done'   && '✓'}
                {stages[idx] === 'active' && <span className="spinner spinner-sm spinner-secondary" />}
                {stages[idx] === 'error'  && '✕'}
                {stages[idx] === 'pending' && (idx + 1)}
              </div>
              <div className="stage-label">{meta.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Event Log */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: connected ? 'var(--success)' : 'var(--text-muted)',
              boxShadow: connected ? '0 0 8px var(--success)' : 'none',
              animation: connected ? 'pulse-dot 1.5s infinite' : 'none'
            }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Live Event Stream</span>
          </div>
          <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{events.length} events</span>
        </div>
        <div className="log-stream" ref={logRef}>
          {events.length === 0 && (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>
              Waiting for pipeline events…
            </div>
          )}
          {events.map((evt, i) => (
            <div key={i} className="log-entry">
              <span className="log-time">{formatTime(evt.ts)}</span>
              <span className={`log-type ${evt.type}`}>[{evt.type.toUpperCase()}]</span>
              <span className="log-msg">{getLogText(evt)}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
