"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Plus,
  LogOut,
  Settings,
  User,
  ChevronDown,
  Info,
  Calendar,
  List,
  FileText,
  BookOpen,
  Users,
  Layers,
  Ticket,
  Package,
  UsersRound
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "@/core/i18n/provider";
import {
  TourProvider,
  TourOverlay,
  TourProgressBar,
  TourButton,
  useTour
} from "@/modules/guided-tour";
import type { Venue } from "@prisma/client";

type DashboardLayoutProps = {
  children: React.ReactNode;
  user: {
    name: string | null;
    email: string;
  };
  venues: Venue[];
  currentVenue?: Venue | null;
};

export function DashboardLayout({ children, user, venues, currentVenue }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { dir, t } = useTranslations();
  const sidebarSide = dir === "rtl" ? "right" : "left";

  // Detect current page for tour
  const getCurrentPageId = ():
    | "lines"
    | "roles"
    | "structure"
    | "menus"
    | "info"
    | "calendar"
    | undefined => {
    if (pathname?.includes("/lines")) return "lines";
    if (pathname?.includes("/roles")) return "roles";
    if (pathname?.includes("/settings/structure")) return "structure";
    if (pathname?.includes("/menus")) return "menus";
    if (pathname?.includes("/info")) return "info";
    if (pathname?.includes("/calendar")) return "calendar";
    return undefined;
  };

  const currentPageId = getCurrentPageId();

  // Inner component to handle tour auto-start
  function TourWrapper({ children }: { children: React.ReactNode }) {
    const searchParams = useSearchParams();
    const { startTour } = useTour();
    const shouldStartTour = searchParams.get("startTour") === "true";

    useEffect(() => {
      if (shouldStartTour && currentPageId) {
        // Small delay to ensure page is fully loaded
        const timer = setTimeout(() => {
          startTour(currentPageId);
          // Remove query param from URL
          const url = new URL(window.location.href);
          url.searchParams.delete("startTour");
          window.history.replaceState({}, "", url.toString());
        }, 500);
        return () => clearTimeout(timer);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldStartTour, startTour]);

    return <>{children}</>;
  }

  return (
    <TourProvider pageId={currentPageId}>
      <SidebarProvider defaultOpen side={sidebarSide}>
        <TourWrapper>
          <div className="flex min-h-screen w-full">
            {/* Sidebar */}
            <Sidebar>
              <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                    <span className="text-sm font-bold text-white">L</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">Lines</h1>
                    <p className="text-xs text-muted-foreground">ניהול אירועים</p>
                  </div>
                </div>
              </SidebarHeader>

              <SidebarContent>
                {/* Venue Switcher */}
                {currentVenue ? (
                  <>
                    <SidebarGroup>
                      <SidebarGroupLabel>{t("workspace.currentVenue")}</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              <span className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                {currentVenue.name}
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>{t("workspace.switchVenue")}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {venues.map((venue) => (
                              <DropdownMenuItem
                                key={venue.id}
                                onClick={() => router.push(`/venues/${venue.id}/info`)}
                                disabled={venue.id === currentVenue.id}
                              >
                                <Building2 className="ml-2 h-4 w-4" />
                                {venue.name}
                                {venue.id === currentVenue.id && (
                                  <Badge variant="outline" className="mr-auto">
                                    {t("common.current")}
                                  </Badge>
                                )}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                              <Plus className="ml-2 h-4 w-4" />
                              {t("workspace.allVenues")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Venue Navigation */}
                    <SidebarGroup>
                      <SidebarGroupLabel>{t("workspace.navigation")}</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname?.includes("/info")}>
                              <Link href={`/venues/${currentVenue.id}/info`}>
                                <Info className="h-4 w-4" />
                                <span>מידע כללי</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname?.includes("/menus")}>
                              <Link href={`/venues/${currentVenue.id}/menus`}>
                                <FileText className="h-4 w-4" />
                                <span>תפריטים</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname?.includes("/reservations")}
                            >
                              <Link href={`/venues/${currentVenue.id}/reservations`}>
                                <BookOpen className="h-4 w-4" />
                                <span>הזמנות</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname?.includes("/lines")}>
                              <Link href={`/venues/${currentVenue.id}/lines`}>
                                <List className="h-4 w-4" />
                                <span>ליינים</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname?.includes("/calendar")}>
                              <Link href={`/venues/${currentVenue.id}/calendar`}>
                                <Calendar className="h-4 w-4" />
                                <span>לוח שנה</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname?.includes("/roles")}>
                              <Link href={`/venues/${currentVenue.id}/roles`}>
                                <Users className="h-4 w-4" />
                                <span>תפקידים והיררכיה</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Venue Settings */}
                    <SidebarGroup>
                      <SidebarGroupLabel>
                        {t("workspace.settings", { defaultValue: "הגדרות מקום" })}
                      </SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname?.includes("/settings/structure")}
                            >
                              <Link href={`/venues/${currentVenue.id}/settings/structure`}>
                                <Layers className="h-4 w-4" />
                                <span>מבנה (מפות)</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname?.includes("/settings/tickets")}
                            >
                              <Link href={`/venues/${currentVenue.id}/settings/tickets`}>
                                <Ticket className="h-4 w-4" />
                                <span>כרטיסים</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname?.includes("/settings/inventory")}
                            >
                              <Link href={`/venues/${currentVenue.id}/settings/inventory`}>
                                <Package className="h-4 w-4" />
                                <span>מלאי</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                          <SidebarMenuItem>
                            <SidebarMenuButton
                              asChild
                              isActive={pathname?.includes("/settings/team")}
                            >
                              <Link href={`/venues/${currentVenue.id}/settings/team`}>
                                <UsersRound className="h-4 w-4" />
                                <span>צוות ויחצנים</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  </>
                ) : (
                  <SidebarGroup>
                    <SidebarGroupLabel>{t("workspace.myVenues")}</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {venues.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            {t("workspace.noVenuesYet")}
                          </div>
                        ) : (
                          venues.map((venue) => (
                            <SidebarMenuItem key={venue.id}>
                              <SidebarMenuButton asChild>
                                <Link href={`/venues/${venue.id}/info`}>
                                  <Building2 className="h-4 w-4" />
                                  <span>{venue.name}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))
                        )}
                        <SidebarMenuItem>
                          <SidebarMenuButton className="text-primary" asChild>
                            <Link href="/dashboard">
                              <Plus className="h-4 w-4" />
                              <span>{t("workspace.createNewVenue")}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                )}
              </SidebarContent>

              <SidebarFooter className="border-t border-sidebar-border p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-2 px-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start text-right">
                        <span className="text-sm font-medium">{user.name || "משתמש"}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                      <ChevronDown className="mr-auto h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rtl:text-right">
                    <DropdownMenuLabel>{t("common.myAccount")}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <User className="ml-2 h-4 w-4" />
                      {t("profile.title")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/account")}>
                      <Settings className="ml-2 h-4 w-4" />
                      {t("account.title")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/api/auth/signout">
                        <LogOut className="ml-2 h-4 w-4" />
                        {t("common.logout")}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarFooter>
            </Sidebar>

            {/* Main Content */}
            <main className="flex-1">
              <div className="border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    {currentVenue && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-lg font-semibold">{currentVenue.name}</h2>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <TourButton />
                    <ThemeToggle />
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
              <div className="p-6">{children}</div>
            </main>
          </div>
          <TourOverlay />
          <TourProgressBar />
        </TourWrapper>
      </SidebarProvider>
    </TourProvider>
  );
}
