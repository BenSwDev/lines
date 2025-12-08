'use client';

import { Package, Clock, Construction } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function InventoryPage() {
  return (
    <div className="container max-w-4xl py-8">
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
            <Package className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            📦 ניהול מלאי
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
            <Construction className="h-4 w-4" />
            <span>בקרוב</span>
          </div>
          
          <p className="text-muted-foreground max-w-md mx-auto">
            מודול זה יעזור לך לעקוב אחר רמות מלאי, לנהל ספקים ולהזמין אוטומטית.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">מעקב מלאי</div>
              <div className="text-sm text-muted-foreground">
                רמות מלאי בזמן אמת
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl mb-2">🔔</div>
              <div className="font-medium">התראות מלאי נמוך</div>
              <div className="text-sm text-muted-foreground">
                התראות אוטומטיות
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl mb-2">📋</div>
              <div className="font-medium">היסטוריית הזמנות</div>
              <div className="text-sm text-muted-foreground">
                מעקב אחר כל הרכישות
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-6">
            <Clock className="h-4 w-4" />
            <span>צפי להשקה: Q3 2025</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InventoryPage;
