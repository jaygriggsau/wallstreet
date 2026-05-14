import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/market");
  return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <h1 className="text-4xl font-bold mb-3">Wallstreet</h1>
      <p className="text-muted mb-8">
        A browser stock-trading game. Start with $10,000. Trade simulated equities. Climb the leaderboard.
      </p>
      <Link
        href="/login"
        className="inline-block px-5 py-2 bg-accent text-black font-semibold rounded"
      >
        Play
      </Link>
    </div>
  );
}
