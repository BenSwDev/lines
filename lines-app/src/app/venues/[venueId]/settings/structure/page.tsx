"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FloorPlanList } from "@/modules/floor-plan-editor";
import { FloorPlanTemplateSelector } from "@/modules/floor-plan-editor/ui/FloorPlanTemplateSelector";
import { getFloorPlans } from "@/modules/floor-plan-editor/actions/floorPlanActions";
import type { FloorPlanListItem } from "@/modules/floor-plan-editor/types";

export default function StructurePage() {
  const params = useParams();
  const venueId = params.venueId as string;

  const [floorPlans, setFloorPlans] = useState<FloorPlanListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const floorPlansResult = await getFloorPlans(venueId);
        if (floorPlansResult.success && floorPlansResult.data) {
          setFloorPlans(floorPlansResult.data);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [venueId]);

  const handleCreateNew = () => {
    setShowTemplateSelector(true);
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

  return (
    <>
      {showTemplateSelector && (
        <FloorPlanTemplateSelector
          venueId={venueId}
          onCancel={() => setShowTemplateSelector(false)}
        />
      )}
      <div className="container py-8">
        <FloorPlanList venueId={venueId} floorPlans={floorPlans} onCreateNew={handleCreateNew} />
      </div>
    </>
  );
}
