import Link from "next/link";
import { redirect } from "next/navigation";
import { signup } from "@/app/auth/actions";
import { createClient } from "@/utils/supabase/server";
import { SubmitButton } from "@/components/SubmitButton";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return redirect("/");
  }

  const resolvedParams = await searchParams;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-4 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-stone-200/50 dark:bg-stone-800/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-stone-200/50 dark:bg-stone-800/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[420px] bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl shadow-black/[0.03] border border-stone-200/60 dark:border-stone-800/60 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-stone-900 dark:bg-stone-100 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-black/10">
            <span className="text-stone-50 dark:text-stone-900 font-bold text-xl">X</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            NotesX
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1 font-medium">Create your minimal writing workspace</p>
        </div>
        
        {resolvedParams?.message && (
          <p className="p-3 mb-4 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm text-center rounded-xl">
            {resolvedParams.message}
          </p>
        )}

        <GoogleAuthButton label="Sign up with Google" />

        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
          <span className="text-xs text-stone-400 font-medium">OR</span>
          <div className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
        </div>

        <form className="flex flex-col gap-4" action={signup}>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300" htmlFor="email">
              Email
            </label>
            <input
              className="px-4 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 transition-all text-sm"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300" htmlFor="password">
              Password
            </label>
            <input
              className="px-4 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 transition-all text-sm"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          <SubmitButton>Sign Up</SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/login" className="text-stone-900 dark:text-stone-100 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
