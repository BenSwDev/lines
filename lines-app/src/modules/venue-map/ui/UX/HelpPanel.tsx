/**
 * Help Panel Component
 * Contextual help and tips for the venue map editor
 */

"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Lightbulb,
  Video,
  Sparkles,
  Plus,
  Save,
  Grid,
  Layers
} from "lucide-react";
import { useDevice } from "../../hooks";
import { ResponsiveDialog } from "../Dialogs/ResponsiveDialog";

interface HelpPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpPanel({ open, onOpenChange }: HelpPanelProps) {
  const device = useDevice();

  const quickTips = [
    {
      icon: Sparkles,
      title: "התחל עם תבנית",
      description: "בחר תבנית מוכנה כדי להתחיל במהירות"
    },
    {
      icon: Plus,
      title: "הוסף אלמנטים",
      description: "לחץ על 'הוסף' כדי להוסיף שולחנות, אזורים או אזורים מיוחדים"
    },
    {
      icon: Save,
      title: "שמור תמיד",
      description: "לחץ על 'שמור' כדי לשמור את השינויים שלך"
    },
    {
      icon: Grid,
      title: "יישור אוטומטי",
      description: "הכל מיושר אוטומטית לרשת - אין צורך לדאוג ליישור"
    },
    {
      icon: Layers,
      title: "קישור אוטומטי",
      description: "שולחנות שנגררים לאזור מקושרים אוטומטית"
    }
  ];

  const shortcuts = [
    { key: "Double Click", action: "ערוך אלמנט" },
    { key: "Ctrl/Cmd + Z", action: "בטל פעולה" },
    { key: "Ctrl/Cmd + Shift + Z", action: "בצע מחדש" },
    { key: "Ctrl/Cmd + C", action: "העתק" },
    { key: "Ctrl/Cmd + V", action: "הדבק" },
    { key: "Delete", action: "מחק אלמנט נבחר" },
    { key: "Arrow Keys", action: "הזז אלמנט" },
    { key: "Shift + Click", action: "בחר מספר אלמנטים" }
  ];

  const content = (
    <Tabs defaultValue="tips" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="tips">
          <Lightbulb className="h-4 w-4 mr-2" />
          טיפים
        </TabsTrigger>
        <TabsTrigger value="shortcuts">
          <BookOpen className="h-4 w-4 mr-2" />
          קיצורים
        </TabsTrigger>
        <TabsTrigger value="guide">
          <Video className="h-4 w-4 mr-2" />
          מדריך
        </TabsTrigger>
      </TabsList>

      <TabsContent value="tips" className="space-y-4 mt-4">
        <div className="space-y-3">
          {quickTips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <Card key={index} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="shortcuts" className="space-y-4 mt-4">
        <div className="space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm text-muted-foreground">{shortcut.action}</span>
              <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="guide" className="space-y-4 mt-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-2">מדריך מהיר</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>בחר תבנית מוכנה או התחל מאפס</li>
            <li>הוסף שולחנות ואזורים על ידי לחיצה על &apos;הוסף&apos;</li>
            <li>גרור אלמנטים כדי להזיז אותם</li>
            <li>לחץ פעמיים על אלמנט כדי לערוך אותו</li>
            <li>שמור את המפה שלך</li>
          </ol>
        </Card>
      </TabsContent>
    </Tabs>
  );

  if (device.isMobile) {
    return (
      <ResponsiveDialog
        open={open}
        onOpenChange={onOpenChange}
        title="עזרה ומדריך"
        contentClassName="p-4"
      >
        {content}
      </ResponsiveDialog>
    );
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="עזרה ומדריך"
      contentClassName="p-6 max-w-2xl"
    >
      {content}
    </ResponsiveDialog>
  );
}
