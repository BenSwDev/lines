"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/core/i18n/provider";
import type { User as UserType } from "@prisma/client";

type AccountPageProps = {
  user: UserType;
};

export function AccountPage({ user }: AccountPageProps) {
  const { toast } = useToast();
  const { t, locale } = useTranslations();

  const handlePasswordChange = async () => {
    toast({
      title: t("account.updatePasswordComingSoon"),
      description: t("account.updatePasswordComingSoon"),
    });
  };

  const userInitials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user.email[0].toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("account.title")}</h1>
        <p className="text-muted-foreground">{t("account.subtitle")}</p>
      </div>

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("account.accountInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{user.name || user.email}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t("profile.role")}</p>
              <p className="text-base">{user.role === "admin" ? t("profile.roleAdmin") : t("profile.roleUser")}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t("profile.joinedDate")}</p>
              <p className="text-base">
                {new Date(user.createdAt).toLocaleDateString(locale === "he" ? "he-IL" : "en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t("account.security")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">{t("account.currentPassword")}</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="••••••••"
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">{t("account.newPassword")}</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="••••••••"
              disabled
            />
          </div>

          <Button onClick={handlePasswordChange} disabled>
            {t("account.updatePassword")} ({t("common.loading")})
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
