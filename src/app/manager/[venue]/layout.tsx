import { notFound } from "next/navigation";
import SidebarNav from "@/components/manager/SidebarNav";
import type { Venue } from "@/lib/manager/types";

const VALID: Venue[] = ["charleys", "mcnay"];

export default function ManagerVenueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { venue: string };
}) {
  if (!VALID.includes(params.venue as Venue)) notFound();
  const venue = params.venue as Venue;
  return (
    <div className="flex min-h-screen bg-cream">
      <SidebarNav venue={venue} />
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">
          {children}
        </div>
      </div>
    </div>
  );
}
