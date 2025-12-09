"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Building2, Shield, TrendingUp, TestTube } from "lucide-react";
import { getUserStats } from "../actions/adminActions";
import { UsersManagement } from "./UsersManagement";
import { VenuesManagement } from "./VenuesManagement";
import { ImpersonationBanner } from "./ImpersonationBanner";
import { TestingDashboard } from "@/modules/admin-testing/ui/TestingDashboard";

export function AdminDashboard() {
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalAdmins: number;
    totalRegularUsers: number;
    totalVenues: number;
    recentUsers: Array<{
      id: string;
      email: string;
      name: string | null;
      createdAt: Date;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const result = await getUserStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ImpersonationBanner />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ניהול מערכת</h1>
        <p className="text-muted-foreground mt-2">ניהול משתמשים, מקומות ואירועים</p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">סה&quot;כ משתמשים</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalRegularUsers} משתמשים רגילים
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">מנהלים</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAdmins}</div>
                <p className="text-xs text-muted-foreground mt-1">מנהלי מערכת</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">מקומות</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVenues}</div>
                <p className="text-xs text-muted-foreground mt-1">מקומות רשומים</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">משתמשים חדשים</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recentUsers.length}</div>
                <p className="text-xs text-muted-foreground mt-1">ב-5 האחרונים</p>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            ניהול משתמשים
          </TabsTrigger>
          <TabsTrigger value="venues" className="gap-2">
            <Building2 className="h-4 w-4" />
            ניהול מקומות
          </TabsTrigger>
          <TabsTrigger value="testing" className="gap-2">
            <TestTube className="h-4 w-4" />
            הרצת טסטים
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UsersManagement />
        </TabsContent>

        <TabsContent value="venues" className="mt-6">
          <VenuesManagement />
        </TabsContent>

        <TabsContent value="testing" className="mt-6">
          <TestingDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
