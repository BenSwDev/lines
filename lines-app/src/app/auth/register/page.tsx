"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { UserPlus, ArrowRight } from "lucide-react";
import { register } from "@/modules/auth/actions/register";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await register({ name, email, password });

      if (result.success) {
        // Auto-login after successful registration
        const signInResult = await signIn("credentials", {
          email,
          password,
          redirect: false
        });

        if (signInResult?.ok) {
          router.push("/dashboard");
          router.refresh();
        } else {
          router.push("/auth/login");
        }
      } else {
        setError(result.error || "שגיאה בהרשמה");
      }
    } catch {
      setError("שגיאה בהרשמה");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <Link href="/" className="group inline-block">
            <div className="relative mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-3xl font-bold text-white">L</span>
              </div>
            </div>
          </Link>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">הצטרף ל-Lines</h1>
          <p className="text-muted-foreground">צור חשבון חדש והתחל לנהל אירועים</p>
        </div>

        {/* Register Card */}
        <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl">
          {/* Decorative glow */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              הרשמה
            </CardTitle>
            <CardDescription className="text-base">
              מלא את הפרטים כדי ליצור חשבון חדש
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">שם מלא</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="השם שלך"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">סיסמה</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">לפחות 6 תווים</p>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                {isLoading ? "נרשם..." : "הרשמה"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                כבר יש לך חשבון?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  התחבר כאן
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← חזרה לדף הבית
          </Link>
        </div>
      </div>
    </div>
  );
}
