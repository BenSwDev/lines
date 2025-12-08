'use client';

import { Users, Clock, Construction } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TeamManagementPage() {
  return (
    <div className="container max-w-4xl py-8">
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
            <Users className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            👥 ניהול צוות ויחצנים
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
            <Construction className="h-4 w-4" />
            <span>בקרוב</span>
          </div>
          
          <p className="text-muted-foreground max-w-md mx-auto">
            ניהול עובדים, יחצנים ונציגי PR. מעקב ביצועים, עמלות ורשימות אורחים.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium">ניהול צוות</div>
              <div className="text-sm text-muted-foreground">
                ניהול עובדים ותפקידים
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl mb-2">📣</div>
              <div className="font-medium">יחצנים ומקדמים</div>
              <div className="text-sm text-muted-foreground">
                מעקב הפניות ואורחים
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl mb-2">💵</div>
              <div className="font-medium">מעקב עמלות</div>
              <div className="text-sm text-muted-foreground">
                חישוב אוטומטי
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium">רשימות אורחים</div>
              <div className="text-sm text-muted-foreground">
                רשימות אורחים ליחצנים
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">דוחות ביצועים</div>
              <div className="text-sm text-muted-foreground">
                מעקב תוצאות לאורך זמן
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-6">
            <Clock className="h-4 w-4" />
            <span>צפי להשקה: Q2 2025</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TeamManagementPage;
