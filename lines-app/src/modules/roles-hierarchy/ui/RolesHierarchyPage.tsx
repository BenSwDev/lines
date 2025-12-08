"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RolesTab } from "./RolesTab";
import { HierarchyView } from "./HierarchyView";

type RolesHierarchyPageProps = {
  venueId: string;
};

export function RolesHierarchyPage({ venueId }: RolesHierarchyPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Roles & Hierarchy</h1>
        <p className="text-muted-foreground mt-2">Manage roles and organizational structure</p>
      </div>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="hierarchy" data-tour="roles-hierarchy">
            Hierarchy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-6">
          <RolesTab venueId={venueId} />
        </TabsContent>

        <TabsContent value="hierarchy" className="mt-6" data-tour="roles-hierarchy">
          <HierarchyView venueId={venueId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
