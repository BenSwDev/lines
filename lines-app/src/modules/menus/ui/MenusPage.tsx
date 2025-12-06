"use client";

import { useEffect, useState } from "react";
import { MenusSection } from "@/modules/venue-menus/ui/MenusSection";
import { useTranslations } from "@/core/i18n/provider";

type MenusPageProps = {
  venueId: string;
  venueName: string;
};

export function MenusPage({ venueId, venueName }: MenusPageProps) {
  const { t } = useTranslations();
  const [menus, setMenus] = useState<unknown[]>([]);

  const loadData = () => {
    // TODO: Load actual data
    setMenus([]);
  };

  useEffect(() => {
    loadData();
  }, [venueId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("settings.menus")} - {venueName}
          </h1>
          <p className="text-muted-foreground">{t("settings.menusDescription")}</p>
        </div>
      </div>

      <MenusSection
        venueId={venueId}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        menus={menus as any}
        onRefresh={loadData}
      />
    </div>
  );
}
