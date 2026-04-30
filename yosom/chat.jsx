// ─── Header ───────────────────────────────────────────
const ChatHeader = ({ venue, chatters, onReset }) => {
  const venueMeta = {
    charlie: { emoji: '🥪', name: "Charlie's" },
    mcnay:   { emoji: '☕', name: 'McNay' },
    none:    { emoji: '🍽️', name: 'YoSOM' },
  }[venue || 'none'];

  return (
    <div style={{
      padding: '64px 16px 12px',
      background: 'rgba(250,247,242,0.88)',
      backdropFilter: 'blur(14px) saturate(180%)',
      WebkitBackdropFilter: 'blur(14px) saturate(180%)',
      borderBottom: '0.5px solid var(--line)',
      display: 'flex', alignItems: 'center', gap: 12,
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      {/* Wordmark + venue avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: 'linear-gradient(135deg, #1B2845 0%, #0F4D92 100%)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, position: 'relative', flexShrink: 0,
          boxShadow: '0 2px 8px rgba(27,40,69,0.22)',
        }}>
          <span>{venueMeta.emoji}</span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: '"Fraunces", Georgia, serif',
            fontWeight: 700, fontSize: 19, color: 'var(--ink)', lineHeight: 1,
            letterSpacing: -0.4,
          }}>
            YoSOM
          </div>
          <div style={{
            fontSize: 11.5, color: 'var(--muted)', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 5, marginTop: 3,
          }}>
            <span className="yo-pulse" style={{
              width: 6, height: 6, borderRadius: '50%', background: '#3CC97A', display: 'inline-block',
            }} />
            <span>{chatters} chatting now · {venueMeta.name}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        aria-label="Restart"
        style={{
          appearance: 'none', cursor: 'pointer',
          width: 34, height: 34, borderRadius: '50%',
          background: 'rgba(27,40,69,0.06)', border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <IconRefresh size={16} color="var(--ink-soft)" strokeWidth={2.2} />
      </button>
    </div>
  );
};

// ─── Input bar ────────────────────────────────────────
const InputBar = ({ value, onChange, onSend, focusRef }) => {
  return (
    <div style={{
      padding: '8px 12px 36px',
      background: 'rgba(250,247,242,0.92)',
      backdropFilter: 'blur(14px) saturate(180%)',
      WebkitBackdropFilter: 'blur(14px) saturate(180%)',
      borderTop: '0.5px solid var(--line)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <div style={{
        flex: 1,
        background: '#fff',
        border: '0.5px solid var(--line)',
        borderRadius: 22,
        display: 'flex', alignItems: 'center',
        padding: '4px 4px 4px 14px',
        boxShadow: '0 1px 2px rgba(27,40,69,0.04)',
      }}>
        <input
          ref={focusRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && value.trim()) onSend(); }}
          placeholder="Type if you want to say more..."
          style={{
            flex: 1, border: 'none', outline: 'none',
            background: 'transparent', fontSize: 15.5,
            fontFamily: 'inherit', color: 'var(--ink)',
            padding: '8px 0',
          }}
        />
        <button
          onClick={() => value.trim() ? onSend() : null}
          aria-label={value.trim() ? 'Send' : 'Voice'}
          style={{
            appearance: 'none', cursor: 'pointer', flexShrink: 0,
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--coral)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 100ms ease',
            boxShadow: '0 2px 6px rgba(255,107,107,0.3)',
          }}
        >
          {value.trim()
            ? <IconSend size={16} color="#fff" strokeWidth={2.4} />
            : <IconMic size={16} color="#fff" strokeWidth={2.4} />}
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { ChatHeader, InputBar });
