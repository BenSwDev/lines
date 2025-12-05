import { auth } from "@/core/auth/auth";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Footer } from "@/components/landing/Footer";

export default async function LandingPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={isAuthenticated} />
      <main className="flex-1 pt-16">
        <Hero isAuthenticated={isAuthenticated} />
      </main>
      <Footer />
    </div>
  );
}
