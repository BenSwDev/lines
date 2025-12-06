"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DemoStep, OverlayCard } from "../types";

const steps: DemoStep[] = [
  {
    id: "brand",
    title: "מי אנחנו",
    badge: "מותג פרימיום",
    description:
      "Lines היא מערכת ניהול אירועים חוזרים שמחברת בין בעלי מקומות, מנהלי הפקה וצוותים בשפה אחת ברורה ופשוטה.",
    bullets: [
      "נבנתה ל-RTL ולצוותים שעובדים בעברית מהיום הראשון",
      "משלבת בין חוויית משתמש פרימיום לבין אוטומציה חכמה",
      "מוכנה לעליה לאוויר – מהירה, מאובטחת ומדויקת",
    ],
  },
  {
    id: "calendar",
    title: "חוויית לוח שנה",
    badge: "הדמיה אינטראקטיבית",
    description:
      "תוכנית עבודה מלאה עם ליינים חוזרים, צבעים מותאמים אישית והקפצות שמסבירות כל פעולה על המסך.",
    bullets: [
      "תרחישים אמיתיים: יצירת ליין, שיוך צוות ופתיחת משמרות",
      "הדגמות קופצות שמסבירות למה כל פעולה חשובה",
      "עדכון חי של ההדמיה כך שתראו תוצאה מידית",
    ],
  },
  {
    id: "automation",
    title: "אוטומציה בזמן אמת",
    badge: "חלונות חכמים",
    description:
      "קבלו חלונות הסבר שקופצים בדיוק בזמן – חישובי עומסים, זמינות צוות והמלצות להמשך עבודה.",
    bullets: [
      "הודעות מיידיות שמסמנות צווארי בקבוק לפני שהם קורים",
      "אישור אוטומטי של פעולות קריטיות עם חיווי בטיחות",
      "מסלול הדרכה שמרגיש כמו יועץ אישי בתוך המוצר",
    ],
  },
  {
    id: "handoff",
    title: "סגירת פינה לפני שיווק",
    badge: "Ready to Launch",
    description:
      "הדמיה שמראה ללקוחות בדיוק איך יתחילו לעבוד ביום הראשון – עם קצב, ביטחון ובלי סימני שאלה.",
    bullets: [
      "חפיפה מודרכת לצוותי מכירות ושיווק",
      "מצב הצגה שמדגיש את ערכי המותג ותהליך העבודה",
      "הנעה לפעולה ברורה להתחלה מידית במערכת",
    ],
  },
];

const overlayCards: OverlayCard[] = [
  {
    title: "אוטומציה שמסבירה את עצמה",
    body: "חלון קופץ מציג למה קיבלתם המלצה לשנות צוות ומתי זה קורה.",
    icon: <Workflow className="h-4 w-4 text-primary" />,
    className:
      "top-6 right-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur",
  },
  {
    title: "חיווי אמינות",
    body: "שכבת אבטחה חכמה שמעדכנת כשהכל ירוק ומוכן לעליה לאוויר.",
    icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />,
    className:
      "bottom-8 left-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 shadow-lg",
  },
  {
    title: "אינטראקציה אנושית",
    body: "הסברים טקסטואליים קצרים בעברית שמקבעים את הערך העסקי.",
    icon: <MessageSquare className="h-4 w-4 text-blue-400" />,
    className:
      "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 backdrop-blur",
  },
];

export function ImmersiveDemo() {
  const [activeStep, setActiveStep] = useState(0);

  const currentStep = useMemo(() => steps[activeStep], [activeStep]);
  const progress = useMemo(() => ((activeStep + 1) / steps.length) * 100, [activeStep]);

  const handleNextStep = () => {
    setActiveStep((prev) => (prev + 1) % steps.length);
  };

  const handleStepClick = (index: number) => {
    setActiveStep(index);
  };

  return (
    <section className="relative overflow-hidden py-16">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute -left-10 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="container mx-auto px-6">
        <div className="mb-10 text-center">
          <Badge variant="secondary" className="mb-4 gap-2 border-primary/40 bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
            הדמיה אינטראקטיבית
          </Badge>
          <h1 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl">
            הכניסה החיה לעולם של Lines
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-slate-200/80">
            מודול הדמיה עצמאי שמציג למשתמשים בדיוק מה הם מקבלים, עם חלונות קופצים, אוטומציה בזמן אמת,
            והקדמה ברורה מי אנחנו – ברמה שמתאימה לעלייה לאוויר היום.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/10 p-8 shadow-2xl">
            <div className="relative z-10 flex items-center gap-3">
              <Badge variant="outline" className="border-white/20 text-white">
                מסלול מונחה
              </Badge>
              <span className="text-sm text-white/70">{currentStep.badge}</span>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span className="text-sm text-emerald-200">LIVE</span>
            </div>

            <div className="relative z-10 mt-6 space-y-4">
              <h2 className="text-3xl font-semibold text-white">{currentStep.title}</h2>
              <p className="text-base leading-relaxed text-white/80">{currentStep.description}</p>
              <ul className="space-y-2 text-sm text-slate-200">
                {currentStep.bullets.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-10 mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="group gap-2" onClick={handleNextStep}>
                התחילו הדמיה חיה
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/auth/register">התחילו לעבוד עכשיו</Link>
              </Button>
            </div>

            <div className="relative z-10 mt-8 space-y-3">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>
                  מסך {activeStep + 1} מתוך {steps.length}
                </span>
                <span className="font-semibold text-white">{progress.toFixed(0)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-primary via-emerald-400 to-blue-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
              </div>
            </div>

            <div className="relative z-0 mt-10 h-64 rounded-2xl bg-gradient-to-br from-slate-900/60 via-slate-900 to-slate-950">
              {overlayCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  className={`absolute max-w-xs text-left text-white ${card.className}`}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    rotate: index % 2 === 0 ? -0.5 : 0.5,
                  }}
                  transition={{ duration: 0.5 + index * 0.1 }}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {card.icon}
                    {card.title}
                  </div>
                  <p className="mt-1 text-xs text-white/70">{card.body}</p>
                </motion.div>
              ))}

              <div className="absolute inset-0 rounded-2xl border border-white/5" />
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),_radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.12),transparent_25%)]" />
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={`relative w-full overflow-hidden rounded-2xl border p-5 text-right transition-all duration-200 ${
                    isActive
                      ? "border-primary/70 bg-primary/10 shadow-[0_0_0_1px_rgba(99,102,241,0.3)]"
                      : "border-white/10 bg-white/5 hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-white/60">
                        <CalendarCheck2 className="h-4 w-4 text-primary" />
                        {step.badge}
                      </div>
                      <p className="mt-1 text-lg font-semibold text-white">{step.title}</p>
                      <p className="mt-1 text-sm text-white/70">{step.description}</p>
                    </div>
                    {isActive ? (
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">הדמיה חיה</span>
                    ) : (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">לצפייה</span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
                    {step.bullets.slice(0, 2).map((item) => (
                      <span key={item} className="rounded-full bg-white/5 px-3 py-1">
                        {item}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-right text-white">
              <div className="flex items-center gap-2 text-sm text-primary">
                <Sparkles className="h-4 w-4" />
                מסלול אישי לכל משתמש
              </div>
              <p className="mt-2 text-sm text-white/80">
                כל מעבר שלב מפעיל חלון קופץ שמדגים את הפעולה על המסך, עם שפה שיווקית תואמת מותג. זו הדמיה מלאה,
                לא סרטון – וכך המשתמש מקבל ביטחון להתחיל לעבוד מיידית.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

