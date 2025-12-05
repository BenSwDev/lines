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
import { Building2, Plus, LogOut, Settings, User, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

  return (
    <SidebarProvider>
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
            {/* Current Venue / Venue Switcher */}
            {currentVenue ? (
              <SidebarGroup>
                <SidebarGroupLabel>Venue נוכחי</SidebarGroupLabel>
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
                      <DropdownMenuLabel>החלף Venue</DropdownMenuLabel>
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
                              נוכחי
                            </Badge>
                          )}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                        <Plus className="ml-2 h-4 w-4" />
                        כל המקומות
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ) : (
              <SidebarGroup>
                <SidebarGroupLabel>המקומות שלי</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {venues.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        אין Venues עדיין
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
                          <span>צור Venue חדש</span>
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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>החשבון שלי</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="ml-2 h-4 w-4" />
                  פרופיל
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="ml-2 h-4 w-4" />
                  הגדרות
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/signout">
                    <LogOut className="ml-2 h-4 w-4" />
                    יציאה
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1">
          <div className="border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              {currentVenue && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">{currentVenue.name}</h2>
                </div>
              )}
            </div>
          </div>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
