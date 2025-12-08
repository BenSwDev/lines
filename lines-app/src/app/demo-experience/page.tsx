"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UtensilsCrossed, Coffee, Calendar, Hotel, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllDemoUsers, type DemoBusinessType } from "@/modules/demo-system";
import { Sparkles, ArrowRight } from "lucide-react";

const businessTypeIcons: Record<DemoBusinessType, React.ReactNode> = {
  restaurant: <UtensilsCrossed className="h-8 w-8" />,
  bar: <Coffee className="h-8 w-8" />,
  "event-hall": <Calendar className="h-8 w-8" />,
  cafe: <Coffee className="h-8 w-8" />,
  hotel: <Hotel className="h-8 w-8" />,
  club: <Music className="h-8 w-8" />
};

const businessTypeLabels: Record<DemoBusinessType, string> = {
  restaurant: "מסעדה",
  bar: "בר",
  "event-hall": "אולם אירועים",
  cafe: "קפה",
  hotel: "מלון",
  club: "מועדון"
};

const businessTypeDescriptions: Record<DemoBusinessType, string> = {
  restaurant: "ניהול שולחנות, משמרות, ותפריטים",
  bar: "ניהול ערבים, אירועים, ותפריטי משקאות",
  "event-hall": "ניהול אירועים, הזמנות, ומפות ישיבה",
  cafe: "ניהול שולחנות, תפריטים, וצוות",
  hotel: "ניהול חדרים, אירועים, ושירותים",
  club: "ניהול ערבים, אירועים, וקיבולת"
};

export default function DemoExperiencePage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<DemoBusinessType | null>(null);
  const demoUsers = getAllDemoUsers();

  const handleSelectBusiness = (type: DemoBusinessType) => {
    setSelectedType(type);
    // Navigate to demo venue with selected business type
    const demoUser = demoUsers.find((u) => u.businessType === type);
    if (demoUser) {
      router.push(`/venues/${demoUser.venueId}/lines?demo=true&type=${type}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <Badge variant="outline" className="mb-4 gap-2 border-primary/20 bg-primary/10">
            <Sparkles className="h-3 w-3" />
            <span>הדמיה אינטראקטיבית</span>
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            בחר את סוג העסק שלך
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            גלה איך Lines יכול לעזור לך לנהל את העסק שלך - בחר סוג עסק וצפה בהדמיה מותאמת אישית
          </p>
        </motion.div>

        {/* Business Type Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {demoUsers.map((user, idx) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                className={cn(
                  "group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
                  selectedType === user.businessType && "ring-2 ring-primary"
                )}
                onClick={() => handleSelectBusiness(user.businessType)}
              >
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg">
                    {businessTypeIcons[user.businessType]}
                  </div>
                  <CardTitle className="text-2xl">
                    {businessTypeLabels[user.businessType]}
                  </CardTitle>
                  <CardDescription>{businessTypeDescriptions[user.businessType]}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full gap-2"
                    variant={selectedType === user.businessType ? "default" : "outline"}
                  >
                    צפה בהדמיה
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 rounded-2xl border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-8 text-center"
        >
          <h2 className="mb-4 text-2xl font-bold">מוכן להתחיל?</h2>
          <p className="mb-6 text-muted-foreground">
            הרשם עכשיו וקבל גישה מלאה לכל התכונות - ללא הגבלות
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2" asChild>
              <a href="/auth/register">
                <Sparkles className="h-4 w-4" />
                התחל בחינם
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/auth/login">יש לך כבר חשבון? התחבר</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
