import { RolesHierarchyPage } from "@/modules/roles-hierarchy/ui/RolesHierarchyPage";

type RolesPageProps = {
  params: Promise<{
    venueId: string;
  }>;
};

export default async function RolesPage({ params }: RolesPageProps) {
  const { venueId } = await params;

  return <RolesHierarchyPage venueId={venueId} />;
}
