import { redirect } from "next/navigation";
import { getFloorPlan } from "@/modules/floor-plan-editor/actions/floorPlanActions";
import { FloorPlanEditor } from "@/modules/floor-plan-editor/ui/FloorPlanEditor";
import { getVenue } from "@/modules/venues/actions/getVenue";
import { listRoles } from "@/modules/roles-hierarchy/actions/roleActions";

export default async function FloorPlanEditorPage({
  params
}: {
  params: Promise<{ venueId: string; floorPlanId: string }>;
}) {
  const { venueId, floorPlanId } = await params;

  // Verify venue ownership
  const venueResult = await getVenue(venueId);
  if (!venueResult.success || !("data" in venueResult) || !venueResult.data) {
    redirect(`/venues/${venueId}/settings/structure`);
  }

  // Get floor plan
  const floorPlanResult = await getFloorPlan(floorPlanId);
  if (!floorPlanResult.success || !("data" in floorPlanResult) || !floorPlanResult.data) {
    redirect(`/venues/${venueId}/settings/structure`);
  }

  // Verify floor plan belongs to venue
  if (floorPlanResult.data.venueId !== venueId) {
    redirect(`/venues/${venueId}/settings/structure`);
  }

  // Get roles for staffing mode
  const rolesResult = await listRoles(venueId);
  const roles =
    rolesResult.success && "data" in rolesResult
      ? rolesResult.data?.map((r) => ({
          id: r.id,
          name: r.name,
          color: r.color
        })) || []
      : [];

  return (
    <FloorPlanEditor
      venueId={venueId}
      floorPlan={floorPlanResult.data}
      roles={roles}
    />
  );
}

