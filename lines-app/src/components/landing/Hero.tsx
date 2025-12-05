"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/Button";

type HeroProps = {
  isAuthenticated: boolean;
};

export function Hero({ isAuthenticated }: HeroProps) {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mx-auto max-w-4xl">
        {/* Main Heading */}
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
          ניהול אירועים חוזרים
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            בצורה פשוטה וחכמה
          </span>
        </h1>

        {/* Description */}
        <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-gray-300 md:text-xl">
          <strong className="text-white">Lines</strong> היא מערכת מתקדמת לניהול לוח אירועים עבור
          עסקים. תכנן אירועים חוזרים, נהל מקומות וצוותים, וקבל תצוגת לוח שנה אינטואיטיבית - הכל
          במקום אחד.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* Demo Button */}
          <Link href="/demo">
            <Button
              size="lg"
              variant="secondary"
              className="w-full min-w-[200px] border-2 border-blue-500 bg-transparent text-blue-400 hover:bg-blue-500/10 sm:w-auto"
            >
              🎭 לחץ להדמיה
            </Button>
          </Link>

          {/* Auth / Dashboard Button */}
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button
                size="lg"
                className="w-full min-w-[200px] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 sm:w-auto"
              >
                כניסה ל-Dashboard →
              </Button>
            </Link>
          ) : (
            <Link href="/auth/register">
              <Button
                size="lg"
                className="w-full min-w-[200px] bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 sm:w-auto"
              >
                התחברות / הרשמה →
              </Button>
            </Link>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
            <div className="mb-3 text-4xl">📅</div>
            <h3 className="mb-2 text-xl font-semibold">ניהול אירועים חכם</h3>
            <p className="text-sm text-gray-400">
              צור אירועים חוזרים עם כללי תדירות גמישים - שבועי, חודשי, או מותאם אישית
            </p>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
            <div className="mb-3 text-4xl">🎨</div>
            <h3 className="mb-2 text-xl font-semibold">ארגון ויזואלי</h3>
            <p className="text-sm text-gray-400">
              15 צבעים ייחודיים לכל ליין, תצוגת לוח שנה אינטואיטיבית וסינון מתקדם
            </p>
          </div>

          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm">
            <div className="mb-3 text-4xl">⚡</div>
            <h3 className="mb-2 text-xl font-semibold">ממשק מהיר</h3>
            <p className="text-sm text-gray-400">
              בנוי על Next.js 15 עם תמיכה מלאה בעברית ו-RTL, מהיר ורספונסיבי
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
