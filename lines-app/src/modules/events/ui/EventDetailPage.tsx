"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/Card";

export function EventDetailPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>פרטי אירוע</CardTitle>
      </CardHeader>
      <CardContent className="text-center py-12">
        <div className="text-5xl mb-4">📅</div>
        <p className="text-gray-400">UI של פרטי אירוע יתווסף בגרסה הבאה</p>
        <p className="text-sm text-gray-500 mt-2">Backend + Services מלאים מוכנים</p>
      </CardContent>
    </Card>
  );
}
