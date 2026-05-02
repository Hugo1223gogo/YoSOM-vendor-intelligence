import PosterStudio from "@/components/manager/PosterStudio";
import { PageHeader } from "@/components/manager/Card";
import { costsForVenue } from "@/data/manager/menu-costs";
import { VENUE_LABEL, type Venue } from "@/lib/manager/types";

export default function PostersPage({
  params,
}: {
  params: { venue: string };
}) {
  const venue = params.venue as Venue;
  const items = costsForVenue(venue);
  return (
    <>
      <PageHeader
        title="Promo Posters"
        subtitle={`${VENUE_LABEL[venue]} · GPT image-gen for next-week features`}
      />
      <PosterStudio venue={venue} items={items} />
    </>
  );
}
