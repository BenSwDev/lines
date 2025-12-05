import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 bg-gray-950 py-12">
      <div className="container mx-auto px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* About */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">אודות Lines</h3>
            <p className="text-sm text-gray-400">
              מערכת ניהול אירועים חוזרים מתקדמת לעסקים. בנויה עם Next.js 15, Supabase ו-Prisma.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">קישורים מהירים</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/demo" className="transition-colors hover:text-white">
                  הדמיה
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="transition-colors hover:text-white">
                  הרשמה
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="transition-colors hover:text-white">
                  התחברות
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">יצירת קשר</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="mailto:info@lines.app" className="transition-colors hover:text-white">
                  info@lines.app
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/BenSwDev/lines"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>© {currentYear} Lines App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

