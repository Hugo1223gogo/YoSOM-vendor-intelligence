// ─── Typing indicator ─────────────────────────────────
const TypingIndicator = () => (
  <div className="yo-fade-up" style={{
    alignSelf: 'flex-start',
    background: '#EDE7DC',
    borderRadius: '20px 20px 20px 6px',
    padding: '12px 16px',
    display: 'flex', gap: 5, alignItems: 'center',
    marginTop: 4,
  }}>
    {[0,1,2].map(i => (
      <span key={i} className="yo-dot" style={{
        width: 7, height: 7, borderRadius: '50%',
        background: 'rgba(27,40,69,0.45)', display: 'inline-block',
      }} />
    ))}
  </div>
);

// ─── AI message bubble ─────────────────────────────────
const AIBubble = ({ children }) => (
  <div className="yo-pop" style={{
    alignSelf: 'flex-start',
    maxWidth: '82%',
    background: '#FFFFFF',
    color: 'var(--ink)',
    borderRadius: '22px 22px 22px 6px',
    padding: '12px 16px',
    fontSize: 16, lineHeight: 1.42,
    boxShadow: '0 1px 2px rgba(27,40,69,0.05), 0 4px 16px rgba(27,40,69,0.04)',
    border: '0.5px solid rgba(27,40,69,0.06)',
    fontWeight: 450,
  }}>
    {children}
  </div>
);

// ─── User message bubble ──────────────────────────────
const UserBubble = ({ children }) => (
  <div className="yo-pop" style={{
    alignSelf: 'flex-end',
    maxWidth: '82%',
    background: 'var(--coral)',
    color: '#fff',
    borderRadius: '22px 22px 6px 22px',
    padding: '11px 16px',
    fontSize: 16, lineHeight: 1.4,
    fontWeight: 500,
    boxShadow: '0 2px 8px rgba(255,107,107,0.25)',
  }}>
    {children}
  </div>
);

// ─── Quick-reply chips row (under AI bubble) ─────────
const QuickChips = ({ chips, onPick }) => (
  <div className="yo-fade-up" style={{
    display: 'flex', flexDirection: 'column', gap: 8,
    alignSelf: 'flex-end', alignItems: 'flex-end',
    maxWidth: '90%',
  }}>
    {chips.map((c, i) => (
      <button
        key={c.id}
        className="yo-chip"
        onClick={() => onPick(c)}
        style={{
          appearance: 'none', border: '1.5px solid rgba(255,107,107,0.35)',
          background: '#fff', color: 'var(--coral-deep)',
          padding: '11px 18px', borderRadius: 999,
          fontSize: 15.5, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'inherit',
          animation: `yo-fade-up 320ms ${i * 80}ms ease-out both`,
          boxShadow: '0 1px 3px rgba(27,40,69,0.06)',
        }}
      >
        {c.label}
      </button>
    ))}
  </div>
);

// ─── Venue picker (two big cards side-by-side) ────────
const VenueCards = ({ onPick, picked }) => {
  const venues = [
    { id: 'charlie', emoji: '🥪', name: "Charlie's Place", sub: 'Hot meals & bowls', tone: '#FFE9D6' },
    { id: 'mcnay',   emoji: '☕', name: 'McNay Cafe',     sub: 'Coffee & quick bites', tone: '#E6EEF8' },
  ];
  return (
    <div className="yo-fade-up" style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
      alignSelf: 'stretch', marginTop: 4,
    }}>
      {venues.map(v => {
        const isPicked = picked === v.id;
        const dim = picked && !isPicked;
        return (
          <button
            key={v.id} className="yo-tap"
            onClick={() => !picked && onPick(v.id)}
            disabled={!!picked}
            style={{
              appearance: 'none', cursor: picked ? 'default' : 'pointer',
              background: '#fff', border: isPicked ? '2px solid var(--coral)' : '1px solid var(--line)',
              borderRadius: 22, padding: '18px 14px',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
              opacity: dim ? 0.45 : 1,
              boxShadow: isPicked
                ? '0 6px 20px rgba(255,107,107,0.18)'
                : '0 1px 2px rgba(27,40,69,0.05), 0 4px 14px rgba(27,40,69,0.04)',
              fontFamily: 'inherit', textAlign: 'left',
              position: 'relative',
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 16, background: v.tone,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, marginBottom: 4,
            }}>{v.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>{v.name}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{v.sub}</div>
            {isPicked && (
              <div className="yo-pop" style={{
                position: 'absolute', top: 12, right: 12,
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--coral)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <IconCheck size={16} strokeWidth={3} color="#fff" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

// ─── Single vote card (inset food card with heart) ────
const VoteCard = ({ item, voted, onVote }) => {
  return (
    <div className="yo-fade-up" style={{
      background: '#fff',
      border: voted ? '1.5px solid rgba(255,107,107,0.5)' : '0.5px solid var(--line)',
      borderRadius: 22, padding: 14,
      display: 'flex', gap: 14, alignItems: 'center',
      boxShadow: voted
        ? '0 4px 16px rgba(255,107,107,0.12)'
        : '0 1px 2px rgba(27,40,69,0.05), 0 4px 12px rgba(27,40,69,0.03)',
      transition: 'border 200ms ease, box-shadow 200ms ease',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: item.tone, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36,
      }}>{item.emoji}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15.5, color: 'var(--ink)', lineHeight: 1.25 }}>
          {item.name}
        </div>
        <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
          {item.tags.map(t => (
            <span key={t} style={{
              fontSize: 10.5, fontWeight: 600,
              padding: '3px 8px', borderRadius: 999,
              background: 'rgba(15,77,146,0.08)', color: 'var(--yale)',
              letterSpacing: 0.2,
            }}>{t}</span>
          ))}
        </div>
        <div style={{ marginTop: 6, fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
          ${item.price.toFixed(2)} · <span style={{ color: voted ? 'var(--coral-deep)' : 'var(--muted)' }}>
            +{item.votes} student{item.votes === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <button
        onClick={onVote}
        className="yo-tap"
        aria-label={voted ? 'Unvote' : 'Vote'}
        style={{
          appearance: 'none', cursor: 'pointer',
          width: 46, height: 46, borderRadius: '50%',
          border: voted ? 'none' : '1.5px solid rgba(255,107,107,0.4)',
          background: voted ? 'var(--coral)' : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: voted ? '0 4px 12px rgba(255,107,107,0.35)' : 'none',
        }}
      >
        <span key={voted ? 'on' : 'off'} className={voted ? 'yo-heart-burst' : ''} style={{ display: 'flex' }}>
          {voted
            ? <IconHeartFill size={20} color="#fff" />
            : <IconHeart size={20} color="var(--coral)" />}
        </span>
      </button>
    </div>
  );
};

// ─── Vote stack (4 cards + done button + deep-talk link) ─
const VoteStack = ({ items, voted, onVote, onDone, onDeepTalk, doneShown }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignSelf: 'stretch' }}>
    {items.map((it, i) => (
      <div key={it.id} style={{ animation: `yo-fade-up 360ms ${i * 70}ms ease-out both` }}>
        <VoteCard item={it} voted={voted.has(it.id)} onVote={() => onVote(it.id)} />
      </div>
    ))}
    <button
      onClick={onDeepTalk}
      style={{
        appearance: 'none', background: 'transparent', border: 'none',
        color: 'var(--ink-soft)', fontSize: 13.5, fontWeight: 600,
        padding: '8px 4px', textAlign: 'center', cursor: 'pointer',
        textDecoration: 'underline', textUnderlineOffset: 3,
        textDecorationColor: 'rgba(27,40,69,0.3)',
        fontFamily: 'inherit', opacity: 0.85,
      }}
    >
      Nothing's hitting? Tell me what you really want →
    </button>
    {doneShown && (
      <button
        onClick={onDone}
        className="yo-fade-up yo-tap"
        style={{
          appearance: 'none', cursor: 'pointer',
          background: 'var(--ink)', color: '#fff',
          border: 'none', borderRadius: 999,
          padding: '14px 22px', fontSize: 15.5, fontWeight: 700,
          fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginTop: 4,
          boxShadow: '0 6px 18px rgba(27,40,69,0.25)',
        }}
      >
        Done voting <IconArrowRight size={17} color="#fff" strokeWidth={2.5} />
      </button>
    )}
  </div>
);

// ─── Emoji reaction row (👍 😐 👎) ─────────────────────
const EmojiReactions = ({ picked, onPick }) => {
  const opts = [
    { id: 'up',   e: '👍' },
    { id: 'mid',  e: '😐' },
    { id: 'down', e: '👎' },
  ];
  return (
    <div className="yo-fade-up" style={{
      display: 'flex', gap: 10, alignSelf: 'flex-start', marginTop: 2,
    }}>
      {opts.map((o, i) => {
        const isPicked = picked === o.id;
        const dim = picked && !isPicked;
        return (
          <button
            key={o.id} className="yo-tap"
            onClick={() => !picked && onPick(o.id)}
            disabled={!!picked}
            style={{
              appearance: 'none', cursor: picked ? 'default' : 'pointer',
              width: 60, height: 60, borderRadius: 20,
              background: '#fff',
              border: isPicked ? '2px solid var(--coral)' : '0.5px solid var(--line)',
              fontSize: 30, opacity: dim ? 0.4 : 1,
              boxShadow: isPicked
                ? '0 4px 14px rgba(255,107,107,0.25)'
                : '0 1px 3px rgba(27,40,69,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: `yo-fade-up 280ms ${i * 80}ms ease-out both`,
            }}
          >
            <span>{o.e}</span>
          </button>
        );
      })}
    </div>
  );
};

// ─── Live-feed CTA card ───────────────────────────────
const LiveFeedCTA = ({ onClick }) => (
  <button
    onClick={onClick}
    className="yo-fade-up yo-tap"
    style={{
      appearance: 'none', cursor: 'pointer',
      alignSelf: 'stretch',
      background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8C66 100%)',
      color: '#fff', border: 'none', borderRadius: 20,
      padding: '16px 18px', fontSize: 16, fontWeight: 700,
      fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: '0 8px 24px rgba(255,107,107,0.32)',
    }}
  >
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <IconSparkle size={18} color="#fff" />
      Show me the live feed
    </span>
    <IconArrowRight size={18} color="#fff" strokeWidth={2.6} />
  </button>
);

Object.assign(window, {
  TypingIndicator, AIBubble, UserBubble, QuickChips,
  VenueCards, VoteCard, VoteStack, EmojiReactions, LiveFeedCTA,
});
