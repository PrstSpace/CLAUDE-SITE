"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { initialLoginState } from "./form-state";

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(
    loginAction.bind(null, redirectTo),
    initialLoginState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="rounded-md border border-neutral-300 px-3 py-2 text-base font-normal text-neutral-900 outline-none focus:border-neutral-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Пароль
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-md border border-neutral-300 px-3 py-2 text-base font-normal text-neutral-900 outline-none focus:border-neutral-900"
        />
      </label>

      {state.status === "error" && state.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-neutral-900 px-4 py-2.5 font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Вход..." : "Войти"}
      </button>
    </form>
  );
}
