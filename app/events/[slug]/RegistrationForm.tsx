"use client";

import { useActionState } from "react";
import { registerForEvent } from "./actions";
import { initialRegisterState } from "./form-state";
import { Wordmark } from "@/app/_components/Wordmark";

export default function RegistrationForm({
  eventId,
  eventTitle,
}: {
  eventId: string;
  eventTitle: string;
}) {
  const [state, formAction, pending] = useActionState(
    registerForEvent.bind(null, eventId),
    initialRegisterState
  );

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-neutral-950 bg-white p-8 text-center">
        <Wordmark variant="light" size="sm" />
        <div className="h-px w-full bg-neutral-200" />
        <p className="text-neutral-800">{state.message}</p>
        {state.qrDataUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.qrDataUrl}
              alt="QR-билет"
              width={220}
              height={220}
              className="rounded-lg border border-neutral-200 p-3"
            />
            <p className="max-w-xs text-xs text-neutral-500">
              Предъявите этот QR-код на входе — его отсканирует сотрудник стенда.
            </p>
          </>
        )}
        <div className="mt-2 text-xs font-medium uppercase tracking-widest text-neutral-400">
          {eventTitle}
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
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

      <label className="flex items-start gap-2 text-sm text-neutral-600">
        <input type="checkbox" name="consentGiven" className="mt-1 accent-neutral-950" required />
        <span>
          Даю согласие на обработку персональных данных в соответствии с{" "}
          <a href="/privacy" target="_blank" className="underline underline-offset-2">
            Политикой обработки персональных данных
          </a>
          .
        </span>
      </label>
      {state.fieldErrors?.consentGiven && (
        <p className="text-sm text-neutral-900">{state.fieldErrors.consentGiven}</p>
      )}

      {state.status === "error" && state.message && (
        <p className="text-sm text-neutral-900">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-neutral-950 px-4 py-3 font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
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
    <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-900">
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className="rounded-md border border-neutral-300 px-3 py-2.5 text-base font-normal text-neutral-900 outline-none transition focus:border-neutral-950"
      />
      {error && <span className="text-sm font-normal text-neutral-600">{error}</span>}
    </label>
  );
}
