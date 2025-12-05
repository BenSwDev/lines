"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/Card";

export interface VenueSettingsTabProps {
  venueId: string;
}

export function VenueSettingsTab({ venueId }: VenueSettingsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>תפריטים</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">ניהול תפריטים יתווסף בגרסה הבאה (venueId: {venueId})</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>אזורים ושולחנות</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">ניהול אזורים ושולחנות יתווסף בגרסה הבאה</p>
        </CardContent>
      </Card>
    </div>
  );
}

