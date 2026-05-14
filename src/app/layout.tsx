import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { db, s } from "@/db";
import { eq } from "drizzle-orm";
import { dollars } from "@/lib/format";

export const metadata: Metadata = {
  title: "Wallstreet",
  description: "A browser stock-trading game",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const user = userId
    ? (await db.select().from(s.users).where(eq(s.users.id, userId))).at(0)
    : null;

  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-white/10 bg-panel">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="font-bold text-accent">WALLSTREET</Link>
              <nav className="flex gap-4 text-sm text-muted">
                <Link href="/market" className="hover:text-ink">Market</Link>
                <Link href="/portfolio" className="hover:text-ink">Portfolio</Link>
                <Link href="/leaderboard" className="hover:text-ink">Leaderboard</Link>
              </nav>
            </div>
            <div className="text-sm flex items-center gap-4">
              {user ? (
                <>
                  <span className="text-muted">{user.name ?? user.email}</span>
                  <span className="font-mono text-up">{dollars(user.cashCents)}</span>
                  <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
                    <button className="text-muted hover:text-ink">Sign out</button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="text-ink">Sign in</Link>
              )}
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
