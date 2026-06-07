import { useEffect, useState } from 'react';

const API_BASE = '/api';

const STATUS_META = {
  running:          { label: 'Running',   cls: 'badge-violet'  },
  awaiting_confirm: { label: 'Review',    cls: 'badge-warning'  },
  completed:        { label: 'Complete',  cls: 'badge-success'  },
  failed:           { label: 'Failed',    cls: 'badge-error'    },
  cancelled:        { label: 'Cancelled', cls: 'badge-muted'    },
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)    return `${Math.floor(diff)}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/**
 * SessionHistory
 * Lists past pipeline runs fetched from /api/sessions.
 */
export default function SessionHistory({ onResume }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchSessions() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      if (!res.ok) throw new Error('Failed to load sessions');
      const data = await res.json();
      setSessions(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '60px', color: 'var(--text-muted)' }}>
      <span className="spinner spinner-lg" />
      <span>Loading session history…</span>
    </div>
  );

  if (error) return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--error)' }}>
      ⚠ {error} — <button onClick={fetchSessions} style={{ color: 'var(--violet-light)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Retry</button>
    </div>
  );

  if (sessions.length === 0) return (
    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📋</div>
      <p>No pipeline runs yet. Launch your first campaign above.</p>
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ margin: 0 }}>Session History</h3>
        <button
          id="refresh-sessions"
          className="btn btn-ghost btn-sm"
          onClick={fetchSessions}
        >↺ Refresh</button>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Session ID</th>
              <th>Domain</th>
              <th>Status</th>
              <th>Lookalikes</th>
              <th>Prospects</th>
              <th>Emails Sent</th>
              <th>Started</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => {
              const meta = STATUS_META[s.status] || STATUS_META.failed;
              return (
                <tr key={s.sessionId}>
                  <td>
                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {s.sessionId.replace('vcr_', 'vcr…')}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.seedDomain}</span>
                  </td>
                  <td><span className={`badge ${meta.cls}`}>{meta.label}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.summary?.lookalikes ?? '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.summary?.prospects ?? '—'}</td>
                  <td>
                    {s.summary?.emailsSent > 0 ? (
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>{s.summary.emailsSent}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{timeAgo(s.createdAt)}</td>
                  <td>
                    {s.status === 'awaiting_confirm' && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => onResume && onResume(s.sessionId, s)}
                        style={{ color: 'var(--warning)', borderColor: 'rgba(245,158,11,0.3)' }}
                      >
                        Review →
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
