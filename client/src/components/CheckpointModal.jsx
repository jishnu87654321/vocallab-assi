import { useState, useRef } from 'react';

const API_BASE = '/api';

/**
 * CheckpointModal
 * Displays resolved contacts for human review before email dispatch.
 * Fires confirm or cancel back to the server.
 */
export default function CheckpointModal({ sessionId, total, preview, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(null); // 'confirm' | 'cancel' | null
  const [error, setError] = useState(null);
  const clickInProgress = useRef(false);

  const [showAll, setShowAll] = useState(false);
  const [allContacts, setAllContacts] = useState(null);
  const [fetchingAll, setFetchingAll] = useState(false);

  async function handleSeeMore() {
    if (allContacts) {
      setShowAll(true);
      return;
    }
    setFetchingAll(true);
    try {
      const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
      if (res.ok) {
        const session = await res.json();
        const contacts = session.stages?.stage3?.output || [];
        setAllContacts(contacts);
        setShowAll(true);
      }
    } catch (err) {
      console.error('Failed to fetch all contacts:', err);
    } finally {
      setFetchingAll(false);
    }
  }

  async function handleDecision(confirm) {
    if (clickInProgress.current) return;
    clickInProgress.current = true;
    setLoading(confirm ? 'confirm' : 'cancel');
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/pipeline/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm, sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      if (confirm) onConfirm && onConfirm();
      else         onCancel && onCancel();
    } catch (e) {
      setError(e.message);
      clickInProgress.current = false;
    } finally {
      setLoading(null);
    }
  }

  const contactsToRender = showAll ? (allContacts || preview) : preview;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)',
      padding: '24px',
      animation: 'fade-in 0.2s ease-out'
    }}>
      <div className="card-glass slide-up" style={{
        width: '100%', maxWidth: '680px',
        maxHeight: '85vh',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🎯</span>
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Ready to Send</h2>
            <span className="badge badge-success">{total} contacts</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Review the resolved contacts below. Confirm to dispatch personalised outreach emails, or cancel to abort.
          </p>
        </div>

        {/* Contact Preview Table */}
        <div style={{ overflow: 'auto', flex: 1 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Title</th>
                <th>Company</th>
              </tr>
            </thead>
            <tbody>
              {contactsToRender && contactsToRender.map((c, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{c.firstName} {c.lastName}</td>
                  <td>
                    <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-code)' }}>{c.email}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{c.jobTitle}</td>
                  <td>
                    <span style={{
                      background: 'rgba(255,255,255,0.05)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)'
                    }}>{c.companyDomain}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!showAll && total > 5 && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleSeeMore}
                disabled={fetchingAll}
                style={{ color: '#d0bcff', fontWeight: 600, border: '1px solid rgba(139,92,246,0.3)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
              >
                {fetchingAll ? 'Loading…' : `See More (${total - 5} contacts)`}
              </button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                + {total - 5} more contacts will be included in the dispatch
              </span>
            </div>
          )}
          {showAll && total > 5 && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowAll(false)}
                style={{ color: '#d0bcff', fontWeight: 600, border: '1px solid rgba(139,92,246,0.3)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
              >
                Show Less
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ margin: '0 32px', padding: '10px 14px', background: 'var(--error-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <span style={{ color: 'var(--error)', fontSize: '0.85rem' }}>⚠ {error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ padding: '20px 32px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            id="checkpoint-cancel"
            className="btn btn-danger"
            onClick={() => handleDecision(false)}
            disabled={!!loading}
          >
            {loading === 'cancel' ? <><span className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.2)', marginRight: '6px' }} /> Cancelling…</> : '✕ Cancel Campaign'}
          </button>
          <button
            id="checkpoint-confirm"
            className="btn btn-primary"
            onClick={() => handleDecision(true)}
            disabled={!!loading}
          >
            {loading === 'confirm' ? <><span className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.2)', marginRight: '6px' }} /> Dispatching…</> : `⚡ Send ${total} Emails`}
          </button>
        </div>
      </div>
    </div>
  );
}
