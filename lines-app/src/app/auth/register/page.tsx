"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FormField, Input } from "@/shared/ui/FormField";
import { registerUser } from "@/modules/auth/actions/register";

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
      const result = await registerUser({ name, email, password });

      if (result.success) {
        router.push("/auth/login?registered=true");
      } else {
        setError(result.error || "ההרשמה נכשלה");
      }
    } catch {
      setError("אירעה שגיאה");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Lines - הרשמה</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="שם" required>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="השם שלך"
                required
                disabled={isLoading}
              />
            </FormField>

            <FormField label="אימייל" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isLoading}
              />
            </FormField>

            <FormField label="סיסמה" required>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                minLength={6}
              />
            </FormField>

            {error && (
              <div className="p-3 bg-destructive/20 border border-destructive rounded text-sm text-destructive-foreground">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? "נרשם..." : "הירשם"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            כבר יש לך חשבון?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              התחבר
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
