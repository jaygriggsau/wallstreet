import { signIn } from "@/auth";
import { redirect } from "next/navigation";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="max-w-sm mx-auto py-16">
      <h1 className="text-2xl font-bold mb-2">Sign in</h1>
      <p className="text-muted text-sm mb-6">
        New email? An account is created automatically.
      </p>
      <form
        action={async (formData: FormData) => {
          "use server";
          try {
            await signIn("credentials", {
              email: formData.get("email"),
              password: formData.get("password"),
              redirectTo: "/market",
            });
          } catch (e) {
            if ((e as Error).message?.includes("NEXT_REDIRECT")) throw e;
            redirect("/login?error=1");
          }
        }}
        className="space-y-3"
      >
        <input
          name="email"
          type="email"
          placeholder="email"
          required
          className="w-full bg-panel border border-white/10 rounded px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="password"
          required
          className="w-full bg-panel border border-white/10 rounded px-3 py-2"
        />
        <button className="w-full bg-accent text-black font-semibold rounded py-2">
          Sign in / Register
        </button>
      </form>
    </div>
  );
}
