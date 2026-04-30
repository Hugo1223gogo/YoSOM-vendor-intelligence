// ─── Live Feed view (ticking bars + word cloud) ──────
const TOP_ITEMS_SEED = [
  { id: 'ramen',   name: 'Spicy Miso Ramen',     emoji: '🍜', votes: 124, tone: '#FFE2D6' },
  { id: 'bowl',    name: 'Korean Rice Bowl',     emoji: '🥘', votes: 98,  tone: '#FFE9D6' },
  { id: 'burrito', name: 'Breakfast Burrito',    emoji: '🌯', votes: 81,  tone: '#FFF1D6' },
  { id: 'salad',   name: 'Crunchy Thai Salad',   emoji: '🥗', votes: 64,  tone: '#E6F1E0' },
  { id: 'boba',    name: 'Brown Sugar Boba',     emoji: '🧋', votes: 52,  tone: '#EFE0F0' },
];

const WORDS = [
  'spicy', 'ramen', 'vegan', 'boba', 'sandwich', 'tonkotsu', 'late night',
  'gluten free', 'crunchy', 'matcha', 'comfort', 'tofu', 'kimchi',
  'breakfast', 'tacos', 'cold brew', 'curry', 'chickpea',
];

const LiveFeed = ({ onBack }) => {
  const [items, setItems] = React.useState(TOP_ITEMS_SEED);
  const [chatters, setChatters] = React.useState(47);
  const [tick, setTick] = React.useState(0);

  // simulate live ticks
  React.useEffect(() => {
    const t = setInterval(() => {
      setItems(prev => {
        // bump 1-2 random items
        const n = prev.map(p => ({ ...p }));
        const bumps = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < bumps; i++) {
          const idx = Math.floor(Math.random() * n.length);
          n[idx].votes += 1 + Math.floor(Math.random() * 3);
        }
        return n.sort((a, b) => b.votes - a.votes);
      });
      setChatters(c => c + (Math.random() > 0.5 ? 1 : 0));
      setTick(t => t + 1);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  const max = Math.max(...items.map(i => i.votes));

  return (
    <div className="yo-fade-up" style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      background: 'var(--cream)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '64px 20px 16px',
        borderBottom: '0.5px solid var(--line)',
        background: 'rgba(250,247,242,0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
        }}>
          <span className="yo-pulse" style={{
            width: 8, height: 8, borderRadius: '50%', background: 'var(--coral)',
          }} />
          <span style={{
            fontSize: 11.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase',
            color: 'var(--coral-deep)',
          }}>Live</span>
        </div>
        <div style={{
          fontFamily: '"Fraunces", Georgia, serif',
          fontWeight: 700, fontSize: 26, color: 'var(--ink)', lineHeight: 1.05,
          letterSpacing: -0.5,
        }}>What SOM Wants</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, fontWeight: 500 }}>
          Refreshing every few seconds · {chatters} students contributing
        </div>
      </div>

      {/* Bars */}
      <div className="yo-scroll" style={{
        flex: 1, overflowY: 'auto',
        padding: '18px 20px 24px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase',
          color: 'var(--muted)',
        }}>Top picks · this week</div>

        {items.map((it, i) => {
          const pct = (it.votes / max) * 100;
          return (
            <div key={it.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 11,
                  background: it.tone, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>{it.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>
                    {it.name}
                  </div>
                </div>
                <div key={it.votes} className="yo-fade-up" style={{
                  fontSize: 14, fontWeight: 700, color: 'var(--coral-deep)',
                  fontVariantNumeric: 'tabular-nums',
                }}>{it.votes}</div>
              </div>
              <div style={{
                position: 'relative', height: 10, background: 'rgba(27,40,69,0.06)',
                borderRadius: 999, overflow: 'hidden', marginLeft: 46,
              }}>
                <div style={{
                  position: 'absolute', inset: 0, width: `${pct}%`,
                  background: i === 0
                    ? 'linear-gradient(90deg, #FF6B6B, #FF8C66)'
                    : `rgba(27,40,69,${0.55 - i * 0.08})`,
                  borderRadius: 999,
                  transition: 'width 800ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                }} />
              </div>
            </div>
          );
        })}

        {/* Word cloud */}
        <div style={{ marginTop: 14 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: 10,
          }}>Recent inputs</div>
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 7,
            background: '#fff', borderRadius: 18, padding: 14,
            border: '0.5px solid var(--line)',
          }}>
            {WORDS.map((w, i) => {
              const seed = (i * 31 + tick * 7) % 100;
              const size = 12 + (seed % 8);
              const weight = 500 + ((seed * 5) % 3) * 100;
              const isAccent = i % 5 === (tick % 5);
              return (
                <span
                  key={w}
                  className="yo-float"
                  style={{
                    fontSize: size,
                    fontWeight: weight,
                    color: isAccent ? 'var(--coral-deep)' : 'var(--ink-soft)',
                    padding: '4px 10px', borderRadius: 999,
                    background: isAccent ? 'rgba(255,107,107,0.10)' : 'rgba(27,40,69,0.04)',
                    animationDelay: `${(i % 7) * 0.3}s`,
                    transition: 'color 400ms, background 400ms',
                  }}
                >{w}</span>
              );
            })}
          </div>
        </div>

        {/* Share */}
        <button
          className="yo-tap"
          style={{
            appearance: 'none', cursor: 'pointer', marginTop: 10,
            background: '#fff', color: 'var(--ink)',
            border: '0.5px solid var(--line)', borderRadius: 16,
            padding: '14px 16px', fontSize: 15, fontWeight: 600,
            fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: '0 1px 3px rgba(27,40,69,0.05)',
          }}
        >
          <IconShare size={18} color="var(--ink)" />
          Share with friends
        </button>

        <button
          onClick={onBack}
          style={{
            appearance: 'none', cursor: 'pointer',
            background: 'transparent', color: 'var(--muted)',
            border: 'none', padding: '4px', fontSize: 13.5, fontWeight: 600,
            fontFamily: 'inherit',
          }}
        >
          ← Back to chat
        </button>
      </div>
    </div>
  );
};

Object.assign(window, { LiveFeed });
