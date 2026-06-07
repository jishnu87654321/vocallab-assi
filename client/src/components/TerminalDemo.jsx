import { useEffect, useState, useRef } from 'react';

export default function TerminalDemo() {
  const [lines, setLines] = useState([]);
  const [commandText, setCommandText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const timeoutIds = useRef([]);

  const fullCommand = '$ npx vocareach start --target="stripe.com"';
  
  const stages = [
    { icon: 'SCAN', desc: '[Stage 1] Executing Vector-Based Extraction (Ocean.io)...' },
    { icon: 'LEAD', desc: '[Stage 2] Prospecting Lead Attributes (Prospeo)...' },
    { icon: 'SMTP', desc: '[Stage 3] Resolving SMTP & MX Validation (Eazyreach)...' },
    { icon: 'SEND', desc: '[Stage 4] Injecting Templates & Dispatching (Brevo)...' }
  ];

  function clearTimeouts() {
    timeoutIds.current.forEach(clearTimeout);
    timeoutIds.current = [];
  }

  function addTimeout(fn, ms) {
    const id = setTimeout(fn, ms);
    timeoutIds.current.push(id);
  }

  const startDemo = () => {
    clearTimeouts();
    setLines([]);
    setCommandText('');
    setShowCursor(true);

    // 1. Typing command
    let currentText = '';
    const typeSpeed = 30;
    
    for (let i = 0; i < fullCommand.length; i++) {
      const idx = i;
      addTimeout(() => {
        currentText += fullCommand.charAt(idx);
        setCommandText(currentText);
      }, idx * typeSpeed);
    }

    const startStagesTime = fullCommand.length * typeSpeed + 300;

    // 2. Initializing
    addTimeout(() => {
      setShowCursor(false);
      setLines(prev => [...prev, { type: 'init', content: '[INIT] Initializing pipeline...' }]);
    }, startStagesTime);

    // 3. Stages loop
    let currentDelay = startStagesTime + 600;
    stages.forEach((stage) => {
      addTimeout(() => {
        setLines(prev => [...prev, { 
          type: 'stage', 
          icon: stage.icon, 
          desc: stage.desc, 
          done: false 
        }]);
      }, currentDelay);

      currentDelay += 600;

      addTimeout(() => {
        setLines(prev => prev.map((l) => {
          if (l.type === 'stage' && l.icon === stage.icon) {
            return { ...l, done: true };
          }
          return l;
        }));
      }, currentDelay);

      currentDelay += 150;
    });

    // 4. Success message
    addTimeout(() => {
      setLines(prev => [...prev, { 
        type: 'success', 
        content: '[OK] Pipeline execution complete. 12 qualified leads contacted.' 
      }]);
      setShowCursor(true);
    }, currentDelay + 400);

    // 5. Loop restart
    addTimeout(() => {
      startDemo();
    }, currentDelay + 400 + 8000);
  };

  useEffect(() => {
    startDemo();
    return () => clearTimeouts();
  }, []);

  return (
    <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 15px rgba(6,182,212,0.10)' }}>
      <div style={{ background: '#1C2128', borderBottom: '1px solid #30363D', height: '32px', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F56' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27C93F' }}></div>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#cbc3d7', marginLeft: '8px', opacity: 0.5, userSelect: 'none' }}>sh ./pipeline.sh --verbose</span>
        </div>
        <button
          onClick={startDemo}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbc3d7', opacity: 0.5, display: 'flex', alignItems: 'center', transition: 'opacity 0.2s' }}
          title="Reset Demo"
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>refresh</span>
        </button>
      </div>
      <div style={{ background: '#000', padding: '20px 24px 24px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: '#cbc3d7', display: 'flex', flexDirection: 'column' }}>
        <div style={{ color: '#4edea3', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace', minHeight: '20px' }}>
          <span>{commandText}</span>
          {showCursor && (
            <span style={{ display: 'inline-block', width: '8px', height: '16px', background: '#cbc3d7', verticalAlign: 'middle', marginLeft: '2px', animation: 'terminal-blink 1s step-end infinite' }}></span>
          )}
        </div>

        {lines.map((line, i) => {
          if (line.type === 'init') {
            return (
              <div key={i} style={{ opacity: 0.7, marginBottom: '10px', fontFamily: 'JetBrains Mono, monospace' }}>
                {line.content}
              </div>
            );
          }
          if (line.type === 'stage') {
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px', width: '100%', fontFamily: 'JetBrains Mono, monospace' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <span style={{ width: '3px', height: '14px', background: '#4cd7f6', flexShrink: 0, borderRadius: '1px' }}></span>
                  <span style={{ fontWeight: 700, flexShrink: 0, color: '#e1e2eb' }}>[{line.icon}]</span>
                  <span style={{ color: '#cbc3d7' }}>{line.desc}</span>
                </div>
                {line.done && (
                  <span style={{ color: '#4edea3', fontWeight: 700, flexShrink: 0 }}>[DONE]</span>
                )}
              </div>
            );
          }
          if (line.type === 'success') {
            return (
              <div key={i} style={{ marginTop: '12px', color: '#27C93F', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                {line.content}
              </div>
            );
          }
          return null;
        })}
        {showCursor && lines.some(l => l.type === 'success') && (
          <span style={{ display: 'inline-block', width: '8px', height: '16px', background: '#cbc3d7', verticalAlign: 'middle', marginLeft: '2px', marginTop: '4px', animation: 'terminal-blink 1s step-end infinite' }}></span>
        )}
      </div>
    </div>
  );
}
