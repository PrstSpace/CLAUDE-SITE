import { requireAdminSession } from "@/lib/auth";
import EventForm from "../EventForm";
import { initialEventFormState } from "../form-state";
import { createEventAction } from "./actions";

export default async function NewEventPage() {
  await requireAdminSession();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-neutral-900">Новое мероприятие</h1>
      <EventForm
        action={createEventAction}
        initialState={initialEventFormState}
        submitLabel="Создать мероприятие"
      />
    </div>
  );
}
