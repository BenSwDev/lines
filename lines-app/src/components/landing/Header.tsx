"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type HeaderProps = {
  isAuthenticated: boolean;
};

export function Header({ isAuthenticated }: HeaderProps) {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Lines
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          <LanguageSwitcher />

          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link href="/api/auth/signout">
                <Button variant="secondary" size="sm">
                  יציאה
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  התחברות
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm">
                  הרשמה
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
