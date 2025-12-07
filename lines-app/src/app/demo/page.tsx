import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { auth } from "@/core/auth/auth";
import { DemoGuideWrapper } from "./components/DemoGuideWrapper";

export default async function DemoPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={isAuthenticated} />
      <main className="flex-1">
        <DemoGuideWrapper />
      </main>
      <Footer />
    </div>
  );
}
