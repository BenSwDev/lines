"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/Card";

export interface CalendarTabProps {
  venueId: string;
}

export function CalendarTab({ venueId }: CalendarTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>לוח שנה</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-12">
        <div className="text-5xl mb-4">📅</div>
        <p className="text-gray-400">לוח שנה אינטראקטיבי יתווסף בגרסה הבאה (venueId: {venueId})</p>
        <p className="text-sm text-gray-500 mt-2">Backend + Calendar service מוכנים</p>
      </CardContent>
    </Card>
  );
}
