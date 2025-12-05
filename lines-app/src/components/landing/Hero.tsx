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
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            ניהול אירועים חוזרים
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
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
          <div className="mt-24 grid gap-6 md:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 p-8 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20">
              {/* Decorative glow */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  ניהול אירועים חכם
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  צור אירועים חוזרים עם כללי תדירות גמישים - שבועי, חודשי, או מותאם אישית
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 p-8 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20">
              {/* Decorative glow */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Palette className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  ארגון ויזואלי
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  15 צבעים ייחודיים לכל ליין, תצוגת לוח שנה אינטואיטיבית וסינון מתקדם
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 p-8 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20">
              {/* Decorative glow */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-pink-500/10 blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-orange-600 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  ממשק מהיר
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  בנוי על Next.js 15 עם תמיכה מלאה בעברית ו-RTL, מהיר ורספונסיבי
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
