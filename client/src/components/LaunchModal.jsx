import { useState } from 'react';

const API_BASE = '/api';

export default function LaunchModal({
  showLaunchModal,
  setShowLaunchModal,
  handleLaunch,
  inputDomain,
  setInputDomain,
  isLaunching,
  launchError
}) {
  if (!showLaunchModal) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setShowLaunchModal(false); }}
    >
      <div style={{
        width: '100%', maxWidth: '440px', borderRadius: '14px',
        background: 'rgba(25,28,34,0.98)', border: '1px solid #494454',
        padding: '32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div className="font-label-sm text-label-sm text-secondary" style={{ marginBottom: '4px' }}>[INIT]</div>
            <h3 className="font-headline-lg-mobile text-on-surface">Initialize Pipeline</h3>
          </div>
          <button onClick={() => setShowLaunchModal(false)} style={{ color: '#cbc3d7', cursor: 'pointer', background: 'none', border: 'none', display: 'flex' }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p className="font-body-md text-on-surface-variant" style={{ marginBottom: '24px' }}>
          Enter the seed domain to begin the 4-stage automated cold-outreach pipeline.
        </p>
        <form onSubmit={handleLaunch} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#0b0e14', border: '1px solid #494454',
            borderRadius: '6px', padding: '4px 4px 4px 14px',
          }}>
            <span className="material-symbols-outlined" style={{ color: '#958ea0', fontSize: '18px' }}>domain</span>
            <input
              id="modal-domain-input"
              type="text"
              placeholder="e.g. stripe.com"
              value={inputDomain}
              onChange={(e) => setInputDomain(e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                padding: '10px 0', color: '#e1e2eb',
                fontFamily: 'JetBrains Mono, monospace', fontSize: '14px',
              }}
              disabled={isLaunching}
            />
          </div>
          {launchError && (
            <div style={{ color: '#ef4444', fontSize: '12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 12px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
              ⚠ {launchError}
            </div>
          )}
          <button
            type="submit"
            disabled={isLaunching || !inputDomain.trim()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              padding: '14px 24px',
              background: isLaunching || !inputDomain.trim() ? 'rgba(139,92,246,0.5)' : '#8B5CF6',
              color: 'white', border: 'none', borderRadius: '6px',
              cursor: isLaunching || !inputDomain.trim() ? 'not-allowed' : 'pointer',
              fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600,
              letterSpacing: '0.05em', transition: 'all 0.3s',
            }}
          >
            {isLaunching ? (
              <>
                <span className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.2)' }} />
                Initializing…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>terminal</span>
                Execute Pipeline
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
