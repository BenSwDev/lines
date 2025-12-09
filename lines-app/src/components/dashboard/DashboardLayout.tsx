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
  Calendar,
  List,
  BookOpen,
  Users,
  Layers,
  Ticket,
  Package,
  Home,
  Info,
  FileText,
  Shield
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "@/core/i18n/provider";
import { ImpersonationBanner } from "@/modules/admin/ui/ImpersonationBanner";
import type { Venue } from "@prisma/client";

type DashboardLayoutProps = {
  children: React.ReactNode;
  user: {
    name: string | null;
    email: string;
    role?: string;
  };
  venues: Venue[];
  currentVenue?: Venue | null;
};

export function DashboardLayout({ children, user, venues, currentVenue }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { dir, t } = useTranslations();
  const sidebarSide = dir === "rtl" ? "right" : "left";

  return (
    <SidebarProvider defaultOpen side={sidebarSide}>
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
            {/* Admin Section - Always visible for admins */}
            {user.role === "admin" && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-primary font-semibold">
                  ניהול מערכת
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === "/admin"}
                        className="bg-primary/10 text-primary font-semibold hover:bg-primary/20"
                      >
                        <Link href="/admin">
                          <Shield className="h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

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

                {/* Dashboard Overview */}
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            pathname === `/venues/${currentVenue.id}` ||
                            pathname === `/venues/${currentVenue.id}/`
                          }
                        >
                          <Link href={`/venues/${currentVenue.id}`}>
                            <Home className="h-4 w-4" />
                            <span>{t("workspace.dashboard", { defaultValue: "סקירה כללית" })}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                {/* Information & Settings */}
                <SidebarGroup>
                  <SidebarGroupLabel>
                    {t("workspace.navigation", { defaultValue: "מידע והגדרות" })}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname?.includes("/settings/info")}>
                          <Link href={`/venues/${currentVenue.id}/settings/info`}>
                            <Info className="h-4 w-4" />
                            <span>{t("workspace.info", { defaultValue: "מידע כללי" })}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={
                            pathname?.includes("/lines") && !pathname?.includes("/settings")
                          }
                        >
                          <Link href={`/venues/${currentVenue.id}/lines`}>
                            <List className="h-4 w-4" />
                            <span>{t("workspace.lines", { defaultValue: "ליינים" })}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname?.includes("/settings/structure")}
                        >
                          <Link href={`/venues/${currentVenue.id}/settings/structure`}>
                            <Layers className="h-4 w-4" />
                            <span>{t("workspace.structure", { defaultValue: "מפה כללית" })}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname?.includes("/settings/roles")}>
                          <Link href={`/venues/${currentVenue.id}/settings/roles`}>
                            <Users className="h-4 w-4" />
                            <span>
                              {t("workspace.roles", { defaultValue: "תפקידים והיררכיה" })}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                {/* Calendar - Highlighted */}
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname?.includes("/calendar")}
                          className="bg-primary/10 text-primary font-semibold hover:bg-primary/20"
                        >
                          <Link
                            href={`/venues/${currentVenue.id}/calendar`}
                            className="flex items-center gap-2 w-full"
                          >
                            <Calendar className="h-4 w-4" />
                            <span className="flex-1">
                              {t("workspace.calendar", { defaultValue: "לוח שנה" })}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {t("common.new", { defaultValue: "חדש" })}
                            </Badge>
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
                          isActive={pathname?.includes("/settings/reservations")}
                        >
                          <Link href={`/venues/${currentVenue.id}/settings/reservations`}>
                            <BookOpen className="h-4 w-4" />
                            <span>{t("workspace.reservations", { defaultValue: "הזמנות" })}</span>
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
                            <span>{t("workspace.tickets", { defaultValue: "כרטיסים" })}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname?.includes("/settings/menus")}>
                          <Link href={`/venues/${currentVenue.id}/settings/menus`}>
                            <FileText className="h-4 w-4" />
                            <span>{t("workspace.menus", { defaultValue: "תפריטים" })}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname?.includes("/settings/team")}>
                          <Link href={`/venues/${currentVenue.id}/settings/team`}>
                            <Users className="h-4 w-4" />
                            <span>{t("workspace.team", { defaultValue: "צוות יחסי ציבור" })}</span>
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
                            <span>{t("workspace.inventory", { defaultValue: "מלאי" })}</span>
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
                            <Link href={`/venues/${venue.id}`}>
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
                {user.role === "admin" && (
                  <>
                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                      <Shield className="ml-2 h-4 w-4" />
                      ניהול מערכת
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
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
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-shrink-0">
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
                {user.role === "admin" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/admin")}
                    className="gap-2 border-primary/50 bg-primary/5 hover:bg-primary/10"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">ניהול מערכת</span>
                    <span className="sm:hidden">Admin</span>
                  </Button>
                )}
                <ThemeToggle />
                <LanguageSwitcher />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <ImpersonationBanner />
            <div className="container mx-auto px-6 py-6 max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
