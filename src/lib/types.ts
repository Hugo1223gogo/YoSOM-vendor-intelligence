export type Stage =
  | "boot"
  | "welcome"
  | "venue"
  | "votes"
  | "reaction"
  | "final"
  | "deeptalk";

export type View = "chat" | "feed";

export type Venue = "charlie" | "mcnay";

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
  | "cta";

export interface Msg {
  id: number;
  kind: MsgKind;
  text?: string;
  chips?: { id: string; label: string }[];
  handler?: "welcome" | "postdeep";
}
