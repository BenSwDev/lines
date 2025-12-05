"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User as UserType } from "@prisma/client";

type AccountPageProps = {
  user: UserType;
};

export function AccountPage({ user }: AccountPageProps) {
  const { toast } = useToast();
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email);

  const handleSaveProfile = async () => {
    toast({
      title: "הצלחה",
      description: "הפרופיל עודכן בהצלחה",
    });
  };

  const userInitials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user.email[0].toUpperCase();

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-6">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{user.name || user.email}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            פרופיל
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            אבטחה
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            הגדרות
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>פרטים אישיים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">שם מלא</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="השם שלך"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>תפקיד</Label>
                <div className="rounded-lg border bg-muted px-4 py-2">
                  {user.role === "admin" ? "מנהל" : "משתמש"}
                </div>
              </div>

              <div className="space-y-2">
                <Label>תאריך הצטרפות</Label>
                <div className="rounded-lg border bg-muted px-4 py-2">
                  {new Date(user.createdAt).toLocaleDateString("he-IL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="w-full">
                שמור שינויים
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>אבטחה וסיסמה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">סיסמה נוכחית</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">סיסמה חדשה</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">אימות סיסמה</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <Button className="w-full">עדכן סיסמה</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>העדפות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>התראות אימייל</Label>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span>התראות על אירועים חדשים</span>
                    <input type="checkbox" className="h-4 w-4" defaultChecked />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>שפה מועדפת</Label>
                <div className="rounded-lg border bg-muted px-4 py-2">
                  עברית
                </div>
              </div>

              <div className="space-y-2">
                <Label>אזור זמן</Label>
                <div className="rounded-lg border bg-muted px-4 py-2">
                  Jerusalem (GMT+2)
                </div>
              </div>

              <Button variant="destructive" className="w-full">
                מחק חשבון
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

