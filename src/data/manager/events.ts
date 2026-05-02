// Dummy campus events for the demo. In production this would come from
// the SOM events calendar, the registrar, or a manual entry UI.
//
// Dates anchor on the demo week (May 4-15, 2026). Edit freely.

import type { CampusEvent } from "@/lib/manager/types";

export const CAMPUS_EVENTS: CampusEvent[] = [
  {
    date: "2026-05-04",
    name: "VC Founders Q&A — free pizza",
    type: "free-lunch",
    attendance: 80,
    impactsVenues: ["mcnay"],
    demandMultiplier: 0.7,
    note: "Free pizza in Evans Hall pulls cafe traffic",
  },
  {
    date: "2026-05-05",
    name: "SOM Class Day Lunch (catered)",
    type: "ceremony",
    attendance: 220,
    impactsVenues: ["charleys", "mcnay"],
    demandMultiplier: 0.55,
    note: "Catered lunch on the lawn — large impact",
  },
  {
    date: "2026-05-06",
    name: "Marketing Club Networking Coffee",
    type: "networking",
    attendance: 60,
    impactsVenues: ["mcnay"],
    demandMultiplier: 1.2,
    note: "Drives McNay coffee/pastry demand up",
  },
  {
    date: "2026-05-07",
    name: "Career Office Employer Lunch",
    type: "career",
    attendance: 110,
    impactsVenues: ["charleys"],
    demandMultiplier: 0.7,
  },
  {
    date: "2026-05-08",
    name: "Real Estate Club Coffee Chat",
    type: "club",
    attendance: 35,
    impactsVenues: ["mcnay"],
    demandMultiplier: 1.1,
  },
  {
    date: "2026-05-11",
    name: "Internship Info Session",
    type: "info-session",
    attendance: 90,
    impactsVenues: ["charleys", "mcnay"],
    demandMultiplier: 0.9,
  },
  {
    date: "2026-05-12",
    name: "MBA Welcome Reception (drinks + apps)",
    type: "networking",
    attendance: 180,
    impactsVenues: ["charleys", "mcnay"],
    demandMultiplier: 0.65,
    note: "Heavy hors d'oeuvres reception cuts dinner demand",
  },
  {
    date: "2026-05-13",
    name: "Healthcare Speaker Series",
    type: "speaker",
    attendance: 50,
    impactsVenues: ["mcnay"],
    demandMultiplier: 1.05,
  },
];

export function eventsOnDate(date: string, venue: "charleys" | "mcnay") {
  return CAMPUS_EVENTS.filter(
    (e) => e.date === date && e.impactsVenues.includes(venue),
  );
}
