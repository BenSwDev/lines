"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Using divs instead of Table component
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Eye } from "lucide-react";
import { getAllVenues, deleteVenue } from "../actions/adminActions";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

type Venue = {
  id: string;
  name: string;
  createdAt: Date;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  _count: {
    lines: number;
    zones: number;
  };
};

export function VenuesManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    setIsLoading(true);
    try {
      const result = await getAllVenues();
      if (result.success && result.data) {
        setVenues(result.data as Venue[]);
      }
    } catch (error) {
      console.error("Error loading venues:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (venueId: string, venueName: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את המקום "${venueName}"?`)) {
      return;
    }

    try {
      const result = await deleteVenue(venueId);
      if (result.success) {
        toast({
          title: "נמחק בהצלחה",
          description: `המקום "${venueName}" נמחק`
        });
        loadVenues();
      } else {
        toast({
          title: "שגיאה",
          description: result.error || "נכשל במחיקת המקום",
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "שגיאה",
        description: "נכשל במחיקת המקום",
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
        <CardTitle>מקומות</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {venues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">אין מקומות</div>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-6 gap-4 p-2 font-semibold text-sm border-b">
                <div>שם</div>
                <div>בעלים</div>
                <div>ליינים</div>
                <div>איזורים</div>
                <div>תאריך יצירה</div>
                <div className="text-left">פעולות</div>
              </div>
              {/* Rows */}
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  className="grid grid-cols-6 gap-4 p-2 rounded-lg hover:bg-muted/50 items-center"
                >
                  <div className="font-medium">{venue.name}</div>
                  <div>
                    <div>{venue.user.email}</div>
                    {venue.user.name && (
                      <div className="text-xs text-muted-foreground">{venue.user.name}</div>
                    )}
                  </div>
                  <div>{venue._count.lines}</div>
                  <div>{venue._count.zones}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(venue.createdAt).toLocaleDateString("he-IL")}
                  </div>
                  <div className="text-left">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/venues/${venue.id}`)}>
                          <Eye className="h-4 w-4 ml-2" />
                          צפה
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(venue.id, venue.name)}
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

