"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PageHero as PageHeroType } from "../types";
import Link from "next/link";

type PageHeroProps = {
  hero: PageHeroType;
  cta?: {
    label: string;
    message: string;
  };
  className?: string;
};

export function PageHero({ hero, cta, className }: PageHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8 shadow-lg",
        className
      )}
    >
      {/* Background decoration */}
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />

      <div className="relative z-10 space-y-6">
        {/* Title & Badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1.5 border-primary/20 bg-primary/10">
                <Sparkles className="h-3 w-3" />
                <span className="text-xs font-semibold">דמו</span>
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{hero.title}</h1>
            </div>
            <p className="text-lg font-medium text-muted-foreground">{hero.purpose}</p>
          </div>
        </div>

        {/* What You Can Do */}
        <div className="rounded-lg border bg-card/50 p-4 backdrop-blur-sm">
          <p className="text-base leading-relaxed text-foreground">{hero.whatYouCanDo}</p>
        </div>

        {/* Key Ideas */}
        <div className="grid gap-3 sm:grid-cols-2">
          {hero.keyIdeas.map((idea, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 rounded-lg border bg-card/50 p-3 backdrop-blur-sm"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <span className="text-sm leading-relaxed">{idea}</span>
            </motion.div>
          ))}
        </div>

        {/* Key Message */}
        <div className="rounded-lg border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5 p-6 text-center">
          <p className="text-xl font-bold text-foreground">{hero.keyMessage}</p>
        </div>

        {/* CTA */}
        {cta && (
          <div className="flex flex-col items-center gap-3 rounded-lg border bg-card/50 p-6 backdrop-blur-sm sm:flex-row sm:justify-between">
            <div>
              <p className="font-semibold">{cta.message}</p>
            </div>
            <Link href="/auth/register">
              <Button size="lg" className="gap-2 shadow-lg">
                <Sparkles className="h-4 w-4" />
                {cta.label}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}

