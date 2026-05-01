export type Stage =
  | "boot"
  | "welcome"
  | "preferences"
  | "venue"
  | "reaction"
  | "final"
  | "deeptalk";

export type View = "chat" | "feed";

export type Venue = "charleys" | "mcnay";

export type ReactionValue = "up" | "mid" | "down";

export interface VoteItem {
  id: string;
  emoji: string;
  name: string;
  tags: string[];
  price: number;
  votes: number;
  tone: string;
}

export type MsgKind =
  | "ai"
  | "user"
  | "typing"
  | "chips"
  | "venue"
  | "votes"
  | "reactions"
  | "feedback"
  | "cta"
  | "preferences";

export interface Msg {
  id: number;
  kind: MsgKind;
  text?: string;
  chips?: { id: string; label: string }[];
  handler?: "welcome" | "postdeep" | "postprefs";
}
