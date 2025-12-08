"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FloorPlanList } from "@/modules/floor-plan-editor";
import { getFloorPlans, createFloorPlan } from "@/modules/floor-plan-editor/actions/floorPlanActions";
import type { FloorPlanListItem } from "@/modules/floor-plan-editor/types";
import { useTranslations } from "@/core/i18n/provider";

export default function StructurePage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslations();
  const venueId = params.venueId as string;

  const [floorPlans, setFloorPlans] = useState<FloorPlanListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleCreateNew = async () => {
    try {
      // Create empty floor plan and navigate directly to editor
      const result = await createFloorPlan({
        venueId,
        name: t("newFloorPlan", { defaultValue: "מפה חדשה" }),
        isDefault: false
      });

      if (result.success && result.data) {
        // Navigate directly to editor
        router.push(`/venues/${venueId}/settings/structure/${result.data.id}`);
      }
    } catch (error) {
      console.error("Error creating floor plan:", error);
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

  return (
    <div className="container py-8">
      <FloorPlanList
        venueId={venueId}
        floorPlans={floorPlans}
        onCreateNew={handleCreateNew}
      />
    </div>
  );
}
