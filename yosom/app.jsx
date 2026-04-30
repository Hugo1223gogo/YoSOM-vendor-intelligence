// ─── YoSOM main app ───────────────────────────────────
const { useState, useEffect, useRef, useCallback } = React;

// Menu items for the vote stage (per-venue)
const VOTE_ITEMS = {
  charlie: [
    { id: 'ramen',   emoji: '🍜', name: 'Spicy Miso Ramen',   tags: ['Vegan', 'Spicy'],          price: 9.50, votes: 12, tone: '#FFE2D6' },
    { id: 'bowl',    emoji: '🥘', name: 'Korean Rice Bowl',   tags: ['Gluten-free', 'Spicy'],    price: 10.25, votes: 18, tone: '#FFE9D6' },
    { id: 'salad',   emoji: '🥗', name: 'Crunchy Thai Salad', tags: ['Vegan', 'Gluten-free'],    price: 8.75, votes: 7,  tone: '#E6F1E0' },
    { id: 'burrito', emoji: '🌯', name: 'Breakfast Burrito',  tags: ['Veggie', 'High-protein'],  price: 7.50, votes: 21, tone: '#FFF1D6' },
  ],
  mcnay: [
    { id: 'sandwich', emoji: '🥪', name: 'Pesto Caprese Sub', tags: ['Veggie'],                  price: 8.25, votes: 14, tone: '#E6F1E0' },
    { id: 'matcha',   emoji: '🍵', name: 'Iced Matcha Latte', tags: ['Vegan-opt'],               price: 5.50, votes: 22, tone: '#E0EFE3' },
    { id: 'boba',     emoji: '🧋', name: 'Brown Sugar Boba',  tags: ['Sweet'],                   price: 6.00, votes: 17, tone: '#EFE0F0' },
    { id: 'wrap',     emoji: '🌯', name: 'Buffalo Chick Wrap', tags: ['High-protein', 'Spicy'],  price: 9.00, votes: 11, tone: '#FFE2D6' },
  ],
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "coral",
  "showQuickReply": "icons",
  "venuePicker": "side-by-side"
}/*EDITMODE-END*/;

function YoSOMApp() {
  // ── Tweaks ────────────────────────────────
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // accent override
  useEffect(() => {
    const root = document.documentElement;
    if (tweaks.accent === 'coral')      { root.style.setProperty('--coral', '#FF6B6B'); root.style.setProperty('--coral-deep', '#E85959'); }
    else if (tweaks.accent === 'yale')  { root.style.setProperty('--coral', '#0F4D92'); root.style.setProperty('--coral-deep', '#0A3970'); }
    else if (tweaks.accent === 'sage')  { root.style.setProperty('--coral', '#4A8E6E'); root.style.setProperty('--coral-deep', '#387055'); }
    else if (tweaks.accent === 'sunset'){ root.style.setProperty('--coral', '#E8602D'); root.style.setProperty('--coral-deep', '#C84F22'); }
    else if (tweaks.accent === 'gold')  { root.style.setProperty('--coral', '#C8A04A'); root.style.setProperty('--coral-deep', '#A88334'); }
  }, [tweaks.accent]);

  // ── Conversation state ────────────────────
  // each msg: { id, kind: 'ai'|'user'|'typing'|'venue'|'votes'|'reactions'|'cta'|'chips', payload }
  const [msgs, setMsgs] = useState([]);
  const [stage, setStage] = useState('boot');
  const [venue, setVenue] = useState(null);
  const [votedIds, setVotedIds] = useState(new Set());
  const [reaction, setReaction] = useState(null);
  const [deepTalkTurns, setDeepTalkTurns] = useState(0);
  const [view, setView] = useState('chat'); // 'chat' | 'feed'
  const [chatters, setChatters] = useState(47);
  const [input, setInput] = useState('');
  const [voteItems, setVoteItems] = useState([]);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const idRef = useRef(0);

  const nextId = () => ++idRef.current;

  // ── Utilities for streaming msgs ──────────
  const addMsg = useCallback((m) => {
    setMsgs(prev => [...prev, { id: nextId(), ...m }]);
  }, []);

  const replaceLastTyping = useCallback((m) => {
    setMsgs(prev => {
      const last = prev[prev.length - 1];
      if (last && last.kind === 'typing') {
        return [...prev.slice(0, -1), { id: nextId(), ...m }];
      }
      return [...prev, { id: nextId(), ...m }];
    });
  }, []);

  const showTyping = useCallback(() => {
    setMsgs(prev => [...prev, { id: nextId(), kind: 'typing' }]);
  }, []);

  const streamAI = useCallback(async (text, opts = {}) => {
    showTyping();
    await new Promise(r => setTimeout(r, opts.delay ?? 1100));
    replaceLastTyping({ kind: 'ai', text });
  }, [showTyping, replaceLastTyping]);

  // ── Live chatter counter ──────────────────
  useEffect(() => {
    const t = setInterval(() => {
      setChatters(c => c + (Math.random() > 0.6 ? 1 : 0));
    }, 4500);
    return () => clearInterval(t);
  }, []);

  // ── Auto-scroll on new msg ────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [msgs, view]);

  // ── Boot: stage 1 welcome ─────────────────
  const boot = useCallback(async () => {
    setStage('welcome');
    showTyping();
    await new Promise(r => setTimeout(r, 900));
    replaceLastTyping({
      kind: 'ai',
      text: <>Hey! 👋 <b>{chatters} students</b> have chatted today. McNay Cafe is leaning <b>Asian comfort food</b> this week. Wanna help shape next week's menu? Takes 30 seconds.</>,
    });
    await new Promise(r => setTimeout(r, 350));
    addMsg({
      kind: 'chips',
      chips: [
        { id: 'go',     label: "Yes, let's go 🚀" },
        { id: 'show',   label: 'Show me what people want' },
        { id: 'craving', label: 'I have a specific craving' },
      ],
      handler: 'welcome',
    });
  }, [showTyping, replaceLastTyping, addMsg, chatters]);

  useEffect(() => {
    boot();
    // eslint-disable-next-line
  }, []);

  // ── Stage handlers ────────────────────────
  const goToVenuePick = useCallback(async () => {
    setStage('venue');
    await streamAI('Pick a spot 📍', { delay: 700 });
    await new Promise(r => setTimeout(r, 200));
    addMsg({ kind: 'venue' });
  }, [streamAI, addMsg]);

  const goToVoteCards = useCallback(async (venueId) => {
    setStage('votes');
    setVoteItems(VOTE_ITEMS[venueId]);
    await streamAI(<>Here are <b>4 ideas</b> I'm considering for next week. Tap the ones you'd actually order 👇</>, { delay: 1100 });
    await new Promise(r => setTimeout(r, 200));
    addMsg({ kind: 'votes' });
  }, [streamAI, addMsg]);

  const goToReaction = useCallback(async () => {
    setStage('reaction');
    await streamAI('How was the Korean rice bowl this week? 🍚', { delay: 1000 });
    await new Promise(r => setTimeout(r, 150));
    addMsg({ kind: 'reactions' });
  }, [streamAI, addMsg]);

  const goToFinal = useCallback(async (totalVotes) => {
    setStage('final');
    await streamAI(
      <>🎉 You're done! Your vote joins <b>{totalVotes} others</b> in tomorrow's brief. Wanna see live results?</>,
      { delay: 1100 },
    );
    await new Promise(r => setTimeout(r, 200));
    addMsg({ kind: 'cta' });
  }, [streamAI, addMsg]);

  const goToDeepTalk = useCallback(async (entry) => {
    setStage('deeptalk');
    if (entry === 'fromCravings') {
      await streamAI(`I'm listening. What are you actually craving? Could be a dish, an ingredient, even just a vibe. ✨`, { delay: 1000 });
    } else {
      await streamAI(`Got it — tell me more. What are you actually craving? 🍽️`, { delay: 900 });
    }
    setTimeout(() => inputRef.current && inputRef.current.focus(), 300);
  }, [streamAI]);

  // ── Chip handler ──────────────────────────
  const onChipPick = useCallback(async (handler, chip) => {
    // Remove the chips (consumed) and echo as user msg
    setMsgs(prev => prev.filter(m => !(m.kind === 'chips' && m.handler === handler)));
    addMsg({ kind: 'user', text: chip.label });

    if (handler === 'welcome') {
      if (chip.id === 'craving') goToDeepTalk('fromCravings');
      else                        goToVenuePick();
    } else if (handler === 'postdeep') {
      goToFinal(chatters);
    }
  }, [addMsg, goToVenuePick, goToDeepTalk, goToFinal, chatters]);

  // ── Venue pick ────────────────────────────
  const onVenuePick = useCallback(async (venueId) => {
    setVenue(venueId);
    const name = venueId === 'charlie' ? "Charlie's Place" : "McNay Cafe";
    setTimeout(() => addMsg({ kind: 'user', text: name }), 200);
    setTimeout(() => goToVoteCards(venueId), 700);
  }, [addMsg, goToVoteCards]);

  // ── Vote handler ──────────────────────────
  const onVote = useCallback((itemId) => {
    setVotedIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
    setVoteItems(prev => prev.map(it =>
      it.id === itemId
        ? { ...it, votes: votedIds.has(itemId) ? it.votes - 1 : it.votes + 1 }
        : it
    ));
  }, [votedIds]);

  const onVoteDone = useCallback(async () => {
    // Remove the vote stack so it stays in transcript visually but lock it
    setStage('reaction');
    addMsg({ kind: 'user', text: `Voted on ${votedIds.size} item${votedIds.size === 1 ? '' : 's'}` });
    setTimeout(() => goToReaction(), 500);
  }, [votedIds, goToReaction, addMsg]);

  const onVoteDeepTalk = useCallback(() => {
    addMsg({ kind: 'user', text: 'Nothing here.' });
    setTimeout(() => goToDeepTalk('fromVotes'), 400);
  }, [addMsg, goToDeepTalk]);

  // ── Reaction handler ──────────────────────
  const onReactionPick = useCallback(async (id) => {
    setReaction(id);
    const label = id === 'up' ? '👍' : id === 'mid' ? '😐' : '👎';
    addMsg({ kind: 'user', text: label });
    await new Promise(r => setTimeout(r, 350));
    await streamAI(id === 'down' ? `Got it — noted. Thanks for the honesty 🙏` : `Got it, thanks!`, { delay: 800 });
    setTimeout(() => goToFinal(chatters), 600);
  }, [streamAI, goToFinal, addMsg, chatters]);

  // ── Off-topic detection (very simple, prototype-only) ─
  // Real product would use an LLM classifier. This just demos
  // graceful redirect when the user goes off-script.
  const FOOD_HINTS = /\b(food|eat|hungry|crav|spicy|sweet|savory|ramen|noodle|rice|bowl|sandwich|wrap|salad|soup|burrito|taco|curry|coffee|matcha|boba|tea|latte|breakfast|lunch|dinner|snack|protein|tofu|chicken|beef|pork|veg|vegan|gluten|dairy|cheese|bread|sauce|broth|drink|cold|hot|fresh|crunch|warm|comfort|asian|mexican|italian|thai|korean|indian|japanese|chinese|miso|kimchi|pesto|chickpea|garlic|spice|fries|burger|pizza|pasta|egg|fish|shrimp|salmon|tuna|seasonal|local|menu|dish|meal|item|order|price|cheap|expensive|filling|light|dessert|cake|cookie|smoothie|juice|water|caffeine|brunch|night|late)\b/i;

  const isOffTopic = (text) => {
    if (text.length < 3) return false;
    return !FOOD_HINTS.test(text);
  };

  // ── Send (deep talk / from any stage) ─────
  const onSend = useCallback(async (forcedText, opts = {}) => {
    const text = (forcedText ?? input).trim();
    if (!text) return;
    if (forcedText === undefined) setInput('');
    addMsg({ kind: 'user', text });

    if (stage !== 'deeptalk') {
      setStage('deeptalk');
    }

    // Off-topic? Redirect, don't advance the script.
    if (isOffTopic(text) || opts.forceOffTopic) {
      await streamAI(
        <>Ha — I hear you, but I can only help with <b>food at SOM</b> 🍽️ What would actually hit the spot for lunch this week?</>,
        { delay: 1100 },
      );
      return;
    }

    const turn = deepTalkTurns + 1;
    setDeepTalkTurns(turn);

    if (turn === 1) {
      await streamAI(<>{firstWord(text)}, got it. Are you thinking <b>tonkotsu broth</b> or something lighter? 🍜</>, { delay: 1200 });
    } else if (turn === 2) {
      await streamAI(`Mm, that's helpful. Any specific protein or veg you're craving with it?`, { delay: 1100 });
    } else {
      await streamAI(<>Cool, I've got enough. Want to see what others are voting on too? →</>, { delay: 1000 });
      await new Promise(r => setTimeout(r, 200));
      addMsg({
        kind: 'chips',
        chips: [{ id: 'yes', label: 'Yes, show me' }],
        handler: 'postdeep',
      });
    }
  }, [input, stage, deepTalkTurns, streamAI, addMsg]);

  // Demo: simulate an off-topic user message
  const simulateOffTopic = useCallback(() => {
    const samples = [
      'wait can you book me a haircut',
      'whats the weather tomorrow',
      'tell me a joke',
      'who won the game last night',
    ];
    const pick = samples[Math.floor(Math.random() * samples.length)];
    onSend(pick, { forceOffTopic: true });
  }, [onSend]);

  const firstWord = (s) => {
    const w = s.split(/\s+/).slice(0, 2).join(' ');
    return w.charAt(0).toUpperCase() + w.slice(1);
  };

  // ── Reset ─────────────────────────────────
  const reset = useCallback(() => {
    setMsgs([]);
    setStage('boot');
    setVenue(null);
    setVotedIds(new Set());
    setReaction(null);
    setDeepTalkTurns(0);
    setVoteItems([]);
    setView('chat');
    setInput('');
    idRef.current = 0;
    setTimeout(() => boot(), 60);
  }, [boot]);

  // ── Render messages ───────────────────────
  const renderMsg = (m) => {
    if (m.kind === 'typing') return <TypingIndicator key={m.id} />;
    if (m.kind === 'ai') return <AIBubble key={m.id}>{m.text}</AIBubble>;
    if (m.kind === 'user') return <UserBubble key={m.id}>{m.text}</UserBubble>;

    if (m.kind === 'chips') {
      return <QuickChips key={m.id} chips={m.chips} onPick={(c) => onChipPick(m.handler, c)} />;
    }

    if (m.kind === 'venue') {
      return <VenueCards key={m.id} picked={venue} onPick={onVenuePick} />;
    }

    if (m.kind === 'votes') {
      return (
        <VoteStack
          key={m.id}
          items={voteItems}
          voted={votedIds}
          onVote={onVote}
          onDone={onVoteDone}
          onDeepTalk={onVoteDeepTalk}
          doneShown={votedIds.size > 0 && stage === 'votes'}
        />
      );
    }

    if (m.kind === 'reactions') {
      return <EmojiReactions key={m.id} picked={reaction} onPick={onReactionPick} />;
    }

    if (m.kind === 'cta') {
      return <LiveFeedCTA key={m.id} onClick={() => setView('feed')} />;
    }
  };

  // ── Tweak panel ───────────────────────────
  const tweakPanel = (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Accent color">
        <TweakRadio
          value={tweaks.accent}
          options={[
            { value: 'coral',  label: 'Coral' },
            { value: 'sunset', label: 'Sunset' },
            { value: 'gold',   label: 'SOM Gold' },
            { value: 'sage',   label: 'Sage' },
            { value: 'yale',   label: 'Yale Blue' },
          ]}
          onChange={v => setTweak('accent', v)}
        />
      </TweakSection>
      <TweakSection label="Demo controls">
        <TweakButton label="Restart conversation" onClick={reset} />
        <TweakButton label="Send off-topic message" onClick={simulateOffTopic} />
        <TweakButton
          label={view === 'feed' ? 'Back to chat' : 'Jump to live feed'}
          onClick={() => setView(view === 'feed' ? 'chat' : 'feed')}
        />
      </TweakSection>
    </TweaksPanel>
  );

  // ── Render ────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', background: '#0a0a0c',
    }}>
      <IOSDevice width={402} height={874}>
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          background: 'var(--cream)',
          fontFamily: '-apple-system, "SF Pro Text", "Inter", system-ui, sans-serif',
        }}>
          {view === 'feed' ? (
            <>
              <ChatHeader venue={venue} chatters={chatters} onReset={reset} />
              <LiveFeed onBack={() => setView('chat')} />
            </>
          ) : (
            <>
              <ChatHeader venue={venue} chatters={chatters} onReset={reset} />
              <div ref={scrollRef} className="yo-scroll" style={{
                flex: 1, overflowY: 'auto',
                padding: '16px 14px 18px',
                display: 'flex', flexDirection: 'column', gap: 10,
                scrollBehavior: 'smooth',
              }}>
                {msgs.map(renderMsg)}
                <div style={{ height: 4 }} />
              </div>
              <InputBar
                value={input}
                onChange={setInput}
                onSend={onSend}
                focusRef={inputRef}
              />
            </>
          )}
        </div>
      </IOSDevice>

      {tweakPanel}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<YoSOMApp />);
