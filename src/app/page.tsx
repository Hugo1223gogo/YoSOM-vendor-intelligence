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

type RichMsg = Msg & { textContent?: ReactNode };

export default function Home() {
  const [msgs, setMsgs] = useState<RichMsg[]>([]);
  const [stage, setStage] = useState<Stage>("boot");
  const [venue, setVenue] = useState<Venue | null>(null);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [reaction, setReaction] = useState<ReactionValue | null>(null);
  const [deepTalkTurns, setDeepTalkTurns] = useState(0);
  const [view, setView] = useState<View>("chat");
  const [chatters, setChatters] = useState(47);
  const [input, setInput] = useState("");
  const [voteItems, setVoteItems] = useState<VoteItem[]>([]);
  const [autoFocusInput, setAutoFocusInput] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const bootedRef = useRef(false);

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
          Hey! 👋 <b>{chatters} students</b> have chatted today. McNay Cafe is
          leaning <b>Asian comfort food</b> this week. Wanna help shape next
          week&apos;s menu? Takes 30 seconds.
        </>
      ),
    });
    await new Promise((r) => setTimeout(r, 350));
    addMsg({
      kind: "chips",
      chips: [
        { id: "go", label: "Yes, let's go 🚀" },
        { id: "show", label: "Show me what people want" },
        { id: "craving", label: "I have a specific craving" },
      ],
      handler: "welcome",
    });
  }, [showTyping, replaceLastTyping, addMsg, chatters]);

  useEffect(() => {
    if (!bootedRef.current) {
      bootedRef.current = true;
      boot();
    }
  }, [boot]);

  // Stage handlers
  const goToVenuePick = useCallback(async () => {
    setStage("venue");
    await streamAI("Pick a spot 📍", { delay: 700 });
    await new Promise((r) => setTimeout(r, 200));
    addMsg({ kind: "venue" });
  }, [streamAI, addMsg]);

  const goToVoteCards = useCallback(
    async (venueId: Venue) => {
      setStage("votes");
      setVoteItems(VOTE_ITEMS[venueId]);
      await streamAI(
        <>
          Here are <b>4 ideas</b> I&apos;m considering for next week. Tap the
          ones you&apos;d actually order 👇
        </>,
        { delay: 1100 }
      );
      await new Promise((r) => setTimeout(r, 200));
      addMsg({ kind: "votes" });
    },
    [streamAI, addMsg]
  );

  const goToReaction = useCallback(async () => {
    setStage("reaction");
    await streamAI("How was the Korean rice bowl this week? 🍚", {
      delay: 1000,
    });
    await new Promise((r) => setTimeout(r, 150));
    addMsg({ kind: "reactions" });
  }, [streamAI, addMsg]);

  const goToFinal = useCallback(
    async (totalVotes: number) => {
      setStage("final");
      await streamAI(
        <>
          🎉 You&apos;re done! Your vote joins <b>{totalVotes} others</b> in
          tomorrow&apos;s brief. Wanna see live results?
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
        else goToVenuePick();
      } else if (handler === "postdeep") {
        goToFinal(chatters);
      }
    },
    [addMsg, goToVenuePick, goToDeepTalk, goToFinal, chatters]
  );

  // Venue pick
  const onVenuePick = useCallback(
    async (venueId: Venue) => {
      setVenue(venueId);
      const name =
        venueId === "charlie" ? "Charlie's Place" : "McNay Cafe";
      setTimeout(() => addMsg({ kind: "user", text: name }), 200);
      setTimeout(() => goToVoteCards(venueId), 700);
    },
    [addMsg, goToVoteCards]
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
            ? {
                ...it,
                votes: votedIds.has(itemId)
                  ? it.votes - 1
                  : it.votes + 1,
              }
            : it
        )
      );
      if (venue) {
        fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemId,
            venue,
            value: votedIds.has(itemId) ? -1 : 1,
          }),
        }).catch(() => {});
      }
    },
    [votedIds, venue]
  );

  const onVoteDone = useCallback(async () => {
    setStage("reaction");
    addMsg({
      kind: "user",
      text: `Voted on ${votedIds.size} item${votedIds.size === 1 ? "" : "s"}`,
    });
    setTimeout(() => goToReaction(), 500);
  }, [votedIds, goToReaction, addMsg]);

  const onVoteDeepTalk = useCallback(() => {
    addMsg({ kind: "user", text: "Nothing here." });
    setTimeout(() => goToDeepTalk("fromVotes"), 400);
  }, [addMsg, goToDeepTalk]);

  // Reaction handler
  const onReactionPick = useCallback(
    async (id: ReactionValue) => {
      setReaction(id);
      const label = id === "up" ? "👍" : id === "mid" ? "😐" : "👎";
      addMsg({ kind: "user", text: label });
      await new Promise((r) => setTimeout(r, 350));
      await streamAI(
        id === "down"
          ? "Got it — noted. Thanks for the honesty 🙏"
          : "Got it, thanks!",
        { delay: 800 }
      );
      fetch("/api/reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: "bowl", value: id }),
      }).catch(() => {});
      setTimeout(() => goToFinal(chatters), 600);
    },
    [streamAI, goToFinal, addMsg, chatters]
  );

  // Off-topic detection
  const FOOD_HINTS =
    /\b(food|eat|hungry|crav|spicy|sweet|savory|ramen|noodle|rice|bowl|sandwich|wrap|salad|soup|burrito|taco|curry|coffee|matcha|boba|tea|latte|breakfast|lunch|dinner|snack|protein|tofu|chicken|beef|pork|veg|vegan|gluten|dairy|cheese|bread|sauce|broth|drink|cold|hot|fresh|crunch|warm|comfort|asian|mexican|italian|thai|korean|indian|japanese|chinese|miso|kimchi|pesto|chickpea|garlic|spice|fries|burger|pizza|pasta|egg|fish|shrimp|salmon|tuna|seasonal|local|menu|dish|meal|item|order|price|cheap|expensive|filling|light|dessert|cake|cookie|smoothie|juice|water|caffeine|brunch|night|late)\b/i;

  const isOffTopic = (text: string) => {
    if (text.length < 3) return false;
    return !FOOD_HINTS.test(text);
  };

  const firstWord = (s: string) => {
    const w = s.split(/\s+/).slice(0, 2).join(" ");
    return w.charAt(0).toUpperCase() + w.slice(1);
  };

  // Send (deep talk / from any stage)
  const onSend = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    addMsg({ kind: "user", text });

    if (stage !== "deeptalk") setStage("deeptalk");

    if (isOffTopic(text)) {
      await streamAI(
        <>
          Ha — I hear you, but I can only help with <b>food at SOM</b> 🍽️
          What would actually hit the spot for lunch this week?
        </>,
        { delay: 1100 }
      );
      return;
    }

    const turn = deepTalkTurns + 1;
    setDeepTalkTurns(turn);

    if (turn === 1) {
      await streamAI(
        <>
          {firstWord(text)}, got it. Are you thinking{" "}
          <b>tonkotsu broth</b> or something lighter? 🍜
        </>,
        { delay: 1200 }
      );
    } else if (turn === 2) {
      await streamAI(
        "Mm, that's helpful. Any specific protein or veg you're craving with it?",
        { delay: 1100 }
      );
    } else {
      await streamAI(
        "Cool, I've got enough. Want to see what others are voting on too? →",
        { delay: 1000 }
      );
      await new Promise((r) => setTimeout(r, 200));
      addMsg({
        kind: "chips",
        chips: [{ id: "yes", label: "Yes, show me" }],
        handler: "postdeep",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, stage, deepTalkTurns, streamAI, addMsg]);

  // Reset
  const reset = useCallback(() => {
    setMsgs([]);
    setStage("boot");
    setVenue(null);
    setVotedIds(new Set());
    setReaction(null);
    setDeepTalkTurns(0);
    setVoteItems([]);
    setView("chat");
    setInput("");
    setAutoFocusInput(false);
    idRef.current = 0;
    bootedRef.current = false;
    setTimeout(() => {
      bootedRef.current = true;
      boot();
    }, 60);
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
          onDeepTalk={onVoteDeepTalk}
          doneShown={votedIds.size > 0 && stage === "votes"}
        />
      );
    }

    if (m.kind === "reactions") {
      return (
        <EmojiReactions key={m.id} picked={reaction} onPick={onReactionPick} />
      );
    }

    if (m.kind === "cta") {
      return <LiveFeedCTA key={m.id} onClick={() => setView("feed")} />;
    }

    return null;
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-cream">
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
  );
}
