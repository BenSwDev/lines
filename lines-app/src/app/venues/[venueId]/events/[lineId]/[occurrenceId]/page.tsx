import { lineRepository, lineOccurrenceRepository } from "@/core/db";
import { EventDetailPage } from "@/modules/events/ui/EventDetailPage";
import { notFound } from "next/navigation";

export default async function EventDetailRoute({
  params,
}: {
  params: Promise<{ venueId: string; lineId: string; occurrenceId: string }>;
}) {
  const { venueId, lineId, occurrenceId } = await params;

  const [line, occurrence, allOccurrences] = await Promise.all([
    lineRepository.findById(lineId),
    lineOccurrenceRepository.findById(occurrenceId),
    lineOccurrenceRepository.findByLineId(lineId),
  ]);

  if (!line || !occurrence || line.venueId !== venueId) {
    notFound();
  }

  // Sort occurrences by date
  const sorted = allOccurrences.sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  const currentIndex = sorted.findIndex((o) => o.id === occurrenceId);
  const prevOccurrence = sorted[currentIndex - 1] || null;
  const nextOccurrence = sorted[currentIndex + 1] || null;

  return (
    <EventDetailPage
      occurrence={occurrence}
      line={line}
      venueId={venueId}
      prevOccurrence={prevOccurrence}
      nextOccurrence={nextOccurrence}
      totalOccurrences={sorted.length}
      currentIndex={currentIndex}
    />
  );
}

