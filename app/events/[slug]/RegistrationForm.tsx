"use client";

import { useActionState } from "react";
import { registerForEvent } from "./actions";
import { initialRegisterState } from "./form-state";

export default function RegistrationForm({ eventId }: { eventId: string }) {
  const [state, formAction, pending] = useActionState(
    registerForEvent.bind(null, eventId),
    initialRegisterState
  );

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-green-600/30 bg-green-50 p-6 text-green-900">
        <p className="font-medium">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field
        label="ФИО"
        name="fullName"
        autoComplete="name"
        error={state.fieldErrors?.fullName}
      />
      <Field
        label="Телефон"
        name="phone"
        type="tel"
        autoComplete="tel"
        error={state.fieldErrors?.phone}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        error={state.fieldErrors?.email}
      />
      <Field
        label="Компания"
        name="company"
        autoComplete="organization"
        error={state.fieldErrors?.company}
      />
      <Field
        label="Должность"
        name="position"
        autoComplete="organization-title"
        error={state.fieldErrors?.position}
      />

      <label className="flex items-start gap-2 text-sm text-neutral-700">
        <input type="checkbox" name="consentGiven" className="mt-1" required />
        <span>
          Даю согласие на обработку персональных данных в соответствии с{" "}
          <a href="/privacy" target="_blank" className="underline underline-offset-2">
            Политикой обработки персональных данных
          </a>
          .
        </span>
      </label>
      {state.fieldErrors?.consentGiven && (
        <p className="text-sm text-red-600">{state.fieldErrors.consentGiven}</p>
      )}

      {state.status === "error" && state.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-neutral-900 px-4 py-2.5 font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Отправка..." : "Зарегистрироваться"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="rounded-md border border-neutral-300 px-3 py-2 text-base font-normal text-neutral-900 outline-none focus:border-neutral-900"
      />
      {error && <span className="text-sm font-normal text-red-600">{error}</span>}
    </label>
  );
}
