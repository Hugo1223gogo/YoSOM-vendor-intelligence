"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import type { Stage, View, Venue, ReactionValue, VoteItem, Msg } from "@/lib/types";
import { VOTE_ITEMS } from "@/lib/menu-data";
import ChatHeader from "@/components/ChatHeader";
import InputBar from "@/components/InputBar";
import TypingIndicator from "@/components/TypingIndicator";
import AIBubble from "@/components/AIBubble";
import UserBubble from "@/components/UserBubble";
import QuickChips from "@/components/QuickChips";
import VenueCards from "@/components/VenueCards";
import VoteStack from "@/components/VoteStack";
import EmojiReactions from "@/components/EmojiReactions";
import LiveFeedCTA from "@/components/LiveFeedCTA";
import LiveFeed from "@/components/LiveFeed";
import PreferenceCard from "@/components/PreferenceCard";
import FeedbackInput from "@/components/FeedbackInput";
import type { PrefsPayload } from "@/components/PreferenceCard";

type RichMsg = Msg & { textContent?: ReactNode };

export default function Home() {
  const [msgs, setMsgs] = useState<RichMsg[]>([]);
  const [stage, setStage] = useState<Stage>("boot");
  const [venue, setVenue] = useState<Venue | null>(null);
  const [reaction, setReaction] = useState<ReactionValue | null>(null);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [voteItems, setVoteItems] = useState<VoteItem[]>([]);
  const [deepTalkTurns, setDeepTalkTurns] = useState(0);
  const [view, setView] = useState<View>("chat");
  const [chatters, setChatters] = useState(47);
  const [input, setInput] = useState("");
  const [autoFocusInput, setAutoFocusInput] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);

  const nextId = () => ++idRef.current;

  const addMsg = useCallback((m: Partial<RichMsg>) => {
    setMsgs((prev) => [...prev, { id: nextId(), kind: "ai", ...m } as RichMsg]);
  }, []);

  const replaceLastTyping = useCallback((m: Partial<RichMsg>) => {
    setMsgs((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.kind === "typing") {
        return [...prev.slice(0, -1), { id: nextId(), kind: "ai", ...m } as RichMsg];
      }
      return [...prev, { id: nextId(), kind: "ai", ...m } as RichMsg];
    });
  }, []);

  const showTyping = useCallback(() => {
    setMsgs((prev) => [...prev, { id: nextId(), kind: "typing" } as RichMsg]);
  }, []);

  const streamAI = useCallback(
    async (text: ReactNode, opts: { delay?: number } = {}) => {
      showTyping();
      await new Promise((r) => setTimeout(r, opts.delay ?? 1100));
      replaceLastTyping({
        kind: "ai",
        text: typeof text === "string" ? text : undefined,
        textContent: text,
      });
    },
    [showTyping, replaceLastTyping]
  );

  // Live chatter counter
  useEffect(() => {
    const t = setInterval(() => {
      setChatters((c) => c + (Math.random() > 0.6 ? 1 : 0));
    }, 4500);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs, view]);

  // Boot
  const boot = useCallback(async () => {
    setStage("welcome");
    showTyping();
    await new Promise((r) => setTimeout(r, 900));
    replaceLastTyping({
      kind: "ai",
      textContent: (
        <>
          Hey! 👋 <b>{chatters} students</b> have chatted today. Wanna help
          shape next week&apos;s menu at Charley&apos;s or McNay? Takes 30
          seconds.
        </>
      ),
    });
    await new Promise((r) => setTimeout(r, 350));
    addMsg({
      kind: "chips",
      chips: [
        { id: "go", label: "Yes, let's go 🚀" },
        { id: "craving", label: "I have a specific craving" },
      ],
      handler: "welcome",
    });
  }, [showTyping, replaceLastTyping, addMsg, chatters]);

  useEffect(() => {
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stage handlers
  const goToVenue = useCallback(async () => {
    setStage("venue");
    await streamAI(
      "First off — where do you usually eat?",
      { delay: 900 }
    );
    await new Promise((r) => setTimeout(r, 200));
    addMsg({ kind: "venue" });
  }, [streamAI, addMsg]);

  const goToPreferences = useCallback(async () => {
    setStage("preferences");
    await streamAI(
      "Now let me get a quick read on your taste buds 🎯",
      { delay: 900 }
    );
    await new Promise((r) => setTimeout(r, 200));
    addMsg({ kind: "preferences" });
  }, [streamAI, addMsg]);

  const onPrefsComplete = useCallback(
    async (prefs: PrefsPayload) => {
      const parts = [
        prefs.flavors.length && prefs.flavors.join(", "),
        prefs.proteins.length && prefs.proteins.join(", "),
        prefs.cuisines.length && prefs.cuisines.join(", "),
      ].filter(Boolean);
      addMsg({ kind: "user", text: parts.join(" · ") || "Preferences set!" });

      fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      }).catch(() => {});

      const venueName = venue === "charleys" ? "Charley's" : "McNay Cafe";
      setVoteItems(VOTE_ITEMS[venue!] || []);

      await streamAI(
        <>
          Noted! We&apos;ll use your preferences to shape next week&apos;s menu 📝
          In the meantime — how was the food at <b>{venueName}</b> this week? Tap
          what you tried 👇
        </>,
        { delay: 1000 }
      );
      await new Promise((r) => setTimeout(r, 200));
      addMsg({ kind: "votes" });
      setStage("reaction");
    },
    [addMsg, streamAI, venue]
  );

  const goToFinal = useCallback(
    async (totalInputs: number) => {
      setStage("final");
      await streamAI(
        <>
          🎉 You&apos;re done! Your input joins <b>{totalInputs} others</b> shaping
          next week&apos;s menu. Wanna see live results?
        </>,
        { delay: 1100 }
      );
      await new Promise((r) => setTimeout(r, 200));
      addMsg({ kind: "cta" });
      // Mark session finished
      fetch("/api/session/finish", { method: "POST" }).catch(() => {});
    },
    [streamAI, addMsg]
  );

  const goToDeepTalk = useCallback(
    async (entry: string) => {
      setStage("deeptalk");
      if (entry === "fromCravings") {
        await streamAI(
          "I'm listening. What are you actually craving? Could be a dish, an ingredient, even just a vibe. ✨",
          { delay: 1000 }
        );
      } else {
        await streamAI(
          "Got it — tell me more. What are you actually craving? 🍽️",
          { delay: 900 }
        );
      }
      setAutoFocusInput(true);
    },
    [streamAI]
  );

  // Chip handler
  const onChipPick = useCallback(
    async (handler: string, chip: { id: string; label: string }) => {
      setMsgs((prev) =>
        prev.filter((m) => !(m.kind === "chips" && m.handler === handler))
      );
      addMsg({ kind: "user", text: chip.label });

      if (handler === "welcome") {
        if (chip.id === "craving") goToDeepTalk("fromCravings");
        else goToVenue();
      } else if (handler === "postdeep") {
        goToFinal(chatters);
      }
    },
    [addMsg, goToVenue, goToDeepTalk, goToFinal, chatters]
  );

  // Venue pick
  const onVenuePick = useCallback(
    async (venueId: Venue) => {
      setVenue(venueId);
      const name = venueId === "charleys" ? "Charley's" : "McNay Cafe";
      setTimeout(() => addMsg({ kind: "user", text: name }), 200);
      setTimeout(() => goToPreferences(), 700);
    },
    [addMsg, goToPreferences]
  );

  // Vote handler
  const onVote = useCallback(
    (itemId: string) => {
      setVotedIds((prev) => {
        const next = new Set(prev);
        if (next.has(itemId)) next.delete(itemId);
        else next.add(itemId);
        return next;
      });
      setVoteItems((prev) =>
        prev.map((it) =>
          it.id === itemId
            ? { ...it, votes: votedIds.has(itemId) ? it.votes - 1 : it.votes + 1 }
            : it
        )
      );
      if (venue) {
        fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, venue, value: votedIds.has(itemId) ? -1 : 1 }),
        }).catch(() => {});
      }
    },
    [votedIds, venue]
  );

  const onVoteDone = useCallback(async () => {
    addMsg({
      kind: "user",
      text: `Rated ${votedIds.size} item${votedIds.size === 1 ? "" : "s"}`,
    });
    await new Promise((r) => setTimeout(r, 400));
    await streamAI(
      "How was the food overall this week? 🍽️",
      { delay: 900 }
    );
    await new Promise((r) => setTimeout(r, 150));
    addMsg({ kind: "reactions" });
  }, [votedIds, addMsg, streamAI]);

  // Reaction handler
  const onReactionPick = useCallback(
    async (id: ReactionValue) => {
      setReaction(id);
      const label = id === "up" ? "👍" : id === "mid" ? "😐" : "👎";
      addMsg({ kind: "user", text: label });
      await new Promise((r) => setTimeout(r, 350));
      const replies: Record<ReactionValue, string> = {
        up: "Glad to hear it! We'll keep the good stuff coming 🔥",
        mid: "Fair enough — we'll work on leveling things up 💪",
        down: "Sorry to hear that. Mind sharing what went wrong? (optional)",
      };
      await streamAI(replies[id], { delay: 800 });
      fetch("/api/reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: venue ?? "general", value: id }),
      }).catch(() => {});
      if (id === "down") {
        await new Promise((r) => setTimeout(r, 200));
        addMsg({ kind: "feedback" });
      } else {
        setTimeout(() => goToFinal(chatters), 600);
      }
    },
    [streamAI, goToFinal, addMsg, chatters, venue]
  );

  const onFeedbackSubmit = useCallback(
    async (text: string) => {
      if (text.trim()) {
        addMsg({ kind: "user", text: text.trim() });
        fetch("/api/reaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId: venue ?? "general", value: "down", feedback: text.trim() }),
        }).catch(() => {});
        await streamAI("Thanks for sharing — we'll make sure the team sees this 🙏", { delay: 800 });
      }
      setTimeout(() => goToFinal(chatters), 600);
    },
    [addMsg, streamAI, goToFinal, chatters, venue]
  );

  // Send (deep talk / from any stage)
  const onSend = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    addMsg({ kind: "user", text });

    if (stage !== "deeptalk") setStage("deeptalk");

    showTyping();

    try {
      const res = await fetch("/api/deeptalk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      replaceLastTyping({ kind: "ai", text: data.reply });

      if (data.done) {
        setDeepTalkTurns(data.turnCount ?? 3);
        await new Promise((r) => setTimeout(r, 300));
        addMsg({
          kind: "chips",
          chips: [{ id: "yes", label: "Sounds good! 👍" }],
          handler: "postdeep",
        });
      } else {
        setDeepTalkTurns(data.turnCount ?? deepTalkTurns + 1);
      }
    } catch {
      replaceLastTyping({
        kind: "ai",
        text: "Hmm, something went wrong. Try again? 🍽️",
      });
    }
  }, [input, stage, deepTalkTurns, showTyping, replaceLastTyping, addMsg]);

  // Reset
  const reset = useCallback(() => {
    setMsgs([]);
    setStage("boot");
    setVenue(null);
    setReaction(null);
    setVotedIds(new Set());
    setVoteItems([]);
    setDeepTalkTurns(0);
    setView("chat");
    setInput("");
    setAutoFocusInput(false);
    idRef.current = 0;
    setTimeout(() => boot(), 60);
  }, [boot]);

  // Render messages
  const renderMsg = (m: RichMsg) => {
    if (m.kind === "typing") return <TypingIndicator key={m.id} />;
    if (m.kind === "ai")
      return <AIBubble key={m.id}>{m.textContent ?? m.text}</AIBubble>;
    if (m.kind === "user") return <UserBubble key={m.id}>{m.text}</UserBubble>;

    if (m.kind === "chips" && m.chips) {
      return (
        <QuickChips
          key={m.id}
          chips={m.chips}
          onPick={(c) => onChipPick(m.handler!, c)}
        />
      );
    }

    if (m.kind === "venue") {
      return <VenueCards key={m.id} picked={venue} onPick={onVenuePick} />;
    }

    if (m.kind === "votes") {
      return (
        <VoteStack
          key={m.id}
          items={voteItems}
          voted={votedIds}
          onVote={onVote}
          onDone={onVoteDone}
          doneShown={votedIds.size > 0 && stage === "reaction"}
          doneLabel="Submit"
        />
      );
    }

    if (m.kind === "reactions") {
      return (
        <EmojiReactions key={m.id} picked={reaction} onPick={onReactionPick} />
      );
    }

    if (m.kind === "feedback") {
      return <FeedbackInput key={m.id} onSubmit={onFeedbackSubmit} />;
    }

    if (m.kind === "preferences") {
      return <PreferenceCard key={m.id} venue={venue} onComplete={onPrefsComplete} />;
    }

    if (m.kind === "cta") {
      return <LiveFeedCTA key={m.id} onClick={() => setView("feed")} />;
    }

    return null;
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-cream sm:bg-[#0a0a0c] sm:p-6">
      <div className="flex h-[100dvh] w-full flex-col bg-cream sm:h-[844px] sm:max-w-[390px] sm:rounded-[2rem] sm:shadow-2xl sm:ring-1 sm:ring-white/10">
        {view === "feed" ? (
          <>
            <ChatHeader venue={venue} chatters={chatters} onReset={reset} />
            <LiveFeed onBack={() => setView("chat")} />
          </>
        ) : (
          <>
            <ChatHeader venue={venue} chatters={chatters} onReset={reset} />
            <div
              ref={scrollRef}
              className="scrollbar-hide flex flex-1 flex-col gap-2.5 overflow-y-auto px-3.5 pb-[18px] pt-4"
            >
              {msgs.map(renderMsg)}
              <div className="h-1" />
            </div>
            <InputBar
              value={input}
              onChange={setInput}
              onSend={onSend}
              autoFocus={autoFocusInput}
            />
          </>
        )}
      </div>
    </div>
  );
}
