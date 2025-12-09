"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, LogOut } from "lucide-react";

type SessionUser = {
  id?: string;
  email?: string | null;
  name?: string | null;
  role?: string;
  isImpersonating?: boolean;
  originalUserId?: string;
  originalUserEmail?: string;
  originalUserName?: string | null;
};

export function ImpersonationBanner() {
  const sessionResult = useSession();
  const router = useRouter();

  // Handle case where session might not be loaded yet
  if (!sessionResult || !sessionResult.data) {
    return null;
  }

  const { data: session, update: updateSession } = sessionResult;
  const user = session?.user as SessionUser | undefined;
  const isImpersonating = Boolean(user?.isImpersonating);

  if (!isImpersonating) {
    return null;
  }

  const originalUserEmail = user?.originalUserEmail;
  const currentUserEmail = user?.email;

  const handleStopImpersonation = async () => {
    try {
      // Update session to stop impersonation
      await updateSession({
        stopImpersonation: true
      });
      
      // Refresh to update UI
      router.refresh();
    } catch {
      // Error handled silently
    }
  };

  return (
    <Card className="border-amber-500/50 bg-amber-500/10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          <div>
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              אתה מחובר בהתחזות
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              אתה רואה את המערכת כפי ש-{currentUserEmail} רואה אותה
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
              מנהל מקורי: {originalUserEmail}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleStopImpersonation}
          className="border-amber-500/50 hover:bg-amber-500/20"
        >
          <LogOut className="h-4 w-4 ml-2" />
          חזור למצב רגיל
        </Button>
      </div>
    </Card>
  );
}
