import Link from "next/link";
import { signup } from "@/app/auth/actions";
import { SubmitButton } from "@/components/SubmitButton";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-4">
      <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-8 shadow-sm border border-stone-200/60 dark:border-stone-800">
        <h1 className="text-2xl font-bold tracking-tight text-center mb-6 text-stone-900 dark:text-stone-50">
          Create an account
        </h1>
        
        {resolvedParams?.message && (
          <p className="p-3 mb-4 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm text-center rounded-xl">
            {resolvedParams.message}
          </p>
        )}

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
