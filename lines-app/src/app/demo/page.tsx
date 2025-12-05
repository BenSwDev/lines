import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { auth } from "@/core/auth/auth";

export default async function DemoPage() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={isAuthenticated} />
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-6 py-20">
          <h1 className="mb-8 text-4xl font-bold">הדמיה - Lines App</h1>

          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-8">
            <h2 className="mb-4 text-2xl font-semibold">🎭 ברוכים הבאים להדמיה!</h2>
            <p className="mb-6 text-gray-300">
              כאן תוכלו לראות את היכולות המלאות של המערכת ללא צורך בהרשמה.
            </p>

            <div className="space-y-4 text-gray-400">
              <p>
                <strong className="text-white">שלב 1:</strong> צרו Venue חדש (מקום עסקי)
              </p>
              <p>
                <strong className="text-white">שלב 2:</strong> הוסיפו ליינים - אירועים חוזרים
              </p>
              <p>
                <strong className="text-white">שלב 3:</strong> צפו בלוח השנה האינטראקטיבי
              </p>
              <p>
                <strong className="text-white">שלב 4:</strong> נהלו מקומות, אזורים ותפריטים
              </p>
            </div>

            <div className="mt-8 rounded-lg bg-blue-500/10 p-6 text-center">
              <p className="text-lg font-semibold text-blue-400">💡 ההדמיה תהיה זמינה בקרוב!</p>
              <p className="mt-2 text-sm text-gray-400">
                בינתיים, הירשמו למערכת וצרו את הVenue הראשון שלכם.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
