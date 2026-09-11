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
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-neutral-950 bg-white p-8 text-center shadow-2xl">
        <Wordmark variant="light" size="md" />
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
        placeholder="+7 999 123-45-67"
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

      <label className="flex items-start gap-2 text-sm text-neutral-300">
        <input type="checkbox" name="consentGiven" className="mt-1 accent-white" required />
        <span>
          Даю согласие на обработку персональных данных в соответствии с{" "}
          <a href="/privacy" target="_blank" className="underline underline-offset-2">
            Политикой обработки персональных данных
          </a>
          .
        </span>
      </label>
      {state.fieldErrors?.consentGiven && (
        <p className="text-sm font-medium text-white">{state.fieldErrors.consentGiven}</p>
      )}

      <label className="flex items-start gap-2 text-sm text-neutral-300">
        <input type="checkbox" name="marketingConsent" className="mt-1 accent-white" />
        <span>
          Согласен(на) получать от ООО «ПРСТ ОПЕРЕЙШН» рекламную и
          информационную рассылку о мероприятиях и новых продуктах.
        </span>
      </label>

      {state.status === "error" && state.message && (
        <p className="text-sm font-medium text-white">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-white px-4 py-3 font-medium text-neutral-950 transition hover:bg-neutral-200 disabled:opacity-50"
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
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-white">
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        className="rounded-md border border-white/30 bg-black/30 px-3 py-2.5 text-base font-normal text-white outline-none backdrop-blur-sm transition placeholder:text-neutral-400 focus:border-white"
      />
      {error && <span className="text-sm font-normal text-neutral-300">{error}</span>}
    </label>
  );
}
