"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FloorPlanList, FloorPlanWizard } from "@/modules/floor-plan-editor";
import { getFloorPlans, getVenueLines } from "@/modules/floor-plan-editor/actions/floorPlanActions";
import type { FloorPlanListItem } from "@/modules/floor-plan-editor/types";

export default function StructurePage() {
  const params = useParams();
  const venueId = params.venueId as string;

  const [floorPlans, setFloorPlans] = useState<FloorPlanListItem[]>([]);
  const [lines, setLines] = useState<{ id: string; name: string; color: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [floorPlansResult, linesResult] = await Promise.all([
          getFloorPlans(venueId),
          getVenueLines(venueId)
        ]);

        if (floorPlansResult.success && floorPlansResult.data) {
          setFloorPlans(floorPlansResult.data);
        }

        if (linesResult.success && linesResult.data) {
          setLines(linesResult.data);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [venueId]);

  const handleWizardComplete = async () => {
    setShowWizard(false);
    // Reload floor plans
    const result = await getFloorPlans(venueId);
    if (result.success && result.data) {
      setFloorPlans(result.data);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (showWizard) {
    return (
      <div className="container py-8">
        <FloorPlanWizard
          venueId={venueId}
          lines={lines}
          onCancel={() => setShowWizard(false)}
          onComplete={handleWizardComplete}
        />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <FloorPlanList
        venueId={venueId}
        floorPlans={floorPlans}
        onCreateNew={() => setShowWizard(true)}
      />
    </div>
  );
}
