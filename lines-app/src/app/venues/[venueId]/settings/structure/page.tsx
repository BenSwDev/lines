import { Layers, Construction, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  params: Promise<{
    venueId: string;
  }>;
}

export default async function StructurePage({ params }: PageProps) {
  // Await params but don't use for now (will be used in future implementation)
  await params;

  return (
    <div className="container max-w-4xl py-8">
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
            <Layers className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">🗺️ מבנה המקום (מפות)</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
            <Construction className="h-4 w-4" />
            <span>בפיתוח</span>
          </div>

          <p className="text-muted-foreground max-w-md mx-auto">
            מודול זה יאפשר לך ליצור ולנהל מפות רצפה מרובות למקום שלך. כל מפה תכלול איזורים, שולחנות,
            ברים ואזורים מיוחדים.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl mb-2">🏠</div>
              <div className="font-medium">מפות מרובות</div>
              <div className="text-sm text-muted-foreground">צור מפות שונות לליינים ולאירועים</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium">סידור עבודה</div>
              <div className="text-sm text-muted-foreground">הגדר צוות לכל איזור ושולחן</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-medium">מינימום הזמנה</div>
              <div className="text-sm text-muted-foreground">הגדר מינימום לכל שולחן ואיזור</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-2xl mb-2">📝</div>
              <div className="font-medium">תכולה וניהול</div>
              <div className="text-sm text-muted-foreground">ערוך פרטי שולחנות ואיזורים</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-6">
            <Clock className="h-4 w-4" />
            <span>צפי להשקה: Q1 2025</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
