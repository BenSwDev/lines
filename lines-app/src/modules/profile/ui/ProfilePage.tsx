"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useTranslations } from "@/core/i18n/provider";
import type { User as UserType } from "@prisma/client";

type ProfilePageProps = {
  user: UserType;
};

export function ProfilePage({ user }: ProfilePageProps) {
  const { t, locale } = useTranslations();
  const userInitials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || user.email[0].toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("profile.title")}</h1>
        <p className="text-muted-foreground">{t("profile.subtitle")}</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t("profile.personalInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{user.name || user.email}</h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t("profile.fullName")}</p>
              <p className="text-base">{user.name || "—"}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t("profile.email")}</p>
              <p className="text-base">{user.email}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t("profile.role")}</p>
              <p className="text-base">
                {user.role === "admin" ? t("profile.roleAdmin") : t("profile.roleUser")}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t("profile.joinedDate")}</p>
              <p className="text-base">
                {new Date(user.createdAt).toLocaleDateString(locale === "he" ? "he-IL" : "en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
