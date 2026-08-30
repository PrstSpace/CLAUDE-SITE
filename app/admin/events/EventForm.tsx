"use client";

import { useActionState } from "react";
import type { EventFormState } from "./form-state";

type EventFormAction = (
  prevState: EventFormState,
  formData: FormData
) => Promise<EventFormState>;

export default function EventForm({
  action,
  initialState,
  submitLabel,
  defaultValues,
}: {
  action: EventFormAction;
  initialState: EventFormState;
  submitLabel: string;
  defaultValues?: {
    title?: string;
    slug?: string;
    description?: string;
    location?: string;
    startsAt?: string;
    endsAt?: string;
    isActive?: boolean;
  };
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <TextField
        label="Название"
        name="title"
        defaultValue={defaultValues?.title}
        error={state.fieldErrors?.title}
        required
      />
      <TextField
        label="Slug (используется в ссылке /events/slug)"
        name="slug"
        defaultValue={defaultValues?.slug}
        error={state.fieldErrors?.slug}
        required
      />
      <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
        Описание
        <textarea
          name="description"
          rows={4}
          defaultValue={defaultValues?.description}
          className="rounded-md border border-neutral-300 px-3 py-2 text-base font-normal text-neutral-900 outline-none focus:border-neutral-900"
        />
      </label>
      <TextField
        label="Место проведения"
        name="location"
        defaultValue={defaultValues?.location}
        error={state.fieldErrors?.location}
      />
      <TextField
        label="Дата и время начала (МСК)"
        name="startsAt"
        type="datetime-local"
        defaultValue={defaultValues?.startsAt}
        error={state.fieldErrors?.startsAt}
        required
      />
      <TextField
        label="Дата и время окончания (МСК, необязательно)"
        name="endsAt"
        type="datetime-local"
        defaultValue={defaultValues?.endsAt}
        error={state.fieldErrors?.endsAt}
      />

      <label className="flex items-center gap-2 text-sm font-medium text-neutral-800">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={defaultValues?.isActive ?? true}
        />
        Регистрация открыта
      </label>

      {state.status === "error" && state.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-md bg-neutral-900 px-4 py-2.5 font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Сохранение..." : submitLabel}
      </button>
    </form>
  );
}

function TextField({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-neutral-800">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="rounded-md border border-neutral-300 px-3 py-2 text-base font-normal text-neutral-900 outline-none focus:border-neutral-900"
      />
      {error && <span className="text-sm font-normal text-red-600">{error}</span>}
    </label>
  );
}
