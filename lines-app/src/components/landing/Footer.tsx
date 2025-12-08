import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/50 bg-gradient-to-br from-background via-background to-muted/20 py-12">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="container relative mx-auto px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                <span className="text-primary-foreground font-bold text-sm">L</span>
              </div>
              <h3 className="text-lg font-bold text-foreground">אודות Lines</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              מערכת ניהול אירועים חוזרים מתקדמת לעסקים. בנויה עם Next.js 15, Supabase ו-Prisma.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">קישורים מהירים</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/auth/register"
                  className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <span className="h-1 w-1 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-200" />
                  הרשמה
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <span className="h-1 w-1 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-200" />
                  התחברות
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">יצירת קשר</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:info@lines.app"
                  className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <span className="h-1 w-1 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-200" />
                  info@lines.app
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/BenSwDev/lines"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <span className="h-1 w-1 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-200" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-border/50 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Lines App. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
