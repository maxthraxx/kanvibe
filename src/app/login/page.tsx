"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prevState: { error: string } | null, formData: FormData) => {
      const result = await loginAction(formData);
      return result ?? null;
    },
    null
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm p-8 bg-gray-900 rounded-lg border border-gray-800">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">KanVibe</h1>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm text-gray-400 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-400 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {state?.error && (
            <p className="text-red-400 text-sm">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded font-medium transition-colors"
          >
            {isPending ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
