"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Calendar, Palette, Zap } from "lucide-react";

type HeroProps = {
  isAuthenticated: boolean;
};

export function Hero({ isAuthenticated }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 py-20 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <Badge variant="outline" className="mb-6 gap-1">
            <Sparkles className="h-3 w-3" />
            <span>מערכת ניהול אירועים מתקדמת</span>
          </Badge>

          {/* Main Heading */}
          <h1 className="mb-4 text-5xl font-extrabold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl xl:text-8xl">
            ניהול אירועים חוזרים
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
              בצורה פשוטה וחכמה
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            תכנן אירועים חוזרים, נהל מקומות וצוותים, וקבל תצוגת לוח שנה אינטואיטיבית - הכל במקום אחד
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="group gap-2">
                  כניסה ל-Dashboard
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/register">
                  <Button size="lg" className="group gap-2">
                    התחל בחינם
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    לחץ להדמיה
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Feature Highlights */}
          <div className="mt-24 grid gap-8 md:grid-cols-3">
            <div className="group rounded-xl border bg-card p-6 transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-transform group-hover:scale-110">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">ניהול אירועים חכם</h3>
              <p className="text-sm text-muted-foreground">
                צור אירועים חוזרים עם כללי תדירות גמישים - שבועי, חודשי, או מותאם אישית
              </p>
            </div>

            <div className="group rounded-xl border bg-card p-6 transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-transform group-hover:scale-110">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">ארגון ויזואלי</h3>
              <p className="text-sm text-muted-foreground">
                15 צבעים ייחודיים לכל ליין, תצוגת לוח שנה אינטואיטיבית וסינון מתקדם
              </p>
            </div>

            <div className="group rounded-xl border bg-card p-6 transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-transform group-hover:scale-110">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">ממשק מהיר</h3>
              <p className="text-sm text-muted-foreground">
                בנוי על Next.js 15 עם תמיכה מלאה בעברית ו-RTL, מהיר ורספונסיבי
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
