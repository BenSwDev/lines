"use client";

import { useState } from "react";
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
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { requestPasswordReset } from "@/modules/auth/actions/resetPassword";
import { useToast } from "@/hooks/use-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await requestPasswordReset({ email });

      if (result.success) {
        setIsSuccess(true);
        toast({
          title: "בקשת איפוס סיסמה נשלחה",
          description:
            "אם האימייל קיים במערכת, קישור לאיפוס סיסמה נשלח. (בפיתוח: זהו מצב מדומה)"
        });
      } else {
        toast({
          title: "שגיאה",
          description: result.error || "נכשל בשליחת בקשת איפוס סיסמה",
          variant: "destructive"
        });
      }
    } catch {
      toast({
        title: "שגיאה",
        description: "נכשל בשליחת בקשת איפוס סיסמה",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        </div>

        <div className="w-full max-w-md space-y-6">
          <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

            <CardHeader className="relative z-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">בקשה נשלחה</CardTitle>
              <CardDescription className="text-base">
                אם האימייל קיים במערכת, קישור לאיפוס סיסמה נשלח לאימייל שלך.
              </CardDescription>
            </CardHeader>

            <CardFooter className="flex-col gap-4">
              <Button onClick={() => router.push("/auth/login")} className="w-full" size="lg">
                חזרה להתחברות
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-6">
        <Card className="relative overflow-hidden border-2 border-border/50 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <Mail className="h-5 w-5 text-primary-foreground" />
              </div>
              איפוס סיסמה
            </CardTitle>
            <CardDescription className="text-base">
              הזן את האימייל שלך ונשלח לך קישור לאיפוס הסיסמה
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
            </CardContent>

            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                {isLoading ? "שולח..." : "שלח קישור לאיפוס"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                זכרת את הסיסמה?{" "}
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

