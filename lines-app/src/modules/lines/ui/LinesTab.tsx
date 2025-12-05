"use client";

import React from "react";
import { Card, CardContent } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";

export interface LinesTabProps {
  venueId: string;
}

export function LinesTab({ venueId }: LinesTabProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">ליינים</h2>
          <p className="text-gray-400">נהל את כל הליינים והאירועים שלך</p>
        </div>
        <Button variant="primary">+ ליין חדש</Button>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-400">ניהול ליינים יתווסף בגרסה הבאה (venueId: {venueId})</p>
          <p className="text-sm text-gray-500 mt-2">
            Backend מלא מוכן, UI בהמשך
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

