"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DepartmentsTab } from "./DepartmentsTab";
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
        <p className="text-muted-foreground mt-2">
          Manage departments, roles, and organizational structure
        </p>
      </div>

      <Tabs defaultValue="hierarchy" className="w-full">
        <TabsList>
          <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="hierarchy" className="mt-6">
          <HierarchyView venueId={venueId} />
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <DepartmentsTab venueId={venueId} />
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <RolesTab venueId={venueId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
