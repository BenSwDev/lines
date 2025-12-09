"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Using divs instead of Table component
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreVertical, UserCheck, UserX, Trash2, Eye } from "lucide-react";
import { getAllUsers, updateUserRole, deleteUser } from "../actions/adminActions";
import { startImpersonation } from "../actions/impersonationActions";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import type { AdminUser } from "../types";

export function UsersManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const { update: updateSession } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const result = await getAllUsers();
      if (result.success && result.data) {
        setUsers(result.data as AdminUser[]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
    try {
      const result = await updateUserRole({ userId, role: newRole });
      if (result.success) {
        toast({
          title: "עודכן בהצלחה",
          description: `תפקיד המשתמש עודכן ל-${newRole === "admin" ? "מנהל" : "משתמש"}`
        });
        loadUsers();
      } else {
        toast({
          title: "שגיאה",
          description: result.error || "נכשל בעדכון התפקיד",
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "שגיאה",
        description: "נכשל בעדכון התפקיד",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את המשתמש ${userEmail}?`)) {
      return;
    }

    try {
      const result = await deleteUser(userId);
      if (result.success) {
        toast({
          title: "נמחק בהצלחה",
          description: `המשתמש ${userEmail} נמחק`
        });
        loadUsers();
      } else {
        toast({
          title: "שגיאה",
          description: result.error || "נכשל במחיקת המשתמש",
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "שגיאה",
        description: "נכשל במחיקת המשתמש",
        variant: "destructive"
      });
    }
  };

  const handleImpersonate = async (userId: string) => {
    try {
      const result = await startImpersonation({ userId });
      if (result.success && result.data) {
        // Update session with impersonation data
        await updateSession({
          impersonate: result.data
        });

        toast({
          title: "התחברת בהתחזות",
          description: `אתה רואה את המערכת כפי ש-${result.data.impersonatedUserEmail} רואה אותה`
        });

        // Refresh to update UI
        router.refresh();
        router.push("/dashboard");
      } else {
        toast({
          title: "שגיאה",
          description: result.error || "נכשל בהתחברות בהתחזות",
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "שגיאה",
        description: "נכשל בהתחברות בהתחזות",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">טוען...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>משתמשים</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">אין משתמשים</div>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-6 gap-4 p-2 font-semibold text-sm border-b">
                <div>אימייל</div>
                <div>שם</div>
                <div>תפקיד</div>
                <div>מקומות</div>
                <div>תאריך הרשמה</div>
                <div className="text-left">פעולות</div>
              </div>
              {/* Rows */}
              {users.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-6 gap-4 p-2 rounded-lg hover:bg-muted/50 items-center"
                >
                  <div className="font-medium">{user.email}</div>
                  <div>{user.name || "—"}</div>
                  <div>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? "מנהל" : "משתמש"}
                    </Badge>
                  </div>
                  <div>{user._count?.venues || 0}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("he-IL")}
                  </div>
                  <div className="text-left">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleImpersonate(user.id)}>
                          <Eye className="h-4 w-4 ml-2" />
                          התחבר בהתחזות
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleRoleChange(user.id, user.role === "admin" ? "user" : "admin")
                          }
                        >
                          {user.role === "admin" ? (
                            <>
                              <UserX className="h-4 w-4 ml-2" />
                              הסר הרשאות מנהל
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 ml-2" />
                              הפוך למנהל
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(user.id, user.email)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          מחק
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
