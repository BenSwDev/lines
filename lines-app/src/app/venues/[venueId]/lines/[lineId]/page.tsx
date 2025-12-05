import { lineRepository, lineOccurrenceRepository } from "@/core/db";
import { LineDetailPage } from "@/modules/lines/ui/LineDetailPage";
import { notFound } from "next/navigation";

export default async function LineDetailRoute({
  params,
}: {
  params: Promise<{ venueId: string; lineId: string }>;
}) {
  const { venueId, lineId } = await params;

  const line = await lineRepository.findById(lineId);

  if (!line || line.venueId !== venueId) {
    notFound();
  }

  const occurrences = await lineOccurrenceRepository.findByLineId(lineId);

  return (
    <LineDetailPage
      line={line}
      occurrences={occurrences}
      venueId={venueId}
    />
  );
}

